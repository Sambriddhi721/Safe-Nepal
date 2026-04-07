import React, { useState, useEffect, useContext, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, StatusBar, Linking, Alert 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { getDistance } from 'geolib';

// FIREBASE
import { db } from '../../context/firebaseConfig';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';

export default function SOSList({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const isDarkMode = theme === 'dark';
  
  const [loading, setLoading] = useState(true);
  const [emergencies, setEmergencies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  // 1. Get Officer's Current Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setUserLocation(location.coords);
    })();
  }, []);

  // 2. Real-time Listener for Active SOS
  useEffect(() => {
    const q = query(
      collection(db, "emergencies"), 
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Sort by newest first (assuming you have a server timestamp)
      setEmergencies(items.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds));
      setLoading(false);
    }, (error) => {
      console.error("Firebase Snapshot Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. Handle Dispatch / Accept SOS
  const handleRespond = async (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    Alert.alert(
      "CONFIRM DISPATCH",
      `Initialize emergency response for ${item.userName || 'Unknown'}?`,
      [
        { text: "ABORT", style: "cancel" },
        { 
          text: "RESPOND NOW", 
          onPress: async () => {
            try {
              const docRef = doc(db, "emergencies", item.id);
              await updateDoc(docRef, {
                status: "responding",
                responderId: user?.uid || 'anonymous',
                responderName: user?.full_name || 'Field Unit'
              });
              
              navigation.navigate('RealTimeMap', { 
                emergencyId: item.id, 
                victimLocation: item.location,
                victimName: item.userName 
              });
            } catch (error) {
              Alert.alert("Error", "Failed to update emergency status.");
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => {
    let distanceStr = "Distance Pending...";
    if (userLocation && item.location?.latitude) {
      const d = getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: item.location.latitude, longitude: item.location.longitude }
      );
      distanceStr = (d / 1000).toFixed(1) + " KM AWAY";
    }

    const severityColor = item.type === 'Medical' ? '#ef4444' : '#f59e0b';

    return (
      <View style={[styles.sosCard, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}>
        <View style={[styles.severityBar, { backgroundColor: severityColor }]} />
        
        <View style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <View style={[styles.typeBadge, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <Text style={[styles.typeText, { color: severityColor }]}>
                {item.type?.toUpperCase() || 'EMERGENCY'}
              </Text>
            </View>
            <Text style={styles.timeText}>{distanceStr}</Text>
          </View>

          <View style={styles.victimInfo}>
            <MaterialCommunityIcons name="account-alert" size={20} color="#3b82f6" />
            <Text style={[styles.victimName, { color: isDarkMode ? '#fff' : '#0f172a' }]}>
              {item.userName || "Unknown Victim"}
            </Text>
          </View>

          <Text style={[styles.description, { color: isDarkMode ? '#94a3b8' : '#64748b' }]} numberOfLines={2}>
            {item.description || "No voice/text details. Proceeding with emergency protocols."}
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.callBtn, { borderColor: isDarkMode ? '#334155' : '#e2e8f0' }]} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Linking.openURL(`tel:${item.userPhone}`);
              }}
            >
              <Ionicons name="call" size={22} color="#10b981" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.respondBtn}
              onPress={() => handleRespond(item)}
            >
              <Text style={styles.respondBtnText}>INITIALIZE RESPONSE</Text>
              <Ionicons name="shield-checkmark" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#020617' : '#f8fafc' }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backCircle}>
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <View style={styles.headerTextGroup}>
          <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Tactical Feed</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveText}>LIVE BROADCAST</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#bef264" />
          <Text style={{ color: '#64748b', marginTop: 15, fontWeight: '800' }}>SYNCING WITH DISPATCH...</Text>
        </View>
      ) : (
        <FlatList
          data={emergencies}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="shield-check-outline" size={80} color="#334155" />
              <Text style={styles.emptyText}>Sector Secure. No Pending Alerts.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, marginBottom: 10 },
  backCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(148, 163, 184, 0.1)', justifyContent: 'center', alignItems: 'center' },
  headerTextGroup: { marginLeft: 15 },
  headerTitle: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  pulseDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#ef4444', marginRight: 6 },
  liveText: { color: '#ef4444', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  
  sosCard: { borderRadius: 24, marginBottom: 16, flexDirection: 'row', overflow: 'hidden', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  severityBar: { width: 6 },
  cardInner: { flex: 1, padding: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  typeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  timeText: { color: '#3b82f6', fontSize: 11, fontWeight: '900' },
  
  victimInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  victimName: { marginLeft: 10, fontSize: 18, fontWeight: '700' },
  description: { fontSize: 13, lineHeight: 18, marginBottom: 20, fontWeight: '500' },
  
  actionRow: { flexDirection: 'row', gap: 12 },
  callBtn: { width: 54, height: 54, borderRadius: 18, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
  respondBtn: { flex: 1, height: 54, backgroundColor: '#3b82f6', borderRadius: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  respondBtnText: { color: '#fff', fontWeight: '900', fontSize: 13, letterSpacing: 1 },
  
  emptyState: { alignItems: 'center', marginTop: 120 },
  emptyText: { color: '#475569', marginTop: 20, fontWeight: '800', fontSize: 16 }
});