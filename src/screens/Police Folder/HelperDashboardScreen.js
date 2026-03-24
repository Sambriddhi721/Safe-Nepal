import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";

export default function HelperDashboardScreen({ navigation }) {
  // We destructure signOut, but handle the case where user might be null for now
  const { user, signOut } = useContext(AuthContext);

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />

      {/* HEADER WITH BACK BUTTON */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Helper Dashboard</Text>
          <Text style={styles.subtitle}>
            Welcome, {user?.full_name || "Authorized Responder"}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* CARD 1: SOS REQUESTS */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("SOSList")}
        >
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="alert-decagram" size={32} color="#FF4D4D" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>View SOS Requests</Text>
            <Text style={styles.cardText}>
              See active emergency alerts from citizens in Nepal
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#555" />
        </TouchableOpacity>

        {/* CARD 2: LIVE MAP */}
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("RealTimeMap")} // FIXED: Matches App.js route
        >
          <View style={[styles.iconCircle, { backgroundColor: '#1E3A8A' }]}>
            <Ionicons name="map" size={30} color="#60A5FA" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Live Incident Map</Text>
            <Text style={styles.cardText}>
              Track real-time locations of reported disasters
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#555" />
        </TouchableOpacity>
      </View>

      {/* LOGOUT / EXIT SECTION */}
      <TouchableOpacity 
        style={styles.logoutContainer} 
        onPress={() => {
            // If signOut throws error because of missing backend, use goBack
            if(signOut) signOut();
            else navigation.navigate("Home");
        }}
      >
        <Ionicons name="log-out-outline" size={20} color="#f55" />
        <Text style={styles.logout}>Exit Responder Mode</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { 
    marginTop: 50, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 30 
  },
  backBtn: { marginRight: 15, padding: 5 },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "800",
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    marginTop: 2,
  },
  content: { flex: 1 },
  card: {
    backgroundColor: "#1e293b",
    padding: 20,
    borderRadius: 20,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconCircle: {
    width: 55,
    height: 55,
    borderRadius: 15,
    backgroundColor: '#311b1b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  cardText: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  logoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    padding: 15,
  },
  logout: {
    marginLeft: 8,
    color: "#f55",
    fontWeight: "700",
    fontSize: 15,
  },
});