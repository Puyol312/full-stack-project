import "../../components/hands/hands";
import "../../components/encabezado/encabezado"
import { HandsEl } from "../../components/hands/hands";
import "./playground.css"
import { State } from "../../state";

export function initPlayground(router:any):HTMLElement{
  const div = document.createElement("div");
  div.classList.add("contenedor-rules")
  div.innerHTML = `
      <x-encabezado></x-encabezado>
      <div class="contenedor-rules-texto">
        <p>Esperando a que ${State.getInstance().getHistory().oponent} presione ¡Jugar!...</p>
      </div>
      <multi-hand></multi-hand>
  `;
  if (State.getInstance().getReady()) {
    router.goTo("/game")
  } else { 
    State.getInstance().subscribe(() => {
    if (State.getInstance().getReady()) {
      router.goTo("/game");
    }
  });
  }
  return div;
}