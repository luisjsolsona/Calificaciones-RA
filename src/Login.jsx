import { useState } from "react";
import { ROLES } from "./store.js";

function NotebookIcon({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 50" fill="none" style={{ flexShrink:0 }}>
      <rect x="7" y="1" width="28" height="48" rx="4" fill="#4f46e5"/>
      <rect x="7" y="1" width="8" height="48" rx="4" fill="#3730a3"/>
      <circle cx="11" cy="13" r="3" fill="#4338ca" stroke="#a5b4fc" strokeWidth="1.5"/>
      <circle cx="11" cy="25" r="3" fill="#4338ca" stroke="#a5b4fc" strokeWidth="1.5"/>
      <circle cx="11" cy="37" r="3" fill="#4338ca" stroke="#a5b4fc" strokeWidth="1.5"/>
      <rect x="19" y="10" width="11" height="2" rx="1" fill="rgba(255,255,255,0.45)"/>
      <rect x="19" y="15" width="11" height="2" rx="1" fill="rgba(255,255,255,0.45)"/>
      <rect x="19" y="20" width="8"  height="2" rx="1" fill="rgba(255,255,255,0.45)"/>
      <text x="24" y="43" textAnchor="middle" fill="white" fontSize="13" fontWeight="900" fontFamily="sans-serif">RA</text>
    </svg>
  );
}

export default function Login({ users, onLogin }) {
  const [selectedId, setSelectedId] = useState(null);
  const [password,   setPassword]   = useState("");
  const [error,      setError]       = useState("");

  const selectedUser = users.find(u => u.id === selectedId);

  function select(id) { setSelectedId(id); setPassword(""); setError(""); }

  function handleLogin() {
    if (!selectedUser) return;
    if (selectedUser.password !== password) { setError("Contraseña incorrecta"); return; }
    onLogin(selectedUser.id);
  }

  // Agrupar por rol para mostrar ordenados
  const byRole = ["admin","docente","alumno"].map(role => ({
    role,
    users: users.filter(u => u.role === role),
  })).filter(g => g.users.length > 0);

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#eef2ff 0%,#e0f2fe 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#ffffff", borderRadius:20, padding:"40px 36px", width:"100%", maxWidth:460, boxShadow:"0 8px 40px rgba(0,0,0,0.12)" }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:32 }}>
          <NotebookIcon size={44}/>
          <div>
            <h1 style={{ margin:0, fontSize:20, fontWeight:800, color:"#0f172a", letterSpacing:-.5 }}>Cuaderno de Calificaciones</h1>
            <p  style={{ margin:0, fontSize:12, color:"#64748b" }}>Formación Profesional · Aragón</p>
          </div>
        </div>

        {/* Lista de usuarios por rol */}
        <p style={{ fontSize:13, color:"#64748b", marginBottom:12, marginTop:0 }}>Selecciona tu usuario:</p>
        {byRole.map(({ role, users: group }) => {
          const roleMeta = ROLES[role];
          return (
            <div key={role} style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, fontWeight:600, color:roleMeta.color, textTransform:"uppercase", letterSpacing:.8, marginBottom:6 }}>
                {roleMeta.icon} {roleMeta.label}s
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {group.map(user => {
                  const active = selectedId === user.id;
                  return (
                    <button key={user.id} onClick={() => select(user.id)} style={{
                      display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:10,
                      border:`2px solid ${active?"#4f46e5":"#e2e8f0"}`,
                      background:active?"#eef2ff":"#f8fafc",
                      cursor:"pointer", textAlign:"left", transition:"all .15s",
                    }}>
                      <span style={{ fontSize:20 }}>{roleMeta.icon}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontWeight:600, color:"#0f172a", fontSize:14 }}>{user.nombre}</div>
                        <div style={{ fontSize:11, color:"#94a3b8" }}>@{user.usuario}</div>
                      </div>
                      <span style={{ fontSize:10, fontWeight:700, color:roleMeta.color,
                        background:roleMeta.color+"18", border:`1px solid ${roleMeta.color}44`,
                        borderRadius:99, padding:"2px 8px" }}>
                        {roleMeta.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Contraseña */}
        {selectedUser && (
          <div style={{ marginTop:20 }}>
            <label style={{ fontSize:13, fontWeight:600, color:"#475569", display:"block", marginBottom:6 }}>
              Contraseña para <strong>{selectedUser.nombre}</strong>
            </label>
            <input
              type="password"
              value={password}
              autoFocus
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key==="Enter" && handleLogin()}
              placeholder="Introduce tu contraseña"
              style={{ width:"100%", border:`1px solid ${error?"#fca5a5":"#cbd5e1"}`, borderRadius:8, padding:"10px 14px",
                fontSize:14, outline:"none", boxSizing:"border-box", marginBottom:8 }}
            />
            {error && <div style={{ color:"#dc2626", fontSize:13, marginBottom:8 }}>⚠ {error}</div>}
            <button onClick={handleLogin} style={{
              width:"100%", background:"#4f46e5", color:"#fff", border:"none", borderRadius:8,
              padding:"12px", fontSize:14, fontWeight:700, cursor:"pointer",
            }}>
              Iniciar sesión →
            </button>
          </div>
        )}

        <p style={{ marginTop:20, marginBottom:0, fontSize:11, color:"#94a3b8", textAlign:"center" }}>
          Demo: Admin → <code>admin</code> · Docente → <code>1234</code> · Alumno → <code>1111</code>
        </p>
      </div>
    </div>
  );
}
