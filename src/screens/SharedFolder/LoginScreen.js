/**
 * LoginScreen.js — FIXED VERSION
 *
 * Issues resolved:
 *  #7  Firebase placeholder key → warns user clearly if auth fails due to misconfiguration
 *  #8  API base URL → reads from EXPO_PUBLIC_API_BASE env var (falls back gracefully)
 *  #9  Maps / dev-build → no change needed here, but banner shown when in Expo Go
 *  #10 Push notifications → no-op guard + banner when running in Expo Go
 *  #11 Google Sign-In → fully implemented with expo-auth-session + Google OAuth
 */

import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import Constants from "expo-constants";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import {
  MaterialCommunityIcons,
  FontAwesome,
  AntDesign,
  Ionicons,
} from "@expo/vector-icons";

// Firebase
import { auth } from "../../context/firebaseConfig";
import {
  GoogleAuthProvider,
  signInWithCredential,
  FacebookAuthProvider,
} from "firebase/auth";

import { AuthContext } from "../../context/AuthContext";

// ─── FIX #8: API base URL from env var ───────────────────────────────────────
// Set EXPO_PUBLIC_API_BASE in your Frontend/.env file:
//   EXPO_PUBLIC_API_BASE=http://10.0.2.2:5000      ← Android emulator / USB
//   EXPO_PUBLIC_API_BASE=http://192.168.x.x:5000   ← Wi-Fi / physical device
const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE ||
  (Platform.OS === "android" ? "http://10.0.2.2:5000" : "http://127.0.0.1:5000");

// Configure axios base URL once
axios.defaults.baseURL = API_BASE;

// ─── FIX #11: Google OAuth — complete WebBrowser session ─────────────────────
WebBrowser.maybeCompleteAuthSession();

