import { useState, useEffect } from "react";
import { api } from "./api.js";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import CuadernoCalificaciones from "./cuaderno-calificaciones.jsx";

export default function App() {
  const [currentUser,        setCurrentUser]        = useState(null);
  const [cuadernos,          setCuadernos]          = useState([]);
  const [view,               setView]               = useState("loading");
  const [currentCuadernoId,  setCurrentCuadernoId]  = useState(null);

  // Restaurar sesión desde JWT guardado
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setView("login"); return; }
    api.me()
      .then(u => { setCurrentUser(u); setView("dashboard"); })
      .catch(() => { localStorage.removeItem('token'); setView("login"); });
  }, []);

  // Cargar cuadernos al entrar al dashboard
  useEffect(() => {
    if (view === "dashboard" && currentUser)
      api.getCuadernos().then(setCuadernos).catch(console.error);
  }, [view, currentUser]);

  async function handleLogin(login, password) {
    const { token, user } = await api.login(login, password);
    localStorage.setItem('token', token);
    setCurrentUser(user);
    setView("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setCurrentUser(null); setCuadernos([]); setCurrentCuadernoId(null);
    setView("login");
  }

  async function openCuaderno(id) {
    const c = await api.getCuaderno(id);
    setCuadernos(prev =>
      prev.some(x => x.id === id) ? prev.map(x => x.id === id ? c : x) : [...prev, c]
    );
    setCurrentCuadernoId(id);
    setView("gradebook");
  }

  async function handleSaveCuaderno(datos) {
    await api.saveCuaderno(currentCuadernoId, datos);
  }

  const currentCuaderno = cuadernos.find(c => c.id === currentCuadernoId);

  if (view === "loading") return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh",
      fontFamily:"'DM Sans',sans-serif", color:"#64748b", fontSize:15 }}>
      Cargando...
    </div>
  );

  if (view === "login") return <Login onLogin={handleLogin}/>;

  if (view === "dashboard") return (
    <Dashboard
      cuadernos={cuadernos} setCuadernos={setCuadernos}
      currentUser={currentUser}
      onOpenCuaderno={openCuaderno}
      onLogout={handleLogout}
    />
  );

  if (view === "gradebook" && currentCuaderno) return (
    <CuadernoCalificaciones
      key={currentCuadernoId}
      initialData={currentCuaderno.datos || {}}
      cuaderno={currentCuaderno}
      currentUser={{ ...currentUser, role: currentUser.rol }}
      onSave={handleSaveCuaderno}
      onBack={() => setView("dashboard")}
    />
  );

  return <Login onLogin={handleLogin}/>;
}
