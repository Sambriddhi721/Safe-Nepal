import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  StatusBar, Switch, Alert, Platform, ActivityIndicator, 
  SafeAreaView, Dimensions, RefreshControl 
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';

// Contexts
import { AuthContext } from "../../context/AuthContext"; 
import { ThemeContext } from '../../context/ThemeContext';

const SERVER_URL = "http://192.168.111.70:5000"; 
const { width } = Dimensions.get('window');

export default function PoliceDashboardScreen({ navigation }) {
  const { user, role } = useContext(AuthContext) || {};
  const { colors, theme } = useContext(ThemeContext) || { theme: 'dark' };
  const isDarkMode = theme === 'dark';
  const mapRef = useRef(null);
  
  // States
  const [activeTab, setActiveTab] = useState('FEED'); 
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sosData, setSosData] = useState([]);
  const [unitData, setUnitData] = useState([]); 
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // 1. Tactical Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 2. Data Fetching
  const fetchTacticalData = async () => {
    try {
      const [sosRes, unitRes] = await Promise.all([
        fetch(`${SERVER_URL}/api/reports`),
        fetch(`${SERVER_URL}/api/units`)
      ]);
      const sos = await sosRes.json();
      const units = await unitRes.json();
      setSosData(sos.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
      setUnitData(units);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchTacticalData(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchTacticalData();
  }, []);

  // 3. Incident Interaction
  const focusOnIncident = (item) => {
    if (!isOnDuty) {
      Alert.alert("OFFLINE", "Switch to ON DUTY to view tactical coordinates.");
      return;
    }
    mapRef.current?.animateToRegion({
      ...item.coordinates,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const handleDispatch = (item) => {
    if (!isOnDuty) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Alert.alert(
      "CONFIRM DISPATCH",
      `Send units to ${item.category} at ${item.location}?`,
      [
        { text: "CANCEL", style: "cancel" },
        { text: "DISPATCH", onPress: () => navigation.navigate('RealTimeMap', { emergencyItem: item, mode: 'POLICE' }) }
      ]
    );
  };

  const renderSOSItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.sosCard, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}
      onPress={() => focusOnIncident(item)}
    >
      <View style={[styles.severityBar, { backgroundColor: item.severity === 'High' ? '#ef4444' : '#f59e0b' }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.sosTitle, { color: colors.text }]}>{item.category?.toUpperCase()}</Text>
          <Text style={styles.timeText}>{new Date(item.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</Text>
        </View>
        <Text style={[styles.locationText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>{item.location}</Text>
        <TouchableOpacity style={styles.respondBtn} onPress={() => handleDispatch(item)}>
          <Text style={styles.respondText}>INITIALIZE RESPONSE</Text>
          <Ionicons name="chevron-forward" size={12} color="#bef264" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#020617' : '#f8fafc' }]}>
      <StatusBar barStyle="light-content" />
      
      {/* TACTICAL MAP SECTION */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{ latitude: 27.7172, longitude: 85.3240, latitudeDelta: 0.05, longitudeDelta: 0.05 }}
          customMapStyle={isDarkMode ? darkMapStyle : []}
        >
          {sosData.map((sos, i) => (
            <Marker key={i} coordinate={sos.coordinates} title={sos.category}>
              <View style={styles.sosMarkerContainer}>
                <View style={[styles.pulseRing, sos.severity === 'High' && styles.pulseRingHigh]} />
                <View style={[styles.sosMarkerDot, sos.severity === 'High' && styles.sosMarkerDotHigh]} />
              </View>
            </Marker>
          ))}
        </MapView>
        
        {/* HUD OVERLAY */}
        <View style={styles.hudOverlay}>
          <View style={styles.header}>
            <View>
              <Text style={styles.badgeText}>TERMINAL NP-7702</Text>
              <Text style={[styles.title, { color: '#fff' }]}>{currentTime}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("PoliceSettings")} style={styles.settingsBtn}>
              <Ionicons name="settings-sharp" size={22} color="#bef264" />
            </TouchableOpacity>
          </View>
          
          <View style={[styles.statusCard, { borderColor: isOnDuty ? '#bef264' : '#ef4444' }]}>
            <Text style={[styles.statusTitle, { color: isOnDuty ? '#bef264' : '#ef4444' }]}>
              {isOnDuty ? "● UNIT ACTIVE" : "○ UNIT STANDBY"}
            </Text>
            <Switch value={isOnDuty} onValueChange={setIsOnDuty} />
          </View>
        </View>
      </View>

      {/* CONTROLS SECTION */}
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab('FEED')} style={[styles.tab, activeTab === 'FEED' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'FEED' && styles.activeTabText]}>LIVE FEED</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab('OPS')} style={[styles.tab, activeTab === 'OPS' && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === 'OPS' && styles.activeTabText]}>COMMAND</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'FEED' ? (
        <FlatList
          data={isOnDuty ? sosData : []}
          renderItem={renderSOSItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#bef264" />}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No Active Alerts in Sector</Text>}
        />
      ) : (
        <View style={styles.toolsGrid}>
          <ToolCard icon="people" title="Volunteers" onPress={() => navigation.navigate("Volunteer")} />
          <ToolCard icon="megaphone" title="Broadcast" onPress={() => navigation.navigate("AlertScreen")} />
          <ToolCard icon="list" title="History" onPress={() => navigation.navigate("PoliceSOSList")} />
          <ToolCard icon="stats-chart" title="Heatmap" onPress={() => {}} />
        </View>
      )}
    </SafeAreaView>
  );
}

const ToolCard = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.toolCard} onPress={onPress}>
    <Ionicons name={icon} size={24} color="#3b82f6" />
    <Text style={styles.toolTitle}>{title}</Text>
  </TouchableOpacity>
);

const darkMapStyle = [{"elementType": "geometry", "stylers": [{"color": "#121929"}]}, {"elementType": "labels.text.fill", "stylers": [{"color": "#475569"}]}];

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapContainer: { height: '45%', width: '100%' },
  map: { ...StyleSheet.absoluteFillObject },
  hudOverlay: { position: 'absolute', top: 10, width: '100%', paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeText: { fontSize: 9, fontWeight: '900', color: '#3b82f6', letterSpacing: 2 },
  title: { fontSize: 28, fontWeight: '800' },
  settingsBtn: { backgroundColor: 'rgba(30,41,59,0.8)', padding: 10, borderRadius: 12 },
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(30,41,59,0.9)', padding: 10, borderRadius: 12, marginTop: 10, borderWidth: 1 },
  statusTitle: { fontSize: 10, fontWeight: '900' },
  tabContainer: { flexDirection: 'row', margin: 20, backgroundColor: 'rgba(30,41,59,0.1)', borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#3b82f6' },
  tabText: { fontSize: 11, fontWeight: '800', color: '#64748b' },
  activeTabText: { color: '#fff' },
  sosCard: { borderRadius: 15, marginBottom: 12, flexDirection: 'row', overflow: 'hidden', elevation: 2 },
  severityBar: { width: 5 },
  cardContent: { flex: 1, padding: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  sosTitle: { fontSize: 13, fontWeight: '900' },
  timeText: { fontSize: 10, color: '#94a3b8' },
  locationText: { fontSize: 12, marginVertical: 5 },
  respondBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  respondText: { color: '#bef264', fontSize: 10, fontWeight: '900', marginRight: 5 },
  toolsGrid: { paddingHorizontal: 20, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  toolCard: { width: '48%', backgroundColor: 'rgba(59,130,246,0.1)', padding: 20, borderRadius: 15, marginBottom: 15, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)' },
  toolTitle: { color: '#3b82f6', fontWeight: '800', marginTop: 8, fontSize: 12 },
  sosMarkerDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#fff' },
  pulseRing: { position: 'absolute', width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(239,68,68,0.3)' },
  emptyText: { textAlign: 'center', color: '#64748b', marginTop: 20, fontWeight: '600' }
});