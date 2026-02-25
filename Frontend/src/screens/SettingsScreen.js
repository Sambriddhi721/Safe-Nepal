import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Import only the Context
import { ThemeContext } from "../context/ThemeContext";

export default function SettingsScreen({ navigation }) {
  // Grab everything from Context
  const { theme, toggleTheme, colors } = useContext(ThemeContext);
  const isDark = theme === "dark";

  return (
    <LinearGradient
      colors={isDark ? ["#0f2027", "#203a43", "#2c5364"] : ["#f5f5f5", "#eaeaea", "#ffffff"]}
      style={styles.container}
    >
      <ScrollView>
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

        {/* SETTINGS OPTIONS */}
        <Text style={styles.sectionLabel}>Account Settings</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingItem icon="notifications-outline" label="Notifications" colors={colors} />
          <SettingItem icon="lock-closed-outline" label="Privacy" colors={colors} />
          <SettingItem icon="shield-checkmark-outline" label="Security" colors={colors} borderNone />
        </View>

        <TouchableOpacity 
           style={styles.logoutBtn}
           onPress={() => alert("Logged out!")} // Temporary fix for the 'signOut' error
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
}

// Reusable Row Component
function SettingItem({ icon, label, colors, borderNone }) {
  return (
    <TouchableOpacity style={[styles.row, !borderNone && styles.border, { borderColor: 'rgba(255,255,255,0.1)' }]}>
      <View style={styles.leftSide}>
        <Ionicons name={icon} size={20} color={colors.primary} />
        <Text style={[styles.label, { color: colors.text }]}> {label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#888" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold" },
  card: {
    marginHorizontal: 20,
    borderRadius: 15,
    paddingVertical: 5,
    marginBottom: 20,
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
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
    backgroundColor: "#ff444422",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ff4444",
  },
  logoutText: { color: "#ff4444", fontWeight: "bold", fontSize: 16 },
});