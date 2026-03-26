import React, { useContext, useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, 
  StatusBar, ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { SafeAreaView } from 'react-native-safe-area-context';

// NEW: BIOMETRICS & HAPTICS
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';

// FIREBASE IMPORTS
import { db } from '../../context/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// CONTEXTS
import { AuthContext } from '../../context/AuthContext'; 
import { ThemeContext } from '../../context/ThemeContext'; 

const { width } = Dimensions.get('window');

export default function ResponderDashboard({ navigation }) {
  const { user } = useContext(AuthContext) || {};
  const { isDarkMode } = useContext(ThemeContext) || { isDarkMode: true };

  // --- STATES ---
  const [loading, setLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false); 
  const [stats, setStats] = useState({ activeSOS: 0, totalReports: 0 });
  const [weather] = useState({ temp: '34°C', condition: 'CLEAR SKIES' });

  // --- 1. REAL-TIME SOS LISTENER ---
  useEffect(() => {
    const sosQuery = query(
      collection(db, "emergencies"), 
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(sosQuery, (snapshot) => {
      setStats(prev => ({ ...prev, activeSOS: snapshot.docs.length }));
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- 2. SECURE RETURN TO CITIZEN LOGIC ---
  const handleReturnToCitizen = async () => {
    // A. Trigger physical vibration to confirm 2s hold is complete
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    // B. Check Biometrics
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm Identity to Exit Police Mode',
        fallbackLabel: 'Use Passcode',
      });

      if (!result.success) {
        Alert.alert("Access Denied", "Identity verification failed.");
        return;
      }
    }

    // C. Successful Auth - Proceed to switch
    setIsSwitching(true);
    setTimeout(() => {
      setIsSwitching(false);
      navigation.navigate('Profile'); 
    }, 2000);
  };

  // --- THEME STYLES ---
  const themeContainer = { backgroundColor: isDarkMode ? '#0A0E21' : '#f1f5f9' };
  const themeCard = { backgroundColor: isDarkMode ? '#1D2136' : '#ffffff' };
  const themeText = { color: isDarkMode ? '#FFFFFF' : '#0f172a' };

  if (loading) {
    return (
      <View style={[styles.centered, themeContainer]}>
        <ActivityIndicator size="large" color="#4D94FF" />
        <Text style={[styles.loadingText, themeText]}>SYNCING WITH DISPATCH...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, themeContainer]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* SWITCHING OVERLAY MESSAGE */}
      {isSwitching && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#4D94FF" />
          <Text style={styles.overlayText}>Returning to Citizen Mode...</Text>
          <Text style={styles.subOverlayText}>TERMINATING SECURE SESSION</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* HEADER SECTION */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge} />
            <View>
              <Text style={[styles.headerTitle, themeText]}>GUARDIAN OPS</Text>
              <View style={styles.statusRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.statusText}>ENCRYPTED CHANNEL</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            delayLongPress={2000}
            onLongPress={handleReturnToCitizen}
            style={styles.profileBtn}
            activeOpacity={0.6}
          >
            <Ionicons name="person-circle" size={44} color="#4D94FF" />
            <View style={[styles.smallSwapIcon, { borderColor: isDarkMode ? '#0A0E21' : '#f1f5f9' }]}>
                <Ionicons name="swap-horizontal" size={10} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* OFFICER WELCOME */}
        <View style={styles.welcomeBox}>
           <Text style={styles.unitIdText}>UNIT: {user?.id?.slice(-6).toUpperCase() || "PATROL-1"}</Text>
           <Text style={[styles.officerName, themeText]}>Officer {user?.full_name?.split(' ')[0] || "Responder"}</Text>
        </View>

        {/* WEATHER & DISPATCH INFO */}
        <View style={[styles.infoCard, themeCard]}>
          <View>
            <Text style={styles.locationText}><Ionicons name="location" size={14}/> Chandragiri, NP</Text>
            <Text style={[styles.weatherCondition, themeText]}>{weather.condition}</Text>
          </View>
          <Text style={[styles.tempText, themeText]}>{weather.temp}</Text>
        </View>

        {/* TACTICAL STATS */}
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={[styles.statBox, themeCard, { borderLeftColor: stats.activeSOS > 0 ? '#FF4D4D' : '#4D94FF' }]}
            onPress={() => navigation.navigate('SOSList')}
          >
            <Text style={[styles.statNumber, { color: stats.activeSOS > 0 ? '#FF4D4D' : '#4D94FF' }]}>
              {stats.activeSOS.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.statLabel}>LIVE SOS</Text>
            {stats.activeSOS > 0 && <View style={styles.alertPulse} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statBox, themeCard, { borderLeftColor: '#A29BFE' }]}
            onPress={() => navigation.navigate('History')}
          >
            <Text style={[styles.statNumber, { color: '#A29BFE' }]}>12</Text>
            <Text style={styles.statLabel}>MY LOGS</Text>
          </TouchableOpacity>
        </View>

        {/* TOOLS GRID */}
        <Text style={[styles.sectionTitle, themeText]}>TACTICAL TOOLS</Text>
        <View style={styles.grid}>
          <ToolIcon name="radio" label="Live Feed" color="#FF4D4D" isDark={isDarkMode} onPress={() => navigation.navigate('SOSList')} />
          <ToolIcon name="map" label="Patrol Map" color="#4D94FF" isDark={isDarkMode} onPress={() => navigation.navigate('RealTimeMap')} />
          <ToolIcon name="megaphone" label="Broadcast" color="#FFA500" isDark={isDarkMode} onPress={() => navigation.navigate('AlertScreen')} />
          <ToolIcon name="shield-half" label="Unit List" color="#6C63FF" isDark={isDarkMode} onPress={() => navigation.navigate('EmergencyContactsScreen')} />
          <ToolIcon name="document-text" label="Incident Log" color="#00CEC9" isDark={isDarkMode} onPress={() => navigation.navigate('NewReport')} />
          <ToolIcon name="settings" label="Settings" color="#8E8E93" isDark={isDarkMode} onPress={() => navigation.navigate('Profile')} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const ToolIcon = ({ name, label, color, isDark, onPress }) => (
  <TouchableOpacity style={styles.toolItem} onPress={onPress}>
    <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1D2136' : '#ffffff' }]}>
      <Ionicons name={name} size={28} color={color} />
    </View>
    <Text style={[styles.toolLabel, { color: isDark ? '#94a3b8' : '#475569' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(2, 6, 23, 0.98)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 9999 
  },
  overlayText: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 20 },
  subOverlayText: { color: '#4D94FF', fontSize: 10, marginTop: 8, letterSpacing: 2, fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 15 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logoBadge: { width: 5, height: 30, backgroundColor: '#4D94FF', borderRadius: 2, marginRight: 12 },
  headerTitle: { fontSize: 20, fontWeight: '900' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#00FF00', marginRight: 5 },
  statusText: { fontSize: 9, color: '#8E8E93', fontWeight: 'bold' },
  welcomeBox: { paddingHorizontal: 20, marginTop: 30 },
  unitIdText: { color: '#4D94FF', fontWeight: '800', fontSize: 11, letterSpacing: 2 },
  officerName: { fontSize: 32, fontWeight: '800' },
  infoCard: { borderRadius: 20, padding: 25, marginTop: 20, marginHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 5 },
  locationText: { color: '#8E8E93', fontSize: 13, fontWeight: '700' },
  weatherCondition: { fontWeight: '800', marginTop: 5, fontSize: 16 },
  tempText: { fontSize: 44, fontWeight: '200' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, paddingHorizontal: 20 },
  statBox: { width: '47%', borderRadius: 18, padding: 20, borderLeftWidth: 5 },
  statNumber: { fontSize: 38, fontWeight: '900' },
  statLabel: { color: '#8E8E93', marginTop: 5, fontWeight: '800', fontSize: 11 },
  alertPulse: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF4D4D' },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginTop: 40, paddingHorizontal: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 20, paddingHorizontal: 15 },
  toolItem: { width: '33.33%', alignItems: 'center', marginBottom: 25 },
  iconCircle: { padding: 18, borderRadius: 22, marginBottom: 10, elevation: 4 },
  toolLabel: { fontSize: 11, fontWeight: '800', textAlign: 'center' },
  profileBtn: { position: 'relative' },
  smallSwapIcon: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: '#4D94FF', 
    borderRadius: 10, 
    padding: 2,
    borderWidth: 2
  }
});