// =============================================================
// usuarios.js → CRUD de usuarios (Crear, Leer, Actualizar, Eliminar)
// Página PRIVADA: solo con sesión iniciada.
// =============================================================
import { leer, guardar } from "./storage.js";
import { protegerPagina, obtenerSesion } from "./auth.js";
import "./componentes/app-nav.js";

protegerPagina(); // ← si no hay sesión, aquí se corta todo y va al login

// ----- Estado -----
let usuarios = leer("usuarios");
// ¿Estamos creando o editando?
//   null            → creando un usuario nuevo
//   "0001" (texto)  → editando el usuario con esa identificación
let identificacion_editando = null;

// ----- Elementos -----
const tabla_usuarios = document.getElementById("tabla-usuarios");
const boton_nuevo = document.getElementById("btn-nuevo-usuario");
const mensaje_estado = document.getElementById("mensaje-estado");

const seccion_form = document.getElementById("seccion-form-usuario");
const titulo_form = document.getElementById("titulo-form-usuario");
const formulario = document.getElementById("form-usuario");
const input_identificacion = document.getElementById("usuario-identificacion");
const input_nombre = document.getElementById("usuario-nombre");
const input_email = document.getElementById("usuario-email");
const input_telefono = document.getElementById("usuario-telefono");
const select_cargo = document.getElementById("usuario-cargo");
const input_password = document.getElementById("usuario-password");
const ayuda_password = document.getElementById("ayuda-password");
const caja_errores = document.getElementById("usuario-errores");
const boton_cancelar = document.getElementById("btn-cancelar-usuario");

// =============================================================
// READ: pintar la tabla
// =============================================================

// Función auxiliar: crea una celda <td> con texto (textContent = seguro)
function crearCelda(texto) {
  const celda = document.createElement("td");
  celda.textContent = texto;
  return celda;
}

function pintarTabla() {
  tabla_usuarios.innerHTML = "";

  if (usuarios.length === 0) {
    const fila = document.createElement("tr");
    const celda = crearCelda("No hay usuarios registrados.");
    celda.colSpan = 6; // la celda ocupa las 6 columnas
    fila.appendChild(celda);
    tabla_usuarios.appendChild(fila);
    return;
  }

  usuarios.forEach(function (usuario) {
    const fila = document.createElement("tr");
    fila.appendChild(crearCelda(usuario.identificacion));
    fila.appendChild(crearCelda(usuario.nombre));
    fila.appendChild(crearCelda(usuario.email));
    fila.appendChild(crearCelda(usuario.telefono));
    fila.appendChild(crearCelda(usuario.cargo));

    const celda_acciones = document.createElement("td");
    celda_acciones.className = "celda-acciones";

    const boton_editar = document.createElement("button");
    boton_editar.type = "button";
    boton_editar.className = "boton-secundario";
    boton_editar.textContent = "Editar";
    // aria-label: el lector dice "Editar Coordinador Acme", no solo "Editar"
    boton_editar.setAttribute("aria-label", `Editar ${usuario.nombre}`);
    boton_editar.addEventListener("click", function () {
      abrirFormulario(usuario); // closure: este botón recuerda SU usuario
    });

    const boton_eliminar = document.createElement("button");
    boton_eliminar.type = "button";
    boton_eliminar.className = "boton-peligro";
    boton_eliminar.textContent = "Eliminar";
    boton_eliminar.setAttribute("aria-label", `Eliminar ${usuario.nombre}`);
    boton_eliminar.addEventListener("click", function () {
      eliminarUsuario(usuario);
    });

    celda_acciones.appendChild(boton_editar);
    celda_acciones.appendChild(boton_eliminar);
    fila.appendChild(celda_acciones);
    tabla_usuarios.appendChild(fila);
  });
}

function mostrarMensaje(texto) {
  mensaje_estado.textContent = texto;
  mensaje_estado.hidden = false;
}

// =============================================================
// Abrir / cerrar el formulario
// Un MISMO formulario sirve para crear y para editar:
//   abrirFormulario(null)     → modo crear (campos vacíos)
//   abrirFormulario(usuario)  → modo editar (campos llenos)
// =============================================================
function abrirFormulario(usuario) {
  formulario.reset();
  caja_errores.hidden = true;
  mensaje_estado.hidden = true;

  if (usuario === null) {
    identificacion_editando = null;
    titulo_form.textContent = "Nuevo usuario";
    input_identificacion.disabled = false;
    ayuda_password.textContent = "Mínimo 6 caracteres.";
  } else {
    identificacion_editando = usuario.identificacion;
    titulo_form.textContent = `Editar: ${usuario.nombre}`;
    input_identificacion.value = usuario.identificacion;
    // La identificación es la "llave" del usuario → no se cambia al editar
    input_identificacion.disabled = true;
    input_nombre.value = usuario.nombre;
    input_email.value = usuario.email;
    input_telefono.value = usuario.telefono;
    select_cargo.value = usuario.cargo;
    // Nunca mostramos la contraseña guardada
    ayuda_password.textContent = "Déjala vacía para conservar la contraseña actual.";
  }

  seccion_form.hidden = false;
  seccion_form.scrollIntoView({ behavior: "smooth" });
  (usuario === null ? input_identificacion : input_nombre).focus();
}

