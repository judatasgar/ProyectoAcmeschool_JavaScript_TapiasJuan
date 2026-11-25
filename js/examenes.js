// =============================================================
// examenes.js → CRUD de exámenes, con sus preguntas y respuestas
// Página PRIVADA: solo con sesión iniciada.
// -------------------------------------------------------------
// Un examen tiene VARIAS preguntas y cada pregunta
// VARIAS respuestas. El formulario debe crecer y encogerse:
// "+ Agregar pregunta", "+ Agregar respuesta", "Quitar".
// Al guardar, LEEMOS el formulario y armamos el objeto examen.
// =============================================================
import { leer, guardar } from "./storage.js";
import { protegerPagina } from "./auth.js";
import "./componentes/app-nav.js";

protegerPagina();

// ----- Estado -----
let examenes = leer("examenes");
let codigo_editando = null;   // null = creando; "GEO-01" = editando ese examen
let contador_grupos = 0;      // da un name ÚNICO a los radios de cada pregunta

// ----- Elementos -----
const tabla_examenes = document.getElementById("tabla-examenes");
const boton_nuevo = document.getElementById("btn-nuevo-examen");
const mensaje_estado = document.getElementById("mensaje-estado");

const seccion_form = document.getElementById("seccion-form-examen");
const titulo_form = document.getElementById("titulo-form-examen");
const formulario = document.getElementById("form-examen");
const input_codigo = document.getElementById("examen-codigo");
const input_titulo = document.getElementById("examen-titulo");
const input_tiempo = document.getElementById("examen-tiempo");
const input_porcentaje = document.getElementById("examen-porcentaje");
const input_descripcion = document.getElementById("examen-descripcion");
const editor_preguntas = document.getElementById("editor-preguntas");
const boton_agregar_pregunta = document.getElementById("btn-agregar-pregunta");
const caja_errores = document.getElementById("examen-errores");
const boton_cancelar = document.getElementById("btn-cancelar-examen");

// =============================================================
// READ: tabla de exámenes
// =============================================================
function crearCelda(texto) {
  const celda = document.createElement("td");
  celda.textContent = texto;
  return celda;
}

function pintarTabla() {
  tabla_examenes.innerHTML = "";

  if (examenes.length === 0) {
    const fila = document.createElement("tr");
    const celda = crearCelda("No hay exámenes. Crea el primero con «+ Nuevo examen».");
    celda.colSpan = 6;
    fila.appendChild(celda);
    tabla_examenes.appendChild(fila);
    return;
  }

  examenes.forEach(function (examen) {
    const fila = document.createElement("tr");
    fila.appendChild(crearCelda(examen.codigo));
    fila.appendChild(crearCelda(examen.titulo));
    fila.appendChild(crearCelda(`${examen.tiempo} min`));
    fila.appendChild(crearCelda(`${examen.porcentajeAprobacion}%`));
    fila.appendChild(crearCelda(examen.preguntas.length));

    const celda_acciones = document.createElement("td");
    celda_acciones.className = "celda-acciones";

    const boton_editar = document.createElement("button");
    boton_editar.type = "button";
    boton_editar.className = "boton-secundario";
    boton_editar.textContent = "Editar";
    boton_editar.setAttribute("aria-label", `Editar ${examen.titulo}`);
    boton_editar.addEventListener("click", function () {
      abrirFormulario(examen);
    });

    const boton_eliminar = document.createElement("button");
    boton_eliminar.type = "button";
    boton_eliminar.className = "boton-peligro";
    boton_eliminar.textContent = "Eliminar";
    boton_eliminar.setAttribute("aria-label", `Eliminar ${examen.titulo}`);
    boton_eliminar.addEventListener("click", function () {
      eliminarExamen(examen);
    });

    celda_acciones.appendChild(boton_editar);
    celda_acciones.appendChild(boton_eliminar);
    fila.appendChild(celda_acciones);
    tabla_examenes.appendChild(fila);
  });
}

function mostrarMensaje(texto) {
  mensaje_estado.textContent = texto;
  mensaje_estado.hidden = false;
}

