import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import {
  StyleSheet, View, Text, ActivityIndicator,
  TouchableOpacity, SafeAreaView, StatusBar, Animated, Easing
} from 'react-native';
import MapView, { Marker, UrlTile, Callout, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

import { API_BASE } from '../../config';
import { ThemeContext } from '../../context/ThemeContext';

export default function RealTimeMapScreen() {
  const { theme } = useContext(ThemeContext);
  const mapRef = useRef(null);

  // ── Pulse animation for user marker ─────────────────────────────────────
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;

  const [status,       setStatus]       = useState('Initializing Systems...');
  const [userLocation, setUserLocation] = useState(null);
  const [sosData,      setSosData]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [isOffline,    setIsOffline]    = useState(false);

  const isDarkMode = theme === 'dark';

  // ── Pulse animation ──────────────────────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 2.4,
            duration: 1800,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim,    { toValue: 1,   duration: 0, useNativeDriver: true }),
          Animated.timing(pulseOpacity, { toValue: 0.6, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  // ── Fetch SOS data ───────────────────────────────────────────────────────
  const fetchEmergencyData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/sos/all`, { timeout: 8000 });
      setSosData(response.data || []);
      setIsOffline(false);
      setStatus('Live Tactical View');
    } catch (err) {
      setIsOffline(true);
      setStatus('Connection Interrupted');
      console.warn('Sync Error:', err.message);
    }
  };

  // ── Setup location + data ────────────────────────────────────────────────
  useEffect(() => {
    let locationSubscription = null;
    let dataInterval         = null;

    const setup = async () => {
      try {
        setLoading(true);

        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus !== 'granted') {
          setStatus('GPS Restricted');
          setLoading(false);
          return;
        }

        // Initial position
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const coords = {
          latitude:       loc.coords.latitude,
          longitude:      loc.coords.longitude,
          latitudeDelta:  0.05,
          longitudeDelta: 0.05,
        };
        setUserLocation(coords);

        // Fly map to user location
        mapRef.current?.animateToRegion(coords, 800);

        await fetchEmergencyData();

        // Watch position
        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5 },
          (newLoc) => {
            setUserLocation((prev) => ({
              ...prev,
              latitude:  newLoc.coords.latitude,
              longitude: newLoc.coords.longitude,
            }));
          }
        );

        // Refresh every 30 s
        dataInterval = setInterval(fetchEmergencyData, 30000);

      } catch (err) {
        setStatus('Hardware Sync Error');
        console.warn('Setup error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    setup();

    return () => {
      locationSubscription?.remove();
      if (dataInterval) clearInterval(dataInterval);
    };
  }, []);

  // ── Recenter on user ─────────────────────────────────────────────────────
  const recenter = () => {
    if (!userLocation) return;
    mapRef.current?.animateToRegion(
      { ...userLocation, latitudeDelta: 0.015, longitudeDelta: 0.015 },
      800
    );
  };

  // ── Memoized SOS markers ─────────────────────────────────────────────────
  const renderedMarkers = useMemo(() => {
    return sosData.map((item, idx) => {
      const lat = parseFloat(item.lat);
      const lng = parseFloat(item.lng);
      if (isNaN(lat) || isNaN(lng)) return null;

      return (
        <Marker
          key={item.id || `sos-${idx}`}
          coordinate={{ latitude: lat, longitude: lng }}
          zIndex={15}
          tracksViewChanges={false}
        >
          <View style={styles.sosMarkerShadow}>
            <Ionicons name="alert-circle" size={38} color="#ef4444" />
          </View>
          <Callout tooltip>
            <View style={styles.calloutContainer}>
              <Text style={styles.calloutTitle}>
                {item.type?.toUpperCase() || 'CRITICAL ALERT'}
              </Text>
              <Text style={styles.calloutDesc}>
                {item.message || 'Emergency help requested. Proceed with caution.'}
              </Text>
              <View style={styles.calloutArrow} />
            </View>
          </Callout>
        </Marker>
      );
    });
  }, [sosData]);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#020617' : '#f8fafc' }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Status Header ────────────────────────────────────────────────── */}
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: isOffline ? '#991b1b' : isDarkMode ? '#0f172a' : '#2563eb' },
        ]}
      >
        <View style={styles.statusBarContent}>
          <Ionicons
            name={isOffline ? 'cloud-offline' : 'radio'}
            size={14}
            color="#FFF"
          />
          <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          {loading && (
            <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 10 }} />
          )}
        </View>
      </SafeAreaView>

      {/* ── Map ──────────────────────────────────────────────────────────── */}
      {/* 
        FIX 1: provider={PROVIDER_DEFAULT} — not null. 
                null causes a blank map on Android physical devices.
        FIX 2: mapType="none" + UrlTile = OpenStreetMap, no API key needed.
      */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        mapType="none"
        showsUserLocation={false}      // We render our own animated marker below
        showsMyLocationButton={false}
        showsCompass={false}
        moveOnMarkerPress={false}
        initialRegion={{
          latitude:       27.7172,
          longitude:      85.3240,
          latitudeDelta:  0.1,
          longitudeDelta: 0.1,
        }}
      >
        {/* OSM Tiles — works on Android & iOS, no API key */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          shouldReplaceMapContent={true}
          flipY={false}
          tileSize={256}
          zIndex={1}
        />

        {/* FIX 3: User location marker — was declared in styles but never rendered */}
        {userLocation && (
          <Marker
            coordinate={{
              latitude:  userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            tracksViewChanges={false}
            zIndex={20}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userMarkerWrapper}>
              {/* Animated pulse ring */}
              <Animated.View
                style={[
                  styles.userMarkerPulse,
                  {
                    transform: [{ scale: pulseAnim }],
                    opacity:   pulseOpacity,
                  },
                ]}
              />
              {/* Core dot */}
              <View style={styles.userMarkerCore} />
            </View>
          </Marker>
        )}

        {/* SOS markers */}
        {renderedMarkers}
      </MapView>

      {/* ── Floating Controls ────────────────────────────────────────────── */}
      <View style={styles.sideControls}>
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}
          onPress={fetchEmergencyData}
        >
          <Ionicons name="refresh" size={20} color="#3b82f6" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#fff', marginTop: 12 }]}
          onPress={recenter}
        >
          <Ionicons name="navigate" size={20} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* ── Bottom Metrics Panel ─────────────────────────────────────────── */}
      <View
        style={[
          styles.bottomPanel,
          {
            backgroundColor: isDarkMode
              ? 'rgba(15,23,42,0.95)'
              : 'rgba(255,255,255,0.95)',
          },
        ]}
      >
        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: isDarkMode ? '#64748b' : '#94a3b8' }]}>
            ACTIVE SOS
          </Text>
          <Text style={[styles.metricValue, { color: '#ef4444' }]}>
            {sosData.length}
          </Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: isDarkMode ? '#64748b' : '#94a3b8' }]}>
            GPS
          </Text>
          <Text style={[styles.metricValue, { color: userLocation ? '#22c55e' : '#f59e0b' }]}>
            {userLocation ? 'LOCKED' : 'SEARCHING'}
          </Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.metricItem}>
          <Text style={[styles.metricLabel, { color: isDarkMode ? '#64748b' : '#94a3b8' }]}>
            NETWORK
          </Text>
          <Text style={[styles.metricValue, { color: isOffline ? '#94a3b8' : '#22c55e' }]}>
            {isOffline ? 'OFFLINE' : 'LIVE'}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  map:       { flex: 1 },

  // Header
  safeArea: { zIndex: 30, elevation: 10 },
  statusBarContent: {
    flexDirection:   'row',
    height:          45,
    justifyContent:  'center',
    alignItems:      'center',
    paddingHorizontal: 20,
  },
  statusText: {
    color:       '#FFF',
    fontWeight:  '900',
    fontSize:    10,
    letterSpacing: 2,
    marginLeft:  8,
  },

  // Controls
  sideControls: { position: 'absolute', top: 110, right: 16, zIndex: 20 },
  controlBtn: {
    width:         46,
    height:        46,
    borderRadius:  14,
    justifyContent: 'center',
    alignItems:    'center',
    elevation:     8,
    shadowOpacity: 0.3,
    shadowRadius:  4,
    shadowOffset:  { width: 0, height: 2 },
  },

  // User marker
  userMarkerWrapper: {
    width:          44,
    height:         44,
    alignItems:     'center',
    justifyContent: 'center',
  },
  userMarkerPulse: {
    position:     'absolute',
    width:        44,
    height:       44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
  },
  userMarkerCore: {
    width:        16,
    height:       16,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    borderWidth:  2.5,
    borderColor:  '#fff',
    elevation:    4,
  },

  // SOS marker
  sosMarkerShadow: {
    shadowColor:   '#ef4444',
    shadowOpacity: 0.5,
    shadowRadius:  8,
    elevation:     5,
  },

  // Callout
  calloutContainer: {
    backgroundColor: '#0f172a',
    borderRadius:    12,
    padding:         15,
    width:           220,
    marginBottom:    10,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  calloutTitle: { color: '#ef4444', fontWeight: '900', fontSize: 12, marginBottom: 4 },
  calloutDesc:  { color: '#cbd5e1', fontSize: 12, lineHeight: 16 },
  calloutArrow: {
    borderTopColor:    '#0f172a',
    borderTopWidth:    10,
    borderRightColor:  'transparent',
    borderRightWidth:  10,
    borderLeftColor:   'transparent',
    borderLeftWidth:   10,
    alignSelf:         'center',
    marginBottom:      -25,
  },

  // Bottom panel
  bottomPanel: {
    position:       'absolute',
    bottom:         30,
    left:           16,
    right:          16,
    flexDirection:  'row',
    paddingVertical: 18,
    borderRadius:   24,
    borderWidth:    1,
    borderColor:    'rgba(51,65,85,0.4)',
    elevation:      15,
    justifyContent: 'space-evenly',
  },
  metricItem:  { alignItems: 'center', minWidth: 80 },
  metricLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  metricValue: { fontSize: 16, fontWeight: '900' },
  verticalDivider: {
    width:      1,
    height:     '60%',
    backgroundColor: 'rgba(51,65,85,0.2)',
    alignSelf:  'center',
  },
});