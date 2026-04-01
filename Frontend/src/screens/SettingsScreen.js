import React, { useContext, useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Switch,
  ScrollView, Alert, StatusBar, SafeAreaView, Vibration
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics';

import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { saveSetting, getSetting } from "../services/dbService";

export default function SettingsScreen({ navigation }) {
  const { theme, toggleTheme, colors } = useContext(ThemeContext);
  const { signOut, user, role, switchRole } = useContext(AuthContext) || {};

  const isDark = theme === "dark";
  const isResponder = role === "RESPONDER" || role === "POLICE";
  const [alertsEnabled, setAlertsEnabled] = useState(false);

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

  const handleToggleAlerts = async (value) => {
    setAlertsEnabled(value);
    await saveSetting('emergency_alerts', value);
  };

  const handleRoleSwitch = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Vibration.vibrate(100);
    Alert.alert(
      "Switching Mode",
      `Switch to ${isResponder ? "Citizen" : "Police"} Dashboard?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => switchRole && switchRole() }
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

          {/* ACCOUNT MODE SWITCHER */}
          <Text style={styles.sectionLabel}>Account Mode</Text>
          <TouchableOpacity 
            style={[styles.card, { backgroundColor: colors.card, borderColor: isDark ? '#334155' : '#e2e8f0', borderWidth: 1 }]}
            onLongPress={handleRoleSwitch}
            delayLongPress={2000}
          >
             <View style={styles.row}>
                <View style={styles.leftSide}>
                   <View style={[styles.iconBox, { backgroundColor: 'rgba(34, 197, 94, 0.1)' }]}>
                      <Ionicons name="shield-checkmark" size={20} color="#22c55e" />
                   </View>
                   <View>
                      <Text style={[styles.label, { color: colors.text }]}>{isResponder ? "Citizen Mode" : "Police Mode"}</Text>
                      <Text style={styles.subLabel}>Hold 2s to switch roles</Text>
                   </View>
                </View>
                <Ionicons name="finger-print" size={22} color="#22c55e" />
             </View>
          </TouchableOpacity>

          {/* APPEARANCE */}
          <Text style={styles.sectionLabel}>Appearance</Text>
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
          </View>

          {/* PREFERENCES & SECURITY */}
          <Text style={styles.sectionLabel}>Preferences & Security</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <SettingItem 
               icon="notifications-outline" 
               label="Notifications" 
               sub="Alerts, Sounds"
               onPress={() => navigation.navigate('NotificationSettings')} 
               colors={colors} 
            />
            <SettingItem 
               icon="lock-closed-outline" 
               label="Security & 2FA" 
               sub="Password, Biometrics"
               onPress={() => navigation.navigate('SecuritySettings')} 
               colors={colors} 
            />
            <SettingItem 
               icon="shield-outline" 
               label="Privacy Settings" 
               sub="Location, Data Sharing"
               onPress={() => navigation.navigate('PrivacySettings')} 
               colors={colors} 
            />
          </View>

          {/* PAYMENTS & ACCOUNTS */}
          <Text style={styles.sectionLabel}>Billing & Links</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <SettingItem 
               icon="card-outline" 
               label="Billing & Payments" 
               sub="Donations, Subscriptions"
               onPress={() => navigation.navigate('BillingScreen')} 
               colors={colors} 
            />
            <SettingItem 
               icon="link-outline" 
               label="Linked Accounts" 
               sub="Google, Facebook"
               borderNone
               onPress={() => navigation.navigate('LinkedAccountsScreen')} 
               colors={colors} 
            />
          </View>

          {/* LOGOUT */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Log Out Account</Text>
          </TouchableOpacity>
          
          <Text style={styles.versionText}>Safe Nepal v1.0.4 | ADB Tunnel Active</Text>
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
  logoutBtn: { marginTop: 10, marginHorizontal: 20, backgroundColor: "rgba(239, 68, 68, 0.1)", padding: 18, borderRadius: 24, flexDirection: 'row', alignItems: "center", justifyContent: "center" },
  logoutText: { color: "#ef4444", fontWeight: "800", fontSize: 16, marginLeft: 10 },
  versionText: { textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 30 }
});