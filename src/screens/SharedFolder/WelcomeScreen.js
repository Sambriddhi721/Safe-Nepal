import React from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function WelcomeScreen({ navigation }) {
  return (
    <LinearGradient 
      colors={["#0f2027", "#203a43", "#2c5364"]} 
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Large Notification Icon for Branding */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>🔔</Text>
        </View>

        <Text style={styles.title}>Safe Nepal</Text>
        
        <Text style={styles.tagline}>
          A Step Toward a Safer Nepal
        </Text>

        <Text style={styles.description}>
          AI powered disaster prediction and response app. Get real-time alerts and stay informed.
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginText}>Log In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.signupText}>Create Account</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.footerText}>Version 1.0.0</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "space-between", // Pushes buttons to bottom
    alignItems: "center",
    paddingVertical: 60,
  },
  content: {
    alignItems: "center",
    marginTop: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  iconEmoji: { fontSize: 50 },
  title: { 
    fontSize: 42, 
    fontWeight: "900", 
    color: "#ffffff",
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 18,
    color: "#3b82f6", // Matching the blue from your Login screen
    fontWeight: "600",
    marginTop: 5,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: "#9ca3af",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 40,
    lineHeight: 22,
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#1d4ed8",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  loginText: { 
    color: "#fff", 
    textAlign: "center", 
    fontSize: 18, 
    fontWeight: "bold" 
  },
  signupButton: {
    width: "100%",
    backgroundColor: "transparent",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#374151",
  },
  signupText: { 
    color: "#ffffff", 
    textAlign: "center", 
    fontSize: 18, 
    fontWeight: "600" 
  },
  footerText: {
    color: "#4b5563",
    fontSize: 12,
    marginTop: 20,
  }
});