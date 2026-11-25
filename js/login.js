// =============================================================
// login.js → validar correo y contraseña contra los usuarios guardados
// =============================================================
import { leer } from "./storage.js";
import { iniciarSesion, obtenerSesion } from "./auth.js";
import "./componentes/app-nav.js";

// Si ya hay sesión, no tiene sentido mostrar el login → directo a la gestión
if (obtenerSesion() !== null) {
  location.replace("examenes.html");
}

const formulario_login = document.getElementById("form-login");
const input_email = document.getElementById("input-email");
const input_password = document.getElementById("input-password");
const login_error = document.getElementById("login-error");

function mostrarError(texto) {
  login_error.textContent = texto;
  login_error.hidden = false;
}

formulario_login.addEventListener("submit", function (evento) {
  evento.preventDefault();

  // toLowerCase(): "Admin@ACME.edu" y "admin@acme.edu" son el mismo correo
  const email = input_email.value.trim().toLowerCase();
  const password = input_password.value; // la contraseña NO se recorta: los espacios cuentan

  // Guarda 1: campos vacíos
  if (email === "" || password === "") {
    mostrarError("Escribe tu correo y tu contraseña.");
    return;
  }

  // find() recorre el arreglo y devuelve el PRIMER usuario que cumpla
  // la condición, o undefined si ninguno la cumple.
  const usuarios = leer("usuarios");
  const usuario = usuarios.find(function (u) {
    return u.email.toLowerCase() === email && u.password === password;
  });

  // Guarda 2: credenciales incorrectas.
  // Seguridad: NO decimos si falló el correo o la contraseña;
  // así nadie puede averiguar qué correos existen.
  if (usuario === undefined) {
    mostrarError("Correo o contraseña incorrectos.");
    input_password.value = "";
    input_password.focus();
    return;
  }

  // Camino feliz
  iniciarSesion(usuario);
  location.href = "examenes.html";
});
