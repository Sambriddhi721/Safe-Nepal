import React, { createContext, useState, useEffect } from "react";
import { Appearance, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

export const themes = {
  dark: {
    background: "#020617", // Deepest Navy (Safe Nepal Brand)
    card: "#0f172a",       // Navy Blue Card
    text: "#F1F5F9",       // High contrast slate white
    subText: "#94A3B8",    // Muted slate grey
    border: "#1e293b",     // Subtle divider color
    accent: "#3b82f6",     // Action Blue
    success: "#22c55e",    // Low Risk / OK
    warning: "#f59e0b",    // Medium Risk / Warning
    danger: "#ef4444",     // High Risk / Logout
    overlay: "rgba(0,0,0,0.7)",
  },
  light: {
    background: "#F8FAFC", 
    card: "#FFFFFF",       // Pure white cards
    text: "#0F172A",       
    subText: "#64748B",    
    border: "#E2E8F0",
    accent: "#3b82f6",
    success: "#22c55e",
    warning: "#d97706",
    danger: "#ef4444",
    overlay: "rgba(0,0,0,0.1)",
  },
};

export function ThemeProvider({ children }) {
  // Sambriddhi, setting "dark" as the initial state matches your preference.
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();

    // ✅ Listen for System Theme Changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      checkSystemTheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const checkSystemTheme = async (systemScheme) => {
    const savedTheme = await AsyncStorage.getItem("APP_THEME");
    // Only update automatically if the user hasn't set a manual preference
    if (!savedTheme && systemScheme) {
      setTheme(systemScheme);
    }
  };

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("APP_THEME");
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        const systemTheme = Appearance.getColorScheme();
        if (systemTheme) setTheme(systemTheme);
      }
    } catch (e) {
      console.error("Error loading theme:", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem("APP_THEME", newTheme);
    } catch (e) {
      console.error("Error saving theme:", e);
    }
  };

  if (loading) return null;

  const colors = themes[theme];

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDarkMode: theme === "dark", 
      toggleTheme, 
      colors 
    }}>
      {/* The StatusBar here ensures that throughout Safe Nepal, 
        the top bar always matches your dark/light background. 
      */}
      <StatusBar 
        backgroundColor={colors.background} 
        barStyle={theme === "dark" ? "light-content" : "dark-content"} 
        translucent={true}
      />
      {children}
    </ThemeContext.Provider>
  );
}