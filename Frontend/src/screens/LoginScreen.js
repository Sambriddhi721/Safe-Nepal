import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { FontAwesome, AntDesign } from "@expo/vector-icons";

WebBrowser.maybeCompleteAuthSession();

// FIXED: Using ngrok HTTPS tunnel for secure connection
const API_BASE = "https://thunderingly-cuspidate-maud.ngrok-free.dev";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useContext(AuthContext);

  // FIXED: Added required configuration object to prevent 'clientSecret' undefined error
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
    webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken) => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/google`, { id_token: idToken });
      const { user, access_token } = res.data;
      await signIn(user, access_token);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (err) {
      Alert.alert("Google Login Failed", err?.response?.data?.message || "Server Unreachable");
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { 
        email: email.trim().toLowerCase(), 
        password 
      });
      const { user, access_token } = res.data;
      await signIn(user, access_token);
      navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (err) {
      Alert.alert("Login Failed", err?.response?.data?.message || "Network Error: Is backend running?");
    }
  };

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.notificationIconContainer}>
          <Text style={styles.icon}>🔔</Text>
        </View>
        
        <Text style={styles.title}>Stay Safe, Stay Informed.</Text>
        <Text style={styles.subtitle}>Log in to get real-time alerts.</Text>

        <View style={styles.tabContainer}>
          <View style={styles.tabRow}>
            <TouchableOpacity style={styles.activeTab}>
              <Text style={styles.activeTabText}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inactiveTab} onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.inactiveTabText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
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
            placeholder="Enter your password"
            placeholderTextColor="#555"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <FontAwesome name={showPassword ? "eye" : "eye-slash"} size={20} color="#666" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.line} />
          <Text style={styles.orText}>Or continue with</Text>
          <View style={styles.line} />
        </View>

        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            disabled={!request}
            onPress={() => promptAsync()}
          >
            <AntDesign name="google" size={20} color="#EA4335" />
            <Text style={styles.socialButtonText}>Google</Text>
          </TouchableOpacity>
        </View>
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
  subtitle: { textAlign: "center", color: "#9ca3af", marginTop: 10, marginBottom: 25 },
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
  loginButton: { backgroundColor: "#1d4ed8", borderRadius: 10, paddingVertical: 15, alignItems: "center", marginBottom: 20 },
  buttonText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#374151' },
  orText: { color: "#9ca3af", marginHorizontal: 10, fontSize: 12 },
  socialContainer: { flexDirection: "row", justifyContent: "center" },
  socialButton: { flexDirection: 'row', backgroundColor: "#1f2937", borderRadius: 10, paddingVertical: 12, paddingHorizontal: 30, alignItems: "center", borderWidth: 1, borderColor: '#374151' },
  socialButtonText: { color: '#ffffff', fontWeight: '600', marginLeft: 10 },
});