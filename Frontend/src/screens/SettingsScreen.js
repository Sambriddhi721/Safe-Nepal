import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

import { ThemeContext } from "../context/ThemeContext";
import { themes } from "../theme/colors";

export default function SettingsScreen({ navigation }) {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const colors = themes[theme];
  const isDark = theme === "dark";

  return (
    <LinearGradient
      colors={
        isDark
          ? ["#0f2027", "#203a43", "#2c5364"]
          : ["#f5f5f5", "#eaeaea", "#ffffff"]
      }
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Settings
        </Text>
        <View style={{ width: 22 }} />
      </View>

      {/* PROFILE SECTION */}
      <TouchableOpacity
        style={[styles.profileRow, { backgroundColor: colors.card }]}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Ionicons name="person" size={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: colors.text }]}>
            Esprihya Dawadi
          </Text>
          <Text style={styles.editText}>Edit Your Profile</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#aaa" />
      </TouchableOpacity>

      {/* GENERAL */}
      <Text style={styles.sectionTitle}>General</Text>

      <View style={[styles.settingRow, { backgroundColor: colors.card }]}>
        <View style={styles.settingLeft}>
          <Ionicons name="moon" size={18} color={colors.primary} />
          <Text style={[styles.settingText, { color: colors.text }]}>
            {" "}Dark Mode
          </Text>
        </View>

        {/* ✅ THEME SWITCH */}
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          thumbColor={isDark ? colors.primary : "#ccc"}
          trackColor={{ false: "#999", true: "#90caf9" }}
        />
      </View>

      {/* SETTINGS LIST */}
      <Text style={styles.sectionTitle}>Settings</Text>

      <View style={[styles.listCard, { backgroundColor: colors.card }]}>
        <SettingItem icon="notifications" label="Notification" colors={colors} />
        <SettingItem icon="lock-closed" label="Privacy" colors={colors} />
        <SettingItem icon="shield-checkmark" label="Security" colors={colors} />
        <SettingItem icon="person" label="Account" colors={colors} />
        <SettingItem icon="help-circle" label="Help" colors={colors} />
        <SettingItem icon="information-circle" label="About" colors={colors} />
      </View>

      {/* LOGOUT */}
      <TouchableOpacity style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>v2.0</Text>
    </LinearGradient>
  );
}

/* ✅ REUSABLE ROW */
function SettingItem({ icon, label, colors }) {
  return (
    <TouchableOpacity style={styles.itemRow}>
      <View style={styles.settingLeft}>
        <Ionicons name={icon} size={18} color={colors.primary} />
        <Text style={[styles.settingText, { color: colors.text }]}>
          {" "}{label}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#aaa" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: 55,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "700",
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  name: {
    fontWeight: "700",
    fontSize: 15,
  },

  editText: {
    color: "#8fa3c8",
    fontSize: 12,
    marginTop: 2,
  },

  sectionTitle: {
    color: "#8fa3c8",
    marginHorizontal: 16,
    marginBottom: 8,
    fontWeight: "700",
  },

  settingRow: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  settingText: {
    fontWeight: "600",
  },

  listCard: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: "hidden",
  },

  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderColor: "#1f2933",
  },

  logoutBtn: {
    backgroundColor: "#5a1b1b",
    marginHorizontal: 40,
    marginTop: 26,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },

  logoutText: {
    color: "#ff6b6b",
    fontWeight: "700",
  },

  version: {
    marginTop: 12,
    textAlign: "center",
    color: "#aaa",
    fontSize: 11,
  },
});
