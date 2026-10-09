import { runtimeConfig } from "./runtime-config";
// Your web app's Firebase configuration

import { initializeFirestore } from "@saintrelion/data-access-layer";
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: runtimeConfig.VITE_FIREBASE_API_KEY,
  authDomain: runtimeConfig.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: runtimeConfig.VITE_FIREBASE_PROJECT_ID,
  storageBucket: runtimeConfig.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: runtimeConfig.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: runtimeConfig.VITE_FIREBASE_APP_ID,
  measurementId: runtimeConfig.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Firebase
initializeFirestore(app);
