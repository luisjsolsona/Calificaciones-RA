import { useState, useEffect } from "react";
import { loadStore, saveStore } from "./store.js";
import Login from "./Login.jsx";
import Dashboard from "./Dashboard.jsx";
import CuadernoCalificaciones from "./cuaderno-calificaciones.jsx";

export default function App() {
  const [store,            setStore]            = useState(() => loadStore());
  const [view,             setView]             = useState("login");
  const [currentCuadernoId, setCurrentCuadernoId] = useState(null);

  // Persistir store en localStorage en cada cambio
  useEffect(() => { saveStore(store); }, [store]);

  // Restaurar sesión al cargar
  useEffect(() => {
    if (store.session?.userId) setView("dashboard");
  }, []);

  const currentUser    = store.users.find(u => u.id === store.session?.userId) || null;
  const currentCuaderno = store.cuadernos.find(c => c.id === currentCuadernoId) || null;

  function handleLogin(userId) {
    setStore(prev => ({ ...prev, session:{ userId } }));
    setView("dashboard");
  }
  function handleLogout() {
    setStore(prev => ({ ...prev, session:null }));
    setView("login");
    setCurrentCuadernoId(null);
  }
  function openCuaderno(id) {
    setCurrentCuadernoId(id);
    setView("gradebook");
  }
  function handleSaveCuaderno(data) {
    setStore(prev => ({
      ...prev,
      cuadernos: prev.cuadernos.map(c => c.id === currentCuadernoId ? { ...c, data } : c),
    }));
  }
  function handleUpdateStore(updater) {
    setStore(prev => ({ ...prev, ...updater(prev) }));
  }

  if (view === "login" || !currentUser) {
    return <Login users={store.users} onLogin={handleLogin}/>;
  }
  if (view === "dashboard") {
    return (
      <Dashboard
        store={store}
        currentUser={currentUser}
        onOpenCuaderno={openCuaderno}
        onLogout={handleLogout}
        onUpdateStore={handleUpdateStore}
      />
    );
  }
  if (view === "gradebook" && currentCuaderno) {
    return (
      <CuadernoCalificaciones
        key={currentCuadernoId}
        initialData={currentCuaderno.data}
        cuaderno={currentCuaderno}
        currentUser={currentUser}
        allUsers={store.users}
        onSave={handleSaveCuaderno}
        onBack={() => setView("dashboard")}
      />
    );
  }
  return <Login users={store.users} onLogin={handleLogin}/>;
}
