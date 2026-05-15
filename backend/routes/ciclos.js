const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

// GET /api/ciclos  (con sus grupos)
router.get('/', auth(), (req, res) => {
  const ciclos = db.prepare('SELECT * FROM ciclos ORDER BY codigo').all();
  const grupos = db.prepare('SELECT * FROM grupos ORDER BY nombre').all();
  res.json(ciclos.map(c => ({ ...c, grupos: grupos.filter(g => g.ciclo_id === c.id) })));
});

// POST /api/ciclos
router.post('/', auth(['admin']), (req, res) => {
  const { nombre, codigo } = req.body;
  try {
    const r = db.prepare('INSERT INTO ciclos(nombre,codigo) VALUES(?,?)').run(nombre, codigo.toUpperCase());
    res.json({ id: r.lastInsertRowid, nombre, codigo: codigo.toUpperCase(), grupos: [] });
  } catch { res.status(409).json({ error: 'Código ya existe' }); }
});

// DELETE /api/ciclos/:id
router.delete('/:id', auth(['admin']), (req, res) => {
  db.prepare('UPDATE usuarios SET grupo_id=NULL WHERE grupo_id IN (SELECT id FROM grupos WHERE ciclo_id=?)').run(req.params.id);
  db.prepare('DELETE FROM grupos WHERE ciclo_id=?').run(req.params.id);
  db.prepare('DELETE FROM ciclos WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// POST /api/ciclos/:id/grupos
router.post('/:id/grupos', auth(['admin']), (req, res) => {
  const { nombre } = req.body;
  try {
    const r = db.prepare('INSERT INTO grupos(ciclo_id,nombre) VALUES(?,?)').run(req.params.id, nombre);
    res.json({ id: r.lastInsertRowid, ciclo_id: parseInt(req.params.id), nombre });
  } catch { res.status(409).json({ error: 'Grupo ya existe en este ciclo' }); }
});

// DELETE /api/grupos/:id
router.delete('/grupo/:id', auth(['admin']), (req, res) => {
  db.prepare('UPDATE usuarios SET grupo_id=NULL WHERE grupo_id=?').run(req.params.id);
  db.prepare('DELETE FROM grupos WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
