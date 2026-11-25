// =============================================================
// auth.js → todo lo relacionado con la SESIÓN del usuario
// -------------------------------------------------------------
// ¿Por qué sessionStorage y no localStorage?
//   localStorage   → dura para siempre (hasta que se borre a mano)
//   sessionStorage → se borra al CERRAR el navegador o la pestaña
// Una sesión de login debe morir al cerrar el navegador → sessionStorage.
// =============================================================

const CLAVE_SESION = "sesion";

// Guarda quién inició sesión. NO guardamos la contraseña,
// solo lo que necesitamos mostrar (nombre, cargo...).
export function iniciarSesion(usuario) {
  const datos_sesion = {
    identificacion: usuario.identificacion,
    nombre: usuario.nombre,
    email: usuario.email,
    cargo: usuario.cargo
  };
  sessionStorage.setItem(CLAVE_SESION, JSON.stringify(datos_sesion));
}

// Devuelve el usuario de la sesión, o null si nadie ha iniciado sesión.
// (JSON.parse(null) da null, así que no hace falta el "|| []")
export function obtenerSesion() {
  return JSON.parse(sessionStorage.getItem(CLAVE_SESION));
}

export function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
}

// Se llama al INICIO de cada página privada (usuarios.html, examenes.html).
// Si no hay sesión: manda al login y DETIENE el resto del archivo.
export function protegerPagina() {
  if (obtenerSesion() === null) {
    // replace (en vez de href) → la página privada no queda en el historial,
    // así el botón "Atrás" no devuelve a ella.
    location.replace("login.html");
    // "throw" lanza un error a propósito: corta la ejecución del módulo
    // para que no se pinte nada de la página privada.
    throw new Error("Acceso denegado: no hay sesión iniciada");
  }
}
