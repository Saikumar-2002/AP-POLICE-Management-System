import express from 'express';
import multer from 'multer';
import xlsx from 'xlsx';
import path from 'path';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import dbConfig from '../config/database.js';

const router = express.Router();
const db = dbConfig.db;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls' && ext !== '.csv') {
      return cb(new Error('Only Excel and CSV files are allowed'));
    }
    cb(null, true);
  }
});

// Helper to normalize unit types based on common police terminology
const normalizeUnitType = (type) => {
  if (!type) return "";
  const t = String(type).toLowerCase().trim();
  const mappings = {
    "sdpo": "division",
    "ci": "circle",
    "sho": "station",
    "ps": "station",
    "police station": "station",
    "dpo": "district",
    "ig office": "zone",
    "cp office": "zone",
    "dig office": "range",
    "sub-division": "division",
    "division": "division",
    "circle": "circle",
    "district": "district",
    "zone": "zone",
    "range": "range",
    "ministry": "ministry",
    "station": "station"
  };
  
  const normalized = mappings[t] || t;
  const allowedTypes = ["ministry", "zone", "range", "district", "division", "circle", "station", "other"];
  
  return allowedTypes.includes(normalized) ? normalized : "other";
};

// Helper to find value in row by multiple possible keys (case-insensitive & space-insensitive)
const getVal = (row, possibleKeys) => {
  const rowKeys = Object.keys(row);
  for (const pk of possibleKeys) {
    const pkNorm = pk.toLowerCase().replace(/[\s_]/g, "");
    for (const rk of rowKeys) {
      const rkNorm = rk.toLowerCase().replace(/[\s_]/g, "");
      if (rkNorm === pkNorm) return row[rk];
    }
  }
  return null;
};

router.post('/excel', authenticate, requireAdmin, upload.single('file'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    const clearExisting = req.body.clearExisting === 'true' || req.body.clearExisting === true;

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Excel file is empty' });
    }

    let successCount = 0;
    const errors = [];

    // Begin single transaction
    const insertMany = db.transaction((rows) => {
      // Clear existing data if requested
      if (clearExisting) {
        db.prepare('DELETE FROM police_units').run();
      }

      // Pass 1: Insert all nodes
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        const rawCode = getVal(row, ["unitCode", "unit_code", "code"]);
        const code = rawCode ? String(rawCode).trim() : "";
        
        const rawName = getVal(row, ["name", "unitName", "unit_name"]);
        const name = rawName ? String(rawName).trim() : "";
        
        const rawType = getVal(row, ["unitType", "unit_type", "type"]);
        const type = normalizeUnitType(rawType);
        
        const ministry = getVal(row, ["ministry", "dept"]);
        const department = getVal(row, ["department", "dept_name"]);
        const legacyRef = getVal(row, ["legacyReference", "legacy_reference", "legacy"]);
        const isVirtual = getVal(row, ["isVirtual", "is_virtual", "virtual"]) ? 1 : 0;
        
        if (!code || !name || !type) {
           const missing = [];
           if (!code) missing.push("unitCode");
           if (!name) missing.push("name");
           if (!type) missing.push("unitType");
           errors.push(`Row ${i + 2}: Missing required fields (${missing.join(", ")})`);
           continue;
        }

        try {
            db.prepare(`
               INSERT INTO police_units (unit_code, name, unit_type, ministry, department, legacy_reference, is_virtual)
               VALUES (?, ?, ?, ?, ?, ?, ?)
               ON CONFLICT(unit_code) DO UPDATE SET
                 name = excluded.name,
                 unit_type = excluded.unit_type,
                 ministry = excluded.ministry,
                 department = excluded.department,
                 legacy_reference = excluded.legacy_reference,
                 is_virtual = excluded.is_virtual
            `).run(code, name, type, ministry, department, legacyRef, isVirtual);
            successCount++;
        } catch (e) {
             errors.push(`Row ${i + 2} (${code}): ${e.message}`);
        }
      }

      // Pass 2: Update parent references
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const rawCode = getVal(row, ["unitCode", "unit_code", "code"]);
        const code = rawCode ? String(rawCode).trim() : "";
        
        const rawParentCode = getVal(row, ["parentUnitCode", "parent_unit_code", "parent_code", "parent"]);
        const parentCode = rawParentCode ? String(rawParentCode).trim() : null;
        
        if (code && parentCode) {
           try {
               const parentNode = db.prepare('SELECT id FROM police_units WHERE unit_code = ?').get(parentCode);
               if (parentNode) {
                   db.prepare('UPDATE police_units SET parent_id = ? WHERE unit_code = ?').run(parentNode.id, code);
               } else {
                   errors.push(`Row ${i + 2} (${code}): Parent unit code '${parentCode}' not found`);
               }
           } catch(e) {
               errors.push(`Row ${i + 2} (${code}): Failed to set parent - ${e.message}`);
           }
        }
      }
    });

    // Execute transaction
    insertMany(data);

    res.json({
      success: true,
      message: `Processed ${data.length} rows. Imported/Updated: ${successCount}. Errors: ${errors.length}`,
      imported: successCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (err) {
    next(err);
  }
});

// Single image upload for avatars
const imageUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg' && ext !== '.webp') {
      return cb(new Error('Only images are allowed (png, jpg, jpeg, webp)'));
    }
    cb(null, true);
  },
  limits: { fileSize: 2 * 1024 * 1024 } // 2MB limit
});

router.post('/image', authenticate, imageUpload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded' });
  }
  
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, url: imageUrl });
});

export default router;
