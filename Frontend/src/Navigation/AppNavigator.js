import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { AuthContext } from "../context/AuthContext";

// --- Stacks ---
import AuthStack from "./AuthStack";
import UserStack from "./UserStack";
import HelperStack from "./HelperStack";

// --- 📂 SHARED SCREENS (From Shared Folder) ---
import LoginScreen from '../screens/Shared Folder/LoginScreen';
import SignupScreen from '../screens/Shared Folder/SignupScreen';
import WelcomeScreen from '../screens/Shared Folder/WelcomeScreen';
import AboutScreen from '../screens/Shared Folder/AboutScreen';
import AccountScreen from '../screens/Shared Folder/AccountScreen';
import AccountSettings from '../screens/Shared Folder/AccountSettings';
import BillingScreen from '../screens/Shared Folder/BillingScreen';
import EditProfileScreen from '../screens/Shared Folder/EditProfileScreen';
import EmailVerificationScreen from '../screens/Shared Folder/EmailVerificationScreen';
import HelpScreen from '../screens/Shared Folder/HelpScreen';
import LinkedAccountsScreen from '../screens/Shared Folder/LinkedAccountsScreen';
import NotificationSettings from '../screens/Shared Folder/NotificationSettings';
import PrivacySettings from '../screens/Shared Folder/PrivacySettings';
import ProfileScreen from '../screens/Shared Folder/ProfileScreen';
import SecuritySettings from '../screens/Shared Folder/SecuritySettings';

// --- 📂 CITIZEN SCREENS (From Citizen Folder) ---
import HomeScreen from '../screens/Citizen Folder/HomeScreen';
import SOSScreen from '../screens/Citizen Folder/SOSScreen';
import SOSListScreen from '../screens/Citizen Folder/SOSListScreen';
import IncidentReportScreen from '../screens/Citizen Folder/IncidentReportScreen';
import PastReportsScreen from '../screens/Citizen Folder/PastReportsScreen';
import PredictionAnalyticsScreen from '../screens/Citizen Folder/PredictionAnalyticsScreen';
import ReliefCenterScreen from '../screens/Citizen Folder/ReliefCenterScreen';
import ReliefCenterDetails from '../screens/Citizen Folder/ReliefCenterDetails';
import SafeZonesScreen from '../screens/Citizen Folder/SafeZonesScreen';
import SafetyTipsScreen from '../screens/Citizen Folder/SafetyTipsScreen';
import AddContactScreen from '../screens/Citizen Folder/AddContactScreen';
import EmergencyContactsScreen from '../screens/Citizen Folder/EmergencyContactsScreen';

// --- 📂 POLICE SCREENS (From Police Folder) ---
import ResponderDashboard from '../screens/Police Folder/ResponderDashboard';
import PoliceDashboardScreen from '../screens/Police Folder/PoliceDashboardScreen';
import AlertScreen from '../screens/Police Folder/AlertScreen';
import AlertDetailsScreen from '../screens/Police Folder/AlertDetailsScreen';
import RealTimeMapScreen from '../screens/Police Folder/RealTimeMapScreen';
import VolunteerScreen from '../screens/Police Folder/VolunteerScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* --- MAIN STACKS --- */}
        <Stack.Screen name="UserHome" component={UserStack} />
        <Stack.Screen name="ResponderHome" component={HelperStack} />
        <Stack.Screen name="AuthFlow" component={AuthStack} />

        {/* --- GLOBAL SHARED ROUTES --- */}
        <Stack.Screen name="AccountSettings" component={AccountSettings} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettings} />
        <Stack.Screen name="PrivacySettings" component={PrivacySettings} />
        <Stack.Screen name="SecuritySettings" component={SecuritySettings} />
        <Stack.Screen name="LinkedAccountsScreen" component={LinkedAccountsScreen} />
        <Stack.Screen name="BillingScreen" component={BillingScreen} />
        <Stack.Screen name="Profile" component={AccountScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />

        {/* --- INDIVIDUAL CITIZEN ROUTES --- */}
        <Stack.Screen name="SOS" component={SOSScreen} />
        <Stack.Screen name="SOSList" component={SOSListScreen} />
        <Stack.Screen name="IncidentReport" component={IncidentReportScreen} />
        <Stack.Screen name="PredictionAnalytics" component={PredictionAnalyticsScreen} />
        <Stack.Screen name="ReliefCenters" component={ReliefCenterScreen} />
        <Stack.Screen name="ReliefCenterDetails" component={ReliefCenterDetails} />
        <Stack.Screen name="SafeZones" component={SafeZonesScreen} />
        <Stack.Screen name="SafetyTips" component={SafetyTipsScreen} />
        <Stack.Screen name="AddContact" component={AddContactScreen} />
        <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />

        {/* --- INDIVIDUAL POLICE/RESPONDER ROUTES --- */}
        <Stack.Screen name="ResponderDashboard" component={ResponderDashboard} />
        <Stack.Screen name="PoliceDashboard" component={PoliceDashboardScreen} />
        <Stack.Screen name="Alerts" component={AlertScreen} />
        <Stack.Screen name="AlertDetails" component={AlertDetailsScreen} />
        <Stack.Screen name="RealTimeMap" component={RealTimeMapScreen} />
        <Stack.Screen name="Volunteer" component={VolunteerScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}