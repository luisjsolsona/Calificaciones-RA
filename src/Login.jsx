import { useState } from "react";

function NotebookIcon({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 50" fill="none" style={{ flexShrink:0 }}>
      <rect x="7" y="1" width="28" height="48" rx="4" fill="#4f46e5"/>
      <rect x="7" y="1" width="8"  height="48" rx="4" fill="#3730a3"/>
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
  const [usuario,  setUsuario]  = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");

  function handleLogin() {
    const user = users.find(u => u.usuario === usuario.trim());
    if (!user || user.password !== password) {
      setError("Usuario o contraseña incorrectos");
      return;
    }
    onLogin(user.id);
  }

  const IS = {
    width:"100%", border:"1px solid #e2e8f0", borderRadius:8, padding:"11px 14px",
    fontSize:14, outline:"none", boxSizing:"border-box", color:"#0f172a",
    background:"#f8fafc",
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#eef2ff 0%,#e0f2fe 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#ffffff", borderRadius:20, padding:"44px 40px", width:"100%", maxWidth:380, boxShadow:"0 8px 40px rgba(0,0,0,0.12)" }}>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:36 }}>
          <NotebookIcon size={44}/>
          <div>
            <h1 style={{ margin:0, fontSize:19, fontWeight:800, color:"#0f172a", letterSpacing:-.5 }}>Cuaderno de Calificaciones</h1>
            <p  style={{ margin:0, fontSize:12, color:"#64748b" }}>Formación Profesional · Aragón</p>
          </div>
        </div>

        {/* Formulario */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:"#475569", display:"block", marginBottom:6 }}>Usuario</label>
            <input
              value={usuario}
              autoFocus
              onChange={e => { setUsuario(e.target.value); setError(""); }}
              onKeyDown={e => e.key==="Enter" && document.getElementById("pwd-input").focus()}
              placeholder="nombre de usuario"
              style={{ ...IS, border:`1px solid ${error?"#fca5a5":"#e2e8f0"}` }}
            />
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:"#475569", display:"block", marginBottom:6 }}>Contraseña</label>
            <input
              id="pwd-input"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key==="Enter" && handleLogin()}
              placeholder="••••••••"
              style={{ ...IS, border:`1px solid ${error?"#fca5a5":"#e2e8f0"}` }}
            />
          </div>

          {error && (
            <div style={{ color:"#dc2626", fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
              ⚠ {error}
            </div>
          )}

          <button onClick={handleLogin} style={{
            width:"100%", background:"#4f46e5", color:"#fff", border:"none", borderRadius:8,
            padding:"13px", fontSize:14, fontWeight:700, cursor:"pointer", marginTop:4,
          }}>
            Iniciar sesión →
          </button>
        </div>

        {/* Credenciales demo */}
        <div style={{ marginTop:24, padding:"14px 16px", background:"#f8fafc", borderRadius:10, border:"1px solid #e2e8f0" }}>
          <p style={{ margin:"0 0 8px", fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:.6 }}>Credenciales demo</p>
          <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
            {[
              { rol:"🛡️ Admin",   user:"admin",    pwd:"admin" },
              { rol:"📚 Docente", user:"garcia",   pwd:"1234"  },
              { rol:"🎓 Alumno",  user:"ana",      pwd:"1111"  },
            ].map(d => (
              <div key={d.user} style={{ display:"flex", gap:8, fontSize:12, color:"#475569" }}>
                <span style={{ width:90 }}>{d.rol}</span>
                <code style={{ color:"#4f46e5" }}>{d.user}</code>
                <span style={{ color:"#94a3b8" }}>/ {d.pwd}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
