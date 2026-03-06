import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Import Context and Storage Service
import { ThemeContext } from "../context/ThemeContext";
import { saveSetting, getSetting } from "../services/dbService";

export default function SettingsScreen({ navigation }) {
  const { theme, toggleTheme, colors } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // State for other interactive toggles
  const [alertsEnabled, setAlertsEnabled] = useState(false);

  // 1. Load persisted settings when the screen mounts
  useEffect(() => {
    const loadSettings = async () => {
      const savedAlerts = await getSetting('emergency_alerts', false);
      setAlertsEnabled(savedAlerts);
    };
    loadSettings();
  }, []);

  // 2. Functional Handlers
  const handleToggleAlerts = async (value) => {
    setAlertsEnabled(value);
    await saveSetting('emergency_alerts', value);
  };

  return (
    <LinearGradient
      colors={isDark ? ["#0f2027", "#203a43", "#2c5364"] : ["#f5f5f5", "#eaeaea", "#ffffff"]}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* CUSTOM HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
          <View style={{ width: 24 }} /> 
        </View>

        {/* THEME SWITCH CARD */}
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
              trackColor={{ false: "#767577", true: "#81b0ff" }}
            />
          </View>
        </View>

        {/* --- AUTHORITIES SECTION (NEW) --- */}
        <Text style={styles.sectionLabel}>Authorized Personnel Only</Text>
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: '#60A5FA', borderWidth: 0.5 }]}>
          <SettingItem 
            icon="shield-account-outline" 
            label="Responder Portal" 
            colors={colors} 
            borderNone
            isMaterial={true}
            onPress={() => navigation.navigate('HelperDashboard')} 
          />
        </View>

        {/* ACCOUNT SETTINGS SECTION */}
        <Text style={styles.sectionLabel}>Account Settings</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.row, styles.border, { borderColor: 'rgba(255,255,255,0.1)' }]}>
            <View style={styles.leftSide}>
              <Ionicons name="notifications-outline" size={20} color={colors.primary} />
              <Text style={[styles.label, { color: colors.text }]}> Emergency Alerts</Text>
            </View>
            <Switch
              value={alertsEnabled}
              onValueChange={handleToggleAlerts}
              thumbColor={alertsEnabled ? colors.primary : "#f4f3f4"}
              trackColor={{ false: "#767577", true: "#4cd137" }}
            />
          </View>

          <SettingItem 
            icon="lock-closed-outline" 
            label="Privacy" 
            colors={colors} 
            onPress={() => navigation.navigate('Privacy')} 
          />
          <SettingItem 
            icon="shield-checkmark-outline" 
            label="Security" 
            colors={colors} 
            borderNone 
            onPress={() => navigation.navigate('Security')} 
          />
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity 
            style={styles.logoutBtn}
            onPress={() => alert("Logged out!")} 
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
  );
}

// Reusable Row Component
function SettingItem({ icon, label, colors, borderNone, onPress, isMaterial = false }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      style={[styles.row, !borderNone && styles.border, { borderColor: 'rgba(255,255,255,0.1)' }]}
    >
      <View style={styles.leftSide}>
        {isMaterial ? (
          <MaterialCommunityIcons name={icon} size={22} color="#60A5FA" />
        ) : (
          <Ionicons name={icon} size={20} color={colors.primary} />
        )}
        <Text style={[styles.label, { color: label === "Responder Portal" ? "#60A5FA" : colors.text }]}> {label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#888" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 22, fontWeight: "bold" },
  card: {
    marginHorizontal: 20,
    borderRadius: 15,
    paddingVertical: 5,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },
  leftSide: { flexDirection: "row", alignItems: "center" },
  label: { fontSize: 16, fontWeight: "500", marginLeft: 10 },
  border: { borderBottomWidth: 1 },
  sectionLabel: {
    marginHorizontal: 25,
    marginBottom: 10,
    color: "#888",
    fontWeight: "600",
    textTransform: "uppercase",
    fontSize: 12,
  },
  logoutBtn: {
    marginTop: 20,
    marginHorizontal: 40,
    backgroundColor: "#ff444415",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  logoutText: { color: "#ff4444", fontWeight: "bold", fontSize: 16 },
});