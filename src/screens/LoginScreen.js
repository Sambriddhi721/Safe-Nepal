import React, { useState, useContext } from "react";
import { 
  View, 
  Text, 
  StyleSheet, // Ensure this is imported to fix the ReferenceError
  TextInput, 
  TouchableOpacity, 
  Alert, 
  ScrollView, 
  ActivityIndicator 
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";
import { MaterialCommunityIcons, FontAwesome, AntDesign } from "@expo/vector-icons";
import { API_BASE } from "../config";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn } = useContext(AuthContext);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert("Error", "Please fill all fields");
    
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        email: email.trim().toLowerCase(),
        password
      });
      await signIn(res.data.user, res.data.access_token);
    } catch (err) {
      Alert.alert("Login Failed", err?.response?.data?.message || "Check your network connection");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        
        {/* Main Card Container */}
        <View style={styles.card}>
          
          {/* Bell Icon Header */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <FontAwesome name="bell" size={30} color="#FFD700" />
            </View>
          </View>

          <Text style={styles.headerTitle}>Stay Safe, Stay Informed.</Text>
          <Text style={styles.headerSubtitle}>Log in to get real-time alerts.</Text>

          {/* LogIn/SignUp Toggle Tab */}
          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tab, styles.activeTab]}>
              <Text style={styles.activeTabText}>Log In</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab} onPress={() => navigation.navigate("Signup")}>
              <Text style={styles.tabText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Inputs */}
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputBox}>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your email" 
              placeholderTextColor="#777" 
              value={email} 
              onChangeText={setEmail}
              autoCapitalize="none"
            />
          </View>

          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputBox}>
            <TextInput 
              style={styles.input} 
              placeholder="Enter your password" 
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

          {/* Login Button */}
          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.loginBtnText}>Log In</Text>}
          </TouchableOpacity>

          {/* Social Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.line} />
          </View>

          {/* Social Buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              <AntDesign name="google" size={20} color="#EA4335" />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Footer Link */}
        <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate("Signup")}>
          <Text style={styles.footerText}>Don't have an account? <Text style={styles.signUpLink}>Sign Up</Text></Text>
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
  headerTitle: { color: "#FFF", fontSize: 22, fontWeight: "bold", textAlign: 'center' },
  headerSubtitle: { color: "#aaa", fontSize: 14, textAlign: 'center', marginTop: 8, marginBottom: 20 },
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
  loginBtn: {
    backgroundColor: "#2D50E6", height: 55, borderRadius: 12,
    justifyContent: "center", alignItems: "center", marginTop: 10, marginBottom: 20
  },
  loginBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  line: { flex: 1, height: 1, backgroundColor: '#334' },
  dividerText: { color: '#777', marginHorizontal: 10, fontSize: 12 },
  socialRow: { alignItems: 'center' },
  socialBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#1e2a38', width: '100%', height: 50, borderRadius: 10,
    borderWidth: 1, borderColor: '#334'
  },
  socialBtnText: { color: '#FFF', marginLeft: 10, fontWeight: 'bold' },
  footer: { marginTop: 25, alignItems: 'center' },
  footerText: { color: "#aaa", fontSize: 14 },
  signUpLink: { color: '#2D50E6', fontWeight: 'bold' }
});