import React, { useContext, useEffect } from 'react';
import { StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Context Providers
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext'; 
import { AuthProvider, AuthContext } from './src/context/AuthContext'; 

// Services
import { NotificationService } from './src/screens/SharedFolder/NotificationService'; 

// --- SCREEN IMPORTS ---

// 1. Shared Folder
import WelcomeScreen from './src/screens/SharedFolder/WelcomeScreen';
import LoginScreen from './src/screens/SharedFolder/LoginScreen'; 
import SignupScreen from './src/screens/SharedFolder/SignupScreen';
import ProfileScreen from './src/screens/SharedFolder/ProfileScreen'; 
import MapScreen from './src/screens/SharedFolder/Map';
import AboutScreen from './src/screens/SharedFolder/AboutScreen';
import AccountScreen from './src/screens/SharedFolder/AccountScreen'; 
import AccountSettings from './src/screens/SharedFolder/AccountSettings'; 
import EditProfileScreen from './src/screens/SharedFolder/EditProfileScreen'; 
import NotificationSettings from './src/screens/SharedFolder/NotificationSettings';
import PrivacySettings from './src/screens/SharedFolder/PrivacySettings';
import SecuritySettings from './src/screens/SharedFolder/SecuritySettings';
import HelpScreen from './src/screens/SharedFolder/HelpScreen'; 

// 2. Citizen Folder
import HomeScreen from './src/screens/CitizenFolder/HomeScreen';
import CitizenAlertScreen from './src/screens/CitizenFolder/Alert'; // New Citizen Alert
import ReportDisasterScreen from './src/screens/CitizenFolder/IncidentReportScreen'; 
import PastReportsScreen from './src/screens/CitizenFolder/PastReportsScreen';
import SOSScreen from './src/screens/CitizenFolder/SOSScreen';
import ReliefCenterScreen from './src/screens/CitizenFolder/ReliefCenterScreen';
import EmergencyContactsScreen from './src/screens/CitizenFolder/EmergencyContactsScreen';
import AddContactScreen from './src/screens/CitizenFolder/AddContactScreen';
import SafetyTipsScreen from './src/screens/CitizenFolder/SafetyTipsScreen';
import PredictionAnalyticsScreen from './src/screens/CitizenFolder/PredictionAnalyticsScreen';
import SafeZonesScreen from './src/screens/CitizenFolder/SafeZonesScreen'; 

// 3. Police Folder
import PoliceDashboardScreen from './src/screens/PoliceFolder/PoliceDashboardScreen';
import PoliceAlertScreen from './src/screens/PoliceFolder/AlertScreen'; // Renamed to avoid collision
import AlertDetailsScreen from './src/screens/PoliceFolder/AlertDetailsScreen'; 
import RealTimeMapScreen from './src/screens/PoliceFolder/RealTimeMapScreen'; 
import VolunteerScreen from './src/screens/PoliceFolder/VolunteerScreen'; 

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { theme } = useContext(ThemeContext);
  const { role, loading } = useContext(AuthContext); 
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const setupNotifications = async () => {
      try { 
        await NotificationService.init(); 
      } catch (err) { 
        console.log("Notification Service: Running in restricted environment (Expo Go/Sim)."); 
      }
    };
    setupNotifications();
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        translucent 
        backgroundColor="transparent" 
      />
      <Stack.Navigator 
        screenOptions={{ 
          headerStyle: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }, 
          headerTintColor: isDarkMode ? '#F1F5F9' : '#0f172a',
          headerTitleStyle: { fontWeight: '800', fontSize: 17 },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right'
        }}
      >
        {role === "RESPONDER" ? (
          // --- 👮 POLICE MODE STACK ---
          <Stack.Group>
            <Stack.Screen 
              name="PoliceDashboard" 
              component={PoliceDashboardScreen} 
              options={{ headerShown: false, gestureEnabled: false }} 
            />
            <Stack.Screen 
              name="Alerts" 
              component={PoliceAlertScreen} 
              options={{ title: 'Responder Live Alerts' }} 
            />
            <Stack.Screen 
              name="AlertDetails" 
              component={AlertDetailsScreen} 
              options={{ title: 'Incident Assessment' }} 
            />
            <Stack.Screen name="RealTimeMap" component={RealTimeMapScreen} options={{ title: 'Patrol Map' }} />
            <Stack.Screen name="Volunteer" component={VolunteerScreen} options={{ title: 'Volunteers' }} />
            
            {/* Shared Screens */}
            <Stack.Screen name="AccountMenu" component={AccountScreen} options={{ title: 'Settings' }} /> 
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
            <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Support' }} />
          </Stack.Group>
        ) : (
          // --- 🏠 CITIZEN MODE STACK ---
          <Stack.Group>
            <Stack.Screen 
              name="Home" 
              component={HomeScreen} 
              options={{ headerShown: false }} 
            />
            {/* NEW CITIZEN ALERT REGISTRATION */}
            <Stack.Screen 
              name="CitizenAlerts" 
              component={CitizenAlertScreen} 
              options={{ title: 'Public Safety Alerts' }} 
            />
            <Stack.Screen name="Analytics" component={PredictionAnalyticsScreen} options={{ title: 'Disaster Forecast' }} />
            <Stack.Screen name="GeneralMap" component={MapScreen} options={{ title: 'Safe Map' }} />
            <Stack.Screen name="SafetyTips" component={SafetyTipsScreen} options={{ title: 'Safety Procedures' }} />
            <Stack.Screen name="SafeZones" component={SafeZonesScreen} options={{ title: 'Evacuation Zones' }} />
            <Stack.Screen name="ReliefCenter" component={ReliefCenterScreen} options={{ title: 'Relief Help' }} />
            <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} options={{ title: 'Contacts' }} />
            <Stack.Screen name="AddContact" component={AddContactScreen} options={{ title: 'Add Contact' }} />
            <Stack.Screen name="History" component={PastReportsScreen} options={{ title: 'My Report History' }} />
            <Stack.Screen name="NewReport" component={ReportDisasterScreen} options={{ title: 'Report Incident' }} />
            <Stack.Screen 
              name="SOSScreen" 
              component={SOSScreen} 
              options={{ 
                title: 'EMERGENCY SOS', 
                headerStyle: { backgroundColor: '#ef4444' }, 
                headerTintColor: '#fff' 
              }} 
            />
            
            {/* Shared Screens */}
            <Stack.Screen name="AccountMenu" component={AccountScreen} options={{ title: 'Settings' }} /> 
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
            <Stack.Screen name="AccountSettings" component={AccountSettings} options={{ title: 'Manage Account' }} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ presentation: 'modal', title: 'Update Profile' }} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettings} options={{ title: 'Alert Preferences' }} />
            <Stack.Screen name="PrivacySettings" component={PrivacySettings} options={{ title: 'Data Privacy' }} />
            <Stack.Screen name="SecuritySettings" component={SecuritySettings} options={{ title: 'App Security' }} />
            <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help Center' }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ title: 'Safe Nepal v2.1' }} />
          </Stack.Group>
        )}

        {/* --- GLOBAL AUTH STACK --- */}
        <Stack.Group screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Group>
        
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