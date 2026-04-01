import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyCYJWZM-ek-D1Qd11y28PhHC4oXzSQfHzQ",
  authDomain: "safe-nepal-45d7a.firebaseapp.com",
  projectId: "safe-nepal-45d7a",
  storageBucket: "safe-nepal-45d7a.firebasestorage.app",
  messagingSenderId: "239732457127",
  appId: "1:239732457127:web:7a82f3fefd50d9eb4f2582",
  measurementId: "G-KFFKZKRBV4"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Services
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize Auth with Native Persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export default app;