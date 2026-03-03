import React, { useContext } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- Context & Theming ---
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext'; 

// --- Screens ---
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
import AddContactScreen from './src/screens/AddContactScreen'; 

// --- Settings Sub-Screens ---
import AccountSettings from './src/screens/AccountSettings';
import NotificationSettings from './src/screens/NotificationSettings';
import PrivacySettings from './src/screens/PrivacySettings';
import SecuritySettings from './src/screens/SecuritySettings';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { colors, theme } = useContext(ThemeContext);
  const isDarkMode = theme === 'dark';

  return (
    <NavigationContainer>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={isDarkMode ? '#0f2027' : '#f5f5f5'} 
      />
      
      <Stack.Navigator 
        initialRouteName="Home"
        screenOptions={{ 
          headerStyle: { 
            backgroundColor: colors?.card || (isDarkMode ? '#1c2733' : '#ffffff'),
          }, 
          headerTintColor: colors?.text || (isDarkMode ? '#FFFFFF' : '#000000'), 
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackTitleVisible: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors?.background || (isDarkMode ? '#0E1621' : '#f5f5f5') } 
        }}
      >
        {/* --- Primary Screens --- */}
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
        <Stack.Screen name="AddContact" component={AddContactScreen} options={{ title: 'Add Personal Contact' }} />
        
        {/* --- Profile & Main Settings --- */}
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} /> 
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About Safe Nepal' }} />

        {/* --- Setting Details (Route names updated for button compatibility) --- */}
        <Stack.Screen name="Account" component={AccountSettings} options={{ title: 'Account Settings' }} />
        <Stack.Screen name="Notifications" component={NotificationSettings} options={{ title: 'Notifications' }} />
        <Stack.Screen name="Privacy" component={PrivacySettings} options={{ title: 'Privacy Policy' }} />
        <Stack.Screen name="Security" component={SecuritySettings} options={{ title: 'Security & Safety' }} />

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