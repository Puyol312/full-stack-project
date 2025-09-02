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
      <div class="contenedor-rules-texto">
        <p>Presiona jugar y elegi: piedra, papel o tijera antes de que pasen los 3 segundos.</p>
      </div>
      <mi-boton name="¡Jugar!"></mi-boton>
      <multi-hand></multi-hand>
  `;
  div.querySelector("mi-boton")?.addEventListener('click', () => {
    State.getInstance().iniciarJuego();
    router.goTo('/playground');
  })
  return div;
}