import React, { useState, useEffect, useContext } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  ActivityIndicator, StatusBar, Linking 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { getDistance } from 'geolib';

// FIREBASE
import { db } from '../../context/firebaseConfig';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';

export default function SOSList({ navigation }) {
  const { isDarkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [emergencies, setEmergencies] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  // 1. Get Officer's Current Location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
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
      
      // Sort by newest first
      setEmergencies(items.sort((a, b) => b.timestamp - a.timestamp));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 3. Handle Dispatch / Accept SOS
  const handleRespond = async (item) => {
    try {
      const docRef = doc(db, "emergencies", item.id);
      await updateDoc(docRef, {
        status: "responding",
        responderId: user.uid,
        responderName: user.full_name
      });
      // Navigate to a dedicated map tracking screen
      navigation.navigate('RealTimeMap', { emergencyId: item.id, victimLocation: item.location });
    } catch (error) {
      console.error(error);
    }
  };

  const renderItem = ({ item }) => {
    // Calculate distance if coordinates exist
    let distance = "Scanning...";
    if (userLocation && item.location) {
      const d = getDistance(
        { latitude: userLocation.latitude, longitude: userLocation.longitude },
        { latitude: item.location.latitude, longitude: item.location.longitude }
      );
      distance = (d / 1000).toFixed(1) + " km away";
    }

    return (
      <View style={[styles.sosCard, { backgroundColor: isDarkMode ? '#1D2136' : '#fff' }]}>
        <View style={styles.cardHeader}>
          <View style={[styles.typeBadge, { backgroundColor: item.type === 'Medical' ? '#ef4444' : '#f59e0b' }]}>
            <Text style={styles.typeText}>{item.type?.toUpperCase() || 'EMERGENCY'}</Text>
          </View>
          <Text style={styles.timeText}>{distance}</Text>
        </View>

        <View style={styles.victimInfo}>
          <Ionicons name="person" size={16} color="#4D94FF" />
          <Text style={[styles.victimName, { color: isDarkMode ? '#fff' : '#000' }]}>
            {item.userName || "Anonymous User"}
          </Text>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description || "No additional details provided. Proceed with caution."}
        </Text>

        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={styles.callBtn} 
            onPress={() => Linking.openURL(`tel:${item.userPhone}`)}
          >
            <Ionicons name="call" size={20} color="#10b981" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.respondBtn}
            onPress={() => handleRespond(item)}
          >
            <Text style={styles.respondBtnText}>RESPOND NOW</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0A0E21' : '#f8fafc' }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#000' }]}>LIVE DISPATCH</Text>
        <View style={styles.liveDot} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#4D94FF" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={emergencies}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 20 }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="shield-check" size={80} color="#10b981" />
              <Text style={styles.emptyText}>Area Secure. No active SOS.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 22, fontWeight: '900', marginLeft: 15, letterSpacing: 1 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', marginLeft: 10 },
  sosCard: { borderRadius: 20, padding: 20, marginBottom: 15, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  typeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  typeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  timeText: { color: '#64748b', fontSize: 12, fontWeight: '700' },
  victimInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  victimName: { marginLeft: 8, fontSize: 16, fontWeight: '700' },
  description: { color: '#94a3b8', fontSize: 13, lineHeight: 18, marginBottom: 20 },
  actionRow: { flexDirection: 'row', gap: 10 },
  callBtn: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center' },
  respondBtn: { flex: 1, height: 50, backgroundColor: '#4D94FF', borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  respondBtnText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { color: '#64748b', marginTop: 20, fontWeight: '700' }
});