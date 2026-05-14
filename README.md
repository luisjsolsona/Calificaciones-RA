# 📒 Cuaderno de Calificaciones RA

Aplicación web para la gestión de calificaciones en **Formación Profesional** (España), basada en **Resultados de Aprendizaje (RA)**. Calcula automáticamente las notas ponderadas por RA y la nota final del módulo.

---

## Características

| Función | Detalle |
|---|---|
| **Resultados de Aprendizaje** | Configura pesos y la ponderación Actividades/Exámenes de cada RA |
| **Unidades Didácticas** | Asocia UDs a los RAs correspondientes |
| **Actividades y Exámenes** | Con peso, tipo, RA y UD. Arrastrar para reordenar |
| **Calificaciones** | Tabla editable con cálculo automático en tiempo real |
| **Gráficos** | Distribución, media por RA, perfil radar por alumno |
| **Guardado automático** | Los datos persisten en el navegador (localStorage) |
| **Importar / Exportar** | Por entidad y backup completo en JSON |
| **⚠ Alertas** | Actividades resaltadas en rojo si falta RA, UD o peso |
| **Tema claro** | Diseño limpio con tonos blancos |

---

## Ejecución con Docker

La forma más sencilla. Compatible con **Windows, Mac y Linux**.

```bash
# Construir y arrancar
docker compose up --build

# Abrir en el navegador:
# http://localhost:8000
```

Para parar:
```bash
docker compose down
```

---

## Desarrollo local

Requiere Node.js 18+.

```bash
npm install
npm run dev        # servidor de desarrollo → http://localhost:5173
npm run build      # compilar para producción
npm run preview    # previsualizar el build
```

---

## Importar y Exportar datos

### Backup completo (cabecera)
- **↓ Backup** — descarga un JSON con todos los datos (alumnos, RAs, UDs, actividades)
- **↑ Restaurar** — carga un backup completo

### Por entidad (cada pestaña)
Cada pestaña tiene sus propios botones **↓ Exportar** / **↑ Importar**.

Al importar puedes:
- **Pegar directamente** (Ctrl+V) en el textarea → se detecta el contenido
- **Cargar desde archivo** (`.json` o `.txt`)
- Elegir entre **Añadir a existentes** o **Reemplazar todo**

---

### Formatos de importación

#### Alumnos
Texto plano (un nombre por línea):
```
García López, Ana
Martínez Ruiz, Carlos
Sánchez Pérez, Elena
```

O en JSON:
```json
[
  { "nombre": "García López, Ana" },
  { "nombre": "Martínez Ruiz, Carlos" }
]
```

#### Resultados de Aprendizaje
```json
[
  {
    "id": "RA1",
    "titulo": "Identifica los elementos del sistema",
    "descripcion": "Descripción del RA",
    "peso": null,
    "pctAct": 40,
    "pctExam": 60
  }
]
```
> `peso: null` → distribución automática proporcional entre todos los RAs.

#### Unidades Didácticas
```json
[
  {
    "id": "UD1",
    "titulo": "Unidad 1",
    "descripcion": "Hardware y componentes",
    "ras": ["RA1"]
  }
]
```

#### Actividades
```json
[
  {
    "nombre": "Práctica Hardware",
    "tipo": "actividad",
    "ras": ["RA1"],
    "ud": "UD1",
    "peso": 50
  },
  {
    "nombre": "Examen UD1",
    "tipo": "examen",
    "ras": ["RA1"],
    "ud": "UD1",
    "peso": 50
  }
]
```
> Los campos `notas` son opcionales; si no se incluyen, se inicializan vacíos.

---

## Actividades incompletas ⚠

Una actividad se resalta en **rojo** cuando le falta algún campo obligatorio:

| Campo | Descripción |
|---|---|
| **sin RA** | No tiene ningún Resultado de Aprendizaje asociado |
| **sin UD** | No tiene Unidad Didáctica asignada |
| **sin peso** | El campo peso está vacío o sin definir |

Las actividades incompletas afectan al cálculo de notas. Se muestra un aviso global en la pestaña **Actividades** con el número de entradas a corregir.

---

## Cálculo de notas

```
Nota RA = (media_actividades × pctAct%) + (media_exámenes × pctExam%)
Nota final = Σ (nota_RA × peso_RA)
```

Los pesos de los RAs se normalizan automáticamente si no se especifican manualmente.

---

## Tecnologías

- **React 18** + **Vite** — interfaz reactiva
- **Recharts** — gráficos (barras, radar)
- **localStorage** — persistencia automática en el navegador
- **Nginx** — servidor de producción en Docker
- **Docker multi-stage** — imagen ligera basada en `nginx:alpine`
