import React, { createContext, useState, useMemo, useCallback, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    uid: "mock-user-123",
    email: "test@safenepal.com",
    full_name: "Test Citizen",
    role: "USER" 
  });
  const [token, setToken] = useState("mock-token-abc");
  const [loading, setLoading] = useState(true); 

  // --- FIREBASE AUTH & STORAGE SYNC ---
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user_data');
        if (savedUser) setUser(JSON.parse(savedUser));
      } catch (e) {
        console.warn("Local storage load error:", e);
      }
    };

    bootstrapAsync();

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
              full_name: firebaseUser.displayName || "New User",
              role: "USER" 
            };
          }

          setUser(userData);
          setToken(await firebaseUser.getIdToken());
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        }
      } catch (e) {
        console.error("Auth sync error:", e);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  /**
   * STABILIZED SWITCH ROLE LOGIC
   * Uses functional update to avoid re-creating the function on every user change.
   */
  const switchRole = useCallback(async () => {
    try {
      let finalRole = "";

      // 1. Update local state using functional update for stability
      setUser(prevUser => {
        if (!prevUser) return null;
        const newRole = prevUser.role === "RESPONDER" ? "USER" : "RESPONDER";
        finalRole = newRole; 
        
        const updatedUser = { ...prevUser, role: newRole };
        // Sync to storage immediately
        AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
        return updatedUser;
      });

      // 2. Update Firebase if a real session exists
      if (auth.currentUser && finalRole) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, { role: finalRole }, { merge: true });
      }
      
      return true; 
    } catch (e) {
      console.error("Role Switch Error:", e);
      throw e;
    }
  }, []); // Dependencies empty = stable function reference

  const updateUserProfile = useCallback(async (formData) => {
    try {
      const updatedData = { 
        full_name: formData.name, 
        phone: formData.phone,
        bio: formData.bio,
        updatedAt: new Date().toISOString()
      };

      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, updatedData, { merge: true });
      }

      setUser(prev => {
        const newUser = { ...prev, ...updatedData };
        AsyncStorage.setItem('user_data', JSON.stringify(newUser));
        return newUser;
      });

      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }, []);

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

  const authValue = useMemo(() => ({
    user,
    token,
    loading,
    signIn,
    signOut,
    switchRole,
    updateUserProfile,
    role: user?.role || "USER", 
    isHelper: user?.role === "RESPONDER",
  }), [user, token, loading, signIn, signOut, switchRole, updateUserProfile]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}