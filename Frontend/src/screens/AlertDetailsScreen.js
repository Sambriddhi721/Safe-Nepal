import React from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  SafeAreaView,
  Platform 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import SafeMapView from "../components/SafeMapView"; // Ensure this path is correct

const { width } = Dimensions.get("window");

export default function AlertDetailsScreen({ route, navigation }) {
  // Capture the data passed from the AlertScreen list
  const { alert } = route.params || {};

  // Fallback if no data is passed to prevent crashes
  if (!alert) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No Alert Data Found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={{ color: '#fff' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isActive = alert.status === "Active";

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconCircle}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Alert Details</Text>
          <TouchableOpacity style={styles.iconCircle}>
            <Ionicons name="share-social-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Map Section */}
        <View style={styles.mapContainer}>
          <SafeMapView
            style={styles.map}
            region={{
              latitude: alert.lat || 27.7172, 
              longitude: alert.lng || 85.324,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
          />
          <View style={styles.mapOverlay}>
            <Ionicons name="location" size={16} color="#ff4d4d" />
            <Text style={styles.locationTag}>{alert.location}</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, { backgroundColor: `${alert.color}22`, borderColor: alert.color }]}>
              <View style={[styles.dot, { backgroundColor: alert.color }]} />
              <Text style={[styles.badgeText, { color: alert.color }]}>
                {alert.severity} Risk {alert.type}
              </Text>
            </View>
            <Text style={styles.timeText}>
              {isActive ? `Updated ${alert.time}` : `Recorded ${alert.time}`}
            </Text>
          </View>

          <Text style={styles.mainTitle}>{alert.title}</Text>
          <Text style={styles.description}>
            {isActive 
              ? `Emergency services have flagged ${alert.location} due to high-risk ${alert.type.toLowerCase()} conditions. Local residents are advised to maintain high vigilance and monitor local news outlets.`
              : `This is a historical record of a ${alert.type.toLowerCase()} event in ${alert.location}. The alert is no longer active, but terrain stability should still be considered.`}
          </Text>
        </View>

        {/* Safety Instructions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Safety Instructions</Text>
            <MaterialCommunityIcons name="shield-check" size={20} color="#1e90ff" />
          </View>
          
          <View style={styles.instructionCard}>
            <InstructionRow 
              icon="home-variant-outline" 
              text="Move to higher ground or designated safe zones immediately." 
            />
            {alert.type === "Flood" ? (
              <InstructionRow 
                icon="water-off" 
                text="Avoid walking or driving through flood waters." 
              />
            ) : (
              <InstructionRow 
                icon="terrain" 
                text="Stay clear of steep slopes, canyons, and drainage ways." 
              />
            )}
            <InstructionRow 
              icon="flashlight" 
              text="Ensure your emergency kit and power banks are fully charged." 
            />
            <InstructionRow 
              icon="radio-handheld" 
              text="Listen to local authorities and evacuation orders." 
            />
          </View>
        </View>

        {/* Action Buttons - Only show for Active alerts */}
        {isActive && (
          <View style={styles.actionContainer}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.callBtn]}
              onPress={() => {/* Add Linking.openURL('tel:100') */}}
            >
              <Ionicons name="call" size={20} color="#fff" />
              <Text style={styles.btnText}>Call Rescue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, styles.sosBtn]}
              onPress={() => navigation.navigate("SOS")}
            >
              <MaterialIcons name="sos" size={26} color="#fff" />
              <Text style={styles.btnText}>SOS Broadcast</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

// Sub-component for Instruction Rows
const InstructionRow = ({ icon, text }) => (
  <View style={styles.instructionRow}>
    <View style={styles.iconBackground}>
      <MaterialCommunityIcons name={icon} size={20} color="#1e90ff" />
    </View>
    <Text style={styles.instructionText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  errorContainer: { flex: 1, backgroundColor: "#0f2027", justifyContent: "center", alignItems: "center" },
  errorText: { color: "#fff", fontSize: 18, marginBottom: 20 },
  backBtn: { backgroundColor: "#1e90ff", padding: 10, borderRadius: 8 },
  
  header: { 
    backgroundColor: "transparent",
    paddingTop: Platform.OS === "android" ? 40 : 0 
  },
  headerContent: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  mapContainer: { height: 280, width: '100%', position: 'relative' },
  map: { flex: 1 },
  mapOverlay: { 
    position: 'absolute', 
    bottom: 20, 
    left: 20, 
    backgroundColor: '#111827', 
    paddingHorizontal: 15, 
    paddingVertical: 10, 
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151',
    elevation: 5
  },
  locationTag: { color: '#fff', fontWeight: '600', marginLeft: 8 },

  infoCard: { padding: 25, backgroundColor: '#111827', borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  badge: { 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 12, 
    borderWidth: 1, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  badgeText: { fontWeight: '700', fontSize: 12 },
  timeText: { color: '#9ca3af', fontSize: 12 },
  mainTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginBottom: 12 },
  description: { color: '#9ca3af', fontSize: 15, lineHeight: 24 },

  section: { padding: 25 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginRight: 10 },
  instructionCard: { backgroundColor: '#111827', padding: 20, borderRadius: 20 },
  instructionRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 },
  iconBackground: { 
    backgroundColor: 'rgba(30, 144, 255, 0.1)', 
    padding: 8, 
    borderRadius: 10,
    marginRight: 15 
  },
  instructionText: { color: '#d1d5db', fontSize: 14, flex: 1, lineHeight: 20 },

  actionContainer: { 
    paddingHorizontal: 25, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10 
  },
  actionBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 16, 
    borderRadius: 15, 
    width: '48%',
    elevation: 3
  },
  callBtn: { backgroundColor: '#1f2937', borderWidth: 1, borderColor: '#374151' },
  sosBtn: { backgroundColor: '#FF4D4D' },
  btnText: { color: '#fff', fontWeight: 'bold', marginLeft: 10, fontSize: 14 }
});