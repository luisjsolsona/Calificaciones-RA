const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

const COLS = 'c.id,c.docente_id,c.titulo,c.descripcion,c.modulo,c.curso,c.color,c.created_at,c.updated_at,u.nombre as docente_nombre';

// GET /api/cuadernos
router.get('/', auth(), (req, res) => {
  const { id, rol } = req.user;
  let rows;
  if (rol === 'admin')
    rows = db.prepare(`SELECT ${COLS} FROM cuadernos c JOIN usuarios u ON c.docente_id=u.id ORDER BY c.updated_at DESC`).all();
  else if (rol === 'docente')
    rows = db.prepare(`SELECT ${COLS} FROM cuadernos c JOIN usuarios u ON c.docente_id=u.id WHERE c.docente_id=? ORDER BY c.updated_at DESC`).all(id);
  else
    rows = db.prepare(`SELECT ${COLS} FROM cuadernos c JOIN usuarios u ON c.docente_id=u.id JOIN inscripciones i ON i.cuaderno_id=c.id WHERE i.alumno_id=? ORDER BY c.updated_at DESC`).all(id);
  res.json(rows);
});

// POST /api/cuadernos
router.post('/', auth(['admin', 'docente']), (req, res) => {
  const { titulo, descripcion='', modulo='', curso='', color='#4f46e5', docenteId } = req.body;
  const docente_id = (req.user.rol === 'admin' && docenteId) ? Number(docenteId) : req.user.id;
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  db.prepare('INSERT INTO cuadernos(id,docente_id,titulo,descripcion,modulo,curso,color,datos) VALUES(?,?,?,?,?,?,?,?)')
    .run(id, docente_id, titulo, descripcion, modulo, curso, color, '{}');
  res.json({ id, titulo, descripcion, modulo, curso, color, docente_id });
});

// GET /api/cuadernos/:id  (datos completos)
router.get('/:id', auth(), (req, res) => {
  const c = db.prepare('SELECT * FROM cuadernos WHERE id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'No encontrado' });
  const { id, rol } = req.user;
  if (rol === 'alumno') {
    const ok = db.prepare('SELECT id FROM inscripciones WHERE alumno_id=? AND cuaderno_id=?').get(id, c.id);
    if (!ok) return res.status(403).json({ error: 'Sin acceso' });
  } else if (rol === 'docente' && c.docente_id !== id) {
    return res.status(403).json({ error: 'Sin acceso' });
  }
  const datos = JSON.parse(c.datos || '{}');
  // Alumnos SIEMPRE desde inscripciones, no desde datos.alumnos
  datos.alumnos = db.prepare(
    'SELECT u.id, COALESCE(u.alumno_nombre, u.nombre) as nombre '
    + 'FROM inscripciones i JOIN usuarios u ON i.alumno_id=u.id '
    + 'WHERE i.cuaderno_id=? ORDER BY u.nombre'
  ).all(c.id);
  res.json({ ...c, datos });
});

// PUT /api/cuadernos/:id  (guardar datos del cuaderno)
router.put('/:id', auth(['admin', 'docente']), (req, res) => {
  const c = db.prepare('SELECT * FROM cuadernos WHERE id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'No encontrado' });
  if (req.user.rol === 'docente' && c.docente_id !== req.user.id)
    return res.status(403).json({ error: 'Sin acceso' });
  db.prepare('UPDATE cuadernos SET datos=?,updated_at=CURRENT_TIMESTAMP WHERE id=?')
    .run(JSON.stringify(req.body.datos), req.params.id);
  res.json({ ok: true });
});

// DELETE /api/cuadernos/:id
router.delete('/:id', auth(['admin', 'docente']), (req, res) => {
  const c = db.prepare('SELECT * FROM cuadernos WHERE id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'No encontrado' });
  if (req.user.rol === 'docente' && c.docente_id !== req.user.id)
    return res.status(403).json({ error: 'Sin acceso' });
  db.prepare('DELETE FROM inscripciones WHERE cuaderno_id=?').run(req.params.id);
  db.prepare('DELETE FROM cuadernos WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// GET /api/cuadernos/:id/inscripciones
router.get('/:id/inscripciones', auth(['admin', 'docente']), (req, res) => {
  const rows = db.prepare(
    'SELECT u.id,u.nombre,u.email,u.alumno_nombre FROM inscripciones i JOIN usuarios u ON i.alumno_id=u.id WHERE i.cuaderno_id=?'
  ).all(req.params.id);
  res.json(rows);
});

// POST /api/cuadernos/:id/inscripciones
router.post('/:id/inscripciones', auth(['admin', 'docente']), (req, res) => {
  try {
    db.prepare('INSERT INTO inscripciones(alumno_id,cuaderno_id) VALUES(?,?)').run(req.body.alumno_id, req.params.id);
    res.json({ ok: true });
  } catch { res.status(409).json({ error: 'Alumno ya inscrito' }); }
});

// DELETE /api/cuadernos/:id/inscripciones/:uid
router.delete('/:id/inscripciones/:uid', auth(['admin', 'docente']), (req, res) => {
  db.prepare('DELETE FROM inscripciones WHERE cuaderno_id=? AND alumno_id=?').run(req.params.id, req.params.uid);
  res.json({ ok: true });
});

module.exports = router;
