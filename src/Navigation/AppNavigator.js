import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";

import AuthStack from "./AuthStack";
import UserStack from "./UserStack";
import HelperStack from "./HelperStack";

export default function AppNavigator() {
  const { loading } = useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      {/* FORCED VIEW: Rendering UserStack directly.
          Ensure NotificationSettings and AboutScreen are registered INSIDE UserStack.js
      */}
      <UserStack />
    </NavigationContainer>
  );
}