import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../../database.sqlite');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Initialize database schema
function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS police_units (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      unit_code TEXT UNIQUE NOT NULL,
      legacy_reference TEXT,
      name TEXT NOT NULL,
      unit_type TEXT NOT NULL CHECK (unit_type IN ('ministry','zone','range','district','division','circle','station','other')),
      parent_id INTEGER,
      ministry TEXT,
      department TEXT,
      is_virtual INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES police_units(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT DEFAULT 'viewer' CHECK (role IN ('admin','manager','viewer')),
      unit_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (unit_id) REFERENCES police_units(id) ON DELETE SET NULL
    );
  `);

  // Create indexes if they don't exist
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_units_parent ON police_units(parent_id);
    CREATE INDEX IF NOT EXISTS idx_units_type ON police_units(unit_type);
    CREATE INDEX IF NOT EXISTS idx_units_code ON police_units(unit_code);
  `);

  seedUsers();
}

function seedUsers() {
  const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
  if (!adminExists) {
    const hash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)').run('admin', hash, 'Admin User', 'admin');
  }

  const managerExists = db.prepare('SELECT id FROM users WHERE username = ?').get('manager');
  if (!managerExists) {
    const hash = bcrypt.hashSync('manager123', 10);
    db.prepare('INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)').run('manager', hash, 'Manager User', 'manager');
  }

  const viewerExists = db.prepare('SELECT id FROM users WHERE username = ?').get('viewer');
  if (!viewerExists) {
    const hash = bcrypt.hashSync('viewer123', 10);
    db.prepare('INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)').run('viewer', hash, 'Viewer User', 'viewer');
  }
}

export default {
  db,
  init,
};
