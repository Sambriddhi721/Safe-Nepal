import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import {
  MaterialCommunityIcons,
  FontAwesome,
  MaterialIcons,
  AntDesign,
  Ionicons,
} from "@expo/vector-icons";

// Basic age calculation helper
const calculateAge = (dob) => {
  if (!dob || dob.length < 10) return 0;
  const parts = dob.split("/");
  if (parts.length !== 3) return 0;
  
  // Format: DD/MM/YYYY -> YYYY-MM-DD
  const birth = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
  if (isNaN(birth.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (pw) =>
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,}$/.test(pw);

const Field = ({ label, value, onChange, placeholder, secure, showToggle, toggleState, onToggle, keyboardType = "default", maxLength }) => (
  <View style={styles.fieldContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputBox}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#556"
        value={value}
        onChangeText={onChange}
        secureTextEntry={!!secure && !toggleState}
        autoCapitalize="none"
        keyboardType={keyboardType}
        maxLength={maxLength}
      />
      {showToggle && (
        <TouchableOpacity onPress={onToggle} style={styles.toggleIcon}>
          <MaterialCommunityIcons name={toggleState ? "eye-off" : "eye"} size={20} color="#556" />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("citizen");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");

  const isResponder = role === "responder";

  const validate = () => {
    if (!fullName.trim()) return "Full name is required.";
    if (!validateEmail(email)) return "Enter a valid email address.";
    if (!validatePassword(password))
      return "Password must be 8+ chars with uppercase, lowercase, number and special character.";
    if (password !== confirmPassword) return "Passwords do not match.";
    if (isResponder) {
      if (!dateOfBirth) return "Date of birth is required.";
      const age = calculateAge(dateOfBirth);
      if (age < 18) return `Must be at least 18 years old. (Detected age: ${age})`;
    }
    return null;
  };

  const handleSignup = async () => {
    const err = validate();
    if (err) return Alert.alert("Validation Error", err);
    
    setLoading(true);
    try {
      const payload = {
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        ...(isResponder && { date_of_birth: dateOfBirth }),
      };

      // Ensure your baseURL is configured in your axios instance or use absolute URL
      await axios.post("/api/auth/register", payload);
      
      Alert.alert(
        "Account Created!",
        `Check ${email.trim().toLowerCase()} to verify your account before logging in.`,
        [{ text: "Go to Login", onPress: () => navigation.navigate("Login") }]
      );
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        (e?.code === "ECONNABORTED" ? "Request timed out." : null) ||
        e?.message ||
        "Server error. Check your network.";
      Alert.alert("Signup Failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#0a0f1e", "#0f1e36", "#0a1628"]} style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={isResponder ? ["#0f6e56", "#1D9E75"] : ["#1a2f6e", "#2D50E6"]}
              style={styles.iconCircle}
            >
              <FontAwesome name={isResponder ? "user-secret" : "bell"} size={28} color="#FFF" />
            </LinearGradient>
          </View>

          <Text style={styles.headerTitle}>Create Account</Text>
          <Text style={styles.headerSubtitle}>
            {isResponder
              ? "Responder Portal – Emergency Response Team"
              : "Join Safe Nepal for real-time disaster updates."}
          </Text>

          <Text style={styles.inputLabel}>Registering as:</Text>
          <View style={styles.roleToggleContainer}>
            <TouchableOpacity
              style={[styles.roleTab, role === "citizen" && styles.activeCitizenTab]}
              onPress={() => setRole("citizen")}
            >
              <MaterialIcons name="person" size={18} color={role === "citizen" ? "#FFF" : "#556"} />
              <Text style={[styles.roleTabText, role === "citizen" && styles.activeTabText]}>Citizen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleTab, role === "responder" && styles.activeResponderTab]}
              onPress={() => setRole("responder")}
            >
              <MaterialCommunityIcons name="shield-account" size={18} color={role === "responder" ? "#FFF" : "#556"} />
              <Text style={[styles.roleTabText, role === "responder" && styles.activeTabText]}>Responder</Text>
            </TouchableOpacity>
          </View>

          <Field label="Full Name" value={fullName} onChange={setFullName} placeholder="John Doe" />
          <Field label="Email Address" value={email} onChange={setEmail} placeholder="email@example.com" keyboardType="email-address" />
          <Field
            label="Password" value={password} onChange={setPassword}
            placeholder="Min 8 chars, A-Z, a-z, 0-9, @$!%"
            secure showToggle toggleState={showPassword} onToggle={() => setShowPassword(p => !p)}
          />
          <Field
            label="Confirm Password" value={confirmPassword} onChange={setConfirmPassword}
            placeholder="Re-enter password"
            secure showToggle toggleState={showConfirm} onToggle={() => setShowConfirm(p => !p)}
          />

          {isResponder && (
            <>
              <View style={styles.sectionDivider}>
                <View style={styles.dividerLine} />
                <Text style={styles.sectionLabel}>Responder Details</Text>
                <View style={styles.dividerLine} />
              </View>

              <Text style={styles.ageNote}>⚠️ Must be 18 years or older to register.</Text>

              <Field
                label="Date of Birth (DD/MM/YYYY)"
                value={dateOfBirth} onChange={setDateOfBirth}
                placeholder="25/08/1995" keyboardType="numeric" maxLength={10}
              />
              {dateOfBirth.length === 10 && (
                <Text style={[styles.ageDisplay, calculateAge(dateOfBirth) >= 18 ? styles.ageOk : styles.ageError]}>
                  {calculateAge(dateOfBirth) >= 18
                    ? `✅ Age: ${calculateAge(dateOfBirth)} – Eligible`
                    : `❌ Age: ${calculateAge(dateOfBirth)} – Underage`}
                </Text>
              )}
            </>
          )}

          <TouchableOpacity
            style={[styles.signUpBtn, { backgroundColor: isResponder ? "#1D9E75" : "#2D50E6" }, loading && styles.disabledBtn]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFF" />
              : <Text style={styles.signUpBtnText}>
                  Register as {isResponder ? "Responder" : "Citizen"}
                </Text>
            }
          </TouchableOpacity>

          {/* Social Sign-up Commented Out
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Or sign up with</Text>
            <View style={styles.line} />
          </View>
          <View style={styles.socialRow}>
             ... social buttons ...
          </View> 
          */}

          <View style={styles.verifyNote}>
            <Ionicons name="mail-outline" size={14} color="#FFD700" />
            <Text style={styles.verifyNoteText}>A verification email will be sent after registration.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.footer} onPress={() => navigation.navigate("Login")}>
          <Text style={styles.footerText}>
            Already have an account? <Text style={styles.loginLink}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20, paddingTop: 50 },
  card: {
    backgroundColor: "rgba(15, 22, 40, 0.97)", borderRadius: 24, padding: 24,
    width: "100%", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)",
    elevation: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 16,
  },
  iconContainer: { alignItems: "center", marginBottom: 16 },
  iconCircle: { width: 68, height: 68, borderRadius: 34, justifyContent: "center", alignItems: "center" },
  headerTitle: { color: "#FFF", fontSize: 22, fontWeight: "bold", textAlign: "center", letterSpacing: 0.5 },
  headerSubtitle: { color: "#778", fontSize: 13, textAlign: "center", marginTop: 6, marginBottom: 20, lineHeight: 18 },
  roleToggleContainer: {
    flexDirection: "row", backgroundColor: "#090f1d", borderRadius: 12,
    padding: 4, marginBottom: 20, borderWidth: 1, borderColor: "#1a2440",
  },
  roleTab: { flex: 1, flexDirection: "row", paddingVertical: 10, alignItems: "center", justifyContent: "center", borderRadius: 9 },
  activeCitizenTab: { backgroundColor: "#2D50E6" },
  activeResponderTab: { backgroundColor: "#1D9E75" },
  activeTabText: { color: "#FFF", fontWeight: "bold" },
  roleTabText: { color: "#556", fontSize: 14, marginLeft: 6 },
  fieldContainer: { marginBottom: 14 },
  inputLabel: { color: "#ccd", fontSize: 13, marginBottom: 6, fontWeight: "600" },
  inputBox: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#0d1525",
    borderRadius: 10, paddingHorizontal: 14, height: 50,
    borderWidth: 1, borderColor: "#1a2440",
  },
  input: { color: "#EEE", flex: 1, fontSize: 14 },
  toggleIcon: { paddingLeft: 10 },
  sectionDivider: { flexDirection: "row", alignItems: "center", marginVertical: 14 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#1a2440" },
  sectionLabel: { color: "#1D9E75", fontSize: 12, fontWeight: "bold", marginHorizontal: 8, textTransform: "uppercase" },
  ageNote: {
    color: "#FFD700", fontSize: 12, marginBottom: 12,
    backgroundColor: "rgba(255,215,0,0.07)", borderRadius: 8, padding: 10,
    borderLeftWidth: 3, borderLeftColor: "#FFD700",
  },
  ageDisplay: { fontSize: 13, fontWeight: "bold", marginBottom: 12, marginTop: 4 },
  ageOk: { color: "#22c55e" },
  ageError: { color: "#e11d48" },
  signUpBtn: { height: 54, borderRadius: 12, justifyContent: "center", alignItems: "center", marginTop: 10 },
  disabledBtn: { opacity: 0.6 },
  signUpBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  verifyNote: {
    flexDirection: "row", alignItems: "center", marginTop: 16,
    backgroundColor: "rgba(255,215,0,0.06)", borderRadius: 8, padding: 10,
  },
  verifyNoteText: { color: "#aab", fontSize: 12, flex: 1, marginLeft: 6 },
  footer: { marginTop: 22, alignItems: "center", marginBottom: 20 },
  footerText: { color: "#556", fontSize: 14 },
  loginLink: { color: "#2D50E6", fontWeight: "bold" },
});