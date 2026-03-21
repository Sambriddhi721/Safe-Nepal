import React, { useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  StatusBar, SafeAreaView, Switch 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

const MOCK_SOS = [
  { id: '1', type: 'Flood', location: 'Balkhu, Ward 14', time: '2m ago', severity: 'Critical' },
  { id: '2', type: 'Landslide', location: 'Nagarkot Road', time: '5m ago', severity: 'High' },
  { id: '3', type: 'Medical', location: 'Patan Durbar Sq', time: '12m ago', severity: 'Medium' },
];

export default function PoliceDashboardScreen({ navigation }) {
  const { colors, theme } = useContext(ThemeContext);
  const [isAvailable, setIsAvailable] = useState(true);

  const renderSOSItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.sosCard, { backgroundColor: colors.card }]}
      onPress={() => Alert.alert("Emergency Details", `Responding to ${item.type} at ${item.location}`)}
    >
      <View style={[styles.severityBar, { backgroundColor: item.severity === 'Critical' ? '#ef4444' : '#f59e0b' }]} />
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={[styles.sosTitle, { color: colors.text }]}>{item.type} Alert</Text>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        <Text style={[styles.locationText, { color: colors.subText }]}>
          <Ionicons name="location" size={14} /> {item.location}
        </Text>
        <TouchableOpacity style={styles.respondBtn}>
          <Text style={styles.respondText}>View on Map</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? "light-content" : "dark-content"} />
      
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.welcome, { color: colors.subText }]}>Officer ID: NP-4412</Text>
          <Text style={[styles.title, { color: colors.text }]}>Responder Portal</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Ionicons name="settings-outline" size={26} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Duty Status Toggle */}
      <View style={[styles.statusCard, { backgroundColor: isAvailable ? '#10b98120' : '#64748b20' }]}>
        <View>
          <Text style={[styles.statusTitle, { color: isAvailable ? '#10b981' : '#64748b' }]}>
            {isAvailable ? "ON DUTY - ACTIVE" : "OFF DUTY"}
          </Text>
          <Text style={{ color: colors.subText, fontSize: 12 }}>Receiving real-time SOS signals</Text>
        </View>
        <Switch 
          value={isAvailable} 
          onValueChange={setIsAvailable}
          trackColor={{ false: "#767577", true: "#10b981" }}
        />
      </View>

      {/* Statistics Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.card }]}>
          <Text style={styles.statNum}>12</Text>
          <Text style={styles.statLabel}>Reports</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.statNum, { color: '#ef4444' }]}>03</Text>
          <Text style={styles.statLabel}>Active SOS</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Live Emergency Feed</Text>
      
      <FlatList
        data={MOCK_SOS}
        renderItem={renderSOSItem}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 25 },
  welcome: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: 'bold' },
  statusCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderRadius: 20, marginBottom: 20 },
  statusTitle: { fontSize: 16, fontWeight: 'bold' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  statBox: { width: '47%', padding: 20, borderRadius: 20, alignItems: 'center', elevation: 2 },
  statNum: { fontSize: 24, fontWeight: 'bold', color: '#3b82f6' },
  statLabel: { fontSize: 12, color: '#94a3b8', marginTop: 5 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  sosCard: { flexDirection: 'row', borderRadius: 18, marginBottom: 15, overflow: 'hidden', elevation: 3 },
  severityBar: { width: 6 },
  cardContent: { flex: 1, padding: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  sosTitle: { fontSize: 16, fontWeight: 'bold' },
  timeText: { fontSize: 12, color: '#94a3b8' },
  locationText: { fontSize: 14, marginTop: 5, marginBottom: 12 },
  respondBtn: { backgroundColor: '#3b82f6', flexDirection: 'row', alignSelf: 'flex-start', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  respondText: { color: '#fff', fontWeight: 'bold', fontSize: 12, marginRight: 8 }
});