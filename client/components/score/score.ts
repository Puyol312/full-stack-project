import { State, Resultado } from "../../state";

class Score extends HTMLElement {
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
    let myScore:number = 0;
    let computerScore:number = 0;
    for (const game of dataHistory) {
      if (state.whoWins(game.myPlay,game.computerPlay) === Resultado.ganar){
        myScore++;
      } else if (state.whoWins(game.myPlay,game.computerPlay) === Resultado.perder) { 
        computerScore++;
      }
    }
    const div = document.createElement("div");
    const style = document.createElement("style"); 
    style.innerHTML = `
      .contenedor-score {
      font-family: var(--default-font-family);
      width: 259px;
      height: 217px;
      border-radius: 10px;
      border: solid 10px;
      padding: 28px 30px;
      background-color: #FFFFFF;
      box-sizing: border-box;
      overflow-wrap: break-word;
    }
    .contenedor-score > h3 {
      text-align: center;
      font-weight: 400;
      font-size: 55px;
      line-height: 100%;
      margin: 0;
    }
    .contenedor-score > p {
      text-align: right;
      font-weight: 400;
      font-size: 45px;
      line-height: 100%;
      margin: 0;
      white-space: normal;
    }
    `;
    div.classList.add("contenedor-score");
    div.innerHTML = `
    <h3>Score</h3>
    <p>${state.getUser()?.name}: ${myScore}</p>
    <p>${state.getHistory()?.oponent}: ${computerScore}</p>
    `;
    this.shadow.innerHTML = "";
    this.shadow.appendChild(style);
    this.shadow.appendChild(div);
  }
}
customElements.define("score-box", Score);
export { Score }