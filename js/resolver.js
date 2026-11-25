// =============================================================
// resolver.js → módulo PÚBLICO: presentar un examen
// Flujo (4 pantallas en una sola página):
//   1. Lista  →  2. Datos del estudiante  →  3. Examen + reloj  →  4. Resultado
// =============================================================
import { leer, guardar } from "./storage.js";
import "./componentes/exam-timer.js"; // solo registra <exam-timer>, no importa nombres
import "./componentes/app-nav.js";    // barra de navegación

// ----- Datos y "cajas" compartidas entre eventos -----
const examenes = leer("examenes");
let examen_actual = null;      // lo llena el clic de "Presentar examen"
let estudiante_actual = null;  // lo llena el formulario del estudiante
let examen_terminado = false;  // candado: evita calificar 2 veces
                               // (clic en Terminar + tiempo agotado al mismo tiempo)

// ----- Pantalla 1: lista -----
const seccion_lista = document.getElementById("seccion-lista");
const lista_examenes = document.getElementById("lista-examenes");

// ----- Pantalla 2: estudiante -----
const seccion_estudiante = document.getElementById("seccion-estudiante");
const titulo_examen_elegido = document.getElementById("titulo-examen-elegido");
const formulario_estudiante = document.getElementById("form-estudiante");
const input_identificacion = document.getElementById("input-identificacion");
const input_nombre = document.getElementById("input-nombre");
const mensaje_error = document.getElementById("mensaje-error");
const boton_volver_estudiante = document.getElementById("btn-volver-estudiante");

// ----- Pantalla 3: examen -----
const seccion_examen = document.getElementById("seccion-examen");
const examen_titulo = document.getElementById("examen-titulo");
const examen_info = document.getElementById("examen-info");
const reloj = document.getElementById("reloj");
const formulario_examen = document.getElementById("form-examen");
const contenedor_preguntas = document.getElementById("contenedor-preguntas");

// ----- Pantalla 4: resultado -----
const seccion_resultado = document.getElementById("seccion-resultado");
const resultado_nota = document.getElementById("resultado-nota");
const resultado_estudiante = document.getElementById("resultado-estudiante");
const resultado_porcentaje = document.getElementById("resultado-porcentaje");
const resultado_estado = document.getElementById("resultado-estado");
const boton_volver_lista = document.getElementById("btn-volver-lista");

// =============================================================
// Utilidad: mostrar UNA pantalla y ocultar las otras 3.
// Antes escribíamos "hidden = true / false" a mano en cada evento.
// Con 4 pantallas eso se repite mucho → lo encerramos en una función
// =============================================================
function mostrarPantalla(seccion_a_mostrar) {
  const pantallas = [seccion_lista, seccion_estudiante, seccion_examen, seccion_resultado];
  pantallas.forEach(function (pantalla) {
    pantalla.hidden = true;
  });
  seccion_a_mostrar.hidden = false;
  window.scrollTo(0, 0); // que la nueva pantalla empiece desde arriba
}

// =============================================================
// PANTALLA 1: lista de exámenes (tu código del commit 4)
// =============================================================
function pintarListaExamenes() {
  lista_examenes.innerHTML = "";
  if (examenes.length === 0) {
    const mensaje_vacio = document.createElement("p");
    mensaje_vacio.textContent = "No hay exámenes disponibles";
    lista_examenes.appendChild(mensaje_vacio);
    return;
  }
  examenes.forEach(function (examen) {
    const tarjeta = document.createElement("article");
    tarjeta.className = "tarjeta";

    const titulo = document.createElement("h2");
    titulo.textContent = examen.titulo;

    const tiempo = document.createElement("p");
    tiempo.textContent = `Tiempo: ${examen.tiempo} minutos`;

    const aprobacion = document.createElement("p");
    aprobacion.textContent = `Porcentaje de aprobación: ${examen.porcentajeAprobacion}%`;

    const boton_presentar_examen = document.createElement("button");
    boton_presentar_examen.textContent = "Presentar examen";
    boton_presentar_examen.addEventListener("click", function () {
      examen_actual = examen; // closure: el botón recuerda SU examen
      titulo_examen_elegido.textContent = examen.titulo;
      formulario_estudiante.reset();   // vacía los inputs de un intento anterior
      mensaje_error.hidden = true;
      mostrarPantalla(seccion_estudiante);
      input_identificacion.focus();    // accesibilidad: el cursor va directo al campo
    });

    tarjeta.appendChild(titulo);
    tarjeta.appendChild(tiempo);
    tarjeta.appendChild(aprobacion);
    tarjeta.appendChild(boton_presentar_examen);
    lista_examenes.appendChild(tarjeta);
  });
}

