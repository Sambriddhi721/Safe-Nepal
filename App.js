import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext'; 
import { ThemeProvider } from './src/context/ThemeContext'; 

// FIXED: Updated path to match your Navigation folder structure
import AppNavigator from './src/Navigation/AppNavigator'; 

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <AppNavigator />
        </SafeAreaProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}