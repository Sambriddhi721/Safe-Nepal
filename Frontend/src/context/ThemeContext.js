import React, { createContext, useState, useEffect } from "react";
import { Appearance } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const systemTheme = Appearance.getColorScheme() || "dark";
  const [theme, setTheme] = useState(systemTheme);

  // Load saved theme
  useEffect(() => {
    (async () => {
      const savedTheme = await AsyncStorage.getItem("APP_THEME");
      if (savedTheme) setTheme(savedTheme);
    })();
  }, []);

  // Save theme
  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    await AsyncStorage.setItem("APP_THEME", newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
