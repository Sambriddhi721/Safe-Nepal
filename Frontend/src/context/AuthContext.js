import React, { createContext, useState, useMemo } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // We start with a DEFAULT user so you don't have to log in manually every time
  const [user, setUser] = useState({
    id: "dev-123",
    full_name: "Developer Admin",
    role: "USER", 
  });
  const [token, setToken] = useState("fake-dev-token");
  const [loading, setLoading] = useState(false);

  const signIn = async (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
  };

  const signOut = async () => {
    console.log("Auth: Clearing session...");
    setUser(null);
    setToken(null);
  };

  const authValue = useMemo(() => ({
    user,
    token,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!token, 
    role: user?.role || "GUEST",
    isHelper: true, // Forced to true so you can test the Responder Portal
  }), [user, token, loading]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}