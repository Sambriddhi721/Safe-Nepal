import React, { useContext, useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Switch,
  ScrollView, Alert, StatusBar, SafeAreaView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext"; 
import { saveSetting, getSetting } from "../services/dbService";

export default function SettingsScreen({ navigation }) {
  const { theme, toggleTheme, colors } = useContext(ThemeContext);
  
  // Destructure signOut and isHelper from AuthContext
  const { signOut, user, isHelper } = useContext(AuthContext); 
  
  const isDark = theme === "dark";
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

  const handleSwitchAccount = () => {
    Alert.alert(
      "Switch Account",
      "Are you sure you want to log out and return to the login screen?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: async () => {
            try {
              // THE FIX: 
              // Because your App.js uses {token == null ? <Login /> : <App />},
              // simply calling signOut() will trigger App.js to re-render.
              // React Navigation will automatically unmount this screen 
              // and show the Login screen. No manual navigation.reset needed.
              if (signOut) {
                await signOut();
              }
            } catch (error) {
              console.log("Logout Process Error:", error);
            }
          } 
        },
      ]
    );
  };

  return (
    <LinearGradient
      colors={isDark ? ["#0f2027", "#203a43", "#2c5364"] : ["#f8fafc", "#f1f5f9", "#ffffff"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
            <View style={{ width: 40 }} /> 
          </View>

          {/* APPEARANCE */}
          <Text style={styles.sectionLabel}>Appearance</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
              <View style={styles.leftSide}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={20} color={colors.primary} />
                <Text style={[styles.label, { color: colors.text }]}> Dark Mode</Text>
              </View>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                thumbColor={isDark ? colors.primary : "#f4f3f4"}
                trackColor={{ false: "#767577", true: colors.primary }}
              />
            </View>
          </View>

          {/* AUTHORITIES PORTAL (Interface 2) */}
          {isHelper && (
            <>
              <Text style={styles.sectionLabel}>Authorized Personnel</Text>
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: '#3b82f6', borderWidth: 1 }]}>
                <SettingItem 
                  icon="shield-account-outline" 
                  label="Responder Portal" 
                  labelColor="#3b82f6"
                  iconColor="#3b82f6"
                  isMaterial={true}
                  onPress={() => navigation.navigate('HelperDashboard')} 
                  colors={colors}
                />
              </View>
            </>
          )}

          {/* SECURITY & PRIVACY */}
          <Text style={styles.sectionLabel}>Security & Privacy</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={[styles.row, styles.border, { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <View style={styles.leftSide}>
                <Ionicons name="notifications-outline" size={20} color={colors.primary} />
                <Text style={[styles.label, { color: colors.text }]}> Emergency Alerts</Text>
              </View>
              <Switch
                value={alertsEnabled}
                onValueChange={handleToggleAlerts}
                thumbColor={alertsEnabled ? "#4cd137" : "#f4f3f4"}
                trackColor={{ false: "#767577", true: "rgba(76, 209, 55, 0.3)" }}
              />
            </View>

            <SettingItem 
              icon="lock-closed-outline" 
              label="Privacy Settings" 
              colors={colors} 
              onPress={() => navigation.navigate('PrivacySettings')} 
            />
            
            <SettingItem 
              icon="person-outline" 
              label="Account Settings" 
              colors={colors} 
              borderNone 
              onPress={() => navigation.navigate('AccountSettings')} 
            />
          </View>

          {/* LOGOUT BUTTON */}
          <TouchableOpacity 
              style={styles.logoutBtn}
              onPress={handleSwitchAccount} 
          >
            <Ionicons name="swap-horizontal-outline" size={20} color="#ff4444" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Switch Account</Text>
          </TouchableOpacity>
          
          <Text style={styles.versionText}>Safe Nepal v1.0.4 | User: {user?.full_name || 'Dev User'}</Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

// Reusable Setting Component
function SettingItem({ icon, label, labelColor, iconColor, isMaterial, borderNone, onPress, colors }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.row, !borderNone && styles.border, { borderColor: 'rgba(150,150,150,0.1)' }]}
    >
      <View style={styles.leftSide}>
        {isMaterial ? (
          <MaterialCommunityIcons name={icon} size={22} color={iconColor || "#3b82f6"} />
        ) : (
          <Ionicons name={icon} size={20} color={iconColor || colors.primary} />
        )}
        <Text style={[styles.label, { color: labelColor || colors.text }]}> {label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#888" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  header: { paddingHorizontal: 20, paddingVertical: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 22, fontWeight: "800" },
  backBtn: { padding: 5 },
  card: { marginHorizontal: 20, borderRadius: 20, paddingVertical: 4, marginBottom: 20, overflow: 'hidden' },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 18 },
  leftSide: { flexDirection: "row", alignItems: "center" },
  label: { fontSize: 16, fontWeight: "600", marginLeft: 10 },
  border: { borderBottomWidth: 1 },
  sectionLabel: { marginHorizontal: 25, marginBottom: 10, color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", fontSize: 11, letterSpacing: 1 },
  logoutBtn: { marginTop: 10, marginHorizontal: 20, backgroundColor: "rgba(255, 68, 68, 0.1)", padding: 16, borderRadius: 18, flexDirection: 'row', alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255, 68, 68, 0.3)" },
  logoutText: { color: "#ff4444", fontWeight: "bold", fontSize: 16 },
  versionText: { textAlign: 'center', color: '#64748b', fontSize: 12, marginTop: 30 }
});