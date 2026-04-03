import React, { useContext, useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, StatusBar, 
  SafeAreaView, Switch, ActivityIndicator, Alert 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";

export default function HelperDashboardScreen({ navigation }) {
  const { user, signOut } = useContext(AuthContext) || {};
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // Function to simulate a "Sync" when opening tools
  const handleNavigation = (screen) => {
    if (!isOnDuty) {
      Alert.alert("System Offline", "You must be 'On Duty' to access responder tools.");
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
        
        {/* TOP HUD SECTION */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          <View>
            <Text style={styles.badgeText}>ID: {user?.id?.slice(-6).toUpperCase() || "RN-7702"}</Text>
            <Text style={styles.title}>Helper Portal</Text>
          </View>
        </View>

        {/* DUTY STATUS TOGGLE */}
        <View style={[
          styles.statusCard, 
          { 
            borderColor: isOnDuty ? "#bef264" : "#475569", 
            backgroundColor: isOnDuty ? "rgba(190, 242, 100, 0.05)" : "rgba(71, 85, 105, 0.1)" 
          }
        ]}>
          <View style={styles.statusInfo}>
            <View style={[styles.statusDot, { backgroundColor: isOnDuty ? "#bef264" : "#ef4444" }]} />
            <View>
              <Text style={[styles.statusTitle, { color: isOnDuty ? "#bef264" : "#94a3b8" }]}>
                {isOnDuty ? "BROADCASTING LIVE" : "DISPATCH OFFLINE"}
              </Text>
              <Text style={styles.statusSub}>
                {isOnDuty ? "Your location is visible to HQ" : "Location tracking paused"}
              </Text>
            </View>
          </View>
          <Switch 
            value={isOnDuty} 
            onValueChange={setIsOnDuty}
            trackColor={{ false: "#334155", true: "#bef264" }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.sectionLabel}>Tactical Operations</Text>

          {/* CARD 1: SOS REQUESTS */}
          <TouchableOpacity
            style={[styles.card, !isOnDuty && styles.disabledCard]}
            onPress={() => handleNavigation("SOSList")}
            activeOpacity={0.7}
          >
            <View style={styles.iconCircle}>
              <MaterialCommunityIcons name="alert-rhombus" size={28} color="#ef4444" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Emergency Feed</Text>
              <Text style={styles.cardText}>
                View incoming distress signals from civilians.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#475569" />
          </TouchableOpacity>

          {/* CARD 2: LIVE MAP */}
          <TouchableOpacity
            style={[styles.card, !isOnDuty && styles.disabledCard]}
            onPress={() => handleNavigation("RealTimeMap")}
            activeOpacity={0.7}
          >
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <Ionicons name="map" size={26} color="#3b82f6" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Topographical Map</Text>
              <Text style={styles.cardText}>
                Satellite overlay of active hazard zones.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#475569" />
          </TouchableOpacity>
        </View>

        {/* BOTTOM ACTION SECTION */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.exitBtn} 
            onPress={() => signOut ? signOut() : navigation.goBack()}
          >
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={styles.exitText}>Exit Responder Mode</Text>
          </TouchableOpacity>
          <Text style={styles.footerBrand}>SAFE NEPAL • VER 2.1.0</Text>
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingHorizontal: 20,
    marginTop: 20, 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 25 
  },
  backBtn: { marginRight: 15 },
  badgeText: { color: "#3b82f6", fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800" },
  
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
  statusTitle: { fontSize: 13, fontWeight: "900", letterSpacing: 1 },
  statusSub: { color: "#64748b", fontSize: 11, marginTop: 2 },

  content: { flex: 1, paddingHorizontal: 20 },
  sectionLabel: { color: "#475569", fontSize: 12, fontWeight: "800", textTransform: "uppercase", marginBottom: 15, letterSpacing: 1.5 },
  
  card: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  disabledCard: { opacity: 0.4 },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: { flex: 1, marginLeft: 15 },
  cardTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  cardText: { color: "#94a3b8", fontSize: 12, marginTop: 4, lineHeight: 18 },

  footer: { paddingHorizontal: 20, paddingBottom: 20, alignItems: 'center' },
  exitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingVertical: 18,
    width: '100%',
    borderRadius: 22,
    marginBottom: 15
  },
  exitText: { marginLeft: 10, color: "#ef4444", fontWeight: "800", fontSize: 16 },
  footerBrand: { color: "#334155", fontSize: 10, fontWeight: "800", letterSpacing: 3 }
});