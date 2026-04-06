import React, { useContext, useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Switch,
  ScrollView, Alert, StatusBar, Vibration, ActivityIndicator
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';

import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { getSetting } from "../services/dbService";

export default function SettingsScreen({ navigation }) {
  const { theme, toggleTheme, colors } = useContext(ThemeContext);
  const { signOut, user, role, switchRole } = useContext(AuthContext) || {};

  const isDark = theme === "dark";
  const isResponder = role === "RESPONDER" || role === "POLICE";
  
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedAlerts = await getSetting('emergency_alerts', false);
        setAlertsEnabled(savedAlerts);
      } catch (e) {
        console.warn("Settings load error:", e);
      }
    };
    loadSettings();
  }, []);

  const handleRoleSwitch = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Vibration.vibrate(100);

    Alert.alert(
      "Confirm Mode Switch",
      `Are you sure you want to switch to ${isResponder ? "Citizen" : "Police"} mode?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Switch Now", 
          onPress: async () => {
            setIsSwitching(true); 
            try {
              if (switchRole) {
                await switchRole();
                // The AppNavigator key={role} prop will handle the actual 
                // stack reset, so we just provide the visual delay here.
                setTimeout(() => {
                  setIsSwitching(false);
                }, 2000);
              }
            } catch (error) {
              setIsSwitching(false);
              Alert.alert("Error", "Failed to switch roles.");
            }
          } 
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: () => signOut && signOut() }
    ]);
  };

  return (
    <LinearGradient
      colors={isDark ? ["#0f172a", "#1e293b"] : ["#f8fafc", "#f1f5f9"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        {/* TACTICAL SWITCHING OVERLAY */}
        {isSwitching && (
          <View style={[styles.overlay, { backgroundColor: isDark ? '#020617' : '#f8fafc' }]}>
            <ActivityIndicator size="large" color="#bef264" />
            <Text style={[styles.overlayText, { color: colors.text }]}>
              {isResponder ? "Restoring Citizen Interface..." : "Switching to Police Mode"}
            </Text>
            <Text style={styles.subOverlayText}>
              {isResponder ? "DECRYPTING SESSION" : "ENCRYPTING RESPONDER SESSION"}
            </Text>
          </View>
        )}

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* PROFILE SECTION */}
          <View style={styles.profileSection}>
             <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarText}>
                   {user?.full_name ? user.full_name.split(' ').map(n => n[0]).join('') : "U"}
                </Text>
             </View>
             <Text style={[styles.userName, { color: colors.text }]}>{user?.full_name || "User Name"}</Text>
             <Text style={styles.userRole}>{isResponder ? "Police Personnel" : "Citizen Account"}</Text>
          </View>

          {/* APPEARANCE SECTION */}
          <Text style={styles.sectionLabel}>Appearance & Preferences</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
              <View style={styles.leftSide}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                   <Ionicons name={isDark ? "moon" : "sunny"} size={20} color="#3b82f6" />
                </View>
                <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: "#94a3b8", true: "#3b82f6" }}
              />
            </View>
            <View style={styles.divider} />
            <SettingItem 
                icon="notifications-outline" 
                label="Notifications" 
                sub="Alerts, Sounds"
                onPress={() => {}} 
                colors={colors} 
            />
          </View>

          {/* SECURITY SECTION */}
          <Text style={styles.sectionLabel}>Security</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <SettingItem 
                icon="lock-closed-outline" 
                label="Security & 2FA" 
                sub="Password, Biometrics"
                onPress={() => {}} 
                colors={colors} 
            />
            <SettingItem 
                icon="shield-outline" 
                label="Privacy Settings" 
                sub="Location, Data Sharing"
                borderNone
                onPress={() => {}} 
                colors={colors} 
            />
          </View>

          {/* 1. LOGOUT SECTION (Moved up) */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Log Out Account</Text>
          </TouchableOpacity>

          <View style={{ marginVertical: 15 }} />

          {/* 2. RESPONDER TOOLS (Now at the very bottom) */}
          <Text style={styles.sectionLabel}>Specialized Tools</Text>
          <TouchableOpacity 
            style={[styles.switchModeBtn, { backgroundColor: isResponder ? "#334155" : "#bef264" }]}
            onPress={handleRoleSwitch}
            activeOpacity={0.8}
          >
            <View style={styles.switchBtnContent}>
               <Ionicons 
                  name={isResponder ? "person-outline" : "shield-half"} 
                  size={20} 
                  color={isResponder ? "#fff" : "#0f172a"} 
               />
               <Text style={[styles.switchModeText, { color: isResponder ? "#fff" : "#0f172a" }]}>
                  {isResponder ? "Switch to Citizen Mode" : "Switch to Police Mode"}
               </Text>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.versionText}>Safe Nepal v1.0.4 | Secure Session</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function SettingItem({ icon, label, sub, borderNone, onPress, colors }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.row, !borderNone && styles.border, { borderColor: 'rgba(148, 163, 184, 0.1)' }]}
    >
      <View style={styles.leftSide}>
        <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.05)' }]}>
           <Ionicons name={icon} size={20} color="#3b82f6" />
        </View>
        <View>
           <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
           {sub && <Text style={styles.subLabel}>{sub}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  overlayText: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  subOverlayText: { color: '#84cc16', fontSize: 10, letterSpacing: 2, marginTop: 5, fontWeight: '700' },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  backBtn: { padding: 5 },
  profileSection: { alignItems: 'center', marginVertical: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  avatarText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  userName: { fontSize: 22, fontWeight: '700' },
  userRole: { color: '#64748b', fontSize: 14, marginTop: 4 },
  sectionLabel: { marginHorizontal: 25, marginBottom: 10, color: "#64748b", fontWeight: "800", textTransform: "uppercase", fontSize: 11, letterSpacing: 1.2 },
  card: { marginHorizontal: 20, borderRadius: 24, marginBottom: 20, overflow: 'hidden' },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16 },
  leftSide: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  label: { fontSize: 16, fontWeight: "700" },
  subLabel: { fontSize: 12, color: "#94a3b8", marginTop: 2 },
  border: { borderBottomWidth: 1 },
  divider: { height: 1, backgroundColor: 'rgba(148, 163, 184, 0.1)', marginLeft: 68 },
  logoutBtn: { 
    marginHorizontal: 20, 
    backgroundColor: "rgba(239, 68, 68, 0.1)", 
    padding: 18, 
    borderRadius: 24, 
    flexDirection: 'row', 
    alignItems: "center", 
    justifyContent: "center",
    marginTop: 10 
  },
  logoutText: { color: "#ef4444", fontWeight: "800", fontSize: 16, marginLeft: 10 },
  switchModeBtn: { 
    marginHorizontal: 20, 
    paddingVertical: 20, 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center', 
    elevation: 4, 
    shadowOpacity: 0.2,
    marginBottom: 10 
  },
  switchBtnContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  switchModeText: { fontWeight: "900", fontSize: 16 },
  versionText: { textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 30 }
});