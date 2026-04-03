import React, { useContext, useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, StatusBar, 
  SafeAreaView, Switch, ActivityIndicator, Alert 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from 'expo-haptics'; // Optional: Add for tactical feel
import { AuthContext } from "../../context/AuthContext";

export default function HelperDashboardScreen({ navigation }) {
  // Pulling role and switchRole in case you want to exit mode via context
  const { user, signOut, role } = useContext(AuthContext) || {};
  const [isOnDuty, setIsOnDuty] = useState(true);

  // Tactical Toggle for Duty Status
  const toggleDuty = (value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsOnDuty(value);
  };

  const handleNavigation = (screen) => {
    if (!isOnDuty) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "SYSTEM LOCKED", 
        "Protocol Error: Unit must be 'ON DUTY' to access tactical feeds.",
        [{ text: "UNDERSTOOD", style: "default" }]
      );
      return;
    }
    navigation.navigate(screen);
  };

  return (
    <LinearGradient
      colors={["#020617", "#0f172a", "#1e293b"]}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        
        {/* --- HEADER / HUD --- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.badgeText}>
              {role || "RESPONDER"} • UNIT {user?.id?.slice(-4).toUpperCase() || "7702"}
            </Text>
            <Text style={styles.title}>Tactical Portal</Text>
          </View>
          <TouchableOpacity 
            onPress={() => navigation.navigate("AccountSettings")} 
            style={styles.settingsBtn}
          >
            <Ionicons name="cog-outline" size={24} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        {/* --- DUTY STATUS (COMMAND BAR) --- */}
        <View style={[
          styles.statusCard, 
          { 
            borderColor: isOnDuty ? "#bef264" : "#ef4444", 
            backgroundColor: isOnDuty ? "rgba(190, 242, 100, 0.03)" : "rgba(239, 68, 68, 0.03)" 
          }
        ]}>
          <View style={styles.statusInfo}>
            <View style={[styles.statusDot, { backgroundColor: isOnDuty ? "#bef264" : "#ef4444" }]} />
            <View>
              <Text style={[styles.statusTitle, { color: isOnDuty ? "#bef264" : "#ef4444" }]}>
                {isOnDuty ? "SYSTEMS ACTIVE" : "UNIT OFFLINE"}
              </Text>
              <Text style={styles.statusSub}>
                {isOnDuty ? "GPS & Radio link established" : "Encrypted link severed"}
              </Text>
            </View>
          </View>
          <Switch 
            value={isOnDuty} 
            onValueChange={toggleDuty}
            trackColor={{ false: "#334155", true: "rgba(190, 242, 100, 0.4)" }}
            thumbColor={isOnDuty ? "#bef264" : "#94a3b8"}
          />
        </View>

        {/* --- MAIN OPERATIONS --- */}
        <View style={styles.content}>
          <Text style={styles.sectionLabel}>Field Operations</Text>

          {/* EMERGENCY FEED */}
          <TouchableOpacity
            style={[styles.card, !isOnDuty && styles.disabledCard]}
            onPress={() => handleNavigation("PoliceSOSList")} // Points to the Police folder SOSList
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="broadcast" size={28} color="#ef4444" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Emergency Feed</Text>
              <Text style={styles.cardText}>Real-time SOS signals and distress logs.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#475569" />
          </TouchableOpacity>

          {/* REAL TIME MAP */}
          <TouchableOpacity
            style={[styles.card, !isOnDuty && styles.disabledCard]}
            onPress={() => handleNavigation("RealTimeMap")}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="navigate-circle" size={28} color="#3b82f6" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Tactical Map</Text>
              <Text style={styles.cardText}>Satellite tracking of active incidents.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#475569" />
          </TouchableOpacity>

          {/* VOLUNTEER DISPATCH */}
          <TouchableOpacity
            style={[styles.card, !isOnDuty && styles.disabledCard]}
            onPress={() => handleNavigation("Volunteer")}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(168, 85, 247, 0.1)' }]}>
              <MaterialCommunityIcons name="account-group" size={28} color="#a855f7" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Volunteer Units</Text>
              <Text style={styles.cardText}>Manage nearby civilian support groups.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* --- FOOTER ACTIONS --- */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.exitBtn} 
            onPress={() => navigation.navigate("UserHome")} // Assuming UserHome evaluates role and goes to Citizen Home
          >
            <Ionicons name="shield-checkmark-outline" size={20} color="#94a3b8" />
            <Text style={styles.exitText}>Switch to Citizen Mode</Text>
          </TouchableOpacity>
          <Text style={styles.footerBrand}>SAFE NEPAL OPERATIONAL SYSTEM</Text>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingHorizontal: 25,
    marginTop: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    marginBottom: 25 
  },
  settingsBtn: { 
    backgroundColor: "rgba(255,255,255,0.05)", 
    padding: 10, 
    borderRadius: 12 
  },
  badgeText: { color: "#3b82f6", fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  title: { color: "#fff", fontSize: 32, fontWeight: "800" },
  
  statusCard: {
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statusInfo: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  statusTitle: { fontSize: 14, fontWeight: "900", letterSpacing: 1 },
  statusSub: { color: "#64748b", fontSize: 11, marginTop: 2 },

  content: { flex: 1, paddingHorizontal: 20 },
  sectionLabel: { color: "#475569", fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: 15, letterSpacing: 1.5 },
  
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    padding: 18,
    borderRadius: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  disabledCard: { opacity: 0.3 },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardTitle: { color: "#fff", fontSize: 17, fontWeight: "700" },
  cardText: { color: "#64748b", fontSize: 12, marginTop: 2 },

  footer: { paddingHorizontal: 20, paddingBottom: 20, alignItems: 'center' },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(148, 163, 184, 0.05)',
    paddingVertical: 16,
    width: '100%',
    borderRadius: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)'
  },
  exitText: { marginLeft: 10, color: "#94a3b8", fontWeight: "700", fontSize: 14 },
  footerBrand: { color: "#334155", fontSize: 9, fontWeight: "800", letterSpacing: 2 }
});