import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
//screens 
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import HomeScreen from './src/screens/HomeScreen';
import RealTimeMapScreen from './src/screens/RealTimeMapScreen';
import SOSScreen from './src/screens/SOSScreen';
import AlertScreen from './src/screens/AlertScreen';
import AlertDetailsScreen from './src/screens/AlertDetailsScreen'; 
import IncidentReportScreen from './src/screens/IncidentReportScreen';
import EmergencyContactsScreen from './src/screens/EmergencyContactsScreen';
import PredictionAnalyticsScreen from './src/screens/PredictionAnalyticsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import EmailVerificationScreen from './src/screens/EmailVerificationScreen';
import HelperDashboardScreen from './src/screens/HelperDashboardScreen';
import ReliefCenterScreen from './src/screens/ReliefCenterScreen'; 
import ReliefCenterDetails from './src/screens/ReliefCenterDetails'; 
import SafetyTipsScreen from './src/screens/SafetyTipsScreen'; 
import SettingsScreen from './src/screens/SettingsScreen'; 

const Stack = createNativeStackNavigator();

function Navigation() {
  const { isAuthenticated, isVerifiedUser, isHelper, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f2027' }}>
        <ActivityIndicator size="large" color="#1e90ff" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Group>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
        </Stack.Group>
      ) : !isVerifiedUser && !isHelper ? (
        <Stack.Screen name="EmailVerification" component={EmailVerificationScreen} />
      ) : (
        <Stack.Group>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="RealTimeMap" component={RealTimeMapScreen} />
          <Stack.Screen name="SOS" component={SOSScreen} />
          <Stack.Screen name="Alerts" component={AlertScreen} />
          <Stack.Screen name="AlertDetails" component={AlertDetailsScreen} />
          <Stack.Screen name="IncidentReport" component={IncidentReportScreen} />
          <Stack.Screen name="PredictionAnalytics" component={PredictionAnalyticsScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="EmergencyContacts" component={EmergencyContactsScreen} />
          <Stack.Screen name="ReliefCenters" component={ReliefCenterScreen} />
          <Stack.Screen name="ReliefCenterDetails" component={ReliefCenterDetails} />
          <Stack.Screen name="SafetyTips" component={SafetyTipsScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          {isHelper && <Stack.Screen name="HelperDashboard" component={HelperDashboardScreen} />}
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    </AuthProvider>
  );
}