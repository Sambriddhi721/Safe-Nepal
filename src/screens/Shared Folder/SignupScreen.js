import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView 
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import { API_BASE } from "../../config";

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSignup = async () => {
    if (!fullName || !email || !password) return Alert.alert("Error", "Please fill all fields");
    try {
      await axios.post(`${API_BASE}/api/auth/register`, {
        full_name: fullName,
        email: email.trim().toLowerCase(),
        password
      });
      Alert.alert("Success", "Account created! You can now log in.", [
        { text: "OK", onPress: () => navigation.navigate("Login") }
      ]);
    } catch (err) {
      Alert.alert("Signup Failed", err?.response?.data?.message || "Server error");
    }
  };

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        
        {/* Main Card */}
        <View style={styles.card}>
          
          {/* Bell Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <FontAwesome name="bell" size={30} color="#FFD700" />
            </View>
          </View>

          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>Join Safe Nepal for real-time disaster updates.</Text>

          {/* LogIn/SignUp Toggle Tab */}
          <View style={styles.tabContainer}>
            <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.tabText}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, styles.activeTab]}>
              <Text style={styles.activeTabText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Full Name Input */}
          <Text style={styles.inputLabel}>Full Name</Text>
          <View style={styles.inputBox}>
            <TextInput 
              style={styles.input} 
              placeholder="John Doe" 
              placeholderTextColor="#777" 
              value={fullName} 
              onChangeText={setFullName} 
            />
          </View>

          {/* Email Address Input */}
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputBox}>
            <TextInput 
              style={styles.input} 
              placeholder="email@example.com" 
              placeholderTextColor="#777" 
              autoCapitalize="none" 
              value={email} 
              onChangeText={setEmail} 
            />
          </View>

          {/* Password Input */}
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputBox}>
            <TextInput 
              style={styles.input} 
              placeholder="Min 6 characters" 
              placeholderTextColor="#777" 
              secureTextEntry={!showPassword} 
              value={password} 
              onChangeText={setPassword} 
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <MaterialCommunityIcons 
                name={showPassword ? "eye-off" : "eye"} 
                size={20} 
                color="#777" 
              />
            </TouchableOpacity>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.signUpBtn} onPress={handleSignup}>
            <Text style={styles.signUpBtnText}>Sign Up</Text>
          </TouchableOpacity>

        </View>

        {/* Footer */}
        <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.footerText}>Already have an account? <Text style={styles.loginLink}>Login</Text></Text>
        </TouchableOpacity>

      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: 'rgba(25, 35, 50, 0.95)',
    borderRadius: 25,
    padding: 25,
    width: '100%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  iconContainer: { alignItems: 'center', marginBottom: 15 },
  iconCircle: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#1e2a38', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: '#334'
  },
  headerTitle: { color: "#FFF", fontSize: 24, fontWeight: "bold", textAlign: 'center' },
  headerSubtitle: { color: "#aaa", fontSize: 13, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  tabContainer: {
    flexDirection: 'row', backgroundColor: '#161d29', 
    borderRadius: 12, padding: 5, marginBottom: 25 
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#253347' },
  activeTabText: { color: '#FFF', fontWeight: 'bold' },
  tabText: { color: '#777' },
  inputLabel: { color: '#FFF', fontSize: 14, marginBottom: 8, fontWeight: '600' },
  inputBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e2a38',
    borderRadius: 10, paddingHorizontal: 15, height: 50, marginBottom: 15,
    borderWidth: 1, borderColor: '#334'
  },
  input: { color: "#FFF", flex: 1, fontSize: 14 },
  signUpBtn: {
    backgroundColor: "#2D50E6", height: 55, borderRadius: 12,
    justifyContent: "center", alignItems: "center", marginTop: 10
  },
  signUpBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  footer: { marginTop: 25, alignItems: 'center' },
  footerText: { color: "#aaa", fontSize: 14 },
  loginLink: { color: '#2D50E6', fontWeight: 'bold' }
});