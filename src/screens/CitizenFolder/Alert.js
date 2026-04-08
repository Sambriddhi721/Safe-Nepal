import React, { useContext, useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  StatusBar, ActivityIndicator, RefreshControl 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// Context Imports
import { ThemeContext } from "../../context/ThemeContext";

const SERVER_URL = "http://192.168.111.70:5000"; 

export default function AlertScreen({ navigation }) {
  const { theme } = useContext(ThemeContext) || {};
  const isDarkMode = theme === 'dark';

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch Active Public Alerts
  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/reports`); // Using your existing endpoint
      const data = await response.json();
      // Filter for high severity or public broadcasts if your backend supports it
      setAlerts(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
    } catch (error) {
      console.error("Alert Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAlerts();
  };

  // 2. Render Alert Item
  const renderAlertItem = ({ item }) => {
    const isHighRisk = item.severity === "High" || item.category === "Flood";

    return (
      <View style={[styles.alertCard, { backgroundColor: isDarkMode ? "#1e293b" : "#ffffff" }]}>
        <View style={[styles.statusIndicator, { backgroundColor: isHighRisk ? "#ef4444" : "#f59e0b" }]} />
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.categoryBadge}>
              <MaterialCommunityIcons 
                name={isHighRisk ? "alert-decagram" : "information-outline"} 
                size={16} 
                color={isHighRisk ? "#ef4444" : "#f59e0b"} 
              />
              <Text style={[styles.categoryText, { color: isHighRisk ? "#ef4444" : "#f59e0b" }]}>
                {item.category?.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.timeText}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>

          <Text style={[styles.locationText, { color: isDarkMode ? "#F1F5F9" : "#0f172a" }]}>
            {item.location}
          </Text>
          
          <Text style={styles.descriptionText} numberOfLines={2}>
            {item.description || "Active risk detected in this sector. Exercise caution and follow local safety protocols."}
          </Text>

          <TouchableOpacity 
            style={styles.detailsBtn}
            onPress={() => navigation.navigate("AlertDetails", { alert: item })}
          >
            <Text style={styles.detailsBtnText}>View Safety Map</Text>
            <Ionicons name="arrow-forward" size={14} color="#3b82f6" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#020617" : "#f8fafc" }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Emergency Alerts</Text>
            <Text style={styles.headerSub}>Real-time updates for Kathmandu</Text>
          </View>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={styles.loadingText}>Scanning for risks...</Text>
          </View>
        ) : (
          <FlatList
            data={alerts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderAlertItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="shield-check-outline" size={60} color="#10b981" />
                <Text style={styles.emptyTitle}>All Sectors Clear</Text>
                <Text style={styles.emptySub}>No active floods or landslides reported.</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { marginRight: 15, padding: 5 },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  headerSub: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  listContent: { padding: 20, paddingBottom: 40 },
  alertCard: { borderRadius: 20, marginBottom: 16, flexDirection: 'row', overflow: 'hidden', elevation: 3, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  statusIndicator: { width: 6 },
  cardContent: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  categoryBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  categoryText: { fontSize: 10, fontWeight: '900', marginLeft: 4 },
  timeText: { fontSize: 11, color: '#64748b', fontWeight: '700' },
  locationText: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  descriptionText: { fontSize: 13, color: '#94a3b8', lineHeight: 18, marginBottom: 12 },
  detailsBtn: { flexDirection: 'row', alignItems: 'center' },
  detailsBtnText: { color: '#3b82f6', fontWeight: '800', fontSize: 13, marginRight: 5 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, color: '#64748b', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#10b981', marginTop: 15 },
  emptySub: { fontSize: 14, color: '#64748b', textAlign: 'center', marginTop: 5, paddingHorizontal: 40 }
});