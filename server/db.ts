import * as admin from "firebase-admin";
import serviceAccount from "./keys"
import dotenv from "dotenv";
dotenv.config();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as any), // 
  databaseURL: process.env.DATABASEURL // 🔑 URL de RTDB
});

const firestore = admin.firestore();
const rtdb = admin.database();

export { firestore, rtdb };