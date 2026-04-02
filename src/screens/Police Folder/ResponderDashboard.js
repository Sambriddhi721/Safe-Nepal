import React, { useContext, useState, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  StatusBar, SafeAreaView, Switch, Alert, RefreshControl,
  ActivityIndicator, Dimensions, ScrollView
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';

// Contexts
import { AuthContext } from "../../context/AuthContext"; 
import { ThemeContext } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

// Mock Data for the Nepal Emergency Feed
const INITIAL_MOCK_SOS = [
  { id: '1', type: 'Landslide', location: 'Muglin-Narayanghat', time: '2m ago', severity: 'Critical', coordinates: { lat: 27.75, lng: 84.55 } },
  { id: '2', type: 'Flood', location: 'Balkhu, Kathmandu', time: '5m ago', severity: 'High', coordinates: { lat: 27.68, lng: 85.29 } },
  { id: '3', type: 'Medical', location: 'Patan Hospital Area', time: '12m ago', severity: 'Medium', coordinates: { lat: 27.67, lng: 85.32 } },
];

export default function ResponderDashboard({ navigation }) {
  const { user } = useContext(AuthContext) || {};
  const { theme, colors } = useContext(ThemeContext) || { theme: 'dark' };
  const isDarkMode = theme === 'dark';

  // --- STATES ---
  const [isAvailable, setIsAvailable] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [sosData, setSosData] = useState(INITIAL_MOCK_SOS);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // Real-time clock for the tactical feel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- ACTIONS ---
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTimeout(() => {
      setSosData(INITIAL_MOCK_SOS);
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleRespond = (item) => {
    if (!isAvailable) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Duty Offline", "Toggle 'ON DUTY' to accept dispatch calls.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Confirm Dispatch",
      `Route to ${item.type} incident at ${item.location}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept", 
          onPress: () => {
            setSosData(prev => prev.filter(s => s.id !== item.id));
            navigation.navigate('RealTimeMap', { emergencyItem: item });
          } 
        }
      ]
    );
  };

  const handleExitResponderMode = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Terminate Encrypted Responder Session',
    });

    if (result.success) {
      setIsSwitching(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        setIsSwitching(false);
        navigation.navigate('UserHome'); // Navigates back to citizen view
      }, 1800);
    }
  };

  // --- RENDER HELPERS ---
  const renderSOSItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.sosCard, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}
      onPress={() => handleRespond(item)}
      activeOpacity={0.8}
    >
      <View style={[styles.severityBar, { backgroundColor: item.severity === 'Critical' ? '#ef4444' : '#f59e0b' }]} />
      <View style={styles.cardInner}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardType, { color: isDarkMode ? '#fff' : '#1e293b' }]}>{item.type} EMERGENCY</Text>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>
        <Text style={styles.cardLoc}><Ionicons name="location" size={14} color="#ef4444" /> {item.location}</Text>
        <View style={styles.actionRow}>
          <View style={styles.badge}><Text style={styles.badgeText}>EN ROUTE: 4m</Text></View>
          <Text style={styles.respondLink}>TAP TO ACCEPT <Ionicons name="chevron-forward" size={12} /></Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#020617' : '#f8fafc' }]}>
      <StatusBar barStyle="light-content" />
      
      {/* SECURITY OVERLAY */}
      {isSwitching && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#bef264" />
          <Text style={styles.overlayText}>Terminating Session...</Text>
          <Text style={styles.subOverlayText}>RESTORING CITIZEN INTERFACE</Text>
        </View>
      )}

      {/* TACTICAL HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.unitId}>UNIT: SN-RESPONDER-{user?.id?.slice(-4).toUpperCase() || "4412"}</Text>
          <Text style={[styles.timeLabel, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>{currentTime} • KATHMANDU</Text>
        </View>
        <TouchableOpacity onLongPress={handleExitResponderMode} delayLongPress={1500}>
          <View style={styles.shieldIcon}>
            <MaterialCommunityIcons name="shield-check" size={28} color="#bef264" />
          </View>
        </TouchableOpacity>
      </View>

      {/* ON-DUTY SWITCH */}
      <View style={[styles.dutyCard, { backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)' }]}>
        <View>
          <Text style={[styles.dutyStatus, { color: isAvailable ? '#10b981' : '#64748b' }]}>
            {isAvailable ? "● ON DUTY - ACTIVE" : "○ OFF DUTY"}
          </Text>
          <Text style={styles.dutySub}>Dispatch visibility is {isAvailable ? "Public" : "Hidden"}</Text>
        </View>
        <Switch 
          value={isAvailable} 
          onValueChange={(val) => {
            setIsAvailable(val);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          trackColor={{ false: "#334155", true: "#bef264" }}
        />
      </View>

      {/* STATS AREA */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: isDarkMode ? '#0f172a' : '#fff' }]}>
          <Text style={styles.statVal}>{sosData.length}</Text>
          <Text style={styles.statLab}>PENDING</Text>
        </TouchableOpacity>
        <View style={[styles.statBox, { backgroundColor: isDarkMode ? '#0f172a' : '#fff' }]}>
          <Text style={[styles.statVal, { color: '#10b981' }]}>12</Text>
          <Text style={styles.statLab}>RESOLVED</Text>
        </View>
      </View>

      {/* LIVE FEED */}
      <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#1e293b' }]}>LIVE EMERGENCY FEED</Text>
      
      <FlatList
        data={isAvailable ? sosData : []}
        keyExtractor={item => item.id}
        renderItem={renderSOSItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#bef264" />}
        ListEmptyComponent={
          <View style={styles.emptyFeed}>
            <Ionicons name={isAvailable ? "shield-checkmark" : "eye-off"} size={50} color="#64748b" />
            <Text style={styles.emptyText}>
              {isAvailable ? "No active SOS in your vicinity." : "Go On Duty to see nearby alerts."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  overlayText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  subOverlayText: { color: '#bef264', fontSize: 10, letterSpacing: 2, marginTop: 5 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, marginTop: 10 },
  unitId: { color: '#3b82f6', fontWeight: '900', fontSize: 12, letterSpacing: 1 },
  timeLabel: { fontSize: 18, fontWeight: '800', marginTop: 4 },
  shieldIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  dutyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, padding: 15, borderRadius: 20, marginBottom: 20 },
  dutyStatus: { fontSize: 14, fontWeight: '900' },
  dutySub: { fontSize: 11, color: '#94a3b8', marginTop: 2 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 25 },
  statBox: { width: '47%', padding: 15, borderRadius: 20, alignItems: 'center', elevation: 2 },
  statVal: { fontSize: 24, fontWeight: '900', color: '#ef4444' },
  statLab: { fontSize: 10, color: '#64748b', fontWeight: 'bold', marginTop: 5 },
  sectionTitle: { fontSize: 14, fontWeight: '900', marginLeft: 25, marginBottom: 15, letterSpacing: 1 },
  sosCard: { borderRadius: 20, marginBottom: 15, flexDirection: 'row', overflow: 'hidden', elevation: 4 },
  severityBar: { width: 6 },
  cardInner: { flex: 1, padding: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  cardType: { fontSize: 15, fontWeight: '900' },
  cardTime: { fontSize: 11, color: '#94a3b8' },
  cardLoc: { fontSize: 13, color: '#64748b', marginTop: 5 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  badge: { backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { color: '#3b82f6', fontSize: 10, fontWeight: 'bold' },
  respondLink: { color: '#bef264', fontSize: 11, fontWeight: '900' },
  emptyFeed: { alignItems: 'center', marginTop: 60, opacity: 0.5 },
  emptyText: { color: '#94a3b8', marginTop: 10, textAlign: 'center', fontSize: 13 }
});