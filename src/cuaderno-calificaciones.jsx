import { useState, useMemo, useRef, useEffect } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

const STORAGE_KEY = "cuaderno-ra-v1";

// ─── DATOS INICIALES ────────────────────────────────────────────────────────
const initAlumnos = [
  { id:1, nombre:"García López, Ana" },
  { id:2, nombre:"Martínez Ruiz, Carlos" },
  { id:3, nombre:"Sánchez Pérez, Elena" },
  { id:4, nombre:"Fernández Torres, David" },
  { id:5, nombre:"Rodríguez Gil, Marta" },
];
const initRAs = [
  { id:"RA1", titulo:"Resultado de Aprendizaje 1", descripcion:"Identifica los elementos de un sistema informático", peso:null, pctAct:40, pctExam:60 },
  { id:"RA2", titulo:"Resultado de Aprendizaje 2", descripcion:"Instala y configura software de base",               peso:null, pctAct:40, pctExam:60 },
  { id:"RA3", titulo:"Resultado de Aprendizaje 3", descripcion:"Gestiona información en sistemas de ficheros",       peso:null, pctAct:40, pctExam:60 },
  { id:"RA4", titulo:"Resultado de Aprendizaje 4", descripcion:"Realiza operaciones básicas de administración",      peso:null, pctAct:40, pctExam:60 },
];
const initUDs = [
  { id:"UD1", titulo:"Unidad 1", descripcion:"Hardware y componentes", ras:["RA1"] },
  { id:"UD2", titulo:"Unidad 2", descripcion:"Sistemas operativos",    ras:["RA2","RA3"] },
  { id:"UD3", titulo:"Unidad 3", descripcion:"Gestión de ficheros",    ras:["RA3"] },
  { id:"UD4", titulo:"Unidad 4", descripcion:"Administración básica",  ras:["RA4"] },
];
const initActividades = [
  { id:"A1", nombre:"Práctica Hardware", tipo:"actividad", ras:["RA1"],       ud:"UD1", peso:50, orden:0, notas:{} },
  { id:"A2", nombre:"Examen UD1",        tipo:"examen",    ras:["RA1"],       ud:"UD1", peso:50, orden:0, notas:{} },
  { id:"A3", nombre:"Instalación SO",    tipo:"actividad", ras:["RA2"],       ud:"UD2", peso:50, orden:0, notas:{} },
  { id:"A4", nombre:"Examen UD2-UD3",   tipo:"examen",    ras:["RA2","RA3"], ud:"UD2", peso:50, orden:0, notas:{} },
  { id:"A5", nombre:"Gestión ficheros",  tipo:"actividad", ras:["RA3"],       ud:"UD3", peso:50, orden:1, notas:{} },
  { id:"A6", nombre:"Práctica Admin",    tipo:"actividad", ras:["RA4"],       ud:"UD4", peso:50, orden:0, notas:{} },
  { id:"A7", nombre:"Examen final",      tipo:"examen",    ras:["RA4"],       ud:"UD4", peso:50, orden:1, notas:{} },
];
initActividades.forEach(act => {
  initAlumnos.forEach(al => { act.notas[al.id] = Math.floor(Math.random()*5)+5; });
});

// ─── ICONO ───────────────────────────────────────────────────────────────────
function NotebookIcon({ size=36 }) {
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

// ─── VALIDACIONES ────────────────────────────────────────────────────────────
function actividadProblemas(act) {
  const p = [];
  if (!act.nombre || !act.nombre.trim())                               p.push("sin nombre");
  if (!act.ras || act.ras.length === 0)                                p.push("sin RA");
  if (!act.ud)                                                         p.push("sin UD");
  if (act.peso === "" || act.peso === null || act.peso === undefined)   p.push("sin peso");
  return p;
}
const actividadIncompleta = act => actividadProblemas(act).length > 0;

function raProblemas(ra) {
  const p = [];
  if (!ra.titulo || !ra.titulo.trim()) p.push("sin título");
  return p;
}
function udProblemas(ud) {
  const p = [];
  if (!ud.titulo || !ud.titulo.trim()) p.push("sin título");
  if (!ud.ras || ud.ras.length === 0)  p.push("sin RA asociado");
  return p;
}

// ─── PANEL IMPORTAR ───────────────────────────────────────────────────────────
function ImportPanel({ placeholder, onImport, onClose }) {
  const [text, setText]         = useState("");
  const [mode, setMode]         = useState("append");
  const [justPasted, setJustPasted] = useState(false);
  const fileRef = useRef(null);

  function handlePaste(e) {
    const pasted = e.clipboardData.getData("text");
    setText(pasted);
    setJustPasted(true);
    e.preventDefault();
  }
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    new FileReader().onload = ev => { setText(ev.target.result); setJustPasted(false); };
    const reader = new FileReader();
    reader.onload = ev => { setText(ev.target.result); setJustPasted(false); };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div style={{ background:"#f8fafc", border:"1px solid #e2e8f0", borderRadius:10, padding:14, display:"flex", flexDirection:"column", gap:10 }}>
      <div style={{ display:"flex", gap:16, alignItems:"center", flexWrap:"wrap" }}>
        <span style={{ color:"#64748b", fontSize:12, fontWeight:600 }}>Modo:</span>
        {[["append","Añadir a existentes"],["replace","Reemplazar todo"]].map(([m,l]) => (
          <label key={m} style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, cursor:"pointer" }}>
            <input type="radio" checked={mode===m} onChange={()=>setMode(m)} style={{ accentColor:"#4f46e5" }}/>
            <span style={{ color:"#334155" }}>{l}</span>
          </label>
        ))}
        {justPasted && <span style={{ color:"#059669", fontSize:12, fontWeight:600 }}>✓ Pegado — listo para importar</span>}
      </div>
      <textarea value={text} onChange={e=>{setText(e.target.value);setJustPasted(false);}}
        onPaste={handlePaste} placeholder={placeholder} rows={7}
        style={{ ...IS, fontFamily:"monospace", fontSize:12, resize:"vertical", lineHeight:1.6 }}/>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        <button onClick={()=>{ if(text.trim()){onImport(text,mode);onClose();} }} disabled={!text.trim()}
          style={{ ...BS, opacity:text.trim()?1:0.5 }}>↑ Importar</button>
        <label style={{ ...OB, cursor:"pointer" }}>
          📁 Desde archivo
          <input ref={fileRef} type="file" accept=".json,.txt,.csv" onChange={handleFile} style={{ display:"none" }}/>
        </label>
        <button onClick={onClose} style={OB}>Cancelar</button>
      </div>
    </div>
  );
}

// ─── PANEL EDITAR ACTIVIDAD (fuera del árbol para evitar remounts) ────────────
function EditActPanel({ act, ras, uds, onUpdate, onClose, onRemove }) {
  if (!act) return null;
  const prob = actividadProblemas(act);
  const red  = c => ({ ...IS, border:`1px solid ${c?"#fca5a5":IS.border}` });
  return (
    <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:12, padding:16, marginTop:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)" }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, flexWrap:"wrap" }}>
        <span style={{ fontWeight:700, color:"#92400e", fontSize:14 }}>✏ Editando actividad</span>
        {prob.length>0 && (
          <span style={{ color:"#dc2626", fontSize:12, background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:6, padding:"2px 10px" }}>
            ⚠ {prob.join(" · ")}
          </span>
        )}
        <div style={{ flex:1 }}/>
        <button onClick={onClose} style={OB}>✕ Cerrar</button>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:8, marginBottom:12 }}>
        <input value={act.nombre} onChange={e=>onUpdate({nombre:e.target.value})}
          placeholder="Nombre *" autoFocus style={red(!act.nombre)}/>
        <select value={act.tipo} onChange={e=>onUpdate({tipo:e.target.value})} style={IS}>
          <option value="actividad">📋 Actividad</option>
          <option value="examen">📄 Examen</option>
        </select>
        <select value={act.ud} onChange={e=>onUpdate({ud:e.target.value})} style={red(!act.ud)}>
          <option value="">-- UD * --</option>
          {uds.map(u=><option key={u.id} value={u.id}>{u.id} — {u.titulo}</option>)}
        </select>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <input type="number" min={0} max={100}
            value={act.peso??""} onChange={e=>onUpdate({peso:e.target.value===""?null:Number(e.target.value)})}
            placeholder="Peso *" style={red(act.peso===null||act.peso===undefined||act.peso==="")}/>
          <span style={{ color:"#64748b", fontSize:11 }}>%</span>
        </div>
      </div>
      <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
        <span style={{ color:"#64748b", fontSize:12, fontWeight:600 }}>RAs *:</span>
        {ras.map(ra=>(
          <label key={ra.id} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
            <input type="checkbox" checked={act.ras.includes(ra.id)}
              onChange={e=>onUpdate({ras:e.target.checked?[...act.ras,ra.id]:act.ras.filter(r=>r!==ra.id)})}
              style={{ accentColor:"#4f46e5" }}/>
            <span style={{ color:"#334155", fontSize:12 }}>{ra.id}</span>
          </label>
        ))}
        {(!act.ras||act.ras.length===0)&&<span style={{ color:"#dc2626", fontSize:11 }}>⚠ obligatorio</span>}
        <div style={{ flex:1 }}/>
        <button onClick={onRemove} style={{ ...DB, fontSize:12 }}>🗑 Eliminar</button>
        <button onClick={onClose} style={{ ...BS, background:"#059669" }}>✓ Hecho</button>
      </div>
    </div>
  );
}

