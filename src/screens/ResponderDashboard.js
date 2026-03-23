import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

// 1. FIXED PATH: Go up one level to 'src', then into 'context'
import { AuthContext } from '../context/AuthContext'; 

// 2. FIXED WARNING: Use the context-aware SafeAreaView
import { SafeAreaView } from 'react-native-safe-area-context'; 

export default function ResponderDashboard({ navigation }) {
  // Added a fallback {} to prevent errors if context is undefined
  const { switchRole } = useContext(AuthContext) || {};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.logoBadge} />
            <Text style={styles.headerTitle}>Responder</Text>
          </View>
          {/* Typically, clicking the profile should go to the Profile screen 
              where your "Mode Switch" button is located */}
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person-circle" size={35} color="white" />
          </TouchableOpacity>
        </View>

        {/* Weather Card */}
        <View style={styles.weatherCard}>
          <View>
            <Text style={styles.locationText}>📍 Chandragiri</Text>
            <Text style={styles.weatherSubText}>SCATTERED CLOUDS</Text>
          </View>
          <Text style={styles.tempText}>34°C</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={[styles.statBox, { borderLeftColor: '#FF4D4D', borderLeftWidth: 4 }]}
            onPress={() => navigation.navigate('SOSList')}
          >
            <Text style={[styles.statNumber, { color: '#FF4D4D' }]}>03</Text>
            <Text style={styles.statLabel}>Active SOS</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statBox, { borderLeftColor: '#4D94FF', borderLeftWidth: 4 }]}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={[styles.statNumber, { color: '#4D94FF' }]}>12</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Responder Tools</Text>

        {/* Tools Grid */}
        <View style={styles.grid}>
          <ToolIcon 
            name="alert-circle" 
            label="SOS Feed" 
            color="#FF4D4D" 
            onPress={() => navigation.navigate('SOSList')} 
          />
          <ToolIcon 
            name="location" 
            label="Patrol" 
            color="#4D94FF" 
            onPress={() => navigation.navigate('RealTimeMap')} 
          />
          <ToolIcon 
            name="megaphone" 
            label="Broadcast" 
            color="#FFA500" 
            onPress={() => navigation.navigate('AlertScreen')} 
          />
          <ToolIcon 
            name="shield-checkmark" 
            label="Units" 
            color="#6C63FF" 
            onPress={() => navigation.navigate('EmergencyContactsScreen')} 
          />
          <ToolIcon 
            name="document-text" 
            label="Reports" 
            color="#A29BFE" 
            onPress={() => navigation.navigate('History')} 
          />
          <ToolIcon 
            name="time" 
            label="History" 
            color="#00CEC9" 
            onPress={() => navigation.navigate('History')} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ToolIcon = ({ name, label, color, onPress }) => (
  <TouchableOpacity style={styles.toolItem} onPress={onPress}>
    <View style={styles.iconCircle}>
      <Ionicons name={name} size={28} color={color} />
    </View>
    <Text style={styles.toolLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E21' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingHorizontal: 20 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: 'bold', marginLeft: 10 },
  logoBadge: { width: 20, height: 25, backgroundColor: '#4D94FF', borderRadius: 4 },
  weatherCard: { backgroundColor: '#1D2136', borderRadius: 20, padding: 25, marginTop: 25, marginHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  locationText: { color: '#8E8E93', fontSize: 16 },
  weatherSubText: { color: 'white', fontWeight: 'bold', marginTop: 5 },
  tempText: { color: 'white', fontSize: 48, fontWeight: '300' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingHorizontal: 20 },
  statBox: { backgroundColor: '#1D2136', width: '48%', borderRadius: 15, padding: 20, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { color: '#8E8E93', marginTop: 5 },
  sectionTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginTop: 30, paddingHorizontal: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20, paddingHorizontal: 20 },
  toolItem: { width: '30%', alignItems: 'center', marginBottom: 25 },
  iconCircle: { backgroundColor: '#1D2136', padding: 15, borderRadius: 20, marginBottom: 8 },
  toolLabel: { color: 'white', fontSize: 12 }
});