import React, { createContext, useState, useMemo, useCallback, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // --- BYPASS MODE: INITIAL STATE ---
  // We hardcode the user object here so 'user' is never null.
  const [user, setUser] = useState({
    uid: "bypass-123",
    full_name: "Sambriddhi Dawadi",
    email: "sambriddhidawadi6@gmail.com",
    role: "USER" // Set to "RESPONDER" here if you want to start in Police Mode
  });
  
  const [token, setToken] = useState("bypass-token");
  const [loading, setLoading] = useState(false); // Set to false to skip the loading spinner

  // --- 1. INITIAL LOAD (Optional during bypass) ---
  useEffect(() => {
    const loadPersistedUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user_data');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } catch (e) {
        console.error("Failed to load persisted user", e);
      } finally {
        setLoading(false);
      }
    };
    loadPersistedUser();
  }, []);

  // --- 2. FIREBASE SYNC ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
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
            await setDoc(userDocRef, userData);
          }

          const idToken = await firebaseUser.getIdToken();
          setUser(userData);
          setToken(idToken);
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        } catch (e) {
          console.error("Auth sync error:", e);
        }
      }
    });

    return unsubscribe;
  }, []);

  /**
   * ROLE SWITCHING
   * Still works in Bypass mode!
   */
  const switchRole = useCallback(async (targetRole = null) => {
    if (!user) return false;

    try {
      let newRole;
      if (targetRole) {
        newRole = targetRole === 'CITIZEN' ? 'USER' : targetRole;
      } else {
        newRole = user.role === "RESPONDER" ? "USER" : "RESPONDER";
      }

      // Sync with Firebase only if there is an actual active Firebase session
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, { role: newRole }, { merge: true });
      }

      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      return true; 
    } catch (e) {
      console.error("Role Switch Error:", e);
      throw e;
    }
  }, [user]); 

  const authValue = useMemo(() => ({
    user,
    token,
    loading,
    switchRole,
    role: user?.role || "USER",
    isResponder: user?.role === "RESPONDER",
  }), [user, token, loading, switchRole]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}