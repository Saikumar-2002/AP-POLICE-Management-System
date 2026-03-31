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

router.post('/excel', authenticate, requireAdmin, upload.single('file'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (data.length === 0) {
      return res.status(400).json({ success: false, message: 'Excel file is empty' });
    }

    let successCount = 0;
    const errors = [];

    // Begin single transaction
    const insertMany = db.transaction((rows) => {
      // Pass 1: Insert all nodes, handling unit_code uniqueness
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // required fields mapping logic
        const code = String(row.unitCode || row.unit_code || '').trim();
        const name = String(row.name || '').trim();
        const type = String(row.unitType || row.unit_type || '').trim().toLowerCase();
        const ministry = row.ministry ? String(row.ministry).trim() : null;
        const department = row.department ? String(row.department).trim() : null;
        const legacyRef = row.legacyReference || row.legacy_reference ? String(row.legacyReference || row.legacy_reference).trim() : null;
        const isVirtual = row.isVirtual || row.is_virtual ? 1 : 0;
        
        if (!code || !name || !type) {
           errors.push(`Row ${i + 2}: Missing required fields (unitCode, name, or unitType)`);
           continue;
        }

        try {
            // Upsert basic info
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

      // Pass 2: Update parent references after all units exist
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const code = String(row.unitCode || row.unit_code || '').trim();
        const parentCode = row.parentUnitCode || row.parent_unit_code ? String(row.parentUnitCode || row.parent_unit_code).trim() : null;
        
        if (code && parentCode) {
           try {
               const parentNode = db.prepare('SELECT id FROM police_units WHERE unit_code = ?').get(parentCode);
               if (parentNode) {
                   db.prepare('UPDATE police_units SET parent_id = ? WHERE unit_code = ?').run(parentNode.id, code);
               } else {
                   errors.push(`Row ${i + 2} (${code}): Parent unit code '${parentCode}' not found in file or DB`);
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

export default router;
