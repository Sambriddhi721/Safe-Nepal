import React, { useContext, useEffect } from 'react';
import {
  StatusBar,
  Platform,
  LogBox,
  ActivityIndicator,
  View,
  StyleSheet,
  UIManager
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- Context & Services ---
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import { NotificationService } from '../screens/SharedFolder/NotificationService';

// --- SHARED SCREENS ---
import WelcomeScreen from '../screens/SharedFolder/WelcomeScreen';
import LoginScreen from '../screens/SharedFolder/LoginScreen';
import SignupScreen from '../screens/SharedFolder/SignupScreen';
import EmailVerificationScreen from '../screens/SharedFolder/EmailVerificationScreen';
import ProfileScreen from '../screens/SharedFolder/ProfileScreen';
import MapScreen from '../screens/SharedFolder/Map';
import AboutScreen from '../screens/SharedFolder/AboutScreen';
import AccountScreen from '../screens/SharedFolder/AccountScreen';
import AccountSettings from '../screens/SharedFolder/AccountSettings';
import EditProfileScreen from '../screens/SharedFolder/EditProfileScreen';
import NotificationSettings from '../screens/SharedFolder/NotificationSettings';
import PrivacySettings from '../screens/SharedFolder/PrivacySettings';
import SecuritySettings from '../screens/SharedFolder/SecuritySettings';
import HelpScreen from '../screens/SharedFolder/HelpScreen';
import BillingScreen from '../screens/SharedFolder/BillingScreen';
import LinkedAccountsScreen from '../screens/SharedFolder/LinkedAccountsScreen';
import SettingsScreen from '../screens/SharedFolder/SettingsScreen';

// --- CITIZEN SCREENS ---
import HomeScreen from '../screens/CitizenFolder/HomeScreen';
import CitizenAlertScreen from '../screens/CitizenFolder/Alert';
import ReportDisasterScreen from '../screens/CitizenFolder/ReportDisasterScreen';
import IncidentReportScreen from '../screens/CitizenFolder/IncidentReportScreen';
import PastReportsScreen from '../screens/CitizenFolder/PastReportsScreen';
import SOSScreen from '../screens/CitizenFolder/SOSScreen';
import SOSListScreen from '../screens/CitizenFolder/SOSListScreen';
import ReliefCenterScreen from '../screens/CitizenFolder/ReliefCenterScreen';
import ReliefCenterDetails from '../screens/CitizenFolder/ReliefCenterDetails';
import EmergencyContactsScreen from '../screens/CitizenFolder/EmergencyContactsScreen';
import AddContactScreen from '../screens/CitizenFolder/AddContactScreen';
import SafetyTipsScreen from '../screens/CitizenFolder/SafetyTipsScreen';
import PredictionAnalyticsScreen from '../screens/CitizenFolder/PredictionAnalyticsScreen';
import SafeZonesScreen from '../screens/CitizenFolder/SafeZonesScreen';

// --- POLICE / RESPONDER SCREENS ---
import PoliceDashboardScreen from '../screens/PoliceFolder/ResponderDashboardScreen';
import PoliceAlertScreen from '../screens/PoliceFolder/AlertScreen';
import AlertDetailsScreen from '../screens/PoliceFolder/AlertDetailsScreen';
import RealTimeMapScreen from '../screens/PoliceFolder/RealTimeMapScreen';
import VolunteerScreen from '../screens/PoliceFolder/VolunteerScreen';
import PoliceSOSList from '../screens/PoliceFolder/SOSList';
import ResponderSettingsScreen from '../screens/PoliceFolder/ResponderSettingsScreen';

// ─── config ───────────────────────────────────────────────────────────────────

LogBox.ignoreLogs([
  'Non-serializable values',
  'expo-notifications',
  'setLayoutAnimationEnabledExperimental',
]);

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const Stack = createNativeStackNavigator();

const RESPONDER_ROLES = ['RESPONDER', 'POLICE', 'OFFICER'];

const AppNavigator = () => {
  const { user, token, loading } = useContext(AuthContext) || {};
  const { theme } = useContext(ThemeContext) || { theme: 'dark' };

  const isDarkMode = theme === 'dark';

  const isAuthenticated = !!(token && user);
  const currentRole     = (user?.role || 'CITIZEN').toUpperCase();
  const isResponder     = RESPONDER_ROLES.includes(currentRole);

  // TODO: REMOVE DEV BYPASS — change back to: user?.email_verified === true
  const isEmailVerified = true;

  useEffect(() => {
    (async () => {
      try {
        await NotificationService.init();
      } catch (e) {
        console.warn('[AppNavigator] Notification init failed:', e);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: isDarkMode ? '#020617' : '#fff' }]}>
        <ActivityIndicator size="large" color="#bef264" />
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
        key={isAuthenticated ? `${currentRole}-${isEmailVerified}` : 'guest'}
        screenOptions={{
          headerStyle: { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff' },
          headerTintColor: isDarkMode ? '#F1F5F9' : '#0f172a',
          headerTitleStyle: { fontWeight: '800', fontSize: 17 },
          headerShadowVisible: false,
          animation: Platform.OS === 'android' ? 'slide_from_right' : 'default',
          contentStyle: { backgroundColor: isDarkMode ? '#020617' : '#f5f5f5' },
        }}
      >

        {/* ── 1. NOT LOGGED IN → Auth stack ── */}
        {!isAuthenticated ? (
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Welcome"           component={WelcomeScreen} />
            <Stack.Screen name="Login"             component={LoginScreen} />
            <Stack.Screen name="Signup"            component={SignupScreen} />
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
          </Stack.Group>

        ) : !isEmailVerified ? (
          /* ── 2. LOGGED IN but email NOT verified ── */
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
          </Stack.Group>

        ) : (
          /* ── 3. LOGGED IN + VERIFIED → Role-based app ── */
          <>
            <Stack.Screen
              name="MainDashboard"
              component={isResponder ? PoliceDashboardScreen : HomeScreen}
              options={{ headerShown: false }}
            />

            {/* ── SHARED MODULE ── */}
            <Stack.Group>
              <Stack.Screen name="Settings"             component={SettingsScreen}      options={{ title: 'App Settings' }} />
              <Stack.Screen name="AccountMenu"          component={AccountScreen}        options={{ title: 'Menu' }} />
              <Stack.Screen name="Profile"              component={ProfileScreen}        options={{ title: 'My Profile' }} />
              <Stack.Screen name="AccountSettings"      component={AccountSettings}      options={{ title: 'Manage Account' }} />
              <Stack.Screen name="EditProfile"          component={EditProfileScreen}    options={{ presentation: 'modal', title: 'Update Profile' }} />
              <Stack.Screen name="NotificationSettings" component={NotificationSettings} options={{ title: 'Alerts' }} />
              <Stack.Screen name="PrivacySettings"      component={PrivacySettings}      options={{ title: 'Privacy' }} />
              <Stack.Screen name="SecuritySettings"     component={SecuritySettings}     options={{ title: 'Security' }} />
              <Stack.Screen name="Help"                 component={HelpScreen}           options={{ title: 'Help & Support' }} />
              <Stack.Screen name="About"                component={AboutScreen}          options={{ title: 'Safe Nepal' }} />
              <Stack.Screen name="GeneralMap"           component={MapScreen}            options={{ title: 'Safe Map' }} />
            </Stack.Group>

            {/* ── CITIZEN EXCLUSIVE MODULE ── */}
            {!isResponder && (
              <Stack.Group>
                <Stack.Screen name="Alerts"              component={CitizenAlertScreen}         options={{ title: 'Safety Alerts' }} />
                <Stack.Screen name="History"             component={PastReportsScreen}          options={{ title: 'My History' }} />
                <Stack.Screen name="NewReport"           component={ReportDisasterScreen}       options={{ title: 'Report Incident' }} />
                <Stack.Screen name="SOSScreen"           component={SOSScreen}                  options={{
                  title: 'EMERGENCY SOS',
                  headerStyle: { backgroundColor: '#ef4444' },
                  headerTintColor: '#fff',
                }} />
                <Stack.Screen name="Analytics"           component={PredictionAnalyticsScreen}  options={{ title: 'Forecasts' }} />
                <Stack.Screen name="SafetyTips"          component={SafetyTipsScreen}           options={{ title: 'Safety Procedures' }} />
                <Stack.Screen name="SafeZones"           component={SafeZonesScreen}            options={{ title: 'Evacuation Zones' }} />
                <Stack.Screen name="ReliefCenter"        component={ReliefCenterScreen}         options={{ title: 'Relief Help' }} />
                <Stack.Screen name="ReliefCenterDetails" component={ReliefCenterDetails}        options={{ title: 'Center Info' }} />
                <Stack.Screen name="EmergencyContacts"   component={EmergencyContactsScreen}    options={{ title: 'Contacts' }} />
                <Stack.Screen name="AddContact"          component={AddContactScreen}           options={{ title: 'Add Contact' }} />
                <Stack.Screen name="IncidentReport"      component={IncidentReportScreen}       options={{ title: 'Incident Detail' }} />
                <Stack.Screen name="SOSList"             component={SOSListScreen}              options={{ title: 'My SOS Status' }} />
              </Stack.Group>
            )}

            {/* ── POLICE / RESPONDER EXCLUSIVE MODULE ── */}
            {isResponder && (
              <Stack.Group>
                <Stack.Screen name="PoliceAlerts"   component={PoliceAlertScreen}       options={{ title: 'Responder Feed' }} />
                <Stack.Screen name="PoliceSOSList"  component={PoliceSOSList}           options={{ title: 'SOS Signals' }} />
                <Stack.Screen name="RealTimeMap"    component={RealTimeMapScreen}       options={{ title: 'Dispatch Map' }} />
                <Stack.Screen name="Volunteer"      component={VolunteerScreen}         options={{ title: 'Volunteers' }} />
                <Stack.Screen name="PoliceSettings" component={ResponderSettingsScreen} options={{ title: 'Responder Settings' }} />
                <Stack.Screen name="AlertDetails"   component={AlertDetailsScreen}      options={{ title: 'Alert Info' }} />
              </Stack.Group>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default AppNavigator;