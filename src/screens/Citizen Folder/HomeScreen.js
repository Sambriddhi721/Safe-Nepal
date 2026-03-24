import React, { useEffect, useRef, useState, useContext, useCallback } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, Dimensions, 
  ScrollView, Animated, StatusBar, ActivityIndicator 
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { 
  Ionicons, 
  MaterialIcons, 
  FontAwesome5, 
  MaterialCommunityIcons 
} from "@expo/vector-icons";

// Context Providers
import { ThemeContext } from "../../context/ThemeContext"; 
import { AuthContext } from "../../context/AuthContext"; 

const { width } = Dimensions.get("window");

const ActionItem = ({ title, icon, color, onPress, colors, iconFamily = "material" }) => (
  <TouchableOpacity style={styles.actionItem} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: colors.card, shadowColor: color }]}>
      {iconFamily === "material" && <MaterialIcons name={icon} size={26} color={color} />}
      {iconFamily === "fontAwesome" && <FontAwesome5 name={icon} size={22} color={color} />}
      {iconFamily === "community" && <MaterialCommunityIcons name={icon} size={26} color={color} />}
      {iconFamily === "ionicons" && <Ionicons name={icon} size={26} color={color} />}
    </View>
    <Text style={[styles.actionText, { color: colors.text }]} numberOfLines={1}>{title}</Text>
  </TouchableOpacity>
);

