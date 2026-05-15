import { useState } from "react";
import { ROLES, COLORES } from "./store.js";

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

function RoleBadge({ role }) {
  const r = ROLES[role];
  return (
    <span style={{ fontSize:11, fontWeight:700, color:r.color, background:r.color+"18",
      border:`1px solid ${r.color}44`, borderRadius:99, padding:"2px 8px" }}>
      {r.icon} {r.label}
    </span>
  );
}

// ─── TARJETA CUADERNO ─────────────────────────────────────────────────────────
function CuadernoCard({ cuaderno, docente, onClick, onDelete, canDelete }) {
  const nAlumnos = cuaderno.data?.alumnos?.length ?? 0;
  const nActs    = cuaderno.data?.actividades?.length ?? 0;
  return (
    <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:14, overflow:"hidden",
      boxShadow:"0 2px 8px rgba(0,0,0,0.06)", display:"flex", flexDirection:"column" }}>
      <div style={{ background:cuaderno.color||"#4f46e5", padding:"18px 20px", position:"relative" }}>
        <div style={{ fontSize:28, marginBottom:6 }}>📒</div>
        <h3 style={{ margin:0, color:"#fff", fontSize:16, fontWeight:800 }}>{cuaderno.titulo}</h3>
        {cuaderno.descripcion && <p style={{ margin:"4px 0 0", color:"rgba(255,255,255,0.8)", fontSize:12 }}>{cuaderno.descripcion}</p>}
        <div style={{ display:"flex", gap:6, marginTop:8 }}>
          {cuaderno.modulo && <span style={{ background:"rgba(0,0,0,0.2)", color:"#fff", fontSize:10, fontWeight:700, borderRadius:6, padding:"2px 7px" }}>{cuaderno.modulo}</span>}
          {cuaderno.curso   && <span style={{ background:"rgba(0,0,0,0.2)", color:"#fff", fontSize:10, fontWeight:700, borderRadius:6, padding:"2px 7px" }}>{cuaderno.curso}</span>}
        </div>
      </div>
      <div style={{ padding:"14px 16px", flex:1 }}>
        {docente && <p style={{ margin:"0 0 8px", fontSize:12, color:"#64748b" }}>👤 {docente.nombre}</p>}
        <div style={{ display:"flex", gap:16, fontSize:12, color:"#64748b" }}>
          <span>👥 {nAlumnos} alumnos</span>
          <span>📝 {nActs} actividades</span>
        </div>
      </div>
      <div style={{ padding:"0 16px 14px", display:"flex", gap:8 }}>
        <button onClick={onClick} style={{
          flex:1, background:"#4f46e5", color:"#fff", border:"none", borderRadius:8,
          padding:"9px 0", fontSize:13, fontWeight:600, cursor:"pointer" }}>
          Abrir →
        </button>
        {canDelete && (
          <button onClick={onDelete} style={{
            background:"none", border:"1px solid #fca5a5", borderRadius:8, color:"#dc2626",
            padding:"9px 12px", fontSize:12, cursor:"pointer" }}>✕</button>
        )}
      </div>
    </div>
  );
}

// ─── FORMULARIO NUEVO CUADERNO ────────────────────────────────────────────────
function NuevoCuadernoForm({ docentes, currentUser, onAdd, onCancel }) {
  const [titulo,      setTitulo]      = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [modulo,      setModulo]      = useState("");
  const [curso,       setCurso]       = useState("");
  const [color,       setColor]       = useState(COLORES[0]);
  const [docenteId,   setDocenteId]   = useState(currentUser.role==="docente" ? currentUser.id : (docentes[0]?.id||""));

  function submit() {
    if (!titulo.trim()) return;
    onAdd({ titulo:titulo.trim(), descripcion:descripcion.trim(), modulo:modulo.trim(), curso:curso.trim(), color, docenteId });
  }

  const IS = { background:"#fff", border:"1px solid #cbd5e1", borderRadius:8, color:"#0f172a", padding:"8px 12px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" };

  return (
    <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:14, padding:20, display:"flex", flexDirection:"column", gap:12 }}>
      <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:"#0f172a" }}>Nuevo cuaderno</h3>
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
        {currentUser.role === "admin" && (
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
                width:28, height:28, borderRadius:6, background:c, cursor:"pointer",
                border:`3px solid ${c===color?"#0f172a":"transparent"}`, flexShrink:0 }}/>
            ))}
          </div>
        </div>
      </div>
      <div style={{ display:"flex", gap:8 }}>
        <button onClick={submit} disabled={!titulo.trim()} style={{
          background:"#4f46e5", color:"#fff", border:"none", borderRadius:8, padding:"9px 20px",
          fontSize:13, fontWeight:600, cursor:"pointer", opacity:titulo.trim()?1:0.5 }}>
          + Crear cuaderno
        </button>
        <button onClick={onCancel} style={{
          background:"none", border:"1px solid #e2e8f0", borderRadius:8, padding:"9px 16px",
          fontSize:13, color:"#64748b", cursor:"pointer" }}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ─── GESTIÓN DE USUARIOS (Admin) ──────────────────────────────────────────────
