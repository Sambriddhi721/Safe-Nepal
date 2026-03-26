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
          /**
           * Sambriddhi, since you're in the University testing phase,
           * we'll keep this auto-login mock active. 
           * REMOVE THIS for production deployment.
           */
          const mockUser = {
            id: "2331203", 
            full_name: "Sambriddhi Dawadi",
            email: "sambriddhidawadi@university.edu",
            phone: "+977 98XXXXXXXX",
            role: "USER", // Default role
          };
          setUser(mockUser);
          setToken("dev-session-active");
          
          // Silently persist mock data so it survives refreshes
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

  // --- ACTIONS ---

  const signIn = useCallback(async (userData, userToken) => {
    setLoading(true);
    try {
      // Always store in AsyncStorage first to ensure data integrity
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

  const updateUserProfile = useCallback(async (newData) => {
    try {
      const updatedUser = { ...user, ...newData };
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true };
    } catch (e) {
      console.error("Update Profile Error", e);
      return { success: false, error: e.message };
    }
  }, [user]);

  /**
   * Switch Role: Essential for testing both Citizen and Responder 
   * views in Safe Nepal without creating two accounts.
   */
  const switchRole = useCallback(async () => {
    if (!user) return;
    const newRole = user.role === "RESPONDER" ? "USER" : "RESPONDER";
    const updatedUser = { ...user, role: newRole };
    
    try {
      await AsyncStorage.setItem('user_data', JSON.stringify(updatedUser));
      setUser(updatedUser);
      console.log(`🛡️ View Switched: Now operating as ${newRole}`);
    } catch (e) {
      console.error("Role Switch Error", e);
    }
  }, [user]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      // multiRemove is more efficient for clearing auth state
      await AsyncStorage.multiRemove(['user_data', 'user_token']);
      setToken(null);
      setUser(null);
    } catch (e) {
      console.error("Logout Error", e);
    } finally {
      setLoading(false);
    }
  }, []);

  // useMemo ensures components only re-render if actual data changes
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