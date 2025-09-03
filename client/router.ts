import { initWelcome } from "./pages/welcome";
import { initNuevo } from "./pages/nuevo";
import { initLoby } from "./pages/loby";
import { initSala } from "./pages/sala";
import { initRules } from "./pages/rules";
import { initPlayground } from "./pages/playground";
import { initGame } from "./pages/game";
import { initResult } from "./pages/result";

var routes = [
  {
    path: /\/welcome/,
    component:initWelcome
  },
  {
    path: /\/nuevo-juego/,
    component:initNuevo
  },
  {
    path: /\/loby/,
    component:initLoby
  },
  {
    path: /\/salas/,
    component:initSala
  },
  {
    path: /\/rules/,
    component:initRules
  },
  {
    path: /\/playground/,
    component:initPlayground
  },
  {
    path: /\/game/,
    component:initGame
  },
  {
    path: /\/result/,
    component:initResult
  },
];
const basePath = "/piedra-papel-o-tiejeras";

export function initRouter(container: Element) {

  function goTo(path) { 
    history.pushState({}, "", basePath + path);
    handleRoute(getCurrentPath());
  }
  function getCurrentPath() {
    return location.pathname.replace(basePath, "") || "/";
  }
  function handleRoute(route) {
    let found = false;

    for (const r of routes) {
      if (r.path.test(route)) {
        const el = r.component({ goTo: goTo });
        if (container.firstChild) {
          container.firstChild.remove();
        }
        container.appendChild(el);
        found = true;
        break;
      }
    }

    // Si no se encontró ninguna ruta, redir a /welcome
    if (!found) {
      goTo("/welcome");
    }
  }

  if (getCurrentPath() == "/") {
    goTo("/welcome")
  } else { 
    handleRoute(getCurrentPath());
  }
  //para poder que funcione para atras y para adelante
  window.onpopstate = function (event) { 
    handleRoute(getCurrentPath());
  }
}