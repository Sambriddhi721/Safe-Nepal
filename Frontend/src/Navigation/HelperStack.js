import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HelperDashboardScreen from "../screens/HelperDashboardScreen";
import SOSListScreen from "../screens/SOSListScreen";
import RealTimeMapScreen from "../screens/RealTimeMapScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function HelperStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="HelperDashboard"
        component={HelperDashboardScreen}
      />
      <Stack.Screen name="SOSList" component={SOSListScreen} />
      <Stack.Screen name="Map" component={RealTimeMapScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
