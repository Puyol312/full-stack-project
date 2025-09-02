import "./result.css"
import { State, Resultado } from "../../state";
import "../../components/hand/hand";
import "../../components/star/star";
import "../../components/button/button";
import "../../components/score/score";

export function initResult(router: any): HTMLElement{
  const data = State.getInstance().getState();
  const div = document.createElement("div");
  div.classList.add("result-container");
  div.innerHTML = `
    <div class="hands-container">
      <single-hand type=${data.computerPlay}></single-hand>
      <single-hand type=${data.myPlay}></single-hand>
    </div>
  `;
  setTimeout(() => {
    const handsContainer = div.querySelector(".hands-container") as HTMLElement;
    if (handsContainer) handsContainer.style.display = "none"; 
    const resultado = State.getInstance().whoWins(data.myPlay, data.computerPlay);
    const type = resultado == Resultado.ganar ? "win" : resultado == Resultado.perder ? "lose" : "draw";

    div.insertAdjacentHTML(
      "beforeend",
      `
      <div class="result ${type}">
        <div class="star-container"><mi-star type=${type}></mi-star></div>
        <score-box></score-box>
        <mi-boton name="¡Volver a Jugar!"></mi-boton>
      </div>
      `
    );
    const boton = div.querySelector("mi-boton");
    boton?.addEventListener("click", (e) => {
      e.stopPropagation();
      State.getInstance().setReady();
      setTimeout(() => { router.goTo("./rules")}),1000});
  }, 2000);
  return div;
}