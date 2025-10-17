// Your web app's Firebase configuration

import { initializeFirebaseAuth } from "@saintrelion/auth-lib";
import { initializeFirestore } from "@saintrelion/data-access-layer";
import { initializeApp } from "firebase/app";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCVgLFgh9M8ey8v5hRjSZjDN3LfAv-oV6M",
  authDomain: "c-project-s.firebaseapp.com",
  projectId: "c-project-s",
  storageBucket: "c-project-s.firebasestorage.app",
  messagingSenderId: "287832751396",
  appId: "1:287832751396:web:8454abd3659b9a0b0547b1",
  measurementId: "G-PVFS446DR6",
};
export const app = initializeApp(firebaseConfig);

// Initialize Firebase
initializeFirestore(app);
initializeFirebaseAuth(app);
