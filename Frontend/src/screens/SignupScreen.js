import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome, AntDesign } from "@expo/vector-icons";

// FIXED: Using ngrok HTTPS tunnel for secure connection
const API_BASE = "https://thunderingly-cuspidate-maud.ngrok-free.dev";

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      await axios.post(`${API_BASE}/api/auth/register`, {
        full_name: fullName,
        email: email.trim().toLowerCase(),
        password,
      });

      Alert.alert("Success", "Account created successfully!", [
        { text: "Log In Now", onPress: () => navigation.navigate("Login") }
      ]);
    } catch (err) {
      Alert.alert("Signup Failed", err?.response?.data?.message || "Cannot connect to server.");
    }
  };

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.notificationIconContainer}>
          <Text style={styles.icon}>🔔</Text>
        </View>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Safe Nepal for real-time disaster updates.</Text>

        <View style={styles.tabContainer}>
          <View style={styles.tabRow}>
            <TouchableOpacity style={styles.inactiveTab} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.inactiveTabText}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.activeTab}>
              <Text style={styles.activeTabText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          placeholderTextColor="#555"
          value={fullName}
          onChangeText={setFullName}
        />

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="email@example.com"
          placeholderTextColor="#555"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Min 6 characters"
            placeholderTextColor="#555"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.signupButton} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  card: { marginHorizontal: 20, padding: 24, borderRadius: 20, backgroundColor: "#111827" },
  notificationIconContainer: { alignSelf: 'center', backgroundColor: '#1e293b', padding: 15, borderRadius: 50, marginBottom: 15 },
  icon: { fontSize: 30 },
  title: { fontSize: 24, fontWeight: "bold", color: "#ffffff", textAlign: "center" },
  subtitle: { textAlign: "center", color: "#9ca3af", marginTop: 10, marginBottom: 25, fontSize: 13 },
  tabContainer: { backgroundColor: '#1f2937', borderRadius: 12, padding: 4, marginBottom: 25 },
  tabRow: { flexDirection: "row" },
  activeTab: { flex: 1, paddingVertical: 10, backgroundColor: '#111827', borderRadius: 8, alignItems: 'center' },
  inactiveTab: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  activeTabText: { color: "#ffffff", fontWeight: "600" },
  inactiveTabText: { color: "#9ca3af" },
  label: { color: '#ffffff', marginBottom: 8, fontSize: 14 },
  input: { height: 50, backgroundColor: "#1f2937", borderRadius: 10, paddingHorizontal: 15, color: "#ffffff", marginBottom: 15 },
  passwordContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#1f2937", borderRadius: 10, paddingHorizontal: 15, marginBottom: 25 },
  passwordInput: { flex: 1, height: 50, color: "#ffffff" },
  signupButton: { backgroundColor: "#1d4ed8", borderRadius: 10, paddingVertical: 15, alignItems: "center" },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});