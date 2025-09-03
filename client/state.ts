import { get, update } from "firebase/database";
import { database, ref, onValue } from "./rtdb";
//@ts-ignore
const apiUrl = process.env.API_URL ?? "http://localhost:8080";

type Jugada = "piedra" | "papel" | "tijera" | null;
type Game = {
  computerPlay:Jugada | null,
  myPlay:Jugada | null,
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
  private currentGame: {
    game: Game,
    owner:boolean
  };
  private history: History;
  private user: User | null;
  private ready: {
    me: boolean,
    oponent:boolean
  };
  private bloqueandoNotify: boolean = false;
  private A: boolean = false;
  private listeners: (() => any)[];

  private constructor() { 
    // Intentar cargar desde localStorage
    const savedData = sessionStorage.getItem("gameState");
    if (savedData) {
      const parsed = JSON.parse(savedData);
      this.currentGame = parsed.currentGame || {game:{ computerPlay: null, myPlay: null }, owner:false};
      this.history = parsed.history || { games: [], roomId: undefined, oponent: undefined };
      this.user = parsed.user || null;
      this.ready = { me: false ,oponent: false};
    } else {
      this.currentGame = {game:{ computerPlay: null, myPlay: null }, owner:false};
      this.history = { games: [], roomId: undefined , oponent: undefined};
      this.user = null;
      this.ready = { me: false ,oponent: false};
    }
    this.listeners = [];
  }

  public saveHistory(game: Game) { 
    if (game && game.computerPlay && game.myPlay) {
      this.history.games.push(game);
      this.saveTosessionStorage();
    }
  }

  private saveTosessionStorage() {
    sessionStorage.setItem(
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
    return this.currentGame.game;
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
      this.saveTosessionStorage();
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
      this.saveTosessionStorage();
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
              this.currentGame.owner = true;
              const oponenteRef = ref(database, 'salas/' + res.idLargo + '/currentGame/Jugador2');
              onValue(oponenteRef, (snap) => {
                const data = snap.val();
                this.escucharOponente(data);
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
                this.escucharOponente(dataOp);
              });
            }
          }
        })
          .catch(error => {
            console.error('Error al conectar a la RTDB:', error);
          });
      })
  }
  private escucharOponente(data: any) {
    if (!data.reset) {
      let flag = false;
      if (!(this.history.oponent) && data.name) {
        this.history.oponent = data.name;
        flag = true;
      }
      if (!(this.ready.oponent) && data.start) {
        this.ready.oponent = data.start;
        flag = true;
      }
      if ((!this.currentGame.game.computerPlay) && data.choice && !this.bloqueandoNotify) {
        console.log("estoy entrando", this.bloqueandoNotify);
        this.currentGame.game.computerPlay = data.choice;
        if (this.A && !this.esperarJugadaDelOponente()) {
          flag = false;
        } else {
          flag = this.esperarJugadaDelOponente();
        }
      }
      if (!this.bloqueandoNotify && flag) {
        this.notify();
      }
    }
  }
  public setA() { 
    this.A = !this.A;
  }
  private actualizarInformacion(task: any, campo: string) {
    let jugador = this.currentGame.owner ? "Jugador1" : "Jugador2";
    fetch(apiUrl + "/salas/" + this.user?.id +"?salaID=" + this.history.roomId, {
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
      const jugadorRef = ref(database, 'salas/' + res.idLargo + '/currentGame/' + jugador);
      update(jugadorRef, {
        [campo]: task
      });
    })
  }
  public aceptarReglas() { 
    this.ready.me = true;
    this.actualizarInformacion(false, "reset");
    this.actualizarInformacion(true, "start");
  }
  public bothReady(): boolean {
    return this.ready.me && this.ready.oponent;
  }
  public setMove(myMove: Jugada) {
    this.actualizarInformacion(myMove, "choice");
    this.currentGame.game.myPlay = myMove;
    if ((this.A && this.esperarJugadaDelOponente()) || (!this.A && this.esperarJugadaDelOponente())) { 
      this.notify();
    }
  }
  public solveRules() { 
    if (this.currentGame.game.computerPlay) { 
      this.currentGame.game.computerPlay = null;
    } if (this.currentGame.game.myPlay) {
      this.currentGame.game.myPlay = null;
    }
  }
  public esperarJugadaDelOponente():boolean { 
    return ((this.currentGame.game.computerPlay != null) && (this.currentGame.game.myPlay != null));
  }
  public resetReady() {
      this.bloqueandoNotify = true;
  
      this.currentGame.game = { myPlay: null, computerPlay: null };
      this.ready.me = false;
      this.ready.oponent = false;
      this.A = false;
      
      this.actualizarInformacion(true, "reset");
      this.actualizarInformacion(false, "start");
      this.actualizarInformacion(false, "choice");
  
      setTimeout(() => {
        this.bloqueandoNotify = false;
        console.log(this);
      }, 3000);
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
  public unsubscribe(callback: () => any) {
    this.listeners = this.listeners.filter(fn => fn !== callback);
  }
}

export { State, Jugada, Resultado }