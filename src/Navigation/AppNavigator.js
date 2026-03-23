import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// --- Context ---
// Ensure the path matches your src folder structure
import { AuthContext } from './src/context/AuthContext';

// --- Screens ---
import HomeScreen from './src/screens/HomeScreen'; 
import ResponderDashboard from './src/screens/ResponderDashboard'; 
import SOSListScreen from './src/screens/SOSListScreen'; 
import LoginScreen from './src/screens/LoginScreen';
import ProfileScreen from './src/screens/ProfileScreen'; 

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { role, token } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        // CRITICAL: When role changes, this key forces the entire 
        // navigator to unmount and restart, resetting you to the top screen.
        key={role} 
        screenOptions={{ headerShown: false }}
      >
        {token == null ? (
          /* 1. Auth Stack */
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : role === "RESPONDER" ? (
          /* 2. Police Mode Stack */
          <>
            {/* The FIRST screen here is what opens when you switch to Police */}
            <Stack.Screen name="ResponderHome" component={ResponderDashboard} />
            <Stack.Screen name="SOSList" component={SOSListScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        ) : (
          /* 3. Citizen Mode Stack */
          <>
            {/* The FIRST screen here is what opens when you start or switch back */}
            <Stack.Screen name="UserHome" component={HomeScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}