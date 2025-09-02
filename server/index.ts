import express from "express";
import cors from "cors"
import { firestore, rtdb } from "./db";
import { nanoid } from "nanoid";

const PORT = process.env.PORT || 8080;
const usersCollection = firestore.collection("users");
const salasCollection = firestore.collection("salas");

const app = express();

app.use(express.json());
app.use(cors());

app.post("/users", (req, res) => {
  const userId = nanoid();
  const name = req.body.name;
  if (!name) {
    return res.status(400).json({ error: "El nombre es requerido" });
  }
  usersCollection.doc(userId).set({
    name: name,
    id:userId
  })
    .then(() => { 
      res.json({id: userId });
    })
    .catch((err) => {
      console.log(err, "Hay un error");
      res.status(500).json({ error: "No se pudo crear el usuario" });
    })
});
app.post("/salas", async (req, res) => {
  const userId = req.body.id;
  if (!userId) {
    return res.status(400).json({ error: "El ID del usuario es requerido" });
  }
  try {
    const user = await usersCollection.doc(userId).get();
    if (!user.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    const name = user.data()?.name;
    const nuevaSala = rtdb.ref("salas/" + nanoid());
    await nuevaSala.set({
      currentGame: {
        Jugador1: {
          id: userId,
          name: name,
          online: true,
          start: false,
          choise: false
        },
        Jugador2: {
          id: null,
          name: null,
          online: false,
          start: false,
          choise: false
        }
      },
      owner: userId
    });
    const idLargo = nuevaSala.key;
    const idCorto = nanoid().slice(0, 5).toUpperCase();
    await salasCollection.doc(idCorto).set({ rtdbLongId: idLargo });
    res.json({ id: idCorto });
  } catch (error) {
    res.status(500).json({ error: "Error al crear la sala" });
  }
});

app.get("/salas/:id", async (req, res) => {
  const id = req.params.id;
  const idCorto = String(req.query.salaID);

  if (!id || !idCorto) {
    return res.status(400).json({ error: "ID requerido" });
  }

  try {
    const user = await usersCollection.doc(id).get();
    if (!user.exists) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    const sala = await salasCollection.doc(idCorto).get();
    if (!sala.exists) {
      return res.status(404).json({ error: "Sala no encontrada" });
    }

    res.json({ idLargo: sala.data()?.rtdbLongId });
  } catch (error) {
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.listen(PORT, () => {
  console.log(`Listening at: -> http://localhost:${PORT} <-`);
});