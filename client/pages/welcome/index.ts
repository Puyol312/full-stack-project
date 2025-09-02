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
      Piedra<br>
      Papel <span>ó</span><br>
      Tijera
    </h1>
    <mi-boton name="Nuevo Juego" id="NuevoJuego"></mi-boton>
    <mi-boton name="Ingresar a una Sala" id="IngresarSala"></mi-boton>
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