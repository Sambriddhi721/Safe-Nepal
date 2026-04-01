import React, { createContext, useState, useMemo, useCallback, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // --- 🛠️ MODIFIED FOR BYPASSING LOGIN ---
  // We initialize with a "Mock User" so the AppNavigator skips Login
  const [user, setUser] = useState({
    uid: "mock-user-123",
    email: "test@safenepal.com",
    full_name: "Test Citizen",
    role: "USER" // Change to "RESPONDER" to test the Police side
  });
  const [token, setToken] = useState("mock-token-abc");
  const [loading, setLoading] = useState(false); // Set to false immediately

  // --- FIREBASE AUTH & FIRESTORE SYNC ---
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
              full_name: firebaseUser.displayName || "New User",
              role: "USER" 
            };
          }

          setUser(userData);
          setToken(await firebaseUser.getIdToken());
          await AsyncStorage.setItem('user_data', JSON.stringify(userData));
        } else {
          // COMMENTED OUT: We don't want to clear our mock user if Firebase isn't authed
          /* setUser(null);
          setToken(null);
          await AsyncStorage.multiRemove(['user_data', 'user_token']);
          */
        }
      } catch (e) {
        console.error("Auth sync error:", e);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const updateUserProfile = useCallback(async (formData) => {
    // If we are using a mock user, we can't save to Firebase easily
    if (!auth.currentUser) {
       console.warn("Using Mock User: Profile update only saved locally.");
       const newUserState = { ...user, full_name: formData.name, phone: formData.phone };
       setUser(newUserState);
       return { success: true };
    }

    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const updatedData = { 
        full_name: formData.name, 
        phone: formData.phone,
        bio: formData.bio,
        updatedAt: new Date().toISOString()
      };

      await setDoc(userRef, updatedData, { merge: true });
      const newUserState = { ...user, ...updatedData };
      setUser(newUserState);
      await AsyncStorage.setItem('user_data', JSON.stringify(newUserState));
      return { success: true };
    } catch (e) {
      console.error("Firebase Update Error", e);
      return { success: false, error: e.message };
    }
  }, [user]);

  const signIn = useCallback(async (userData, userToken) => {
    setUser(userData);
    setToken(userToken);
    await AsyncStorage.setItem('user_data', JSON.stringify(userData));
  }, []);

  const switchRole = useCallback(async () => {
    if (!user) return;
    const newRole = user.role === "RESPONDER" ? "USER" : "RESPONDER";
    
    // If logged in to Firebase, update DB. If mock, just update state.
    if (auth.currentUser) {
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, { role: newRole }, { merge: true });
      } catch (e) {
        console.error("Role Switch Error", e);
      }
    }

    const updatedUser = { ...user, role: newRole };
    setUser(updatedUser);
    await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
  }, [user]);

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