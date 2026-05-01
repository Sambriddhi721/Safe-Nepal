import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import {
  StyleSheet, View, Text, ActivityIndicator,
  TouchableOpacity, SafeAreaView, StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

import { API_BASE } from '../../config';
import { ThemeContext } from '../../context/ThemeContext';

// ── Default location (Kathmandu) until GPS locks ──────────────────────────────
const DEFAULT_LAT = 27.7172;
const DEFAULT_LNG = 85.3240;

// ── Build Leaflet HTML with OSM tiles ────────────────────────────────────────
const buildMapHTML = (lat, lng, sosMarkers) => {
  const markersJS = sosMarkers
    .map((item) => {
      const mlat = parseFloat(item.lat);
      const mlng = parseFloat(item.lng);
      if (isNaN(mlat) || isNaN(mlng)) return '';
      const title   = (item.type?.toUpperCase() || 'CRITICAL ALERT').replace(/'/g, "\\'");
      const message = (item.message || 'Emergency help requested.').replace(/'/g, "\\'");
      return `
        L.marker([${mlat}, ${mlng}], { icon: sosIcon })
          .addTo(map)
          .bindPopup('<b style="color:#ef4444">${title}</b><br/>${message}');
      `;
    })
    .join('\n');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true }).setView([${lat}, ${lng}], 14);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // ── User location marker ──────────────────────────────────────
    var userIcon = L.divIcon({
      className: '',
      html: \`
        <div style="
          width:20px; height:20px; border-radius:50%;
          background:#3b82f6; border:3px solid white;
          box-shadow:0 0 0 4px rgba(59,130,246,0.4);
        "></div>
      \`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    var userMarker = L.marker([${lat}, ${lng}], { icon: userIcon }).addTo(map);

    // ── SOS Icon ──────────────────────────────────────────────────
    var sosIcon = L.divIcon({
      className: '',
      html: \`
        <div style="
          width:32px; height:32px; border-radius:50%;
          background:#ef4444; border:3px solid white;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 0 8px rgba(239,68,68,0.7);
          color:white; font-weight:bold; font-size:18px;
        ">!</div>
      \`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // ── SOS Markers ───────────────────────────────────────────────
    ${markersJS}

    // ── Listen for messages from React Native (Android + iOS) ─────
    function handleMessage(e) {
      try {
        var data = JSON.parse(e.data);
        if (data.type === 'UPDATE_LOCATION') {
          userMarker.setLatLng([data.lat, data.lng]);
        }
        if (data.type === 'RECENTER') {
          map.setView([data.lat, data.lng], 15, { animate: true });
        }
      } catch(err) {}
    }

    document.addEventListener('message', handleMessage);
    window.addEventListener('message', handleMessage);
  </script>
</body>
</html>
  `;
};

// ─────────────────────────────────────────────────────────────────────────────

export default function RealTimeMapScreen() {
  const { theme }  = useContext(ThemeContext);
  const webViewRef = useRef(null);

  const [status,       setStatus]       = useState('Initializing Systems...');
  const [userLocation, setUserLocation] = useState(null);
  const [sosData,      setSosData]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [isOffline,    setIsOffline]    = useState(false);
  const [mapReady,     setMapReady]     = useState(false);
  const [webViewError, setWebViewError] = useState(false);

  const isDarkMode = theme === 'dark';

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

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setUserLocation({
          latitude:  loc.coords.latitude,
          longitude: loc.coords.longitude,
        });

        await fetchEmergencyData();

        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5 },
          (newLoc) => {
            const newCoords = {
              latitude:  newLoc.coords.latitude,
              longitude: newLoc.coords.longitude,
            };
            setUserLocation(newCoords);

            // Push live location into WebView without rebuilding HTML
            if (mapReady) {
              webViewRef.current?.postMessage(JSON.stringify({
                type: 'UPDATE_LOCATION',
                lat:  newCoords.latitude,
                lng:  newCoords.longitude,
              }));
            }
          }
        );

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

  // ── Recenter ─────────────────────────────────────────────────────────────
  const recenter = () => {
    if (!userLocation || !mapReady) return;
    webViewRef.current?.postMessage(JSON.stringify({
      type: 'RECENTER',
      lat:  userLocation.latitude,
      lng:  userLocation.longitude,
    }));
  };

  // ── Build HTML — rebuild when BOTH location and sosData are ready ─────────
  const mapHTML = useMemo(() => {
    const lat = userLocation?.latitude  ?? DEFAULT_LAT;
    const lng = userLocation?.longitude ?? DEFAULT_LNG;
    return buildMapHTML(lat, lng, sosData);
  }, [userLocation, sosData]); // ✅ fixed: depends on both

  // ── WebView Error Fallback ────────────────────────────────────────────────
  if (webViewError) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="map-outline" size={48} color="#94a3b8" />
        <Text style={styles.errorText}>Map failed to load</Text>
        <TouchableOpacity
          style={styles.retryBtn}
          onPress={() => setWebViewError(false)}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

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

      {/* ── Leaflet Map via WebView ───────────────────────────────────────── */}
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: mapHTML }}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onLoadEnd={() => setMapReady(true)}
        onError={() => setWebViewError(true)}
        onHttpError={() => setWebViewError(true)}
        renderLoading={() => (
          <View style={styles.mapLoader}>
            <ActivityIndicator size="large" color="#3b82f6" />
            <Text style={{ color: '#3b82f6', marginTop: 10 }}>Loading Map...</Text>
          </View>
        )}
      />

      {/* ── Floating Controls ────────────────────────────────────────────── */}
      <View style={styles.sideControls}>
        <TouchableOpacity
          style={[styles.controlBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}
          onPress={fetchEmergencyData}
        >
          <Ionicons name="refresh" size={20} color="#3b82f6" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlBtn,
            { backgroundColor: isDarkMode ? '#1e293b' : '#fff', marginTop: 12 },
          ]}
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

  mapLoader: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', backgroundColor: '#f8fafc',
  },

  errorContainer: {
    justifyContent: 'center',
    alignItems:     'center',
    backgroundColor: '#0f172a',
  },
  errorText: {
    color:      '#94a3b8',
    fontSize:   16,
    marginTop:  16,
    fontWeight: '600',
  },
  retryBtn: {
    marginTop:       16,
    paddingVertical: 10,
    paddingHorizontal: 28,
    backgroundColor: '#2563eb',
    borderRadius:    12,
  },
  retryText: { color: '#fff', fontWeight: '700' },

  safeArea: { zIndex: 30, elevation: 10 },
  statusBarContent: {
    flexDirection:     'row',
    height:            45,
    justifyContent:    'center',
    alignItems:        'center',
    paddingHorizontal: 20,
  },
  statusText: {
    color:         '#FFF',
    fontWeight:    '900',
    fontSize:      10,
    letterSpacing: 2,
    marginLeft:    8,
  },

  sideControls: { position: 'absolute', top: 110, right: 16, zIndex: 20 },
  controlBtn: {
    width:          46,
    height:         46,
    borderRadius:   14,
    justifyContent: 'center',
    alignItems:     'center',
    elevation:      8,
    shadowOpacity:  0.3,
    shadowRadius:   4,
    shadowOffset:   { width: 0, height: 2 },
  },

  bottomPanel: {
    position:        'absolute',
    bottom:          30,
    left:            16,
    right:           16,
    flexDirection:   'row',
    paddingVertical: 18,
    borderRadius:    24,
    borderWidth:     1,
    borderColor:     'rgba(51,65,85,0.4)',
    elevation:       15,
    justifyContent:  'space-evenly',
  },
  metricItem:  { alignItems: 'center', minWidth: 80 },
  metricLabel: { fontSize: 8, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  metricValue: { fontSize: 16, fontWeight: '900' },
  verticalDivider: {
    width:           1,
    height:          '60%',
    backgroundColor: 'rgba(51,65,85,0.2)',
    alignSelf:       'center',
  },
});