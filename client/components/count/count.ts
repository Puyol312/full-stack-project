import { State } from "../../state";
import { aleatorySelection } from "../../utils/aleatorySelection";

class CircleCountdown extends HTMLElement {
  shadow = this.attachShadow({ mode: "open" });
  counter = 5;
  intervalId: number | null = null;

  connectedCallback() {
    this.render();
    this.startCountdown();
  }

  startCountdown() {
    this.intervalId = setInterval(() => {
      this.counter--;

      const circle = this.shadow.querySelector(".circle");
      if (circle) {
        circle.classList.remove("pulse");
        
        // Forzar reflow para reiniciar la animación
        void (circle as HTMLElement).offsetWidth;
        circle.classList.add("pulse");
        circle.textContent = this.counter > 0 ? String(this.counter) : "";
      }

      if (this.counter === 0) {
        this.stop();
        this.dispatchEvent(new CustomEvent("countdown-finished", {
          bubbles: true,
          composed: true
        }));
      }
    }, 1000);
  }

  stop() {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  render() {
    this.shadow.innerHTML = `
      <style>
        .circle {
          font-family: var(--default-font-family);
          width: 243px;
          height: 243px;
          border: 23px solid black;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 100px;
          font-weight: bold;
          box-sizing: border-box;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }

        .pulse {
          animation: pulseAnim 0.3s ease;
        }

        @keyframes pulseAnim {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      </style>
      <div class="circle">${this.counter}</div>
    `;

    State.getInstance().subscribe(() => {
      if(State.getInstance().getState().myPlay)
        this.stop();
    });
  }
}

customElements.define("circle-countdown", CircleCountdown);
export { CircleCountdown };