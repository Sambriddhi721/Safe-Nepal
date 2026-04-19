import React, { useState, useContext, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  StatusBar, Switch, Alert, ActivityIndicator, 
  SafeAreaView, RefreshControl, ScrollView, Dimensions 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { io } from "socket.io-client"; // 1. Import Socket.io

import { AuthContext } from "../../context/AuthContext"; 
import { ThemeContext } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');
const SERVER_URL = "http://192.168.111.70:5000"; 

export default function PoliceDashboardScreen({ navigation }) {
  const { switchRole } = useContext(AuthContext) || {};
  const { theme } = useContext(ThemeContext) || { theme: 'dark' };
  const isDarkMode = theme === 'dark';
  
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sosData, setSosData] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // --- REAL-TIME LOGIC START ---
  useEffect(() => {
    // 2. Initialize Socket Connection
    const socket = io(SERVER_URL);

    socket.on("connect", () => console.log("Connected to Emergency Stream"));

    // 3. Listen for new reports (Ensure your backend emits "newReport")
    socket.on("newReport", (newIncident) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setSosData((prevData) => [newIncident, ...prevData]);
      
      // Optional: Show a subtle alert if the officer is on duty
      if (isOnDuty) {
        // You could add a Toast or Local Notification here
      }
    });

    return () => socket.disconnect();
  }, [isOnDuty]);
  // --- REAL-TIME LOGIC END ---

  const fetchTacticalData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/reports`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setSosData(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }
    } catch (error) {
      console.error("Data Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTacticalData();
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(clockTimer);
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchTacticalData();
  }, []);

  const handleDispatch = (item) => {
    if (!isOnDuty) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("Unit Offline", "Go On-Duty to respond to incidents.");
      return;
    }
    navigation.navigate('RealTimeMap', { emergencyItem: item, mode: 'POLICE' });
  };

  const QuickAction = ({ icon, label, color, onPress }) => (
    <TouchableOpacity style={styles.actionItem} onPress={onPress}>
      <View style={[styles.actionCircle, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
        <MaterialCommunityIcons name={icon} size={26} color={color} />
      </View>
      <Text style={[styles.actionLabel, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Service & Protect</Text>
            <Text style={[styles.title, { color: isDarkMode ? '#fff' : '#1e293b' }]}>
              Officer Terminal <Text style={{ color: '#3b82f6' }}>{currentTime}</Text>
            </Text>
          </View>
          <TouchableOpacity 
            onPress={() => switchRole?.('CITIZEN')}
            style={[styles.profileBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}
          >
            <Ionicons name="person-outline" size={22} color="#3b82f6" />
          </TouchableOpacity>
        </View>

        <LinearGradient
          colors={isOnDuty ? ['#3b82f6', '#1d4ed8'] : ['#475569', '#1e293b']}
          style={styles.statusHero}
        >
          <View style={styles.heroContent}>
            <View>
              <Text style={styles.heroStatusText}>{isOnDuty ? "Active Duty" : "Unit Standby"}</Text>
              <Text style={styles.heroSubText}>Sector: Kathmandu Central</Text>
            </View>
            <Switch 
              value={isOnDuty} 
              onValueChange={(v) => {
                setIsOnDuty(v);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              trackColor={{ false: "#94a3b8", true: "#fff" }}
              thumbColor={"#f8fafc"}
            />
          </View>
          
          <View style={styles.statsOverview}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{sosData.length}</Text>
              <Text style={styles.statLab}>Active Alerts</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>04</Text>
              <Text style={styles.statLab}>Nearby Units</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.actionRow}>
          <QuickAction icon="shield-search" label="Patrol" color="#3b82f6" onPress={() => {}} />
          <QuickAction icon="bullhorn-outline" label="Broadcast" color="#f59e0b" onPress={() => navigation.navigate("AlertScreen")} />
          <QuickAction icon="account-badge-outline" label="Volunteers" color="#10b981" onPress={() => navigation.navigate("Volunteer")} />
          <QuickAction icon="cog-outline" label="Settings" color="#64748b" onPress={() => navigation.navigate("PoliceSettings")} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1e293b' }]}>Incident Feed</Text>
          <TouchableOpacity onPress={() => fetchTacticalData()}>
            <Text style={styles.seeAll}>Refresh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.feedContainer}>
          {loading && <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />}
          
          {!loading && sosData.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#94a3b8" />
              <Text style={styles.emptyStateText}>All Sectors Clear</Text>
            </View>
          )}

          {sosData.map((item, index) => (
            <TouchableOpacity 
              key={item._id || index} // Use unique ID from DB if possible
              style={[styles.incidentCard, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}
              onPress={() => handleDispatch(item)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: item.severity === 'High' ? '#fee2e2' : '#fef3c7' }]}>
                <MaterialCommunityIcons 
                  name={item.severity === 'High' ? "alert-octagon" : "alert-circle"} 
                  size={24} 
                  color={item.severity === 'High' ? "#ef4444" : "#f59e0b"} 
                />
              </View>
              <View style={styles.incidentInfo}>
                <View style={styles.incidentHeader}>
                  <Text style={[styles.incidentCategory, { color: isDarkMode ? '#fff' : '#1e293b' }]}>{item.category}</Text>
                  <Text style={styles.incidentTime}>{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                </View>
                <Text style={styles.incidentLocation} numberOfLines={1}>📍 {item.location}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>RESPOND</Text>
                  <Ionicons name="chevron-forward" size={12} color="#3b82f6" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  greeting: { color: '#64748b', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: '800' },
  profileBtn: {
    padding: 10,
    borderRadius: 50,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHero: {
    margin: 20,
    borderRadius: 24,
    padding: 20,
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  heroStatusText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  heroSubText: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' },
  statsOverview: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 15,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { color: '#fff', fontSize: 18, fontWeight: '800' },
  statLab: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 5 },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  actionItem: { alignItems: 'center', width: (width - 40) / 4 },
  actionCircle: {
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
  },
  actionLabel: { fontSize: 11, fontWeight: '700' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  seeAll: { color: '#3b82f6', fontWeight: '700' },
  feedContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  incidentCard: {
    flexDirection: 'row',
    padding: 15,
    borderRadius: 20,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  incidentInfo: { flex: 1 },
  incidentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  incidentCategory: { fontSize: 15, fontWeight: '700' },
  incidentTime: { color: '#94a3b8', fontSize: 12 },
  incidentLocation: { color: '#64748b', fontSize: 13, marginBottom: 8 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f615',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: { color: '#3b82f6', fontSize: 10, fontWeight: '800', marginRight: 4 },
  emptyState: { alignItems: 'center', marginTop: 30 },
  emptyStateText: { color: '#94a3b8', marginTop: 10, fontWeight: '600' },
});