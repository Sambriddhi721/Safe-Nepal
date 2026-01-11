import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";

import AuthStack from "./AuthStack";
import UserStack from "./UserStack";
import HelperStack from "./HelperStack";

export default function AppNavigator() {
  const { loading, isAuthenticated, isUser, isHelper } =
    useContext(AuthContext);

  if (loading) return null;

  return (
    <NavigationContainer>
      {!isAuthenticated && <AuthStack />}
      {isAuthenticated && isUser && <UserStack />}
      {isAuthenticated && isHelper && <HelperStack />}
    </NavigationContainer>
  );
}
