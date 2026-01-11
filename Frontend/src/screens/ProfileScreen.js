import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

export default function ProfileScreen({ navigation }) {
  const { user, signOut } = useContext(AuthContext);

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Log Out", style: "destructive", onPress: signOut },
    ]);
  };

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={styles.container}
    >
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* PROFILE CARD */}
        <View style={styles.profileCard}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={42} color="#fff" />
          </View>

          <Text style={styles.name}>
            {user?.full_name || "User Name"}
          </Text>
          <Text style={styles.email}>
            {user?.email || "user@email.com"}
          </Text>

          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="create-outline" size={16} color="#fff" />
            <Text style={styles.editText}> Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* OPTIONS */}
        <View style={styles.optionCard}>
          <OptionItem
            icon="shield-checkmark"
            label="Account & Security"
            onPress={() => Alert.alert("Coming Soon")}
          />
          <OptionItem
            icon="notifications"
            label="Notifications"
            onPress={() => Alert.alert("Coming Soon")}
          />
          <OptionItem
            icon="location"
            label="Location Settings"
            onPress={() => Alert.alert("Coming Soon")}
          />
          <OptionItem
            icon="help-circle"
            label="Help & Support"
            onPress={() => Alert.alert("Coming Soon")}
          />
          <OptionItem
            icon="information-circle"
            label="About App"
            onPress={() => Alert.alert("Safe Nepal v1.0")}
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>v1.0.0</Text>
      </ScrollView>
    </LinearGradient>
  );
}

/* ✅ REUSABLE OPTION ROW */
function OptionItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.optionRow} onPress={onPress}>
      <View style={styles.optionLeft}>
        <Ionicons name={icon} size={18} color="#1e90ff" />
        <Text style={styles.optionText}> {label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#aaa" />
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
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  profileCard: {
    backgroundColor: "#111827",
    marginHorizontal: 16,
    borderRadius: 20,
    alignItems: "center",
    padding: 20,
    marginTop: 10,
    marginBottom: 16,
  },

  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1e90ff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  name: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  email: {
    color: "#aaa",
    marginTop: 4,
    fontSize: 13,
  },

  editBtn: {
    marginTop: 12,
    flexDirection: "row",
    backgroundColor: "#1e90ff",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
  },

  editText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  optionCard: {
    backgroundColor: "#111827",
    marginHorizontal: 16,
    borderRadius: 20,
    paddingVertical: 6,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#1f2933",
  },

  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  optionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  logoutBtn: {
    backgroundColor: "#ff3b30",
    marginHorizontal: 60,
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 30,
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },

  version: {
    marginTop: 14,
    textAlign: "center",
    color: "#aaa",
    fontSize: 12,
  },
});
