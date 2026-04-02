import React, { useContext, useEffect } from 'react';
import { 
  StatusBar, 
  ActivityIndicator, 
  View, 
  StyleSheet, 
  Platform, 
  UIManager 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Context Providers
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext'; 
import { AuthProvider, AuthContext } from './src/context/AuthContext'; 

// Services
import { NotificationService } from './src/screens/Shared Folder/NotificationService'; 

// --- SCREEN IMPORTS ---
import WelcomeScreen from './src/screens/Shared Folder/WelcomeScreen';
import LoginScreen from './src/screens/Shared Folder/LoginScreen'; 
import SignupScreen from './src/screens/Shared Folder/SignupScreen';
import ProfileScreen from './src/screens/Shared Folder/ProfileScreen'; 

// Citizen Folder
import HomeScreen from './src/screens/Citizen Folder/HomeScreen';
import ReportDisasterScreen from './src/screens/Citizen Folder/IncidentReportScreen'; 
import PastReportsScreen from './src/screens/Citizen Folder/PastReportsScreen';
import SOSScreen from './src/screens/Citizen Folder/SOSScreen';
import ReliefCenterScreen from './src/screens/Citizen Folder/ReliefCenterScreen';
import EmergencyContactsScreen from './src/screens/Citizen Folder/EmergencyContactsScreen';
import SafetyTipsScreen from './src/screens/Citizen Folder/SafetyTipsScreen';
import PredictionAnalyticsScreen from './src/screens/Citizen Folder/PredictionAnalyticsScreen';
import SafeZonesScreen from './src/screens/Citizen Folder/SafeZonesScreen'; 

// Police Folder
import ResponderDashboard from './src/screens/Police Folder/ResponderDashboard'; 
import PoliceDashboardScreen from './src/screens/Police Folder/PoliceDashboardScreen';
import AlertScreen from './src/screens/Police Folder/AlertScreen';
import RealTimeMapScreen from './src/screens/Police Folder/RealTimeMapScreen'; 
import VolunteerScreen from './src/screens/Police Folder/VolunteerScreen'; 

// Shared Folder
import MapScreen from './src/screens/Shared Folder/Map';
import AboutScreen from './src/screens/Shared Folder/AboutScreen';
import AccountScreen from './src/screens/Shared Folder/AccountScreen'; 
import AccountSettings from './src/screens/Shared Folder/AccountSettings'; 
import EditProfileScreen from './src/screens/Shared Folder/EditProfileScreen'; 
import NotificationSettings from './src/screens/Shared Folder/NotificationSettings';
import PrivacySettings from './src/screens/Shared Folder/PrivacySettings';
import SecuritySettings from './src/screens/Shared Folder/SecuritySettings';
import HelpScreen from './src/screens/Shared Folder/HelpScreen'; 

// --- NEW IMPORTS: Billing & Linked Accounts ---
import BillingScreen from './src/screens/Shared Folder/BillingScreen';
import LinkedAccountsScreen from './src/screens/Shared Folder/LinkedAccountsScreen';

// Fix Android Animation Warning
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { theme } = useContext(ThemeContext);
  const { token, loading, role } = useContext(AuthContext); 
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const setupNotifications = async () => {
      try {
        await NotificationService.init();
      } catch (err) {
        console.log("Notification Init Failed:", err);
      }
    };
    setupNotifications();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: isDarkMode ? '#020617' : '#f5f5f5' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Stack.Navigator 
        screenOptions={{ 
          headerStyle: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }, 
          headerTintColor: isDarkMode ? '#F1F5F9' : '#0f172a',
          headerTitleStyle: { fontWeight: '800', fontSize: 17 },
          headerShadowVisible: false,
          headerBackTitleVisible: false, 
          animation: 'fade_from_bottom'
        }}
      >
        {token == null ? (
          // --- AUTHENTICATION FLOW ---
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </Stack.Group>
        ) : (
          // --- MAIN APPLICATION FLOW ---
          <Stack.Group>
            {/* 1. Main Dashboard (Role-based) */}
            <Stack.Screen 
              name="Home" 
              component={role === 'RESPONDER' ? ResponderDashboard : HomeScreen} 
              options={{ headerShown: false }} 
            />

            {/* 2. Profile & Account Settings Hub */}
            <Stack.Group screenOptions={{ headerShown: true }}>
              <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
              <Stack.Screen name="AccountMenu" component={AccountScreen} options={{ title: 'Settings' }} /> 
              <Stack.Screen name="AccountSettings" component={AccountSettings} options={{ title: 'Manage Account' }} />
              
              {/* Added Billing and Linked Accounts screens to the stack */}
              <Stack.Screen name="BillingScreen" component={BillingScreen} options={{ title: 'Billing & Plans' }} />
              <Stack.Screen name="LinkedAccountsScreen" component={LinkedAccountsScreen} options={{ title: 'Linked Accounts' }} />
              
              <Stack.Screen 
                name="EditProfile" 
                component={EditProfileScreen} 
                options={{ presentation: 'modal', title: 'Edit Profile' }} 
              /> 
            </Stack.Group>

            {/* 3. Settings Sub-screens */}
            <Stack.Screen name="NotificationSettings" component={NotificationSettings} options={{ title: 'Notifications' }} />
            <Stack.Screen name="PrivacySettings" component={PrivacySettings} options={{ title: 'Privacy' }} />
            <Stack.Screen name="SecuritySettings" component={SecuritySettings} options={{ title: 'Security' }} />
            <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help & FAQ' }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About Safe Nepal' }} />

            {/* 4. Core Features */}
            <Stack.Screen 
               name="Analytics" 
               component={PredictionAnalyticsScreen} 
               options={{ 
                 title: 'Risk Forecast',
                 headerTransparent: true, 
                 headerTintColor: '#fff',
                 headerTitleStyle: { fontWeight: '900' }
               }} 
            />
            <Stack.Screen name="Alerts" component={AlertScreen} options={{ title: 'Live Alerts' }} />
            <Stack.Screen name="GeneralMap" component={MapScreen} options={{ title: 'Interactive Map' }} />
            <Stack.Screen name="SafetyTips" component={SafetyTipsScreen} options={{ title: 'Safety Guide' }} />
            <Stack.Screen name="SafeZones" component={SafeZonesScreen} options={{ title: 'Safe Zones' }} />
            <Stack.Screen name="ReliefCenter" component={ReliefCenterScreen} options={{ title: 'Relief Centers' }} />
            <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} options={{ title: 'Emergency Contacts' }} />
            <Stack.Screen name="History" component={PastReportsScreen} options={{ title: 'My Reports' }} />
            <Stack.Screen name="NewReport" component={ReportDisasterScreen} options={{ title: 'Report Incident' }} />

            {/* 5. Emergency Screen */}
            <Stack.Screen 
              name="SOSScreen" 
              component={SOSScreen} 
              options={{ 
                title: 'Emergency SOS', 
                headerStyle: { backgroundColor: '#ef4444' }, 
                headerTintColor: '#fff' 
              }} 
            />

            {/* 6. Police/Responder Specific Screens */}
            <Stack.Screen name="PoliceDashboard" component={PoliceDashboardScreen} options={{ title: 'Force Dashboard' }} />
            <Stack.Screen name="RealTimeMap" component={RealTimeMapScreen} options={{ title: 'Live Patrol Map' }} />
            <Stack.Screen name="Volunteer" component={VolunteerScreen} options={{ title: 'Volunteer Coordination' }} />
          </Stack.Group>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' } 
});