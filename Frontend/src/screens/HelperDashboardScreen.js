import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AuthContext } from "../context/AuthContext";

export default function HelperDashboardScreen({ navigation }) {
  const { user, signOut } = useContext(AuthContext);

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={styles.container}
    >
      <Text style={styles.title}>Helper Dashboard</Text>

      <Text style={styles.subtitle}>
        Welcome, {user?.full_name || "Responder"}
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("SOSList")}
      >
        <Text style={styles.cardTitle}>🚨 View SOS Requests</Text>
        <Text style={styles.cardText}>
          See all emergency alerts from affected users
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Map")}
      >
        <Text style={styles.cardTitle}>📍 Live Map</Text>
        <Text style={styles.cardText}>
          Track real-time locations of victims
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={signOut}>
        <Text style={styles.logout}>Logout</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },

  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },

  subtitle: {
    color: "#aaa",
    marginBottom: 24,
  },

  card: {
    backgroundColor: "#1b263b",
    padding: 18,
    borderRadius: 16,
    marginBottom: 16,
  },

  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  cardText: {
    color: "#aaa",
    marginTop: 4,
  },

  logout: {
    marginTop: 30,
    color: "#f55",
    fontWeight: "600",
    textAlign: "center",
  },
});
