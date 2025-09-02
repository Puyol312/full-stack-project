import "../../components/hands/hands";
import "../../components/encabezado/encabezado"
import "./loby.css";
import { State, Resultado } from "../../state";

export function initLoby(router:any):HTMLElement{
  const div = document.createElement("div");
  const state = State.getInstance();
  div.classList.add("loby-container")
  div.innerHTML = `  
  <!-- Encabezado con nombres y scores -->
  <x-encabezado></x-encabezado>
  <!-- Mensaje de compartir código -->
  <h1>
    Comparti el código:<br>
    <span class="room-id"></span><br>
    Con tu contrincante
  </h1>

  <!-- Elemento que queda pegado al piso -->
  <multi-hand></multi-hand>
  `;
  const updateRoomId = () => {
    const span = div.querySelector<HTMLSpanElement>(".room-id");
    if (span) {
      span.textContent = state.getHistory().roomId ?? "Esperando sala...";
    }
  };
  div.querySelector("x-encabezado")?.addEventListener("sala-completa", (e: Event) => {
    const evento = e as CustomEvent;
    router.goTo("/rules");
  });
  state.subscribe(updateRoomId);
  updateRoomId();
  return div;
}