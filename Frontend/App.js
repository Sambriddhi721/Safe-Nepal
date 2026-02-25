import React, { useContext } from 'react';
import { StatusBar } from 'react-native'; // Added StatusBar
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Context
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext'; 

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ReportDisasterScreen from './src/screens/ReportDisasterScreen';
import PastReportsScreen from './src/screens/PastReportsScreen';
import AlertScreen from './src/screens/AlertScreen';
import SOSScreen from './src/screens/SOSScreen';
import RealTimeMapScreen from './src/screens/RealTimeMapScreen';
import PredictionAnalyticsScreen from './src/screens/PredictionAnalyticsScreen';
import ReliefCenterScreen from './src/screens/ReliefCenterScreen';
import EmergencyContactsScreen from './src/screens/EmergencyContactsScreen';
import SafetyTipsScreen from './src/screens/SafetyTipsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AboutScreen from './src/screens/AboutScreen';
import SettingsScreen from './src/screens/SettingsScreen'; 

// Settings Sub-Screens
import AccountSettings from './src/screens/AccountSettings';
import NotificationSettings from './src/screens/NotificationSettings';
import PrivacySettings from './src/screens/PrivacySettings';
import SecuritySettings from './src/screens/SecuritySettings';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { colors, isDarkMode } = useContext(ThemeContext);

  return (
    <NavigationContainer>
      {/* This ensures the system status bar matches your theme globally */}
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={colors?.background || '#020617'} 
      />
      
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{ 
          headerStyle: { 
            backgroundColor: colors?.card || '#0f172a',
            elevation: 0, // Removes shadow on Android
            shadowOpacity: 0, // Removes shadow on iOS
          }, 
          headerTintColor: colors?.text || '#FFFFFF', 
          headerTitleStyle: { fontWeight: 'bold' },
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors?.background || '#020617' } 
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="NewReport" component={ReportDisasterScreen} options={{ title: 'Submit Report' }} />
        <Stack.Screen name="History" component={PastReportsScreen} options={{ title: 'My Reports' }} />
        <Stack.Screen name="SOSScreen" component={SOSScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AlertScreen" component={AlertScreen} options={{ title: 'Disaster Alerts' }} />
        <Stack.Screen name="RealTimeMap" component={RealTimeMapScreen} options={{ title: 'Hazard Map' }} />
        <Stack.Screen name="PredictionAnalyticsScreen" component={PredictionAnalyticsScreen} options={{ title: 'Risk Analysis' }} />
        <Stack.Screen name="ReliefCenterScreen" component={ReliefCenterScreen} options={{ title: 'Relief Centers' }} />
        <Stack.Screen name="EmergencyContactsScreen" component={EmergencyContactsScreen} options={{ title: 'Emergency Helplines' }} />
        <Stack.Screen name="SafetyTipsScreen" component={SafetyTipsScreen} options={{ title: 'Safety Manual' }} />
        
        {/* Profile & Main Settings */}
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} /> 
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About Safe Nepal' }} />

        {/* Setting Details - These are the targets for navigation.navigate() */}
        <Stack.Screen name="AccountSettings" component={AccountSettings} options={{ title: 'Account Settings' }} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettings} options={{ title: 'Notifications' }} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettings} options={{ title: 'Privacy Policy' }} />
        <Stack.Screen name="SecuritySettings" component={SecuritySettings} options={{ title: 'Security & Safety' }} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}