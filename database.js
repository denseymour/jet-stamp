const Database = require('better-sqlite3');
const path = require('path');

// Initialize database
const db = new Database(path.join(__dirname, 'certificates.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS certificates (
    id TEXT PRIMARY KEY,
    vet_name TEXT NOT NULL,
    license_number TEXT NOT NULL,
    clinic_name TEXT,
    pet_name TEXT NOT NULL,
    pet_type TEXT NOT NULL,
    vaccine_type TEXT NOT NULL,
    date_administered TEXT NOT NULL,
    next_due_date TEXT,
    created_at TEXT NOT NULL,
    qr_code TEXT
  )
`);

console.log('Database initialized successfully');

module.exports = db;
