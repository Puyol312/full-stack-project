import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBxDyYdL9k1c5zxmRVQHsoUZtQ4eKqF22k",
  authDomain: "mi-primer-firebase-79768.firebaseapp.com",
  databaseURL: "https://mi-primer-firebase-79768-default-rtdb.firebaseio.com",
  projectId: "mi-primer-firebase-79768",
  storageBucket: "mi-primer-firebase-79768.firebasestorage.app",
  messagingSenderId: "635146320446",
  appId: "1:635146320446:web:280b18994ceee13c066f6f"
};

const app = initializeApp(firebaseConfig);

// Obtener referencia a la RTDB
const database = getDatabase(app);

export { database, ref, onValue }