// =============================================================
// EDITOR DINÁMICO DE PREGUNTAS
// Cada pregunta es un bloque así:
// =============================================================

// Crea UNA fila de respuesta dentro de "lista_respuestas".
// nombre_grupo: el name compartido por los radios de ESTA pregunta.
function agregarFilaRespuesta(lista_respuestas, nombre_grupo, respuesta) {
  const fila = document.createElement("div");
  fila.className = "fila-respuesta";

  const radio = document.createElement("input");
  radio.type = "radio";
  radio.name = nombre_grupo; // mismo name → solo UNA correcta por pregunta
  radio.checked = respuesta.esCorrecta;
  radio.setAttribute("aria-label", "Marcar como respuesta correcta");

  const input_texto = document.createElement("input");
  input_texto.type = "text";
  input_texto.className = "texto-respuesta";
  input_texto.value = respuesta.texto;
  input_texto.placeholder = "Texto de la respuesta";
  input_texto.setAttribute("aria-label", "Texto de la respuesta");

  const boton_quitar = document.createElement("button");
  boton_quitar.type = "button"; // ⚠️ sin esto, un botón dentro de un form ENVÍA el form
  boton_quitar.className = "boton-peligro boton-pequeno";
  boton_quitar.textContent = "Quitar";
  boton_quitar.setAttribute("aria-label", "Quitar esta respuesta");
  boton_quitar.addEventListener("click", function () {
    fila.remove(); // remove() saca el elemento de la página
  });

  fila.appendChild(radio);
  fila.appendChild(input_texto);
  fila.appendChild(boton_quitar);
  lista_respuestas.appendChild(fila);
}

// Crea UN bloque de pregunta completo con sus respuestas.
function agregarBloquePregunta(pregunta) {
  contador_grupos = contador_grupos + 1;
  // name único aunque se borren preguntas: "grupo-1", "grupo-2"...
  const nombre_grupo = `grupo-${contador_grupos}`;

  const bloque = document.createElement("div");
  bloque.className = "bloque-pregunta";

  const cabecera = document.createElement("div");
  cabecera.className = "bloque-cabecera";

  const numero = document.createElement("label");
  numero.className = "numero-pregunta";
  numero.htmlFor = `enunciado-${contador_grupos}`; // conecta el label con su textarea

  const boton_quitar_pregunta = document.createElement("button");
  boton_quitar_pregunta.type = "button";
  boton_quitar_pregunta.className = "boton-peligro boton-pequeno";
  boton_quitar_pregunta.textContent = "Quitar pregunta";
  boton_quitar_pregunta.addEventListener("click", function () {
    bloque.remove();
    renumerarPreguntas(); // la 3 pasa a ser la 2, etc.
  });

  cabecera.appendChild(numero);
  cabecera.appendChild(boton_quitar_pregunta);

  const enunciado = document.createElement("textarea");
  enunciado.id = `enunciado-${contador_grupos}`;
  enunciado.className = "enunciado";
  enunciado.rows = 2;
  enunciado.placeholder = "Escribe la pregunta";
  enunciado.value = pregunta.enunciado;

  const lista_respuestas = document.createElement("div");
  lista_respuestas.className = "lista-respuestas";

  // Pintamos las respuestas que ya tenga la pregunta
  pregunta.respuestas.forEach(function (respuesta) {
    agregarFilaRespuesta(lista_respuestas, nombre_grupo, respuesta);
  });

  const boton_agregar_respuesta = document.createElement("button");
  boton_agregar_respuesta.type = "button";
  boton_agregar_respuesta.className = "boton-secundario boton-pequeno";
  boton_agregar_respuesta.textContent = "+ Agregar respuesta";
  boton_agregar_respuesta.addEventListener("click", function () {
    // closure: este botón recuerda SU lista_respuestas y SU nombre_grupo
    agregarFilaRespuesta(lista_respuestas, nombre_grupo, { texto: "", esCorrecta: false });
  });

  bloque.appendChild(cabecera);
  bloque.appendChild(enunciado);
  bloque.appendChild(lista_respuestas);
  bloque.appendChild(boton_agregar_respuesta);
  editor_preguntas.appendChild(bloque);

  renumerarPreguntas();
}

