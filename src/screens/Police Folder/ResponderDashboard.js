import React, { useContext, useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, 
  StatusBar, ActivityIndicator, Alert, Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons'; 
import { SafeAreaView } from 'react-native-safe-area-context';

// NATIVE MODULES
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';

// FIREBASE
import { db } from '../../context/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// CONTEXTS
import { AuthContext } from '../../context/AuthContext'; 
import { ThemeContext } from '../../context/ThemeContext'; 

export default function ResponderDashboard({ navigation }) {
  const { user } = useContext(AuthContext) || {};
  const { isDarkMode } = useContext(ThemeContext) || { isDarkMode: true };

  // --- STATES ---
  const [loading, setLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false); 
  const [stats, setStats] = useState({ activeSOS: 0, resolved: 8 });

  // --- 1. REAL-TIME DISPATCH LISTENER ---
  useEffect(() => {
    const sosQuery = query(
      collection(db, "emergencies"), 
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(sosQuery, (snapshot) => {
      setStats(prev => ({ ...prev, activeSOS: snapshot.docs.length }));
      setLoading(false);
    }, (error) => {
      console.warn("Firestore Listener Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- 2. SECURE MODE SWITCHING ---
  const handleReturnToCitizen = async () => {
    // Immediate haptic feedback to signal long-press success
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Verify Identity to Terminate Responder Session',
        fallbackLabel: 'Enter Passcode',
      });

      if (!result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
    }

    // Success - Initiate Transition
    setIsSwitching(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    setTimeout(() => {
      setIsSwitching(false);
      navigation.navigate('UserHome'); // Returning to Citizen Home
    }, 1500);
  };

  // --- STYLING ---
  const themeContainer = { backgroundColor: isDarkMode ? '#0A0E21' : '#f8fafc' };
  const themeCard = { backgroundColor: isDarkMode ? '#1D2136' : '#ffffff' };
  const themeText = { color: isDarkMode ? '#FFFFFF' : '#1e293b' };

  if (loading) {
    return (
      <View style={[styles.centered, themeContainer]}>
        <ActivityIndicator size="large" color="#4D94FF" />
        <Text style={[styles.loadingText, { color: isDarkMode ? '#94a3b8' : '#64748b' }]}>
          CONNECTING TO GUARDIAN NETWORK...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, themeContainer]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* SECURITY OVERLAY */}
      {isSwitching && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#4D94FF" />
          <Text style={styles.overlayText}>Switching Modes...</Text>
          <Text style={styles.subOverlayText}>ENCRYPTION SESSION ENDING</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.logoBadge} />
            <View>
              <Text style={[styles.headerTitle, themeText]}>SN-RESPONDER</Text>
              <View style={styles.statusRow}>
                <View style={styles.onlineDot} />
                <Text style={styles.statusText}>ENCRYPTED CHANNEL</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity 
            delayLongPress={1500} 
            onLongPress={handleReturnToCitizen}
            style={styles.profileBtn}
          >
            <Ionicons name="shield-checkmark-circle" size={48} color="#4D94FF" />
          </TouchableOpacity>
        </View>

        {/* OFFICER ID */}
        <View style={styles.welcomeBox}>
           <Text style={styles.unitIdText}>UNIT: SN-{user?.id?.slice(-4).toUpperCase() || "4412"}</Text>
           <Text style={[styles.officerName, themeText]}>Officer {user?.full_name?.split(' ')[0] || "Responder"}</Text>
        </View>

        {/* TACTICAL STATS */}
        <View style={styles.statsRow}>
          <TouchableOpacity 
            style={[styles.statBox, themeCard, { borderLeftColor: stats.activeSOS > 0 ? '#ef4444' : '#4D94FF' }]}
            onPress={() => navigation.navigate('SOSList')}
          >
            <Text style={[styles.statNumber, { color: stats.activeSOS > 0 ? '#ef4444' : '#4D94FF' }]}>
              {stats.activeSOS.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.statLabel}>ACTIVE SOS</Text>
            {stats.activeSOS > 0 && <View style={styles.alertPulse} />}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.statBox, themeCard, { borderLeftColor: '#10b981' }]}
            onPress={() => navigation.navigate('PastReports')}
          >
            <Text style={[styles.statNumber, { color: '#10b981' }]}>{stats.resolved}</Text>
            <Text style={styles.statLabel}>RESOLVED</Text>
          </TouchableOpacity>
        </View>

        {/* TOOLS GRID */}
        <Text style={[styles.sectionTitle, themeText]}>TACTICAL TOOLS</Text>
        <View style={styles.grid}>
          <ToolIcon name="radio" label="Live Feed" color="#ef4444" isDark={isDarkMode} onPress={() => navigation.navigate('SOSList')} />
          <ToolIcon name="map" label="Live Map" color="#4D94FF" isDark={isDarkMode} onPress={() => navigation.navigate('RealTimeMap')} />
          <ToolIcon name="megaphone" label="Broadcast" color="#f59e0b" isDark={isDarkMode} onPress={() => navigation.navigate('AlertScreen')} />
          <ToolIcon name="people" label="Volunteers" color="#8b5cf6" isDark={isDarkMode} onPress={() => navigation.navigate('Volunteer')} />
          <ToolIcon name="document-text" label="Incident Log" color="#06b6d4" isDark={isDarkMode} onPress={() => navigation.navigate('IncidentReport')} />
          <ToolIcon name="settings" label="Settings" color="#64748b" isDark={isDarkMode} onPress={() => navigation.navigate('AccountSettings')} />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// Reusable Tool Icon Component
const ToolIcon = ({ name, label, color, isDark, onPress }) => (
  <TouchableOpacity style={styles.toolItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1D2136' : '#ffffff' }]}>
      <Ionicons name={name} size={28} color={color} />
    </View>
    <Text style={[styles.toolLabel, { color: isDark ? '#94a3b8' : '#475569' }]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontSize: 10, letterSpacing: 2, fontWeight: 'bold' },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(2, 6, 23, 0.99)', 
    justifyContent: 'center', alignItems: 'center', zIndex: 9999 
  },
  overlayText: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 20 },
  subOverlayText: { color: '#4D94FF', fontSize: 10, marginTop: 8, letterSpacing: 2, fontWeight: 'bold' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 15 },
  brandRow: { flexDirection: 'row', alignItems: 'center' },
  logoBadge: { width: 4, height: 28, backgroundColor: '#4D94FF', borderRadius: 2, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e', marginRight: 5 },
  statusText: { fontSize: 8, color: '#8E8E93', fontWeight: 'bold' },
  welcomeBox: { paddingHorizontal: 20, marginTop: 25 },
  unitIdText: { color: '#4D94FF', fontWeight: '800', fontSize: 10, letterSpacing: 1.5 },
  officerName: { fontSize: 34, fontWeight: '900' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 25, paddingHorizontal: 20 },
  statBox: { width: '47%', borderRadius: 20, padding: 18, borderLeftWidth: 4, elevation: 3 },
  statNumber: { fontSize: 36, fontWeight: '900' },
  statLabel: { color: '#8E8E93', marginTop: 4, fontWeight: '800', fontSize: 10 },
  alertPulse: { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444' },
  sectionTitle: { fontSize: 13, fontWeight: '900', marginTop: 35, paddingHorizontal: 20, color: '#4D94FF', letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 15, paddingHorizontal: 15 },
  toolItem: { width: '33.33%', alignItems: 'center', marginBottom: 20 },
  iconCircle: { padding: 18, borderRadius: 22, marginBottom: 10, elevation: 2 },
  toolLabel: { fontSize: 10, fontWeight: '800', textAlign: 'center' },
  profileBtn: { elevation: 5 }
});