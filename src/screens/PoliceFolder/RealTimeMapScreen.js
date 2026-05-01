import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import {
  StyleSheet, View, Text, ActivityIndicator,
  TouchableOpacity, SafeAreaView, StatusBar, Platform
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

import { API_BASE } from '../../config';
import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

// ── Build Leaflet HTML ────────────────────────────────────────────────────────
const buildMapHTML = (lat, lng, sosMarkers, responderLocation) => {
  const markersJS = sosMarkers
    .map((item) => {
      const mlat = parseFloat(item.lat ?? item.latitude);
      const mlng = parseFloat(item.lng ?? item.longitude);
      if (isNaN(mlat) || isNaN(mlng)) return '';
      const title   = (item.type?.toUpperCase() || 'CRITICAL ALERT').replace(/'/g, "\\'");
      const message = (item.message || 'Emergency help requested.').replace(/'/g, "\\'");
      const user    = (item.user?.name || 'Anonymous').replace(/'/g, "\\'");
      return `
        L.marker([${mlat}, ${mlng}], { icon: sosIcon })
          .addTo(map)
          .bindPopup(
            '<b style="color:#ef4444">🚨 ${title}</b><br/>' +
            '<span style="color:#94a3b8">User: ${user}</span><br/>' +
            '${message}'
          );
      `;
    })
    .join('\n');

  // Responder marker JS — only render if coords are valid
  const responderJS =
    responderLocation
      ? `
        var responderIcon = L.divIcon({
          className: '',
          html: \`
            <div style="
              width:28px; height:28px; border-radius:50%;
              background:#38bdf8; border:3px solid white;
              display:flex; align-items:center; justify-content:center;
              box-shadow:0 0 0 5px rgba(56,189,248,0.35);
              color:white; font-size:14px;
            ">👮</div>
          \`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        var responderMarker = L.marker(
          [${responderLocation.latitude}, ${responderLocation.longitude}],
          { icon: responderIcon }
        ).addTo(map).bindPopup('<b style="color:#38bdf8">📍 YOUR LOCATION</b>');
      `
      : 'var responderMarker = null;';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; background: #020617; }

    /* Dark tile filter */
    .leaflet-tile { filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7); }
    .leaflet-container { background: #020617; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: true }).setView([${lat}, ${lng}], 14);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

    // ── SOS Icon ──────────────────────────────────────────────────
    var sosIcon = L.divIcon({
      className: '',
      html: \`
        <div style="
          width:32px; height:32px; border-radius:50%;
          background:#ef4444; border:3px solid white;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 0 10px rgba(239,68,68,0.8);
          color:white; font-weight:bold; font-size:16px;
        ">!</div>
      \`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // ── SOS Markers ───────────────────────────────────────────────
    ${markersJS}

    // ── Responder Marker ──────────────────────────────────────────
    ${responderJS}

    // ── Message listener (Android + iOS) ─────────────────────────
    function handleMessage(e) {
      try {
        var data = JSON.parse(e.data);

        if (data.type === 'UPDATE_RESPONDER' && responderMarker) {
          responderMarker.setLatLng([data.lat, data.lng]);
        }
        if (data.type === 'INIT_RESPONDER' && !responderMarker) {
          var respIcon = L.divIcon({
            className: '',
            html: \`<div style="width:28px;height:28px;border-radius:50%;background:#38bdf8;border:3px solid white;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 5px rgba(56,189,248,0.35);color:white;font-size:14px;">👮</div>\`,
            iconSize: [28, 28], iconAnchor: [14, 14],
          });
          responderMarker = L.marker([data.lat, data.lng], { icon: respIcon })
            .addTo(map)
            .bindPopup('<b style="color:#38bdf8">📍 YOUR LOCATION</b>');
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

export default function RealTimeMapScreen({ navigation }) {
  const { token } = useContext(AuthContext) || {};
  const { theme } = useContext(ThemeContext);
  const webViewRef = useRef(null);

  const [status,            setStatus]            = useState('Initializing Systems...');
  const [responderLocation, setResponderLocation] = useState(null);
  const [sosData,           setSosData]           = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [isOffline,         setIsOffline]         = useState(false);

  const isDarkMode = theme === 'dark';

  const defaultLat = 27.7172;
  const defaultLng = 85.3240;

  // ── Fetch SOS data ───────────────────────────────────────────────────────
  const fetchEmergencyData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/sos/all`, {
        timeout: 8000,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setSosData(response.data || []);
      setIsOffline(false);
      setStatus('Live Tactical View');
    } catch (err) {
      setIsOffline(true);
      setStatus('Connection Interrupted');
      console.warn('[RealTimeMap] Sync Error:', err.message);
    }
  };

  // ── Setup location + polling ─────────────────────────────────────────────
  useEffect(() => {
    let locationSub = null;
    let dataInterval = null;

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

        const coords = {
          latitude:  loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setResponderLocation(coords);

        await fetchEmergencyData();

        // Watch responder position
        locationSub = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 5 },
          (newLoc) => {
            const newCoords = {
              latitude:  newLoc.coords.latitude,
              longitude: newLoc.coords.longitude,
            };
            setResponderLocation(newCoords);

            // Push live update into WebView
            webViewRef.current?.postMessage(JSON.stringify({
              type: 'UPDATE_RESPONDER',
              lat:  newCoords.latitude,
              lng:  newCoords.longitude,
            }));
          }
        );

        // Refresh SOS data every 15 seconds
        dataInterval = setInterval(fetchEmergencyData, 15000);

      } catch (err) {
        setStatus('Hardware Sync Error');
        console.warn('[RealTimeMap] Setup error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    setup();
    return () => {
      locationSub?.remove();
      if (dataInterval) clearInterval(dataInterval);
    };
  }, []);

  // ── Recenter on responder ────────────────────────────────────────────────
  const recenter = () => {
    if (!responderLocation) return;
    webViewRef.current?.postMessage(JSON.stringify({
      type: 'RECENTER',
      lat:  responderLocation.latitude,
      lng:  responderLocation.longitude,
    }));
  };

  // ── Rebuild HTML only when SOS data changes ──────────────────────────────
  const mapHTML = useMemo(() => {
    const lat = responderLocation?.latitude  ?? defaultLat;
    const lng = responderLocation?.longitude ?? defaultLng;
    return buildMapHTML(lat, lng, sosData, responderLocation);
  }, [sosData]);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#020617' : '#f8fafc' }]}>
      <StatusBar barStyle="light-content" />

      {/* ── Tactical Header ──────────────────────────────────────────────── */}
      <SafeAreaView
        style={[
          styles.safeArea,
          { backgroundColor: isOffline ? '#991b1b' : '#0f172a' },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.titleCenter}>
            <Text style={styles.hudTitle}>TACTICAL MONITORING</Text>
            <View style={styles.statusRow}>
              <View style={[styles.liveDot, { backgroundColor: isOffline ? '#ef4444' : '#22c55e' }]} />
              <Text style={styles.statusText}>
                {isOffline ? 'CONNECTION INTERRUPTED' : status.toUpperCase()}
              </Text>
              {loading && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 8 }} />}
            </View>
          </View>

          <View style={styles.backBtn}>
            <Ionicons name="shield-checkmark" size={22} color="#38bdf8" />
          </View>
        </View>
      </SafeAreaView>

      {/* ── Leaflet Map ──────────────────────────────────────────────────── */}
      <WebView
        ref={webViewRef}
        style={styles.map}
        source={{ html: mapHTML }}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.mapLoader}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={{ color: '#38bdf8', marginTop: 10, fontWeight: '900', letterSpacing: 1 }}>
              DECRYPTING DATA FEED...
            </Text>
          </View>
        )}
      />

      {/* ── Floating Controls ────────────────────────────────────────────── */}
      <View style={styles.sideControls}>
        <TouchableOpacity
          style={styles.controlBtn}
          onPress={fetchEmergencyData}
        >
          <Ionicons name="refresh" size={20} color="#38bdf8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, { marginTop: 12 }]}
          onPress={recenter}
        >
          <Ionicons name="navigate" size={20} color="#38bdf8" />
        </TouchableOpacity>
      </View>

      {/* ── Bottom Metrics Panel ─────────────────────────────────────────── */}
      <View style={styles.bottomPanel}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>ACTIVE SOS</Text>
          <Text style={[styles.metricValue, { color: '#ef4444' }]}>
            {sosData.length}
          </Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>RESPONDER GPS</Text>
          <Text style={[styles.metricValue, { color: responderLocation ? '#22c55e' : '#f59e0b' }]}>
            {responderLocation ? 'LOCKED' : 'SEARCHING'}
          </Text>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>NETWORK</Text>
          <Text style={[styles.metricValue, { color: isOffline ? '#ef4444' : '#22c55e' }]}>
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
    alignItems: 'center', backgroundColor: '#020617',
  },

  safeArea: { zIndex: 30, elevation: 10 },

  headerRow: {
    flexDirection:    'row',
    height:           55,
    justifyContent:   'space-between',
    alignItems:       'center',
    paddingHorizontal: 12,
  },
  backBtn: {
    width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center',
  },
  titleCenter: { alignItems: 'center', flex: 1 },
  hudTitle: {
    color: '#f8fafc', fontSize: 13,
    fontWeight: '900', letterSpacing: 2,
  },
  statusRow: {
    flexDirection: 'row', alignItems: 'center', marginTop: 4,
  },
  liveDot: {
    width: 7, height: 7, borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#94a3b8', fontSize: 9,
    fontWeight: 'bold', letterSpacing: 1,
  },

  sideControls: { position: 'absolute', top: 110, right: 16, zIndex: 20 },
  controlBtn: {
    width: 46, height: 46,
    borderRadius: 14,
    backgroundColor: '#0f172a',
    justifyContent: 'center', alignItems: 'center',
    elevation: 8,
    borderWidth: 1, borderColor: '#1e293b',
    shadowOpacity: 0.4, shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  bottomPanel: {
    position:        'absolute',
    bottom:          30,
    left:            16,
    right:           16,
    flexDirection:   'row',
    paddingVertical: 18,
    borderRadius:    24,
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderWidth:     1,
    borderColor:     'rgba(56,189,248,0.2)',
    elevation:       15,
    justifyContent:  'space-evenly',
  },
  metricItem:  { alignItems: 'center', minWidth: 90 },
  metricLabel: {
    fontSize: 8, fontWeight: '800',
    letterSpacing: 1, marginBottom: 4,
    color: '#64748b',
  },
  metricValue: { fontSize: 15, fontWeight: '900' },
  verticalDivider: {
    width: 1, height: '60%',
    backgroundColor: 'rgba(56,189,248,0.15)',
    alignSelf: 'center',
  },
});