function UserManager({ users, onAdd, onDelete, onUpdate }) {
  const [showForm, setShowForm] = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [form, setForm] = useState({ nombre:"", usuario:"", password:"", role:"docente", alumnoNombre:"" });

  const IS = { background:"#fff", border:"1px solid #cbd5e1", borderRadius:8, color:"#0f172a", padding:"7px 10px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" };

  function startAdd()  { setForm({ nombre:"", usuario:"", password:"", role:"docente", alumnoNombre:"" }); setEditId(null); setShowForm(true); }
  function startEdit(u){ setForm({ nombre:u.nombre, usuario:u.usuario, password:u.password, role:u.role, alumnoNombre:u.alumnoNombre||"" }); setEditId(u.id); setShowForm(true); }
  function cancel()    { setShowForm(false); setEditId(null); }

  function submit() {
    if (!form.nombre.trim() || !form.usuario.trim() || !form.password.trim()) return;
    if (editId) onUpdate(editId, form);
    else        onAdd(form);
    setShowForm(false);
    setEditId(null);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <h3 style={{ margin:0, fontSize:15, fontWeight:700, color:"#0f172a" }}>👥 Usuarios</h3>
        <button onClick={startAdd} style={{ background:"#4f46e5", color:"#fff", border:"none", borderRadius:8, padding:"7px 14px", fontSize:13, fontWeight:600, cursor:"pointer" }}>+ Nuevo</button>
      </div>

      {showForm && (
        <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:12, padding:16, display:"flex", flexDirection:"column", gap:10 }}>
          <h4 style={{ margin:0, fontSize:13, fontWeight:700 }}>{editId?"Editar usuario":"Nuevo usuario"}</h4>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            <input value={form.nombre} onChange={e=>setForm(p=>({...p,nombre:e.target.value}))} placeholder="Nombre completo" style={IS}/>
            <input value={form.usuario} onChange={e=>setForm(p=>({...p,usuario:e.target.value}))} placeholder="Usuario (@login)" style={IS}/>
            <input type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} placeholder="Contraseña" style={IS}/>
            <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))} style={IS}>
              <option value="admin">🛡️ Admin</option>
              <option value="docente">📚 Docente</option>
              <option value="alumno">🎓 Alumno</option>
            </select>
            {form.role==="alumno" && (
              <input style={{ ...IS, gridColumn:"1/-1" }} value={form.alumnoNombre}
                onChange={e=>setForm(p=>({...p,alumnoNombre:e.target.value}))}
                placeholder="Nombre en cuaderno (Apellido, Nombre)"/>
            )}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={submit} style={{ background:"#4f46e5", color:"#fff", border:"none", borderRadius:8, padding:"8px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              {editId?"Guardar":"Crear"}
            </button>
            <button onClick={cancel} style={{ background:"none", border:"1px solid #e2e8f0", borderRadius:8, padding:"8px 14px", fontSize:13, color:"#64748b", cursor:"pointer" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div style={{ borderRadius:10, overflow:"hidden", border:"1px solid #e2e8f0" }}>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr style={{ background:"#f1f5f9" }}>
              {["Nombre","Usuario","Rol","Acciones"].map(h=>(
                <th key={h} style={{ padding:"8px 12px", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:.6, color:"#475569", textAlign:"left", borderBottom:"1px solid #e2e8f0" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u,i)=>(
              <tr key={u.id} style={{ background:i%2===0?"#fff":"#f8fafc" }}>
                <td style={{ padding:"9px 12px", fontSize:13, color:"#0f172a", fontWeight:500 }}>{u.nombre}</td>
                <td style={{ padding:"9px 12px", fontSize:12, color:"#64748b" }}>@{u.usuario}</td>
                <td style={{ padding:"9px 12px" }}><RoleBadge role={u.role}/></td>
                <td style={{ padding:"9px 12px" }}>
                  <button onClick={()=>startEdit(u)} style={{ fontSize:12, color:"#4f46e5", background:"none", border:"none", cursor:"pointer", marginRight:8 }}>✏ Editar</button>
                  <button onClick={()=>onDelete(u.id)} style={{ fontSize:12, color:"#dc2626", background:"none", border:"none", cursor:"pointer" }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── VISTA ALUMNO EN DASHBOARD ────────────────────────────────────────────────
function AlumnoDashboard({ currentUser, cuadernos, users, onOpenCuaderno }) {
  const misCuadernos = cuadernos.filter(c => c.data?.alumnos?.some(a => a.nombre === currentUser.alumnoNombre));

  if (!misCuadernos.length) {
    return (
      <div style={{ textAlign:"center", padding:60, color:"#64748b" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
        <p style={{ fontSize:15 }}>No estás matriculado en ningún cuaderno todavía.</p>
      </div>
    );
  }
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
      {misCuadernos.map(c=>{
        const docente = users.find(u=>u.id===c.docenteId);
        return <CuadernoCard key={c.id} cuaderno={c} docente={docente} onClick={()=>onOpenCuaderno(c.id)} canDelete={false}/>;
      })}
    </div>
  );
}

// ─── DASHBOARD PRINCIPAL ──────────────────────────────────────────────────────
export default function Dashboard({ store, currentUser, onOpenCuaderno, onLogout, onUpdateStore }) {
  const [showNuevo,   setShowNuevo]   = useState(false);
  const [showUsuarios, setShowUsuarios] = useState(false);

  const { users, cuadernos } = store;
  const role = currentUser.role;
  const docentes = users.filter(u => u.role==="docente");

  function misCuadernos() {
    if (role === "admin") return cuadernos;
    if (role === "docente") return cuadernos.filter(c => c.docenteId === currentUser.id);
    return [];
  }

  function addCuaderno(fields) {
    const { uid } = { uid: () => Date.now().toString(36)+Math.random().toString(36).slice(2,5) };
    const nc = {
      id: Date.now().toString(36)+Math.random().toString(36).slice(2,5),
      ...fields,
      docenteId: fields.docenteId || currentUser.id,
      data: { alumnos:[], ras:[], uds:[], actividades:[] },
    };
    onUpdateStore(prev => ({ cuadernos:[...prev.cuadernos, nc] }));
    setShowNuevo(false);
  }

  function deleteCuaderno(id) {
    if (!confirm("¿Eliminar este cuaderno? Se perderán todos sus datos.")) return;
    onUpdateStore(prev => ({ cuadernos:prev.cuadernos.filter(c=>c.id!==id) }));
  }

  function addUser(form) {
    const id = Date.now().toString(36)+Math.random().toString(36).slice(2,5);
    onUpdateStore(prev => ({ users:[...prev.users, { id, ...form }] }));
  }
  function deleteUser(id) {
    if (!confirm("¿Eliminar este usuario?")) return;
    onUpdateStore(prev => ({ users:prev.users.filter(u=>u.id!==id) }));
  }
  function updateUser(id, form) {
    onUpdateStore(prev => ({ users:prev.users.map(u=>u.id===id?{...u,...form}:u) }));
  }

  const roleMeta = ROLES[role];

  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", fontFamily:"'DM Sans','Segoe UI',sans-serif" }}>
      {/* Cabecera */}
      <div style={{ background:"linear-gradient(135deg,#eef2ff 0%,#e0f2fe 100%)", borderBottom:"1px solid #e2e8f0", padding:"18px 32px", display:"flex", alignItems:"center", gap:14, boxShadow:"0 1px 4px rgba(0,0,0,0.06)" }}>
        <NotebookIcon size={32}/>
        <div style={{ flex:1 }}>
          <h1 style={{ margin:0, fontSize:17, fontWeight:800, color:"#0f172a" }}>Cuaderno de Calificaciones</h1>
          <p style={{ margin:0, fontSize:12, color:"#64748b" }}>Formación Profesional · Aragón</p>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontSize:13, fontWeight:600, color:"#0f172a" }}>{currentUser.nombre}</div>
            <RoleBadge role={role}/>
          </div>
          <button onClick={onLogout} style={{ background:"none", border:"1px solid #e2e8f0", borderRadius:8, padding:"7px 14px", fontSize:12, color:"#64748b", cursor:"pointer" }}>
            ↩ Salir
          </button>
        </div>
      </div>

      <div style={{ padding:"28px 32px", maxWidth:1100, margin:"0 auto" }}>

        {/* Alumno */}
        {role === "alumno" && (
          <>
            <h2 style={{ margin:"0 0 20px", fontSize:18, fontWeight:700, color:"#0f172a" }}>Mis calificaciones</h2>
            <AlumnoDashboard currentUser={currentUser} cuadernos={cuadernos} users={users} onOpenCuaderno={onOpenCuaderno}/>
          </>
        )}

        {/* Docente/Admin */}
        {role !== "alumno" && (
          <>
            {/* Barra de acciones */}
            <div style={{ display:"flex", gap:10, marginBottom:24, flexWrap:"wrap" }}>
              {(role==="docente"||role==="admin") && (
                <button onClick={()=>setShowNuevo(v=>!v)} style={{
                  background:showNuevo?"#3730a3":"#4f46e5", color:"#fff", border:"none", borderRadius:9,
                  padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  {showNuevo?"✕ Cancelar":"+ Nuevo cuaderno"}
                </button>
              )}
              {role==="admin" && (
                <button onClick={()=>setShowUsuarios(v=>!v)} style={{
                  background:showUsuarios?"#1e1b4b":"#ffffff", color:showUsuarios?"#fff":"#4f46e5",
                  border:`1px solid ${showUsuarios?"#1e1b4b":"#c7d2fe"}`, borderRadius:9,
                  padding:"10px 18px", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                  👥 Gestión de usuarios
                </button>
              )}
            </div>

            {showNuevo && (
              <div style={{ marginBottom:24 }}>
                <NuevoCuadernoForm docentes={docentes} currentUser={currentUser} onAdd={addCuaderno} onCancel={()=>setShowNuevo(false)}/>
              </div>
            )}

            {showUsuarios && role==="admin" && (
              <div style={{ marginBottom:28 }}>
                <UserManager users={users} onAdd={addUser} onDelete={deleteUser} onUpdate={updateUser}/>
              </div>
            )}

            {/* Cuadernos agrupados por docente (admin) */}
            {role==="admin" ? (
              docentes.map(docente => {
                const dCuadernos = cuadernos.filter(c=>c.docenteId===docente.id);
                if (!dCuadernos.length) return null;
                return (
                  <div key={docente.id} style={{ marginBottom:32 }}>
                    <h2 style={{ margin:"0 0 14px", fontSize:16, fontWeight:700, color:"#0f172a", display:"flex", alignItems:"center", gap:8 }}>
                      📚 {docente.nombre}
                      <span style={{ fontSize:12, color:"#64748b", fontWeight:400 }}>{dCuadernos.length} cuaderno{dCuadernos.length!==1?"s":""}</span>
                    </h2>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
                      {dCuadernos.map(c=>(
                        <CuadernoCard key={c.id} cuaderno={c} docente={null} onClick={()=>onOpenCuaderno(c.id)}
                          onDelete={()=>deleteCuaderno(c.id)} canDelete={true}/>
                      ))}
                    </div>
                  </div>
                );
              })
            ) : (
              /* Vista docente */
              <>
                <h2 style={{ margin:"0 0 16px", fontSize:18, fontWeight:700, color:"#0f172a" }}>Mis cuadernos</h2>
                {misCuadernos().length === 0 ? (
                  <div style={{ textAlign:"center", padding:60, color:"#64748b" }}>
                    <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
                    <p style={{ fontSize:15 }}>Aún no tienes cuadernos. Crea el primero.</p>
                  </div>
                ) : (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))", gap:16 }}>
                    {misCuadernos().map(c=>(
                      <CuadernoCard key={c.id} cuaderno={c} docente={null} onClick={()=>onOpenCuaderno(c.id)}
                        onDelete={()=>deleteCuaderno(c.id)} canDelete={true}/>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
