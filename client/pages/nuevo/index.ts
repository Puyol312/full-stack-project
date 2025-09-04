import "../../components/hands/hands";
import "../../components/button/button";
import "./nuevo.css"
import { State } from "../../state";

export function initNuevo(router:any):HTMLElement{
  const div = document.createElement("div");
  div.classList.add("nuevo-container")
  div.innerHTML = `
    <h1>
      Piedra Papel <span>ó</span> Tijera
    </h1>
    <div class="contenedor-secundario-nuevo">
      <form class="form_nuevo">
        <div class="contenedor_label">
          <label for="nombre" class="label_form">Tu nombre</label>
        </div>

          <input 
            type="text" 
            class="input_element"
            id="nombre" 
            name="nombre" 
            placeholder="Escribe tu nombre" 
            required
          >
          <button id="NuevoNombre" type="submit" class="button_element">Empezar</button>
      </form>
    </div>
    <multi-hand></multi-hand>
  `;
  const form = div.querySelector("form");

  form?.addEventListener("submit", async function (event) {
    event.preventDefault();
    const formData = new FormData(form);
    const nombre = formData.get("nombre") as string;
    try {
      await State.getInstance().setUser(nombre, true);
      router.goTo("/loby");
    } catch (error) { 
      throw new Error('Error con la respuesta del servidor: ' + error);
    }
  });
  return div;
}