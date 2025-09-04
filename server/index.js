"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const nanoid_1 = require("nanoid");
const path_1 = __importDefault(require("path"));
const PORT = process.env.PORT || 8080;
const usersCollection = db_1.firestore.collection("users");
const salasCollection = db_1.firestore.collection("salas");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.use(express_1.default.static(path_1.default.join(__dirname, "../dist")));
app.post("/users", (req, res) => {
    const userId = (0, nanoid_1.nanoid)();
    const name = req.body.name;
    if (!name) {
        return res.status(400).json({ error: "El nombre es requerido" });
    }
    usersCollection.doc(userId).set({
        name: name,
        id: userId
    })
        .then(() => {
        res.json({ id: userId });
    })
        .catch((err) => {
        console.log(err, "Hay un error");
        res.status(500).json({ error: "No se pudo crear el usuario" });
    });
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
        const nuevaSala = db_1.rtdb.ref("salas/" + (0, nanoid_1.nanoid)());
        await nuevaSala.set({
            currentGame: {
                Jugador1: {
                    id: userId,
                    name: name,
                    online: true,
                    start: false,
                    choice: false
                },
                Jugador2: {
                    id: null,
                    name: null,
                    online: false,
                    start: false,
                    choice: false
                }
            },
            owner: userId
        });
        const idLargo = nuevaSala.key;
        const idCorto = (0, nanoid_1.nanoid)().slice(0, 5).toUpperCase();
        await salasCollection.doc(idCorto).set({ rtdbLongId: idLargo });
        res.json({ id: idCorto });
    }
    catch (error) {
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
    }
    catch (error) {
        res.status(500).json({ error: "Error interno del servidor" });
    }
});
app.get(/.*/, (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../dist", "index.html"));
});
app.listen(PORT, () => {
    console.log(`Listening at: -> http://localhost:${PORT} <-`);
});
