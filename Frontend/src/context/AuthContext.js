import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import axios from "axios";
import React, { createContext, useState, useEffect, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE = "http://192.168.111.74:5000";

export const AuthContext = createContext();

async function registerForPushNotifications(token) {
  try {
    if (!Device.isDevice) return;
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== "granted") return;

    const expoToken = (await Notifications.getExpoPushTokenAsync()).data;

    try {
      await axios.post(
        `${API_BASE}/api/auth/push-token`,
        { push_token: expoToken },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 5000
        }
      );
    } catch (error) {
      console.log("Push token registration failed:", error.message);
    }
  } catch (error) {
    console.log("Push notification setup error:", error.message);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadAuth = async () => {
      try {
        const [storedToken, storedUser] = await Promise.all([
          AsyncStorage.getItem("token"),
          AsyncStorage.getItem("user")
        ]);

        if (isMounted && storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.log("Auth load error:", err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadAuth();
    return () => { isMounted = false; };
  }, []);

  const signIn = async (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    registerForPushNotifications(jwtToken);

    await AsyncStorage.multiSet([
      ["token", jwtToken],
      ["user", JSON.stringify(userData)],
    ]);
  };

  const signOut = async () => {
    setUser(null);
    setToken(null);
    await AsyncStorage.multiRemove(["token", "user"]);
  };

  /**
   * NEW: updateUser function
   * Used to refresh user data (like email_verified status) 
   * without logging out and back in.
   */
  const updateUser = async (newUserData) => {
    setUser(newUserData);
    await AsyncStorage.setItem("user", JSON.stringify(newUserData));
  };

  // Computed values for navigation logic
  const isAuthenticated = !!token && !!user;
  const role = user?.role || null;
  const emailVerified = user?.email_verified || false;

  const isUser = role === "USER";
  const isHelper = role === "HELPER";
  
  // This is the variable your App.js navigator will use to 
  // decide if the user sees the Verification screen or the Home screen.
  const isVerifiedUser = isUser && emailVerified;

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      signIn,
      signOut,
      updateUser, // Added to context
      isAuthenticated,
      role,
      emailVerified,
      isUser,
      isHelper,
      isVerifiedUser,
    }),
    [user, token, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}