// Recorre los bloques y escribe "Pregunta 1", "Pregunta 2"...
function renumerarPreguntas() {
  const numeros = editor_preguntas.querySelectorAll(".numero-pregunta");
  // querySelectorAll devuelve una lista que también tiene forEach
  numeros.forEach(function (numero, indice) {
    numero.textContent = `Pregunta ${indice + 1}`;
  });
}

// Una pregunta "en blanco" con 2 respuestas vacías
function preguntaVacia() {
  return {
    enunciado: "",
    respuestas: [
      { texto: "", esCorrecta: false },
      { texto: "", esCorrecta: false }
    ]
  };
}

boton_agregar_pregunta.addEventListener("click", function () {
  agregarBloquePregunta(preguntaVacia());
});

// =============================================================
// Abrir / cerrar el formulario (crear o editar)
// =============================================================
function abrirFormulario(examen) {
  formulario.reset();
  editor_preguntas.innerHTML = "";
  caja_errores.hidden = true;
  mensaje_estado.hidden = true;

  if (examen === null) {
    codigo_editando = null;
    titulo_form.textContent = "Nuevo examen";
    input_codigo.disabled = false;
    agregarBloquePregunta(preguntaVacia()); // empieza con una pregunta
  } else {
    codigo_editando = examen.codigo;
    titulo_form.textContent = `Editar: ${examen.titulo}`;
    input_codigo.value = examen.codigo;
    input_codigo.disabled = true; // el código es la "llave": no se cambia
    input_titulo.value = examen.titulo;
    input_tiempo.value = examen.tiempo;
    input_porcentaje.value = examen.porcentajeAprobacion;
    input_descripcion.value = examen.descripcion;
    examen.preguntas.forEach(function (pregunta) {
      agregarBloquePregunta(pregunta);
    });
  }

  seccion_form.hidden = false;
  seccion_form.scrollIntoView({ behavior: "smooth" });
}

function cerrarFormulario() {
  seccion_form.hidden = true;
  editor_preguntas.innerHTML = "";
  codigo_editando = null;
}

boton_nuevo.addEventListener("click", function () {
  abrirFormulario(null);
});
boton_cancelar.addEventListener("click", cerrarFormulario);

// =============================================================
// LEER el editor → arreglo de preguntas (el camino inverso a pintarlo)
// =============================================================
function leerPreguntasDelFormulario() {
  const preguntas = [];
  const bloques = editor_preguntas.querySelectorAll(".bloque-pregunta");

  bloques.forEach(function (bloque) {
    const respuestas = [];
    const filas = bloque.querySelectorAll(".fila-respuesta");
    filas.forEach(function (fila) {
      respuestas.push({
        texto: fila.querySelector(".texto-respuesta").value.trim(),
        esCorrecta: fila.querySelector('input[type="radio"]').checked
      });
    });

    preguntas.push({
      enunciado: bloque.querySelector(".enunciado").value.trim(),
      respuestas: respuestas
    });
  });

  return preguntas;
}

