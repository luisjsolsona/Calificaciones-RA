const jwt    = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'cuaderno_secret_2024';

module.exports = function requireAuth(roles = []) {
  return (req, res, next) => {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'No autenticado' });
    try {
      const payload = jwt.verify(token, SECRET);
      if (roles.length && !roles.includes(payload.rol))
        return res.status(403).json({ error: 'Sin permiso' });
      req.user = payload;
      next();
    } catch { res.status(401).json({ error: 'Token inválido' }); }
  };
};
