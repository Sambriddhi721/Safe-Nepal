import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const ActionItem = ({ title, icon, color, onPress, isMaterial = true }) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: color + "15" }]}>
      {isMaterial ? (
        <MaterialIcons name={icon} size={24} color={color} />
      ) : (
        <FontAwesome5 name={icon} size={20} color={color} />
      )}
    </View>
    <Text style={styles.actionText}>{title}</Text>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  const blinkAnim = useRef(new Animated.Value(0.4)).current;

  // SAFETY NAVIGATION FUNCTION
  const safeNavigate = (screenName) => {
    if (navigation && screenName) {
      try {
        navigation.navigate(screenName);
      } catch (err) {
        console.warn(`Navigation to ${screenName} failed. Check App.js names.`);
      }
    }
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(blinkAnim, {
          toValue: 0.4,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [blinkAnim]);

  return (
    <LinearGradient colors={["#101828", "#111827"]} style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="shield-checkmark-outline" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Nepal Disaster Watch</Text>
          <TouchableOpacity onPress={() => safeNavigate("Profile")}>
            <Ionicons name="person-circle" size={32} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.mainRiskCard}>
          <Text style={styles.riskLabel}>Current National Risk</Text>
          <Animated.View style={[styles.lowBadge, { opacity: blinkAnim }]}>
            <Text style={styles.lowText}>LOW</Text>
          </Animated.View>
          <Text style={styles.riskDescription}>
            Current weather patterns indicate low risk levels.
          </Text>
          <TouchableOpacity 
            style={styles.mapButton}
            onPress={() => safeNavigate("RealTimeMapScreen")}
          >
            <Text style={styles.mapButtonText}>View Detailed Map</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Emergency Services</Text>
        <View style={styles.grid}>
          <ActionItem title="SOS" icon="notifications-active" color="#F87171" onPress={() => safeNavigate("SOSScreen")} />
          <ActionItem title="Alerts" icon="warning" color="#FBBF24" onPress={() => safeNavigate("AlertScreen")} />
          <ActionItem title="Predict" icon="insert-chart-outlined" color="#A78BFA" onPress={() => safeNavigate("PredictionAnalyticsScreen")} />
          <ActionItem title="Relief" icon="home" color="#60A5FA" onPress={() => safeNavigate("ReliefCenterScreen")} />
          <ActionItem title="Contacts" icon="contact-phone" color="#94A3B8" onPress={() => safeNavigate("EmergencyContactsScreen")} />
          <ActionItem title="Safety" icon="lightbulb" color="#34D399" onPress={() => safeNavigate("SafetyTipsScreen")} />
        </View>

        <View style={styles.mapPreviewSection}>
            <View style={styles.mapHeader}>
                <Text style={styles.liveTitle}>Live Emergency</Text>
                <MaterialIcons name="fullscreen" size={20} color="#94a3b8" />
            </View>
            <View style={styles.mapPlaceholder}>
                <MaterialIcons name="location-on" size={30} color="#ef4444" />
                <Text style={styles.mapCoords}>Map View</Text>
                <Text style={styles.mapSubCoords}>27.7009, 85.2556</Text>
                <Text style={styles.apiKeyText}>Google Maps API key required</Text>
            </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  navTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  
  mainRiskCard: {
    backgroundColor: "#1F2937",
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 25,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },
  riskLabel: { color: "#9CA3AF", fontSize: 14, marginBottom: 15 },
  lowBadge: {
    backgroundColor: "#064E3B",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 15,
  },
  lowText: { color: "#10B981", fontSize: 32, fontWeight: "bold", letterSpacing: 2 },
  riskDescription: { color: "#9CA3AF", fontSize: 13, textAlign: "center", marginBottom: 20 },
  mapButton: {
    backgroundColor: "#FBBF24",
    width: '100%',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  mapButtonText: { color: "#000", fontWeight: "bold", fontSize: 16 },

  sectionTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginHorizontal: 20, marginTop: 25, marginBottom: 15 },
  
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  actionItem: {
    width: (width - 60) / 3,
    alignItems: "center",
    marginBottom: 20,
  },
  iconCircle: { 
    width: 65, 
    height: 65, 
    borderRadius: 20, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 8,
    backgroundColor: '#1f2937' 
  },
  actionText: { color: "#94A3B8", fontSize: 13, fontWeight: "500" },

  mapPreviewSection: { marginHorizontal: 20, marginTop: 10, marginBottom: 30 },
  mapHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  liveTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  mapPlaceholder: {
    backgroundColor: "#F9FAFB",
    height: 180,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  mapCoords: { fontSize: 18, fontWeight: "bold", color: "#1F2937", marginTop: 5 },
  mapSubCoords: { color: "#6B7280", fontSize: 12 },
  apiKeyText: { color: "#9CA3AF", fontSize: 10, marginTop: 10 }
});