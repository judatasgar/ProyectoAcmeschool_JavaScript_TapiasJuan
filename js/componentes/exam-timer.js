// =============================================================
// <exam-timer>  →  Web Component: reloj de cuenta regresiva
// -------------------------------------------------------------
// Un Web Component es una ETIQUETA HTML INVENTADA por nosotros.
// Se escribe en el HTML como cualquier otra:  <exam-timer></exam-timer>
// y su comportamiento vive en esta clase.
//
// Cómo se usa desde otro archivo:
//    reloj.iniciar(10);   → empieza a contar 10 minutos
//    reloj.detener();     → lo para
//    reloj.addEventListener("tiempo-agotado", ...)  → avisa al llegar a 00:00
// =============================================================

// "class ... extends HTMLElement" es OBLIGATORIO para crear una etiqueta propia:
// le dice al navegador "esto es un elemento HTML, con todo lo que eso trae".
class ExamTimer extends HTMLElement {

  // constructor: se ejecuta UNA vez, cuando el navegador crea la etiqueta.
  constructor() {
    super(); // obligatorio: primero se construye la parte de "HTMLElement"
    this.intervalo = null; // aquí guardaremos el setInterval para poder pararlo
    this.fin = 0;          // momento (en milisegundos) en que se acaba el tiempo
  }

  // connectedCallback: se ejecuta cuando la etiqueta ENTRA en la página.
  connectedCallback() {
    // role="timer" → los lectores de pantalla saben que esto es un reloj
    this.setAttribute("role", "timer");
    this.setAttribute("aria-label", "Tiempo restante");
    this.textContent = "--:--";
  }

  // disconnectedCallback: se ejecuta si la etiqueta SALE de la página.
  // Paramos el reloj para que no siga corriendo "en el aire".
  disconnectedCallback() {
    this.detener();
  }

  iniciar(minutos) {
    this.detener(); // por si había un reloj anterior corriendo
    
    this.fin = Date.now() + minutos * 60 * 1000;

    this.actualizar(); // pintamos de una vez, sin esperar el primer segundo

    // ⚠️ Dentro de una "function" normal, "this" YA NO es el componente.
    // Por eso lo guardamos antes en una variable con otro nombre.
    const componente = this;

    // setInterval NO bloquea la página: programa la función cada 1000 ms
    // y mientras tanto el estudiante puede seguir marcando respuestas.
    this.intervalo = setInterval(function () {
      componente.actualizar();
    }, 1000);
  }

  actualizar() {
    // Math.max(0, ...) evita números negativos si nos pasamos un poquito
    const restante_ms = Math.max(0, this.fin - Date.now());
    const total_segundos = Math.ceil(restante_ms / 1000);

    const minutos = Math.floor(total_segundos / 60); // división entera
    const segundos = total_segundos % 60;            // % = el residuo

    // padStart(2, "0") convierte 5 en "05" para que se vea 09:05
    this.textContent =
      String(minutos).padStart(2, "0") + ":" + String(segundos).padStart(2, "0");

    // En el último minuto agregamos una clase CSS para ponerlo en rojo
    this.classList.toggle("reloj-urgente", total_segundos <= 60);

    if (restante_ms === 0) {
      this.detener();
      // Disparamos NUESTRO PROPIO evento. Quien use el componente
      // lo escucha igual que un "click":  reloj.addEventListener("tiempo-agotado", ...)
      this.dispatchEvent(new CustomEvent("tiempo-agotado"));
    }
  }

  detener() {
    if (this.intervalo !== null) {
      clearInterval(this.intervalo); // apaga el setInterval
      this.intervalo = null;
    }
  }
}

// Registramos la etiqueta: desde ahora el navegador entiende <exam-timer>.
// Regla del estándar: el nombre DEBE llevar un guion (-).
customElements.define("exam-timer", ExamTimer);