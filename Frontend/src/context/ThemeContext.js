import React, { createContext, useState, useEffect } from "react";
import { Appearance, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

export const themes = {
  dark: {
    background: "#020617", // Deep Black-Blue (Your preferred theme)
    card: "#0f172a",       // Navy Blue Card
    text: "#F1F5F9",       // High contrast white
    subText: "#94A3B8",    // Soft slate grey
    border: "#1e293b",     // Subtle divider color
    accent: "#3b82f6",     // Safe Nepal Primary Blue
    success: "#22c55e",    // Green for "On" toggles
    danger: "#ef4444",     // Logout/Delete red
  },
  light: {
    background: "#F8FAFC", 
    card: "#FFFFFF",       // Clean white cards
    text: "#0F172A",       
    subText: "#64748B",    
    border: "#E2E8F0",
    accent: "#3b82f6",
    success: "#22c55e",
    danger: "#ef4444",
  },
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("dark");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

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
      console.log("Error loading theme", e);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    await AsyncStorage.setItem("APP_THEME", newTheme);
  };

  if (loading) return null;

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      isDarkMode: theme === "dark", 
      toggleTheme, 
      colors: themes[theme] 
    }}>
      <StatusBar 
        backgroundColor={themes[theme].background} 
        barStyle={theme === "dark" ? "light-content" : "dark-content"} 
      />
      {children}
    </ThemeContext.Provider>
  );
}