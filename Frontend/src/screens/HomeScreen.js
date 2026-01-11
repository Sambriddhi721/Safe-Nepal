import React, { useEffect, useState, useContext } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, 
  ScrollView, ActivityIndicator, StatusBar, SafeAreaView
} from "react-native";
import * as Location from "expo-location";
import { FontAwesome, MaterialIcons, Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../context/AuthContext";
import SafeMapView from "../components/SafeMapView"; 

const API_BASE = "http://10.23.1.244:5000";

// Theme Palette from your provided image
const COLORS = {
  background: "#0F172A", // Darkest Navy
  card: "#1E293B",       // Slate Navy
  primary: "#3B82F6",    // Bright Blue
  danger: "#EF4444",     // SOS Red
  warning: "#F59E0B",    // Alert Orange
  success: "#10B981",    // Low Risk Green
  textMain: "#FFFFFF",
  textMuted: "#94A3B8",
};

export default function HomeScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [coords, setCoords] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [risk, setRisk] = useState("Low");

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLoadingLocation(false);
          return;
        }
        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setCoords(loc.coords);
      } catch (e) {
        console.log("Location Error:", e);
      } finally {
        setLoadingLocation(false);
      }
    })();
    fetchRisk();
  }, []);

  const fetchRisk = async () => {
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          Damak_rf: 10, Dhangadhi_rf: 220, Bharatpur_rf: 12, Pokhara_rf: 50, Kathmandu_rf: 15 
        }),
      });
      const data = await res.json();
      setRisk(data?.prediction || "Low");
    } catch (err) {
      setRisk("Low");
    }
  };

  const riskColor = risk.toLowerCase().includes("high") ? COLORS.danger : 
                    risk.toLowerCase().includes("medium") ? COLORS.warning : COLORS.success;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER: Matching 'Nepal Disaster Watch' */}
      <View style={styles.header}>
        <Ionicons name="shield-checkmark-outline" size={24} color={COLORS.textMain} />
        <Text style={styles.headerTitle}>Nepal Disaster Watch</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <FontAwesome name="user-circle" size={26} color={COLORS.textMain} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* NATIONAL RISK CARD: Matching the 2nd screen in your image */}
        <View style={styles.nationalRiskCard}>
          <Text style={styles.cardLabel}>Current National Risk</Text>
          
          <View style={[styles.riskBadge, { backgroundColor: riskColor + "20" }]}>
            <Text style={[styles.riskText, { color: riskColor }]}>{risk.toUpperCase()}</Text>
          </View>

          <Text style={styles.mutedText}>
            Low landslide risk reported nationwide.
          </Text>

          <TouchableOpacity 
            style={styles.viewMapBtn}
            onPress={() => navigation.navigate("RealTimeMap")}
          >
            <Text style={styles.viewMapText}>View Detailed Map</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => navigation.navigate("SafetyTips")}>
            <Text style={styles.safetyLink}>Read Safety Guidelines</Text>
          </TouchableOpacity>
        </View>

        {/* QUICK ACTIONS: Matches the 4-button icons layout */}
        <View style={styles.actionRow}>
           <QuickAction title="SOS" icon="notifications-active" color={COLORS.danger} onPress={() => navigation.navigate("SOS")} />
           <QuickAction title="Alerts" icon="warning" color={COLORS.warning} onPress={() => navigation.navigate("Alerts")} />
           <QuickAction title="Map" icon="map" color={COLORS.primary} onPress={() => navigation.navigate("RealTimeMap")} />
           <QuickAction title="Safety" icon="lightbulb" color={COLORS.success} onPress={() => navigation.navigate("SafetyTips")} />
        </View>

        {/* LIVE MAP PREVIEW CARD */}
        <View style={styles.mapCard}>
          <View style={styles.mapHeader}>
            <Text style={styles.mapTitle}>Live Emergency Map</Text>
            <Ionicons name="expand-outline" size={18} color={COLORS.textMuted} />
          </View>
          
          <View style={styles.mapWrapper}>
            {loadingLocation ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : coords ? (
              <SafeMapView style={styles.map} region={{
                latitude: coords.latitude,
                longitude: coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }} />
            ) : (
              <Text style={styles.mutedText}>Location unavailable</Text>
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-component for icons
const QuickAction = ({ title, icon, color, onPress }) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress}>
    <View style={[styles.actionIconBox, { backgroundColor: color + "15" }]}>
      <MaterialIcons name={icon} size={28} color={color} />
    </View>
    <Text style={styles.actionLabel}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { color: COLORS.textMain, fontSize: 18, fontWeight: "700" },
  scrollContent: { paddingBottom: 40 },
  
  nationalRiskCard: {
    backgroundColor: COLORS.card,
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardLabel: { color: COLORS.textMuted, fontSize: 14, marginBottom: 12 },
  riskBadge: {
    paddingHorizontal: 50,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  riskText: { fontSize: 36, fontWeight: "900", letterSpacing: 1 },
  mutedText: { color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginBottom: 20 },
  
  viewMapBtn: {
    backgroundColor: COLORS.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 15,
  },
  viewMapText: { color: "#FFF", textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
  safetyLink: { color: COLORS.primary, fontSize: 13, textDecorationLine: 'underline' },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  actionItem: { alignItems: 'center' },
  actionIconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: { color: COLORS.textMuted, fontSize: 12, fontWeight: '600' },

  mapCard: {
    backgroundColor: COLORS.card,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: "#334155",
  },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
  mapTitle: { color: COLORS.textMain, fontWeight: '700' },
  mapWrapper: { height: 180, width: '100%', backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' },
  map: { width: '100%', height: '100%' },
});