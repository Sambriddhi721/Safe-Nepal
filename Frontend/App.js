import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 1. IMPORT PROVIDERS
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/context/ThemeContext';

// 2. IMPORT ALL SCREENS
import HomeScreen from './src/screens/HomeScreen';
import AlertScreen from './src/screens/AlertScreen';
import AlertDetailsScreen from './src/screens/AlertDetailsScreen';
import SOSScreen from './src/screens/SOSScreen';
import RealTimeMapScreen from './src/screens/RealTimeMapScreen';
import SafetyTipsScreen from './src/screens/SafetyTipsScreen';
import PredictionAnalyticsScreen from './src/screens/PredictionAnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EmergencyContactsScreen from './src/screens/EmergencyContactsScreen';
import ReliefCenterScreen from './src/screens/ReliefCenterScreen'; 

import AboutScreen from './src/screens/AboutScreen';

const Stack = createNativeStackNavigator();

function NavigationStack() {
  return (
    <Stack.Navigator 
      initialRouteName="Home" 
      screenOptions={{ headerShown: false }}
    >
      {/* HomeScreen is first, so it opens immediately */}
      <Stack.Screen name="Home" component={HomeScreen} />
      
      {/* Other Screens */}
      <Stack.Screen name="AlertScreen" component={AlertScreen} />
      <Stack.Screen name="AlertDetails" component={AlertDetailsScreen} />
      <Stack.Screen name="SOSScreen" component={SOSScreen} />
      <Stack.Screen name="RealTimeMapScreen" component={RealTimeMapScreen} />
      <Stack.Screen name="SafetyTipsScreen" component={SafetyTipsScreen} />
      <Stack.Screen name="PredictionAnalyticsScreen" component={PredictionAnalyticsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="EmergencyContactsScreen" component={EmergencyContactsScreen} />
      
      {/* FIXED: Changed Stack.Row to Stack.Screen */}
      <Stack.Screen name="ReliefCenterScreen" component={ReliefCenterScreen} />
      
 
      <Stack.Screen name="AboutScreen" component={AboutScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <NavigationContainer>
          <NavigationStack />
        </NavigationContainer>
      </ThemeProvider>
    </AuthProvider>
  );
}