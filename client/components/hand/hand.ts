const piedraPNG = new URL("../../assets/img/piedra.png", import.meta.url).href;
const papelPNG = new URL("../../assets/img/papel.png", import.meta.url).href;
const tijeraPNG = new URL("../../assets/img/tijera.png", import.meta.url).href;

class Hand extends HTMLElement {
  shadow = this.attachShadow({ mode: "open" });
  
  constructor() { 
    super();
  }
  connectedCallback() { 
    this.render();
  }
  render() { 
    const type = this.getAttribute("type") || "";
    const style = document.createElement("style");
    const img = document.createElement("img");
    
    img.alt = type;
    img.src =  type === "piedra" ? piedraPNG : type === "papel" ? papelPNG : tijeraPNG;

    img.classList.add('hand-animation');

    style.innerHTML = `
  .hand-animation {
    width: auto; /* antes no tenía tamaño fijo */
    height: 190px;
    transition: transform 0.3s;
    cursor: pointer;
  }
  .hand-animation:hover {
    transform: scale(1.1);
  }
  .selectedHand {
    transform: scale(1.2);
    opacity: 1;
  }
  .notSelectedHand {
    opacity: 0.5;
  }
    `;
    this.shadow.innerHTML = "";
    this.shadow.appendChild(style);
    this.shadow.appendChild(img);
  }

  selectedHand() { 
    const img = this.shadow.querySelector('img');
    img?.classList.add('selectedHand');
    img?.classList.remove('notSelectedHand');
  }
  
  notSelectedHand() { 
    const img = this.shadow.querySelector('img');
    img?.classList.add('notSelectedHand');
    img?.classList.remove('selectedHand');
  }
}
customElements.define("single-hand", Hand);

export { Hand };