// =============================================================
// Validación → arreglo de errores (vacío = todo bien)
// =============================================================
function validar(examen) {
  const errores = [];

  if (examen.codigo === "") {
    errores.push("El código es obligatorio.");
  } else if (codigo_editando === null) {
    const repetido = examenes.some(function (e) {
      return e.codigo === examen.codigo;
    });
    if (repetido) {
      errores.push(`Ya existe un examen con el código ${examen.codigo}.`);
    }
  }

  if (examen.titulo === "") {
    errores.push("El título es obligatorio.");
  }

  // Number.isInteger: ¿es un número entero? (rechaza 2.5, NaN, etc.)
  if (!Number.isInteger(examen.tiempo) || examen.tiempo < 1 || examen.tiempo > 300) {
    errores.push("El tiempo debe ser un número entero entre 1 y 300 minutos.");
  }

  if (!Number.isInteger(examen.porcentajeAprobacion) ||
      examen.porcentajeAprobacion < 1 || examen.porcentajeAprobacion > 100) {
    errores.push("El porcentaje de aprobación debe ser un entero entre 1 y 100.");
  }

  if (examen.preguntas.length === 0) {
    errores.push("El examen debe tener al menos una pregunta.");
  }

  // Revisamos cada pregunta y decimos CUÁL tiene el problema
  examen.preguntas.forEach(function (pregunta, indice) {
    const n = indice + 1;

    if (pregunta.enunciado === "") {
      errores.push(`Pregunta ${n}: escribe el enunciado.`);
    }
    if (pregunta.respuestas.length < 2) {
      errores.push(`Pregunta ${n}: debe tener al menos 2 respuestas.`);
    }

    let vacias = 0;
    let correctas = 0;
    pregunta.respuestas.forEach(function (respuesta) {
      if (respuesta.texto === "") {
        vacias = vacias + 1;
      }
      if (respuesta.esCorrecta) {
        correctas = correctas + 1;
      }
    });

    if (vacias > 0) {
      errores.push(`Pregunta ${n}: hay ${vacias} respuesta(s) sin texto.`);
    }
    // Regla del PDF: SOLO UNA respuesta correcta por pregunta.
    // (Los radios ya impiden marcar 2; aquí cubrimos el caso de 0.)
    if (correctas !== 1) {
      errores.push(`Pregunta ${n}: marca cuál es la respuesta correcta.`);
    }
  });

  return errores;
}

function mostrarErrores(errores) {
  caja_errores.innerHTML = "";
  const titulo = document.createElement("p");
  titulo.textContent = "Revisa lo siguiente:";
  const lista = document.createElement("ul");
  errores.forEach(function (texto) {
    const item = document.createElement("li");
    item.textContent = texto;
    lista.appendChild(item);
  });
  caja_errores.appendChild(titulo);
  caja_errores.appendChild(lista);
  caja_errores.hidden = false;
  caja_errores.scrollIntoView({ behavior: "smooth", block: "center" });
}

// =============================================================
// CREATE / UPDATE
// =============================================================
formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const examen = {
    // toUpperCase: "geo-01" y "GEO-01" son el mismo código
    codigo: input_codigo.value.trim().toUpperCase(),
    titulo: input_titulo.value.trim(),
    tiempo: Number(input_tiempo.value),            // el input da texto → número
    porcentajeAprobacion: Number(input_porcentaje.value),
    descripcion: input_descripcion.value.trim(),
    preguntas: leerPreguntasDelFormulario()
  };

  // Un input vacío da Number("") = 0, y 0 no pasa la validación ✅
  const errores = validar(examen);
  if (errores.length > 0) {
    mostrarErrores(errores);
    return;
  }

  if (codigo_editando === null) {
    examenes.push(examen);
    mostrarMensaje(`Examen "${examen.titulo}" creado.`);
  } else {
    const posicion = examenes.findIndex(function (e) {
      return e.codigo === codigo_editando;
    });
    examen.codigo = codigo_editando; // por seguridad, el código no cambia
    examenes[posicion] = examen;
    mostrarMensaje(`Examen "${examen.titulo}" actualizado.`);
  }

  guardar("examenes", examenes);
  pintarTabla();
  cerrarFormulario();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// =============================================================
// DELETE
// =============================================================
function eliminarExamen(examen) {
  const confirmar = confirm(`¿Eliminar el examen "${examen.titulo}" (${examen.codigo})? Esta acción no se puede deshacer.`);
  if (!confirmar) {
    return;
  }
  examenes = examenes.filter(function (e) {
    return e.codigo !== examen.codigo;
  });
  guardar("examenes", examenes);
  pintarTabla();
  cerrarFormulario();
  mostrarMensaje(`Examen "${examen.titulo}" eliminado.`);
}

// ----- Arranque -----
pintarTabla();
