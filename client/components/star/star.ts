export class StarEl extends HTMLElement {
  shadow = this.attachShadow({ mode: "open" });

  constructor() {
    super();
    this.render();
  }

  render() {
    const type = this.getAttribute("type") || "draw";
    const color =
      type === "win" ? "#6CB46C" :
      type === "lose" ? "#DC5B49" :
      "#999999";

    const style = document.createElement("style");
    const div = document.createElement("div");
    const span = document.createElement("span");

    style.innerHTML = `
      .container {
        position: relative;
        display: inline-block;
        width: 254px;
        height: 259px;
        opacity: 1;
        animation: fadeIn 0.5s ease;
      }
      .overlay {
        font-family: var(--default-font-family);
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        font-weight: bold;
        text-align: center;
        font-size: 55px;
        line-height: 100%;
        padding: 10px;
        border-radius: 10px; /* Bordes redondeados */
      }
      svg {
        width: 100%;
        height: 100%;
        display: block;
        filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.5)); /* Sombra */
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;

    div.className = "container";
    span.className = "overlay";
    span.textContent =
      type === "win" ? "Ganaste" :
      type === "lose" ? "Perdiste" :
      "Empataste";

    const svg = `
      <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
        <polygon 
          points="32,4 39,24 60,24 42,38 48,58 32,46 16,58 22,38 4,24 25,24"
          fill="${color}"
          stroke="#000000"
          stroke-width="2"
          vector-effect="non-scaling-stroke"
        />
      </svg>
    `;

    div.innerHTML = svg;
    div.appendChild(span);

    this.shadow.innerHTML = "";
    this.shadow.appendChild(style);
    this.shadow.appendChild(div);
  }
}

customElements.define("mi-star", StarEl);