function cerrarFormulario() {
  seccion_form.hidden = true;
  identificacion_editando = null;
}

boton_nuevo.addEventListener("click", function () {
  abrirFormulario(null);
});

boton_cancelar.addEventListener("click", cerrarFormulario);

// =============================================================
// Validación: devuelve un ARREGLO de mensajes de error.
// Arreglo vacío = todo correcto.
// (Mejor que avisar de un error a la vez: el usuario ve todo junto)
// =============================================================

// Expresión regular (regex) = un "patrón" de texto.
// Este dice: algo sin espacios + @ + algo + . + algo  → ana@acme.edu ✅
const PATRON_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Solo dígitos, entre 7 y 15
const PATRON_TELEFONO = /^[0-9]{7,15}$/;

function validar(datos) {
  const errores = [];
  const creando = identificacion_editando === null;

  if (datos.identificacion === "") {
    errores.push("La identificación es obligatoria.");
  } else if (creando) {
    // some() → true si AL MENOS UNO cumple la condición
    const repetida = usuarios.some(function (u) {
      return u.identificacion === datos.identificacion;
    });
    if (repetida) {
      errores.push("Ya existe un usuario con esa identificación.");
    }
  }

  if (datos.nombre === "") {
    errores.push("El nombre es obligatorio.");
  }

  if (!PATRON_EMAIL.test(datos.email)) {
    errores.push("Escribe un email válido (ej: nombre@acme.edu).");
  } else {
    // El email también debe ser único (es el usuario del login).
    // Al editar, ignoramos al propio usuario.
    const email_repetido = usuarios.some(function (u) {
      return u.email.toLowerCase() === datos.email && u.identificacion !== identificacion_editando;
    });
    if (email_repetido) {
      errores.push("Ese email ya lo usa otro usuario.");
    }
  }

  if (!PATRON_TELEFONO.test(datos.telefono)) {
    errores.push("El teléfono debe tener entre 7 y 15 dígitos, sin espacios.");
  }

  if (datos.cargo !== "administrativo" && datos.cargo !== "docente") {
    errores.push("Selecciona un cargo.");
  }

  // Al crear la contraseña es obligatoria; al editar puede ir vacía
  if (creando || datos.password !== "") {
    if (datos.password.length < 6) {
      errores.push("La contraseña debe tener al menos 6 caracteres.");
    }
  }

  return errores;
}

function mostrarErrores(errores) {
  caja_errores.innerHTML = "";
  const lista = document.createElement("ul");
  errores.forEach(function (texto) {
    const item = document.createElement("li");
    item.textContent = texto;
    lista.appendChild(item);
  });
  caja_errores.appendChild(lista);
  caja_errores.hidden = false;
}

// =============================================================
// CREATE y UPDATE: el submit del formulario
// =============================================================
formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const datos = {
    identificacion: input_identificacion.value.trim(),
    nombre: input_nombre.value.trim(),
    email: input_email.value.trim().toLowerCase(),
    telefono: input_telefono.value.trim(),
    cargo: select_cargo.value,
    password: input_password.value
  };

  const errores = validar(datos);
  if (errores.length > 0) {
    mostrarErrores(errores);
    return;
  }

  if (identificacion_editando === null) {
    // CREATE: agregamos al final del arreglo
    usuarios.push(datos);
    mostrarMensaje(`Usuario "${datos.nombre}" creado.`);
  } else {
    // UPDATE: findIndex devuelve la POSICIÓN del usuario en el arreglo
    const posicion = usuarios.findIndex(function (u) {
      return u.identificacion === identificacion_editando;
    });
    const anterior = usuarios[posicion];
    usuarios[posicion] = {
      identificacion: anterior.identificacion,
      nombre: datos.nombre,
      email: datos.email,
      telefono: datos.telefono,
      cargo: datos.cargo,
      // Si dejó la contraseña vacía, conservamos la anterior
      password: datos.password === "" ? anterior.password : datos.password
    };
    mostrarMensaje(`Usuario "${datos.nombre}" actualizado.`);
  }

  guardar("usuarios", usuarios);
  pintarTabla();
  cerrarFormulario();
});

// =============================================================
// DELETE
// =============================================================
function eliminarUsuario(usuario) {
  const sesion = obtenerSesion();

  // Regla de negocio: no puedes borrarte a ti mismo
  // (te quedarías dentro del sistema con un usuario que ya no existe)
  if (usuario.identificacion === sesion.identificacion) {
    mostrarMensaje("No puedes eliminar tu propio usuario mientras tienes la sesión iniciada.");
    return;
  }

  const confirmar = confirm(`¿Eliminar al usuario "${usuario.nombre}"? Esta acción no se puede deshacer.`);
  if (!confirmar) {
    return;
  }

  // filter() crea un arreglo NUEVO solo con los que cumplen la condición:
  // "todos menos el que quiero borrar"
  usuarios = usuarios.filter(function (u) {
    return u.identificacion !== usuario.identificacion;
  });
  guardar("usuarios", usuarios);
  pintarTabla();
  cerrarFormulario();
  mostrarMensaje(`Usuario "${usuario.nombre}" eliminado.`);
}

// ----- Arranque -----
pintarTabla();