// =============================================================
// PANTALLA 2: datos del estudiante
// =============================================================
formulario_estudiante.addEventListener("submit", function (evento) {
  evento.preventDefault();
  const identificacion = input_identificacion.value.trim();
  const nombre = input_nombre.value.trim();

  // Cláusula de guarda: primero descartamos el error
  if (identificacion === "" || nombre === "") {
    mensaje_error.textContent = "Complete todos los campos de identificación y nombre";
    mensaje_error.hidden = false;
    return;
  }

  mensaje_error.textContent = "";
  mensaje_error.hidden = true;

  // NUEVO: lo guardamos en la caja compartida (lo necesita el resultado al final)
  estudiante_actual = {
    identificacion: identificacion,
    nombre: nombre
  };
  iniciarExamen();
});

boton_volver_estudiante.addEventListener("click", function () {
  mostrarPantalla(seccion_lista);
});

// =============================================================
// PANTALLA 3: el examen
// =============================================================
function iniciarExamen() {
  examen_terminado = false; // abrimos el candado para este nuevo intento
  pintarExamen();
  mostrarPantalla(seccion_examen);
  reloj.iniciar(examen_actual.tiempo); // ← el Web Component hace el resto
}

function pintarExamen() {
  // 1. Encabezado
  const total_preguntas = examen_actual.preguntas.length;
  examen_titulo.textContent = examen_actual.titulo;
  examen_info.textContent =
    `${total_preguntas} preguntas · Aprobación: ${examen_actual.porcentajeAprobacion}%`;

  // 2. Vaciar lo que hubiera de un examen anterior
  contenedor_preguntas.innerHTML = "";

  // 3. forEach EXTERIOR: una vuelta por pregunta.
  //    El 2.º parámetro (indice_pregunta) es la posición: 0, 1, 2...
  examen_actual.preguntas.forEach(function (pregunta, indice_pregunta) {
    // <fieldset> agrupa una pregunta con sus opciones (accesibilidad)
    const grupo = document.createElement("fieldset");
    grupo.className = "pregunta";

    // <legend> es el "título" del fieldset → "1. ¿Cuál es...?"
    const enunciado = document.createElement("legend");
    enunciado.textContent = `${indice_pregunta + 1}. ${pregunta.enunciado}`;
    grupo.appendChild(enunciado);

    // forEach INTERIOR: una vuelta por respuesta DE ESTA pregunta.
    // Aquí adentro tenemos las dos cosas: la pregunta y la respuesta.
    pregunta.respuestas.forEach(function (respuesta, indice_respuesta) {
      const etiqueta = document.createElement("label");
      etiqueta.className = "opcion";

      const radio = document.createElement("input");
      radio.type = "radio";
      // Mismo name = mismo grupo → el navegador solo deja marcar UNO.
      // Por eso el name lleva el número de la pregunta.
      radio.name = `pregunta-${indice_pregunta}`;
      // value = posición de la respuesta; lo leemos al calificar
      radio.value = indice_respuesta;

      const texto = document.createElement("span");
      texto.textContent = respuesta.texto;

      // El input DENTRO del label → clic en el texto también marca el radio
      etiqueta.appendChild(radio);
      etiqueta.appendChild(texto);
      grupo.appendChild(etiqueta);
    }); // ← cierra el forEach interior (respuestas)

    contenedor_preguntas.appendChild(grupo);
  }); // ← cierra el forEach exterior (preguntas)
}

// Clic en "Terminar"
formulario_examen.addEventListener("submit", function (evento) {
  evento.preventDefault(); // sin esto la página se recarga y se pierde todo

  const respuestas = obtenerRespuestasElegidas();

  // Contamos las preguntas sin responder (las que quedaron en null)
  let sin_responder = 0;
  respuestas.forEach(function (respuesta) {
    if (respuesta === null) {
      sin_responder = sin_responder + 1;
    }
  });

  // UX: avisar antes de entregar con preguntas en blanco.
  // confirm() muestra Aceptar/Cancelar y devuelve true o false.
  if (sin_responder > 0) {
    const seguir = confirm(
      `Tienes ${sin_responder} pregunta(s) sin responder. ¿Deseas terminar de todas formas?`
    );
    if (!seguir) {
      return; // "!" significa "NO": si NO quiere seguir, salimos
    }
  }

  finalizarExamen(false);
});

