import React, { useContext } from 'react';
import { 
  StatusBar, 
  ActivityIndicator, 
  View, 
  StyleSheet, 
  Platform, 
  UIManager 
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// --- Context Providers ---
import { AuthContext } from './src/context/AuthContext';
import { ThemeContext } from './src/context/ThemeContext';

// --- 📂 SHARED SCREENS ---
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
import MapScreen from './src/screens/Shared Folder/Map';

// --- 📂 CITIZEN SCREENS ---
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
import ReportDisasterScreen from './src/screens/Citizen Folder/ReportDisasterScreen';

// --- 📂 POLICE / RESPONDER SCREENS ---
import PoliceDashboardScreen from './src/screens/Police Folder/PoliceDashboardScreen';
import PoliceSettingsScreen from './src/screens/Police Folder/PoliceSettingsScreen'; // Added this
import RealTimeMapScreen from './src/screens/Police Folder/RealTimeMapScreen';
import AlertScreen from './src/screens/Police Folder/AlertScreen';
import AlertDetailsScreen from './src/screens/Police Folder/AlertDetailsScreen';
import VolunteerScreen from './src/screens/Police Folder/VolunteerScreen';
import PoliceSOSList from './src/screens/Police Folder/SOSList';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Stack = createStackNavigator();

export default function AppNavigator() {
  const { token, loading, role } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === 'dark';

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: isDarkMode ? '#020617' : '#f5f5f5' }]}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        
        <Stack.Navigator 
          key={role} 
          screenOptions={{ 
            headerShown: false,
            cardStyle: { backgroundColor: isDarkMode ? '#020617' : '#f5f5f5' }
          }}
        >
          {token == null ? (
            <Stack.Group>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Signup" component={SignupScreen} />
              <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
            </Stack.Group>
          ) : (
            <Stack.Group>
              {/* --- 🏠 DYNAMIC ROOT DASHBOARD --- */}
              <Stack.Screen 
                name="UserHome" 
                component={
                  (role?.toUpperCase() === 'RESPONDER' || role?.toUpperCase() === 'POLICE' || role?.toUpperCase() === 'HELPER') 
                  ? PoliceDashboardScreen 
                  : HomeScreen
                } 
              />

              {/* --- 🔵 CITIZEN FEATURES --- */}
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
              <Stack.Screen name="ReportDisaster" component={ReportDisasterScreen} />

              {/* --- 🟡 SHARED / SETTINGS --- */}
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
              <Stack.Screen name="GeneralMap" component={MapScreen} />

              {/* --- 🔴 POLICE / RESPONDER FEATURES --- */}
              <Stack.Screen name="PoliceDashboard" component={PoliceDashboardScreen} />
              <Stack.Screen name="PoliceSettings" component={PoliceSettingsScreen} />
              <Stack.Screen name="RealTimeMap" component={RealTimeMapScreen} />
              <Stack.Screen name="AlertScreen" component={AlertScreen} />
              <Stack.Screen name="AlertDetails" component={AlertDetailsScreen} />
              <Stack.Screen name="Volunteer" component={VolunteerScreen} />
              <Stack.Screen name="PoliceSOSList" component={PoliceSOSList} />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ 
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' } 
});