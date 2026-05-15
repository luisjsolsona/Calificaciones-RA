# Cuaderno de Calificaciones RA

Aplicacion web para gestionar calificaciones en **Formacion Profesional** basada en Resultados de Aprendizaje (RA). Disenada para centros educativos con multiples docentes y grupos de alumnos.

## Caracteristicas principales

### Gestion academica
- Configuracion de **Resultados de Aprendizaje** con pesos ponderados
- **Unidades Didacticas** asociadas a RAs
- **Actividades y examenes** con pesos individuales por RA
- Calculo automatico de notas: `Nota RA = (media_act x pctAct%) + (media_exam x pctExam%)`
- Nota final ponderada por el peso de cada RA
- Vista grafica por alumno (radar + barras por RA)

### Sistema multiusuario con backend
- Tres roles: **Admin**, **Docente**, **Alumno**
- Autenticacion por JWT (email o usuario corto + contrasena)
- Sesion persistente entre recargas
- Base de datos SQLite en volumen Docker (datos persistentes)

### Estructura organizativa
- **Ciclos** (SMR, IFC, DAW...) con su codigo y nombre
- **Grupos** dentro de cada ciclo (1SMR, 2SMR, 1DAW...)
- Usuarios asignados a grupos para filtrado rapido

### Gestion de usuarios
- Panel de **Usuarios** con filtros por nombre, rol y grupo
- **Importacion masiva**: pega una lista de nombres, elige rol y grupo, previsualiza y crea todos de una vez
- Formato flexible: `Apellido, Nombre`, `Apellido, Nombre | usuario`, `Apellido, Nombre | usuario | email`
- Usuarios y emails generados automaticamente desde el nombre

### Cuadernos de calificaciones
- Cada docente gestiona sus propios cuadernos
- Los alumnos se asignan mediante **Inscripciones** (boton en cada tarjeta)
- Filtro por ciclo/grupo en el modal de inscripciones
- El cuaderno se crea vacio, listo para configurar

### Vista del alumno
- Los alumnos se autentican y ven solo sus modulos asignados
- Vista de sus notas por RA y actividad (solo lectura)

---

## Despliegue con Docker

```bash
git clone https://github.com/luisjsolsona/Calificaciones-RA.git
cd Calificaciones-RA
docker compose up -d --build
```

Accede en: `http://tu-servidor:8500`

**Acceso inicial:**
- Usuario: `admin` / Contrasena: `admin1234`

### Arquitectura Docker

| Servicio | Puerto interno | Descripcion |
|----------|---------------|-------------|
| `cuaderno` | 80 | Frontend React + Nginx (proxy `/api`) |
| `backend`  | 3001 | API REST Node.js + Express |
| Volumen `db-data` | — | Base de datos SQLite persistente |

---

## Desarrollo local

**Requisitos:** Node.js 20+

```bash
# Frontend
npm install
npm run dev

# Backend
cd backend
npm install
node server.js
```

---

## Flujo de uso recomendado

```
1. Admin inicia sesion (admin / admin1234)
2. Admin crea ciclos y grupos (panel "Ciclos y Grupos")
3. Admin crea cuentas de docentes (panel "Usuarios" > Nuevo)
4. Admin importa alumnos masivamente (boton "Importar masivo")
   - Pega lista de nombres, elige rol=Alumno y grupo
   - Previsualiza y ajusta si hace falta
   - Crea todos de una vez
5. Docente crea cuadernos (panel principal)
6. Docente inscribe alumnos en cada cuaderno (boton 👥)
   - Filtra por ciclo o grupo para encontrarlos rapido
7. Docente configura RAs, UDs y actividades dentro del cuaderno
8. Docente introduce notas (clic en celda)
9. Alumno se autentica y ve sus calificaciones por modulo
```

---

## Tecnologias

| Capa | Tecnologia |
|------|-----------|
| Frontend | React 18 + Vite |
| Graficos | Recharts |
| Backend | Node.js + Express |
| Base de datos | SQLite (better-sqlite3) |
| Autenticacion | JWT (jsonwebtoken + bcryptjs) |
| Servidor web | Nginx (proxy inverso) |
| Contenedores | Docker + Docker Compose |

---

## Formulas de calculo

```
Nota RA  = (media actividades x pctAct/100) + (media examenes x pctExam/100)
Nota final = sum(Nota_RA_i x peso_RA_i)  para todos los RAs
```

Los pesos de los RAs se distribuyen automaticamente si se dejan en blanco.

---

## Importar / Exportar datos

Dentro de cada cuaderno es posible importar y exportar:
- **Alumnos**: texto plano (un nombre por linea) o JSON
- **RAs, UDs, Actividades**: formato JSON
- **Calificaciones**: exportacion CSV desde la pestana Calificaciones
