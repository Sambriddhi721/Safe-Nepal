import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// 1. IMPORT ALL SCREENS
import HomeScreen from "../screens/HomeScreen";
import SOSScreen from "../screens/SOSScreen";
import AlertScreen from "../screens/AlertScreen";
import PredictionAnalyticsScreen from "../screens/PredictionAnalyticsScreen";
import ReliefCenterScreen from "../screens/ReliefCenterScreen";
import EmergencyContactsScreen from "../screens/EmergencyContactsScreen";
import SafetyTipsScreen from "../screens/SafetyTipsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import RealTimeMapScreen from "../screens/RealTimeMapScreen";

// IMPORT THE NEW SETTINGS SCREENS

import AboutScreen from "../screens/AboutScreen";

const Stack = createNativeStackNavigator();

export default function UserStack() {
  return (
    <Stack.Navigator 
      initialRouteName="Home"
      screenOptions={{ headerShown: false }}
    >
      {/* 2. REGISTER EVERY SCREEN HERE */}
      <Stack.Screen name="Home" component={HomeScreen} />
      
      {/* Existing Screens */}
      <Stack.Screen name="SOSScreen" component={SOSScreen} />
      <Stack.Screen name="AlertScreen" component={AlertScreen} />
      <Stack.Screen name="PredictionAnalyticsScreen" component={PredictionAnalyticsScreen} />
      <Stack.Screen name="ReliefCenterScreen" component={ReliefCenterScreen} />
      <Stack.Screen name="EmergencyContactsScreen" component={EmergencyContactsScreen} />
      <Stack.Screen name="SafetyTipsScreen" component={SafetyTipsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="RealTimeMapScreen" component={RealTimeMapScreen} />

      {/* FIXED: Removed the invalid comment tags that caused the syntax crash */}
      
      <Stack.Screen name="AboutScreen" component={AboutScreen} />
      
    </Stack.Navigator>
  );
}