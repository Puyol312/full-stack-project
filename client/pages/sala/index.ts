import "../../components/hands/hands";
import "../../components/button/button";
import "./sala.css"
import { State } from "../../state";

export function initSala(router: any): HTMLElement{
  const state = State.getInstance();
  const div = document.createElement("div");
  div.classList.add("sala-container");
  div.innerHTML = `
  <h1>
  Piedra<br>
  Papel <span>ó</span><br>
  Tijera
  </h1>
  <form class="form_sala">
  <div class="contenedor_label">
  <label for="nombre" class="label_form">Datos</label>
  </div>
  <input 
  type="text" 
  class="input_element"
  id="nombre" 
  name="nombre" 
  placeholder="Escribe tu nombre" 
  >
  <input 
  type="text" 
  class="input_element"
  id="sala" 
  name="sala" 
  placeholder="Escribe la sala" 
  required
  >
  <button id="salaNombre" type="submit" class="button_element">Empezar</button>
  </form>
  <multi-hand></multi-hand>
  `;
  const nombreInput = div.querySelector<HTMLInputElement>("#nombre");
  if (state.getUser() && nombreInput) {
    nombreInput.value = state.getUser()?.name || "Sin nombre";
    nombreInput.classList.add("completo");
  }

  // Manejar submit
  const form = div.querySelector<HTMLFormElement>("form");
  form?.addEventListener("submit", function (event) {
    event.preventDefault();
    const formData = new FormData(form);
    const sala = (formData.get("sala") as string).trim();

    if (!state.getUser()) {
      const nombre = (formData.get("nombre") as string)?.trim();
      if (!nombre) {
        alert("Por favor ingresa tu nombre");
        return;
      }
      state.setUser(nombre, false);
    }
    setTimeout(() => {
      state.conectarRTDB(sala);
      router.goTo("/rules");
    }, 2000);
  });
  return div;
}