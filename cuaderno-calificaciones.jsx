import { useState, useMemo, useRef } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

// ─── DATOS INICIALES ────────────────────────────────────────────────────────
const initAlumnos = [
  { id: 1, nombre: "García López, Ana" },
  { id: 2, nombre: "Martínez Ruiz, Carlos" },
  { id: 3, nombre: "Sánchez Pérez, Elena" },
  { id: 4, nombre: "Fernández Torres, David" },
  { id: 5, nombre: "Rodríguez Gil, Marta" },
];

const initRAs = [
  { id: "RA1", titulo: "Resultado de Aprendizaje 1", descripcion: "Identifica los elementos de un sistema informático", peso: null, pctAct: 40, pctExam: 60 },
  { id: "RA2", titulo: "Resultado de Aprendizaje 2", descripcion: "Instala y configura software de base", peso: null, pctAct: 40, pctExam: 60 },
  { id: "RA3", titulo: "Resultado de Aprendizaje 3", descripcion: "Gestiona información en sistemas de ficheros", peso: null, pctAct: 40, pctExam: 60 },
  { id: "RA4", titulo: "Resultado de Aprendizaje 4", descripcion: "Realiza operaciones básicas de administración", peso: null, pctAct: 40, pctExam: 60 },
];

const initUDs = [
  { id: "UD1", titulo: "Unidad 1", descripcion: "Hardware y componentes", ras: ["RA1"] },
  { id: "UD2", titulo: "Unidad 2", descripcion: "Sistemas operativos", ras: ["RA2", "RA3"] },
  { id: "UD3", titulo: "Unidad 3", descripcion: "Gestión de ficheros", ras: ["RA3"] },
  { id: "UD4", titulo: "Unidad 4", descripcion: "Administración básica", ras: ["RA4"] },
];

const initActividades = [
  { id: "A1", nombre: "Práctica Hardware", tipo: "actividad", ras: ["RA1"], ud: "UD1", peso: 50, orden: 0, notas: {} },
  { id: "A2", nombre: "Examen UD1",        tipo: "examen",    ras: ["RA1"], ud: "UD1", peso: 50, orden: 0, notas: {} },
  { id: "A3", nombre: "Instalación SO",    tipo: "actividad", ras: ["RA2"], ud: "UD2", peso: 50, orden: 0, notas: {} },
  { id: "A4", nombre: "Examen UD2-UD3",   tipo: "examen",    ras: ["RA2","RA3"], ud: "UD2", peso: 50, orden: 0, notas: {} },
  { id: "A5", nombre: "Gestión ficheros",  tipo: "actividad", ras: ["RA3"], ud: "UD3", peso: 50, orden: 1, notas: {} },
  { id: "A6", nombre: "Práctica Admin",    tipo: "actividad", ras: ["RA4"], ud: "UD4", peso: 50, orden: 0, notas: {} },
  { id: "A7", nombre: "Examen final",      tipo: "examen",    ras: ["RA4"], ud: "UD4", peso: 50, orden: 1, notas: {} },
];
initActividades.forEach(act => {
  initAlumnos.forEach(al => { act.notas[al.id] = Math.floor(Math.random() * 5) + 5; });
});

// ─── UTILIDADES ─────────────────────────────────────────────────────────────
function calcPesosRA(ras) {
  const custom = ras.filter(r => r.peso !== null && r.peso !== "");
  if (custom.length === ras.length) {
    const total = custom.reduce((s, r) => s + Number(r.peso), 0);
    return Object.fromEntries(ras.map(r => [r.id, Number(r.peso) / total]));
  }
  return Object.fromEntries(ras.map(r => [r.id, 1 / ras.length]));
}

function mediaGrupo(grupo, alumnoId) {
  const validos = grupo.filter(a => a.notas[alumnoId] !== "" && !isNaN(Number(a.notas[alumnoId])));
  if (!validos.length) return null;
  const pesoTotal = validos.reduce((s, a) => s + Number(a.peso), 0);
  if (!pesoTotal) return null;
  return validos.reduce((s, a) => s + Number(a.notas[alumnoId]) * Number(a.peso), 0) / pesoTotal;
}

function calcNotaRA(ra, alumnoId, actividades) {
  const acts  = actividades.filter(a => a.ras.includes(ra.id) && a.tipo === "actividad");
  const exams = actividades.filter(a => a.ras.includes(ra.id) && a.tipo === "examen");
  const mAct  = mediaGrupo(acts, alumnoId);
  const mExam = mediaGrupo(exams, alumnoId);
  const pAct  = (ra.pctAct  ?? 40) / 100;
  const pExam = (ra.pctExam ?? 60) / 100;
  if (mAct === null && mExam === null) return null;
  if (mAct === null) return mExam;
  if (mExam === null) return mAct;
  return mAct * pAct + mExam * pExam;
}

function calcNotaFinal(alumnoId, ras, actividades) {
  const pesos = calcPesosRA(ras);
  let total = 0, pesoUsado = 0;
  ras.forEach(ra => {
    const nota = calcNotaRA(ra, alumnoId, actividades);
    if (nota !== null) { total += nota * pesos[ra.id]; pesoUsado += pesos[ra.id]; }
  });
  return pesoUsado > 0 ? total / pesoUsado : null;
}

