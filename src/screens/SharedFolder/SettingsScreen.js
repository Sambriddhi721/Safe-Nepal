import React, { useContext, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, Alert, StatusBar, Vibration, ActivityIndicator
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics'; 
import * as LocalAuthentication from 'expo-local-authentication';

// Context Imports
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext"; 

// Reusable Menu Row Component
const MenuRow = ({ icon, title, sub, onPress, isDark, iconColor = "#3b82f6" }) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.rowLeft}>
      <View style={[styles.iconBox, { backgroundColor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)" }]}>
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

  const isDarkMode = theme === 'dark';
  const isResponder = role === "RESPONDER";

  // Tactical Role Switch Logic
  const handlePoliceModeSwitch = async () => {
    // 1. Initial Tactical Feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Vibration.vibrate(100);

    // 2. Biometric Security Gate
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const authResult = await LocalAuthentication.authenticateAsync({
        promptMessage: isResponder ? 'Verify Identity to Exit Responder Mode' : 'Verify Identity for Responder Access',
        fallbackLabel: 'Use Passcode',
      });
      if (!authResult.success) return; 
    }

    // 3. Confirmation Dialog
    Alert.alert(
      "Confirm Mode Switch",
      `Are you sure you want to switch to ${isResponder ? "Citizen" : "Police"} mode?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm Switch", 
          onPress: async () => {
            setIsSwitching(true); // Trigger tactical overlay
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

            try {
              // 4. Update the Context (Triggers App.js Stack Switch)
              await switchRole(); 

              // 5. Tactical delay for "System Uplink" effect
              setTimeout(() => {
                setIsSwitching(false);
              }, 2000);
            } catch (error) {
              setIsSwitching(false);
              Alert.alert("System Error", "Authorization failed. Check your connection.");
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#020617" : "#f8fafc" }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* TACTICAL SECURITY OVERLAY */}
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

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* 1. PREFERENCES */}
          <Text style={styles.sectionLabel}>System Preferences</Text>
          <View style={[styles.card, { backgroundColor: isDarkMode ? "#0f172a" : "#ffffff" }]}>
            <MenuRow icon="notifications" title="Alerts" sub="Flood & Risk Notifications" isDark={isDarkMode} iconColor="#f59e0b" onPress={() => navigation.navigate("NotificationSettings")} />
            <View style={styles.divider} />
            <MenuRow icon="shield-checkmark" title="Privacy" sub="Data & Location Permissions" isDark={isDarkMode} iconColor="#10b981" onPress={() => navigation.navigate("PrivacySettings")} />
            <View style={styles.divider} />
            <MenuRow icon="person" title="Account" sub="Profile & Academic Details" isDark={isDarkMode} iconColor="#6366f1" onPress={() => navigation.navigate("AccountSettings")} />
          </View>

          {/* 2. SUPPORT */}
          <Text style={styles.sectionLabel}>Safe Nepal Support</Text>
          <View style={[styles.card, { backgroundColor: isDarkMode ? "#0f172a" : "#ffffff" }]}>
            <MenuRow icon="help-circle" title="Help Center" sub="FAQ & Documentation" isDark={isDarkMode} iconColor="#8b5cf6" onPress={() => navigation.navigate("Help")} />
            <View style={styles.divider} />
            <MenuRow icon="information-circle" title="Version" sub="v2.1.0 Beta" isDark={isDarkMode} iconColor="#64748b" onPress={() => navigation.navigate("About")} />
          </View>

          {/* 3. LOGOUT */}
          <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text style={styles.logoutText}>Sign Out from Device</Text>
          </TouchableOpacity>

          {/* 4. POLICE MODE SWITCH */}
          <Text style={styles.sectionLabel}>Security Protocol</Text>
          <TouchableOpacity 
            style={[styles.switchModeBtn, { backgroundColor: isResponder ? "#334155" : "#bef264" }]} 
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

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  overlayText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 20, textAlign: 'center', paddingHorizontal: 20 },
  subOverlayText: { color: '#bef264', fontSize: 10, letterSpacing: 2, marginTop: 8, fontWeight: '800' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  sectionLabel: { fontSize: 11, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1.5 },
  card: { borderRadius: 24, marginBottom: 25, overflow: 'hidden', elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  rowText: { fontSize: 16, fontWeight: '700' },
  rowSubText: { fontSize: 12, color: '#64748b', marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(100,116,139,0.08)', marginLeft: 75 },
  logoutBtn: { backgroundColor: 'rgba(239, 68, 68, 0.08)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 22, marginBottom: 30 },
  logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 15, marginLeft: 10 },
  switchModeBtn: { paddingVertical: 20, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 30, elevation: 4, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10 },
  switchBtnContent: { flexDirection: 'row', alignItems: 'center' },
  switchModeText: { fontWeight: "900", fontSize: 16 },
  footerBrand: { textAlign: 'center', color: '#475569', fontSize: 11, marginTop: 20, opacity: 0.6 }
});