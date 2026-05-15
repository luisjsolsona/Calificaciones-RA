const express = require('express');
const cors    = require('cors');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

app.use('/api/auth',      require('./routes/auth'));
app.use('/api/cuadernos', require('./routes/cuadernos'));
app.use('/api/usuarios',  require('./routes/usuarios'));
app.use('/api/ciclos',    require('./routes/ciclos'));
app.get('/api/health',    (_, res) => res.json({ ok: true, ts: new Date().toISOString() }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => console.log(`Backend escuchando en :${PORT}`));