// ─── UTILIDADES ──────────────────────────────────────────────────────────────
function downloadJSON(data, name) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type:"application/json" });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement("a"), { href:url, download:`${name}-${new Date().toISOString().slice(0,10)}.json` });
  a.click(); URL.revokeObjectURL(url);
}
function calcPesosRA(ras) {
  const custom = ras.filter(r=>r.peso!==null&&r.peso!=="");
  if (custom.length===ras.length) {
    const total = custom.reduce((s,r)=>s+Number(r.peso),0);
    return Object.fromEntries(ras.map(r=>[r.id,Number(r.peso)/total]));
  }
  return Object.fromEntries(ras.map(r=>[r.id,1/ras.length]));
}
function mediaGrupo(grupo, alumnoId) {
  const v = grupo.filter(a=>a.notas[alumnoId]!==""&&!isNaN(Number(a.notas[alumnoId])));
  if (!v.length) return null;
  const pt = v.reduce((s,a)=>s+Number(a.peso),0);
  if (!pt) return null;
  return v.reduce((s,a)=>s+Number(a.notas[alumnoId])*Number(a.peso),0)/pt;
}
function calcNotaRA(ra, alumnoId, actividades) {
  const acts  = actividades.filter(a=>a.ras.includes(ra.id)&&a.tipo==="actividad");
  const exams = actividades.filter(a=>a.ras.includes(ra.id)&&a.tipo==="examen");
  const mAct  = mediaGrupo(acts, alumnoId);
  const mExam = mediaGrupo(exams, alumnoId);
  const pAct  = (ra.pctAct??40)/100;
  const pExam = (ra.pctExam??60)/100;
  if (mAct===null&&mExam===null) return null;
  if (mAct===null) return mExam;
  if (mExam===null) return mAct;
  return mAct*pAct + mExam*pExam;
}
function calcNotaFinal(alumnoId, ras, actividades) {
  const pesos = calcPesosRA(ras);
  let total=0, pu=0;
  ras.forEach(ra=>{ const n=calcNotaRA(ra,alumnoId,actividades); if(n!==null){total+=n*pesos[ra.id];pu+=pesos[ra.id];} });
  return pu>0?total/pu:null;
}
function notaColor(n) {
  if (n===null||n===undefined||n===""||isNaN(Number(n))) return "#94a3b8";
  n=Number(n);
  if (n>=9) return "#059669";
  if (n>=7) return "#2563eb";
  if (n>=5) return "#d97706";
  return "#dc2626";
}
function notaBadge(n, size="sm") {
  const color = notaColor(n);
  const val = (n===null||n===undefined||n===""||isNaN(Number(n)))?"—":Number(n).toFixed(1);
  return <span style={{ display:"inline-block", borderRadius:5, minWidth:36, textAlign:"center", backgroundColor:color+"18", color, border:`1px solid ${color}44`, padding:size==="lg"?"6px 16px":"2px 8px", fontSize:size==="lg"?18:12, fontWeight:600 }}>{val}</span>;
}
function tipoBadge(tipo) {
  const e=tipo==="examen";
  return <span style={{ fontSize:10, padding:"2px 8px", borderRadius:99, background:e?"#f5f3ff":"#ecfeff", color:e?"#7c3aed":"#0891b2", border:`1px solid ${e?"#ddd6fe":"#a5f3fc"}` }}>{e?"Examen":"Actividad"}</span>;
}

// ─── PARSE HELPERS ────────────────────────────────────────────────────────────
function parseSemicolonLine(line) { return line.split(";").map(s=>s.trim()); }

// ─── RA CARD (fuera del padre → estado local sobrevive re-renders) ────────────
function RACard({ ra, pesosPct, onUpdate, onRemove }) {
  const prob = raProblemas(ra);
  const inc  = prob.length > 0;
  const [titulo,      setTitulo]      = useState(ra.titulo);
  const [descripcion, setDescripcion] = useState(ra.descripcion);
  const [pctAct,      setPctAct]      = useState(ra.pctAct ?? 40);
  const [pctExam,     setPctExam]     = useState(ra.pctExam ?? 60);
  // Sincronizar si el prop cambia desde fuera (tras guardar desde otro origen)
  useEffect(() => setTitulo(ra.titulo),           [ra.titulo]);
  useEffect(() => setDescripcion(ra.descripcion), [ra.descripcion]);
  useEffect(() => { setPctAct(ra.pctAct??40); setPctExam(ra.pctExam??60); }, [ra.pctAct, ra.pctExam]);

  function changePct(field, raw) {
    const n = Math.min(100, Math.max(0, Number(raw)||0));
    if (field === "act") { setPctAct(n); setPctExam(100-n); onUpdate({ pctAct:n, pctExam:100-n }); }
    else                 { setPctExam(n); setPctAct(100-n); onUpdate({ pctExam:n, pctAct:100-n }); }
  }

  return (
    <div style={{ background:inc?"#fef2f2":"#fff", border:`1px solid ${inc?"#fca5a5":"#e2e8f0"}`, borderRadius:12, padding:16, boxShadow:SH }}>
      {inc && <div style={{ color:"#dc2626", fontSize:12, fontWeight:600, marginBottom:10 }}>⚠ {prob.join(" · ")}</div>}
      <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
        <span style={{ background:"#4f46e5", color:"#fff", borderRadius:6, padding:"2px 10px", fontWeight:700, fontSize:13, flexShrink:0 }}>{ra.id}</span>
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
          <input value={titulo} onChange={e=>setTitulo(e.target.value)}
            onBlur={()=>onUpdate({ titulo })}
            placeholder="Título *"
            style={{ ...IS, border:!titulo?"1px solid #fca5a5":IS.border }}/>
          <input value={descripcion} onChange={e=>setDescripcion(e.target.value)}
            onBlur={()=>onUpdate({ descripcion })}
            placeholder="Descripción" style={{ ...IS, fontSize:12 }}/>
        </div>
        <div style={{ textAlign:"center", flexShrink:0 }}>
          <label style={{ color:"#64748b", fontSize:11, display:"block", marginBottom:4 }}>Peso RA (%)</label>
          <input type="number" min={0} max={100} defaultValue={ra.peso??""} placeholder="Auto"
            onBlur={e=>onUpdate({ peso:e.target.value===""?null:e.target.value })}
            style={{ ...IS, width:72, textAlign:"center" }}/>
          <div style={{ color:"#4f46e5", fontSize:11, marginTop:4 }}>{(pesosPct[ra.id]*100).toFixed(1)}%</div>
        </div>
        <button onClick={onRemove} style={{ ...DB, alignSelf:"flex-start" }}>✕</button>
      </div>
      <div style={{ height:3, background:"#f1f5f9", borderRadius:4, margin:"12px 0 14px", overflow:"hidden" }}>
        <div style={{ width:`${pesosPct[ra.id]*100}%`, height:"100%", background:"#4f46e5", transition:"width .4s" }}/>
      </div>
      <div style={{ display:"flex", gap:14, alignItems:"center", flexWrap:"wrap" }}>
        <span style={{ color:"#64748b", fontSize:12 }}>Ponderación nota RA:</span>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ color:"#0891b2", fontSize:12 }}>📋 Actividades</span>
          <input type="number" min={0} max={100} value={pctAct}
            onChange={e=>{ const n=Math.min(100,Math.max(0,Number(e.target.value)||0)); setPctAct(n); setPctExam(100-n); }}
            onBlur={()=>onUpdate({ pctAct, pctExam })}
            style={{ ...IS, width:58, padding:"4px 8px", textAlign:"center" }}/>
          <span style={{ color:"#64748b", fontSize:12 }}>%</span>
        </div>
        <span style={{ color:"#cbd5e1" }}>+</span>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          <span style={{ color:"#7c3aed", fontSize:12 }}>📄 Exámenes</span>
          <input type="number" min={0} max={100} value={pctExam}
            onChange={e=>{ const n=Math.min(100,Math.max(0,Number(e.target.value)||0)); setPctExam(n); setPctAct(100-n); }}
            onBlur={()=>onUpdate({ pctAct, pctExam })}
            style={{ ...IS, width:58, padding:"4px 8px", textAlign:"center" }}/>
          <span style={{ color:"#64748b", fontSize:12 }}>%</span>
        </div>
        <div style={{ flex:1, minWidth:100, height:8, background:"#f1f5f9", borderRadius:4, overflow:"hidden", display:"flex" }}>
          <div style={{ width:`${pctAct}%`, background:"#0891b2", transition:"width .3s" }}/>
          <div style={{ width:`${pctExam}%`, background:"#7c3aed", transition:"width .3s" }}/>
        </div>
        {pctAct+pctExam!==100 && <span style={{ color:"#dc2626", fontSize:11 }}>⚠ Suma {pctAct+pctExam}%</span>}
      </div>
    </div>
  );
}

