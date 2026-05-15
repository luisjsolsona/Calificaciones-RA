const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db     = require('../db');
const auth   = require('../middleware/auth');

// GET /api/usuarios
router.get('/', auth(['admin', 'docente']), (req, res) => {
  const { rol } = req.query;
  const rows = rol
    ? db.prepare('SELECT u.id,u.email,u.usuario,u.nombre,u.rol,u.alumno_nombre,u.grupo_id,g.nombre as grupo_nombre,u.created_at FROM usuarios u LEFT JOIN grupos g ON u.grupo_id=g.id WHERE u.rol=? ORDER BY u.nombre').all(rol)
    : db.prepare('SELECT u.id,u.email,u.usuario,u.nombre,u.rol,u.alumno_nombre,u.grupo_id,g.nombre as grupo_nombre,u.created_at FROM usuarios u LEFT JOIN grupos g ON u.grupo_id=g.id ORDER BY u.nombre').all();
  res.json(rows);
});

// POST /api/usuarios
router.post('/', auth(['admin']), (req, res) => {
  const { email, usuario, nombre, password, rol, alumno_nombre } = req.body;
  if (!['admin', 'docente', 'alumno'].includes(rol))
    return res.status(400).json({ error: 'Rol inválido' });
  try {
    const hash = bcrypt.hashSync(password || 'cambiar1234', 10);
    const r = db.prepare(
      'INSERT INTO usuarios(email,usuario,password_hash,nombre,rol,alumno_nombre) VALUES(?,?,?,?,?,?)'
    ).run(email, usuario || null, hash, nombre, rol, alumno_nombre || null);
    res.json({ id: r.lastInsertRowid, email, usuario, nombre, rol, alumno_nombre });
  } catch (e) { res.status(409).json({ error: 'Email o usuario ya existe' }); }
});

// PUT /api/usuarios/:id
router.put('/:id', auth(['admin']), (req, res) => {
  const { nombre, email, usuario, rol, alumno_nombre, grupo_id } = req.body;
  db.prepare('UPDATE usuarios SET nombre=?,email=?,usuario=?,rol=?,alumno_nombre=?,grupo_id=? WHERE id=?')
    .run(nombre, email, usuario || null, rol, alumno_nombre || null, grupo_id || null, req.params.id);
  res.json({ ok: true });
});

// PUT /api/usuarios/:id/password
router.put('/:id/password', auth(), (req, res) => {
  const targetId = parseInt(req.params.id);
  if (req.user.id !== targetId && req.user.rol !== 'admin')
    return res.status(403).json({ error: 'Sin permiso' });
  db.prepare('UPDATE usuarios SET password_hash=? WHERE id=?')
    .run(bcrypt.hashSync(req.body.password, 10), targetId);
  res.json({ ok: true });
});

// DELETE /api/usuarios/:id
router.delete('/:id', auth(['admin']), (req, res) => {
  if (parseInt(req.params.id) === req.user.id)
    return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
  db.prepare('DELETE FROM inscripciones WHERE alumno_id=?').run(req.params.id);
  db.prepare('DELETE FROM cuadernos WHERE docente_id=?').run(req.params.id);
  db.prepare('DELETE FROM usuarios WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
