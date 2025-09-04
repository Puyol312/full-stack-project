import "../../components/hands/hands";
import "./notFound.css"

export function initNotFound(router:any):HTMLElement{
  const div = document.createElement("div");
  div.classList.add("notFound-container")
  div.innerHTML = `
    <h1>
      Piedra<br>
      Papel <span>ó</span><br>
      Tijera
    </h1>
    <div class="contenedor-rules-texto">
      <p>Ups... prueba id equibocado o la sala esta llena, intenta otro codigo.</p>
    </div>
    <multi-hand></multi-hand>
  `;
  setTimeout(() => { 
    router.goTo("/welcome")
  },5000)
  return div;
}