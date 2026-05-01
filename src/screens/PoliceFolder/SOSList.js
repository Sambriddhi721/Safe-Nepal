import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, StatusBar, Linking, Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';

// geolib is optional — graceful fallback if not installed
let getDistance;
try {
  getDistance = require('geolib').getDistance;
} catch (_) {
  getDistance = null;
}

// Firebase — wrapped so app doesn't crash if config is missing
let db, collection, query, where, onSnapshot, updateDoc, doc;
try {
  const firebaseConfig = require('../../context/firebaseConfig');
  db = firebaseConfig.db;
  const firestore = require('firebase/firestore');
  collection = firestore.collection;
  query     = firestore.query;
  where     = firestore.where;
  onSnapshot = firestore.onSnapshot;
  updateDoc  = firestore.updateDoc;
  doc        = firestore.doc;
} catch (_) {
  db = null;
}

import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatTime = (timestamp) => {
  if (!timestamp?.seconds) return 'Just now';
  const diff = Math.floor((Date.now() / 1000) - timestamp.seconds);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const calcDistance = (userLocation, itemLocation) => {
  if (!getDistance || !userLocation || !itemLocation?.latitude) return null;
  try {
    const d = getDistance(
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      { latitude: itemLocation.latitude, longitude: itemLocation.longitude }
    );
    return (d / 1000).toFixed(1);
  } catch (_) {
    return null;
  }
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function SOSList({ navigation }) {
  const { theme } = useContext(ThemeContext) || {};
  const { user }  = useContext(AuthContext)  || {};
  const isDarkMode = theme === 'dark';

  const [loading, setLoading]           = useState(true);
  const [emergencies, setEmergencies]   = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  // Theme-driven colors
  const bg        = isDarkMode ? '#020617' : '#f8fafc';
  const cardBg    = isDarkMode ? '#1e293b' : '#ffffff';
  const textColor = isDarkMode ? '#f1f5f9' : '#0f172a';
  const subColor  = isDarkMode ? '#94a3b8' : '#64748b';
  const borderColor = isDarkMode ? '#334155' : '#e2e8f0';

  // 1. Get officer location
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setUserLocation(loc.coords);
      } catch (_) {
        // Location unavailable — distance will show as pending
      }
    })();
  }, []);

  // 2. Firebase real-time listener — falls back to empty state if db is null
  useEffect(() => {
    if (!db || !collection || !query || !where || !onSnapshot) {
      setLoading(false);
      return;
    }

    let unsubscribe = () => {};
    try {
      const q = query(
        collection(db, 'emergencies'),
        where('status', '==', 'active')
      );

      unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
          // Sort newest first
          items.sort((a, b) => (b.timestamp?.seconds ?? 0) - (a.timestamp?.seconds ?? 0));
          setEmergencies(items);
          setLoading(false);
        },
        (error) => {
          console.error('Firebase Snapshot Error:', error);
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Firebase setup error:', err);
      setLoading(false);
    }

    return () => unsubscribe();
  }, []);

  // 3. Dispatch handler
  const handleRespond = (item) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    Alert.alert(
      'CONFIRM DISPATCH',
      `Initialize emergency response for ${item.userName || 'Unknown'}?`,
      [
        { text: 'ABORT', style: 'cancel' },
        {
          text: 'RESPOND NOW',
          style: 'destructive',
          onPress: async () => {
            // Guard: Firebase may be unavailable
            if (!db || !doc || !updateDoc) {
              // Still navigate — just skip the Firestore write
              navigation?.navigate?.('RealTimeMap', {
                emergencyId: item.id,
                victimLocation: item.location,
                victimName: item.userName,
              });
              return;
            }

            try {
              const docRef = doc(db, 'emergencies', item.id);
              await updateDoc(docRef, {
                status: 'responding',
                responderId:   user?.uid        || 'anonymous',
                responderName: user?.full_name  || 'Field Unit',
                respondedAt:   new Date(),
              });

              navigation?.navigate?.('RealTimeMap', {
                emergencyId:   item.id,
                victimLocation: item.location,
                victimName:    item.userName,
              });
            } catch (error) {
              console.error('Dispatch update error:', error);
              Alert.alert('Error', 'Could not update emergency status. Proceeding anyway.');
              navigation?.navigate?.('RealTimeMap', {
                emergencyId:   item.id,
                victimLocation: item.location,
                victimName:    item.userName,
              });
            }
          },
        },
      ]
    );
  };

  // 4. Call victim — guard against null phone
  const handleCall = (phone) => {
    if (!phone) {
      Alert.alert('No Contact', 'Phone number unavailable for this emergency.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${phone}`).catch(() =>
      Alert.alert('Error', 'Unable to place call.')
    );
  };

  // ── Render Item ─────────────────────────────────────────────────────────

  const renderItem = ({ item }) => {
    const km = calcDistance(userLocation, item.location);
    const distanceStr = km ? `${km} KM AWAY` : 'Distance Pending...';
    const timeStr     = formatTime(item.timestamp);

    const isMedical = item.type === 'Medical';
    const severityColor = isMedical ? '#ef4444' : '#f59e0b';

    return (
      <View style={[styles.sosCard, { backgroundColor: cardBg }]}>
        {/* Left severity stripe */}
        <View style={[styles.severityBar, { backgroundColor: severityColor }]} />

        <View style={styles.cardInner}>
          {/* Top row: badge + distance */}
          <View style={styles.cardHeader}>
            <View style={[styles.typeBadge, { backgroundColor: `${severityColor}18` }]}>
              <MaterialCommunityIcons
                name={isMedical ? 'hospital-box' : 'alert-decagram'}
                size={12}
                color={severityColor}
              />
              <Text style={[styles.typeText, { color: severityColor }]}>
                {item.type?.toUpperCase() || 'EMERGENCY'}
              </Text>
            </View>
            <Text style={styles.distanceText}>{distanceStr}</Text>
          </View>

          {/* Victim name */}
          <View style={styles.victimInfo}>
            <View style={styles.victimAvatar}>
              <Text style={styles.victimAvatarText}>
                {item.userName?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <View>
              <Text style={[styles.victimName, { color: textColor }]}>
                {item.userName || 'Unknown Victim'}
              </Text>
              <Text style={[styles.timeAgo, { color: subColor }]}>{timeStr}</Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: subColor }]} numberOfLines={2}>
            {item.description || 'No voice/text details. Proceeding with emergency protocols.'}
          </Text>

          {/* Location line */}
          {item.location?.latitude && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={subColor} />
              <Text style={[styles.locationText, { color: subColor }]}>
                {item.location.latitude.toFixed(4)}°N · {item.location.longitude.toFixed(4)}°E
              </Text>
            </View>
          )}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: borderColor }]} />

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.callBtn, { borderColor }]}
              onPress={() => handleCall(item.userPhone)}
            >
              <Ionicons name="call" size={20} color="#10b981" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.respondBtn}
              onPress={() => handleRespond(item)}
            >
              <Ionicons name="shield-checkmark" size={16} color="#fff" />
              <Text style={styles.respondBtnText}>INITIALIZE RESPONSE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ── Screen ──────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backCircle, { backgroundColor: isDarkMode ? 'rgba(148,163,184,0.1)' : '#f1f5f9' }]}
          onPress={() => navigation?.goBack?.()}
        >
          <Ionicons name="chevron-back" size={24} color={textColor} />
        </TouchableOpacity>

        <View style={styles.headerTextGroup}>
          <Text style={[styles.headerTitle, { color: textColor }]}>Tactical Feed</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveText}>LIVE BROADCAST</Text>
          </View>
        </View>

        {/* Active count badge */}
        {!loading && emergencies.length > 0 && (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{emergencies.length}</Text>
          </View>
        )}
      </View>

      {/* Body */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={[styles.syncText, { color: subColor }]}>SYNCING WITH DISPATCH...</Text>
        </View>
      ) : (
        <FlatList
          data={emergencies}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="shield-check-outline"
                size={80}
                color={isDarkMode ? '#334155' : '#cbd5e1'}
              />
              <Text style={[styles.emptyText, { color: subColor }]}>
                Sector Secure. No Pending Alerts.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  syncText:  { marginTop: 15, fontWeight: '800', fontSize: 12, letterSpacing: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  backCircle: {
    width: 42,
    height: 42,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextGroup: { flex: 1, marginLeft: 14 },
  headerTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  liveIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ef4444',
    marginRight: 6,
  },
  liveText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  countBadge: {
    backgroundColor: '#ef4444',
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countText: { color: '#fff', fontSize: 13, fontWeight: '900' },

  // Card
  sosCard: {
    borderRadius: 22,
    marginBottom: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  severityBar: { width: 5 },
  cardInner:   { flex: 1, padding: 18 },

  // Card header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  typeText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  distanceText: { color: '#3b82f6', fontSize: 11, fontWeight: '900' },

  // Victim
  victimInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 12 },
  victimAvatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(59,130,246,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  victimAvatarText: { color: '#3b82f6', fontWeight: '900', fontSize: 16 },
  victimName: { fontSize: 17, fontWeight: '700' },
  timeAgo:    { fontSize: 11, fontWeight: '600', marginTop: 1 },

  description: { fontSize: 13, lineHeight: 19, fontWeight: '500', marginBottom: 10 },

  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  locationText: { fontSize: 11, fontWeight: '600' },

  divider: { height: 1, marginVertical: 14 },

  // Actions
  actionRow: { flexDirection: 'row', gap: 12 },
  callBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  respondBtn: {
    flex: 1,
    height: 52,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  respondBtnText: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 1 },

  // Empty
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 20, fontWeight: '800', fontSize: 15 },
});