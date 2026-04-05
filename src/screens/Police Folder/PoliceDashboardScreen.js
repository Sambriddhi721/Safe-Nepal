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

// Your Computer IP address
const SERVER_URL = "http://192.168.111.70:5000";

export default function PoliceDashboardScreen({ navigation }) {
  const { user, role } = useContext(AuthContext) || {};
  const { colors, theme } = useContext(ThemeContext) || { theme: 'dark' };
  const isDarkMode = theme === 'dark';
  
  const [isAvailable, setIsAvailable] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sosData, setSosData] = useState([]);
  const [stats, setStats] = useState({ solved: 142, active: 0 });

  // 1. Fetch Data Logic
  const fetchReports = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/reports`);
      const data = await response.json();
      
      // Sort: Newest reports at the top based on timestamp
      const sortedData = data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      setSosData(sortedData);
      setStats(prev => ({ ...prev, active: sortedData.length }));
    } catch (error) {
      console.error("Fetch error:", error);
      // Optional: Alert.alert("Sync Error", "Could not connect to the central server.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 2. Initial Load & Auth Check
  useEffect(() => {
    if (role !== "RESPONDER" && role !== "POLICE") {
       navigation.replace('UserHome'); 
    } else {
       fetchReports();
    }
  }, [role]);

  // 3. Pull-to-Refresh Logic
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    fetchReports();
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
      `Initialize response for ${item.category.toUpperCase()} at ${item.location}?`,
      [
        { text: "ABORT", style: "cancel" },
        { 
          text: "ACCEPT TASK", 
          onPress: () => {
            // Locally update UI for immediate feedback
            setSosData(current => current.filter(sos => sos.timestamp !== item.timestamp));
            setStats(prev => ({ ...prev, solved: prev.solved + 1, active: prev.active - 1 }));
            
            // Navigate to Map
            navigation.navigate('RealTimeMap', { 
              emergencyItem: item, 
              mode: 'POLICE' 
            });
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
      <View style={[styles.severityBar, { 
        backgroundColor: item.severity === 'High' ? '#ef4444' : 
                         item.severity === 'Moderate' ? '#f59e0b' : '#3b82f6' 
      }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.sosTitle, { color: colors.text }]}>
            {item.category?.toUpperCase() || "INCIDENT"} ALERT
          </Text>
          <Text style={styles.timeText}>
             {item.timestamp ? new Date(item.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
          </Text>
        </View>
        <Text style={[styles.locationText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
          <Ionicons name="location" size={14} color="#ef4444" /> {item.location}
        </Text>
        <Text style={[styles.descriptionText, { color: isDarkMode ? '#cbd5e1' : '#475569' }]} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={[styles.respondBtn, { backgroundColor: isAvailable ? '#3b82f6' : '#334155', marginTop: 10 }]}>
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
      
      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#bef264" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={isAvailable ? sosData : []}
          renderItem={renderSOSItem}
          keyExtractor={(item, index) => index.toString()}
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
      )}
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
  locationText: { fontSize: 14, marginTop: 10, fontWeight: '700' },
  descriptionText: { fontSize: 13, marginBottom: 5, lineHeight: 18 },
  respondBtn: { flexDirection: 'row', alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, alignItems: 'center', gap: 8 },
  respondText: { color: '#fff', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 15, textAlign: 'center', color: '#64748b', fontSize: 15, fontWeight: '600', lineHeight: 22 }
});