// ─── UD CARD (fuera del padre → estado local sobrevive re-renders) ────────────
function UDCard({ ud, onUpdate, onRemove }) {
  const prob = udProblemas(ud);
  const inc  = prob.length > 0;
  const [titulo,      setTitulo]      = useState(ud.titulo);
  const [descripcion, setDescripcion] = useState(ud.descripcion);
  useEffect(() => setTitulo(ud.titulo),           [ud.titulo]);
  useEffect(() => setDescripcion(ud.descripcion), [ud.descripcion]);

  return (
    <div style={{ display:"flex", gap:10, alignItems:"center", background:inc?"#fef2f2":"#fff", border:`1px solid ${inc?"#fca5a5":"#e2e8f0"}`, borderRadius:10, padding:"10px 12px" }}>
      <span style={{ color:"#4f46e5", fontWeight:700, fontSize:13, flexShrink:0 }}>{ud.id}</span>
      {inc && <span style={{ color:"#dc2626", fontSize:11, flexShrink:0 }}>⚠ {prob.join(" · ")}</span>}
      <input value={titulo} onChange={e=>setTitulo(e.target.value)}
        onBlur={()=>onUpdate({ titulo })}
        placeholder="Título *"
        style={{ ...IS, flex:1, border:!titulo?"1px solid #fca5a5":IS.border }}/>
      <input value={descripcion} onChange={e=>setDescripcion(e.target.value)}
        onBlur={()=>onUpdate({ descripcion })}
        placeholder="Descripción" style={{ ...IS, flex:2, fontSize:12 }}/>
      <button onClick={onRemove} style={DB}>✕</button>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function CuadernoCalificaciones({
  initialData,   // { alumnos, ras, uds, actividades }
  onSave,        // callback(data) — cuando se usan props externas
  currentUser,   // { id, nombre, role, alumnoNombre? }
  cuaderno,      // { id, titulo, descripcion, modulo, curso, color }
  onBack,        // callback() — volver al dashboard
  allUsers,      // todos los usuarios (para admin)
} = {}) {
  const role     = currentUser?.role || "admin";
  const readOnly = role === "alumno";

  const [tab, setTab]                 = useState("resumen");
  const [alumnos, setAlumnos]         = useState(initialData?.alumnos     || initAlumnos);
  const [ras, setRAs]                 = useState(initialData?.ras         || initRAs);
  const [uds, setUDs]                 = useState(initialData?.uds         || initUDs);
  const [actividades, setActividades] = useState(initialData?.actividades || initActividades);
  const [alumnoSel, setAlumnoSel]     = useState(null);
  const [editingNota, setEditingNota] = useState(null);
  const [nuevoAlumno, setNuevoAlumno] = useState("");
  const [newAct, setNewAct]           = useState({ nombre:"", tipo:"actividad", ras:[], ud:"", peso:50 });
  const [initialized, setInitialized] = useState(false);

  // panel imports
  const [showImportAlumnos, setShowImportAlumnos] = useState(false);
  const [showImportRAs,     setShowImportRAs]     = useState(false);
  const [showImportUDs,     setShowImportUDs]     = useState(false);
  const [showImportActs,    setShowImportActs]    = useState(false);

  // editing states en el padre para evitar remounts
  const [editingActId,    setEditingActId]    = useState(null);
  const [editingAlumnoId, setEditingAlumnoId] = useState(null);

  const saveTimerRef    = useRef(null);
  const savedIndicator  = useRef(null);
  const savedFadeTimer  = useRef(null);
  const fileInputRef    = useRef(null);

  // ── Persistencia ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialData) { setInitialized(true); return; } // datos vienen de props
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");
      if (d.alumnos)     setAlumnos(d.alumnos);
      if (d.ras)         setRAs(d.ras);
      if (d.uds)         setUDs(d.uds);
      if (d.actividades) setActividades(d.actividades);
    } catch(_) {}
    setInitialized(true);
  }, []);

  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!initialized) return;
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      const data = { alumnos, ras, uds, actividades };
      try {
        if (onSaveRef.current) {
          onSaveRef.current(data); // modo multi-cuaderno
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); // modo standalone
        }
        if (savedIndicator.current) {
          savedIndicator.current.style.opacity = "1";
          clearTimeout(savedFadeTimer.current);
          savedFadeTimer.current = setTimeout(() => {
            if (savedIndicator.current) savedIndicator.current.style.opacity = "0";
          }, 2000);
        }
      } catch(_) {}
    }, 800);
    return () => clearTimeout(saveTimerRef.current);
  }, [alumnos, ras, uds, actividades, initialized]);

  // ── Auto-navegación alumno ────────────────────────────────────────────────
  useEffect(() => {
    if (role === "alumno" && currentUser?.alumnoNombre) {
      const al = alumnos.find(a => a.nombre === currentUser.alumnoNombre);
      if (al) { setAlumnoSel(al.id); setTab("alumno"); }
      else      setTab("resumen");
    }
  }, []);

  // ── Backup global ─────────────────────────────────────────────────────────
  function exportTodo() { downloadJSON({ alumnos, ras, uds, actividades }, "cuaderno-ra"); }
  function importTodo(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const d = JSON.parse(ev.target.result);
        if (d.alumnos)     setAlumnos(d.alumnos);
        if (d.ras)         setRAs(d.ras);
        if (d.uds)         setUDs(d.uds);
        if (d.actividades) setActividades(d.actividades);
      } catch(_) { alert("Archivo inválido"); }
    };
    reader.readAsText(file); e.target.value="";
  }

  // ── Import handlers ───────────────────────────────────────────────────────
  function handleImportAlumnos(text, mode) {
    const t = text.trim();
    let items = [];
    if (t.startsWith("[")) {
      try { items = JSON.parse(t).filter(x=>x.nombre).map(x=>({ nombre:String(x.nombre).trim() })); }
      catch(_) { alert("JSON inválido"); return; }
    } else {
      items = t.split("\n").map(l=>l.trim()).filter(Boolean).map(nombre=>({ nombre }));
    }
    if (mode==="replace") {
      setAlumnos(items.map((x,i)=>({ id:i+1, nombre:x.nombre })));
    } else {
      setAlumnos(prev => {
        const ex = new Set(prev.map(a=>a.nombre));
        const maxId = prev.length ? Math.max(...prev.map(a=>a.id)) : 0;
        return [...prev, ...items.filter(x=>!ex.has(x.nombre)).map((x,i)=>({ id:maxId+i+1, nombre:x.nombre }))];
      });
    }
  }

  function handleImportRAs(text, mode) {
    const t = text.trim();
    let items = [];
    if (t.startsWith("[")) {
      try {
        items = JSON.parse(t).map(r=>({ id:r.id||`RA_${Date.now()}`, titulo:r.titulo||"", descripcion:r.descripcion||"", peso:r.peso??null, pctAct:r.pctAct??40, pctExam:r.pctExam??60 }));
      } catch(_) { alert("JSON inválido"); return; }
    } else {
      let idx = ras.length+1;
      items = t.split("\n").map(l=>l.trim()).filter(Boolean).map(line=>{
        const p = parseSemicolonLine(line);
        let id, titulo, descripcion, pesoRaw, pctActRaw, pctExamRaw;
        if (/^RA\d+$/i.test(p[0])) { [id,titulo,descripcion,pesoRaw,pctActRaw,pctExamRaw]=p; }
        else                        { id=`RA${idx++}`; [titulo,descripcion,pesoRaw,pctActRaw,pctExamRaw]=p; }
        return {
          id: id||`RA${idx}`,
          titulo: titulo||"",
          descripcion: descripcion||"",
          peso: pesoRaw ? (Number(pesoRaw.replace("%",""))||null) : null,
          pctAct:  pctActRaw  ? (Number(pctActRaw.replace("%","")) ||40) : 40,
          pctExam: pctExamRaw ? (Number(pctExamRaw.replace("%",""))||60) : 60,
        };
      });
    }
    if (mode==="replace") { setRAs(items); }
    else { setRAs(prev=>{ const ids=new Set(prev.map(r=>r.id)); return [...prev,...items.filter(r=>!ids.has(r.id))]; }); }
  }

  function handleImportUDs(text, mode) {
    const t = text.trim();
    let items = [];
    if (t.startsWith("[")) {
      try {
        items = JSON.parse(t).map(u=>({ id:u.id||`UD_${Date.now()}`, titulo:u.titulo||"", descripcion:u.descripcion||"", ras:Array.isArray(u.ras)?u.ras:[] }));
      } catch(_) { alert("JSON inválido"); return; }
    } else {
      let idx = uds.length+1;
      items = t.split("\n").map(l=>l.trim()).filter(Boolean).map(line=>{
        const p = parseSemicolonLine(line);
        let id, titulo, descripcion, rasRaw;
        if (/^UD\d+$/i.test(p[0])) { [id,titulo,descripcion,rasRaw]=p; }
        else                        { id=`UD${idx++}`; [titulo,descripcion,rasRaw]=p; }
        return {
          id: id||`UD${idx}`,
          titulo: titulo||"",
          descripcion: descripcion||"",
          ras: rasRaw ? rasRaw.split(",").map(r=>r.trim()).filter(Boolean) : [],
        };
      });
    }
    if (mode==="replace") { setUDs(items); }
    else { setUDs(prev=>{ const ids=new Set(prev.map(u=>u.id)); return [...prev,...items.filter(u=>!ids.has(u.id))]; }); }
  }

  function handleImportActividades(text, mode) {
    const t = text.trim();
    const notas0 = () => Object.fromEntries(alumnos.map(a=>[a.id,""]));
    let items = [];
    if (t.startsWith("[")) {
      try {
        items = JSON.parse(t).map(a=>({
          id:a.id||"A"+Date.now()+Math.random(),
          nombre:a.nombre||"", tipo:a.tipo||"actividad",
          ras:Array.isArray(a.ras)?a.ras:[],
          ud:a.ud||"",
          peso:a.peso??null,
          orden:a.orden??0,
          notas:{ ...notas0(), ...(a.notas||{}) },
        }));
      } catch(_) { alert("JSON inválido"); return; }
    } else {
      items = t.split("\n").map(l=>l.trim()).filter(Boolean).map(line=>{
        const [nombre="",tipoRaw="",rasRaw="",ud="",pesoRaw=""] = parseSemicolonLine(line);
        const tipo  = tipoRaw.toLowerCase().startsWith("ex") ? "examen" : "actividad";
        const rasArr = rasRaw ? rasRaw.split(",").map(r=>r.trim()).filter(Boolean) : [];
        const pesoN  = pesoRaw ? Number(pesoRaw.replace("%","").trim()) : null;
        return { id:"A"+Date.now()+Math.random(), nombre, tipo, ras:rasArr, ud, peso:isNaN(pesoN)?null:pesoN, orden:0, notas:notas0() };
      });
    }
    if (mode==="replace") { setActividades(items); }
    else { setActividades(prev=>{ const ids=new Set(prev.map(a=>a.id)); return [...prev,...items.filter(a=>!ids.has(a.id))]; }); }
  }

  // ── Operaciones básicas ───────────────────────────────────────────────────
  const allTabs = [
    { id:"resumen",     label:"📊 Resumen" },
    { id:"alumnos",     label:"👥 Alumnos" },
    { id:"ras",         label:"🎯 RAs" },
    { id:"uds",         label:"📚 UDs" },
    { id:"actividades", label:"📝 Actividades" },
    { id:"alumno",      label:"🔍 Por alumno" },
  ];
  // Alumno solo ve Resumen y su ficha
  const tabs = readOnly ? allTabs.filter(t => t.id==="resumen" || t.id==="alumno") : allTabs;

  function saveNota(actId, alumnoId, val) {
    setActividades(prev=>prev.map(a=>a.id===actId?{...a,notas:{...a.notas,[alumnoId]:val===""?"":Number(val)}}:a));
    setEditingNota(null);
  }
  function addAlumno() {
    if (!nuevoAlumno.trim()) return;
    const id = alumnos.length ? Math.max(...alumnos.map(a=>a.id))+1 : 1;
    setAlumnos(prev=>[...prev,{ id, nombre:nuevoAlumno.trim() }]);
    setNuevoAlumno("");
  }
  function addActividad() {
    if (!newAct.nombre.trim()||!newAct.ras.length) return;
    const id="A"+Date.now(), notas={};
    alumnos.forEach(a=>{notas[a.id]="";});
    const orden=actividades.filter(a=>a.ras.some(r=>newAct.ras.includes(r))&&a.tipo===newAct.tipo).length;
    setActividades(prev=>[...prev,{...newAct,id,orden,notas}]);
    setNewAct({ nombre:"", tipo:"actividad", ras:[], ud:"", peso:50 });
  }
  function removeAlumno(id)    { setAlumnos(prev=>prev.filter(a=>a.id!==id)); }
  function removeActividad(id) { setActividades(prev=>prev.filter(a=>a.id!==id)); if(editingActId===id) setEditingActId(null); }
  function updateActividad(id, fields) { setActividades(prev=>prev.map(a=>a.id===id?{...a,...fields}:a)); }
  function removeRA(raId) {
    setRAs(prev=>prev.filter(r=>r.id!==raId));
    setUDs(prev=>prev.map(u=>({...u,ras:u.ras.filter(r=>r!==raId)})));
    setActividades(prev=>prev.map(a=>({...a,ras:a.ras.filter(r=>r!==raId)})));
  }
  function removeUD(udId) {
    setUDs(prev=>prev.filter(u=>u.id!==udId));
    setActividades(prev=>prev.map(a=>({...a,ud:a.ud===udId?"":a.ud})));
  }
  const pesos = useMemo(()=>calcPesosRA(ras),[ras]);

  // ── RESUMEN ──────────────────────────────────────────────────────────────
  function TabResumen() {
    const data = alumnos.map(al=>({ nombre:al.nombre.split(",")[0], nota:calcNotaFinal(al.id,ras,actividades) }));
    const dist = [
      { label:"< 5",   count:data.filter(d=>d.nota!==null&&d.nota<5).length,             color:"#dc2626" },
      { label:"5–6.9", count:data.filter(d=>d.nota!==null&&d.nota>=5&&d.nota<7).length,  color:"#d97706" },
      { label:"7–8.9", count:data.filter(d=>d.nota!==null&&d.nota>=7&&d.nota<9).length,  color:"#2563eb" },
      { label:"≥ 9",   count:data.filter(d=>d.nota!==null&&d.nota>=9).length,            color:"#059669" },
    ];
    const raData = ras.map(ra=>({
      ra:ra.id,
      media:(()=>{ const ns=alumnos.map(al=>calcNotaRA(ra,al.id,actividades)).filter(n=>n!==null); return ns.length?ns.reduce((s,n)=>s+n,0)/ns.length:0; })(),
    }));
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
          {[
            { label:"Alumnos",    val:alumnos.length, icon:"👥" },
            { label:"Actividades",val:actividades.length, icon:"📝" },
            { label:"Media clase",val:(()=>{ const ns=alumnos.map(al=>calcNotaFinal(al.id,ras,actividades)).filter(n=>n!==null); return ns.length?(ns.reduce((s,n)=>s+n,0)/ns.length).toFixed(2):"—";})(), icon:"📊" },
            { label:"Aprobados",  val:alumnos.filter(al=>{ const n=calcNotaFinal(al.id,ras,actividades); return n!==null&&n>=5; }).length+"/"+alumnos.length, icon:"✅" },
          ].map(c=>(
            <div key={c.label} style={{ background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:12, padding:16, boxShadow:SH }}>
              <div style={{ fontSize:24 }}>{c.icon}</div>
              <div style={{ color:"#64748b", fontSize:12, marginTop:4 }}>{c.label}</div>
              <div style={{ color:"#0f172a", fontSize:22, fontWeight:700 }}>{c.val}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:12, padding:16, boxShadow:SH }}>
            <h3 style={SL}>Calificaciones finales</h3>
            {data.map(d=>(
              <div key={d.nombre} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ color:"#334155", fontSize:13, flex:1 }}>{d.nombre}</span>
                <div style={{ flex:3, height:6, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ width:`${d.nota?d.nota*10:0}%`, height:"100%", background:notaColor(d.nota), borderRadius:4, transition:"width .6s" }}/>
                </div>
                {notaBadge(d.nota)}
              </div>
            ))}
          </div>
          <div style={{ background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:12, padding:16, boxShadow:SH }}>
            <h3 style={SL}>Distribución</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dist} barSize={28}>
                <XAxis dataKey="label" tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false}/>
                <YAxis allowDecimals={false} tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:8 }}/>
                <Bar dataKey="count" radius={[4,4,0,0]}>{dist.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div style={{ background:"#ffffff", border:"1px solid #e2e8f0", borderRadius:12, padding:16, boxShadow:SH }}>
          <h3 style={SL}>Media de clase por RA</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={raData} barSize={32}>
              <XAxis dataKey="ra" tick={{ fill:"#64748b", fontSize:12 }} axisLine={false} tickLine={false}/>
              <YAxis domain={[0,10]} tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:8 }} formatter={v=>v.toFixed(2)}/>
              <Bar dataKey="media" radius={[4,4,0,0]} fill="#4f46e5"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid #e2e8f0", boxShadow:SH }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#f1f5f9" }}>
                <th style={TH}>Alumno</th>
                {ras.map(ra=><th key={ra.id} style={TH}>{ra.id}</th>)}
                <th style={{ ...TH, color:"#4f46e5" }}>Final</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((al,i)=>(
                <tr key={al.id} style={{ background:i%2===0?"#fff":"#f8fafc", cursor:"pointer" }}
                  onClick={()=>{ setAlumnoSel(al.id); setTab("alumno"); }}>
                  <td style={TD}>{al.nombre}</td>
                  {ras.map(ra=><td key={ra.id} style={{ ...TD, textAlign:"center" }}>{notaBadge(calcNotaRA(ra,al.id,actividades))}</td>)}
                  <td style={{ ...TD, textAlign:"center" }}>{notaBadge(calcNotaFinal(al.id,ras,actividades))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── ALUMNOS ──────────────────────────────────────────────────────────────
  function TabAlumnos() {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", justifyContent:"space-between" }}>
          <div style={{ display:"flex", gap:8, flex:1 }}>
            <input value={nuevoAlumno} onChange={e=>setNuevoAlumno(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&addAlumno()} placeholder="Apellidos, Nombre" style={IS}/>
            <button onClick={addAlumno} style={BS}>+ Añadir</button>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>downloadJSON(alumnos,"alumnos")} style={OB}>↓ Exportar</button>
            <button onClick={()=>setShowImportAlumnos(v=>!v)} style={showImportAlumnos?BS:OB}>↑ Importar</button>
          </div>
        </div>
        {showImportAlumnos && (
          <ImportPanel
            placeholder={"Un nombre por línea:\n  García López, Ana\n  Martínez Ruiz, Carlos\n\nO JSON:\n  [{\"nombre\": \"García López, Ana\"}, ...]"}
            onImport={handleImportAlumnos}
            onClose={()=>setShowImportAlumnos(false)}
          />
        )}
        <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid #e2e8f0", boxShadow:SH }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:"#f1f5f9" }}>
              <th style={TH}>#</th><th style={{ ...TH, textAlign:"left" }}>Nombre</th><th style={TH}>Nota final</th><th style={TH}>Acciones</th>
            </tr></thead>
            <tbody>
              {alumnos.map((al,i)=>(
                <tr key={al.id} style={{ background:i%2===0?"#fff":"#f8fafc" }}>
                  <td style={{ ...TD, color:"#94a3b8" }}>{i+1}</td>
                  <td style={TD}>
                    {editingAlumnoId===al.id ? (
                      <input
                        defaultValue={al.nombre}
                        autoFocus
                        placeholder="Apellidos, Nombre"
                        style={{ ...IS, padding:"4px 8px", fontSize:13 }}
                        onBlur={e=>{ setAlumnos(prev=>prev.map(a=>a.id===al.id?{...a,nombre:e.target.value.trim()||a.nombre}:a)); setEditingAlumnoId(null); }}
                        onKeyDown={e=>{
                          if (e.key==="Enter") { setAlumnos(prev=>prev.map(a=>a.id===al.id?{...a,nombre:e.target.value.trim()||a.nombre}:a)); setEditingAlumnoId(null); }
                          if (e.key==="Escape") setEditingAlumnoId(null);
                        }}
                      />
                    ) : (
                      <span
                        onClick={()=>{ setAlumnoSel(al.id); setTab("alumno"); }}
                        title="Ver ficha del alumno"
                        style={{ cursor:"pointer", color:"#4f46e5", fontWeight:500, textDecoration:"underline dotted" }}>
                        {al.nombre}
                      </span>
                    )}
                  </td>
                  <td style={{ ...TD, textAlign:"center" }}>{notaBadge(calcNotaFinal(al.id,ras,actividades))}</td>
                  <td style={{ ...TD, textAlign:"center" }}>
                    <button onClick={()=>setEditingAlumnoId(al.id===editingAlumnoId?null:al.id)} style={{ ...LB, border:"1px solid #e2e8f0", borderRadius:6, padding:"3px 10px", marginRight:6, fontWeight:500, color:editingAlumnoId===al.id?"#4f46e5":"#475569" }}>
                      {editingAlumnoId===al.id?"✓ Hecho":"✏ Editar"}
                    </button>
                    <button onClick={()=>removeAlumno(al.id)} style={DB}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ── RAs ──────────────────────────────────────────────────────────────────
  function TabRAs() {
    const pesosPct = useMemo(()=>calcPesosRA(ras),[ras]);
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
          <p style={{ color:"#64748b", fontSize:13, margin:0 }}>Peso vacío → distribución automática proporcional.</p>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={()=>downloadJSON(ras,"ras")} style={OB}>↓ Exportar</button>
            <button onClick={()=>setShowImportRAs(v=>!v)} style={showImportRAs?BS:OB}>↑ Importar</button>
          </div>
        </div>
        {showImportRAs && (
          <ImportPanel
            placeholder={"Texto plano separado por ; (una por línea):\n  RA1; Resultado de Aprendizaje 1; Descripción; ; 40; 60\n  Resultado de Aprendizaje 2; Descripción  ← id se genera automáticamente\n  (id; título; descripción; peso%; %actividades; %exámenes)\n\nO JSON:\n  [{\"id\":\"RA1\",\"titulo\":\"...\",\"pctAct\":40,\"pctExam\":60}]"}
            onImport={handleImportRAs}
            onClose={()=>setShowImportRAs(false)}
          />
        )}
        {ras.map(ra=>(
          <RACard key={ra.id} ra={ra} pesosPct={pesosPct}
            onUpdate={fields=>setRAs(prev=>prev.map(r=>r.id===ra.id?{...r,...fields}:r))}
            onRemove={()=>removeRA(ra.id)}/>
        ))}
        <button onClick={()=>{ const id="RA"+(ras.length+1); setRAs(prev=>[...prev,{id,titulo:"",descripcion:"",peso:null,pctAct:40,pctExam:60}]); }} style={BS}>+ Añadir RA</button>
      </div>
    );
  }

  // ── UDs ──────────────────────────────────────────────────────────────────
  function TabUDs() {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ display:"flex", justifyContent:"flex-end", gap:8 }}>
          <button onClick={()=>downloadJSON(uds,"uds")} style={OB}>↓ Exportar</button>
          <button onClick={()=>setShowImportUDs(v=>!v)} style={showImportUDs?BS:OB}>↑ Importar</button>
        </div>
        {showImportUDs && (
          <ImportPanel
            placeholder={"Texto plano separado por ; (una por línea):\n  UD1; Unidad 1; Hardware y componentes; RA1,RA2\n  Unidad 2; Sistemas operativos; RA2,RA3  ← id se genera automáticamente\n  (id; título; descripción; RAs separadas por coma)\n\nO JSON:\n  [{\"id\":\"UD1\",\"titulo\":\"...\",\"ras\":[\"RA1\"]}]"}
            onImport={handleImportUDs}
            onClose={()=>setShowImportUDs(false)}
          />
        )}
        <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid #e2e8f0", boxShadow:SH }}>
          <div style={{ background:"#f1f5f9", padding:"10px 16px" }}><h3 style={SL}>Relación UD → RA</h3></div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:"#f1f5f9" }}>
              <th style={TH}>Unidad Didáctica</th>
              {ras.map(ra=><th key={ra.id} style={TH}>{ra.id}</th>)}
            </tr></thead>
            <tbody>
              {uds.map((ud,i)=>(
                <tr key={ud.id} style={{ background:i%2===0?"#fff":"#f8fafc" }}>
                  <td style={TD}>
                    <span style={{ fontWeight:600, color:"#0f172a" }}>{ud.id}</span>
                    <span style={{ color:"#64748b", fontSize:12, marginLeft:8 }}>{ud.descripcion}</span>
                  </td>
                  {ras.map(ra=>(
                    <td key={ra.id} style={{ ...TD, textAlign:"center" }}>
                      <input type="checkbox" checked={ud.ras.includes(ra.id)}
                        onChange={e=>setUDs(prev=>prev.map(u=>u.id===ud.id?{...u,ras:e.target.checked?[...u.ras,ra.id]:u.ras.filter(r=>r!==ra.id)}:u))}
                        style={{ accentColor:"#4f46e5", width:16, height:16, cursor:"pointer" }}/>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {uds.map(ud=>(
            <UDCard key={ud.id} ud={ud}
              onUpdate={fields=>setUDs(prev=>prev.map(u=>u.id===ud.id?{...u,...fields}:u))}
              onRemove={()=>removeUD(ud.id)}/>
          ))}
        </div>
        <button onClick={()=>{ const id="UD"+(uds.length+1); setUDs(prev=>[...prev,{id,titulo:"",descripcion:"",ras:[]}]); }} style={BS}>+ Añadir UD</button>
      </div>
    );
  }

  // ── ACTIVIDADES ───────────────────────────────────────────────────────────
  function TabActividades() {
    const [draggingId, setDraggingId] = useState(null);
    const [overKey, setOverKey]       = useState(null);

    function actsDeRA(raId, tipo) {
      return actividades.filter(a=>a.ras.includes(raId)&&a.tipo===tipo).sort((a,b)=>(a.orden??0)-(b.orden??0));
    }
    function commitDrop(targetRaId, targetTipo, targetIdx) {
      if (!draggingId) return;
      setActividades(prev=>{
        const act=prev.find(a=>a.id===draggingId); if(!act) return prev;
        let grupo=prev.filter(a=>a.ras.includes(targetRaId)&&a.tipo===targetTipo&&a.id!==draggingId).sort((a,b)=>(a.orden??0)-(b.orden??0));
        grupo.splice(targetIdx==="END"?grupo.length:Math.min(targetIdx,grupo.length), 0, act);
        const map={}; grupo.forEach((a,i)=>{map[a.id]=i;});
        return prev.map(a=>a.id===draggingId?{...a,ras:[targetRaId],tipo:targetTipo,orden:map[a.id]??0}:map[a.id]!==undefined?{...a,orden:map[a.id]}:a);
      });
      setDraggingId(null); setOverKey(null);
    }

    function ActRow({ act, raId, tipo, idx }) {
      const itemKey = `${raId}|${tipo}|${idx}`;
      const isOver  = overKey===itemKey;
      const prob    = actividadProblemas(act);
      const inc     = prob.length>0;
      const isEditing = editingActId===act.id;
      return (
        <div draggable
          onDragStart={()=>setDraggingId(act.id)}
          onDragEnd={()=>{ setDraggingId(null); setOverKey(null); }}
          onDragOver={e=>{ e.preventDefault(); setOverKey(itemKey); }}
          onDrop={e=>{ e.preventDefault(); commitDrop(raId,tipo,idx); }}
          style={{ display:"flex", alignItems:"center", gap:8, borderRadius:8, padding:"8px 10px", marginBottom:4, transition:"all .1s",
            background:isOver?"#eff6ff":isEditing?"#fefce8":inc?"#fef2f2":"#fafafa",
            border:`1px solid ${isOver?"#4f46e5":isEditing?"#fde68a":inc?"#fca5a5":"#e2e8f0"}`,
            cursor:draggingId?"grabbing":"grab", opacity:draggingId===act.id?0.45:1 }}>
          <span style={{ color:"#cbd5e1", fontSize:16, flexShrink:0, userSelect:"none" }}>⠿</span>
          <span style={{ flex:2, color:"#0f172a", fontSize:13 }}>{act.nombre||<em style={{color:"#dc2626"}}>sin nombre</em>}</span>
          {inc && <span title={prob.join(", ")} style={{ color:"#dc2626", fontSize:11, flexShrink:0, background:"#fee2e2", border:"1px solid #fca5a5", borderRadius:4, padding:"1px 6px" }}>⚠ {prob.join(" · ")}</span>}
          <span style={{ color:"#64748b", fontSize:11, flexShrink:0 }}>{act.ud||"—"}</span>
          <span style={{ color:"#94a3b8", fontSize:11, flexShrink:0, minWidth:32, textAlign:"right" }}>{act.peso!=null?`${act.peso}%`:"—"}</span>
          <button onClick={()=>setEditingActId(prev=>prev===act.id?null:act.id)}
            style={{ background:isEditing?"#fde68a":"none", border:`1px solid ${isEditing?"#f59e0b":"#e2e8f0"}`, borderRadius:6, color:isEditing?"#92400e":"#64748b", cursor:"pointer", padding:"3px 8px", fontSize:12 }}>✏</button>
          <button onClick={()=>removeActividad(act.id)} style={DB}>✕</button>
        </div>
      );
    }

    function DropEnd({ raId, tipo }) {
      const key=`${raId}|${tipo}|END`, isOver=overKey===key;
      if (!draggingId) return null;
      return (
        <div onDragOver={e=>{ e.preventDefault(); setOverKey(key); }} onDrop={e=>{ e.preventDefault(); commitDrop(raId,tipo,"END"); }}
          style={{ minHeight:36, borderRadius:8, border:`2px dashed ${isOver?"#4f46e5":"#e2e8f0"}`, background:isOver?"#eef2ff":"transparent",
            display:"flex", alignItems:"center", justifyContent:"center", color:isOver?"#4f46e5":"#94a3b8", fontSize:12, marginTop:4 }}>
          {isOver?"↓ Soltar aquí":"↓ Soltar al final"}
        </div>
      );
    }

    const actsFaltantes = actividades.filter(actividadIncompleta).length;
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        {actsFaltantes>0 && (
          <div style={{ background:"#fef2f2", border:"1px solid #fca5a5", borderRadius:10, padding:"10px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <span style={{ fontSize:18 }}>⚠️</span>
            <span style={{ color:"#991b1b", fontSize:13, fontWeight:500 }}>
              {actsFaltantes} actividad{actsFaltantes>1?"es":""} con campos sin completar. Corrígelas para que el cálculo sea correcto.
            </span>
          </div>
        )}
        <div style={{ display:"flex", gap:8, justifyContent:"flex-end" }}>
          <button onClick={()=>downloadJSON(actividades,"actividades")} style={OB}>↓ Exportar</button>
          <button onClick={()=>setShowImportActs(v=>!v)} style={showImportActs?BS:OB}>↑ Importar</button>
        </div>
        {showImportActs && (
          <ImportPanel
            placeholder={"Texto plano separado por ; (una por línea):\n  Práctica Hardware; Actividad; RA1; UD1; 50%\n  Examen UD1; Examen; RA1,RA2; UD1; 50\n  (nombre; tipo; RAs separadas por coma; UD; peso%)\n\nO JSON:\n  [{\"nombre\":\"...\",\"tipo\":\"actividad\",\"ras\":[\"RA1\"],\"ud\":\"UD1\",\"peso\":50}]"}
            onImport={handleImportActividades}
            onClose={()=>setShowImportActs(false)}
          />
        )}
        {/* Formulario nueva actividad */}
        <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:16, display:"flex", flexDirection:"column", gap:10, boxShadow:SH }}>
          <h3 style={SL}>Nueva actividad / examen</h3>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            <input value={newAct.nombre} onChange={e=>setNewAct(p=>({...p,nombre:e.target.value}))} placeholder="Nombre" style={{ ...IS, flex:2 }}/>
            <select value={newAct.tipo} onChange={e=>setNewAct(p=>({...p,tipo:e.target.value}))} style={{ ...IS, flex:1 }}>
              <option value="actividad">📋 Actividad</option>
              <option value="examen">📄 Examen</option>
            </select>
            <select value={newAct.ud} onChange={e=>setNewAct(p=>({...p,ud:e.target.value}))} style={{ ...IS, flex:1 }}>
              <option value="">-- UD --</option>
              {uds.map(ud=><option key={ud.id} value={ud.id}>{ud.id}</option>)}
            </select>
            <input type="number" min={0} max={100} value={newAct.peso} onChange={e=>setNewAct(p=>({...p,peso:e.target.value}))} style={{ ...IS, width:80 }} placeholder="Peso%"/>
          </div>
          <div style={{ display:"flex", gap:10, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ color:"#64748b", fontSize:12 }}>RAs:</span>
            {ras.map(ra=>(
              <label key={ra.id} style={{ cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                <input type="checkbox" checked={newAct.ras.includes(ra.id)}
                  onChange={e=>setNewAct(p=>({...p,ras:e.target.checked?[...p.ras,ra.id]:p.ras.filter(r=>r!==ra.id)}))}
                  style={{ accentColor:"#4f46e5" }}/>
                <span style={{ color:"#334155", fontSize:12 }}>{ra.id}</span>
              </label>
            ))}
            <button onClick={addActividad} style={BS}>+ Añadir</button>
          </div>
        </div>
        {/* Grupos por RA */}
        {ras.map(ra=>{
          const acts=actsDeRA(ra.id,"actividad"), exams=actsDeRA(ra.id,"examen");
          return (
            <div key={ra.id} style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, overflow:"hidden", boxShadow:SH }}>
              <div style={{ background:"#eef2ff", padding:"10px 16px", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ background:"#4f46e5", color:"#fff", borderRadius:6, padding:"2px 10px", fontWeight:700, fontSize:13 }}>{ra.id}</span>
                <span style={{ color:"#334155", fontSize:13, flex:1 }}>{ra.titulo}</span>
                <span style={{ fontSize:11, color:"#0891b2", background:"#ecfeff", border:"1px solid #a5f3fc", borderRadius:6, padding:"2px 8px" }}>Act {ra.pctAct??40}%</span>
                <span style={{ fontSize:11, color:"#64748b" }}>+</span>
                <span style={{ fontSize:11, color:"#7c3aed", background:"#f5f3ff", border:"1px solid #ddd6fe", borderRadius:6, padding:"2px 8px" }}>Exam {ra.pctExam??60}%</span>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }}>
                <div style={{ borderRight:"1px solid #f1f5f9", padding:12 }}>
                  <span style={{ color:"#0891b2", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:8 }}>📋 Actividades</span>
                  {acts.map((act,idx)=><ActRow key={act.id} act={act} raId={ra.id} tipo="actividad" idx={idx}/>)}
                  <DropEnd raId={ra.id} tipo="actividad"/>
                </div>
                <div style={{ padding:12 }}>
                  <span style={{ color:"#7c3aed", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:.8, display:"block", marginBottom:8 }}>📄 Exámenes</span>
                  {exams.map((act,idx)=><ActRow key={act.id} act={act} raId={ra.id} tipo="examen" idx={idx}/>)}
                  <DropEnd raId={ra.id} tipo="examen"/>
                </div>
              </div>
            </div>
          );
        })}
        {/* Tabla notas */}
        <div style={{ borderRadius:12, overflow:"auto", border:"1px solid #e2e8f0", maxHeight:400, boxShadow:SH }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
            <thead style={{ position:"sticky", top:0, zIndex:10 }}>
              <tr style={{ background:"#f1f5f9" }}>
                <th style={{ ...TH, textAlign:"left", minWidth:160 }}>Actividad</th>
                <th style={TH}>Tipo</th><th style={TH}>RA</th>
                {alumnos.map(al=><th key={al.id} style={{ ...TH, minWidth:72 }}>{al.nombre.split(",")[0]}</th>)}
              </tr>
            </thead>
            <tbody>
              {ras.map(ra=>{
                const grupo=[
                  ...actividades.filter(a=>a.ras.includes(ra.id)&&a.tipo==="actividad").sort((a,b)=>(a.orden??0)-(b.orden??0)),
                  ...actividades.filter(a=>a.ras.includes(ra.id)&&a.tipo==="examen").sort((a,b)=>(a.orden??0)-(b.orden??0)),
                ];
                return grupo.map((act,i)=>{
                  const inc=actividadIncompleta(act);
                  return (
                    <tr key={act.id} style={{ background:i%2===0?"#fff":"#f8fafc", borderLeft:inc?"3px solid #fca5a5":"3px solid transparent" }}>
                      <td style={TD}>{inc&&<span title={actividadProblemas(act).join(", ")} style={{ color:"#dc2626", marginRight:5 }}>⚠</span>}{act.nombre}</td>
                      <td style={{ ...TD, textAlign:"center" }}>{tipoBadge(act.tipo)}</td>
                      <td style={{ ...TD, textAlign:"center" }}>
                        <span style={{ fontSize:10, background:"#eef2ff", color:"#4f46e5", border:"1px solid #c7d2fe", borderRadius:4, padding:"1px 5px" }}>{ra.id}</span>
                      </td>
                      {alumnos.map(al=>{
                        const k=`${act.id}-${al.id}`, nota=act.notas[al.id];
                        return (
                          <td key={al.id} style={{ ...TD, textAlign:"center", cursor:readOnly?"default":"pointer" }} onClick={()=>!readOnly&&setEditingNota(k)}>
                            {editingNota===k && !readOnly
                              ? <input autoFocus type="number" min={0} max={10} step={0.1} defaultValue={nota}
                                  onBlur={e=>saveNota(act.id,al.id,e.target.value)}
                                  onKeyDown={e=>{ if(e.key==="Enter")saveNota(act.id,al.id,e.target.value); if(e.key==="Escape")setEditingNota(null); }}
                                  style={{ width:52, textAlign:"center", background:"#fff", border:"1px solid #4f46e5", borderRadius:4, color:"#0f172a", padding:"2px 4px", fontSize:13 }}/>
                              : notaBadge(nota)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                });
              })}
            </tbody>
          </table>
        </div>
        <p style={{ color:"#94a3b8", fontSize:12, margin:0 }}>💡 Arrastra ⠿ para reordenar · ✏ para editar · Clic en nota para modificar</p>
      </div>
    );
  }

  // ── POR ALUMNO ────────────────────────────────────────────────────────────
  function TabAlumno() {
    const al = alumnos.find(a=>a.id===alumnoSel)||alumnos[0];
    if (!al) return <p style={{ color:"#64748b" }}>No hay alumnos.</p>;
    const raData = ras.map(ra=>({ ra:ra.id, nota:calcNotaRA(ra,al.id,actividades)??0, fullMark:10 }));
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <select value={al.id} onChange={e=>setAlumnoSel(Number(e.target.value))} style={{ ...IS, maxWidth:280 }}>
            {alumnos.map(a=><option key={a.id} value={a.id}>{a.nombre}</option>)}
          </select>
          <span style={{ color:"#64748b", fontSize:13 }}>Calificación final:</span>
          {notaBadge(calcNotaFinal(al.id,ras,actividades),"lg")}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:16, boxShadow:SH }}>
            <h3 style={SL}>Perfil por RA</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={raData}>
                <PolarGrid stroke="#e2e8f0"/>
                <PolarAngleAxis dataKey="ra" tick={{ fill:"#64748b", fontSize:12 }}/>
                <Radar dataKey="nota" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.2} dot={{ r:4, fill:"#4f46e5" }}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background:"#fff", border:"1px solid #e2e8f0", borderRadius:12, padding:16, boxShadow:SH }}>
            <h3 style={SL}>Nota por RA</h3>
            {ras.map(ra=>{
              const acts=actividades.filter(a=>a.ras.includes(ra.id)&&a.tipo==="actividad");
              const exams=actividades.filter(a=>a.ras.includes(ra.id)&&a.tipo==="examen");
              const mAct=mediaGrupo(acts,al.id), mExam=mediaGrupo(exams,al.id), n=calcNotaRA(ra,al.id,actividades);
              return (
                <div key={ra.id} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                    <span style={{ color:"#4f46e5", fontWeight:700, fontSize:13, width:36 }}>{ra.id}</span>
                    <div style={{ flex:1, height:8, background:"#f1f5f9", borderRadius:4, overflow:"hidden" }}>
                      <div style={{ width:`${n?n*10:0}%`, height:"100%", background:notaColor(n), borderRadius:4, transition:"width .6s" }}/>
                    </div>
                    {notaBadge(n)}
                    <span style={{ color:"#94a3b8", fontSize:11, width:36 }}>{(pesos[ra.id]*100).toFixed(0)}%p</span>
                  </div>
                  <div style={{ display:"flex", gap:12, paddingLeft:44, fontSize:11 }}>
                    <span style={{ color:"#0891b2" }}>Act: {mAct!==null?mAct.toFixed(1):"—"} ({ra.pctAct??40}%)</span>
                    <span style={{ color:"#7c3aed" }}>Exam: {mExam!==null?mExam.toFixed(1):"—"} ({ra.pctExam??60}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {ras.map(ra=>{
          const grupo=[
            ...actividades.filter(a=>a.ras.includes(ra.id)&&a.tipo==="actividad").sort((a,b)=>(a.orden??0)-(b.orden??0)),
            ...actividades.filter(a=>a.ras.includes(ra.id)&&a.tipo==="examen").sort((a,b)=>(a.orden??0)-(b.orden??0)),
          ];
          if (!grupo.length) return null;
          return (
            <div key={ra.id} style={{ borderRadius:12, overflow:"hidden", border:"1px solid #e2e8f0", boxShadow:SH }}>
              <div style={{ background:"#eef2ff", padding:"8px 14px", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ background:"#4f46e5", color:"#fff", borderRadius:6, padding:"2px 10px", fontWeight:700, fontSize:12 }}>{ra.id}</span>
                <span style={{ color:"#334155", fontSize:12, flex:1 }}>{ra.titulo}</span>
                {notaBadge(calcNotaRA(ra,al.id,actividades))}
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ background:"#f1f5f9" }}>
                  <th style={TH}>Actividad</th><th style={TH}>Tipo</th><th style={TH}>UD</th><th style={TH}>Peso</th><th style={TH}>Nota</th>
                </tr></thead>
                <tbody>
                  {grupo.map((act,i)=>(
                    <tr key={act.id} style={{ background:i%2===0?"#fff":"#f8fafc" }}>
                      <td style={TD}>{act.nombre}</td>
                      <td style={{ ...TD, textAlign:"center" }}>{tipoBadge(act.tipo)}</td>
                      <td style={{ ...TD, textAlign:"center", color:"#64748b", fontSize:12 }}>{act.ud||"—"}</td>
                      <td style={{ ...TD, textAlign:"center", color:"#94a3b8", fontSize:12 }}>{act.peso}%</td>
                      <td style={{ ...TD, textAlign:"center" }}>{notaBadge(act.notas[al.id]===""?null:act.notas[al.id])}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>
    );
  }

  // ── datos del panel de edición de actividad ───────────────────────────────
  const editedAct = editingActId ? actividades.find(a=>a.id===editingActId) : null;

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#f1f5f9", color:"#0f172a", fontFamily:"'DM Sans','Segoe UI',sans-serif", paddingBottom:48 }}>
      {/* CABECERA */}
      <div style={{ background:"linear-gradient(135deg,#eef2ff 0%,#e0f2fe 100%)", borderBottom:"1px solid #e2e8f0", padding:"20px 28px 0", boxShadow:SH }}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            {/* Botón volver al dashboard */}
            {onBack && (
              <button onClick={onBack} title="Volver a mis cuadernos" style={{
                background:"none", border:"1px solid #e2e8f0", borderRadius:8, padding:"6px 12px",
                fontSize:12, color:"#475569", cursor:"pointer", display:"flex", alignItems:"center", gap:5,
              }}>← Cuadernos</button>
            )}
            {/* Logo + título */}
            <div onClick={()=>setTab("resumen")} style={{ display:"flex", alignItems:"center", gap:12, cursor:"pointer", userSelect:"none" }} title="Ir al resumen">
              <NotebookIcon size={38}/>
              <div>
                <h1 style={{ fontSize:20, fontWeight:800, color:"#0f172a", margin:0, letterSpacing:-.5 }}>
                  {cuaderno?.titulo || "Cuaderno de Calificaciones"}
                </h1>
                <p style={{ color:"#64748b", fontSize:12, margin:0 }}>
                  {[cuaderno?.modulo, cuaderno?.curso, cuaderno?.descripcion].filter(Boolean).join(" · ") || "Formación Profesional · Aragón"}
                </p>
              </div>
            </div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, paddingBottom:4 }}>
            <span ref={savedIndicator} style={{ opacity:0, transition:"opacity .4s", color:"#059669", fontSize:12, fontWeight:600 }}>✓ Guardado</span>
            {/* Mostrar usuario actual */}
            {currentUser && (
              <span style={{ fontSize:12, color:"#64748b", background:"#f1f5f9", border:"1px solid #e2e8f0", borderRadius:6, padding:"4px 10px" }}>
                {currentUser.nombre}
              </span>
            )}
            {!readOnly && <>
              <span style={{ color:"#94a3b8", fontSize:12 }}>{alumnos.length} alumnos · {actividades.length} actividades</span>
              <button onClick={exportTodo} style={{ ...OB, color:"#4f46e5", borderColor:"#c7d2fe" }}>↓ Backup</button>
              <label style={{ ...OB, cursor:"pointer" }}>
                ↑ Restaurar
                <input ref={fileInputRef} type="file" accept=".json" onChange={importTodo} style={{ display:"none" }}/>
              </label>
            </>}
          </div>
        </div>
        <div style={{ display:"flex", marginTop:16 }}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:"10px 16px", fontSize:13, fontWeight:tab===t.id?600:400,
              color:tab===t.id?"#4f46e5":"#64748b",
              background:"none", border:"none", cursor:"pointer",
              borderBottom:tab===t.id?"2px solid #4f46e5":"2px solid transparent",
              transition:"all .2s"
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      {/* CONTENIDO */}
      <div style={{ padding:"24px 28px" }}>
        {tab==="resumen"     && <TabResumen/>}
        {tab==="alumnos"     && <TabAlumnos/>}
        {tab==="ras"         && <TabRAs/>}
        {tab==="uds"         && <TabUDs/>}
        {tab==="actividades" && <TabActividades/>}
        {tab==="alumno"      && <TabAlumno/>}

        {/* Panel edición actividad — fuera de TabActividades para evitar remounts */}
        {tab==="actividades" && editedAct && (
          <EditActPanel
            act={editedAct}
            ras={ras}
            uds={uds}
            onUpdate={fields=>updateActividad(editedAct.id, fields)}
            onClose={()=>setEditingActId(null)}
            onRemove={()=>{ removeActividad(editedAct.id); setEditingActId(null); }}
          />
        )}
      </div>
    </div>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
const TH = { padding:"10px 14px", color:"#475569", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:.8, textAlign:"center", borderBottom:"1px solid #e2e8f0" };
const TD = { padding:"10px 14px", color:"#334155", fontSize:13, borderBottom:"1px solid #f1f5f9" };
const IS = { background:"#ffffff", border:"1px solid #cbd5e1", borderRadius:8, color:"#0f172a", padding:"8px 12px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" };
const BS = { background:"#4f46e5", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer", flexShrink:0 };
const OB = { background:"#ffffff", color:"#475569", border:"1px solid #e2e8f0", borderRadius:8, padding:"6px 12px", fontSize:12, fontWeight:500, cursor:"pointer", flexShrink:0 };
const DB = { background:"none", border:"1px solid #fca5a544", borderRadius:6, color:"#dc2626", cursor:"pointer", padding:"3px 8px", fontSize:13 };
const LB = { fontSize:12, color:"#4f46e5", cursor:"pointer", background:"none", border:"none", marginRight:8 };
const SL = { color:"#475569", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:12, marginTop:0 };
const SH = "0 1px 3px rgba(0,0,0,0.06)";
