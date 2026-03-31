import express from 'express';
import dbConfig from '../config/database.js';
import { authenticate, requireManager } from '../middleware/auth.js';

const router = express.Router();
const db = dbConfig.db;

// Define logical hierarchy priority
const UNIT_PRIORITY = {
  'ministry': 1,    // DGP
  'zone': 2,        // Zone
  'range': 3,       // Range
  'district': 4,    // District
  'division': 5,    // SDPO
  'circle': 6,      // Circle
  'station': 7,     // PS
  'other': 8
};

// Build hierarchical tree
const buildTree = (flatUnits) => {
  const map = new Map();
  const roots = [];

  // Create a code-to-node map for easy lookup
  // and transform data to requested format
  flatUnits.forEach(unit => {
    map.set(unit.unit_code, {
      name: unit.name,
      unitCode: unit.unit_code,
      unitType: unit.unit_type,
      parentUnitCode: null, // Will be set in next pass
      id: unit.id, // Keep ID for internal reference if needed
      children: []
    });
  });

  // Assign children to parents and set parentUnitCode
  flatUnits.forEach(unit => {
    const node = map.get(unit.unit_code);
    
    // Find parent unit code if parent_id exists
    let parentCode = null;
    if (unit.parent_id) {
       const parentUnit = flatUnits.find(u => u.id === unit.parent_id);
       if (parentUnit) parentCode = parentUnit.unit_code;
    }
    
    node.parentUnitCode = parentCode;

    if (parentCode && map.has(parentCode)) {
      map.get(parentCode).children.push(node);
    } else {
      // If no parent or parent not found in the set, it's a root (e.g. DGP)
      roots.push(node);
    }
  });

  // Recursive sort function
  const sortHierarchy = (nodes) => {
    nodes.sort((a, b) => {
      const prioA = UNIT_PRIORITY[a.unitType] || 99;
      const prioB = UNIT_PRIORITY[b.unitType] || 99;
      
      if (prioA !== prioB) return prioA - prioB;
      return a.name.localeCompare(b.name);
    });
    
    nodes.forEach(node => {
      if (node.children.length > 0) {
        sortHierarchy(node.children);
      }
    });
  };

  sortHierarchy(roots);
  return roots;
};

// GET all units (flat list)
router.get('/', authenticate, (req, res, next) => {
  try {
    const units = db.prepare('SELECT * FROM police_units ORDER BY name ASC').all();
    res.json(units);
  } catch (err) {
    next(err);
  }
});

// GET full hierarchy tree
router.get('/tree', authenticate, (req, res, next) => {
  try {
    const units = db.prepare('SELECT * FROM police_units ORDER BY name ASC').all();
    const tree = buildTree(units);

    // Compute stats
    const stats = {
      total: units.length,
      zones: units.filter(u => u.unit_type === 'zone').length,
      ranges: units.filter(u => u.unit_type === 'range').length,
      districts: units.filter(u => u.unit_type === 'district').length,
      divisions: units.filter(u => u.unit_type === 'division').length,
      circles: units.filter(u => u.unit_type === 'circle').length,
      stations: units.filter(u => u.unit_type === 'station').length,
    };

    res.json({ tree, stats, success: true });
  } catch (err) {
    next(err);
  }
});

// GET single unit
router.get('/:id', authenticate, (req, res, next) => {
  try {
    const unit = db.prepare('SELECT * FROM police_units WHERE id = ?').get(req.params.id);
    if (!unit) return res.status(404).json({ message: 'Unit not found' });
    res.json(unit);
  } catch (err) {
    next(err);
  }
});

// CREATE unit
router.post('/', authenticate, requireManager, (req, res, next) => {
  try {
    const { unit_code, name, unit_type, parent_id, ministry, department, legacy_reference, is_virtual } = req.body;

    const existingCode = db.prepare('SELECT id FROM police_units WHERE unit_code = ?').get(unit_code);
    if (existingCode) {
      return res.status(400).json({ success: false, message: `Unit code '${unit_code}' already exists.` });
    }

    const info = db.prepare(`
      INSERT INTO police_units (unit_code, name, unit_type, parent_id, ministry, department, legacy_reference, is_virtual)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(unit_code, name, unit_type, parent_id || null, ministry || null, department || null, legacy_reference || null, is_virtual ? 1 : 0);

    const newUnit = db.prepare('SELECT * FROM police_units WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, data: newUnit });
  } catch (err) {
    next(err);
  }
});

// UPDATE unit
router.put('/:id', authenticate, requireManager, (req, res, next) => {
  try {
    const { unit_code, name, unit_type, parent_id, ministry, department, legacy_reference, is_virtual } = req.body;
    const { id } = req.params;

    // Prevent circular reference
    if (parent_id) {
      if (parseInt(id) === parseInt(parent_id)) {
        return res.status(400).json({ success: false, message: 'A unit cannot be its own parent.' });
      }
      
      // Basic circular check (can be improved with recursive CTE in Postgres)
      let curr = parseInt(parent_id);
      let isCircular = false;
      const visited = new Set([parseInt(id)]);
      
      while (curr) {
        if (visited.has(curr)) {
          isCircular = true;
          break;
        }
        visited.add(curr);
        const pNode = db.prepare('SELECT parent_id FROM police_units WHERE id = ?').get(curr);
        curr = pNode ? pNode.parent_id : null;
      }
      
      if (isCircular) {
         return res.status(400).json({ success: false, message: 'Circular reference detected in hierarchy.' });
      }
    }

    const existingCode = db.prepare('SELECT id FROM police_units WHERE unit_code = ? AND id != ?').get(unit_code, id);
    if (existingCode) {
      return res.status(400).json({ success: false, message: `Unit code '${unit_code}' already exists.` });
    }

    db.prepare(`
      UPDATE police_units 
      SET unit_code = ?, name = ?, unit_type = ?, parent_id = ?, ministry = ?, department = ?, legacy_reference = ?, is_virtual = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(unit_code, name, unit_type, parent_id || null, ministry || null, department || null, legacy_reference || null, is_virtual ? 1 : 0, id);

    const updatedUnit = db.prepare('SELECT * FROM police_units WHERE id = ?').get(id);
    res.json({ success: true, data: updatedUnit });
  } catch (err) {
    next(err);
  }
});

// DELETE all units (Admin reset)
router.delete('/all', authenticate, (req, res, next) => {
  try {
    // We check admin role here explicitly or via middleware
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Super Admin access required for global reset.' });
    }

    db.prepare('DELETE FROM police_units').run();
    res.json({ success: true, message: 'All hierarchy data has been cleared.' });
  } catch (err) {
    next(err);
  }
});

export default router;