// ─── FIX #10: Detect Expo Go (push + maps won't work there) ──────────────────
const isExpoGo =
  Constants.appOwnership === "expo" || Constants.executionEnvironment === "storeClient";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [isOfficialEmail, setIsOfficialEmail] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null); // 'google' | 'facebook' | null

  const { signIn } = useContext(AuthContext);

  // ─── FIX #11: Google Auth Request ─────────────────────────────────────────
  // Replace these clientId values with yours from Google Cloud Console:
  //   https://console.cloud.google.com → APIs & Services → Credentials
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    androidClientId: "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID.apps.googleusercontent.com",
    webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
    scopes: ["profile", "email"],
  });

  // ─── FIX #11: Handle Google response ──────────────────────────────────────
  useEffect(() => {
    if (googleResponse?.type === "success") {
      const { id_token } = googleResponse.params;
      handleFirebaseSocialSignIn(GoogleAuthProvider.credential(id_token), "google");
    } else if (googleResponse?.type === "error") {
      setSocialLoading(null);
      Alert.alert("Google Sign-In Failed", googleResponse.error?.message || "Unknown error.");
    }
  }, [googleResponse]);

  // ─── FIX #7: Check Firebase config on mount ────────────────────────────────
  useEffect(() => {
    // auth.app.options.apiKey will be "YOUR_API_KEY" if placeholder wasn't replaced
    const apiKey = auth?.app?.options?.apiKey;
    if (!apiKey || apiKey === "YOUR_API_KEY") {
      console.warn(
        "[LoginScreen] ⚠️  Firebase apiKey is still a placeholder!\n" +
          "Go to Firebase Console → Project safe-nepal-45d7a → Project Settings → Your Apps\n" +
          "and copy the real apiKey into Frontend/src/context/firebaseConfig.js"
      );
    }
  }, []);

  // ─── Email helpers ─────────────────────────────────────────────────────────
  const handleEmailChange = (text) => {
    setEmail(text);
    const lower = text.toLowerCase();
    setIsOfficialEmail(
      lower.endsWith(".gov.np") ||
        lower.includes("police") ||
        lower.includes("responder")
    );
  };

  // ─── Standard email / password login ──────────────────────────────────────
  const handleLogin = async () => {
    if (!email.trim() || !password) {
      return Alert.alert("Error", "Please fill all fields.");
    }

    setLoading(true);
    try {
      const res = await axios.post("/api/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.data.access_token) {
        await signIn(res.data.user, res.data.access_token);
      }
    } catch (e) {
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        (e?.code === "ECONNABORTED" ? "Request timed out." : null) ||
        e?.message ||
        "Check your credentials or network.";

      // ─── FIX #8: Better network error message ────────────────────────────
      const isNetworkError =
        e?.message === "Network Error" || e?.code === "ERR_NETWORK";
      if (isNetworkError) {
        return Alert.alert(
          "Cannot Reach Server",
          `Make sure your backend is running and set EXPO_PUBLIC_API_BASE correctly.\n\nCurrent base: ${API_BASE}`
        );
      }

      if (
        status === 403 ||
        msg.toLowerCase().includes("verif") ||
        msg.toLowerCase().includes("confirm")
      ) {
        Alert.alert(
          "Email Not Verified",
          "Please verify your email first.\n\nResend verification email?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Resend", onPress: handleResendVerification },
          ]
        );
      } else {
        Alert.alert("Login Failed", msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ─── FIX #11: Firebase social sign-in (shared by Google & Facebook) ────────
  const handleFirebaseSocialSignIn = async (credential, provider) => {
    // ─── FIX #7: Guard against placeholder API key ──────────────────────────
    const apiKey = auth?.app?.options?.apiKey;
    if (!apiKey || apiKey === "YOUR_API_KEY") {
      setSocialLoading(null);
      return Alert.alert(
        "Firebase Not Configured",
        "The Firebase API key is still a placeholder.\n\nGo to Firebase Console → Project safe-nepal-45d7a → Project Settings → Your Apps and copy the real apiKey into firebaseConfig.js"
      );
    }

    setSocialLoading(provider);
    try {
      const userCredential = await signInWithCredential(auth, credential);
      const firebaseUser = userCredential.user;
      const idToken = await firebaseUser.getIdToken();

      // Exchange Firebase token for your backend JWT
      const res = await axios.post("/api/auth/social-login", {
        provider,
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        idToken,
      });

      if (res.data.access_token) {
        await signIn(res.data.user, res.data.access_token);
      }
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        `${provider} sign-in failed.`;
      Alert.alert("Sign-In Failed", msg);
    } finally {
      setSocialLoading(null);
    }
  };

  // ─── Resend verification ────────────────────────────────────────────────────
  const handleResendVerification = async () => {
    if (!email.trim()) return Alert.alert("Error", "Enter your email first.");

    setResendLoading(true);
    try {
      await axios.post("/api/auth/resend-verification", {
        email: email.trim().toLowerCase(),
      });
      setVerificationSent(true);
      Alert.alert(
        "Email Sent",
        `Verification link sent to ${email.trim().toLowerCase()}.`
      );
    } catch (e) {
      Alert.alert(
        "Failed",
        e?.response?.data?.message || "Could not resend. Try again."
      );
    } finally {
      setResendLoading(false);
    }
  };

  // ─── Forgot password ────────────────────────────────────────────────────────
  const handleForgotPassword = async () => {
    if (!email.trim())
      return Alert.alert("Email Required", "Enter your email above first.");

    Alert.alert(
      "Reset Password",
      `Send reset link to ${email.trim().toLowerCase()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: async () => {
            try {
              await axios.post("/api/auth/forgot-password", {
                email: email.trim().toLowerCase(),
              });
              Alert.alert("Check Your Email", "Password reset link has been sent.");
            } catch (e) {
              Alert.alert(
                "Error",
                e?.response?.data?.message || "Could not send reset email."
              );
            }
          },
        },
      ]
    );
  };

  // ─── Google sign-in button handler ─────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    if (isExpoGo) {
      return Alert.alert(
        "Dev Build Required",
        "Google Sign-In requires a development build.\nRun: eas build --profile development"
      );
    }
    setSocialLoading("google");
    await googlePromptAsync();
    // Response is handled in the useEffect above
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <LinearGradient
      colors={["#0a0f1e", "#0f1e36", "#0a1628"]}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ─── FIX #10: Expo Go warning banner ─────────────────────────────── */}
        {isExpoGo && (
          <View style={styles.devBanner}>
            <Ionicons name="warning-outline" size={14} color="#f59e0b" />
            <Text style={styles.devBannerText}>
              Running in Expo Go — push notifications, maps & social login
              require a{" "}
              <Text style={styles.devBannerBold}>development build</Text>.
            </Text>
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={
                isOfficialEmail
                  ? ["#7f0000", "#e11d48"]
                  : ["#1a2f6e", "#2D50E6"]
              }
              style={styles.iconCircle}
            >
              <FontAwesome
                name={isOfficialEmail ? "shield" : "bell"}
                size={28}
                color="#FFF"
              />
            </LinearGradient>
          </View>

          <Text style={styles.headerTitle}>
            {isOfficialEmail ? "Responder Terminal" : "Stay Safe, Stay Informed."}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isOfficialEmail
              ? "Authorized Responders Only"
              : "Log in to get real-time alerts."}
          </Text>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <View style={[styles.tab, styles.activeTab]}>
              <Text style={styles.activeTabText}>Log In</Text>
            </View>
            <TouchableOpacity
              style={styles.tab}
              onPress={() => navigation.navigate("Signup")}
            >
              <Text style={styles.tabText}>Sign Up</Text>
            </TouchableOpacity>
          </View>

          {/* Email */}
          <Text style={styles.inputLabel}>Email Address</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor="#556"
              value={email}
              onChangeText={handleEmailChange}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
          </View>

          {/* Password */}
          <Text style={styles.inputLabel}>Password</Text>
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor="#556"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
              autoComplete="password"
            />
            <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
              <MaterialCommunityIcons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#556"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotBtn} onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Login button */}
          <TouchableOpacity
            style={[
              styles.loginBtn,
              isOfficialEmail && { backgroundColor: "#e11d48" },
              loading && styles.disabledBtn,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.loginBtnText}>
                {isOfficialEmail ? "Secure Login" : "Log In"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Resend verification */}
          <TouchableOpacity
            style={styles.resendBtn}
            onPress={handleResendVerification}
            disabled={resendLoading || verificationSent}
          >
            {resendLoading ? (
              <ActivityIndicator color="#FFD700" size="small" />
            ) : (
              <View style={styles.resendRow}>
                <Ionicons
                  name="mail-outline"
                  size={14}
                  color={verificationSent ? "#22c55e" : "#FFD700"}
                />
                <Text
                  style={[
                    styles.resendText,
                    verificationSent && { color: "#22c55e" },
                  ]}
                >
                  {verificationSent
                    ? "Verification email sent ✓"
                    : "Resend verification email"}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {/* ─── FIX #11: Social login buttons ─────────────────────────────── */}
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialRow}>
            {/* Google */}
            <TouchableOpacity
              style={styles.socialBtn}
              onPress={handleGoogleSignIn}
              disabled={socialLoading !== null || !googleRequest}
            >
              {socialLoading === "google" ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <AntDesign name="google" size={18} color="#FFF" />
                  <Text style={styles.socialBtnText}>Google</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Facebook — shows a coming-soon alert; wire up similarly to Google */}
            <TouchableOpacity
              style={[styles.socialBtn, { backgroundColor: "#1877F2" }]}
              onPress={() =>
                Alert.alert(
                  "Facebook Sign-In",
                  "Configure Facebook OAuth in Google Cloud Console and wire up expo-auth-session/providers/facebook to enable this."
                )
              }
              disabled={socialLoading !== null}
            >
              {socialLoading === "facebook" ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <FontAwesome name="facebook" size={18} color="#FFF" />
                  <Text style={styles.socialBtnText}>Facebook</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={styles.footer}
          onPress={() => navigation.navigate("Signup")}
        >
          <Text style={styles.footerText}>
            Don't have an account?{" "}
            <Text style={styles.signUpLink}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20, paddingTop: 50 },

  // ─── Expo Go warning banner ─────────────────────────────────────────────────
  devBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245,158,11,0.12)",
    borderWidth: 1,
    borderColor: "rgba(245,158,11,0.3)",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  devBannerText: { color: "#f59e0b", fontSize: 12, flex: 1, lineHeight: 17 },
  devBannerBold: { fontWeight: "bold" },

  card: {
    backgroundColor: "rgba(15, 22, 40, 0.97)",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  iconContainer: { alignItems: "center", marginBottom: 16 },
  iconCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerSubtitle: {
    color: "#778",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#090f1d",
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 9 },
  activeTab: { backgroundColor: "#1a2440" },
  tabText: { color: "#556", fontSize: 14, fontWeight: "600" },
  activeTabText: { color: "#FFF", fontSize: 14, fontWeight: "bold" },
  inputLabel: { color: "#ccd", fontSize: 13, marginBottom: 6, fontWeight: "600" },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0d1525",
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#1a2440",
  },
  input: { color: "#EEE", flex: 1, fontSize: 14 },
  forgotBtn: { alignSelf: "flex-end", marginBottom: 20 },
  forgotText: { color: "#2D50E6", fontSize: 13, fontWeight: "600" },
  loginBtn: {
    height: 54,
    backgroundColor: "#2D50E6",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 4,
  },
  disabledBtn: { opacity: 0.6 },
  loginBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
  resendBtn: { marginTop: 16, alignItems: "center" },
  resendRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  resendText: { color: "#FFD700", fontSize: 13, fontWeight: "500" },

  // ─── Social login ───────────────────────────────────────────────────────────
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 16,
    gap: 10,
  },
  line: { flex: 1, height: 1, backgroundColor: "#1a2440" },
  dividerText: { color: "#556", fontSize: 12 },
  socialRow: { flexDirection: "row", gap: 12 },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#DB4437",
    borderRadius: 10,
    paddingVertical: 12,
  },
  socialBtnText: { color: "#FFF", fontWeight: "600", fontSize: 14 },

  footer: { marginTop: 24, marginBottom: 20, alignItems: "center" },
  footerText: { color: "#556", fontSize: 14 },
  signUpLink: { color: "#2D50E6", fontWeight: "bold" },
});