export const APP_KEY = "cuaderno-ra-app-v1";
const OLD_KEY       = "cuaderno-ra-v1";

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,5); }

export const ROLES = {
  admin:   { label:"Admin",   icon:"🛡️", color:"#dc2626" },
  docente: { label:"Docente", icon:"📚", color:"#4f46e5" },
  alumno:  { label:"Alumno",  icon:"🎓", color:"#059669" },
};

export const COLORES = ["#4f46e5","#059669","#dc2626","#d97706","#0891b2","#7c3aed","#db2777","#0f766e"];

function initNotas(alumnos) {
  return Object.fromEntries(alumnos.map(a => [a.id, Math.floor(Math.random()*5)+5]));
}

function cuadernoDemo(id, titulo, descripcion, modulo, curso, color, docenteId) {
  const alumnos = [
    { id:1, nombre:"García López, Ana" },
    { id:2, nombre:"Martínez Ruiz, Carlos" },
    { id:3, nombre:"Sánchez Pérez, Elena" },
  ];
  const ras = [
    { id:"RA1", titulo:"Resultado de Aprendizaje 1", descripcion:"Primer resultado del módulo", peso:null, pctAct:40, pctExam:60 },
    { id:"RA2", titulo:"Resultado de Aprendizaje 2", descripcion:"Segundo resultado del módulo", peso:null, pctAct:40, pctExam:60 },
  ];
  const uds = [
    { id:"UD1", titulo:"Unidad 1", descripcion:"Primera unidad", ras:["RA1"] },
    { id:"UD2", titulo:"Unidad 2", descripcion:"Segunda unidad", ras:["RA2"] },
  ];
  const actividades = [
    { id:"A1", nombre:"Práctica 1", tipo:"actividad", ras:["RA1"], ud:"UD1", peso:50, orden:0, notas:initNotas(alumnos) },
    { id:"A2", nombre:"Examen UD1", tipo:"examen",    ras:["RA1"], ud:"UD1", peso:50, orden:0, notas:initNotas(alumnos) },
    { id:"A3", nombre:"Práctica 2", tipo:"actividad", ras:["RA2"], ud:"UD2", peso:50, orden:0, notas:initNotas(alumnos) },
    { id:"A4", nombre:"Examen UD2", tipo:"examen",    ras:["RA2"], ud:"UD2", peso:50, orden:0, notas:initNotas(alumnos) },
  ];
  return { id, titulo, descripcion, modulo, curso, color, docenteId, data:{ alumnos, ras, uds, actividades } };
}

function defaultStore() {
  const adminId    = uid();
  const doc1Id     = uid();
  const doc2Id     = uid();
  const alum1Id    = uid();
  const alum2Id    = uid();
  const alum3Id    = uid();

  return {
    users: [
      { id:adminId, nombre:"Administrador",       usuario:"admin",    password:"admin", role:"admin" },
      { id:doc1Id,  nombre:"Prof. García",         usuario:"garcia",   password:"1234",  role:"docente" },
      { id:doc2Id,  nombre:"Prof. Martínez",       usuario:"martinez", password:"1234",  role:"docente" },
      { id:alum1Id, nombre:"García López, Ana",    usuario:"ana",      password:"1111",  role:"alumno", alumnoNombre:"García López, Ana" },
      { id:alum2Id, nombre:"Martínez Ruiz, Carlos",usuario:"carlos",   password:"1111",  role:"alumno", alumnoNombre:"Martínez Ruiz, Carlos" },
      { id:alum3Id, nombre:"Sánchez Pérez, Elena", usuario:"elena",    password:"1111",  role:"alumno", alumnoNombre:"Sánchez Pérez, Elena" },
    ],
    cuadernos: [
      cuadernoDemo(uid(), "Calificaciones SOR",    "Sistemas Operativos en Red", "SOR", "1º ASIR", "#4f46e5", doc1Id),
      cuadernoDemo(uid(), "Calificaciones PYTHON",  "Programación en Python",    "PRO", "2º DAM",  "#059669", doc1Id),
      cuadernoDemo(uid(), "Calificaciones REDES",   "Redes Locales",             "RL",  "1º ASIR", "#0891b2", doc2Id),
    ],
    session: null,
  };
}

export function loadStore() {
  try {
    const raw = localStorage.getItem(APP_KEY);
    if (raw) return JSON.parse(raw);

    // Migrar datos del formato anterior si existen
    const old = localStorage.getItem(OLD_KEY);
    if (old) {
      const oldData = JSON.parse(old);
      const store   = defaultStore();
      // Sobreescribe el primer cuaderno del primer docente con los datos viejos
      if (store.cuadernos[0]) store.cuadernos[0].data = oldData;
      return store;
    }
  } catch(_) {}
  return defaultStore();
}

export function saveStore(store) {
  try { localStorage.setItem(APP_KEY, JSON.stringify(store)); } catch(_) {}
}
