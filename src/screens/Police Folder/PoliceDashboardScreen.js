import React, { useState, useContext, useEffect, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  StatusBar, SafeAreaView, Switch, Alert, RefreshControl 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';

const INITIAL_MOCK_SOS = [
  { id: '1', type: 'Flood', location: 'Balkhu, Ward 14', time: '2m ago', severity: 'Critical' },
  { id: '2', type: 'Landslide', location: 'Nagarkot Road', time: '5m ago', severity: 'High' },
  { id: '3', type: 'Medical', location: 'Patan Durbar Sq', time: '12m ago', severity: 'Medium' },
];

export default function PoliceDashboardScreen({ navigation }) {
  const { colors, theme } = useContext(ThemeContext);
  
  // --- States ---
  const [isAvailable, setIsAvailable] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sosData, setSosData] = useState(INITIAL_MOCK_SOS);
  const [stats, setStats] = useState({ solved: 12, active: INITIAL_MOCK_SOS.length });

  // Update active count whenever data changes
  useEffect(() => {
    setStats(prev => ({ ...prev, active: sosData.length }));
  }, [sosData]);

  // --- Functions ---

  // 1. Respond Logic
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
          text: "Confirm", 
          onPress: () => {
            // Remove from list (simulating case assignment)
            setSosData(current => current.filter(sos => sos.id !== item.id));
            setStats(prev => ({ ...prev, solved: prev.solved + 1 }));
            
            // Real Navigation: Ensure you have a 'Map' or 'Details' screen in your Stack
            if (navigation) {
              navigation.navigate('EmergencyMap', { emergencyItem: item });
            }
          } 
        }
      ]
    );
  };

  // 2. Refresh Logic (Simulate API call)
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setSosData(INITIAL_MOCK_SOS);
      setRefreshing(false);
    }, 1500);
  }, []);

  // 3. Simulated Live Feed (Adds an alert every 45 seconds if On Duty)
  useEffect(() => {
    let interval;
    if (isAvailable) {
      interval = setInterval(() => {
        const newAlert = {
          id: Date.now().toString(),
          type: 'Structural',
          location: 'New Baneshwor',
          time: 'Just now',
          severity: 'High'
        };
        setSosData(prev => [newAlert, ...prev]);
      }, 45000);
    }
    return () => clearInterval(interval);
  }, [isAvailable]);

  // --- Components ---

  const renderSOSItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.sosCard, 
        { backgroundColor: colors.card, opacity: isAvailable ? 1 : 0.5 }
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
          <Text style={[styles.sosTitle, { color: colors.text }]}>{item.type} Alert</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <Text style={[styles.locationText, { color: colors.subText }]}>
          <Ionicons name="location" size={14} color={colors.subText} /> {item.location}
        </Text>
        <View style={styles.respondBtn}>
          <Text style={styles.respondText}>Accept & View Map</Text>
          <Ionicons name="map-outline" size={16} color="#fff" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} />
      
      {/* 1. Functional Settings Button */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcome, { color: colors.subText }]}>OFFICER ID: NP-4412</Text>
          <Text style={[styles.title, { color: colors.text }]}>Responder Portal</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* 2. Functional Duty Toggle */}
      <View style={[
        styles.statusCard, 
        { backgroundColor: isAvailable ? '#10b98115' : '#64748b15', borderWidth: 1, borderColor: isAvailable ? '#10b98140' : '#64748b40' }
      ]}>
        <View>
          <Text style={[styles.statusTitle, { color: isAvailable ? '#10b981' : '#64748b' }]}>
            {isAvailable ? "ON DUTY - ACTIVE" : "OFF DUTY"}
          </Text>
          <Text style={{ color: colors.subText, fontSize: 12 }}>
            {isAvailable ? "Location being tracked..." : "Location hidden"}
          </Text>
        </View>
        <Switch 
          value={isAvailable} 
          onValueChange={setIsAvailable}
          trackColor={{ false: "#767577", true: "#10b981" }}
        />
      </View>

      {/* 3. Dynamic Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNum, { color: colors.text }]}>{stats.solved}</Text>
          <Text style={styles.statLabel}>Solved</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNum, { color: '#ef4444' }]}>
            {isAvailable ? stats.active : 0}
          </Text>
          <Text style={styles.statLabel}>Live SOS</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Live Emergency Feed</Text>
      
      {/* 4. Functional Feed with Refresh */}
      <FlatList
        data={isAvailable ? sosData : []}
        renderItem={renderSOSItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons 
              name={isAvailable ? "check-circle-outline" : "eye-off-outline"} 
              size={50} 
              color={colors.subText} 
            />
            <Text style={{ color: colors.subText, marginTop: 10 }}>
              {isAvailable ? "No active alerts" : "Go on duty to receive alerts"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 25 },
  welcome: { fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: 'bold' },
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderRadius: 18, marginBottom: 20 },
  statusTitle: { fontSize: 16, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statBox: { width: '47%', padding: 18, borderRadius: 20, alignItems: 'center', elevation: 2 },
  statNum: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#94a3b8', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  sosCard: { flexDirection: 'row', borderRadius: 18, marginBottom: 15, overflow: 'hidden', elevation: 3 },
  severityBar: { width: 6 },
  cardContent: { flex: 1, padding: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  sosTitle: { fontSize: 16, fontWeight: 'bold' },
  timeText: { fontSize: 12, color: '#94a3b8' },
  locationText: { fontSize: 14, marginTop: 5, marginBottom: 15 },
  respondBtn: { backgroundColor: '#3b82f6', flexDirection: 'row', alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  respondText: { color: '#fff', fontWeight: 'bold', fontSize: 12, marginRight: 8 },
  emptyContainer: { alignItems: 'center', marginTop: 50 }
});