import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 

// 1. FIXED PATH: Reliable access to your Auth and Theme contexts
import { AuthContext } from '../../context/AuthContext'; 
import { ThemeContext } from '../../context/ThemeContext'; 

// 2. FIXED WARNING: Proper SafeAreaView for modern device notches
import { SafeAreaView } from 'react-native-safe-area-context'; 

export default function ResponderDashboard({ navigation }) {
  // Use fallbacks to prevent crashes if a context provider is missing during dev
  const { user } = useContext(AuthContext) || {};
  const { isDarkMode } = useContext(ThemeContext) || { isDarkMode: true };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0A0E21' : '#f1f5f9' }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.logoBadge} />
            <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : '#0f172a' }]}>Responder</Text>
          </View>
          
          {/* Navigates to Profile where the "Switch to Citizen" button lives */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.7}
            style={styles.profileButton}
          >
            <Ionicons name="person-circle" size={40} color={isDarkMode ? "#4D94FF" : "#3b82f6"} />
          </TouchableOpacity>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeSection}>
           <Text style={styles.welcomeSub}>OFFICER ON DUTY</Text>
           <Text style={[styles.welcomeMain, { color: isDarkMode ? 'white' : '#0f172a' }]}>
             {user?.full_name || "Responder"}
           </Text>
        </View>

        {/* Weather Card */}
        <View style={[styles.weatherCard, { backgroundColor: isDarkMode ? '#1D2136' : '#ffffff' }]}>
          <View>
            <Text style={styles.locationText}>📍 Chandragiri, Nepal</Text>
            <Text style={[styles.weatherSubText, { color: isDarkMode ? 'white' : '#0f172a' }]}>SCATTERED CLOUDS</Text>
          </View>
          <Text style={[styles.tempText, { color: isDarkMode ? 'white' : '#0f172a' }]}>34°C</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.statBox, { backgroundColor: isDarkMode ? '#1D2136' : '#fff', borderLeftColor: '#FF4D4D', borderLeftWidth: 4 }]}
            onPress={() => navigation.navigate('SOSList')}
          >
            <Text style={[styles.statNumber, { color: '#FF4D4D' }]}>03</Text>
            <Text style={styles.statLabel}>Active SOS</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            style={[styles.statBox, { backgroundColor: isDarkMode ? '#1D2136' : '#fff', borderLeftColor: '#4D94FF', borderLeftWidth: 4 }]}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={[styles.statNumber, { color: '#4D94FF' }]}>12</Text>
            <Text style={styles.statLabel}>Reports</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : '#0f172a' }]}>Responder Tools</Text>

        {/* Tools Grid */}
        <View style={styles.grid}>
          <ToolIcon 
            name="alert-circle" 
            label="SOS Feed" 
            color="#FF4D4D" 
            isDarkMode={isDarkMode}
            onPress={() => navigation.navigate('SOSList')} 
          />
          <ToolIcon 
            name="location" 
            label="Patrol Map" 
            color="#4D94FF" 
            isDarkMode={isDarkMode}
            onPress={() => navigation.navigate('RealTimeMap')} 
          />
          <ToolIcon 
            name="megaphone" 
            label="Broadcast" 
            color="#FFA500" 
            isDarkMode={isDarkMode}
            onPress={() => navigation.navigate('AlertScreen')} 
          />
          <ToolIcon 
            name="shield-checkmark" 
            label="Quick Units" 
            color="#6C63FF" 
            isDarkMode={isDarkMode}
            onPress={() => navigation.navigate('EmergencyContactsScreen')} 
          />
          <ToolIcon 
            name="document-text" 
            label="Submit Log" 
            color="#A29BFE" 
            isDarkMode={isDarkMode}
            onPress={() => navigation.navigate('NewReport')} 
          />
          <ToolIcon 
            name="time" 
            label="Archives" 
            color="#00CEC9" 
            isDarkMode={isDarkMode}
            onPress={() => navigation.navigate('History')} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Sub-component for individual tool items
const ToolIcon = ({ name, label, color, onPress, isDarkMode }) => (
  <TouchableOpacity style={styles.toolItem} onPress={onPress} activeOpacity={0.6}>
    <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#1D2136' : '#ffffff' }]}>
      <Ionicons name={name} size={28} color={color} />
    </View>
    <Text style={[styles.toolLabel, { color: isDarkMode ? 'white' : '#475569' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: 10, 
    paddingHorizontal: 20 
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold', marginLeft: 10 },
  logoBadge: { width: 8, height: 25, backgroundColor: '#4D94FF', borderRadius: 4 },
  welcomeSection: { paddingHorizontal: 20, marginTop: 25 },
  welcomeSub: { color: '#4D94FF', fontWeight: 'bold', fontSize: 12, letterSpacing: 2 },
  welcomeMain: { fontSize: 28, fontWeight: 'bold', marginTop: 5 },
  weatherCard: { 
    borderRadius: 20, 
    padding: 25, 
    marginTop: 20, 
    marginHorizontal: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  locationText: { color: '#8E8E93', fontSize: 14, fontWeight: '600' },
  weatherSubText: { fontWeight: 'bold', marginTop: 5, fontSize: 16 },
  tempText: { fontSize: 48, fontWeight: '300' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingHorizontal: 20 },
  statBox: { width: '48%', borderRadius: 15, padding: 20, alignItems: 'center', elevation: 2 },
  statNumber: { fontSize: 32, fontWeight: 'bold' },
  statLabel: { color: '#8E8E93', marginTop: 5, fontWeight: '600', fontSize: 12 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 35, paddingHorizontal: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20, paddingHorizontal: 15 },
  toolItem: { width: '33.33%', alignItems: 'center', marginBottom: 25 },
  iconCircle: { padding: 18, borderRadius: 22, marginBottom: 10, elevation: 3 },
  toolLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },
  profileButton: { padding: 5 }
});