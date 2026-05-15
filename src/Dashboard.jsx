import { useState, useEffect } from "react";
import { COLORES } from "./store.js";
import { api } from "./api.js";

const ROLES = {
  admin:   { label:"Admin",   color:"#dc2626" },
  docente: { label:"Docente", color:"#4f46e5" },
  alumno:  { label:"Alumno",  color:"#059669" },
};

function NotebookIcon({ size=28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 50" fill="none" style={{ flexShrink:0 }}>
      <rect x="7" y="1" width="28" height="48" rx="4" fill="#4f46e5"/>
      <rect x="7" y="1" width="8" height="48" rx="4" fill="#3730a3"/>
      <circle cx="11" cy="13" r="3" fill="#4338ca" stroke="#a5b4fc" strokeWidth="1.5"/>
      <circle cx="11" cy="25" r="3" fill="#4338ca" stroke="#a5b4fc" strokeWidth="1.5"/>
      <circle cx="11" cy="37" r="3" fill="#4338ca" stroke="#a5b4fc" strokeWidth="1.5"/>
      <text x="24" y="43" textAnchor="middle" fill="white" fontSize="13" fontWeight="900" fontFamily="sans-serif">RA</text>
    </svg>
  );
}

function RoleBadge({ rol }) {
  const r = ROLES[rol] || ROLES.alumno;
  return (
    <span style={{ fontSize:11, fontWeight:700, color:r.color, background:r.color+"18",
      border:`1px solid ${r.color}44`, borderRadius:99, padding:"2px 8px" }}>
      {r.label}
    </span>
  );
}

// ── Modal gestión de inscripciones ─────────────────────────────────────────
function InscripcionesModal({ cuaderno, onClose }) {
  const [inscritos,    setInscritos]    = useState([]);
  const [todosAlumnos, setTodosAlumnos] = useState([]);
  const [buscar,       setBuscar]       = useState("");
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    Promise.all([
      api.getInscripciones(cuaderno.id),
      api.getUsuarios('alumno'),
    ]).then(([ins, alumnos]) => {
      setInscritos(ins);
      setTodosAlumnos(alumnos);
    }).finally(() => setLoading(false));
  }, [cuaderno.id]);

  const inscritosIds = new Set(inscritos.map(i => i.id));
  const disponibles  = todosAlumnos.filter(a =>
    !inscritosIds.has(a.id) &&
    (!buscar || a.nombre.toLowerCase().includes(buscar.toLowerCase()) ||
      (a.email || '').toLowerCase().includes(buscar.toLowerCase()))
  );

  async function inscribir(alumno) {
    await api.inscribir(cuaderno.id, alumno.id);
    setInscritos(prev => [...prev, alumno]);
  }

  async function desinscribir(alumno) {
    await api.desinscribir(cuaderno.id, alumno.id);
    setInscritos(prev => prev.filter(i => i.id !== alumno.id));
  }

  const IS = { background:"#fff", border:"1px solid #e2e8f0", borderRadius:8,
    padding:"8px 12px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)",
      display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:560,
        maxHeight:"85vh", display:"flex", flexDirection:"column", boxShadow:"0 20px 60px rgba(0,0,0,0.2)" }}>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid #e2e8f0",
          display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ flex:1 }}>
            <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:"#0f172a" }}>
              Inscripciones — {cuaderno.titulo}
            </h2>
            <p style={{ margin:0, fontSize:12, color:"#64748b" }}>{cuaderno.modulo} · {cuaderno.curso}</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"1px solid #e2e8f0",
            borderRadius:8, padding:"6px 12px", cursor:"pointer", color:"#64748b" }}>✕</button>
        </div>

        <div style={{ padding:"16px 24px", flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:16 }}>
          {loading ? <p style={{ color:"#94a3b8", textAlign:"center" }}>Cargando...</p> : <>
            {/* Alumnos inscritos */}
            <div>
              <h3 style={{ margin:"0 0 10px", fontSize:13, fontWeight:700, color:"#475569",
                textTransform:"uppercase", letterSpacing:.5 }}>
                Inscritos ({inscritos.length})
              </h3>
              {inscritos.length === 0
                ? <p style={{ color:"#94a3b8", fontSize:13 }}>Ningún alumno inscrito aún</p>
                : inscritos.map(al => (
                  <div key={al.id} style={{ display:"flex", alignItems:"center", gap:10,
                    padding:"8px 0", borderBottom:"1px solid #f1f5f9" }}>
                    <span style={{ fontSize:18 }}>🎓</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{al.nombre}</div>
                      <div style={{ fontSize:11, color:"#94a3b8" }}>{al.email}</div>
                    </div>
                    <button onClick={() => desinscribir(al)} style={{
                      background:"none", border:"1px solid #fca5a5", borderRadius:6,
                      color:"#dc2626", fontSize:12, padding:"4px 10px", cursor:"pointer" }}>
                      Quitar
                    </button>
                  </div>
                ))
              }
            </div>

            {/* Alumnos disponibles */}
            <div>
              <h3 style={{ margin:"0 0 10px", fontSize:13, fontWeight:700, color:"#475569",
                textTransform:"uppercase", letterSpacing:.5 }}>
                Añadir alumnos
              </h3>
              <input value={buscar} onChange={e => setBuscar(e.target.value)}
                placeholder="Buscar alumno..." style={{ ...IS, marginBottom:10 }}/>
              {disponibles.length === 0
                ? <p style={{ color:"#94a3b8", fontSize:13 }}>
                    {todosAlumnos.length === 0 ? "No hay alumnos creados en el sistema" : "Sin resultados"}
                  </p>
                : disponibles.map(al => (
                  <div key={al.id} style={{ display:"flex", alignItems:"center", gap:10,
                    padding:"8px 0", borderBottom:"1px solid #f1f5f9" }}>
                    <span style={{ fontSize:18 }}>🎓</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:"#0f172a" }}>{al.nombre}</div>
                      <div style={{ fontSize:11, color:"#94a3b8" }}>{al.email}</div>
                    </div>
                    <button onClick={() => inscribir(al)} style={{
                      background:"#4f46e5", border:"none", borderRadius:6,
                      color:"#fff", fontSize:12, padding:"4px 12px", cursor:"pointer" }}>
                      + Inscribir
                    </button>
                  </div>
                ))
              }
            </div>
          </>}
        </div>
      </div>
    </div>
  );
}

