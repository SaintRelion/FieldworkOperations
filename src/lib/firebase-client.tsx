// Your web app's Firebase configuration

import { initializeFirebaseAuth } from "@saintrelion/auth-lib";
import { initializeFirestore } from "@saintrelion/data-access-layer";
import { initializeApp } from "firebase/app";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQzUYgRfZXhr7lxi2ogOevjnlx7LgSQuA",
  authDomain: "ojt-attendance-system-b45c8.firebaseapp.com",
  projectId: "ojt-attendance-system-b45c8",
  storageBucket: "ojt-attendance-system-b45c8.firebasestorage.app",
  messagingSenderId: "834278391565",
  appId: "1:834278391565:web:a1c570a59c72d8149aba44",
  measurementId: "G-DPVW4G8ZWF",
};
export const app = initializeApp(firebaseConfig);

// Initialize Firebase
initializeFirestore(app);
initializeFirebaseAuth(app);
