import React, { useState, useContext, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  StatusBar, SafeAreaView, Switch, Alert, RefreshControl, Platform 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';

// Define the mock data that was missing
const INITIAL_MOCK_SOS = [
  { id: '1', type: 'Flood', location: 'Balkhu, Kathmandu', time: '2m ago', severity: 'Critical' },
  { id: '2', type: 'Landslide', location: 'Nagdhunga Highway', time: '15m ago', severity: 'Critical' },
  { id: '3', type: 'Medical', location: 'Patan Durbar Square', time: '22m ago', severity: 'High' },
  { id: '4', type: 'Structural', location: 'Thamel, KTM', time: '1h ago', severity: 'High' },
];

export default function PoliceDashboardScreen({ navigation }) {
  // Use optional chaining/fallback to prevent crashes if Context is slow to load
  const { colors = {}, theme = 'light' } = useContext(ThemeContext) || {};
  
  const [isAvailable, setIsAvailable] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sosData, setSosData] = useState(INITIAL_MOCK_SOS);
  const [stats, setStats] = useState({ solved: 12, active: INITIAL_MOCK_SOS.length });

  // Update stats whenever the data changes
  useEffect(() => {
    setStats(prev => ({ ...prev, active: sosData.length }));
  }, [sosData]);

  const handleRespond = (item) => {
    if (!isAvailable) {
      Alert.alert("Duty Offline", "Please toggle 'On Duty' to respond to emergencies.");
      return;
    }

    Alert.alert(
      "Confirm Response",
      `Are you responding to the ${item.type} alert at ${item.location}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Accept Task", 
          onPress: () => {
            // Remove from list as it's now being handled
            setSosData(current => current.filter(sos => sos.id !== item.id));
            setStats(prev => ({ ...prev, solved: prev.solved + 1 }));
            
            // Navigate to the Map
            if (navigation) {
              navigation.navigate('RealTimeMap', { 
                emergencyItem: item,
                mode: 'RESPONDER' 
              });
            }
          } 
        }
      ]
    );
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate API Fetch
    setTimeout(() => {
      setSosData(INITIAL_MOCK_SOS);
      setRefreshing(false);
    }, 1500);
  }, []);

  // Simulating live feed (adds a random alert every 60s)
  useEffect(() => {
    let interval;
    if (isAvailable) {
      interval = setInterval(() => {
        const newAlert = {
          id: Date.now().toString(),
          type: 'Emergency',
          location: 'Koteshwor, KTM',
          time: 'Just now',
          severity: 'High'
        };
        setSosData(prev => [newAlert, ...prev]);
      }, 60000);
    }
    return () => clearInterval(interval);
  }, [isAvailable]);

  const renderSOSItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.sosCard, 
        { backgroundColor: colors.card || '#fff', opacity: isAvailable ? 1 : 0.6 }
      ]}
      onPress={() => handleRespond(item)}
      activeOpacity={0.7}
      disabled={!isAvailable}
    >
      <View style={[
        styles.severityBar, 
        { backgroundColor: item.severity === 'Critical' ? '#ef4444' : '#f59e0b' }
      ]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.sosTitle, { color: colors.text || '#000' }]}>{item.type} Alert</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <Text style={[styles.locationText, { color: colors.subText || '#64748b' }]}>
          <Ionicons name="location" size={14} color="#ef4444" /> {item.location}
        </Text>
        <View style={[styles.respondBtn, { backgroundColor: isAvailable ? '#3b82f6' : '#94a3b8' }]}>
          <Text style={styles.respondText}>Accept & View Map</Text>
          <Ionicons name="chevron-forward" size={16} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background || '#f8fafc' }]}>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.badgeText}>OFFICER ID: NP-4412</Text>
          <Text style={[styles.title, { color: colors.text || '#000' }]}>Responder Portal</Text>
        </View>
        <TouchableOpacity 
          onPress={() => navigation.navigate("Settings")} 
          style={styles.profileIcon}
        >
          <Ionicons name="settings-outline" size={26} color={colors.text || '#000'} />
        </TouchableOpacity>
      </View>

      {/* DUTY TOGGLE CARD */}
      <View style={[
        styles.statusCard, 
        { 
          backgroundColor: isAvailable ? 'rgba(16, 185, 129, 0.1)' : 'rgba(100, 116, 139, 0.1)', 
          borderColor: isAvailable ? '#10b981' : '#64748b',
          borderWidth: 1
        }
      ]}>
        <View>
          <Text style={[styles.statusTitle, { color: isAvailable ? '#059669' : '#475569' }]}>
            {isAvailable ? "ON DUTY - ACTIVE" : "OFF DUTY"}
          </Text>
          <Text style={{ color: colors.subText || '#64748b', fontSize: 12 }}>
            {isAvailable ? "Tracking GPS & Receiving SOS..." : "Currently hidden from dispatch"}
          </Text>
        </View>
        <Switch 
          value={isAvailable} 
          onValueChange={setIsAvailable}
          trackColor={{ false: "#cbd5e1", true: "#bef264" }}
          thumbColor={Platform.OS === 'ios' ? undefined : (isAvailable ? "#fff" : "#f4f3f4")}
        />
      </View>

      {/* STATS SECTION */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.card || '#fff' }]}>
          <Text style={[styles.statNum, { color: colors.text || '#000' }]}>{stats.solved}</Text>
          <Text style={styles.statLabel}>Total Attended</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card || '#fff' }]}>
          <Text style={[styles.statNum, { color: '#ef4444' }]}>
            {isAvailable ? stats.active : 0}
          </Text>
          <Text style={styles.statLabel}>Active Alerts</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text || '#000' }]}>Nearby Emergencies</Text>
      
      <FlatList
        data={isAvailable ? sosData : []}
        renderItem={renderSOSItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3b82f6" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name={isAvailable ? "check-all" : "sleep"} 
              size={64} 
              color="#cbd5e1" 
            />
            <Text style={[styles.emptyText, { color: colors.subText || '#64748b' }]}>
              {isAvailable 
                ? "No active emergencies in your area." 
                : "You are currently offline.\nToggle 'On Duty' to see alerts."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: Platform.OS === 'ios' ? 10 : 30, 
    marginBottom: 25 
  },
  badgeText: { fontSize: 10, fontWeight: '900', color: '#3b82f6', letterSpacing: 1.5, marginBottom: 4 },
  title: { fontSize: 26, fontWeight: '900' },
  profileIcon: { padding: 5 },
  statusCard: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: 20, 
    borderRadius: 24, 
    marginBottom: 20 
  },
  statusTitle: { fontSize: 16, fontWeight: '800' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statBox: { 
    width: '47%', 
    padding: 20, 
    borderRadius: 24, 
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2 
  },
  statNum: { fontSize: 28, fontWeight: '900' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginTop: 4, fontWeight: '700', textTransform: 'uppercase' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 15, marginLeft: 5 },
  sosCard: { 
    flexDirection: 'row', 
    borderRadius: 22, 
    marginBottom: 16, 
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4 
  },
  severityBar: { width: 7 },
  cardContent: { flex: 1, padding: 18 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sosTitle: { fontSize: 18, fontWeight: '800' },
  timeText: { fontSize: 12, color: '#94a3b8', fontWeight: '600' },
  locationText: { fontSize: 15, marginTop: 6, marginBottom: 18, fontWeight: '500' },
  respondBtn: { 
    flexDirection: 'row', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 16, 
    paddingVertical: 10, 
    borderRadius: 12, 
    alignItems: 'center' 
  },
  respondText: { color: '#fff', fontWeight: '800', fontSize: 13, marginRight: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyText: { marginTop: 15, textAlign: 'center', fontSize: 15, lineHeight: 22, fontWeight: '500' }
});