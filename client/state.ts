import { get, update } from "firebase/database";
import { database, ref, onValue } from "./rtdb";
//@ts-ignore
const apiUrl = process.env.API_URL ?? "http://localhost:8080";

type Jugada = "piedra" | "papel" | "tijera" | "";
type Game = {
  computerPlay:Jugada,
  myPlay:Jugada,
}
type History = {
  games: Game[],
  roomId?: string,
  oponent?: string
};
enum Resultado { 
  ganar,
  perder,
  empatar
}
type User = {
  name: string,
  id:string
}

class State {
  private static instance: State;
  private currentGame: Game;
  private history: History;
  private user: User | null;
  private ready:boolean;
  private listeners: (() => any)[];

  private constructor() { 
    // Intentar cargar desde localStorage
    const savedData = localStorage.getItem("gameState");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      this.currentGame = parsed.currentGame || { computerPlay: "", myPlay: "" };
      this.history = parsed.history || { games: [], roomId: undefined, oponent: undefined };
      this.user = parsed.user || null;
      this.ready = false;
    } else {
      this.currentGame = { computerPlay: "", myPlay: "" };
      this.history = { games: [], roomId: undefined , oponent: undefined};
      this.user = null;
      this.ready = false;
    }
    this.listeners = [];
  }

  private saveHistory(game: Game) { 
    if (game && game.computerPlay && game.myPlay) {
      this.history.games.push(game);
      this.saveToLocalStorage();
    }
  }

  private saveToLocalStorage() {
    localStorage.setItem(
      "gameState",
      JSON.stringify({
        currentGame: this.currentGame,
        history: this.history,
        user: this.user
      })
    );
  }

  private notify() { 
    for (const listener of this.listeners) {
      listener();
    }
  }

  public static getInstance(): State {
    if (!this.instance)
      this.instance = new State(); 
    return this.instance;
  }

  public getState(): Game { 
    return this.currentGame;
  }

  public getHistory(): History { 
    return { oponent: this.history.oponent , games: [...this.history.games], roomId:this.history.roomId };
  }

  public getUser(): User | null {
    return this.user;
  }

  public setUser(nombre: string, create: boolean) {
    fetch(apiUrl + "/users", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name:nombre
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }
      return response.json();
    })
    .then(data => {
      this.user = {
        name:nombre,
        id: data.id
      }
      this.saveToLocalStorage();
      if (create) { 
        this.createSala(data.id);
      }
      else
        this.notify();
    })
    .catch(error => {
      throw new Error('Error en al transcribir la respuesta del servidor');
    });
  }
  public createSala(id:string) { 
    fetch(apiUrl + "/salas", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id:id
      }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la respuesta de la API');
      }
      return response.json();
    })
    .then(data => {
      this.history.roomId = data.id;
      this.saveToLocalStorage();
      this.notify();
      this.conectarRTDB(data.id);
    })
    .catch(error => {
      throw new Error('Error en al transcribir la respuesta del servidor');
    });
  }
  public conectarRTDB(idCorto:string) { 
    fetch(apiUrl + "/salas/" + this.user?.id +"?salaID=" + idCorto, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Error en la respuesta de la API');
        }
        return response.json();
      })
      .then(res => {
        const roomRef = ref(database, 'salas/' + res.idLargo);
        get(roomRef).then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.owner === this.user?.id) {
              const oponenteRef = ref(database, 'salas/' + res.idLargo + '/currentGame/Jugador2');
              const jugadorRef = ref(database, 'salas/' + res.idLargo + '/currentGame/Jugador1');
              onValue(oponenteRef, (snap) => { 
                const data = snap.val();
                if (!(this.history.oponent) && data.name) { 
                  this.history.oponent = data.name;
                  this.notify();
                }
                if (data.start && !this.ready) { 
                  this.ready = true;
                  this.notify();
                }
                if (data.choise !== false) { 
                  this.getState().computerPlay = data.choise
                }
              })
            } else {
              const oponenteRef = ref(database, 'salas/' + res.idLargo + '/currentGame/Jugador1');
              const jugadorRef = ref(database, 'salas/' + res.idLargo + '/currentGame/Jugador2');
              this.history.roomId = idCorto;
              update(jugadorRef, {
                name: this.user?.name,
                id: this.user?.id,
                online: true
              });
              get(oponenteRef).then((snapShot) => { 
                if (snapShot.exists()) { 
                  const dataOponent = snapShot.val();
                  this.history.oponent = dataOponent.name;
                  this.notify();
                }
              })
              onValue(oponenteRef, (snap) => {
                const dataOp = snap.val();
                if (dataOp.start && !this.ready) { 
                  this.ready = true;
                  this.notify();
                }
                if (dataOp.choise !== false) { 
                  this.getState().computerPlay = dataOp.choise 
                }
              });
            }
          }
          this.notify();
        })
          .catch(error => {
            console.error('Error al conectar a la RTDB:', error);
          });
      })
  }
  public iniciarJuego() { 
    fetch(apiUrl + "/salas/" + this.user?.id + "?salaID=" + this.history.roomId,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (!response.ok) 
          throw new Error('Error en la respuesta de la API');
        return response.json();
      })
      .then(res => { 
        const roomRef = ref(database, 'salas/' + res.idLargo);
        get(roomRef).then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.owner === this.user?.id) {;
              const jugadorRef = ref(database, 'salas/' + res.idLargo + '/currentGame/Jugador1');
              update(jugadorRef, {
                start: true
              })
            } else { 
              const jugadorRef = ref(database, 'salas/' + res.idLargo + '/currentGame/Jugador2');
              update(jugadorRef, {
                start:true
              })
            }
          }
        })
      })
  }
  public getReady():boolean { 
    return this.ready;
  }
  public setMove(myMove: Jugada) {
    fetch(apiUrl + "/salas/" + this.user?.id + "?salaID=" + this.history.roomId,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (!response.ok) 
          throw new Error('Error en la respuesta de la API');
        return response.json();
      })
      .then(res => { 
        const roomRef = ref(database, 'salas/' + res.idLargo);
        get(roomRef).then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.owner === this.user?.id) {;
              const jugadorRef = ref(database, 'salas/' + res.idLargo + '/currentGame/Jugador1');
              update(jugadorRef, {
                choise: myMove
              })
            } else { 
              const jugadorRef = ref(database, 'salas/' + res.idLargo + '/currentGame/Jugador2');
              update(jugadorRef, {
                choise:myMove
              })
            }
          }
        })
      })
    this.getState().myPlay = myMove;
    if (this.getState().computerPlay)
      this.notify();
  }
  setReady() {
    this.ready = false;
    fetch(apiUrl + "/salas/" + this.user?.id + "?salaID=" + this.history.roomId,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(response => {
        if (!response.ok) 
          throw new Error('Error en la respuesta de la API');
        return response.json();
      })
      .then(res => { 
        const roomRef = ref(database, 'salas/' + res.idLargo);
        get(roomRef).then((snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            if (data.owner === this.user?.id) {;
              const jugadorRef = ref(database, 'salas/' + res.idLargo + '/currentGame/Jugador1');
              update(jugadorRef, {
                start: false,
                choise: false
              })
            } else { 
              const jugadorRef = ref(database, 'salas/' + res.idLargo + '/currentGame/Jugador2');
              update(jugadorRef, {
                start: false,
                choise:false
              })
            }
          }
        })
      })
  }
  public whoWins(myPlay: Jugada, computerPlay: Jugada): Resultado { 
    let res: Resultado;
    if (myPlay === computerPlay) {
      res = Resultado.empatar;
    } else if (
      (myPlay === "papel" && computerPlay === "tijera") ||
      (myPlay === "piedra" && computerPlay === "papel") ||
      (myPlay === "tijera" && computerPlay === "piedra")
    ) {
      res = Resultado.perder;
    } else { 
      res = Resultado.ganar;
    }
    return res;
  }

  public subscribe(callback: () => any) { 
    this.listeners.push(callback);
  }
}

export { State, Jugada, Resultado }