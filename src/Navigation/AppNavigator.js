import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// --- Context ---
import { AuthContext } from './src/context/AuthContext';

// --- 📂 AUTH SCREENS ---
import LoginScreen from './src/screens/Shared Folder/LoginScreen';

// --- 📂 CITIZEN SCREENS ---
import HomeScreen from './src/screens/Citizen Folder/HomeScreen';
import SOSScreen from './src/screens/Citizen Folder/SOSScreen';
import SOSListScreen from './src/screens/Citizen Folder/SOSListScreen';
import SafetyTipsScreen from './src/screens/Citizen Folder/SafetyTipsScreen';
import AddContactScreen from './src/screens/Citizen Folder/AddContactScreen';

// --- 📂 POLICE / RESPONDER SCREENS ---
import ResponderDashboard from './src/screens/Police Folder/ResponderDashboard';
import RealTimeMapScreen from './src/screens/Police Folder/RealTimeMapScreen';
import AlertScreen from './src/screens/Police Folder/AlertScreen';
import VolunteerScreen from './src/screens/Police Folder/VolunteerScreen';

// --- 📂 SHARED SCREENS ---
import AccountScreen from './src/screens/Shared Folder/AccountScreen'; 
import AccountSettings from './src/screens/Shared Folder/AccountSettings'; 
import EditProfileScreen from './src/screens/Shared Folder/EditProfileScreen';
import BillingScreen from './src/screens/Shared Folder/BillingScreen'; 
import LinkedAccountsScreen from './src/screens/Shared Folder/LinkedAccountsScreen';
import PrivacySettings from './src/screens/Shared Folder/PrivacySettings';
// ✅ NEW SCREEN IMPORTS
import SecuritySettings from './src/screens/Shared Folder/SecuritySettings';
import NotificationSettings from './src/screens/Shared Folder/NotificationSettings';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { role, token } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {token == null ? (
          /* 1. Auth Stack */
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            {/* 🟢 COMMON SHARED SCREENS (Always Registered for logged-in users) */}
            <Stack.Screen name="AccountSettings" component={AccountSettings} />
            <Stack.Screen name="Profile" component={AccountScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
            <Stack.Screen name="BillingScreen" component={BillingScreen} />
            <Stack.Screen name="LinkedAccountsScreen" component={LinkedAccountsScreen} />
            <Stack.Screen name="PrivacySettings" component={PrivacySettings} />
            <Stack.Screen name="SecuritySettings" component={SecuritySettings} />
            <Stack.Screen name="NotificationSettings" component={NotificationSettings} />
            <Stack.Screen name="SOSList" component={SOSListScreen} />

            {/* 🔵 ROLE-BASED SCREENS */}
            {role === "RESPONDER" ? (
              <>
                <Stack.Screen name="ResponderHome" component={ResponderDashboard} />
                <Stack.Screen name="RealTimeMap" component={RealTimeMapScreen} />
                <Stack.Screen name="AlertScreen" component={AlertScreen} />
                <Stack.Screen name="Volunteer" component={VolunteerScreen} />
              </>
            ) : (
              <>
                <Stack.Screen name="UserHome" component={HomeScreen} />
                <Stack.Screen name="SOS" component={SOSScreen} />
                <Stack.Screen name="SafetyTips" component={SafetyTipsScreen} />
                <Stack.Screen name="AddContact" component={AddContactScreen} />
                <Stack.Screen name="EmergencyContactsScreen" component={AddContactScreen} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}