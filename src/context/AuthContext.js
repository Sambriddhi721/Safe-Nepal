import React, { createContext, useState, useMemo, useCallback, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // --- BYPASS / INITIAL STATE ---
  const [user, setUser] = useState({
    uid: "bypass-123",
    full_name: "Sambriddhi Dawadi",
    email: "sambriddhidawadi6@gmail.com",
    role: "USER" // Default to Citizen
  });
  const [token, setToken] = useState("bypass-token");
  const [loading, setLoading] = useState(false);

  // --- FIREBASE SYNC ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          let userData;
          if (userSnap.exists()) {
            userData = { uid: firebaseUser.uid, email: firebaseUser.email, ...userSnap.data() };
          } else {
            userData = { 
              uid: firebaseUser.uid, 
              email: firebaseUser.email, 
              full_name: firebaseUser.displayName || "Sambriddhi Dawadi",
              role: "USER" 
            };
          }

          const idToken = await firebaseUser.getIdToken();
          setUser(userData);
          setToken(idToken);
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        }
      } catch (e) {
        console.error("Auth sync error:", e);
      }
    });

    return unsubscribe;
  }, []);

  /**
   * ROLE SWITCHING
   * This is the "Engine" that powers your Mode Switcher.
   */
  const switchRole = useCallback(async () => {
    if (!user) return false;

    try {
      // Toggle logic: If USER -> RESPONDER, If RESPONDER -> USER
      const newRole = user.role === "RESPONDER" ? "USER" : "RESPONDER";

      // 1. Sync with Firebase (if logged in)
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, { role: newRole }, { merge: true });
      }

      // 2. Update Local State (This triggers the Stack Switch in App.js)
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);

      // 3. Persist to Storage
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      console.log(`[AuthContext] Role switched to: ${newRole}`);
      return true; 
    } catch (e) {
      console.error("Role Switch Error:", e);
      throw e;
    }
  }, [user]); 

  /**
   * PROFILE UPDATES
   */
  const updateUserProfile = useCallback(async (formData) => {
    if (!user) return { success: false };
    try {
      const updatedData = { 
        ...formData,
        full_name: formData.name || user.full_name, 
        updatedAt: new Date().toISOString()
      };

      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, updatedData, { merge: true });
      }

      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      await AsyncStorage.setItem('user_data', JSON.stringify(newUser));

      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, [user]);

  const signIn = useCallback(async (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
  }, []);

  const signOut = useCallback(async () => {
    try {
      await auth.signOut();
      setUser(null);
      setToken(null);
      await AsyncStorage.multiRemove(['user_data', 'user_token']);
    } catch (e) {
      console.error("Logout Error", e);
    }
  }, []);

  // Memoize values to prevent unnecessary re-renders
  const authValue = useMemo(() => ({
    user,
    token,
    loading,
    signIn,
    signOut,
    switchRole,
    updateUserProfile,
    role: user?.role || "USER", // This is what SettingsScreen.js looks at
    isResponder: user?.role === "RESPONDER", // Helpful helper boolean
  }), [user, token, loading, signIn, signOut, switchRole, updateUserProfile]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}