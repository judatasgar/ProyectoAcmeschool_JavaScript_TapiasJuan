import { examenesPrueba, usuariosPrueba } from "./datos-prueba.js";

export function leer(clave) {
  return JSON.parse(localStorage.getItem(clave)) || [];
}

export function guardar(clave, datos) {
  localStorage.setItem(clave, JSON.stringify(datos));
}

function inicializarDatos() {
  if (localStorage.getItem("examenes") === null) {
    guardar("examenes", examenesPrueba);
  }
  if (localStorage.getItem("usuarios") === null) {
    guardar("usuarios", usuariosPrueba);
  }
}

inicializarDatos();