import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
  Vibration,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";

import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

const MenuRow = ({ icon, title, sub, onPress, isDark, iconColor = "#3b82f6" }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.rowLeft}>
      <View
        style={[
          styles.iconBox,
          { backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" },
        ]}
      >
        <Ionicons name={icon} size={20} color={isDark ? "#94a3b8" : iconColor} />
      </View>
      <View>
        <Text style={[styles.rowText, { color: isDark ? "#F1F5F9" : "#0f172a" }]}>{title}</Text>
        <Text style={styles.rowSubText}>{sub}</Text>
      </View>
    </View>
    <Ionicons name="chevron-forward" size={18} color="#475569" />
  </TouchableOpacity>
);

export default function SettingsScreen({ navigation }) {
  const { theme } = useContext(ThemeContext) || {};
  const { signOut, role, switchRole } = useContext(AuthContext) || {};
  const [isSwitching, setIsSwitching] = useState(false);

  const isDarkMode = theme === "dark";
  const isResponder = role === "RESPONDER";

  const handlePoliceModeSwitch = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Vibration.vibrate(100);

      // 1. Biometric Hardware Check
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        const authResult = await LocalAuthentication.authenticateAsync({
          promptMessage: isResponder
            ? "Verify Identity to Exit Responder Mode"
            : "Verify Identity for Responder Access",
          fallbackLabel: "Use Passcode",
          disableDeviceFallback: false,
        });

        if (!authResult.success) return;
      }

      // 2. Final Confirmation Alert
      Alert.alert(
        "Confirm Mode Switch",
        `Are you sure you want to switch to ${isResponder ? "Citizen" : "Police"} mode?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Confirm Switch",
            style: isResponder ? "destructive" : "default",
            onPress: async () => {
              setIsSwitching(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

              try {
                // Perform the actual role switch logic from context
                if (switchRole) {
                  await switchRole(isResponder ? "CITIZEN" : "RESPONDER");
                }
                
                // Keep overlay visible briefly for visual feedback/UX
                setTimeout(() => {
                  setIsSwitching(false);
                }, 1500);
              } catch (error) {
                console.error("Switch Error:", error);
                Alert.alert("System Error", "Failed to switch secure protocol.");
                setIsSwitching(false);
              }
            },
          },
        ]
      );
    } catch (err) {
      console.error("Authentication Error:", err);
      setIsSwitching(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#020617" : "#f8fafc" }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {isSwitching && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#bef264" />
          <Text style={styles.overlayText}>
            {isResponder ? "Restoring Citizen Interface..." : "Establishing Encrypted Session..."}
          </Text>
          <Text style={styles.subOverlayText}>
            {isResponder ? "DECRYPTING NODE" : "UPLINKING TO POLICE NETWORK"}
          </Text>
        </View>
      )}

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>System Preferences</Text>
          <View style={[styles.card, { backgroundColor: isDarkMode ? "#0f172a" : "#ffffff" }]}>
            <MenuRow
              icon="notifications"
              title="Alerts"
              sub="Flood & Risk Notifications"
              isDark={isDarkMode}
              iconColor="#f59e0b"
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <MenuRow
              icon="shield-checkmark"
              title="Privacy"
              sub="Data & Location Permissions"
              isDark={isDarkMode}
              iconColor="#10b981"
              onPress={() => {}}
            />
          </View>

          <TouchableOpacity 
            style={styles.logoutBtn} 
            onPress={signOut}
            activeOpacity={0.6}
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Sign Out from Device</Text>
          </TouchableOpacity>

          <Text style={styles.sectionLabel}>Security Protocol</Text>
          <TouchableOpacity
            style={[
              styles.switchModeBtn,
              { backgroundColor: isResponder ? "#334155" : "#bef264" },
            ]}
            onPress={handlePoliceModeSwitch}
            activeOpacity={0.8}
          >
            <View style={styles.switchBtnContent}>
              <MaterialCommunityIcons
                name={isResponder ? "account-convert" : "shield-account"}
                size={22}
                color={isResponder ? "#fff" : "#020617"}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.switchModeText, { color: isResponder ? "#fff" : "#020617" }]}>
                {isResponder ? "Exit Responder Mode" : "Switch to Police Mode"}
              </Text>
            </View>
          </TouchableOpacity>

          <Text style={styles.footerBrand}>Safe Nepal • Kathmandu</Text>
          <Text style={styles.versionText}>Version 1.0.4 (BETA)</Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(2, 6, 23, 0.95)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  overlayText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  subOverlayText: {
    color: "#bef264",
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 12,
    fontWeight: "800",
  },
  scrollContent: { padding: 20, paddingBottom: 60 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 15,
    letterSpacing: 1.5,
  },
  card: {
    borderRadius: 24,
    marginBottom: 25,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },
  rowLeft: { flexDirection: "row", alignItems: "center" },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  rowText: { fontSize: 16, fontWeight: "700" },
  rowSubText: { fontSize: 12, color: "#64748b", marginTop: 2 },
  divider: {
    height: 1,
    backgroundColor: "rgba(100,116,139,0.08)",
    marginLeft: 75,
  },
  logoutBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 22,
    marginBottom: 35,
  },
  logoutText: { color: "#ef4444", fontWeight: "800", fontSize: 15, marginLeft: 10 },
  switchModeBtn: {
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  switchBtnContent: { flexDirection: "row", alignItems: "center" },
  switchModeText: { fontWeight: "900", fontSize: 16 },
  footerBrand: {
    textAlign: "center",
    color: "#475569",
    fontSize: 11,
    marginTop: 30,
    opacity: 0.8,
    fontWeight: '700'
  },
  versionText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 10,
    marginTop: 5,
    opacity: 0.5,
  },
});