// ── Tarjeta de cuaderno ────────────────────────────────────────────────────
function CuadernoCard({ cuaderno, onClick, onDelete, onInscripciones, canManage }) {
  const nAlumnos = cuaderno.data?.alumnos?.length ?? 0;
  const nActs    = cuaderno.data?.actividades?.length ?? 0;
  return (
    <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:14,
      overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column" }}>
      <div style={{ background:cuaderno.color||"#4f46e5", padding:"18px 20px" }}>
        <div style={{ fontSize:28, marginBottom:6 }}>📒</div>
        <h3 style={{ margin:0, color:"#fff", fontSize:16, fontWeight:800 }}>{cuaderno.titulo}</h3>
        {cuaderno.descripcion && (
          <p style={{ margin:"4px 0 0", color:"rgba(255,255,255,0.8)", fontSize:12 }}>{cuaderno.descripcion}</p>
        )}
        <div style={{ display:"flex", gap:6, marginTop:8 }}>
          {cuaderno.modulo && <span style={{ background:"rgba(0,0,0,0.2)", color:"#fff", fontSize:10, fontWeight:700, borderRadius:6, padding:"2px 7px" }}>{cuaderno.modulo}</span>}
          {cuaderno.curso  && <span style={{ background:"rgba(0,0,0,0.2)", color:"#fff", fontSize:10, fontWeight:700, borderRadius:6, padding:"2px 7px" }}>{cuaderno.curso}</span>}
        </div>
      </div>
      <div style={{ padding:"14px 16px", flex:1 }}>
        {cuaderno.docente_nombre && (
          <p style={{ margin:"0 0 8px", fontSize:12, color:"#64748b" }}>👤 {cuaderno.docente_nombre}</p>
        )}
        <div style={{ display:"flex", gap:16, fontSize:12, color:"#64748b" }}>
          <span>👥 {nAlumnos} alumnos</span>
          <span>📝 {nActs} actividades</span>
        </div>
      </div>
      <div style={{ padding:"0 16px 14px", display:"flex", gap:8, flexWrap:"wrap" }}>
        <button onClick={onClick} style={{ flex:1, background:"#4f46e5", color:"#fff",
          border:"none", borderRadius:8, padding:"9px 0", fontSize:13, fontWeight:600, cursor:"pointer" }}>
          Abrir →
        </button>
        {canManage && (
          <>
            <button onClick={onInscripciones} title="Gestionar inscripciones" style={{
              background:"none", border:"1px solid #c7d2fe", borderRadius:8, color:"#4f46e5",
              padding:"9px 11px", fontSize:13, cursor:"pointer" }}>👥</button>
            <button onClick={onDelete} title="Eliminar cuaderno" style={{
              background:"none", border:"1px solid #fca5a5", borderRadius:8, color:"#dc2626",
              padding:"9px 11px", fontSize:12, cursor:"pointer" }}>✕</button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Formulario nuevo cuaderno ──────────────────────────────────────────────
function NuevoCuadernoForm({ docentes, currentUser, onAdd, onCancel }) {
  const [titulo,      setTitulo]      = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [modulo,      setModulo]      = useState("");
  const [curso,       setCurso]       = useState("");
  const [color,       setColor]       = useState(COLORES[0]);
  const [docenteId,   setDocenteId]   = useState(
    currentUser.rol === "docente" ? currentUser.id : (docentes[0]?.id || "")
  );

  const IS = { background:"#fff", border:"1px solid #cbd5e1", borderRadius:8,
    color:"#0f172a", padding:"8px 12px", fontSize:13, outline:"none",
    width:"100%", boxSizing:"border-box" };

  return (
    <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:14,
      padding:20, display:"flex", flexDirection:"column", gap:12 }}>
      <h3 style={{ margin:0, fontSize:14, fontWeight:700 }}>Nuevo cuaderno</h3>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        <div style={{ gridColumn:"1/-1" }}>
          <label style={{ fontSize:12, color:"#64748b", display:"block", marginBottom:4 }}>Título *</label>
          <input value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="Calificaciones SOR" style={IS}/>
        </div>
        <div style={{ gridColumn:"1/-1" }}>
          <label style={{ fontSize:12, color:"#64748b", display:"block", marginBottom:4 }}>Descripción</label>
          <input value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder="Sistemas Operativos en Red" style={IS}/>
        </div>
        <div>
          <label style={{ fontSize:12, color:"#64748b", display:"block", marginBottom:4 }}>Módulo</label>
          <input value={modulo} onChange={e=>setModulo(e.target.value)} placeholder="SOR" style={IS}/>
        </div>
        <div>
          <label style={{ fontSize:12, color:"#64748b", display:"block", marginBottom:4 }}>Curso</label>
          <input value={curso} onChange={e=>setCurso(e.target.value)} placeholder="1º ASIR" style={IS}/>
        </div>
        {currentUser.rol === "admin" && docentes.length > 0 && (
          <div style={{ gridColumn:"1/-1" }}>
            <label style={{ fontSize:12, color:"#64748b", display:"block", marginBottom:4 }}>Docente</label>
            <select value={docenteId} onChange={e=>setDocenteId(e.target.value)} style={IS}>
              {docentes.map(d=><option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
        )}
        <div style={{ gridColumn:"1/-1" }}>
          <label style={{ fontSize:12, color:"#64748b", display:"block", marginBottom:6 }}>Color</label>
          <div style={{ display:"flex", gap:8 }}>
            {COLORES.map(c=>(
              <button key={c} onClick={()=>setColor(c)} style={{
                width:28, height:28, borderRadius:6, background:c, cursor:"pointer", flexShrink:0,
                border:`3px solid ${c===color?"#0f172a":"transparent"}` }}/>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={() => onAdd({ titulo:titulo.trim(), descripcion, modulo, curso, color, docenteId })}
          disabled={!titulo.trim()} style={{
          background:"#4f46e5", color:"#fff", border:"none", borderRadius:8,
          padding:"9px 20px", fontSize:13, fontWeight:600, cursor:"pointer",
          opacity: titulo.trim() ? 1 : 0.5 }}>
          + Crear cuaderno
        </button>
        <button onClick={onCancel} style={{
          background:"none", border:"1px solid #e2e8f0", borderRadius:8,
          padding:"9px 16px", fontSize:13, color:"#64748b", cursor:"pointer" }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Gestión de usuarios ────────────────────────────────────────────────────
function UserManager({ onRefresh }) {
  const [usuarios,  setUsuarios]  = useState([]);
  const [showForm,  setShowForm]  = useState(false);
  const [editUser,  setEditUser]  = useState(null);
  const [form, setForm] = useState({ nombre:"", email:"", usuario:"", password:"", rol:"docente", alumno_nombre:"" });

  useEffect(() => { api.getUsuarios().then(setUsuarios).catch(console.error); }, []);

  const IS = { background:"#fff", border:"1px solid #cbd5e1", borderRadius:8,
    color:"#0f172a", padding:"7px 10px", fontSize:13, outline:"none",
    width:"100%", boxSizing:"border-box" };

  function startAdd()   { setForm({ nombre:"", email:"", usuario:"", password:"", rol:"docente", alumno_nombre:"" }); setEditUser(null); setShowForm(true); }
  function startEdit(u) { setForm({ nombre:u.nombre, email:u.email, usuario:u.usuario||"", password:"", rol:u.rol, alumno_nombre:u.alumno_nombre||"" }); setEditUser(u); setShowForm(true); }

  async function submit() {
    try {
      if (editUser) {
        await api.updateUsuario(editUser.id, form);
        if (form.password) await api.changePassword(editUser.id, form.password);
      } else {
        await api.createUsuario(form);
      }
      const fresh = await api.getUsuarios();
      setUsuarios(fresh);
      setShowForm(false); setEditUser(null);
      if (onRefresh) onRefresh();
    } catch(e) { alert(e.message); }
  }

  async function deleteUser(u) {
    if (!confirm(`¿Eliminar a ${u.nombre}?`)) return;
    await api.deleteUsuario(u.id);
    setUsuarios(prev => prev.filter(x => x.id !== u.id));
    if (onRefresh) onRefresh();
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>👥 Usuarios</h3>
        <button onClick={startAdd} style={{ background:"#4f46e5", color:"#fff", border:"none",
          borderRadius:8, padding:"7px 14px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
          + Nuevo
        </button>
      </div>

      {showForm && (
        <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:12, padding:16,
          display:"flex", flexDirection:"column", gap:10 }}>
          <h4 style={{ margin:0, fontSize:13, fontWeight:700 }}>{editUser ? "Editar usuario" : "Nuevo usuario"}</h4>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <input value={form.nombre}   onChange={e=>setForm(p=>({...p,nombre:e.target.value}))}   placeholder="Nombre completo"    style={IS}/>
            <input value={form.email}    onChange={e=>setForm(p=>({...p,email:e.target.value}))}    placeholder="email@centro.es"     style={IS}/>
            <input value={form.usuario}  onChange={e=>setForm(p=>({...p,usuario:e.target.value}))}  placeholder="usuario (login corto)" style={IS}/>
            <input type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder={editUser ? "Nueva contraseña (dejar vacío = no cambiar)" : "Contraseña"} style={IS}/>
            <select value={form.rol} onChange={e=>setForm(p=>({...p,rol:e.target.value}))} style={IS}>
              <option value="admin">Admin</option>
              <option value="docente">Docente</option>
              <option value="alumno">Alumno</option>
            </select>
            {form.rol === "alumno" && (
              <input value={form.alumno_nombre} onChange={e=>setForm(p=>({...p,alumno_nombre:e.target.value}))}
                placeholder="Nombre en cuaderno (Apellido, Nombre)" style={IS}/>
            )}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={submit} style={{ background:"#4f46e5", color:"#fff", border:"none",
              borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              {editUser ? "Guardar" : "Crear"}
            </button>
            <button onClick={() => { setShowForm(false); setEditUser(null); }} style={{
              background:"none", border:"1px solid #e2e8f0", borderRadius:8,
              padding:"8px 14px", fontSize:13, color:"#64748b", cursor:"pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ borderRadius:10, overflow:"hidden", border:"1px solid #e2e8f0" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#f1f5f9" }}>
              {["Nombre","Email/Usuario","Rol","Nombre en cuaderno",""].map(h=>(
                <th key={h} style={{ padding:"8px 12px", fontSize:11, fontWeight:600,
                  textTransform:"uppercase", letterSpacing:.6, color:"#475569",
                  textAlign:"left", borderBottom:"1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u,i)=>(
              <tr key={u.id} style={{ background:i%2===0?"#fff":"#f8fafc" }}>
                <td style={{ padding:"9px 12px", fontSize:13, fontWeight:500 }}>{u.nombre}</td>
                <td style={{ padding:"9px 12px", fontSize:12, color:"#64748b" }}>
                  {u.email}{u.usuario && <span style={{ color:"#94a3b8" }}> · @{u.usuario}</span>}
                </td>
                <td style={{ padding:"9px 12px" }}><RoleBadge rol={u.rol}/></td>
                <td style={{ padding:"9px 12px", fontSize:12, color:"#64748b" }}>{u.alumno_nombre||"—"}</td>
                <td style={{ padding:"9px 12px", whiteSpace:"nowrap" }}>
                  <button onClick={()=>startEdit(u)} style={{ fontSize:12, color:"#4f46e5", background:"none", border:"none", cursor:"pointer", marginRight:8 }}>✏ Editar</button>
                  <button onClick={()=>deleteUser(u)} style={{ fontSize:12, color:"#dc2626", background:"none", border:"none", cursor:"pointer" }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



// ── Gestión de Ciclos y Grupos ────────────────────────────────────────────
function CiclosManager({ onCiclosChange }) {
  const [ciclos,    setCiclos]    = useState([]);
  const [newCiclo,  setNewCiclo]  = useState({ nombre:'', codigo:'' });
  const [newGrupo,  setNewGrupo]  = useState({});  // { [cicloId]: nombre }

  useEffect(() => { api.getCiclos().then(setCiclos).catch(console.error); }, []);

  const IS = { background:'#fff', border:'1px solid #cbd5e1', borderRadius:8,
    color:'#0f172a', padding:'7px 10px', fontSize:13, outline:'none', boxSizing:'border-box' };

  async function addCiclo() {
    if (!newCiclo.nombre.trim() || !newCiclo.codigo.trim()) return;
    try {
      const c = await api.createCiclo(newCiclo);
      const lista = [...ciclos, c];
      setCiclos(lista);
      setNewCiclo({ nombre:'', codigo:'' });
      if (onCiclosChange) onCiclosChange(lista);
    } catch(e) { alert(e.message); }
  }

  async function delCiclo(id) {
    if (!confirm('Eliminar ciclo y todos sus grupos?')) return;
    await api.deleteCiclo(id);
    const lista = ciclos.filter(c => c.id !== id);
    setCiclos(lista);
    if (onCiclosChange) onCiclosChange(lista);
  }

  async function addGrupo(cicloId) {
    const nombre = (newGrupo[cicloId] || '').trim();
    if (!nombre) return;
    try {
      const g = await api.createGrupo(cicloId, { nombre });
      const lista = ciclos.map(c => c.id === cicloId ? { ...c, grupos: [...c.grupos, g] } : c);
      setCiclos(lista);
      setNewGrupo(prev => ({ ...prev, [cicloId]: '' }));
      if (onCiclosChange) onCiclosChange(lista);
    } catch(e) { alert(e.message); }
  }

  async function delGrupo(cicloId, grupoId) {
    await api.deleteGrupo(grupoId);
    const lista = ciclos.map(c => c.id === cicloId ? { ...c, grupos: c.grupos.filter(g => g.id !== grupoId) } : c);
    setCiclos(lista);
    if (onCiclosChange) onCiclosChange(lista);
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h3 style={{ margin:0, fontSize:15, fontWeight:700 }}>Ciclos y Grupos</h3>
      </div>

      {/* Añadir ciclo */}
      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
        <input value={newCiclo.codigo} onChange={e=>setNewCiclo(p=>({...p,codigo:e.target.value}))}
          placeholder="COD (SMR, IFC...)" style={{ ...IS, width:120 }}/>
        <input value={newCiclo.nombre} onChange={e=>setNewCiclo(p=>({...p,nombre:e.target.value}))}
          onKeyDown={e=>e.key==='Enter'&&addCiclo()}
          placeholder="Nombre del ciclo" style={{ ...IS, flex:1 }}/>
        <button onClick={addCiclo} style={{ background:'#4f46e5', color:'#fff', border:'none',
          borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:600, cursor:'pointer', whiteSpace:'nowrap' }}>
          + Ciclo
        </button>
      </div>

      {ciclos.length === 0
        ? <p style={{ color:'#94a3b8', fontSize:13 }}>No hay ciclos. Crea el primero.</p>
        : ciclos.map(ciclo => (
          <div key={ciclo.id} style={{ border:'1px solid #e2e8f0', borderRadius:10, overflow:'hidden' }}>
            {/* Cabecera ciclo */}
            <div style={{ background:'#f1f5f9', padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ background:'#4f46e5', color:'#fff', borderRadius:6,
                padding:'2px 10px', fontWeight:800, fontSize:13 }}>{ciclo.codigo}</span>
              <span style={{ flex:1, fontWeight:600, fontSize:14, color:'#0f172a' }}>{ciclo.nombre}</span>
              <span style={{ fontSize:12, color:'#94a3b8' }}>{ciclo.grupos.length} grupos</span>
              <button onClick={()=>delCiclo(ciclo.id)} style={{ background:'none', border:'1px solid #fca5a5',
                borderRadius:6, color:'#dc2626', padding:'3px 10px', fontSize:12, cursor:'pointer' }}>✕ Eliminar</button>
            </div>
            {/* Grupos */}
            <div style={{ padding:'10px 14px', display:'flex', flexWrap:'wrap', gap:8, alignItems:'center' }}>
              {ciclo.grupos.map(g => (
                <span key={g.id} style={{ background:'#eef2ff', color:'#4f46e5', border:'1px solid #c7d2fe',
                  borderRadius:20, padding:'4px 12px', fontSize:13, display:'flex', alignItems:'center', gap:6 }}>
                  {g.nombre}
                  <button onClick={()=>delGrupo(ciclo.id,g.id)} style={{ background:'none', border:'none',
                    color:'#94a3b8', cursor:'pointer', padding:0, fontSize:12, lineHeight:1 }}>✕</button>
                </span>
              ))}
              <div style={{ display:'flex', gap:6 }}>
                <input value={newGrupo[ciclo.id]||''} placeholder="Nuevo grupo..."
                  onChange={e=>setNewGrupo(p=>({...p,[ciclo.id]:e.target.value}))}
                  onKeyDown={e=>e.key==='Enter'&&addGrupo(ciclo.id)}
                  style={{ ...IS, width:140, padding:'4px 8px', fontSize:12 }}/>
                <button onClick={()=>addGrupo(ciclo.id)} style={{ background:'#e0e7ff', color:'#4f46e5',
                  border:'1px solid #c7d2fe', borderRadius:7, padding:'4px 12px', fontSize:12, cursor:'pointer' }}>+ Grupo</button>
              </div>
            </div>
          </div>
        ))
      }
    </div>
  );
}

// ── Importación masiva de usuarios ────────────────────────────────────────
function normalizar(str) {
  return str.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function generarUsuario(nombre) {
  // "García López, Ana" o "Ana García López" → "ana.garcia"
  const limpio  = nombre.replace(',', ' ').trim();
  const partes  = limpio.split(/\s+/).filter(Boolean);
  if (partes.length === 0) return 'usuario';
  if (partes.length === 1) return normalizar(partes[0]);
  // Formato "Apellido Apellido, Nombre" → el último token antes de la coma es el nombre
  const coma = nombre.indexOf(',');
  if (coma > -1) {
    const nombre1 = nombre.slice(coma + 1).trim().split(/\s+/)[0];
    const apell1  = nombre.slice(0, coma).trim().split(/\s+/)[0];
    return normalizar(nombre1) + '.' + normalizar(apell1);
  }
  // Sin coma: primer token = nombre, segundo = primer apellido
  return normalizar(partes[0]) + '.' + normalizar(partes[1]);
}

function ImportacionMasiva({ onClose, onDone }) {
  const [grupos,   setGrupos]   = useState([]);
  const [grupoId,  setGrupoId]  = useState('');
  const [texto,    setTexto]    = useState('');
  const [rol,      setRol]      = useState('alumno');
  const [dominio,  setDominio]  = useState('@centro.es');
  const [password, setPassword] = useState('cambiar1234');
  const [preview,  setPreview]  = useState([]);
  const [resultado,setResultado]= useState(null);
  const [loading,  setLoading]  = useState(false);
  const [paso,     setPaso]     = useState(1); // 1=entrada, 2=preview, 3=resultado

  useEffect(() => { api.getCiclos().then(setGrupos).catch(()=>{}); }, []);
  const allGrupos = grupos.flatMap(c => c.grupos.map(g => ({ ...g, ciclo: c.codigo })));

  const IS = { background:'#fff', border:'1px solid #cbd5e1', borderRadius:8,
    color:'#0f172a', padding:'8px 12px', fontSize:13, outline:'none',
    width:'100%', boxSizing:'border-box' };

  function parsear() {
    const lineas = texto.split('\n').map(l => l.trim()).filter(Boolean);
    const lista = lineas.map((linea, i) => {
      // Formato flexible: nombre [| usuario] [| email]
      const partes = linea.split('|').map(p => p.trim());
      const nombre  = partes[0] || `Usuario ${i+1}`;
      const usuario = partes[1] || generarUsuario(nombre);
      const email   = partes[2] || (usuario + dominio);
      const alumno_nombre = rol === 'alumno' ? nombre : null;
      return { nombre, usuario, email, rol, password, alumno_nombre, grupo_id: grupoId || null, _idx: i };
    });
    setPreview(lista);
    setPaso(2);
  }

  function editarFila(idx, campo, valor) {
    setPreview(prev => prev.map(u => u._idx === idx ? { ...u, [campo]: valor } : u));
  }
  function eliminarFila(idx) {
    setPreview(prev => prev.filter(u => u._idx !== idx));
  }

  async function crear() {
    setLoading(true);
    const res = [];
    for (const u of preview) {
      try {
        await api.createUsuario(u);
        res.push({ ...u, ok: true });
      } catch(e) {
        res.push({ ...u, ok: false, error: e.message });
      }
    }
    setResultado(res);
    setPaso(3);
    setLoading(false);
    onDone();
  }

  const creados  = resultado?.filter(r => r.ok).length  || 0;
  const errores  = resultado?.filter(r => !r.ok).length || 0;

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
      <div style={{ background:'#fff', borderRadius:16, width:'100%', maxWidth:700,
        maxHeight:'90vh', display:'flex', flexDirection:'column',
        boxShadow:'0 20px 60px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding:'18px 24px', borderBottom:'1px solid #e2e8f0',
          display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ flex:1 }}>
            <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:'#0f172a' }}>
              Importacion masiva de usuarios
            </h2>
            <p style={{ margin:0, fontSize:12, color:'#64748b' }}>
              {paso === 1 && 'Paso 1: Pega los nombres y configura opciones'}
              {paso === 2 && `Paso 2: Revisa los ${preview.length} usuarios antes de crear`}
              {paso === 3 && `Paso 3: Resultado — ${creados} creados, ${errores} errores`}
            </p>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'1px solid #e2e8f0',
            borderRadius:8, padding:'6px 12px', cursor:'pointer', color:'#64748b' }}>X</button>
        </div>

        <div style={{ padding:'20px 24px', flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:16 }}>

          {/* ── PASO 1: Entrada ── */}
          {paso === 1 && <>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              <div>
                <label style={{ fontSize:12, color:'#64748b', display:'block', marginBottom:4 }}>Rol para todos</label>
                <select value={rol} onChange={e => setRol(e.target.value)} style={IS}>
                  <option value="alumno">Alumno</option>
                  <option value="docente">Docente</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div style={{ gridColumn:'1/-1' }}>
                <label style={{ fontSize:12, color:'#64748b', display:'block', marginBottom:4 }}>Grupo (opcional)</label>
                <select value={grupoId} onChange={e => setGrupoId(e.target.value)} style={IS}>
                  <option value=''>Sin grupo asignado</option>
                  {grupos.map(c => (
                    <optgroup key={c.id} label={`${c.codigo} — ${c.nombre}`}>
                      {c.grupos.map(g => <option key={g.id} value={g.id}>{g.nombre}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize:12, color:'#64748b', display:'block', marginBottom:4 }}>Dominio email</label>
                <input value={dominio} onChange={e => setDominio(e.target.value)}
                  placeholder="@centro.es" style={IS}/>
              </div>
              <div>
                <label style={{ fontSize:12, color:'#64748b', display:'block', marginBottom:4 }}>Contrasena inicial</label>
                <input value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="cambiar1234" style={IS}/>
              </div>
            </div>

            <div>
              <label style={{ fontSize:12, color:'#64748b', display:'block', marginBottom:6 }}>
                Nombres (uno por linea)
              </label>
              <div style={{ background:'#f8fafc', border:'1px solid #e2e8f0', borderRadius:8,
                padding:'10px 12px', fontSize:11, color:'#94a3b8', marginBottom:8 }}>
                Formatos aceptados:<br/>
                <code style={{ color:'#4f46e5' }}>Garcia Lopez, Ana</code> — solo nombre (usuario y email se generan)<br/>
                <code style={{ color:'#4f46e5' }}>Garcia Lopez, Ana | ana.garcia</code> — con usuario<br/>
                <code style={{ color:'#4f46e5' }}>Garcia Lopez, Ana | ana.garcia | ana@ies.es</code> — completo
              </div>
              <textarea
                value={texto}
                onChange={e => setTexto(e.target.value)}
                placeholder={"Garcia Lopez, Ana\nMartinez Ruiz, Carlos\nSanchez Perez, Elena\nRodriguez Gomez, Luis | luis.rodriguez | luis@ies.es"}
                rows={12}
                style={{ ...IS, fontFamily:'monospace', fontSize:13, resize:'vertical', lineHeight:1.6 }}
              />
              <div style={{ fontSize:12, color:'#94a3b8', marginTop:4 }}>
                {texto.split('\n').filter(l => l.trim()).length} lineas
              </div>
            </div>

            <div style={{ display:'flex', gap:8 }}>
              <button onClick={parsear}
                disabled={!texto.trim()}
                style={{ background: texto.trim() ? '#4f46e5' : '#94a3b8', color:'#fff',
                  border:'none', borderRadius:8, padding:'10px 24px',
                  fontSize:14, fontWeight:600, cursor: texto.trim() ? 'pointer' : 'not-allowed' }}>
                Previsualizar →
              </button>
              <button onClick={onClose} style={{ background:'none', border:'1px solid #e2e8f0',
                borderRadius:8, padding:'10px 16px', fontSize:13, color:'#64748b', cursor:'pointer' }}>
                Cancelar
              </button>
            </div>
          </>}

          {/* ── PASO 2: Preview ── */}
          {paso === 2 && <>
            <div style={{ borderRadius:10, overflow:'auto', border:'1px solid #e2e8f0' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
                <thead>
                  <tr style={{ background:'#f1f5f9' }}>
                    {['Nombre completo','Usuario','Email','Rol',''].map(h => (
                      <th key={h} style={{ padding:'8px 12px', fontSize:11, fontWeight:600,
                        textTransform:'uppercase', letterSpacing:.6, color:'#475569',
                        textAlign:'left', borderBottom:'1px solid #e2e8f0', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((u, i) => (
                    <tr key={u._idx} style={{ background: i%2===0 ? '#fff' : '#f8fafc' }}>
                      <td style={{ padding:'6px 12px' }}>
                        <input value={u.nombre} onChange={e => editarFila(u._idx,'nombre',e.target.value)}
                          style={{ border:'none', background:'transparent', fontSize:13,
                            color:'#0f172a', width:'100%', outline:'none' }}/>
                      </td>
                      <td style={{ padding:'6px 12px' }}>
                        <input value={u.usuario} onChange={e => editarFila(u._idx,'usuario',e.target.value)}
                          style={{ border:'none', background:'transparent', fontSize:12,
                            color:'#64748b', fontFamily:'monospace', width:'100%', outline:'none' }}/>
                      </td>
                      <td style={{ padding:'6px 12px' }}>
                        <input value={u.email} onChange={e => editarFila(u._idx,'email',e.target.value)}
                          style={{ border:'none', background:'transparent', fontSize:12,
                            color:'#64748b', width:'100%', outline:'none' }}/>
                      </td>
                      <td style={{ padding:'6px 12px' }}>
                        <select value={u.rol} onChange={e => editarFila(u._idx,'rol',e.target.value)}
                          style={{ border:'none', background:'transparent', fontSize:12,
                            color:'#475569', cursor:'pointer' }}>
                          <option value="alumno">Alumno</option>
                          <option value="docente">Docente</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td style={{ padding:'6px 8px' }}>
                        <button onClick={() => eliminarFila(u._idx)}
                          style={{ background:'none', border:'none', color:'#dc2626',
                            fontSize:14, cursor:'pointer', padding:'2px 6px' }}>✕</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display:'flex', gap:8, alignItems:'center' }}>
              <button onClick={crear} disabled={loading || preview.length === 0}
                style={{ background: preview.length ? '#059669' : '#94a3b8', color:'#fff',
                  border:'none', borderRadius:8, padding:'10px 24px',
                  fontSize:14, fontWeight:600, cursor: preview.length ? 'pointer' : 'not-allowed' }}>
                {loading ? 'Creando...' : `Crear ${preview.length} usuarios`}
              </button>
              <button onClick={() => setPaso(1)} style={{ background:'none', border:'1px solid #e2e8f0',
                borderRadius:8, padding:'10px 16px', fontSize:13, color:'#64748b', cursor:'pointer' }}>
                Atras
              </button>
              <span style={{ fontSize:12, color:'#94a3b8', marginLeft:'auto' }}>
                Contrasena inicial: <code style={{ color:'#4f46e5' }}>{password}</code>
              </span>
            </div>
          </>}

          {/* ── PASO 3: Resultado ── */}
          {paso === 3 && <>
            <div style={{ display:'flex', gap:12, marginBottom:8 }}>
              <div style={{ flex:1, background:'#f0fdf4', border:'1px solid #bbf7d0',
                borderRadius:10, padding:'14px 18px', textAlign:'center' }}>
                <div style={{ fontSize:28, fontWeight:800, color:'#059669' }}>{creados}</div>
                <div style={{ fontSize:13, color:'#065f46' }}>creados correctamente</div>
              </div>
              {errores > 0 && (
                <div style={{ flex:1, background:'#fef2f2', border:'1px solid #fecaca',
                  borderRadius:10, padding:'14px 18px', textAlign:'center' }}>
                  <div style={{ fontSize:28, fontWeight:800, color:'#dc2626' }}>{errores}</div>
                  <div style={{ fontSize:13, color:'#991b1b' }}>errores (ya existian o email duplicado)</div>
                </div>
              )}
            </div>

            {errores > 0 && (
              <div style={{ borderRadius:8, overflow:'hidden', border:'1px solid #fecaca' }}>
                {resultado.filter(r => !r.ok).map((r, i) => (
                  <div key={i} style={{ padding:'8px 14px', background:i%2===0?'#fef2f2':'#fff5f5',
                    fontSize:13, display:'flex', gap:12 }}>
                    <span style={{ color:'#dc2626' }}>✕</span>
                    <span style={{ color:'#0f172a', flex:1 }}>{r.nombre}</span>
                    <span style={{ color:'#94a3b8' }}>{r.error}</span>
                  </div>
                ))}
              </div>
            )}

            <button onClick={onClose} style={{ background:'#4f46e5', color:'#fff',
              border:'none', borderRadius:8, padding:'10px 24px',
              fontSize:14, fontWeight:600, cursor:'pointer', alignSelf:'flex-start' }}>
              Cerrar
            </button>
          </>}

        </div>
      </div>
    </div>
  );
}

// ── Dashboard principal ────────────────────────────────────────────────────
export default function Dashboard({ cuadernos, setCuadernos, currentUser, onOpenCuaderno, onLogout }) {
  const [showNuevo,    setShowNuevo]    = useState(false);
  const [showUsuarios, setShowUsuarios] = useState(false);
  const [showImport,   setShowImport]   = useState(false);
  const [showCiclos,   setShowCiclos]   = useState(false);
  const [inscModal,    setInscModal]    = useState(null); // cuaderno seleccionado
  const [docentes,     setDocentes]     = useState([]);

  const rol = currentUser.rol;

  useEffect(() => {
    if (rol === 'admin')
      api.getUsuarios('docente').then(setDocentes).catch(console.error);
  }, [rol]);

  async function addCuaderno(fields) {
    try {
      const nc = await api.createCuaderno(fields);
      const lista = await api.getCuadernos();
      setCuadernos(lista);
      setShowNuevo(false);
    } catch(e) { alert(e.message); }
  }

  async function deleteCuaderno(id) {
    if (!confirm("¿Eliminar este cuaderno? Se perderán todos sus datos.")) return;
    await api.deleteCuaderno(id);
    setCuadernos(prev => prev.filter(c => c.id !== id));
  }

  const canManage = rol === 'admin' || rol === 'docente';

  // Agrupar por docente para admin
  const cuadernosPorDocente = rol === 'admin'
    ? [...new Set(cuadernos.map(c => c.docente_id))].map(did => ({
        did,
        nombre: cuadernos.find(c => c.docente_id === did)?.docente_nombre || `Docente ${did}`,
        items:  cuadernos.filter(c => c.docente_id === did),
      }))
    : [];

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#eef2ff 0%,#e0f2fe 100%)",
        borderBottom:"1px solid #e2e8f0", padding:"18px 32px",
        display:"flex", alignItems:"center", gap:14, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <NotebookIcon size={32}/>
        <div style={{ flex:1 }}>
          <h1 style={{ margin:0, fontSize:17, fontWeight:800, color:"#0f172a" }}>Cuaderno de Calificaciones</h1>
          <p style={{ margin:0, fontSize:12, color:"#64748b" }}>Formación Profesional · Aragón</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{currentUser.nombre}</div>
            <RoleBadge rol={rol}/>
          </div>
          <button onClick={onLogout} style={{ background:"none", border:"1px solid #e2e8f0",
            borderRadius:8, padding:"7px 14px", fontSize:12, color:"#64748b", cursor:"pointer" }}>
            ↩ Salir
          </button>
        </div>
      </div>

      <div style={{ padding:"28px 32px", maxWidth:1100, margin:"0 auto" }}>

        {/* Alumno: lista de sus cuadernos */}
        {rol === "alumno" && (
          <>
            <h2 style={{ margin:"0 0 20px", fontSize:18, fontWeight:700, color:"#0f172a" }}>Mis calificaciones</h2>
            {cuadernos.length === 0
              ? <div style={{ textAlign:"center", padding:60, color:"#64748b" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
                  <p>No estás matriculado en ningún módulo todavía.</p>
                </div>
              : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:16 }}>
                  {cuadernos.map(c=>(
                    <CuadernoCard key={c.id} cuaderno={c} onClick={()=>onOpenCuaderno(c.id)} canManage={false}/>
                  ))}
                </div>
            }
          </>
        )}

        {/* Docente / Admin */}
        {canManage && (
          <>
            <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
              <button onClick={()=>setShowNuevo(v=>!v)} style={{
                background:showNuevo?"#3730a3":"#4f46e5", color:"#fff", border:"none",
                borderRadius:9, padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                {showNuevo ? "✕ Cancelar" : "+ Nuevo cuaderno"}
              </button>
              {rol === "admin" && (
                <>
                  <button onClick={()=>setShowUsuarios(v=>!v)} style={{
                    background:showUsuarios?"#1e1b4b":"#fff",
                    color:showUsuarios?"#fff":"#4f46e5",
                    border:`1px solid ${showUsuarios?"#1e1b4b":"#c7d2fe"}`,
                    borderRadius:9, padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    👥 Usuarios
                  </button>
                  <button onClick={()=>setShowImport(true)} style={{
                    background:"#fff", color:"#059669",
                    border:"1px solid #a7f3d0",
                    borderRadius:9, padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    Importar masivo
                  </button>
                  <button onClick={()=>setShowCiclos(v=>!v)} style={{
                    background:showCiclos?"#1e1b4b":"#fff",
                    color:showCiclos?"#fff":"#7c3aed",
                    border:`1px solid ${showCiclos?"#1e1b4b":"#ddd6fe"}`,
                    borderRadius:9, padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    Ciclos y Grupos
                  </button>
                </>
              )}
            </div>

            {showNuevo && (
              <div style={{ marginBottom:24 }}>
                <NuevoCuadernoForm
                  docentes={docentes} currentUser={currentUser}
                  onAdd={addCuaderno} onCancel={()=>setShowNuevo(false)}/>
              </div>
            )}

            {showUsuarios && rol === "admin" && (
              <div style={{ marginBottom:28 }}>
                <UserManager onRefresh={() => api.getUsuarios('docente').then(setDocentes)}/>
              </div>
            )}

            {showCiclos && rol === "admin" && (
              <div style={{ marginBottom:28 }}>
                <CiclosManager onCiclosChange={()=>{}}/>
              </div>
            )}

            {/* Admin: cuadernos agrupados por docente */}
            {rol === "admin" && cuadernosPorDocente.map(({ did, nombre, items }) => (
              <div key={did} style={{ marginBottom:32 }}>
                <h2 style={{ margin:"0 0 14px", fontSize:16, fontWeight:700, color:"#0f172a",
                  display:"flex", alignItems:"center", gap:8 }}>
                  📚 {nombre}
                  <span style={{ fontSize:12, color:"#64748b", fontWeight:400 }}>
                    {items.length} cuaderno{items.length !== 1 ? "s" : ""}
                  </span>
                </h2>
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
                  {items.map(c=>(
                    <CuadernoCard key={c.id} cuaderno={c}
                      onClick={()=>onOpenCuaderno(c.id)}
                      onDelete={()=>deleteCuaderno(c.id)}
                      onInscripciones={()=>setInscModal(c)}
                      canManage={true}/>
                  ))}
                </div>
              </div>
            ))}

            {/* Docente: sus cuadernos */}
            {rol === "docente" && (
              <>
                <h2 style={{ margin:"0 0 16px", fontSize:18, fontWeight:700, color:"#0f172a" }}>Mis cuadernos</h2>
                {cuadernos.length === 0
                  ? <div style={{ textAlign:"center", padding:60, color:"#64748b" }}>
                      <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
                      <p>Aún no tienes cuadernos. Crea el primero.</p>
                    </div>
                  : <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
                      {cuadernos.map(c=>(
                        <CuadernoCard key={c.id} cuaderno={c}
                          onClick={()=>onOpenCuaderno(c.id)}
                          onDelete={()=>deleteCuaderno(c.id)}
                          onInscripciones={()=>setInscModal(c)}
                          canManage={true}/>
                      ))}
                    </div>
                }
              </>
            )}
          </>
        )}
      </div>

      {inscModal && (
        <InscripcionesModal cuaderno={inscModal} onClose={()=>setInscModal(null)}/>
      )}
      {showImport && (
        <ImportacionMasiva
          onClose={()=>setShowImport(false)}
          onDone={async ()=>{ await api.getUsuarios('docente').then(setDocentes); }}
        />
      )}
    </div>
  );
}
