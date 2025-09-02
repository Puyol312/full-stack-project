import { Jugada } from "../../state"

function aleatorySelection(): Jugada {
  const opciones: Jugada[] = ["piedra", "papel", "tijera"];
  const index = Math.floor(Math.random() * opciones.length);
  return opciones[index];
}

export { aleatorySelection }