import React, { useContext, useEffect } from 'react';
import { 
  StatusBar, 
  View, 
  StyleSheet, 
  Platform 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Context Providers
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext'; 
import { AuthProvider, AuthContext } from './src/context/AuthContext'; 

// Services
import { NotificationService } from './src/screens/SharedFolder/NotificationService'; 

// --- SCREEN IMPORTS ---
import WelcomeScreen from './src/screens/SharedFolder/WelcomeScreen';
import LoginScreen from './src/screens/SharedFolder/LoginScreen'; 
import SignupScreen from './src/screens/SharedFolder/SignupScreen';
import ProfileScreen from './src/screens/SharedFolder/ProfileScreen'; 

// Citizen Folder
import HomeScreen from './src/screens/CitizenFolder/HomeScreen';
import ReportDisasterScreen from './src/screens/CitizenFolder/IncidentReportScreen'; 
import PastReportsScreen from './src/screens/CitizenFolder/PastReportsScreen';
import SOSScreen from './src/screens/CitizenFolder/SOSScreen';
import ReliefCenterScreen from './src/screens/CitizenFolder/ReliefCenterScreen';
import EmergencyContactsScreen from './src/screens/CitizenFolder/EmergencyContactsScreen';
import SafetyTipsScreen from './src/screens/CitizenFolder/SafetyTipsScreen';
import PredictionAnalyticsScreen from './src/screens/CitizenFolder/PredictionAnalyticsScreen';
import SafeZonesScreen from './src/screens/CitizenFolder/SafeZonesScreen'; 

// Police Folder
import PoliceDashboardScreen from './src/screens/PoliceFolder/PoliceDashboardScreen';
import AlertScreen from './src/screens/PoliceFolder/AlertScreen';
import RealTimeMapScreen from './src/screens/PoliceFolder/RealTimeMapScreen'; 
import VolunteerScreen from './src/screens/PoliceFolder/VolunteerScreen'; 

// Shared Folder
import MapScreen from './src/screens/SharedFolder/Map';
import AboutScreen from './src/screens/SharedFolder/AboutScreen';
import AccountScreen from './src/screens/SharedFolder/AccountScreen'; 
import AccountSettings from './src/screens/SharedFolder/AccountSettings'; 
import EditProfileScreen from './src/screens/SharedFolder/EditProfileScreen'; 
import NotificationSettings from './src/screens/SharedFolder/NotificationSettings';
import PrivacySettings from './src/screens/SharedFolder/PrivacySettings';
import SecuritySettings from './src/screens/SharedFolder/SecuritySettings';
import HelpScreen from './src/screens/SharedFolder/HelpScreen'; 
import BillingScreen from './src/screens/SharedFolder/BillingScreen';
import LinkedAccountsScreen from './src/screens/SharedFolder/LinkedAccountsScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const setupNotifications = async () => {
      try { 
        await NotificationService.init(); 
      } catch (err) { 
        console.log("Notification Init skipped or handled for Expo Go."); 
      }
    };
    setupNotifications();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        translucent 
        backgroundColor="transparent" 
      />
      <Stack.Navigator 
        // FORCE START AT HOME (Citizen Dashboard)
        initialRouteName="Home"
        screenOptions={{ 
          headerStyle: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }, 
          headerTintColor: isDarkMode ? '#F1F5F9' : '#0f172a',
          headerTitleStyle: { fontWeight: '800', fontSize: 17 },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right'
        }}
      >
        {/* 1. CITIZEN DASHBOARD (Main Entry) */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ headerShown: false }} 
        />

        {/* 2. POLICE DASHBOARD (The Mode Switch Target) */}
        <Stack.Screen 
          name="PoliceDashboard" 
          component={PoliceDashboardScreen} 
          options={{ 
            headerShown: false,
            gestureEnabled: false // Disables swiping back to Citizen mode manually
          }} 
        />

        {/* 3. AUTHENTICATION (Available if needed) */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />

        {/* 4. CORE SHARED SCREENS */}
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
        <Stack.Screen name="AccountMenu" component={AccountScreen} options={{ title: 'Settings' }} /> 
        <Stack.Screen name="AccountSettings" component={AccountSettings} options={{ title: 'Manage Account' }} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ presentation: 'modal', title: 'Edit Profile' }} />
        
        {/* 5. APP SETTINGS */}
        <Stack.Screen name="NotificationSettings" component={NotificationSettings} options={{ title: 'Notifications' }} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettings} options={{ title: 'Privacy' }} />
        <Stack.Screen name="SecuritySettings" component={SecuritySettings} options={{ title: 'Security' }} />
        <Stack.Screen name="BillingScreen" component={BillingScreen} options={{ title: 'Billing & Plans' }} />
        <Stack.Screen name="LinkedAccountsScreen" component={LinkedAccountsScreen} options={{ title: 'Linked Accounts' }} />
        <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help & FAQ' }} />
        <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About Safe Nepal' }} />

        {/* 6. CITIZEN SPECIFIC FEATURES */}
        <Stack.Screen name="Analytics" component={PredictionAnalyticsScreen} options={{ title: 'Risk Forecast' }} />
        <Stack.Screen name="GeneralMap" component={MapScreen} options={{ title: 'Interactive Map' }} />
        <Stack.Screen name="SafetyTips" component={SafetyTipsScreen} options={{ title: 'Safety Guide' }} />
        <Stack.Screen name="SafeZones" component={SafeZonesScreen} options={{ title: 'Safe Zones' }} />
        <Stack.Screen name="ReliefCenter" component={ReliefCenterScreen} options={{ title: 'Relief Centers' }} />
        <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} options={{ title: 'Emergency Contacts' }} />
        <Stack.Screen name="History" component={PastReportsScreen} options={{ title: 'My Reports' }} />
        <Stack.Screen name="NewReport" component={ReportDisasterScreen} options={{ title: 'Report Incident' }} />
        <Stack.Screen 
          name="SOSScreen" 
          component={SOSScreen} 
          options={{ 
            title: 'Emergency SOS', 
            headerStyle: { backgroundColor: '#ef4444' }, 
            headerTintColor: '#fff' 
          }} 
        />

        {/* 7. POLICE SPECIFIC FEATURES */}
        <Stack.Screen name="Alerts" component={AlertScreen} options={{ title: 'Live Alerts' }} />
        <Stack.Screen name="RealTimeMap" component={RealTimeMapScreen} options={{ title: 'Live Patrol Map' }} />
        <Stack.Screen name="Volunteer" component={VolunteerScreen} options={{ title: 'Volunteer Coordination' }} />

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