export default function HomeScreen({ navigation, route }) {
  const { theme, colors } = useContext(ThemeContext);
  const { userRole } = useContext(AuthContext); 
  
  const [userMode, setUserMode] = useState(route.params?.screenMode || userRole || 'CITIZEN'); 

  const blinkAnim = useRef(new Animated.Value(0.3)).current;
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState({ 
    location: "Chandragiri", 
    temp: "--", 
    condition: "Loading..." 
  });

  useFocusEffect(
    useCallback(() => {
      if (route.params?.screenMode) {
        setUserMode(route.params.screenMode);
      }
    }, [route.params?.screenMode])
  );

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Chandragiri&appid=3b2556b5414e1a2fb4f739c28ae3bc1b&units=metric`
        );
        const data = await res.json();
        if (data.main) {
          setWeather({ 
            location: data.name, 
            temp: Math.round(data.main.temp), 
            condition: data.weather[0].description.toUpperCase() 
          });
        }
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchWeather();

    Animated.loop(
      Animated.sequence([
        Animated.timing(blinkAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 0.3, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, [blinkAnim]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <LinearGradient colors={[colors.background, theme === 'dark' ? "#111827" : "#f3f4f6"]} style={styles.container}>
        <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} />
        
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
               <Ionicons 
                  name={userMode === 'RESPONDER' ? "shield-half" : "shield-checkmark"} 
                  size={26} 
                  color={userMode === 'RESPONDER' ? "#3b82f6" : colors.text} 
               />
               <Text style={[styles.navTitle, { color: colors.text }]}>
                  {userMode === 'RESPONDER' ? "Responder" : "Safe Nepal"}
               </Text>
            </View>
            
            <View style={styles.headerRight}>
               <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                  <Ionicons name="person-circle" size={32} color={colors.text} />
               </TouchableOpacity>
            </View>
          </View>

          {/* WEATHER SECTION */}
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

          {/* DYNAMIC TOP SECTION */}
          {userMode === 'RESPONDER' ? (
              <View style={styles.statsRow}>
                <View style={[styles.statBox, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: '#ef4444' }]}>
                    <Text style={[styles.statNum, { color: '#ef4444' }]}>03</Text>
                    <Text style={[styles.statLabel, { color: colors.subText }]}>Active SOS</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: colors.card, borderLeftWidth: 4, borderLeftColor: '#3b82f6' }]}>
                    <Text style={[styles.statNum, { color: '#3b82f6' }]}>12</Text>
                    <Text style={[styles.statLabel, { color: colors.subText }]}>Reports</Text>
                </View>
              </View>
          ) : (
            <TouchableOpacity 
              activeOpacity={0.9} 
              onPress={() => navigation.navigate("Analytics")} 
              style={[styles.mainRiskCard, { backgroundColor: colors.card }]}
            >
                <Text style={[styles.riskLabel, { color: colors.subText }]}>Current National Risk</Text>
                <Animated.View style={[styles.lowBadge, { opacity: blinkAnim }]}>
                   <Text style={styles.lowText}>LOW</Text>
                </Animated.View>
                <Text style={[styles.riskDescription, { color: colors.subText }]}>
                  Status: Secure. Tap to view detailed AI forecast.
                </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {userMode === 'RESPONDER' ? "Responder Tools" : "Emergency Services"}
          </Text>

          {/* GRID MENU */}
          <View style={styles.grid}>
            {userMode === 'RESPONDER' ? (
              <>
                <ActionItem title="SOS Feed" icon="shield-alert" iconFamily="community" color="#ef4444" colors={colors} onPress={() => navigation.navigate("Alerts")} />
                <ActionItem title="Patrol" icon="map-marker-radius" iconFamily="community" color="#3b82f6" colors={colors} onPress={() => navigation.navigate("RealTimeMap")} />
                <ActionItem title="Dashboard" icon="dashboard" iconFamily="material" color="#6366f1" colors={colors} onPress={() => navigation.navigate("PoliceDashboard")} />
                <ActionItem title="Risk Data" icon="insert-chart-outlined" color="#A78BFA" colors={colors} onPress={() => navigation.navigate("Analytics")} />
                <ActionItem title="Volunteer" icon="people" iconFamily="material" color="#2DD4BF" colors={colors} onPress={() => navigation.navigate("Volunteer")} />
                <ActionItem title="Settings" icon="settings" iconFamily="material" color="#94a3b8" colors={colors} onPress={() => navigation.navigate("AccountSettings")} />
              </>
            ) : (
              <>
                {/* Citizens Row 1 */}
                <ActionItem title="SOS" icon="notifications-active" color="#F87171" colors={colors} onPress={() => navigation.navigate("SOSScreen")} />
                {/* ✅ FIX: Matches Stack.Screen name="Alerts" */}
                <ActionItem title="Alerts" icon="warning" color="#FBBF24" colors={colors} onPress={() => navigation.navigate("Alerts")} />
                <ActionItem title="Forecast" icon="auto-graph" iconFamily="material" color="#A78BFA" colors={colors} onPress={() => navigation.navigate("Analytics")} />
                
                {/* Citizens Row 2 */}
                <ActionItem title="Relief" icon="home" color="#60A5FA" colors={colors} onPress={() => navigation.navigate("ReliefCenter")} />
                <ActionItem title="Map" icon="map" color="#2196F3" colors={colors} onPress={() => navigation.navigate("GeneralMap")} />
                <ActionItem title="History" icon="history" color="#2DD4BF" colors={colors} onPress={() => navigation.navigate("History")} />
                
                {/* Citizens Row 3 */}
                <ActionItem title="Contacts" icon="contact-phone" color="#94A3B8" colors={colors} onPress={() => navigation.navigate("EmergencyContacts")} />
                <ActionItem title="Safety" icon="lightbulb" color="#34D399" colors={colors} onPress={() => navigation.navigate("SafetyTips")} />
                <ActionItem title="First Aid" icon="medical-bag" iconFamily="community" color="#EF4444" colors={colors} onPress={() => navigation.navigate("FirstAidScreen")} />
              </>
            )}
          </View>
        </ScrollView>
      </LinearGradient>

      {/* FAB */}
      {userMode !== 'RESPONDER' && (
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("NewReport")} activeOpacity={0.8}>
            <LinearGradient colors={["#FF4D4D", "#D32F2F"]} style={styles.fabGradient}>
                <MaterialIcons name="report-problem" size={32} color="#fff" />
                <Text style={styles.fabText}>REPORT</Text>
            </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ... styles remain the same ...
const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  navTitle: { fontSize: 20, fontWeight: "bold", marginLeft: 10 },
  weatherCard: { marginHorizontal: 20, borderRadius: 24, padding: 20, marginBottom: 20, elevation: 3 },
  weatherRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  locationText: { fontSize: 16, fontWeight: '700', marginLeft: 4 },
  tempText: { fontSize: 42, fontWeight: 'bold' },
  conditionText: { fontSize: 13, textTransform: 'capitalize' },
  mainRiskCard: { marginHorizontal: 20, borderRadius: 28, padding: 25, alignItems: "center", elevation: 2 },
  riskLabel: { fontSize: 12, fontWeight: '600', marginBottom: 12, letterSpacing: 1 },
  lowBadge: { backgroundColor: "rgba(57, 255, 20, 0.1)", paddingHorizontal: 40, paddingVertical: 12, borderRadius: 20, marginBottom: 15, borderWidth: 1.5, borderColor: "#39FF14" },
  lowText: { color: "#39FF14", fontSize: 32, fontWeight: "900" },
  riskDescription: { fontSize: 13, textAlign: "center", opacity: 0.8 },
  sectionTitle: { fontSize: 19, fontWeight: "bold", marginHorizontal: 20, marginTop: 30, marginBottom: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 10, justifyContent: 'center' },
  actionItem: { width: width / 3 - 10, alignItems: "center", marginBottom: 20 },
  iconCircle: { width: 66, height: 66, borderRadius: 24, justifyContent: "center", alignItems: "center", marginBottom: 8, elevation: 5, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 5 },
  actionText: { fontSize: 12, fontWeight: "700", textAlign: 'center' },
  fab: { position: 'absolute', bottom: 30, right: 25, width: 85, height: 85, borderRadius: 42.5, elevation: 15 },
  fabGradient: { flex: 1, borderRadius: 42.5, justifyContent: 'center', alignItems: 'center' },
  fabText: { color: "#fff", fontSize: 11, fontWeight: "900", marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginHorizontal: 20 },
  statBox: { width: '47%', padding: 20, borderRadius: 22, alignItems: 'center', elevation: 3 },
  statNum: { fontSize: 32, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 4, fontWeight: '600' }
});