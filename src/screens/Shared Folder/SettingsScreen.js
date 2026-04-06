import React, { useContext, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, Alert, StatusBar, Vibration, ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics'; 

// Using your specific project context paths
import { ThemeContext } from "../../../../src/context/ThemeContext";
import { AuthContext } from "../../../../src/context/AuthContext"; 

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
  const { isDarkMode } = useContext(ThemeContext) || {};
  const { signOut, role, switchRole } = useContext(AuthContext) || {}; 
  const [isSwitching, setIsSwitching] = useState(false);

  const isResponder = role === "RESPONDER";

  const handleRoleSwitch = async () => {
    // Tactical Feedback
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
            setIsSwitching(true); // Show tactical overlay
            
            try {
              if (switchRole) {
                // 1. Execute the role change in your backend/context
                await switchRole();
                
                // 2. 2-Second Delay for the tactical experience
                setTimeout(() => {
                  setIsSwitching(false);
                  
                  // 3. Navigation - Redirecting to the Police Dashboard
                  // NOTE: Make sure 'PoliceDashboard' exists in your App.js navigator
                  if (!isResponder) {
                    navigation.navigate('PoliceDashboard');
                  } else {
                    navigation.navigate('UserHome');
                  }
                }, 2000);
              }
            } catch (error) {
              setIsSwitching(false);
              Alert.alert("Access Denied", "Could not verify credentials.");
            }
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? "#020617" : "#f8fafc" }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* TACTICAL SECURITY OVERLAY */}
      {isSwitching && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#bef264" />
          <Text style={styles.overlayText}>
            {isResponder ? "Restoring Citizen Interface..." : "Switching to Police Mode"}
          </Text>
          <Text style={styles.subOverlayText}>
            {isResponder ? "DECRYPTING SESSION" : "ENCRYPTING RESPONDER SESSION"}
          </Text>
        </View>
      )}

      {/* HEADER SECTION */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? "#fff" : "#000" }]}>My Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. PREFERENCES & SECURITY */}
        <Text style={styles.sectionLabel}>Preferences & Security</Text>
        <View style={[styles.card, { backgroundColor: isDarkMode ? "#0f172a" : "#ffffff" }]}>
          <MenuRow icon="notifications" title="Notifications" sub="Flood & Disaster Alert Settings" isDark={isDarkMode} iconColor="#f59e0b" />
          <View style={styles.divider} />
          <MenuRow icon="shield-checkmark" title="Privacy" sub="Manage Location & Data Permissions" isDark={isDarkMode} iconColor="#10b981" />
          <View style={styles.divider} />
          <MenuRow icon="person" title="Account" sub="Personal Details & Research Focus" isDark={isDarkMode} iconColor="#6366f1" />
        </View>

        {/* 2. SUPPORT */}
        <Text style={styles.sectionLabel}>Support</Text>
        <View style={[styles.card, { backgroundColor: isDarkMode ? "#0f172a" : "#ffffff" }]}>
          <MenuRow icon="help-circle" title="Help & FAQ" sub="SARIMAX Predictive Engine Support" isDark={isDarkMode} iconColor="#8b5cf6" />
          <View style={styles.divider} />
          <MenuRow icon="information-circle" title="About Safe Nepal" sub="Version 2.1.0 Beta (2026)" isDark={isDarkMode} iconColor="#64748b" />
        </View>

        {/* 3. LOGOUT (Moved up) */}
        <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out from Device</Text>
        </TouchableOpacity>

        <View style={{ marginVertical: 15 }} />

        {/* 4. RESPONDER TOOLS (LAST IN THE PAGE) */}
        <Text style={styles.sectionLabel}>Responder Tools</Text>
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
              style={{marginRight: 10}} 
            />
            <Text style={[styles.switchModeText, { color: isResponder ? "#fff" : "#0f172a" }]}>
              {isResponder ? "Switch to Citizen Mode" : "Switch to Police Mode"}
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.footerBrand}>Safe Nepal • Kathmandu, Nepal</Text>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: '#020617', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 2000 
  },
  overlayText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  subOverlayText: { color: '#bef264', fontSize: 10, letterSpacing: 2, marginTop: 5, fontWeight: '600' },
  scrollContent: { padding: 20, paddingBottom: 60 },
  sectionLabel: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: '#64748b', 
    textTransform: 'uppercase', 
    marginBottom: 15, 
    letterSpacing: 1 
  },
  card: { borderRadius: 24, marginBottom: 25, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 45, height: 45, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  rowText: { fontSize: 17, fontWeight: '700' },
  rowSubText: { fontSize: 13, color: '#64748b', marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(100,116,139,0.1)', marginLeft: 75 },
  logoutBtn: { 
    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 20, 
    borderRadius: 24, 
  },
  logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 16, marginLeft: 10 },
  switchModeBtn: { 
    paddingVertical: 20, 
    borderRadius: 24, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginBottom: 30,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  switchBtnContent: { flexDirection: 'row', alignItems: 'center' },
  switchModeText: { fontWeight: "900", fontSize: 16 },
  footerBrand: { textAlign: 'center', color: '#475569', fontSize: 12, marginTop: 40, fontWeight: '500' }
});