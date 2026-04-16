import React, { createContext, useState, useMemo, useCallback, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Initial state with bypass safety
  const [user, setUser] = useState({
    uid: "bypass-123",
    full_name: "Sambriddhi Dawadi",
    email: "sambriddhidawadi6@gmail.com",
    role: "USER" 
  });
  
  const [token, setToken] = useState("bypass-token");
  const [loading, setLoading] = useState(true); // Start true to check storage first

  // 1. Load persisted data on mount
  useEffect(() => {
    const loadPersistedUser = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user_data');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed);
          // Set token to bypass-token if real one isn't there yet so app doesn't kick user to Login
          setToken("bypass-token"); 
        }
      } catch (e) {
        console.error("Failed to load persisted user", e);
      } finally {
        setLoading(false);
      }
    };
    loadPersistedUser();
  }, []);

  // 2. Firebase Listener
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
              full_name: firebaseUser.displayName || "User",
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

  // 3. Optimized Switch Role
  const switchRole = useCallback(async (targetRole = null) => {
    if (!user) return false;

    try {
      let newRole;
      if (targetRole) {
        // Normalize "USER" to "CITIZEN" if that's what your UI expects, 
        // but let's keep it consistent with the Navigator "RESPONDER" logic.
        newRole = targetRole;
      } else {
        newRole = user.role === "RESPONDER" ? "USER" : "RESPONDER";
      }

      // 1. Sync with Firebase (if online)
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, { role: newRole }, { merge: true });
      }

      // 2. Update Local State (This triggers the Navigator swap)
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      
      // 3. Persist for next app launch
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
    role: user?.role || "USER", // This is what AppNavigator looks at
  }), [user, token, loading, switchRole]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}