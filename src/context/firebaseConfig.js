import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCYJWZM-ek-D1Qd11y28PhHC4oXzSQfHzQ",
  authDomain: "safe-nepal-45d7a.firebaseapp.com",
  projectId: "safe-nepal-45d7a",
  storageBucket: "safe-nepal-45d7a.firebasestorage.app",
  messagingSenderId: "239732457127",
  appId: "1:239732457127:web:7a82f3fefd50d9eb4f2582",
  measurementId: "G-KFFKZKRBV4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and Export Services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;