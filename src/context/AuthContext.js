import React, { createContext, useState, useMemo, useCallback, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../firebaseConfig'; // Import your firebase exports
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FIREBASE AUTH & FIRESTORE SYNC ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // 1. Get the user document from Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userSnap = await getDoc(userDocRef);

          let userData;
          if (userSnap.exists()) {
            userData = { uid: firebaseUser.uid, email: firebaseUser.email, ...userSnap.data() };
          } else {
            // Fallback if no Firestore doc exists yet
            userData = { 
              uid: firebaseUser.uid, 
              email: firebaseUser.email, 
              full_name: firebaseUser.displayName || "New User",
              role: "USER" 
            };
          }

          setUser(userData);
          setToken(await firebaseUser.getIdToken());
          
          // Sync to local storage as a backup
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        } else {
          setUser(null);
          setToken(null);
          await AsyncStorage.multiRemove(['user_data', 'user_token']);
        }
      } catch (e) {
        console.error("Auth sync error:", e);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // --- UPDATED PROFILE ACTION (Saves to Firestore) ---
  const updateUserProfile = useCallback(async (formData) => {
    if (!auth.currentUser) return { success: false, error: "Not authenticated" };

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      
      // Data to be saved
      const updatedData = { 
        full_name: formData.name, 
        phone: formData.phone,
        bio: formData.bio,
        updatedAt: new Date().toISOString()
      };

      // 1. Persist to Firestore Backend
      await setDoc(userRef, updatedData, { merge: true });

      // 2. Update Global State
      const newUserState = { ...user, ...updatedData };
      setUser(newUserState);

      // 3. Update Local Storage cache
      await AsyncStorage.setItem('user_data', JSON.stringify(newUserState));
      
      return { success: true };
    } catch (e) {
      console.error("Firebase Update Error", e);
      return { success: false, error: e.message };
    }
  }, [user]);

  const signIn = useCallback(async (userData, userToken) => {
    // In a real Firebase app, signIn is usually handled via auth functions,
    // but we'll keep this for manual state updates if needed.
    setUser(userData);
    setToken(userToken);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
  }, []);

  const switchRole = useCallback(async () => {
    if (!user || !auth.currentUser) return;
    const newRole = user.role === "RESPONDER" ? "USER" : "RESPONDER";
    
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await setDoc(userRef, { role: newRole }, { merge: true });
      
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
    } catch (e) {
      console.error("Role Switch Error", e);
    }
  }, [user]);

  const signOut = useCallback(async () => {
    try {
      await auth.signOut(); // Firebase sign out
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