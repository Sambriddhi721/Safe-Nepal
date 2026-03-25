import React, { createContext, useState, useMemo, useCallback, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- INITIAL LOAD ---
  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user_data');
        const savedToken = await AsyncStorage.getItem('user_token');
        
        if (savedUser && savedToken) {
          setUser(JSON.parse(savedUser));
          setToken(savedToken);
        } else {
          // Default mock user if storage is empty (for dev testing)
          const mockUser = {
            id: "2331203", 
            full_name: "Sambriddhi Dawadi",
            email: "sambriddhidawadi@university.edu",
            phone: "+977 98XXXXXXXX",
            role: "USER", 
          };
          setUser(mockUser);
          setToken("fake-dev-token");
        }
      } catch (e) {
        console.error("Failed to load auth data", e);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  // --- ACTIONS ---

  const signIn = useCallback(async (userData, userToken) => {
    setLoading(true);
    try {
      setUser(userData);
      setToken(userToken);
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      await AsyncStorage.setItem('user_token', userToken);
    } catch (e) {
      console.error("Login Error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (newData) => {
    try {
      const updatedUser = { ...user, ...newData };
      setUser(updatedUser);
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      return { success: true };
    } catch (e) {
      console.error("Update Profile Error", e);
      return { success: false, error: e };
    }
  }, [user]);

  const switchRole = useCallback(async () => {
    if (!user) return;
    const newRole = user.role === "RESPONDER" ? "USER" : "RESPONDER";
    const updatedUser = { ...user, role: newRole };
    
    setUser(updatedUser);
    await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
    console.log(`🛡️ Role switched to: ${newRole}`);
  }, [user]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      await AsyncStorage.multiRemove(['user_data', 'user_token']);
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error("Logout Error", e);
    } finally {
      setLoading(false);
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