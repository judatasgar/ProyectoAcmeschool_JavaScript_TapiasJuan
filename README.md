# Plataforma de exámenes – Acme School

Plataforma web para **crear, administrar y presentar exámenes en línea**.

Hecha con **HTML, CSS y JavaScript puro** (sin frameworks), **módulos ES**,
**Web Components** y persistencia en **localStorage** con datos en formato JSON.

---

## ¿Cómo ejecutarlo?

Los módulos ES (`import` / `export`) **no funcionan abriendo el archivo con doble clic**
(`file://`): el navegador los bloquea por seguridad (CORS). Hay que usar un servidor local:

1. Abrir la carpeta del proyecto en **VS Code**.
2. Clic derecho sobre `index.html` → **Open with Live Server**.

La primera vez se cargan automáticamente unos datos de prueba.

### Usuario de prueba

| Email | Contraseña | Cargo |
|---|---|---|
| `admin@acme.edu` | `admin2431` | administrativo |

> Para volver a los datos iniciales: DevTools (F12) → Application → Local Storage → borrar las claves y recargar.

---

## Funcionalidades

### Módulo público: presentar un examen (`index.html`)
1. **Lista de exámenes** con título, tiempo y porcentaje de aprobación.
2. El estudiante escribe su **identificación y nombre**.
3. **Examen**: encabezado con título, total de preguntas y porcentaje de aprobación;
   preguntas numeradas con **selección única** (radio buttons).
   Una **barra de progreso** muestra cuántas preguntas van respondidas.
4. **Reloj de cuenta regresiva** en tiempo real (no bloquea la página). En el último
   minuto se pone en rojo. Al llegar a 00:00 el examen **se entrega solo**.
5. **Resultado**: respuestas correctas, porcentaje obtenido y si **aprobó o no**.
   Cada resultado se guarda en `localStorage` (clave `resultados`).
6. **Revisión**: cada pregunta aparece con ✅ o ❌, lo que eligió el estudiante
   y, si falló, cuál era la respuesta correcta.

### Login (`pages/login.html`)
- Ingreso con **email y contraseña** de los usuarios registrados.
- La sesión se guarda en `sessionStorage` (se cierra al cerrar el navegador).
- Las páginas de gestión están **protegidas**: sin sesión, redirigen al login.

### CRUD de exámenes (`pages/examenes.html`) 🔒
- Tabla con todos los exámenes y botones **Editar / Eliminar**.
- Formulario con código, título, tiempo (minutos), porcentaje de aprobación y descripción.
- **Editor dinámico de preguntas**: agregar / quitar preguntas y respuestas.
- Validaciones: código único, campos obligatorios, mínimo 2 respuestas por pregunta
  y **exactamente una respuesta correcta** por pregunta.

### CRUD de usuarios (`pages/usuarios.html`) 🔒
- Tabla de usuarios con **Editar / Eliminar**.
- Campos: identificación, nombre, email, teléfono, cargo (administrativo / docente) y contraseña.
- Validaciones: identificación y email únicos, formato de email y teléfono, contraseña de 6+ caracteres.
- Al editar, la contraseña puede quedar vacía para conservar la actual.
- Un usuario no puede eliminarse a sí mismo mientras tiene la sesión iniciada.

---

## Web Components

| Componente | Archivo | Qué hace |
|---|---|---|
| `<app-nav>` | `js/componentes/app-nav.js` | Barra de navegación de todas las páginas. Muestra enlaces distintos con o sin sesión. |
| `<exam-timer>` | `js/componentes/exam-timer.js` | Reloj de cuenta regresiva. Métodos `iniciar(minutos)` y `detener()`; dispara el evento `tiempo-agotado`. |

---

## Estructura del proyecto

```
├── index.html               → módulo público (lista → datos → examen → resultado)
├── pages/
│   ├── login.html
│   ├── examenes.html        → CRUD de exámenes (privado)
│   └── usuarios.html        → CRUD de usuarios (privado)
├── css/
│   └── styles.css           → identidad visual, responsive y animaciones
└── js/
    ├── storage.js           → ÚNICO archivo que lee/escribe localStorage
    ├── datos-prueba.js      → datos iniciales (tres examenes y un usuario admin)
    ├── auth.js              → sesión: iniciar, obtener, cerrar, proteger páginas
    ├── resolver.js          → lógica del módulo público
    ├── login.js
    ├── examenes.js
    ├── usuarios.js
    └── componentes/
        ├── app-nav.js
        └── exam-timer.js
```

## Modelo de datos (JSON en localStorage)

```js
// clave "examenes"
{
  codigo: "GEO-01",                 // único
  titulo: "Geografía básica",
  tiempo: 10,                       // minutos
  porcentajeAprobacion: 60,
  descripcion: "...",
  preguntas: [
    {
      enunciado: "¿Cuál es el continente más grande del mundo?",
      respuestas: [
        { texto: "África", esCorrecta: false },
        { texto: "Asia",   esCorrecta: true  }   // solo UNA correcta
      ]
    }
  ]
}

// clave "usuarios"
{ identificacion: "0001", nombre: "...", email: "...", telefono: "...",
  cargo: "administrativo" | "docente", password: "..." }

// clave "resultados"
{ codigoExamen, identificacion, nombre, respuestasElegidas: [1, null, 0],
  porcentaje: 67, aprobado: true, fecha: "2026-11-25T18:28:12.725Z" }
```

---

## Decisiones técnicas

- **`textContent` en vez de `innerHTML`** para mostrar datos escritos por usuarios:
  evita la inyección de HTML/JavaScript.
- **Una sola página para el flujo público**, con secciones que se muestran/ocultan (`hidden`).
- **El reloj guarda la hora de fin** (`Date.now() + minutos`) y recalcula cada segundo:
  no se desfasa aunque la pestaña quede en segundo plano.
- **Candado `examen_terminado`**: evita calificar dos veces si el tiempo se agota
  justo cuando se pulsa "Terminar".
- **Accesibilidad**: `label` en todos los campos, `fieldset`/`legend` en las preguntas,
  `role="timer"`, `role="alert"`, `aria-current`, foco visible y respeto de
  `prefers-reduced-motion`.

## Limitaciones conocidas

- ⚠️ **Las contraseñas se guardan en texto plano** en `localStorage`. Es aceptable solo
  porque el proyecto no tiene backend; en un sistema real se guardarían cifradas (hash)
  en un servidor.
- Los datos viven **en el navegador**: no se comparten entre equipos ni navegadores.
- Las respuestas correctas están en `localStorage`, así que un usuario avanzado
  podría verlas desde las DevTools.

---

**Autor:** Juan Tapias – Campuslands
