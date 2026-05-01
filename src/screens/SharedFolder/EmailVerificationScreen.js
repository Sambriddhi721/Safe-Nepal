import React, { useContext, useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { API_BASE } from "../../config";

export default function EmailVerificationScreen() {
  const { user, token, signOut, updateUser } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0); // resend cooldown in seconds
  const [dots, setDots] = useState(".");         // animated "Waiting..." dots

  // ── refs so interval callbacks always see fresh values ───────────────────
  const tokenRef = useRef(token);
  const updateUserRef = useRef(updateUser);
  useEffect(() => { tokenRef.current = token; }, [token]);
  useEffect(() => { updateUserRef.current = updateUser; }, [updateUser]);

  // ── animated pulse on the email icon ─────────────────────────────────────
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  // ── dots animation ("Waiting." → ".." → "...") ──────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setDots(d => (d.length >= 3 ? "." : d + "."));
    }, 600);
    return () => clearInterval(id);
  }, []);

  // ── polling: check verification status every 3 seconds ──────────────────
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${tokenRef.current}` },
        });

        if (res.data?.user?.email_verified) {
          clearInterval(interval);
          updateUserRef.current(res.data.user); // triggers AppNavigator → Home
        }
      } catch (err) {
        // silently ignore — network blip or token expiry
        console.log("Polling check failed:", err?.response?.status);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []); // runs once on mount — refs keep values fresh

  // ── resend cooldown countdown ─────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const id = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown]);

  // ── resend email ──────────────────────────────────────────────────────────
  const resendEmail = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/auth/resend-verification`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCountdown(60); // lock button for 60 seconds
      Alert.alert(
        "✅ Email Sent",
        "A new verification link has been sent. Check your inbox and spam folder."
      );
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Could not resend email. Please try again.";
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  // ── logout confirmation ───────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive", onPress: signOut },
      ]
    );
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <LinearGradient
      colors={["#0a0f1e", "#0f1e36", "#0a1628"]}
      style={styles.container}
    >
      <View style={styles.card}>

        {/* ── Animated Icon ── */}
        <Animated.View
          style={[styles.iconCircle, { transform: [{ scale: pulseAnim }] }]}
        >
          <Ionicons name="mail-unread-outline" size={40} color="#1e90ff" />
        </Animated.View>

        <Text style={styles.title}>Verify Your Email</Text>

        <Text style={styles.text}>
          Hi{" "}
          <Text style={styles.bold}>{user?.full_name || "User"}</Text>, we've
          sent a verification link to{"\n"}
          <Text style={styles.emailHighlight}>
            {user?.email || "your email"}
          </Text>
        </Text>

        <Text style={styles.subText}>
          Click the link in the email to activate your account. Check your spam
          folder if you don't see it.
        </Text>

        {/* ── Polling Status ── */}
        <View style={styles.pollingRow}>
          <ActivityIndicator size="small" color="#1e90ff" />
          <Text style={styles.pollingText}>
            Checking verification status{dots}
          </Text>
        </View>

        {/* ── Resend Button ── */}
        <TouchableOpacity
          style={[
            styles.button,
            (loading || countdown > 0) && styles.buttonDisabled,
          ]}
          onPress={resendEmail}
          disabled={loading || countdown > 0}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>
              {countdown > 0
                ? `Resend available in ${countdown}s`
                : "Resend Verification Email"}
            </Text>
          )}
        </TouchableOpacity>

        {/* ── Logout ── */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={16} color="#ff5252" />
          <Text style={styles.logoutText}>Logout & Try Different Email</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerText}>
        This page will redirect automatically once verified.
      </Text>
    </LinearGradient>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  card: {
    backgroundColor: "rgba(15, 22, 40, 0.97)",
    borderRadius: 24,
    padding: 30,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    elevation: 12,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },

  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(30, 144, 255, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "rgba(30, 144, 255, 0.3)",
  },

  title: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 14,
    letterSpacing: 0.4,
  },

  text: {
    color: "#ccd",
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  bold: { fontWeight: "bold", color: "#FFF" },
  emailHighlight: { color: "#1e90ff", fontWeight: "600" },

  subText: {
    color: "#778",
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 22,
  },

  pollingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
    backgroundColor: "rgba(30,144,255,0.08)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(30,144,255,0.2)",
  },
  pollingText: {
    color: "#778",
    fontSize: 13,
    fontStyle: "italic",
  },

  button: {
    backgroundColor: "#1e90ff",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  buttonDisabled: {
    backgroundColor: "#1a2a44",
    borderWidth: 1,
    borderColor: "#1e3a5f",
  },
  buttonText: { color: "#FFF", fontWeight: "700", fontSize: 15 },

  logoutBtn: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  logoutText: {
    color: "#ff5252",
    fontWeight: "600",
    fontSize: 14,
  },

  footerText: {
    color: "#445",
    textAlign: "center",
    marginTop: 20,
    fontSize: 12,
    fontStyle: "italic",
  },
});