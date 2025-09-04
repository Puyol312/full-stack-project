import "../../components/button/button";
import "../../components/hands/hands";
import "../../components/encabezado/encabezado"
import { HandsEl } from "../../components/hands/hands";
import "./rules.css"
import { State } from "../../state";

export function initRules(router:any):HTMLElement{
  const div = document.createElement("div");
  div.classList.add("contenedor-rules")
  div.innerHTML = `
      <x-encabezado></x-encabezado>
      <div class="contenedor-rules-secundario">
        <div class="contenedor-rules-texto">
          <p>Presiona jugar y elegi: piedra, papel o tijera antes de que pasen los 3 segundos.</p>
        </div>
        <mi-boton id="jugar" name="¡Jugar!"></mi-boton>
      </div>
      <multi-hand></multi-hand>
  `;
  // State.getInstance().solveRules();
  div.querySelector("#jugar")?.addEventListener('click', () => {
    State.getInstance().aceptarReglas();
    if (State.getInstance().bothReady()) {
      setTimeout(() => {router.goTo('/game');}, 1000)
    } else {
      router.goTo('/playground');
    }
  });
  return div;
}