import React, { useContext, useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import { API_BASE } from "../../config";

// Ensure this matches your backend IP

export default function EmailVerificationScreen() {
  const { user, token, signOut, updateUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // 1. Polling Effect: Checks backend every 3 seconds to see if verified
  useEffect(() => {
    let interval;
    
    if (token) {
      interval = setInterval(async () => {
        try {
          const response = await axios.get(`${API_BASE}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // If backend says verified, update global state
          if (response.data.user.email_verified) {
            clearInterval(interval);
            updateUser(response.data.user); // This triggers navigation to Home
          }
        } catch (error) {
          console.log("Waiting for verification...");
        }
      }, 3000);
    }

    return () => clearInterval(interval); // Cleanup on unmount
  }, [token]);

  const resendEmail = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${API_BASE}/api/auth/resend-verification`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert("Success", "A new verification link has been sent to your inbox.");
    } catch (error) {
      Alert.alert("Error", "Could not resend email. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={styles.container}
    >
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <ActivityIndicator size="large" color="#1e90ff" />
        </View>

        <Text style={styles.title}>Verify Your Email</Text>

        <Text style={styles.text}>
          Hi <Text style={{ fontWeight: 'bold' }}>{user?.full_name || "User"}</Text>, 
          we've sent a link to <Text style={{ color: '#1e90ff' }}>{user?.email}</Text>.
        </Text>

        <Text style={styles.subText}>
          Please check your inbox (and spam folder) and click the link to activate your account.
        </Text>

        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={resendEmail}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Sending..." : "Resend Verification Email"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <Text style={styles.logout}>Logout & Try Different Email</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.footerText}>Waiting for verification...</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 24 },
  card: {
    backgroundColor: "#0d1b2a",
    borderRadius: 25,
    padding: 30,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 15,
  },
  text: { 
    color: "#e0e0e0", 
    textAlign: "center", 
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 10 
  },
  subText: {
    color: "#94a3b8",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 30,
  },
  button: {
    backgroundColor: "#1e90ff",
    paddingVertical: 16,
    borderRadius: 15,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  logoutBtn: {
    marginTop: 20,
  },
  logout: {
    textAlign: "center",
    color: "#ff5252",
    fontWeight: "600",
    fontSize: 14,
  },
  footerText: {
    color: "#94a3b8",
    textAlign: "center",
    marginTop: 20,
    fontSize: 12,
    fontStyle: 'italic'
  }
});