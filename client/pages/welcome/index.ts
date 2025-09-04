import "../../components/hands/hands";
import "../../components/button/button";
import "./welcome.css"
import { State } from "../../state";

export function initWelcome(router: any): HTMLElement{
  const state = State.getInstance();
  const div = document.createElement("div");
  div.classList.add("welcome-container")
  div.innerHTML = `
    <h1>
      Piedra Papel <span>ó</span> Tijera
    </h1>
    <div class="contenedor-botones">
      <mi-boton class="botones-welcome" name="Nuevo Juego" id="NuevoJuego"></mi-boton>
      <mi-boton class="botones-welcome" name="Ingresar a una Sala" id="IngresarSala"></mi-boton>
    </div>
    <multi-hand></multi-hand>
  `;
  div.querySelector("#NuevoJuego")?.addEventListener('click',() => {
    if (state.getUser() === null) { 
      router.goTo('/nuevo-juego');
    } else { 
      if (state.getHistory().roomId)
        router.goTo('/loby');
      else {
        state.createSala(state.getUser()?.id || "SinNombre");
        router.goTo('/loby');
      }
    }
  });
  div.querySelector("#IngresarSala")?.addEventListener('click', () => {
    router.goTo('/salas');
  });
  return div;
}