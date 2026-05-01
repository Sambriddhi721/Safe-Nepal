import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged,
} from "firebase/auth";
import { getStorage } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 🔐 Firebase Config — values loaded from Frontend/.env
const firebaseConfig = {
  apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// ✅ Validate all required config values are present
const missingKeys = Object.entries(firebaseConfig)
  .filter(([_, v]) => !v)
  .map(([k]) => k);

if (missingKeys.length > 0) {
  console.error("❌ Missing Firebase config keys in .env:", missingKeys.join(", "));
}

// 🚀 Prevent duplicate initialization (Expo safe)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// 🔐 Auth with AsyncStorage persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// 🔥 Firestore
export const db = getFirestore(app);

// 📦 Storage
export const storage = getStorage(app);


// ─────────────────────────────────────────────
// 👤 USER MANAGEMENT
// ─────────────────────────────────────────────

/**
 * Save or update user profile
 * roles: "citizen" | "responder" | "admin"
 */
export const saveUserRole = async (uid, data) => {
  try {
    await setDoc(
      doc(db, "users", uid),
      {
        ...data,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error saving user:", error.message);
  }
};

/**
 * Get user data (role, name, etc.)
 */
export const getUserData = async (uid) => {
  try {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);
    return snapshot.exists() ? snapshot.data() : null;
  } catch (error) {
    console.error("Error fetching user:", error.message);
    return null;
  }
};


// ─────────────────────────────────────────────
// 🚨 REPORT MANAGEMENT
// ─────────────────────────────────────────────

/**
 * Create new disaster report
 */
export const createReport = async (reportData) => {
  try {
    const ref = doc(db, "reports", Date.now().toString());

    await setDoc(ref, {
      ...reportData,
      createdAt: serverTimestamp(),
      status: "pending",
      liveTracking: false,
    });

    return ref.id;
  } catch (error) {
    console.error("Error creating report:", error.message);
    throw error;
  }
};

/**
 * Update report (for live tracking or status)
 */
export const updateReport = async (reportId, data) => {
  try {
    await updateDoc(doc(db, "reports", reportId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating report:", error.message);
  }
};


// ─────────────────────────────────────────────
// 🔄 AUTH LISTENER (use in App.js)
// ─────────────────────────────────────────────

export const listenToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, callback);
};

export default app;