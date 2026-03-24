import React, { createContext, useState, useMemo, useCallback } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Mocking the initial state
  const [user, setUser] = useState({
    id: "2331203", 
    full_name: "Sambriddhi Dawadi",
    role: "USER", // "USER" (Citizen) or "RESPONDER" (Police)
  });
  
  const [token, setToken] = useState("fake-dev-token");
  const [loading, setLoading] = useState(false); // Added loading for AppNavigator sanity

  const switchRole = useCallback(() => {
    setUser((prev) => {
      if (!prev) return prev;
      const newRole = prev.role === "RESPONDER" ? "USER" : "RESPONDER";
      
      console.log(`🛡️ Switching role to: ${newRole}`);
      
      return { 
        ...prev, 
        role: newRole 
      };
    });
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // Prepare the value for the provider
  const authValue = useMemo(() => ({
    user,
    token,
    loading,
    switchRole,
    signOut,
    role: user?.role || "USER", 
    isHelper: user?.role === "RESPONDER",
  }), [user, token, loading, switchRole, signOut]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}