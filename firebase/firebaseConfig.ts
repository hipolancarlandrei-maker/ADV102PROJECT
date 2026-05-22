// firebase/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";


// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getReactNativePersistence } = require("@firebase/auth/dist/rn/index.js");
 
const firebaseConfig = {
  apiKey: "AIzaSyCAhuJMaQO2WNLznAAjKzdSaEw-IyU0BpM",
  authDomain: "adv-final-project-37b64.firebaseapp.com",
  databaseURL: "https://adv-final-project-37b64-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "adv-final-project-37b64",
  storageBucket: "adv-final-project-37b64.firebasestorage.app",
  messagingSenderId: "283463380494",
  appId: "1:283463380494:web:f82d698c7132578148965f",
  measurementId: "G-ENT3SC0FV7"

};

// Prevent re-initializing on hot reload
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Create Firebase Auth instance
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Create Firestore instance
export const db = getFirestore(app);

export default app;
