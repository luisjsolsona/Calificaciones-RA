const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('../db');
const SECRET  = process.env.JWT_SECRET || 'cuaderno_secret_2024';

router.post('/login', (req, res) => {
  const { login, password } = req.body;
  const user = db.prepare('SELECT * FROM usuarios WHERE email=? OR usuario=?').get(login, login);
  if (!user || !bcrypt.compareSync(password, user.password_hash))
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  const payload = { id: user.id, email: user.email, nombre: user.nombre,
                    rol: user.rol, alumnoNombre: user.alumno_nombre };
  const token = jwt.sign(payload, SECRET, { expiresIn: '30d' });
  res.json({ token, user: payload });
});

router.get('/me', require('../middleware/auth')(), (req, res) => res.json(req.user));

module.exports = router;
