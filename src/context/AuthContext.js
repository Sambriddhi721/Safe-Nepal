import React, { createContext, useState, useMemo, useCallback } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Start in "USER" mode for Citizen Home
  const [user, setUser] = useState({
    id: "2331203", 
    full_name: "Sambriddhi Dawadi",
    role: "USER", 
  });
  
  const [token, setToken] = useState("fake-dev-token");

  const switchRole = useCallback(() => {
    setUser((prev) => {
      // If user is null (logged out), don't try to switch
      if (!prev) return prev;

      const newRole = prev.role === "RESPONDER" ? "USER" : "RESPONDER";
      return {
        ...prev,
        role: newRole,
      };
    });
  }, []);

  const signOut = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  // Memoizing these values ensures components only re-render when necessary
  const authValue = useMemo(() => ({
    user,
    token,
    switchRole,
    signOut,
    isAuthenticated: !!token,
    role: user?.role || "USER", // Default to USER if object is empty
    isHelper: user?.role === "RESPONDER",
  }), [user, token, switchRole, signOut]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}