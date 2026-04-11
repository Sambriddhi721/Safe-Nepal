import React, { useContext, useEffect } from 'react';
import { StatusBar, Platform, LogBox, ActivityIndicator, View } from 'react-native';
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

import HomeScreen from './src/screens/CitizenFolder/HomeScreen';
import CitizenAlertScreen from './src/screens/CitizenFolder/Alert'; 
import ReportDisasterScreen from './src/screens/CitizenFolder/ReportDisasterScreen'; 
import IncidentReportScreen from './src/screens/CitizenFolder/IncidentReportScreen';
import PastReportsScreen from './src/screens/CitizenFolder/PastReportsScreen';
import SOSScreen from './src/screens/CitizenFolder/SOSScreen';
import SOSListScreen from './src/screens/CitizenFolder/SOSListScreen'; 
import ReliefCenterScreen from './src/screens/CitizenFolder/ReliefCenterScreen';
import ReliefCenterDetails from './src/screens/CitizenFolder/ReliefCenterDetails'; 
import EmergencyContactsScreen from './src/screens/CitizenFolder/EmergencyContactsScreen';
import AddContactScreen from './src/screens/CitizenFolder/AddContactScreen';
import SafetyTipsScreen from './src/screens/CitizenFolder/SafetyTipsScreen';
import PredictionAnalyticsScreen from './src/screens/CitizenFolder/PredictionAnalyticsScreen';
import SafeZonesScreen from './src/screens/CitizenFolder/SafeZonesScreen'; 

import PoliceDashboardScreen from './src/screens/PoliceFolder/PoliceDashboardScreen';
import PoliceAlertScreen from './src/screens/PoliceFolder/AlertScreen'; 
import AlertDetailsScreen from './src/screens/PoliceFolder/AlertDetailsScreen'; 
import RealTimeMapScreen from './src/screens/PoliceFolder/RealTimeMapScreen'; 
import VolunteerScreen from './src/screens/PoliceFolder/VolunteerScreen'; 
import SOSList from './src/screens/PoliceFolder/SOSList';

// Clean up logs for development
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'expo-notifications', // Hides the Expo Go notification warning
  'setLayoutAnimationEnabledExperimental'
]);

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { theme } = useContext(ThemeContext);
  const { user, role, loading } = useContext(AuthContext); 
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const setupNotifications = async () => {
      // Check if running in Expo Go to avoid the hard error
      if (__DEV__ && Platform.OS === 'android') {
        console.log("Skipping push notifications setup in Expo Go development.");
        return;
      }
      try { 
        await NotificationService.init(); 
      } catch (err) { 
        console.warn("Notification Service restricted."); 
      }
    };
    setupNotifications();
  }, []);

  if (loading && !user) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isDarkMode ? '#020617' : '#fff' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar 
        barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
        translucent 
        backgroundColor="transparent" 
      />
      <Stack.Navigator 
        initialRouteName={!user ? "Welcome" : (role === 'RESPONDER' ? "PoliceDashboard" : "Home")}
        screenOptions={{ 
          headerStyle: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }, 
          headerTintColor: isDarkMode ? '#F1F5F9' : '#0f172a',
          headerTitleStyle: { fontWeight: '800', fontSize: 17 },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_right'
        }}
      >
        {!user ? (
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Signup" component={SignupScreen} />
          </Stack.Group>
        ) : (
          <>
            {role === 'RESPONDER' ? (
              <Stack.Group>
                <Stack.Screen name="PoliceDashboard" component={PoliceDashboardScreen} options={{ headerShown: false }} />
                <Stack.Screen name="PoliceAlerts" component={PoliceAlertScreen} options={{ title: 'Responder Feed' }} />
                <Stack.Screen name="AlertDetails" component={AlertDetailsScreen} options={{ title: 'Alert Info' }} />
                <Stack.Screen name="SOSList" component={SOSList} options={{ title: 'SOS Signals' }} />
                <Stack.Screen name="RealTimeMap" component={RealTimeMapScreen} options={{ title: 'Dispatch Map' }} />
                <Stack.Screen name="Volunteer" component={VolunteerScreen} options={{ title: 'Volunteers' }} />
                <Stack.Screen name="ResponderDashboard" component={PoliceDashboardScreen} options={{ headerShown: false }} />
              </Stack.Group>
            ) : (
              <Stack.Group>
                <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
                <Stack.Screen name="Alerts" component={CitizenAlertScreen} options={{ title: 'Safety Alerts' }} />
                <Stack.Screen name="AlertDetails" component={AlertDetailsScreen} options={{ title: 'Alert Info' }} />
                <Stack.Screen name="Analytics" component={PredictionAnalyticsScreen} options={{ title: 'Forecasts' }} />
                <Stack.Screen name="GeneralMap" component={MapScreen} options={{ title: 'Safe Map' }} />
                <Stack.Screen name="SafetyTips" component={SafetyTipsScreen} options={{ title: 'Safety Procedures' }} />
                <Stack.Screen name="SafeZones" component={SafeZonesScreen} options={{ title: 'Evacuation Zones' }} />
                <Stack.Screen name="ReliefCenter" component={ReliefCenterScreen} options={{ title: 'Relief Help' }} />
                <Stack.Screen name="ReliefCenterDetails" component={ReliefCenterDetails} options={{ title: 'Center Info' }} />
                <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} options={{ title: 'Contacts' }} />
                <Stack.Screen name="AddContact" component={AddContactScreen} options={{ title: 'Add Contact' }} />
                <Stack.Screen name="History" component={PastReportsScreen} options={{ title: 'My History' }} />
                <Stack.Screen name="NewReport" component={ReportDisasterScreen} options={{ title: 'Report Incident' }} />
                <Stack.Screen name="IncidentReport" component={IncidentReportScreen} options={{ title: 'Incident Detail' }} />
                <Stack.Group screenOptions={{ headerStyle: { backgroundColor: '#ef4444' }, headerTintColor: '#fff' }}>
                  <Stack.Screen name="SOS" component={SOSScreen} options={{ title: 'EMERGENCY SOS' }} />
                  <Stack.Screen name="SOSListScreen" component={SOSListScreen} options={{ title: 'My SOS Status' }} />
                </Stack.Group>
                <Stack.Screen name="SOSScreen" component={SOSScreen} options={{ headerShown: false }} /> 
              </Stack.Group>
            )}

            <Stack.Group>
              <Stack.Screen name="AccountMenu" component={AccountScreen} options={{ title: 'Settings' }} /> 
              <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
              <Stack.Screen name="AccountSettings" component={AccountSettings} options={{ title: 'Manage Account' }} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ presentation: 'modal', title: 'Update Profile' }} />
              <Stack.Screen name="NotificationSettings" component={NotificationSettings} options={{ title: 'Alert Preferences' }} />
              <Stack.Screen name="PrivacySettings" component={PrivacySettings} options={{ title: 'Data Privacy' }} />
              <Stack.Screen name="SecuritySettings" component={SecuritySettings} options={{ title: 'App Security' }} />
              <Stack.Screen name="BillingScreen" component={BillingScreen} options={{ title: 'Billing' }} />
              <Stack.Screen name="Help" component={HelpScreen} options={{ title: 'Help Center' }} />
              <Stack.Screen name="About" component={AboutScreen} options={{ title: 'Safe Nepal v2.1' }} />
            </Stack.Group>
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