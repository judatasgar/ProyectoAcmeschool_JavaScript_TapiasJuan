import { leer } from "./storage.js";
const examenes = leer("examenes");
const lista_examenes = document.getElementById("lista-examenes");

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
            const examen_seleccionado = examen.codigo;
            console.log(`Examen seleccionado: ${examen_seleccionado}`);
        }
        );

        tarjeta.appendChild(titulo);
        tarjeta.appendChild(tiempo);
        tarjeta.appendChild(aprobacion);
        tarjeta.appendChild(boton_presentar_examen); lista_examenes.appendChild(tarjeta);

    });
}

pintarListaExamenes();
