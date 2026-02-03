import React, { useState, useContext, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Platform, // Added Platform to handle iOS/Android message formatting
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking"; // Use Linking instead of SMS/Location
import NetInfo from "@react-native-community/netinfo";

import { AuthContext } from "../context/AuthContext";
import { ThemeContext } from "../context/ThemeContext";
import { themes } from "../theme/colors";
import { API_BASE } from "../config";

export default function SOSScreen({ navigation }) {
  const { isVerifiedUser, isUser, token } = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);
  const theme = themeContext ? themeContext.theme : 'dark'; 
  const colors = themes[theme] || themes['dark'];

  const [type, setType] = useState("Landslide");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  const holdTimer = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse Animation for the SOS button
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();

    const unsubscribe = NetInfo.addEventListener((state) => setIsOnline(state.isConnected));
    return () => { pulse.stop(); unsubscribe(); };
  }, []);

  // NEW: Simplified SOS Action using Linking
  const sendSOS = async () => {
    if (!isUser || !isVerifiedUser) {
      Alert.alert("Access Denied", "Please ensure you are logged in and verified.");
      return;
    }

    setSending(true);
    
    // Fallback message for SMS
    const sosMessage = `EMERGENCY SOS: ${type}. ${message || "Please send help to my location!"}`;
    const smsNumber = "100"; // Default Nepal Police

    // Try to open the native SMS app (Cross-platform compatible)
    const separator = Platform.OS === 'ios' ? '&' : '?';
    const url = `sms:${smsNumber}${separator}body=${encodeURIComponent(sosMessage)}`;

    try {
      await Linking.openURL(url);
      Alert.alert("SOS Triggered", "Your message is ready. Tap send in your messaging app.");
    } catch (err) {
      Alert.alert("Error", "Unable to open messages. Please call 100 directly.");
    } finally {
      setSending(false);
    }
  };

  const onPressIn = () => { holdTimer.current = setTimeout(sendSOS, 3000); };
  const onPressOut = () => { if (holdTimer.current) clearTimeout(holdTimer.current); };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>EMERGENCY ALERT</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={[styles.subText, { color: colors.subText }]}>
        Hold the button for 3 seconds to trigger an emergency alert.
      </Text>

      <View style={styles.circleOuter}>
        <View style={styles.circleMiddle}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={styles.sosButton}
              onPressIn={onPressIn}
              onPressOut={onPressOut}
              disabled={sending}
            >
              {sending ? <ActivityIndicator color="#fff" size="large" /> : <Text style={styles.sosText}>SOS</Text>}
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickBtn} onPress={() => Linking.openURL("tel:100")}>
          <Text style={styles.quickText}>📞 Call Police</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.quickBtn} onPress={() => Linking.openURL("tel:102")}>
          <Text style={styles.quickText}>🚑 Ambulance</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.primary }]}>Type of Emergency</Text>
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

      <TextInput
        style={[styles.input, { color: colors.text, marginTop: 20 }]}
        placeholder="Add details (e.g., 'House flooded')"
        placeholderTextColor={colors.subText}
        value={message}
        onChangeText={setMessage}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  subText: { textAlign: "center", fontSize: 13, marginBottom: 20 },
  circleOuter: { alignSelf: "center", width: 220, height: 220, borderRadius: 110, backgroundColor: "rgba(255,0,0,0.1)", justifyContent: "center", alignItems: "center" },
  circleMiddle: { width: 170, height: 170, borderRadius: 85, backgroundColor: "rgba(255,0,0,0.2)", justifyContent: "center", alignItems: "center" },
  sosButton: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#ff1e1e", justifyContent: "center", alignItems: "center", elevation: 10 },
  sosText: { color: "#fff", fontSize: 32, fontWeight: "800" },
  quickActions: { flexDirection: "row", justifyContent: "space-between", marginVertical: 16 },
  quickBtn: { backgroundColor: "#1e90ff", paddingVertical: 12, borderRadius: 10, width: "48%", alignItems: "center" },
  quickText: { color: "#fff", fontWeight: "700" },
  sectionTitle: { marginTop: 20, marginBottom: 8, fontWeight: "600" },
  typeRow: { flexDirection: "row", justifyContent: "space-between" },
  typeBtn: { flexDirection: "row", alignItems: "center", width: "48%", paddingVertical: 12, justifyContent: "center", borderRadius: 12, backgroundColor: "#1b263b" },
  activeType: { backgroundColor: "#ff1e1e", borderWidth: 1, borderColor: "#fff" },
  typeText: { color: "#fff", fontWeight: "600" },
  input: { backgroundColor: "#1b263b", borderRadius: 12, padding: 14, color: "#fff" },
});