// Nuestro Web Component avisa cuando llega a 00:00
reloj.addEventListener("tiempo-agotado", function () {
  finalizarExamen(true);
});

// Devuelve un arreglo con la opción elegida en cada pregunta.
// Ej: [1, null, 0] → pregunta 1 eligió la opción 1, la 2 quedó en blanco...
function obtenerRespuestasElegidas() {
  const elegidas = [];
  examen_actual.preguntas.forEach(function (pregunta, indice_pregunta) {
    // ":checked" = el radio que está marcado. Si no hay ninguno → null
    const marcada = formulario_examen.querySelector(
      `input[name="pregunta-${indice_pregunta}"]:checked`
    );
    if (marcada === null) {
      elegidas.push(null);
    } else {
      // value siempre es TEXTO ("1"); Number() lo convierte en número (1)
      elegidas.push(Number(marcada.value));
    }
  });
  return elegidas;
}

// =============================================================
// PANTALLA 4: calificar, guardar y mostrar el resultado
// =============================================================
function finalizarExamen(por_tiempo) {
  if (examen_terminado) {
    return; // el candado ya estaba cerrado → no calificamos 2 veces
  }
  examen_terminado = true;
  reloj.detener();

  const respuestas = obtenerRespuestasElegidas();

  // Contar correctas: para cada pregunta buscamos la respuesta elegida
  // y miramos su esCorrecta
  let correctas = 0;
  examen_actual.preguntas.forEach(function (pregunta, indice_pregunta) {
    const indice_elegido = respuestas[indice_pregunta];
    if (indice_elegido !== null && pregunta.respuestas[indice_elegido].esCorrecta) {
      correctas = correctas + 1;
    }
  });

  const total = examen_actual.preguntas.length;
  // Math.round redondea: 2 de 3 = 66.66... → 67
  const porcentaje = Math.round((correctas / total) * 100);
  const aprobado = porcentaje >= examen_actual.porcentajeAprobacion;

  // Objeto Resultado (el modelo que diseñamos en el PLAN)
  const resultado = {
    codigoExamen: examen_actual.codigo,
    identificacion: estudiante_actual.identificacion,
    nombre: estudiante_actual.nombre,
    respuestasElegidas: respuestas,
    porcentaje: porcentaje,
    aprobado: aprobado,
    fecha: new Date().toISOString() // fecha y hora en formato estándar
  };

  // Guardar: leer lo que había, agregar uno, volver a guardar
  const resultados = leer("resultados");
  resultados.push(resultado);
  guardar("resultados", resultados);

  pintarResultado(resultado, correctas, total, por_tiempo);
  mostrarPantalla(seccion_resultado);
}

function pintarResultado(resultado, correctas, total, por_tiempo) {
  // Operador ternario:  condición ? valor_si_true : valor_si_false
  resultado_nota.textContent = por_tiempo ? "⏰ Se acabó el tiempo. El examen se entregó automáticamente." : "";
  resultado_nota.hidden = !por_tiempo;

  resultado_estudiante.textContent =
    `${resultado.nombre} (${resultado.identificacion}) – ${examen_actual.titulo}`;
  resultado_porcentaje.textContent =
    `Respuestas correctas: ${correctas} de ${total} · Resultado: ${resultado.porcentaje}%`;

  if (resultado.aprobado) {
    resultado_estado.textContent = `✅ Aprobado (mínimo ${examen_actual.porcentajeAprobacion}%)`;
    resultado_estado.className = "estado estado-aprobado";
  } else {
    resultado_estado.textContent = `❌ No aprobado (mínimo ${examen_actual.porcentajeAprobacion}%)`;
    resultado_estado.className = "estado estado-reprobado";
  }
}

boton_volver_lista.addEventListener("click", function () {
  mostrarPantalla(seccion_lista);
});

// ----- Arranque -----
pintarListaExamenes();