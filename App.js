import React, { useContext } from 'react';
import { StatusBar, ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Context Providers
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext'; 
import { AuthProvider, AuthContext } from './src/context/AuthContext'; 

// --- SCREEN IMPORTS ---
import WelcomeScreen from './src/screens/Shared Folder/WelcomeScreen';
import LoginScreen from './src/screens/Shared Folder/LoginScreen'; 
import SignupScreen from './src/screens/Shared Folder/SignupScreen';
import ProfileScreen from './src/screens/Shared Folder/ProfileScreen'; 
import HomeScreen from './src/screens/Citizen Folder/HomeScreen';
import ReportDisasterScreen from './src/screens/Citizen Folder/ReportDisasterScreen';
import PastReportsScreen from './src/screens/Citizen Folder/PastReportsScreen';
import SOSScreen from './src/screens/Citizen Folder/SOSScreen';
import ReliefCenterScreen from './src/screens/Citizen Folder/ReliefCenterScreen';
import EmergencyContactsScreen from './src/screens/Citizen Folder/EmergencyContactsScreen';
import SafetyTipsScreen from './src/screens/Citizen Folder/SafetyTipsScreen';
import PredictionAnalyticsScreen from './src/screens/Citizen Folder/PredictionAnalyticsScreen.js';
import ResponderDashboard from './src/screens/Police Folder/ResponderDashboard'; 
import PoliceDashboardScreen from './src/screens/Police Folder/PoliceDashboardScreen';
import AlertScreen from './src/screens/Police Folder/AlertScreen';
import RealTimeMapScreen from './src/screens/Police Folder/RealTimeMapScreen.js'; 
import VolunteerScreen from './src/screens/Police Folder/VolunteerScreen'; 
import MapScreen from './src/screens/Shared Folder/Map.js';
import AboutScreen from './src/screens/Shared Folder/AboutScreen';
import AccountSettings from './src/screens/Shared Folder/AccountSettings'; 
import NotificationSettings from './src/screens/Shared Folder/NotificationSettings';
import PrivacySettings from './src/screens/Shared Folder/PrivacySettings';
import SecuritySettings from './src/screens/Shared Folder/SecuritySettings';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { theme } = useContext(ThemeContext);
  const { token, loading, role } = useContext(AuthContext); 
  const isDarkMode = theme === 'dark';

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: isDarkMode ? '#020617' : '#f5f5f5' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerStyle: { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }, 
          headerTintColor: isDarkMode ? '#F1F5F9' : '#000000',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {token == null ? (
          // --- AUTHENTICATION STACK ---
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </Stack.Group>
        ) : (
          // --- MAIN APP STACK ---
          <>
            {/* CORE FIX: This dynamic 'Home' route swaps components 
              automatically when the 'role' variable changes.
            */}
            <Stack.Screen 
              name="Home" 
              component={role === 'RESPONDER' ? ResponderDashboard : HomeScreen} 
              options={{ headerShown: false }} 
            />
            
            {/* PROFILE & SETTINGS (Shared) */}
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
            <Stack.Screen name="AccountSettings" component={AccountSettings} options={{ title: 'Account' }} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettings} options={{ title: 'Notifications' }} />
            <Stack.Screen name="PrivacySettings" component={PrivacySettings} options={{ title: 'Privacy' }} />
            <Stack.Screen name="SecuritySettings" component={SecuritySettings} options={{ title: 'Security' }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About Safe Nepal' }} />

            {/* SHARED FUNCTIONAL SCREENS */}
            <Stack.Screen name="Alerts" component={AlertScreen} options={{ title: 'Live Alerts' }} />
            <Stack.Screen name="Analytics" component={PredictionAnalyticsScreen} options={{ title: 'Risk Forecast' }} />
            <Stack.Screen name="FirstAidScreen" component={SafetyTipsScreen} options={{ title: 'First Aid Guide' }} />
            <Stack.Screen name="SafetyTips" component={SafetyTipsScreen} options={{ title: 'Safety Tips' }} />
            <Stack.Screen name="GeneralMap" component={MapScreen} options={{ title: 'Interactive Map' }} />

            {/* CITIZEN SPECIFIC ROUTES */}
            <Stack.Screen name="SOSScreen" component={SOSScreen} options={{ title: 'Emergency SOS' }} />
            <Stack.Screen name="ReliefCenter" component={ReliefCenterScreen} options={{ title: 'Relief Centers' }} />
            <Stack.Screen name="History" component={PastReportsScreen} options={{ title: 'My Reports' }} />
            <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} options={{ title: 'Emergency Contacts' }} />
            <Stack.Screen name="NewReport" component={ReportDisasterScreen} options={{ title: 'Report Incident' }} />

            {/* POLICE / RESPONDER SPECIFIC ROUTES */}
            <Stack.Screen name="PoliceDashboard" component={PoliceDashboardScreen} options={{ title: 'Force Dashboard' }} />
            <Stack.Screen name="RealTimeMap" component={RealTimeMapScreen} options={{ title: 'Live Patrol Map' }} />
            <Stack.Screen name="Volunteer" component={VolunteerScreen} options={{ title: 'Volunteer Coordination' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider>
          <AppNavigator />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ 
  center: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  } 
});