function notaColor(n) {
  if (n === null || n === undefined || n === "" || isNaN(Number(n))) return "#64748b";
  n = Number(n);
  if (n >= 9) return "#10b981";
  if (n >= 7) return "#3b82f6";
  if (n >= 5) return "#f59e0b";
  return "#ef4444";
}

function notaBadge(n, size = "sm") {
  const color = notaColor(n);
  const val = (n === null || n === undefined || n === "" || isNaN(Number(n))) ? "—" : Number(n).toFixed(1);
  return (
    <span style={{
      display: "inline-block", borderRadius: 5, minWidth: 36, textAlign: "center",
      backgroundColor: color + "22", color, border: `1px solid ${color}55`,
      padding: size === "lg" ? "6px 16px" : "2px 8px",
      fontSize: size === "lg" ? 18 : 12, fontWeight: 600,
    }}>{val}</span>
  );
}

function tipoBadge(tipo) {
  const esExam = tipo === "examen";
  return (
    <span style={{
      fontSize: 10, padding: "2px 8px", borderRadius: 99,
      background: esExam ? "#7c3aed22" : "#0891b222",
      color: esExam ? "#a78bfa" : "#67e8f9",
      border: `1px solid ${esExam ? "#7c3aed55" : "#0891b255"}`,
    }}>{esExam ? "Examen" : "Actividad"}</span>
  );
}

