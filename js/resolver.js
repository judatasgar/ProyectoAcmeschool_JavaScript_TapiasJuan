import { leer } from "./storage.js";
const examenes = leer("examenes");
const lista_examenes = document.getElementById("lista-examenes");
let examen_actual = null;

const seccion_lista = document.getElementById("seccion-lista");
const seccion_estudiante = document.getElementById("seccion-estudiante");
const titulo_examen_elegido = document.getElementById("titulo-examen-elegido");
const mensaje_error = document.getElementById("mensaje-error");
const input_identificacion = document.getElementById("input-identificacion");
const input_nombre = document.getElementById("input-nombre");
const formulario_estudiante = document.getElementById("form-estudiante");

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

        const titulo = document.createElement("h2");
        titulo.textContent = examen.titulo;

        const tiempo = document.createElement("p");
        tiempo.textContent = `Tiempo: ${examen.tiempo} minutos`;

        const aprobacion = document.createElement("p");
        aprobacion.textContent = `Porcentaje de aprobación: ${examen.porcentajeAprobacion}%`;

        const boton_presentar_examen = document.createElement("button");
        boton_presentar_examen.textContent = "Presentar examen";
        boton_presentar_examen.addEventListener("click", function () {
            examen_actual = examen;
            seccion_lista.hidden = true;
            seccion_estudiante.hidden = false;
            titulo_examen_elegido.textContent = examen.titulo;
            console.log(`Examen seleccionado: ${examen_actual.codigo}`);
        }
        );

        tarjeta.appendChild(titulo);
        tarjeta.appendChild(tiempo);
        tarjeta.appendChild(aprobacion);
        tarjeta.appendChild(boton_presentar_examen);
        lista_examenes.appendChild(tarjeta);

    });
}

pintarListaExamenes();

formulario_estudiante.addEventListener("submit", function (evento) {
    evento.preventDefault();
    const identificacion = input_identificacion.value.trim();
    const nombre = input_nombre.value.trim();
    if (identificacion === "" || nombre === "") {
        mensaje_error.textContent = "Complete todos los campos de identificación y nombre";
        mensaje_error.hidden = false;
        return;
    }

    mensaje_error.textContent = "";
    mensaje_error.hidden = true;
    const estudiante = {
        identificacion: identificacion,
        nombre: nombre
    }
    console.log(estudiante, examen_actual.codigo)
}
);




