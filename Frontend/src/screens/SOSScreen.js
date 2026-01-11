import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import axios from "axios";
import NetInfo from "@react-native-community/netinfo";
import * as Linking from "expo-linking";

import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { themes } from "../theme/colors";

const API_BASE = "http://10.23.0.48:5000"; // your backend

export default function SOSScreen({ navigation }) {
  const { isVerifiedUser, isUser, token } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const colors = themes[theme];

  const [type, setType] = useState("Landslide");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [locationText, setLocationText] = useState("Fetching location...");
  const [isOnline, setIsOnline] = useState(true);
  const [emergencyActive, setEmergencyActive] = useState(false);

  const locationRef = useRef(null);
  const holdTimer = useRef(null);

  /* ================= OFFLINE DETECTION ================= */
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  /* ================= LOCATION ================= */
  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Location permission is required");
      return null;
    }

    const loc = await Location.getCurrentPositionAsync({});
    locationRef.current = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
    };

    setLocationText(
      `${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`
    );
  };

  /* ================= SOS SEND ================= */
  const sendSOS = async () => {
    if (!isUser) {
      Alert.alert("Not allowed", "Only users can send SOS");
      return;
    }

    if (!isVerifiedUser) {
      Alert.alert(
        "Email not verified",
        "Please verify your email before sending SOS"
      );
      return;
    }

    setEmergencyActive(true);

    await getLocation();
    if (!locationRef.current) return;

    setSending(true);

    // OFFLINE CASE
    if (!isOnline) {
      Alert.alert(
        "Offline SOS",
        "No internet connection. Please call or send SMS immediately."
      );
      setSending(false);
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/api/sos/send`,
        {
          message: `[${type}] ${message || "Emergency situation"}`,
          latitude: locationRef.current.latitude,
          longitude: locationRef.current.longitude,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert("SOS Sent", "Help is on the way 🚨");
      setMessage("");
    } catch (err) {
      Alert.alert("Failed", "Could not send SOS. Use call or SMS.");
    } finally {
      setSending(false);
    }
  };

  /* ================= PRESS & HOLD ================= */
  const onPressIn = () => {
    holdTimer.current = setTimeout(sendSOS, 3000);
  };

  const onPressOut = () => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
  };

  /* ================= CALL & SMS ================= */
  const callEmergency = () => {
    Linking.openURL("tel:100"); // Nepal Police
  };

  const sendEmergencySMS = () => {
    Linking.openURL(
      "sms:98XXXXXXXX?body=Emergency! I need help. Please respond immediately."
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          EMERGENCY ALERT
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* OFFLINE BANNER */}
      {!isOnline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>
            ⚠️ Offline Mode: Limited functionality
          </Text>
        </View>
      )}

      {/* EMERGENCY MESSAGE */}
      {emergencyActive && (
        <View style={styles.emergencyBanner}>
          <Text style={styles.emergencyBannerText}>
            🚨 Emergency Active. Use call or SMS if needed.
          </Text>
        </View>
      )}

      <Text style={[styles.subText, { color: colors.subText }]}>
        Press and hold the button for 3 seconds to send an emergency alert.
      </Text>

      {/* SOS BUTTON */}
      <View style={styles.circleOuter}>
        <View style={styles.circleMiddle}>
          <TouchableOpacity
            style={styles.sosButton}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            disabled={sending}
          >
            {sending ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <Text style={styles.sosText}>SOS</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickBtn} onPress={callEmergency}>
          <Text style={styles.quickText}>📞 Call Emergency</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickBtn} onPress={sendEmergencySMS}>
          <Text style={styles.quickText}>📩 Send SMS</Text>
        </TouchableOpacity>
      </View>

      {/* EMERGENCY TYPE */}
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        Emergency Type
      </Text>

      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeBtn, type === "Landslide" && styles.activeType]}
          onPress={() => setType("Landslide")}
        >
          <Ionicons name="warning" size={16} color="#fff" />
          <Text style={styles.typeText}> Landslide</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeBtn, type === "Flood" && styles.activeType]}
          onPress={() => setType("Flood")}
        >
          <MaterialIcons name="flood" size={16} color="#fff" />
          <Text style={styles.typeText}> Flood</Text>
        </TouchableOpacity>
      </View>

      {/* LOCATION */}
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        Your Location
      </Text>

      <TouchableOpacity style={styles.locationBox} onPress={getLocation}>
        <Ionicons name="location" size={16} color={colors.primary} />
        <Text style={[styles.locationText, { color: colors.text }]}>
          {locationText}
        </Text>
        <Ionicons name="refresh" size={16} color="#aaa" />
      </TouchableOpacity>

      {/* MESSAGE */}
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder="Add short message (e.g., people trapped)"
        placeholderTextColor={colors.subText}
        value={message}
        onChangeText={setMessage}
      />
    </View>
  );
}

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  headerTitle: { fontSize: 16, fontWeight: "700" },

  subText: {
    textAlign: "center",
    fontSize: 13,
    marginBottom: 20,
  },

  offlineBanner: {
    backgroundColor: "#5a1b1b",
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },

  offlineText: {
    color: "#ffb4b4",
    textAlign: "center",
    fontWeight: "600",
    fontSize: 12,
  },

  emergencyBanner: {
    backgroundColor: "#ff3b30",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },

  emergencyBannerText: {
    color: "#fff",
    fontWeight: "700",
    textAlign: "center",
  },

  circleOuter: {
    alignSelf: "center",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,0,0,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },

  circleMiddle: {
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: "rgba(255,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },

  sosButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ff1e1e",
    justifyContent: "center",
    alignItems: "center",
  },

  sosText: { color: "#fff", fontSize: 32, fontWeight: "800" },

  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 16,
  },

  quickBtn: {
    backgroundColor: "#1e90ff",
    paddingVertical: 10,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
  },

  quickText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontWeight: "600",
  },

  typeRow: { flexDirection: "row", justifyContent: "space-between" },

  typeBtn: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    paddingVertical: 12,
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#1b263b",
  },

  activeType: { backgroundColor: "#2c3e50" },

  typeText: { color: "#fff", fontWeight: "600" },

  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b263b",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },

  locationText: { flex: 1, marginLeft: 6 },

  input: {
    backgroundColor: "#1b263b",
    borderRadius: 12,
    padding: 14,
    color: "#fff",
  },
});