// ─── COMPONENTE PRINCIPAL ────────────────────────────────────────────────────
export default function CuadernoCalificaciones() {
  const [tab, setTab]   = useState("resumen");
  const [alumnos, setAlumnos]           = useState(initAlumnos);
  const [ras, setRAs]                   = useState(initRAs);
  const [uds, setUDs]                   = useState(initUDs);
  const [actividades, setActividades]   = useState(initActividades);
  const [alumnoSel, setAlumnoSel]       = useState(null);
  const [editingNota, setEditingNota]   = useState(null);
  const [nuevoAlumno, setNuevoAlumno]   = useState("");
  const [newAct, setNewAct] = useState({ nombre: "", tipo: "actividad", ras: [], ud: "", peso: 50 });

  const tabs = [
    { id: "resumen",      label: "📊 Resumen" },
    { id: "alumnos",      label: "👥 Alumnos" },
    { id: "ras",          label: "🎯 RAs" },
    { id: "uds",          label: "📚 UDs" },
    { id: "actividades",  label: "📝 Actividades" },
    { id: "alumno",       label: "🔍 Por alumno" },
  ];

  function saveNota(actId, alumnoId, val) {
    setActividades(prev => prev.map(a =>
      a.id === actId ? { ...a, notas: { ...a.notas, [alumnoId]: val === "" ? "" : Number(val) } } : a
    ));
    setEditingNota(null);
  }

  function addAlumno() {
    if (!nuevoAlumno.trim()) return;
    const id = alumnos.length ? Math.max(...alumnos.map(a => a.id)) + 1 : 1;
    setAlumnos(prev => [...prev, { id, nombre: nuevoAlumno.trim() }]);
    setNuevoAlumno("");
  }

  function addActividad() {
    if (!newAct.nombre.trim() || !newAct.ras.length) return;
    const id = "A" + Date.now();
    const notas = {};
    alumnos.forEach(a => { notas[a.id] = ""; });
    const orden = actividades.filter(a => a.ras.some(r => newAct.ras.includes(r)) && a.tipo === newAct.tipo).length;
    setActividades(prev => [...prev, { ...newAct, id, orden, notas }]);
    setNewAct({ nombre: "", tipo: "actividad", ras: [], ud: "", peso: 50 });
  }

  function removeAlumno(id)    { setAlumnos(prev => prev.filter(a => a.id !== id)); }
  function removeActividad(id) { setActividades(prev => prev.filter(a => a.id !== id)); }
  function updateActividad(id, fields) { setActividades(prev => prev.map(a => a.id === id ? { ...a, ...fields } : a)); }

  function removeRA(raId) {
    setRAs(prev => prev.filter(r => r.id !== raId));
    setUDs(prev => prev.map(u => ({ ...u, ras: u.ras.filter(r => r !== raId) })));
    setActividades(prev => prev.map(a => ({ ...a, ras: a.ras.filter(r => r !== raId) })));
  }

  function removeUD(udId) {
    setUDs(prev => prev.filter(u => u.id !== udId));
    setActividades(prev => prev.map(a => ({ ...a, ud: a.ud === udId ? "" : a.ud })));
  }

  const pesos = useMemo(() => calcPesosRA(ras), [ras]);

  // ── RESUMEN ──────────────────────────────────────────────────────────────
  function TabResumen() {
    const data = alumnos.map(al => ({
      nombre: al.nombre.split(",")[0],
      nota: calcNotaFinal(al.id, ras, actividades),
    }));
    const dist = [
      { label: "< 5",   count: data.filter(d => d.nota !== null && d.nota < 5).length,                color: "#ef4444" },
      { label: "5–6.9", count: data.filter(d => d.nota !== null && d.nota >= 5 && d.nota < 7).length, color: "#f59e0b" },
      { label: "7–8.9", count: data.filter(d => d.nota !== null && d.nota >= 7 && d.nota < 9).length, color: "#3b82f6" },
      { label: "≥ 9",   count: data.filter(d => d.nota !== null && d.nota >= 9).length,               color: "#10b981" },
    ];
    const raData = ras.map(ra => ({
      ra: ra.id,
      media: (() => {
        const ns = alumnos.map(al => calcNotaRA(ra, al.id, actividades)).filter(n => n !== null);
        return ns.length ? ns.reduce((s, n) => s + n, 0) / ns.length : 0;
      })(),
    }));

    return (
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }}>
          {[
            { label:"Alumnos", val: alumnos.length, icon:"👥" },
            { label:"Actividades", val: actividades.length, icon:"📝" },
            { label:"Media clase", val: (() => { const ns=alumnos.map(al=>calcNotaFinal(al.id,ras,actividades)).filter(n=>n!==null); return ns.length?(ns.reduce((s,n)=>s+n,0)/ns.length).toFixed(2):"—";})(), icon:"📊" },
            { label:"Aprobados", val: alumnos.filter(al=>{ const n=calcNotaFinal(al.id,ras,actividades); return n!==null&&n>=5; }).length+"/"+alumnos.length, icon:"✅" },
          ].map(c => (
            <div key={c.label} style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:16 }}>
              <div style={{ fontSize:24 }}>{c.icon}</div>
              <div style={{ color:"#94a3b8", fontSize:12, marginTop:4 }}>{c.label}</div>
              <div style={{ color:"#f1f5f9", fontSize:22, fontWeight:700 }}>{c.val}</div>
            </div>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:16 }}>
            <h3 style={SL}>Calificaciones finales</h3>
            {data.map(d => (
              <div key={d.nombre} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                <span style={{ color:"#cbd5e1", fontSize:13, flex:1 }}>{d.nombre}</span>
                <div style={{ flex:3, height:6, background:"#0f172a", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ width:`${d.nota?d.nota*10:0}%`, height:"100%", background:notaColor(d.nota), borderRadius:4, transition:"width .6s" }} />
                </div>
                {notaBadge(d.nota)}
              </div>
            ))}
          </div>
          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:16 }}>
            <h3 style={SL}>Distribución</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={dist} barSize={28}>
                <XAxis dataKey="label" tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:"#0f172a", border:"1px solid #334155", borderRadius:8, color:"#f1f5f9" }} />
                <Bar dataKey="count" radius={[4,4,0,0]}>{dist.map((d,i)=><Cell key={i} fill={d.color}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:16 }}>
          <h3 style={SL}>Media de clase por RA</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={raData} barSize={32}>
              <XAxis dataKey="ra" tick={{ fill:"#94a3b8", fontSize:12 }} axisLine={false} tickLine={false}/>
              <YAxis domain={[0,10]} tick={{ fill:"#64748b", fontSize:11 }} axisLine={false} tickLine={false}/>
              <Tooltip contentStyle={{ background:"#0f172a", border:"1px solid #334155", borderRadius:8, color:"#f1f5f9" }} formatter={v=>v.toFixed(2)}/>
              <Bar dataKey="media" radius={[4,4,0,0]} fill="#6366f1"/>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid #334155" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr style={{ background:"#0f172a" }}>
                <th style={TH}>Alumno</th>
                {ras.map(ra=><th key={ra.id} style={TH}>{ra.id}</th>)}
                <th style={{ ...TH, color:"#6366f1" }}>Final</th>
              </tr>
            </thead>
            <tbody>
              {alumnos.map((al,i)=>(
                <tr key={al.id} style={{ background:i%2===0?"#1e293b":"#172033", cursor:"pointer" }}
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
        <div style={{ display:"flex", gap:8 }}>
          <input value={nuevoAlumno} onChange={e=>setNuevoAlumno(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&addAlumno()} placeholder="Apellidos, Nombre" style={IS}/>
          <button onClick={addAlumno} style={BS}>+ Añadir</button>
        </div>
        <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid #334155" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:"#0f172a" }}>
              <th style={TH}>#</th><th style={TH}>Nombre</th><th style={TH}>Nota final</th><th style={TH}>Acción</th>
            </tr></thead>
            <tbody>
              {alumnos.map((al,i)=>(
                <tr key={al.id} style={{ background:i%2===0?"#1e293b":"#172033" }}>
                  <td style={{ ...TD, color:"#64748b" }}>{i+1}</td>
                  <td style={TD}>{al.nombre}</td>
                  <td style={{ ...TD, textAlign:"center" }}>{notaBadge(calcNotaFinal(al.id,ras,actividades))}</td>
                  <td style={{ ...TD, textAlign:"center" }}>
                    <button onClick={()=>{ setAlumnoSel(al.id); setTab("alumno"); }} style={LB}>Ver →</button>
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
    function updatePct(raId, field, val) {
      const num = Math.min(100, Math.max(0, Number(val)||0));
      setRAs(prev=>prev.map(r=>{
        if(r.id!==raId) return r;
        if(field==="pctAct")  return {...r, pctAct:num, pctExam:100-num};
        if(field==="pctExam") return {...r, pctExam:num, pctAct:100-num};
        return r;
      }));
    }
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <p style={{ color:"#64748b", fontSize:13, margin:0 }}>
          Peso vacío → distribución proporcional automática. Los porcentajes Act/Exam definen cómo se pondera la nota de cada RA.
        </p>
        {ras.map(ra=>(
          <div key={ra.id} style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:16 }}>
            <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
              <span style={{ background:"#6366f1", color:"#fff", borderRadius:6, padding:"2px 10px", fontWeight:700, fontSize:13, flexShrink:0 }}>{ra.id}</span>
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
                <input value={ra.titulo} placeholder="Título"
                  onChange={e=>setRAs(prev=>prev.map(r=>r.id===ra.id?{...r,titulo:e.target.value}:r))}
                  style={IS}/>
                <input value={ra.descripcion} placeholder="Descripción"
                  onChange={e=>setRAs(prev=>prev.map(r=>r.id===ra.id?{...r,descripcion:e.target.value}:r))}
                  style={{ ...IS, fontSize:12 }}/>
              </div>
              <div style={{ textAlign:"center", flexShrink:0 }}>
                <label style={{ color:"#64748b", fontSize:11, display:"block", marginBottom:4 }}>Peso RA (%)</label>
                <input type="number" min={0} max={100} value={ra.peso??""} placeholder="Auto"
                  onChange={e=>setRAs(prev=>prev.map(r=>r.id===ra.id?{...r,peso:e.target.value===""?null:e.target.value}:r))}
                  style={{ ...IS, width:72, textAlign:"center" }}/>
                <div style={{ color:"#6366f1", fontSize:11, marginTop:4 }}>{(pesosPct[ra.id]*100).toFixed(1)}%</div>
              </div>
              <button onClick={()=>removeRA(ra.id)} style={{ ...DB, alignSelf:"flex-start" }}>✕</button>
            </div>
            {/* Barra peso RA */}
            <div style={{ height:3, background:"#0f172a", borderRadius:4, margin:"12px 0 14px", overflow:"hidden" }}>
              <div style={{ width:`${pesosPct[ra.id]*100}%`, height:"100%", background:"#6366f1", transition:"width .4s" }}/>
            </div>
            {/* Porcentajes Act / Exam */}
            <div style={{ display:"flex", gap:14, alignItems:"center", flexWrap:"wrap" }}>
              <span style={{ color:"#64748b", fontSize:12 }}>Ponderación nota RA:</span>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ color:"#67e8f9", fontSize:12 }}>📋 Actividades</span>
                <input type="number" min={0} max={100} value={ra.pctAct??40}
                  onChange={e=>updatePct(ra.id,"pctAct",e.target.value)}
                  style={{ ...IS, width:58, padding:"4px 8px", textAlign:"center" }}/>
                <span style={{ color:"#64748b", fontSize:12 }}>%</span>
              </div>
              <span style={{ color:"#334155" }}>+</span>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ color:"#a78bfa", fontSize:12 }}>📄 Exámenes</span>
                <input type="number" min={0} max={100} value={ra.pctExam??60}
                  onChange={e=>updatePct(ra.id,"pctExam",e.target.value)}
                  style={{ ...IS, width:58, padding:"4px 8px", textAlign:"center" }}/>
                <span style={{ color:"#64748b", fontSize:12 }}>%</span>
              </div>
              {/* Barra Act/Exam */}
              <div style={{ flex:1, minWidth:100, height:8, background:"#0f172a", borderRadius:4, overflow:"hidden", display:"flex" }}>
                <div style={{ width:`${ra.pctAct??40}%`, background:"#67e8f9", transition:"width .3s" }}/>
                <div style={{ width:`${ra.pctExam??60}%`, background:"#a78bfa", transition:"width .3s" }}/>
              </div>
              {(ra.pctAct??40)+(ra.pctExam??60)!==100 && (
                <span style={{ color:"#ef4444", fontSize:11 }}>⚠ Suma {(ra.pctAct??40)+(ra.pctExam??60)}%</span>
              )}
            </div>
          </div>
        ))}
        <button onClick={()=>{
          const id="RA"+(ras.length+1);
          setRAs(prev=>[...prev,{ id, titulo:`Resultado de Aprendizaje ${ras.length+1}`, descripcion:"", peso:null, pctAct:40, pctExam:60 }]);
        }} style={BS}>+ Añadir RA</button>
      </div>
    );
  }

  // ── UDs ──────────────────────────────────────────────────────────────────
  function TabUDs() {
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ borderRadius:12, overflow:"hidden", border:"1px solid #334155" }}>
          <div style={{ background:"#0f172a", padding:"10px 16px" }}>
            <h3 style={SL}>Relación UD → RA</h3>
          </div>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead><tr style={{ background:"#0f172a" }}>
              <th style={TH}>Unidad Didáctica</th>
              {ras.map(ra=><th key={ra.id} style={TH}>{ra.id}</th>)}
            </tr></thead>
            <tbody>
              {uds.map((ud,i)=>(
                <tr key={ud.id} style={{ background:i%2===0?"#1e293b":"#172033" }}>
                  <td style={TD}>
                    <span style={{ fontWeight:600, color:"#e2e8f0" }}>{ud.id}</span>
                    <span style={{ color:"#64748b", fontSize:12, marginLeft:8 }}>{ud.descripcion}</span>
                  </td>
                  {ras.map(ra=>(
                    <td key={ra.id} style={{ ...TD, textAlign:"center" }}>
                      <input type="checkbox" checked={ud.ras.includes(ra.id)}
                        onChange={e=>setUDs(prev=>prev.map(u=>u.id===ud.id
                          ?{...u,ras:e.target.checked?[...u.ras,ra.id]:u.ras.filter(r=>r!==ra.id)}:u))}
                        style={{ accentColor:"#6366f1", width:16, height:16, cursor:"pointer" }}/>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {uds.map(ud=>(
            <div key={ud.id} style={{ display:"flex", gap:10, alignItems:"center", background:"#1e293b", border:"1px solid #334155", borderRadius:10, padding:"10px 12px" }}>
              <span style={{ color:"#6366f1", fontWeight:700, fontSize:13, flexShrink:0 }}>{ud.id}</span>
              <input value={ud.titulo} onChange={e=>setUDs(prev=>prev.map(u=>u.id===ud.id?{...u,titulo:e.target.value}:u))} style={{ ...IS, flex:1 }}/>
              <input value={ud.descripcion} onChange={e=>setUDs(prev=>prev.map(u=>u.id===ud.id?{...u,descripcion:e.target.value}:u))} style={{ ...IS, flex:2, fontSize:12 }}/>
              <button onClick={()=>removeUD(ud.id)} style={DB}>✕</button>
            </div>
          ))}
        </div>
        <button onClick={()=>{
          const id="UD"+(uds.length+1);
          setUDs(prev=>[...prev,{ id, titulo:`Unidad ${uds.length+1}`, descripcion:"", ras:[] }]);
        }} style={BS}>+ Añadir UD</button>
      </div>
    );
  }

  // ── ACTIVIDADES ───────────────────────────────────────────────────────────
  function TabActividades() {
    const [draggingId, setDraggingId] = useState(null);
    const [overKey, setOverKey]       = useState(null); // "raId|tipo|idx" o "raId|tipo|END"
    const [editingAct, setEditingAct] = useState(null);

    function actsDeRA(raId, tipo) {
      return actividades
        .filter(a => a.ras.includes(raId) && a.tipo === tipo)
        .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    }

    function commitDrop(targetRaId, targetTipo, targetIdx) {
      if (!draggingId) return;
      setActividades(prev => {
        const act = prev.find(a => a.id === draggingId);
        if (!act) return prev;
        // Construir grupo destino sin el elemento arrastrado
        let grupo = prev
          .filter(a => a.ras.includes(targetRaId) && a.tipo === targetTipo && a.id !== draggingId)
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
        // Insertar en la posición correcta
        const insertAt = targetIdx === "END" ? grupo.length : Math.min(targetIdx, grupo.length);
        grupo.splice(insertAt, 0, act);
        // Reasignar orden y actualizar RA/tipo
        const map = {};
        grupo.forEach((a, i) => { map[a.id] = i; });
        return prev.map(a =>
          a.id === draggingId
            ? { ...a, ras: [targetRaId], tipo: targetTipo, orden: map[a.id] ?? 0 }
            : map[a.id] !== undefined
              ? { ...a, orden: map[a.id] }
              : a
        );
      });
      setDraggingId(null);
      setOverKey(null);
    }

    // Cada fila arrastrable
    function ActRow({ act, raId, tipo, idx }) {
      const isEdit = editingAct === act.id;
      const itemKey = `${raId}|${tipo}|${idx}`;
      const isOver  = overKey === itemKey;

      return (
        <div
          draggable
          onDragStart={() => setDraggingId(act.id)}
          onDragEnd={()   => { setDraggingId(null); setOverKey(null); }}
          onDragOver={e  => { e.preventDefault(); setOverKey(itemKey); }}
          onDrop={e      => { e.preventDefault(); commitDrop(raId, tipo, idx); }}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            background: isOver ? "#1e3a5f" : "#0f172a",
            border: `1px solid ${isOver ? "#6366f1" : "#1e293b"}`,
            borderRadius: 8, padding: "8px 10px",
            cursor: draggingId ? "grabbing" : "grab",
            marginBottom: 4, transition: "background .1s, border-color .1s",
            opacity: draggingId === act.id ? 0.45 : 1,
          }}>
          <span style={{ color: "#475569", fontSize: 16, flexShrink: 0, userSelect: "none" }}>⠿</span>
          {isEdit ? (
            <>
              <input defaultValue={act.nombre} autoFocus
                onBlur={e => updateActividad(act.id, { nombre: e.target.value })}
                style={{ ...IS, flex: 2, padding: "4px 8px" }} />
              <select defaultValue={act.ud}
                onChange={e => updateActividad(act.id, { ud: e.target.value })}
                style={{ ...IS, flex: 1, padding: "4px 8px" }}>
                <option value="">-- UD --</option>
                {uds.map(u => <option key={u.id} value={u.id}>{u.id}</option>)}
              </select>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <input type="number" min={0} max={100} defaultValue={act.peso}
                  onBlur={e => updateActividad(act.id, { peso: Number(e.target.value) })}
                  style={{ ...IS, width: 54, padding: "4px 6px", textAlign: "center" }} />
                <span style={{ color: "#64748b", fontSize: 11 }}>%</span>
              </div>
              <button onClick={() => setEditingAct(null)} style={{ ...BS, padding: "4px 10px", fontSize: 12 }}>✓</button>
            </>
          ) : (
            <>
              <span style={{ flex: 2, color: "#e2e8f0", fontSize: 13 }}>{act.nombre}</span>
              <span style={{ color: "#64748b", fontSize: 11, flexShrink: 0 }}>{act.ud || "—"}</span>
              <span style={{ color: "#94a3b8", fontSize: 11, flexShrink: 0, minWidth: 32, textAlign: "right" }}>{act.peso}%</span>
              <button onClick={() => setEditingAct(act.id)}
                style={{ background: "none", border: "1px solid #334155", borderRadius: 6, color: "#94a3b8", cursor: "pointer", padding: "3px 8px", fontSize: 12 }}>✏</button>
              <button onClick={() => removeActividad(act.id)} style={DB}>✕</button>
            </>
          )}
        </div>
      );
    }

    // Zona final de cada columna — siempre visible mientras se arrastra
    function DropEnd({ raId, tipo }) {
      const key    = `${raId}|${tipo}|END`;
      const isOver = overKey === key;
      if (!draggingId) return null;
      return (
        <div
          onDragOver={e => { e.preventDefault(); setOverKey(key); }}
          onDrop={e    => { e.preventDefault(); commitDrop(raId, tipo, "END"); }}
          style={{
            minHeight: 36, borderRadius: 8,
            border: `2px dashed ${isOver ? "#6366f1" : "#334155"}`,
            background: isOver ? "#6366f122" : "transparent",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: isOver ? "#818cf8" : "#475569", fontSize: 12,
            marginTop: 4, transition: "all .12s",
          }}>
          {isOver ? "↓ Soltar aquí" : "↓ Soltar al final"}
        </div>
      );
    }

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Formulario */}
        <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          <h3 style={SL}>Nueva actividad / examen</h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input value={newAct.nombre} onChange={e => setNewAct(p => ({ ...p, nombre: e.target.value }))}
              placeholder="Nombre" style={{ ...IS, flex: 2 }} />
            <select value={newAct.tipo} onChange={e => setNewAct(p => ({ ...p, tipo: e.target.value }))} style={{ ...IS, flex: 1 }}>
              <option value="actividad">📋 Actividad</option>
              <option value="examen">📄 Examen</option>
            </select>
            <select value={newAct.ud} onChange={e => setNewAct(p => ({ ...p, ud: e.target.value }))} style={{ ...IS, flex: 1 }}>
              <option value="">-- UD --</option>
              {uds.map(ud => <option key={ud.id} value={ud.id}>{ud.id}</option>)}
            </select>
            <input type="number" min={0} max={100} value={newAct.peso}
              onChange={e => setNewAct(p => ({ ...p, peso: e.target.value }))}
              style={{ ...IS, width: 80 }} placeholder="Peso%" />
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ color: "#94a3b8", fontSize: 12 }}>RAs vinculados:</span>
            {ras.map(ra => (
              <label key={ra.id} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                <input type="checkbox" checked={newAct.ras.includes(ra.id)}
                  onChange={e => setNewAct(p => ({ ...p, ras: e.target.checked ? [...p.ras, ra.id] : p.ras.filter(r => r !== ra.id) }))}
                  style={{ accentColor: "#6366f1" }} />
                <span style={{ color: "#cbd5e1", fontSize: 12 }}>{ra.id}</span>
              </label>
            ))}
            <button onClick={addActividad} style={BS}>+ Añadir</button>
          </div>
        </div>

        {/* Grupos por RA */}
        {ras.map(ra => {
          const acts  = actsDeRA(ra.id, "actividad");
          const exams = actsDeRA(ra.id, "examen");
          return (
            <div key={ra.id} style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, overflow: "hidden" }}>
              {/* Cabecera */}
              <div style={{ background: "#16213e", padding: "10px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ background: "#6366f1", color: "#fff", borderRadius: 6, padding: "2px 10px", fontWeight: 700, fontSize: 13 }}>{ra.id}</span>
                <span style={{ color: "#cbd5e1", fontSize: 13, flex: 1 }}>{ra.titulo}</span>
                <span style={{ fontSize: 11, color: "#67e8f9", background: "#67e8f911", border: "1px solid #67e8f933", borderRadius: 6, padding: "2px 8px" }}>Act {ra.pctAct ?? 40}%</span>
                <span style={{ fontSize: 11, color: "#64748b" }}>+</span>
                <span style={{ fontSize: 11, color: "#a78bfa", background: "#a78bfa11", border: "1px solid #a78bfa33", borderRadius: 6, padding: "2px 8px" }}>Exam {ra.pctExam ?? 60}%</span>
              </div>
              {/* 2 columnas */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ borderRight: "1px solid #0f172a", padding: "12px 12px" }}>
                  <span style={{ color: "#67e8f9", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: .8, display: "block", marginBottom: 8 }}>📋 Actividades</span>
                  {acts.map((act, idx) => <ActRow key={act.id} act={act} raId={ra.id} tipo="actividad" idx={idx} />)}
                  <DropEnd raId={ra.id} tipo="actividad" />
                </div>
                <div style={{ padding: "12px 12px" }}>
                  <span style={{ color: "#a78bfa", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: .8, display: "block", marginBottom: 8 }}>📄 Exámenes</span>
                  {exams.map((act, idx) => <ActRow key={act.id} act={act} raId={ra.id} tipo="examen" idx={idx} />)}
                  <DropEnd raId={ra.id} tipo="examen" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Tabla de notas */}
        <div style={{ borderRadius:12, overflow:"auto", border:"1px solid #334155", maxHeight:400 }}>
          <table style={{ width:"100%", borderCollapse:"collapse", minWidth:500 }}>
            <thead style={{ position:"sticky", top:0, zIndex:10 }}>
              <tr style={{ background:"#0f172a" }}>
                <th style={{ ...TH, textAlign:"left", minWidth:160 }}>Actividad</th>
                <th style={TH}>Tipo</th><th style={TH}>RA</th>
                {alumnos.map(al=><th key={al.id} style={{ ...TH, minWidth:76 }}>{al.nombre.split(",")[0]}</th>)}
              </tr>
            </thead>
            <tbody>
              {ras.map(ra=>{
                const grupo=[
                  ...actividades.filter(a=>a.ras.includes(ra.id)&&a.tipo==="actividad").sort((a,b)=>(a.orden??0)-(b.orden??0)),
                  ...actividades.filter(a=>a.ras.includes(ra.id)&&a.tipo==="examen").sort((a,b)=>(a.orden??0)-(b.orden??0)),
                ];
                return grupo.map((act,i)=>(
                  <tr key={act.id} style={{ background:i%2===0?"#1e293b":"#172033" }}>
                    <td style={TD}>{act.nombre}</td>
                    <td style={{ ...TD, textAlign:"center" }}>{tipoBadge(act.tipo)}</td>
                    <td style={{ ...TD, textAlign:"center" }}>
                      <span style={{ fontSize:10, background:"#6366f122", color:"#818cf8", border:"1px solid #6366f144", borderRadius:4, padding:"1px 5px" }}>{ra.id}</span>
                    </td>
                    {alumnos.map(al=>{
                      const k=`${act.id}-${al.id}`;
                      const nota=act.notas[al.id];
                      return (
                        <td key={al.id} style={{ ...TD, textAlign:"center", cursor:"pointer" }} onClick={()=>setEditingNota(k)}>
                          {editingNota===k
                            ? <input autoFocus type="number" min={0} max={10} step={0.1} defaultValue={nota}
                                onBlur={e=>saveNota(act.id,al.id,e.target.value)}
                                onKeyDown={e=>{ if(e.key==="Enter")saveNota(act.id,al.id,e.target.value); if(e.key==="Escape")setEditingNota(null); }}
                                style={{ width:52, textAlign:"center", background:"#0f172a", border:"1px solid #6366f1", borderRadius:4, color:"#f1f5f9", padding:"2px 4px", fontSize:13 }}/>
                            : notaBadge(nota)}
                        </td>
                      );
                    })}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>
        <p style={{ color:"#64748b", fontSize:12, margin:0 }}>💡 Arrastra ⠿ para reordenar · ✏ para editar · Clic en nota para modificar</p>
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
          <span style={{ color:"#94a3b8", fontSize:13 }}>Calificación final:</span>
          {notaBadge(calcNotaFinal(al.id,ras,actividades),"lg")}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:16 }}>
            <h3 style={SL}>Perfil por RA</h3>
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={raData}>
                <PolarGrid stroke="#334155"/>
                <PolarAngleAxis dataKey="ra" tick={{ fill:"#94a3b8", fontSize:12 }}/>
                <Radar dataKey="nota" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} dot={{ r:4, fill:"#6366f1" }}/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{ background:"#1e293b", border:"1px solid #334155", borderRadius:12, padding:16 }}>
            <h3 style={SL}>Nota por RA</h3>
            {ras.map(ra=>{
              const acts  = actividades.filter(a=>a.ras.includes(ra.id)&&a.tipo==="actividad");
              const exams = actividades.filter(a=>a.ras.includes(ra.id)&&a.tipo==="examen");
              const mAct  = mediaGrupo(acts, al.id);
              const mExam = mediaGrupo(exams, al.id);
              const n     = calcNotaRA(ra,al.id,actividades);
              return (
                <div key={ra.id} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                    <span style={{ color:"#6366f1", fontWeight:700, fontSize:13, width:36 }}>{ra.id}</span>
                    <div style={{ flex:1, height:8, background:"#0f172a", borderRadius:4, overflow:"hidden" }}>
                      <div style={{ width:`${n?n*10:0}%`, height:"100%", background:notaColor(n), borderRadius:4, transition:"width .6s" }}/>
                    </div>
                    {notaBadge(n)}
                    <span style={{ color:"#64748b", fontSize:11, width:36 }}>{(pesos[ra.id]*100).toFixed(0)}%p</span>
                  </div>
                  <div style={{ display:"flex", gap:12, paddingLeft:44, fontSize:11 }}>
                    <span style={{ color:"#67e8f9" }}>Act: {mAct!==null?mAct.toFixed(1):"—"} ({ra.pctAct??40}%)</span>
                    <span style={{ color:"#a78bfa" }}>Exam: {mExam!==null?mExam.toFixed(1):"—"} ({ra.pctExam??60}%)</span>
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
          if(!grupo.length) return null;
          return (
            <div key={ra.id} style={{ borderRadius:12, overflow:"hidden", border:"1px solid #334155" }}>
              <div style={{ background:"#16213e", padding:"8px 14px", display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ background:"#6366f1", color:"#fff", borderRadius:6, padding:"2px 10px", fontWeight:700, fontSize:12 }}>{ra.id}</span>
                <span style={{ color:"#94a3b8", fontSize:12, flex:1 }}>{ra.titulo}</span>
                {notaBadge(calcNotaRA(ra,al.id,actividades))}
              </div>
              <table style={{ width:"100%", borderCollapse:"collapse" }}>
                <thead><tr style={{ background:"#0f172a" }}>
                  <th style={TH}>Actividad</th><th style={TH}>Tipo</th><th style={TH}>UD</th><th style={TH}>Peso</th><th style={TH}>Nota</th>
                </tr></thead>
                <tbody>
                  {grupo.map((act,i)=>(
                    <tr key={act.id} style={{ background:i%2===0?"#1e293b":"#172033" }}>
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

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight:"100vh", background:"#0f172a", color:"#f1f5f9", fontFamily:"'DM Sans','Segoe UI',sans-serif", paddingBottom:48 }}>
      <div style={{ background:"linear-gradient(135deg,#1e1b4b 0%,#0f172a 60%)", borderBottom:"1px solid #1e293b", padding:"20px 28px 0" }}>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <span style={{ fontSize:28 }}>📒</span>
            <div>
              <h1 style={{ fontSize:20, fontWeight:800, color:"#f1f5f9", margin:0, letterSpacing:-.5 }}>Cuaderno de Calificaciones</h1>
              <p style={{ color:"#64748b", fontSize:12, margin:0 }}>Formación Profesional · Aragón</p>
            </div>
          </div>
          <span style={{ color:"#64748b", fontSize:12, paddingBottom:4 }}>{alumnos.length} alumnos · {actividades.length} actividades</span>
        </div>
        <div style={{ display:"flex", marginTop:16 }}>
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              padding:"10px 16px", fontSize:13, fontWeight:tab===t.id?600:400,
              color:tab===t.id?"#818cf8":"#64748b",
              background:"none", border:"none", cursor:"pointer",
              borderBottom:tab===t.id?"2px solid #6366f1":"2px solid transparent",
              transition:"all .2s"
            }}>{t.label}</button>
          ))}
        </div>
      </div>
      <div style={{ padding:"24px 28px" }}>
        {tab==="resumen"     && <TabResumen/>}
        {tab==="alumnos"     && <TabAlumnos/>}
        {tab==="ras"         && <TabRAs/>}
        {tab==="uds"         && <TabUDs/>}
        {tab==="actividades" && <TabActividades/>}
        {tab==="alumno"      && <TabAlumno/>}
      </div>
    </div>
  );
}

// ─── ESTILOS ─────────────────────────────────────────────────────────────────
const TH = { padding:"10px 14px", color:"#64748b", fontSize:11, fontWeight:600, textTransform:"uppercase", letterSpacing:.8, textAlign:"center", borderBottom:"1px solid #1e293b" };
const TD = { padding:"10px 14px", color:"#cbd5e1", fontSize:13, borderBottom:"1px solid #1e293b20" };
const IS = { background:"#0f172a", border:"1px solid #334155", borderRadius:8, color:"#f1f5f9", padding:"8px 12px", fontSize:13, outline:"none", width:"100%", boxSizing:"border-box" };
const BS = { background:"#6366f1", color:"#fff", border:"none", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:600, cursor:"pointer", flexShrink:0 };
const DB = { background:"none", border:"1px solid #ef444444", borderRadius:6, color:"#ef4444", cursor:"pointer", padding:"3px 8px", fontSize:13 };
const LB = { fontSize:12, color:"#6366f1", cursor:"pointer", background:"none", border:"none", marginRight:8 };
const SL = { color:"#94a3b8", fontSize:12, fontWeight:600, textTransform:"uppercase", letterSpacing:1, marginBottom:12, marginTop:0 };
