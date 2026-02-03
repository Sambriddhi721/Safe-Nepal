import React, { createContext, useState, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // 1. FORCED INITIAL STATE
  // We set a fake user and token immediately so there is no "blink" of a login screen
  const [user, setUser] = useState({
    id: "dev-123",
    name: "Developer Admin",
    email: "dev@nepaldisasterwatch.com",
    role: "USER",
    email_verified: true,
  });
  const [token, setToken] = useState("fake-dev-token");
  const [loading, setLoading] = useState(false); // Force loading to false

  useEffect(() => {
    // We keep this empty for development so it doesn't try to 
    // fetch real data or check local storage.
    console.log("Auth System: Development Bypass Active (Home Screen Enabled)");
  }, []);

  // 2. MOCK FUNCTIONS
  // These functions won't do anything for now to prevent storage/network errors
  const signIn = async (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
  };

  const signOut = async () => {
    setUser(null);
    setToken(null);
  };

  const updateUser = async (newUserData) => {
    setUser(newUserData);
  };

  // 3. FORCED NAVIGATION FLAGS
  // These variables are what your Navigation uses to decide which screen to show.
  // By forcing them to true/false here, we bypass all login/signup logic.
  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      signIn,
      signOut,
      updateUser,
      isAuthenticated: true,   // Always true
      isVerifiedUser: true,    // Skips Email Verification screens
      emailVerified: true,     // Skips Verification prompts
      role: "USER",            // Standard user role
      isUser: true,
      isHelper: false,
    }),
    [user, token, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}