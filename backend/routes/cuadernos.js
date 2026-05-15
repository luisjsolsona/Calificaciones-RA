const router = require('express').Router();
const db     = require('../db');
const auth   = require('../middleware/auth');

const COLS = 'c.id,c.docente_id,c.titulo,c.descripcion,c.modulo,c.curso,c.color,c.created_at,c.updated_at,u.nombre as docente_nombre';

// Comprueba si un docente puede editar un cuaderno
function puedeEditar(cuadernoId, docenteId) {
  const c = db.prepare('SELECT docente_id FROM cuadernos WHERE id=?').get(cuadernoId);
  if (!c) return false;
  if (c.docente_id === docenteId) return true;
  return !!db.prepare('SELECT id FROM cuaderno_docentes WHERE cuaderno_id=? AND docente_id=?').get(cuadernoId, docenteId);
}

// GET /api/cuadernos
router.get('/', auth(), (req, res) => {
  const { id, rol } = req.user;
  let rows;

  if (rol === 'admin') {
    rows = db.prepare(`SELECT ${COLS} FROM cuadernos c JOIN usuarios u ON c.docente_id=u.id ORDER BY c.updated_at DESC`).all()
      .map(c => ({ ...c, puedo_editar: true, es_apoyo: false }));

  } else if (rol === 'docente') {
    // Mi ciclo
    const me = db.prepare('SELECT ciclo_id FROM usuarios WHERE id=?').get(id);
    const miCiclo = me?.ciclo_id || null;

    // Mis cuadernos (titular) + apoyo
    const propios = db.prepare(`
      SELECT ${COLS}, 1 as puedo_editar,
        CASE WHEN c.docente_id=? THEN 0 ELSE 1 END as es_apoyo
      FROM cuadernos c JOIN usuarios u ON c.docente_id=u.id
      WHERE c.docente_id=?
        OR EXISTS(SELECT 1 FROM cuaderno_docentes cd WHERE cd.cuaderno_id=c.id AND cd.docente_id=?)
      ORDER BY c.updated_at DESC
    `).all(id, id, id);

    const propiosIds = new Set(propios.map(c => c.id));

    // Cuadernos del mismo ciclo (solo lectura)
    let ciclo = [];
    if (miCiclo) {
      ciclo = db.prepare(`
        SELECT ${COLS}, 0 as puedo_editar, 0 as es_apoyo
        FROM cuadernos c JOIN usuarios u ON c.docente_id=u.id
        WHERE u.ciclo_id=? AND c.docente_id!=?
        ORDER BY c.updated_at DESC
      `).all(miCiclo, id).filter(c => !propiosIds.has(c.id));
    }

    rows = [...propios, ...ciclo];

  } else {
    // Alumno: cuadernos inscritos
    rows = db.prepare(`
      SELECT ${COLS} FROM cuadernos c
      JOIN usuarios u ON c.docente_id=u.id
      JOIN inscripciones i ON i.cuaderno_id=c.id
      WHERE i.alumno_id=? ORDER BY c.updated_at DESC
    `).all(id).map(c => ({ ...c, puedo_editar: false, es_apoyo: false }));
  }

  res.json(rows);
});

// POST /api/cuadernos
router.post('/', auth(['admin', 'docente']), (req, res) => {
  const { titulo, descripcion='', modulo='', curso='', color='#4f46e5', docenteId } = req.body;
  const docente_id = (req.user.rol === 'admin' && docenteId) ? Number(docenteId) : req.user.id;
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  db.prepare('INSERT INTO cuadernos(id,docente_id,titulo,descripcion,modulo,curso,color,datos) VALUES(?,?,?,?,?,?,?,?)')
    .run(id, docente_id, titulo, descripcion, modulo, curso, color, '{}');
  res.json({ id, titulo, descripcion, modulo, curso, color, docente_id, puedo_editar: true });
});

