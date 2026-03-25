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
// Important: Ensure this path leads to the new AccountScreen we built!
import AccountScreen from './src/screens/Shared Folder/AccountScreen'; 
import AccountSettings from './src/screens/Shared Folder/AccountSettings'; 

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { role, token } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        key={role} 
        screenOptions={{ headerShown: false }}
      >
        {token == null ? (
          /* 1. Auth Stack */
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : role === "RESPONDER" ? (
          /* 2. Police Mode Stack */
          <>
            <Stack.Screen name="ResponderHome" component={ResponderDashboard} />
            <Stack.Screen name="RealTimeMap" component={RealTimeMapScreen} />
            <Stack.Screen name="AlertScreen" component={AlertScreen} />
            <Stack.Screen name="SOSList" component={SOSListScreen} />
            <Stack.Screen name="Volunteer" component={VolunteerScreen} />
            <Stack.Screen name="Profile" component={AccountScreen} />
            <Stack.Screen name="AccountSettings" component={AccountSettings} />
          </>
        ) : (
          /* 3. Citizen Mode Stack */
          <>
            <Stack.Screen name="UserHome" component={HomeScreen} />
            <Stack.Screen name="SOS" component={SOSScreen} />
            <Stack.Screen name="SOSList" component={SOSListScreen} />
            <Stack.Screen name="SafetyTips" component={SafetyTipsScreen} />
            <Stack.Screen name="AddContact" component={AddContactScreen} />
            {/* Sync this with the item.target in your AccountScreen */}
            <Stack.Screen name="EmergencyContactsScreen" component={AddContactScreen} />
            <Stack.Screen name="Profile" component={AccountScreen} />
            <Stack.Screen name="AccountSettings" component={AccountSettings} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}