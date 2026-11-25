// =============================================================
// <app-nav>  →  Web Component: barra de navegación de TODAS las páginas
// -------------------------------------------------------------
// Uso en el HTML:
//   index.html         → <app-nav base=""></app-nav>
//   pages/*.html       → <app-nav base="../"></app-nav>
// El atributo "base" dice cómo llegar a la raíz del proyecto desde
// la página actual (las rutas relativas cambian según la carpeta).
//
// Ventaja: el menú se escribe UNA vez aquí y no copiado en 4 HTML.
// Si mañana agregamos un enlace, se cambia en un solo lugar.
// =============================================================
import { obtenerSesion, cerrarSesion } from "../auth.js";

class AppNav extends HTMLElement {

  connectedCallback() {
    // getAttribute lee un atributo del HTML: <app-nav base="../">
    // "|| """ → si no lo pusieron, usamos texto vacío
    const base = this.getAttribute("base") || "";
    const sesion = obtenerSesion();

    this.innerHTML = ""; // por si se pinta dos veces

    const barra = document.createElement("header");
    barra.className = "barra";

    // Logo / nombre de la escuela → vuelve al inicio
    const marca = document.createElement("a");
    marca.className = "marca";
    marca.href = base + "index.html";
    marca.textContent = "🎓 Acme School";
    barra.appendChild(marca);

    // <nav> + aria-label → los lectores de pantalla lo anuncian como "navegación principal"
    const menu = document.createElement("nav");
    menu.setAttribute("aria-label", "Principal");

    // Enlace público: siempre visible
    menu.appendChild(this.crearEnlace("Exámenes", base + "index.html"));

    if (sesion !== null) {
      // Con sesión: enlaces privados + nombre + cerrar sesión
      menu.appendChild(this.crearEnlace("Gestión de exámenes", base + "pages/examenes.html"));
      menu.appendChild(this.crearEnlace("Usuarios", base + "pages/usuarios.html"));

      const usuario = document.createElement("span");
      usuario.className = "barra-usuario";
      usuario.textContent = `${sesion.nombre} (${sesion.cargo})`;
      menu.appendChild(usuario);

      const boton_salir = document.createElement("button");
      boton_salir.type = "button";
      boton_salir.className = "boton-secundario";
      boton_salir.textContent = "Cerrar sesión";
      boton_salir.addEventListener("click", function () {
        cerrarSesion();
        location.href = base + "index.html";
      });
      menu.appendChild(boton_salir);
    } else {
      // Sin sesión: solo el enlace al login
      menu.appendChild(this.crearEnlace("Iniciar sesión", base + "pages/login.html"));
    }

    barra.appendChild(menu);
    this.appendChild(barra);
  }

  // Método auxiliar: crea un <a> y lo marca si es la página actual
  crearEnlace(texto, ruta) {
    const enlace = document.createElement("a");
    enlace.href = ruta;
    enlace.textContent = texto;

    // enlace.href devuelve la URL COMPLETA ya resuelta (http://.../pages/login.html)
    // Si coincide con la página en la que estamos → aria-current="page"
    // (accesibilidad + nos sirve para resaltarlo con CSS)
    const pagina_actual = location.pathname.endsWith("/") ? location.pathname + "index.html" : location.pathname;
    if (new URL(enlace.href).pathname === pagina_actual) {
      enlace.setAttribute("aria-current", "page");
    }
    return enlace;
  }
}

customElements.define("app-nav", AppNav);
