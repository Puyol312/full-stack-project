import { Hand } from "../hand/hand.ts";
import "../hand/hand.ts"
import { State,Jugada } from "../../state.ts";

class HandsEl extends HTMLElement { 
  shadow = this.attachShadow({ mode: "open" });
  constructor() { 
    super();
    this.render();
  }
  
  render() { 
    const div = document.createElement("div");
    const style = document.createElement("style");
    const tijeraHand = document.createElement("single-hand");
    const piedraHand = document.createElement("single-hand");
    const papelHand = document.createElement("single-hand");

    tijeraHand.setAttribute("type", "tijera");
    piedraHand.setAttribute("type", "piedra");
    papelHand.setAttribute("type", "papel");

    div.classList.add("contenedor-hands");
    style.innerHTML = `
    .contenedor-hands{
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: end;
      gap: 46px;
      width:100%;
      height: 100%;
    }
    `;
    
    div.appendChild(tijeraHand);
    div.appendChild(piedraHand);
    div.appendChild(papelHand);
    
    this.shadow.innerHTML = "";
    this.shadow.appendChild(style);
    this.shadow.appendChild(div);
  }
  activeSelector() {
    const tijeraHand = this.shadow.querySelector('single-hand[type="tijera"]');
    const piedraHand = this.shadow.querySelector('single-hand[type="piedra"]');
    const papelHand = this.shadow.querySelector('single-hand[type="papel"]');
    tijeraHand?.addEventListener('click', () => {
      this.selectedHand("tijera");
    });
    piedraHand?.addEventListener('click', () => {
      this.selectedHand("piedra");
    });
    papelHand?.addEventListener('click', () => {
      this.selectedHand("papel");
    });
  }
  selectedHand(election:Jugada) { 
    const hands = this.shadow.querySelectorAll("single-hand");
    hands?.forEach(hand => {
      const custom = hand as Hand;
      election === custom.getAttribute("type") ? custom.selectedHand() : custom.notSelectedHand();
    });
    State.getInstance().setMove(election);
  }
}

customElements.define("multi-hand", HandsEl);

export { HandsEl }