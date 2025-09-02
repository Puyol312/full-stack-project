import { State, Resultado } from "../../state";

class Encabezado extends HTMLElement {
  shadow = this.attachShadow({ mode: "open" });
  constructor() { 
    super();
  }
  
  connectedCallback() { 
    this.render()
    State.getInstance().subscribe(() => { 
      this.render();
    })
  }
  
  render() {
    const state = State.getInstance();
    const dataHistory = state.getHistory().games;
    let localScore:number = 0;
    let oponentScore:number = 0;
    for (const game of dataHistory) {
      if (state.whoWins(game.myPlay,game.computerPlay) === Resultado.ganar){
        localScore++;
      } else if (state.whoWins(game.myPlay,game.computerPlay) === Resultado.perder) { 
        oponentScore++;
      }
    }
    const localName = state.getUser()?.name || "Jugador";
    const oponentName = state.getHistory().oponent || "Esperando...";
    const idSala = state.getHistory().roomId || "Conectando...";
    const div = document.createElement("div");
    const style = document.createElement("style"); 
    style.innerHTML = `
      .loby_encabezado {
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
        align-items: center;
        font-weight: 700;
        font-size: 24px;
      }

      .loby_encabezado span {
        color: #FF6442;
        font-weight: 700;
        font-size: 24px;
      }
    `;
    div.classList.add("loby_encabezado");
    div.innerHTML = `
        <div>
          ${localName}:${localScore}<br>
          <span>${oponentName}:${oponentScore}</span><br>
        </div>
        <div>
          <strong>Sala:</strong><br>
          ${idSala}
        </div>
    `;
    this.shadow.innerHTML = "";
    this.shadow.appendChild(style);
    this.shadow.appendChild(div);
    if (localName && (state.getHistory().oponent)) {
      this.dispatchEvent(
          new CustomEvent("sala-completa", {
            detail: { mensaje: "Esta la sala completa" },
            bubbles: true,
            composed: true 
          })
        );
    }
  }
}
customElements.define("x-encabezado", Encabezado);
export { Encabezado }