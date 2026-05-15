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

export default function Login({ onLogin }) {
  const [login,    setLogin]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit() {
    if (!login.trim() || !password) return;
    setLoading(true); setError("");
    try {
      await onLogin(login.trim(), password);
    } catch (e) {
      setError(e.message || "Usuario o contraseña incorrectos");
    } finally { setLoading(false); }
  }

  const IS = {
    width:"100%", border:"1px solid #e2e8f0", borderRadius:8, padding:"11px 14px",
    fontSize:14, outline:"none", boxSizing:"border-box", color:"#0f172a", background:"#f8fafc",
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#eef2ff 0%,#e0f2fe 100%)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#fff", borderRadius:20, padding:"44px 40px", width:"100%",
        maxWidth:380, boxShadow:"0 8px 40px rgba(0,0,0,0.12)" }}>

        <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:36 }}>
          <NotebookIcon size={44}/>
          <div>
            <h1 style={{ margin:0, fontSize:19, fontWeight:800, color:"#0f172a", letterSpacing:-.5 }}>
              Cuaderno de Calificaciones
            </h1>
            <p style={{ margin:0, fontSize:12, color:"#64748b" }}>Formación Profesional · Aragón</p>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:"#475569", display:"block", marginBottom:6 }}>
              Usuario o email
            </label>
            <input value={login} autoFocus
              onChange={e => { setLogin(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && document.getElementById("pwd").focus()}
              placeholder="admin o admin@centro.es"
              style={{ ...IS, border:`1px solid ${error ? "#fca5a5" : "#e2e8f0"}` }}/>
          </div>
          <div>
            <label style={{ fontSize:13, fontWeight:600, color:"#475569", display:"block", marginBottom:6 }}>
              Contraseña
            </label>
            <input id="pwd" type="password" value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              style={{ ...IS, border:`1px solid ${error ? "#fca5a5" : "#e2e8f0"}` }}/>
          </div>

          {error && (
            <div style={{ color:"#dc2626", fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
              ⚠ {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading || !login.trim() || !password} style={{
            width:"100%", background:loading ? "#94a3b8" : "#4f46e5", color:"#fff",
            border:"none", borderRadius:8, padding:"13px", fontSize:14, fontWeight:700,
            cursor: loading ? "wait" : "pointer", marginTop:4,
            opacity: (!login.trim() || !password) ? 0.6 : 1,
          }}>
            {loading ? "Entrando..." : "Iniciar sesión →"}
          </button>
        </div>

        <div style={{ marginTop:24, padding:"12px 16px", background:"#f8fafc",
          borderRadius:10, border:"1px solid #e2e8f0" }}>
          <p style={{ margin:"0 0 4px", fontSize:11, fontWeight:700, color:"#64748b",
            textTransform:"uppercase", letterSpacing:.6 }}>Acceso inicial</p>
          <p style={{ margin:0, fontSize:12, color:"#475569" }}>
            <strong>Admin:</strong> <code style={{ color:"#4f46e5" }}>admin</code>{" "}
            / <code style={{ color:"#4f46e5" }}>admin1234</code>
          </p>
          <p style={{ margin:"4px 0 0", fontSize:11, color:"#94a3b8" }}>
            Crea docentes y alumnos desde el panel de administración
          </p>
        </div>
      </div>
    </div>
  );
}
