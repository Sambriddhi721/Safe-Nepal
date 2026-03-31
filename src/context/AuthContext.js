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
          // Mock User for Testing Phase
          const mockUser = {
            id: "2331203", 
            full_name: "Sambriddhi Dawadi",
            email: "sambriddhidawadi@university.edu",
            phone: "+977 98XXXXXXXX",
            bio: "Software Engineering Student | Disaster Risk Analyst",
            role: "USER", 
          };
          setUser(mockUser);
          setToken("dev-session-active");
          
          await AsyncStorage.setItem('user_data', JSON.stringify(mockUser));
          await AsyncStorage.setItem('user_token', "dev-session-active");
        }
      } catch (e) {
        console.error("Failed to load auth data", e);
      } finally {
        setLoading(false);
      }
    };

    loadStorageData();
  }, []);

  // --- UPDATED PROFILE ACTION ---
  const updateUserProfile = useCallback(async (formData) => {
    try {
      // Map form fields to the user object structure
      const updatedUser = { 
        ...user, 
        full_name: formData.name, // Ensure keys match your user object
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio 
      };

      // Persist to local storage
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      // Update global state
      setUser(updatedUser);
      
      console.log("✅ Profile Persisted Locally");
      return { success: true };
    } catch (e) {
      console.error("Update Profile Error", e);
      return { success: false, error: e.message };
    }
  }, [user]);

  const signIn = useCallback(async (userData, userToken) => {
    setLoading(true);
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(userData));
      await AsyncStorage.setItem('user_token', userToken);
      setUser(userData);
      setToken(userToken);
    } catch (e) {
      console.error("Login Persist Error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const switchRole = useCallback(async () => {
    if (!user) return;
    const newRole = user.role === "RESPONDER" ? "USER" : "RESPONDER";
    const updatedUser = { ...user, role: newRole };
    
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (e) {
      console.error("Role Switch Error", e);
    }
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