import React, { useState, useContext, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  StatusBar, SafeAreaView, Switch, Alert, RefreshControl, Platform, ActivityIndicator 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

// Contexts
import { AuthContext } from "../../context/AuthContext"; 
import { ThemeContext } from '../../context/ThemeContext';

const INITIAL_MOCK_SOS = [
  { id: '1', type: 'Flood', location: 'Balkhu, Kathmandu', time: '2m ago', severity: 'Critical' },
  { id: '2', type: 'Landslide', location: 'Nagdhunga Highway', time: '15m ago', severity: 'Critical' },
  { id: '3', type: 'Medical', location: 'Patan Durbar Square', time: '22m ago', severity: 'High' },
];

export default function PoliceDashboardScreen({ navigation }) {
  const { user, role } = useContext(AuthContext) || {};
  const { colors, theme } = useContext(ThemeContext) || { theme: 'dark' };
  const isDarkMode = theme === 'dark';
  
  const [isAvailable, setIsAvailable] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sosData, setSosData] = useState(INITIAL_MOCK_SOS);
  const [stats, setStats] = useState({ solved: 142, active: INITIAL_MOCK_SOS.length });

  // Safety Check: Redirect if not a responder
  useEffect(() => {
    if (role !== "RESPONDER" && role !== "POLICE") {
       navigation.replace('UserHome'); 
    }
  }, [role]);

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert("System Offline", "You must be 'ON DUTY' to accept emergency dispatches.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      "CONFIRM DISPATCH",
      `Initialize response for ${item.type.toUpperCase()} at ${item.location}?`,
      [
        { text: "ABORT", style: "cancel" },
        { 
          text: "ACCEPT TASK", 
          onPress: () => {
            setSosData(current => current.filter(sos => sos.id !== item.id));
            setStats(prev => ({ ...prev, solved: prev.solved + 1 }));
            // Navigate to the RealTimeMap with the item data
            navigation.navigate('RealTimeMap', { emergencyItem: item, mode: 'POLICE' });
          } 
        }
      ]
    );
  };

  const renderSOSItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.sosCard, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}
      onPress={() => handleRespond(item)}
      activeOpacity={0.9}
    >
      <View style={[styles.severityBar, { backgroundColor: item.severity === 'Critical' ? '#ef4444' : '#f59e0b' }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.sosTitle, { color: colors.text }]}>{item.type.toUpperCase()} ALERT</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <Text style={[styles.locationText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
          <Ionicons name="location" size={14} color="#ef4444" /> {item.location}
        </Text>
        <View style={[styles.respondBtn, { backgroundColor: isAvailable ? '#3b82f6' : '#334155' }]}>
          <Text style={styles.respondText}>INITIALIZE RESPONSE</Text>
          <Ionicons name="shield-checkmark" size={14} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#020617' : '#f8fafc' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.badgeText}>OFFICER ID: NP-{user?.id?.slice(-4).toUpperCase() || "4412"}</Text>
          <Text style={[styles.title, { color: colors.text }]}>Police Terminal</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate("AccountSettings")} 
          style={[styles.settingsIcon, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
        >
          <Ionicons name="cog-outline" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* DUTY TOGGLE */}
      <View style={[
        styles.statusCard, 
        { 
          backgroundColor: isAvailable ? 'rgba(190, 242, 100, 0.05)' : 'rgba(239, 68, 68, 0.05)',
          borderColor: isAvailable ? '#bef264' : '#ef4444',
          borderWidth: 1
        }
      ]}>
        <View>
          <Text style={[styles.statusTitle, { color: isAvailable ? '#bef264' : '#ef4444' }]}>
            {isAvailable ? "● UNIT ACTIVE" : "○ UNIT OFFLINE"}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600' }}>
            GPS TRACKING: {isAvailable ? "ENCRYPTED" : "DISABLED"}
          </Text>
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

      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : '#fff' }]}>
          <Text style={[styles.statNum, { color: colors.text }]}>{stats.solved}</Text>
          <Text style={styles.statLabel}>CASES RESOLVED</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.5)' : '#fff' }]}>
          <Text style={[styles.statNum, { color: '#ef4444' }]}>{isAvailable ? sosData.length : 0}</Text>
          <Text style={styles.statLabel}>PENDING DISPATCH</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: '#64748b' }]}>LIVE INCIDENT FEED</Text>
      
      <FlatList
        data={isAvailable ? sosData : []}
        renderItem={renderSOSItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#bef264" />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name={isAvailable ? "shield-check-outline" : "power-off"} 
              size={64} 
              color={isDarkMode ? "#1e293b" : "#e2e8f0"} 
            />
            <Text style={styles.emptyText}>
              {isAvailable 
                ? "Area Secured. No pending alerts." 
                : "Terminal Disconnected.\nToggle Unit Status to resume operations."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, marginTop: Platform.OS === 'android' ? 10 : 0 },
  badgeText: { fontSize: 10, fontWeight: '900', color: '#3b82f6', letterSpacing: 2 },
  title: { fontSize: 32, fontWeight: '800', marginTop: 4 },
  settingsIcon: { padding: 10, borderRadius: 15 },
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, padding: 20, borderRadius: 24, marginBottom: 20 },
  statusTitle: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 25 },
  statBox: { width: '47%', padding: 18, borderRadius: 24, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  statNum: { fontSize: 26, fontWeight: '900' },
  statLabel: { fontSize: 9, color: '#64748b', fontWeight: '800', marginTop: 6, letterSpacing: 1 },
  sectionTitle: { fontSize: 12, fontWeight: '800', marginLeft: 25, marginBottom: 15, letterSpacing: 2 },
  sosCard: { borderRadius: 24, marginBottom: 16, flexDirection: 'row', overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  severityBar: { width: 6 },
  cardContent: { flex: 1, padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sosTitle: { fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  timeText: { fontSize: 11, color: '#94a3b8', fontWeight: '700' },
  locationText: { fontSize: 14, marginVertical: 10, fontWeight: '600' },
  respondBtn: { flexDirection: 'row', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignItems: 'center', gap: 8 },
  respondText: { color: '#fff', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 15, textAlign: 'center', color: '#64748b', fontSize: 15, fontWeight: '600', lineHeight: 22 }
});