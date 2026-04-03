import React, { useState, useContext, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  StatusBar, SafeAreaView, Switch, Alert, RefreshControl,
  ActivityIndicator, Dimensions, Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';

// Contexts
import { AuthContext } from "../../context/AuthContext"; 
import { ThemeContext } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

const INITIAL_MOCK_SOS = [
  { id: '1', type: 'Landslide', location: 'Muglin-Narayanghat', time: '2m ago', severity: 'Critical', coordinates: { lat: 27.75, lng: 84.55 } },
  { id: '2', type: 'Flood', location: 'Balkhu, Kathmandu', time: '5m ago', severity: 'High', coordinates: { lat: 27.68, lng: 85.29 } },
  { id: '3', type: 'Medical', location: 'Patan Hospital Area', time: '12m ago', severity: 'Medium', coordinates: { lat: 27.67, lng: 85.32 } },
];

export default function ResponderDashboard({ navigation }) {
  const { user } = useContext(AuthContext) || {};
  const { colors, theme } = useContext(ThemeContext) || { theme: 'dark' };
  const isDarkMode = theme === 'dark';

  const [isAvailable, setIsAvailable] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [sosData, setSosData] = useState(INITIAL_MOCK_SOS);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  // HUD Clock Update
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
      Alert.alert("SYSTEM OFFLINE", "Toggle 'ON DUTY' status to accept tactical dispatches.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "CONFIRM DISPATCH",
      `Initialize emergency route to ${item.type.toUpperCase()} incident?\nLocation: ${item.location}`,
      [
        { text: "ABORT", style: "cancel" },
        { 
          text: "ACCEPT", 
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setSosData(prev => prev.filter(s => s.id !== item.id));
            navigation.navigate('RealTimeMap', { emergencyItem: item, mode: 'RESPONDER' });
          } 
        }
      ]
    );
  };

  const handleExitResponderMode = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authorize Session Termination',
      fallbackLabel: 'Use Passcode',
    });

    if (result.success) {
      setIsSwitching(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTimeout(() => {
        setIsSwitching(false);
        navigation.replace('UserHome'); 
      }, 2000);
    }
  };

  const renderSOSItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.sosCard, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}
      onPress={() => handleRespond(item)}
      activeOpacity={0.9}
    >
      <View style={[styles.severityBar, { backgroundColor: item.severity === 'Critical' ? '#ef4444' : '#f59e0b' }]} />
      <View style={styles.cardInner}>
        <View style={styles.cardHeader}>
          <Text style={[styles.cardType, { color: isDarkMode ? '#fff' : '#1e293b' }]}>{item.type.toUpperCase()} EMERGENCY</Text>
          <Text style={styles.cardTime}>{item.time}</Text>
        </View>
        <Text style={styles.cardLoc}>
          <Ionicons name="location-sharp" size={14} color="#ef4444" /> {item.location}
        </Text>
        <View style={styles.actionRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>ETA: 4-6 MIN</Text>
          </View>
          <View style={styles.respondLinkContainer}>
            <Text style={styles.respondLink}>INITIALIZE</Text>
            <Ionicons name="chevron-forward" size={14} color="#bef264" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#020617' : '#f8fafc' }]}>
      <StatusBar barStyle="light-content" />
      
      {isSwitching && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#bef264" />
          <Text style={styles.overlayText}>SECURE LOGOUT IN PROGRESS</Text>
          <Text style={styles.subOverlayText}>RESTORING STANDARD USER PROTOCOLS</Text>
        </View>
      )}

      {/* --- HUD HEADER --- */}
      <View style={styles.header}>
        <View>
          <Text style={styles.unitId}>RESPONDER ID: SN-{user?.id?.slice(-4).toUpperCase() || "7702"}</Text>
          <Text style={[styles.timeLabel, { color: isDarkMode ? '#fff' : '#1e293b' }]}>
            {currentTime} <Text style={{ fontSize: 12, color: '#3b82f6' }}>PST</Text>
          </Text>
        </View>
        <TouchableOpacity 
          onLongPress={handleExitResponderMode} 
          delayLongPress={1500}
          style={styles.shieldIcon}
        >
          <MaterialCommunityIcons name="shield-key" size={26} color="#bef264" />
          <Text style={{ fontSize: 7, color: '#bef264', fontWeight: '900', marginTop: 2 }}>EXIT</Text>
        </TouchableOpacity>
      </View>

      {/* --- DUTY TOGGLE --- */}
      <View style={[
        styles.dutyCard, 
        { 
          backgroundColor: isAvailable ? 'rgba(190, 242, 100, 0.05)' : 'rgba(100, 116, 139, 0.05)',
          borderColor: isAvailable ? '#bef264' : '#475569',
          borderWidth: 1
        }
      ]}>
        <View style={styles.statusInfo}>
          <View style={[styles.statusDot, { backgroundColor: isAvailable ? '#bef264' : '#ef4444' }]} />
          <View>
            <Text style={[styles.dutyStatus, { color: isAvailable ? '#bef264' : '#94a3b8' }]}>
              {isAvailable ? "PROTOCOL: ACTIVE DUTY" : "PROTOCOL: STANDBY"}
            </Text>
            <Text style={styles.dutySub}>Visibility: {isAvailable ? "LIVE TO HQ" : "OFFLINE"}</Text>
          </View>
        </View>
        <Switch 
          value={isAvailable} 
          onValueChange={(val) => {
            setIsAvailable(val);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          trackColor={{ false: "#334155", true: "rgba(190, 242, 100, 0.4)" }}
          thumbColor={isAvailable ? "#bef264" : "#94a3b8"}
        />
      </View>

      {/* --- COMMAND STATS --- */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : '#fff' }]}>
          <Text style={styles.statVal}>{sosData.length}</Text>
          <Text style={styles.statLab}>INCOMING SOS</Text>
        </View>

        <View style={[styles.statBox, { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : '#fff' }]}>
          <Text style={[styles.statVal, { color: '#3b82f6' }]}>24</Text>
          <Text style={styles.statLab}>RESOLVED BY UNIT</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>TACTICAL FEED</Text>
        <View style={styles.liveIndicator}>
          <View style={styles.pulseDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>
      
      <FlatList
        data={isAvailable ? sosData : []}
        keyExtractor={item => item.id}
        renderItem={renderSOSItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#bef264" />}
        ListEmptyComponent={
          <View style={styles.emptyFeed}>
            <MaterialCommunityIcons 
              name={isAvailable ? "radar" : "eye-off-outline"} 
              size={60} 
              color="#334155" 
            />
            <Text style={styles.emptyText}>
              {isAvailable 
                ? "Scanning for distress signals in your sector..." 
                : "Terminal locked. Toggle Active Duty to resume."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  overlayText: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 20, letterSpacing: 1 },
  subOverlayText: { color: '#bef264', fontSize: 10, letterSpacing: 2, marginTop: 8 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25 },
  unitId: { color: '#3b82f6', fontWeight: '900', fontSize: 10, letterSpacing: 1.5 },
  timeLabel: { fontSize: 26, fontWeight: '900', marginTop: 2 },
  shieldIcon: { width: 55, height: 55, borderRadius: 18, backgroundColor: 'rgba(30, 41, 59, 0.8)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  
  dutyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, padding: 18, borderRadius: 24, marginBottom: 25 },
  statusInfo: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  dutyStatus: { fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  dutySub: { fontSize: 11, color: '#64748b', marginTop: 3, fontWeight: '600' },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 25 },
  statBox: { width: '47%', padding: 20, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statVal: { fontSize: 28, fontWeight: '900', color: '#ef4444' },
  statLab: { fontSize: 9, color: '#64748b', fontWeight: '800', marginTop: 6, letterSpacing: 1 },
  
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1.5 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444', marginRight: 6 },
  liveText: { color: '#ef4444', fontSize: 10, fontWeight: '900' },

  sosCard: { borderRadius: 24, marginBottom: 15, flexDirection: 'row', overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  severityBar: { width: 6 },
  cardInner: { flex: 1, padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardType: { fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  cardTime: { fontSize: 11, color: '#94a3b8', fontWeight: '700' },
  cardLoc: { fontSize: 14, color: '#64748b', marginTop: 8, fontWeight: '600' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  badge: { backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeText: { color: '#3b82f6', fontSize: 10, fontWeight: '900' },
  respondLinkContainer: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  respondLink: { color: '#bef264', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  
  emptyFeed: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#64748b', marginTop: 15, textAlign: 'center', fontSize: 14, fontWeight: '600', paddingHorizontal: 40, lineHeight: 20 }
});