import React, { useContext } from 'react';
import { StatusBar, ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- Context & Providers ---
import { ThemeProvider, ThemeContext } from './src/context/ThemeContext'; 
import { AuthProvider, AuthContext } from './src/context/AuthContext'; 

// --- Auth Screen ---
import LoginScreen from './src/screens/LoginScreen'; 

// --- Interface Screens ---
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
import AddContactScreen from './src/screens/AddContactScreen'; 
import FirstAidScreen from './src/screens/VolunteerScreen'; 

// --- Responder Specific Screens (UPDATED) ---
// Make sure this points to your new ResponderDashboard.js file
import ResponderDashboard from './src/screens/ResponderDashboard'; 
import SOSListScreen from './src/screens/SOSListScreen';

// --- Settings Sub-Screens ---
import AccountSettings from './src/screens/AccountSettings'; 
import NotificationSettings from './src/screens/NotificationSettings';
import PrivacySettings from './src/screens/PrivacySettings';
import SecuritySettings from './src/screens/SecuritySettings';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { theme } = useContext(ThemeContext);
  // Added 'role' here to control the view
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
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={isDarkMode ? '#020617' : '#3b82f6'} 
      />
      
      <Stack.Navigator 
        // Force a re-mount when token or role changes
        key={`${token}-${role}`}
        screenOptions={{ 
          headerStyle: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' }, 
          headerTintColor: isDarkMode ? '#F1F5F9' : '#000000', 
          headerTitleStyle: { fontWeight: 'bold' },
          headerBackTitleVisible: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: isDarkMode ? '#020617' : '#f5f5f5' } 
        }}
      >
        {token == null ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            {/* 1. DYNAMIC ENTRY POINT: Checks role to decide initial screen */}
            {role === 'RESPONDER' ? (
              <Stack.Screen 
                name="ResponderHome" 
                component={ResponderDashboard} 
                options={{ headerShown: false }} 
              />
            ) : (
              <Stack.Screen 
                name="Home" 
                component={HomeScreen} 
                options={{ headerShown: false }} 
              />
            )}
            
            {/* 2. SHARED SCREENS (Accessible by both roles) */}
            <Stack.Group>
                <Stack.Screen name="NewReport" component={ReportDisasterScreen} options={{ title: 'Submit Report' }} />
                <Stack.Screen name="History" component={PastReportsScreen} options={{ title: 'My Reports' }} />
                <Stack.Screen name="SOSScreen" component={SOSScreen} options={{ headerShown: false }} />
                <Stack.Screen name="FirstAidScreen" component={FirstAidScreen} options={{ title: 'Emergency First Aid' }} />
                <Stack.Screen name="PredictionAnalyticsScreen" component={PredictionAnalyticsScreen} options={{ title: 'Risk Analysis' }} />
                <Stack.Screen name="SOSList" component={SOSListScreen} options={{ title: 'Active SOS Alerts' }} />
            </Stack.Group>

            {/* 3. UTILITY & SETTINGS GROUP */}
            <Stack.Group screenOptions={{ presentation: 'card' }}>
                <Stack.Screen name="RealTimeMap" component={RealTimeMapScreen} options={{ title: 'Hazard Map' }} />
                <Stack.Screen name="AlertScreen" component={AlertScreen} options={{ title: 'Disaster Alerts' }} />
                <Stack.Screen name="ReliefCenterScreen" component={ReliefCenterScreen} options={{ title: 'Relief Centers' }} />
                <Stack.Screen name="EmergencyContactsScreen" component={EmergencyContactsScreen} options={{ title: 'Helplines' }} />
                <Stack.Screen name="SafetyTipsScreen" component={SafetyTipsScreen} options={{ title: 'Safety Manual' }} />
                <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
                <Stack.Screen name="About" component={AboutScreen} options={{ title: 'About Safe Nepal' }} />
                <Stack.Screen name="AddContact" component={AddContactScreen} options={{ title: 'Emergency Contacts' }} />
                <Stack.Screen name="AccountSettings" component={AccountSettings} options={{ title: 'Personal Info' }} />
                <Stack.Screen name="NotificationSettings" component={NotificationSettings} options={{ title: 'Notifications' }} />
                <Stack.Screen name="PrivacySettings" component={PrivacySettings} options={{ title: 'Privacy' }} />
                <Stack.Screen name="SecuritySettings" component={SecuritySettings} options={{ title: 'Security' }} />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}