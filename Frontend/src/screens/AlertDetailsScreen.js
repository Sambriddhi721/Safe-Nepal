import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import SafeMapView from "../components/SafeMapView"; // Assuming this is your map component

const { width } = Dimensions.get("window");

export default function AlertDetailsScreen({ route, navigation }) {
  // In a real app, you'd fetch details using the alertId from route.params
  // const { alertId } = route.params;

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alert Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-social-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 1. MAP SECTION */}
        <View style={styles.mapContainer}>
          <SafeMapView
            style={styles.map}
            region={{
              latitude: 27.7172, // Example: Kathmandu/Sindhupalchok area
              longitude: 85.324,
              latitudeDelta: 0.1,
              longitudeDelta: 0.1,
            }}
          />
          <View style={styles.mapOverlay}>
            <Text style={styles.locationTag}>Sindhupalchok District</Text>
          </View>
        </View>

        {/* 2. MAIN ALERT INFO */}
        <View style={styles.infoCard}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: "#FF4D4D22", borderColor: "#FF4D4D" }]}>
              <Text style={[styles.badgeText, { color: "#FF4D4D" }]}>High Risk</Text>
            </View>
            <Text style={styles.timeText}>Updated 5 mins ago</Text>
          </View>

          <Text style={styles.mainTitle}>Flash Flood Warning</Text>
          <Text style={styles.description}>
            Significant rainfall has caused the Bhotekoshi river level to rise beyond the danger mark. 
            Flash flooding is expected in low-lying areas within the next 2-4 hours.
          </Text>
        </View>

        {/* 3. HOURLY RISK FORECAST (Visual Mockup) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7-Hour Risk Forecast</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastRow}>
            <ForecastItem time="1PM" risk="Low" color="#4CD964" />
            <ForecastItem time="2PM" risk="Med" color="#FFB020" />
            <ForecastItem time="3PM" risk="High" color="#FF4D4D" active />
            <ForecastItem time="4PM" risk="High" color="#FF4D4D" />
            <ForecastItem time="5PM" risk="Med" color="#FFB020" />
            <ForecastItem time="6PM" risk="Low" color="#4CD964" />
          </ScrollView>
        </View>

        {/* 4. SAFETY INSTRUCTIONS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Safety Instructions</Text>
          <View style={styles.instructionCard}>
            <InstructionRow icon="home-variant-outline" text="Move to higher ground immediately." />
            <InstructionRow icon="water-off" text="Avoid crossing rivers or flooded streams." />
            <InstructionRow icon="flashlight" text="Keep your emergency kit and flashlight ready." />
            <InstructionRow icon="phone-in-talk" text="Stay tuned to local news or radio for updates." />
          </View>
        </View>

        {/* 5. EMERGENCY ACTION BUTTONS */}
        <View style={styles.actionContainer}>
          <TouchableOpacity style={[styles.actionBtn, styles.callBtn]}>
            <Ionicons name="call" size={20} color="#fff" />
            <Text style={styles.btnText}>Call Rescue (100)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.sosBtn]}>
            <MaterialIcons name="sos" size={24} color="#fff" />
            <Text style={styles.btnText}>Broadcast SOS</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

// Sub-components
const ForecastItem = ({ time, risk, color, active }) => (
  <View style={[styles.forecastBox, active && styles.activeForecast]}>
    <Text style={styles.forecastTime}>{time}</Text>
    <View style={[styles.riskDot, { backgroundColor: color }]} />
    <Text style={[styles.forecastRisk, { color: color }]}>{risk}</Text>
  </View>
);

const InstructionRow = ({ icon, text }) => (
  <View style={styles.instructionRow}>
    <MaterialIcons name={icon} size={22} color="#1e90ff" />
    <Text style={styles.instructionText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 100,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  mapContainer: { height: 250, width: '100%', position: 'relative' },
  map: { flex: 1 },
  mapOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(17, 24, 39, 0.9)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  locationTag: { color: '#fff', fontWeight: '600' },
  infoCard: { padding: 20, backgroundColor: '#111827' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  badgeText: { fontWeight: '700', fontSize: 12 },
  timeText: { color: '#9ca3af', fontSize: 12 },
  mainTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  description: { color: '#9ca3af', fontSize: 15, lineHeight: 22 },
  section: { padding: 20 },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  forecastRow: { flexDirection: 'row' },
  forecastBox: { 
    alignItems: 'center', 
    backgroundColor: '#1f2937', 
    padding: 12, 
    borderRadius: 12, 
    marginRight: 10,
    width: 70 
  },
  activeForecast: { borderWidth: 1, borderColor: '#1e90ff' },
  forecastTime: { color: '#fff', fontSize: 12, marginBottom: 8 },
  riskDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 5 },
  forecastRisk: { fontSize: 12, fontWeight: 'bold' },
  instructionCard: { backgroundColor: '#111827', padding: 15, borderRadius: 15 },
  instructionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  instructionText: { color: '#d1d5db', marginLeft: 15, fontSize: 14, flex: 1 },
  actionContainer: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 15, 
    borderRadius: 12, 
    width: '48%' 
  },
  callBtn: { backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#374151' },
  sosBtn: { backgroundColor: '#FF4D4D' },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 8, fontSize: 13 }
});