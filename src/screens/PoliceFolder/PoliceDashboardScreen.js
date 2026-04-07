import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  StatusBar, Switch, Alert, Platform, ActivityIndicator, 
  SafeAreaView, RefreshControl, ScrollView, Dimensions 
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';

// Contexts
import { AuthContext } from "../../context/AuthContext"; 
import { ThemeContext } from '../../context/ThemeContext';

const SERVER_URL = "http://192.168.111.70:5000"; 
const { width } = Dimensions.get('window');

export default function PoliceDashboardScreen({ navigation }) {
  const { user, role } = useContext(AuthContext) || {};
  const { theme } = useContext(ThemeContext) || { theme: 'dark' };
  const isDarkMode = theme === 'dark';
  const mapRef = useRef(null);
  
  // States
  const [activeTab, setActiveTab] = useState('FEED'); 
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sosData, setSosData] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // 1. Tactical Clock & Auto-Refresh
  useEffect(() => {
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);

    const dataTimer = setInterval(() => {
      if (isOnDuty) fetchTacticalData(false);
    }, 30000); // Auto-poll for new reports every 30s

    return () => {
      clearInterval(clockTimer);
      clearInterval(dataTimer);
    };
  }, [isOnDuty]);

  // 2. Permission & Initial Data
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location access is required for tactical dispatch.");
      } else {
        const loc = await Location.getCurrentPositionAsync({});
        setUserLocation(loc.coords);
      }
      fetchTacticalData();
    })();
  }, []);

  const fetchTacticalData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/reports`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setSosData(data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      }
    } catch (error) {
      console.error("Tactical Data Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fetchTacticalData();
  }, []);

  // 3. Dispatch Logic
  const handleDispatch = (item) => {
    if (!isOnDuty) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("OFF-DUTY", "You must be active to accept dispatch calls.");
      return;
    }
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "CONFIRM DISPATCH",
      `Initialize response for ${item.category} at ${item.location}?`,
      [
        { text: "CANCEL", style: "cancel" },
        { 
          text: "ACCEPT", 
          onPress: () => navigation.navigate('RealTimeMap', { 
            emergencyItem: item, 
            mode: 'POLICE' 
          }) 
        }
      ]
    );
  };

  // --- UI Sub-Components ---
  const ToolCard = ({ icon, title, color, onPress }) => (
    <TouchableOpacity style={styles.toolCard} onPress={onPress}>
      <View style={[styles.toolIconCircle, { backgroundColor: `${color}20` }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <Text style={styles.toolTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#020617' }]}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />}
      >
        {/* HEADER AREA */}
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.roleText}>{role?.toUpperCase() || 'POLICE'} TERMINAL</Text>
            <Text style={styles.welcomeText}>{currentTime}</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.citizenSwitch} 
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                navigation.navigate("HomeScreen");
              }}
            >
              <Ionicons name="person-circle-outline" size={18} color="#3b82f6" />
              <Text style={styles.citizenBtnText}>Citizen</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate("PoliceSettings")} style={styles.iconCircle}>
              <Ionicons name="cog" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* WEATHER/LOCATION CARD */}
        <View style={styles.weatherCard}>
          <View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={14} color="#64748b" />
              <Text style={styles.locationCity}>Kathmandu, Nepal</Text>
            </View>
            <Text style={styles.weatherCondition}>CLEAR SKY - OPTIMAL VISIBILITY</Text>
          </View>
          <Text style={styles.tempText}>28°C</Text>
        </View>

        {/* STATS SECTION */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { borderLeftColor: '#ef4444' }]}>
            <Text style={styles.statNumber}>{sosData.filter(i => i.severity === 'High').length.toString().padStart(2, '0')}</Text>
            <Text style={styles.statLabel}>Active SOS</Text>
          </View>
          <View style={[styles.statCard, { borderLeftColor: '#3b82f6' }]}>
            <Text style={styles.statNumber}>{sosData.length.toString().padStart(2, '0')}</Text>
            <Text style={styles.statLabel}>Total Intel</Text>
          </View>
        </View>

        {/* DUTY TOGGLE */}
        <View style={[styles.dutyCard, { borderColor: isOnDuty ? '#10b981' : '#ef4444' }]}>
          <View style={styles.dutyInfo}>
            <View style={[styles.statusDot, { backgroundColor: isOnDuty ? '#10b981' : '#ef4444' }]} />
            <Text style={[styles.dutyText, { color: isOnDuty ? '#10b981' : '#ef4444' }]}>
              {isOnDuty ? "UNIT ACTIVE" : "UNIT STANDBY"}
            </Text>
          </View>
          <Switch 
            value={isOnDuty} 
            onValueChange={(val) => {
              setIsOnDuty(val);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }} 
            trackColor={{ false: "#1e293b", true: "#10b981" }} 
          />
        </View>

        {/* NAVIGATION TABS */}
        <View style={styles.tabBar}>
          <TouchableOpacity onPress={() => setActiveTab('FEED')} style={[styles.tab, activeTab === 'FEED' && styles.activeTab]}>
            <Text style={[styles.tabText, activeTab === 'FEED' && styles.activeTabText]}>INTEL FEED</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setActiveTab('TOOLS')} style={[styles.tab, activeTab === 'TOOLS' && styles.activeTab]}>
            <Text style={[styles.tabText, activeTab === 'TOOLS' && styles.activeTabText]}>OPS CENTER</Text>
          </TouchableOpacity>
        </View>

        {activeTab === 'FEED' ? (
          <View style={{ paddingHorizontal: 20, paddingBottom: 30 }}>
            {sosData.length === 0 && (
              <View style={styles.emptyContainer}>
                <ActivityIndicator animating={loading} color="#3b82f6" />
                <Text style={styles.emptyText}>
                  {isOnDuty ? (loading ? "Decrypting Signals..." : "Sector Clear") : "Switch to ACTIVE to receive intel"}
                </Text>
              </View>
            )}
            {isOnDuty && sosData.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.sosCard} 
                onPress={() => handleDispatch(item)}
              >
                <View style={[styles.severityStrip, { backgroundColor: item.severity === 'High' ? '#ef4444' : '#f59e0b' }]} />
                <View style={styles.sosCardBody}>
                  <View style={styles.sosHeader}>
                    <Text style={styles.sosCategory}>{item.category?.toUpperCase() || "INCIDENT"}</Text>
                    <Text style={styles.sosTime}>{new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
                  </View>
                  <Text style={styles.sosLoc} numberOfLines={1}>📍 {item.location}</Text>
                  <View style={styles.dispatchRow}>
                    <Text style={styles.dispatchText}>TAP TO INITIALIZE RESPONSE</Text>
                    <Ionicons name="shield-checkmark" size={12} color="#10b981" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.toolsGrid}>
            <ToolCard icon="shield-alert" title="SOS Feed" color="#ef4444" onPress={() => setActiveTab('FEED')} />
            <ToolCard icon="map-marker-radius" title="Patrol" color="#3b82f6" onPress={() => {}} />
            <ToolCard icon="bullhorn" title="Broadcast" color="#f59e0b" onPress={() => navigation.navigate("AlertScreen")} />
            <ToolCard icon="account-group" title="Volunteers" color="#10b981" onPress={() => navigation.navigate("Volunteer")} />
            <ToolCard icon="file-document" title="Reports" color="#8b5cf6" onPress={() => navigation.navigate("PoliceSOSList")} />
            <ToolCard icon="history" title="History" color="#64748b" onPress={() => {}} />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  roleText: { color: '#3b82f6', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  welcomeText: { color: '#fff', fontSize: 26, fontWeight: '800' },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { backgroundColor: '#1e293b', padding: 10, borderRadius: 12, marginLeft: 10 },
  citizenSwitch: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e293b', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#3b82f640' },
  citizenBtnText: { color: '#3b82f6', fontSize: 12, fontWeight: '700', marginLeft: 5 },
  
  weatherCard: { backgroundColor: '#1e293b80', marginHorizontal: 20, padding: 25, borderRadius: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#ffffff10' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  locationCity: { color: '#64748b', fontSize: 14, fontWeight: '600', marginLeft: 5 },
  weatherCondition: { color: '#fff', fontSize: 11, fontWeight: '800', opacity: 0.6 },
  tempText: { color: '#fff', fontSize: 44, fontWeight: '300' },

  statsRow: { flexDirection: 'row', paddingHorizontal: 20, marginTop: 20, justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: '#1e293b', padding: 20, borderRadius: 20, borderLeftWidth: 4 },
  statNumber: { color: '#fff', fontSize: 28, fontWeight: '800' },
  statLabel: { color: '#64748b', fontSize: 12, fontWeight: '600', marginTop: 4 },

  dutyCard: { margin: 20, padding: 18, borderRadius: 20, backgroundColor: '#0f172a', borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dutyInfo: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  dutyText: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },

  tabBar: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: '#0f172a', borderRadius: 15, padding: 5 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: '#3b82f6' },
  tabText: { color: '#64748b', fontSize: 12, fontWeight: '800' },
  activeTabText: { color: '#fff' },

  sosCard: { backgroundColor: '#1e293b', borderRadius: 20, marginBottom: 15, flexDirection: 'row', overflow: 'hidden' },
  severityStrip: { width: 6 },
  sosCardBody: { flex: 1, padding: 18 },
  sosHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  sosCategory: { color: '#fff', fontSize: 15, fontWeight: '900' },
  sosTime: { color: '#64748b', fontSize: 12 },
  sosLoc: { color: '#94a3b8', fontSize: 14, marginVertical: 10 },
  dispatchRow: { flexDirection: 'row', alignItems: 'center' },
  dispatchText: { color: '#10b981', fontSize: 10, fontWeight: '900', marginRight: 5 },

  toolsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 10, justifyContent: 'space-around', paddingBottom: 30 },
  toolCard: { width: '30%', alignItems: 'center', marginBottom: 25 },
  toolIconCircle: { width: 65, height: 65, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  toolTitle: { color: '#94a3b8', fontSize: 11, fontWeight: '700', textAlign: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#64748b', marginTop: 10, fontWeight: '700' }
});