// GET /api/cuadernos/:id
router.get('/:id', auth(), (req, res) => {
  const c = db.prepare('SELECT * FROM cuadernos WHERE id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'No encontrado' });
  const { id, rol } = req.user;

  let canView = false, canEdit = false;
  if (rol === 'admin') { canView = true; canEdit = true; }
  else if (rol === 'docente') {
    canEdit = puedeEditar(c.id, id);
    if (!canEdit) {
      const me = db.prepare('SELECT ciclo_id FROM usuarios WHERE id=?').get(id);
      const owner = db.prepare('SELECT ciclo_id FROM usuarios WHERE id=?').get(c.docente_id);
      canView = me?.ciclo_id && me.ciclo_id === owner?.ciclo_id;
    } else { canView = true; }
  } else if (rol === 'alumno') {
    canView = !!db.prepare('SELECT id FROM inscripciones WHERE alumno_id=? AND cuaderno_id=?').get(id, c.id);
  }

  if (!canView && !canEdit) return res.status(403).json({ error: 'Sin acceso' });

  const datos = JSON.parse(c.datos || '{}');
  datos.alumnos = db.prepare(
    'SELECT u.id, COALESCE(u.alumno_nombre, u.nombre) as nombre FROM inscripciones i JOIN usuarios u ON i.alumno_id=u.id WHERE i.cuaderno_id=? ORDER BY u.nombre'
  ).all(c.id);

  const docentes = db.prepare(
    'SELECT u.id, u.nombre FROM cuaderno_docentes cd JOIN usuarios u ON cd.docente_id=u.id WHERE cd.cuaderno_id=?'
  ).all(c.id);

  res.json({ ...c, datos, puedo_editar: canEdit, docentes });
});

// PUT /api/cuadernos/:id
router.put('/:id', auth(['admin', 'docente']), (req, res) => {
  const c = db.prepare('SELECT * FROM cuadernos WHERE id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'No encontrado' });
  if (req.user.rol === 'docente' && !puedeEditar(c.id, req.user.id))
    return res.status(403).json({ error: 'Solo lectura' });
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
  db.prepare('DELETE FROM cuaderno_docentes WHERE cuaderno_id=?').run(req.params.id);
  db.prepare('DELETE FROM cuadernos WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

// ── Inscripciones de alumnos ───────────────────────────────────────────────
router.get('/:id/inscripciones', auth(['admin', 'docente']), (req, res) => {
  res.json(db.prepare(
    'SELECT u.id,u.nombre,u.email,u.alumno_nombre,u.grupo_nombre FROM inscripciones i JOIN (SELECT u.*,g.nombre as grupo_nombre FROM usuarios u LEFT JOIN grupos g ON u.grupo_id=g.id) u ON i.alumno_id=u.id WHERE i.cuaderno_id=?'
  ).all(req.params.id));
});

router.post('/:id/inscripciones', auth(['admin', 'docente']), (req, res) => {
  try {
    db.prepare('INSERT INTO inscripciones(alumno_id,cuaderno_id) VALUES(?,?)').run(req.body.alumno_id, req.params.id);
    res.json({ ok: true });
  } catch { res.status(409).json({ error: 'Ya inscrito' }); }
});

router.delete('/:id/inscripciones/:uid', auth(['admin', 'docente']), (req, res) => {
  db.prepare('DELETE FROM inscripciones WHERE cuaderno_id=? AND alumno_id=?').run(req.params.id, req.params.uid);
  res.json({ ok: true });
});

// ── Docentes del cuaderno (apoyo) ──────────────────────────────────────────
router.get('/:id/docentes', auth(['admin', 'docente']), (req, res) => {
  res.json(db.prepare(
    'SELECT u.id,u.nombre,u.email FROM cuaderno_docentes cd JOIN usuarios u ON cd.docente_id=u.id WHERE cd.cuaderno_id=?'
  ).all(req.params.id));
});

router.post('/:id/docentes', auth(['admin', 'docente']), (req, res) => {
  const c = db.prepare('SELECT docente_id FROM cuadernos WHERE id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'No encontrado' });
  if (req.user.rol === 'docente' && c.docente_id !== req.user.id)
    return res.status(403).json({ error: 'Sin acceso' });
  try {
    db.prepare('INSERT INTO cuaderno_docentes(cuaderno_id,docente_id) VALUES(?,?)').run(req.params.id, req.body.docente_id);
    res.json({ ok: true });
  } catch { res.status(409).json({ error: 'Ya asignado' }); }
});

router.delete('/:id/docentes/:uid', auth(['admin', 'docente']), (req, res) => {
  const c = db.prepare('SELECT docente_id FROM cuadernos WHERE id=?').get(req.params.id);
  if (!c) return res.status(404).json({ error: 'No encontrado' });
  if (req.user.rol === 'docente' && c.docente_id !== req.user.id)
    return res.status(403).json({ error: 'Sin acceso' });
  db.prepare('DELETE FROM cuaderno_docentes WHERE cuaderno_id=? AND docente_id=?').run(req.params.id, req.params.uid);
  res.json({ ok: true });
});

module.exports = router;
