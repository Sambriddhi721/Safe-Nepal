import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// --- Context ---
import { AuthContext } from './src/context/AuthContext';

// --- 📂 SHARED SCREENS (From Shared Folder) ---
import WelcomeScreen from './src/screens/Shared Folder/WelcomeScreen';
import LoginScreen from './src/screens/Shared Folder/LoginScreen';
import SignupScreen from './src/screens/Shared Folder/SignupScreen';
import EmailVerificationScreen from './src/screens/Shared Folder/EmailVerificationScreen';
import AccountScreen from './src/screens/Shared Folder/AccountScreen'; 
import AccountSettings from './src/screens/Shared Folder/AccountSettings'; 
import EditProfileScreen from './src/screens/Shared Folder/EditProfileScreen';
import BillingScreen from './src/screens/Shared Folder/BillingScreen'; 
import LinkedAccountsScreen from './src/screens/Shared Folder/LinkedAccountsScreen';
import PrivacySettings from './src/screens/Shared Folder/PrivacySettings';
import SecuritySettings from './src/screens/Shared Folder/SecuritySettings';
import NotificationSettings from './src/screens/Shared Folder/NotificationSettings';
import HelpScreen from './src/screens/Shared Folder/HelpScreen';
import AboutScreen from './src/screens/Shared Folder/AboutScreen';

// --- 📂 CITIZEN SCREENS (From Citizen Folder) ---
import HomeScreen from './src/screens/Citizen Folder/HomeScreen';
import SOSScreen from './src/screens/Citizen Folder/SOSScreen';
import SOSListScreen from './src/screens/Citizen Folder/SOSListScreen';
import SafetyTipsScreen from './src/screens/Citizen Folder/SafetyTipsScreen';
import AddContactScreen from './src/screens/Citizen Folder/AddContactScreen';
import EmergencyContactsScreen from './src/screens/Citizen Folder/EmergencyContactsScreen';
import IncidentReportScreen from './src/screens/Citizen Folder/IncidentReportScreen';
import PastReportsScreen from './src/screens/Citizen Folder/PastReportsScreen';
import PredictionAnalyticsScreen from './src/screens/Citizen Folder/PredictionAnalyticsScreen';
import ReliefCenterScreen from './src/screens/Citizen Folder/ReliefCenterScreen';
import ReliefCenterDetails from './src/screens/Citizen Folder/ReliefCenterDetails';
import SafeZonesScreen from './src/screens/Citizen Folder/SafeZonesScreen';

// --- 📂 POLICE / RESPONDER SCREENS (From Police Folder) ---
import ResponderDashboard from './src/screens/Police Folder/ResponderDashboard';
import PoliceDashboardScreen from './src/screens/Police Folder/PoliceDashboardScreen';
import RealTimeMapScreen from './src/screens/Police Folder/RealTimeMapScreen';
import AlertScreen from './src/screens/Police Folder/AlertScreen';
import AlertDetailsScreen from './src/screens/Police Folder/AlertDetailsScreen';
import VolunteerScreen from './src/screens/Police Folder/VolunteerScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName="UserHome" // 🟢 Forced Entry Point
        screenOptions={{ headerShown: false }}
      >
        
        {/* 🔵 CITIZEN CORE */}
        <Stack.Screen name="UserHome" component={HomeScreen} />
        <Stack.Screen name="SOS" component={SOSScreen} />
        <Stack.Screen name="SOSList" component={SOSListScreen} />
        <Stack.Screen name="SafetyTips" component={SafetyTipsScreen} />
        <Stack.Screen name="AddContact" component={AddContactScreen} />
        <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
        <Stack.Screen name="IncidentReport" component={IncidentReportScreen} />
        <Stack.Screen name="PastReports" component={PastReportsScreen} />
        <Stack.Screen name="PredictionAnalytics" component={PredictionAnalyticsScreen} />
        <Stack.Screen name="ReliefCenters" component={ReliefCenterScreen} />
        <Stack.Screen name="ReliefCenterDetails" component={ReliefCenterDetails} />
        <Stack.Screen name="SafeZones" component={SafeZonesScreen} />

        {/* 🟡 SHARED / SETTINGS CORE */}
        <Stack.Screen name="Profile" component={AccountScreen} />
        <Stack.Screen name="AccountSettings" component={AccountSettings} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="BillingScreen" component={BillingScreen} />
        <Stack.Screen name="LinkedAccountsScreen" component={LinkedAccountsScreen} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettings} />
        <Stack.Screen name="SecuritySettings" component={SecuritySettings} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettings} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="About" component={AboutScreen} />

        {/* 🔴 POLICE / RESPONDER CORE */}
        <Stack.Screen name="ResponderHome" component={ResponderDashboard} />
        <Stack.Screen name="PoliceDashboard" component={PoliceDashboardScreen} />
        <Stack.Screen name="RealTimeMap" component={RealTimeMapScreen} />
        <Stack.Screen name="AlertScreen" component={AlertScreen} />
        <Stack.Screen name="AlertDetails" component={AlertDetailsScreen} />
        <Stack.Screen name="Volunteer" component={VolunteerScreen} />

        {/* ⚪ AUTH CORE */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}