import "../../components/hands/hands";
import "../../components/count/count";
import { HandsEl } from "../../components/hands/hands";
import "./game.css"
import { State } from "../../state";
import { aleatorySelection } from "../../utils/aleatorySelection";

export function initGame(router: any): HTMLElement{
  const state = State.getInstance();
  const div = document.createElement("div");
  div.classList.add("contenedor-game")
  div.innerHTML = `
    <div class="contenedor-contador">
      <circle-countdown></circle-countdown>
    </div>
    <multi-hand></multi-hand>
  `;
  const manos = div.querySelector("multi-hand") as HandsEl;
  manos?.activeSelector();
  const el = div.querySelector("circle-countdown");
  el?.addEventListener("countdown-finished", (event) => {
    event.stopPropagation();
    state.setMove(aleatorySelection());
  });
  const callback = () => {
    if (state.esperarJugadaDelOponente()) { 
      state.saveHistory(state.getState());
      router.goTo("/result");
      state.unsubscribe(callback);
    }
  } 
  state.subscribe(callback);
  return div;
}