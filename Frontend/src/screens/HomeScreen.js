import React, { useEffect, useRef, useState, useContext } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Animated, StatusBar, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
// Import your Context
import { ThemeContext } from "../context/ThemeContext"; 

const { width } = Dimensions.get("window");

const ActionItem = ({ title, icon, color, onPress, colors, isMaterial = true }) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress}>
    {/* Using card color for icon circle background to make it pop in dark/light */}
    <View style={[styles.iconCircle, { backgroundColor: colors.card, shadowColor: color }]}>
      {isMaterial ? <MaterialIcons name={icon} size={26} color={color} /> : <FontAwesome5 name={icon} size={22} color={color} />}
    </View>
    <Text style={[styles.actionText, { color: colors.text }]}>{title}</Text>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation }) {
  // 1. Consume the Theme Context
  const { theme, colors } = useContext(ThemeContext);
  
  const blinkAnim = useRef(new Animated.Value(0.3)).current;
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({ location: "Chandragiri", temp: "--", condition: "Loading..." });

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Chandragiri&appid=3b2556b5414e1a2fb4f739c28ae3bc1b&units=metric`);
        const data = await res.json();
        if (data.main) setWeather({ location: data.name, temp: Math.round(data.main.temp), condition: data.weather[0].description.toUpperCase() });
      } catch (e) { console.error(e); } finally { setLoading(false); }
    };
    fetchWeather();

    Animated.loop(Animated.sequence([
      Animated.timing(blinkAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(blinkAnim, { toValue: 0.2, duration: 800, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* 2. Update LinearGradient and StatusBar based on theme */}
      <LinearGradient colors={[colors.background, theme === 'dark' ? "#111827" : "#e5e7eb"]} style={styles.container}>
        <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} />
        
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={24} color={colors.text} />
            <Text style={[styles.navTitle, { color: colors.text }]}>Safe Nepal</Text>
            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
              <Ionicons name="person-circle" size={32} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Weather Card */}
          <View style={[styles.weatherCard, { backgroundColor: colors.card }]}>
            {loading ? <ActivityIndicator color={colors.primary} size="small" /> : (
              <View style={styles.weatherRow}>
                <View>
                  <View style={styles.locationRow}>
                    <Ionicons name="location-sharp" size={16} color={colors.primary} />
                    <Text style={[styles.locationText, { color: colors.primary }]}>{weather.location}</Text>
                  </View>
                  <Text style={[styles.conditionText, { color: colors.subText }]}>{weather.condition}</Text>
                </View>
                <Text style={[styles.tempText, { color: colors.text }]}>{weather.temp}°C</Text>
              </View>
            )}
          </View>

          {/* Main Risk Display */}
          <View style={[styles.mainRiskCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.riskLabel, { color: colors.subText }]}>Current National Risk</Text>
            <Animated.View style={[styles.lowBadge, { opacity: blinkAnim }]}><Text style={styles.lowText}>LOW</Text></Animated.View>
            <Text style={[styles.riskDescription, { color: colors.subText }]}>Status: Secure. All factors are safe.</Text>
          </View>

          {/* Emergency Grid */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Services</Text>
          <View style={styles.grid}>
            <ActionItem title="SOS" icon="notifications-active" color="#F87171" colors={colors} onPress={() => navigation.navigate("SOSScreen")} />
            <ActionItem title="Alerts" icon="warning" color="#FBBF24" colors={colors} onPress={() => navigation.navigate("AlertScreen")} />
            <ActionItem title="Predict" icon="insert-chart-outlined" color="#A78BFA" colors={colors} onPress={() => navigation.navigate("PredictionAnalyticsScreen")} />
            <ActionItem title="Relief" icon="home" color="#60A5FA" colors={colors} onPress={() => navigation.navigate("ReliefCenterScreen")} />
            <ActionItem title="Contacts" icon="contact-phone" color="#94A3B8" colors={colors} onPress={() => navigation.navigate("EmergencyContactsScreen")} />
            <ActionItem title="Safety" icon="lightbulb" color="#34D399" colors={colors} onPress={() => navigation.navigate("SafetyTipsScreen")} />
            <ActionItem title="History" icon="history" color="#2DD4BF" colors={colors} onPress={() => navigation.navigate("History")} />
            <ActionItem title="Map" icon="map" color="#2196F3" colors={colors} onPress={() => navigation.navigate("RealTimeMap")} />
            <ActionItem title="About" icon="info-outline" color="#8A9AA4" colors={colors} onPress={() => navigation.navigate("About")} />
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      </LinearGradient>

      {/* FLOATING REPORT BUTTON */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate("NewReport")}
      >
        <LinearGradient colors={["#FF4D4D", "#D32F2F"]} style={styles.fabGradient}>
          <MaterialIcons name="report-problem" size={32} color="#fff" />
          <Text style={styles.fabText}>REPORT</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  navTitle: { fontSize: 18, fontWeight: "bold", flex: 1, textAlign: 'center' },
  weatherCard: { marginHorizontal: 20, borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2 },
  weatherRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  locationText: { fontSize: 16, fontWeight: '600', marginLeft: 4 },
  tempText: { fontSize: 44, fontWeight: 'bold' },
  conditionText: { fontSize: 14 },
  mainRiskCard: { marginHorizontal: 20, borderRadius: 24, padding: 25, alignItems: "center", elevation: 2 },
  riskLabel: { fontSize: 14, marginBottom: 15 },
  lowBadge: { backgroundColor: "rgba(57, 255, 20, 0.05)", paddingHorizontal: 50, paddingVertical: 14, borderRadius: 18, marginBottom: 15, borderWidth: 2, borderColor: "#39FF14" },
  lowText: { color: "#39FF14", fontSize: 36, fontWeight: "900" },
  riskDescription: { fontSize: 13, textAlign: "center" },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginHorizontal: 20, marginTop: 30, marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 15 },
  actionItem: { width: (width - 30) / 3, alignItems: "center", marginBottom: 25 },
  iconCircle: { width: 68, height: 68, borderRadius: 22, justifyContent: "center", alignItems: "center", marginBottom: 10, elevation: 4 },
  actionText: { fontSize: 13, fontWeight: "600" },
  fab: { position: 'absolute', bottom: 35, right: 25, width: 85, height: 85, borderRadius: 42.5, elevation: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 5 },
  fabGradient: { flex: 1, borderRadius: 42.5, justifyContent: 'center', alignItems: 'center' },
  fabText: { color: "#fff", fontSize: 11, fontWeight: "900", marginTop: 2 }
});