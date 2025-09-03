import "../../components/hands/hands";
import "../../components/encabezado/encabezado"
import { HandsEl } from "../../components/hands/hands";
import "./playground.css"
import { State } from "../../state";

export function initPlayground(router: any): HTMLElement{
  const state = State.getInstance();
  const div = document.createElement("div");
  div.classList.add("contenedor-rules")
  div.innerHTML = `
      <x-encabezado></x-encabezado>
      <div class="contenedor-rules-texto">
        <p>Esperando a que ${state.getHistory().oponent} presione ¡Jugar!...</p>
      </div>
      <multi-hand></multi-hand>
  `;
  if (state.bothReady()) {
    router.goTo("/game");
  } else {
    const callbackPlay = () => { 
      if (state.bothReady()) { 
        state.unsubscribe(callbackPlay);
        router.goTo("/game");
      }
    }
    state.subscribe(callbackPlay)
  }
  return div;
}