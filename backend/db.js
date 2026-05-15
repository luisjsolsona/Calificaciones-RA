const Database = require('better-sqlite3');
const bcrypt   = require('bcryptjs');

const db = new Database(process.env.DB_PATH || '/data/calificaciones.db');
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    email         TEXT    UNIQUE NOT NULL,
    usuario       TEXT    UNIQUE,
    password_hash TEXT    NOT NULL,
    nombre        TEXT    NOT NULL,
    rol           TEXT    NOT NULL CHECK(rol IN ('admin','docente','alumno')),
    alumno_nombre TEXT,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS cuadernos (
    id          TEXT    PRIMARY KEY,
    docente_id  INTEGER NOT NULL REFERENCES usuarios(id),
    titulo      TEXT    NOT NULL,
    descripcion TEXT    DEFAULT '',
    modulo      TEXT    DEFAULT '',
    curso       TEXT    DEFAULT '',
    color       TEXT    DEFAULT '#4f46e5',
    datos       TEXT    NOT NULL DEFAULT '{}',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS inscripciones (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    alumno_id   INTEGER NOT NULL REFERENCES usuarios(id),
    cuaderno_id TEXT    NOT NULL REFERENCES cuadernos(id),
    UNIQUE(alumno_id, cuaderno_id)
  );
`);

// Seed admin por defecto
if (!db.prepare('SELECT id FROM usuarios WHERE email=?').get('admin@centro.es')) {
  db.prepare('INSERT INTO usuarios(email,usuario,password_hash,nombre,rol) VALUES(?,?,?,?,?)')
    .run('admin@centro.es', 'admin', bcrypt.hashSync('admin1234', 10), 'Administrador', 'admin');
  console.log('Admin creado: admin / admin1234');
}

// Ciclos y grupos
db.exec(`
  CREATE TABLE IF NOT EXISTS ciclos (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre  TEXT NOT NULL,
    codigo  TEXT UNIQUE NOT NULL
  );
  CREATE TABLE IF NOT EXISTS grupos (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    ciclo_id  INTEGER REFERENCES ciclos(id) ON DELETE CASCADE,
    nombre    TEXT NOT NULL,
    UNIQUE(ciclo_id, nombre)
  );
`);

// Añadir grupo_id y ciclo_id a usuarios si no existen
try { db.exec('ALTER TABLE usuarios ADD COLUMN grupo_id INTEGER REFERENCES grupos(id)'); } catch(_) {}
try { db.exec('ALTER TABLE usuarios ADD COLUMN ciclo_id INTEGER REFERENCES ciclos(id)'); } catch(_) {}

// Docentes adicionales por cuaderno
db.exec(`
  CREATE TABLE IF NOT EXISTS cuaderno_docentes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    cuaderno_id TEXT    NOT NULL REFERENCES cuadernos(id) ON DELETE CASCADE,
    docente_id  INTEGER NOT NULL REFERENCES usuarios(id)  ON DELETE CASCADE,
    UNIQUE(cuaderno_id, docente_id)
  );
`);

module.exports = db;

