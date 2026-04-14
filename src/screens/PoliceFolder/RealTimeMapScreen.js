import React, { useEffect, useState, useContext } from "react";
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions, 
  ActivityIndicator, 
  Platform, 
  TouchableOpacity, 
  Alert,
  SafeAreaView, 
  StatusBar 
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../../context/AuthContext";
import { API_BASE } from "../../config"; 

const { width, height } = Dimensions.get('window');

// Default center point (Kathmandu Valley)
const INITIAL_REGION = {
  latitude: 27.7172,
  longitude: 85.3240,
  latitudeDelta: 0.15,
  longitudeDelta: 0.15,
};

export default function RealTimeMapScreen({ navigation }) {
  const { token } = useContext(AuthContext) || {};
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarkers();
    // High-frequency polling for emergency response (15 seconds)
    const interval = setInterval(fetchMarkers, 15000);
    return () => clearInterval(interval);
  }, [token]);

  const fetchMarkers = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/api/sos/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSosList(res.data);
    } catch (err) {
      console.error("Tactical Feed Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (item) => {
    Alert.alert(
      `🚨 ${item.type?.toUpperCase() || 'EMERGENCY'} DETECTED`,
      `User: ${item.user?.name || 'Anonymous'}\nLocation: ${item.locationName || 'GPS Pinpointed'}\nStatus: ACTIVE SIGNAL`,
      [
        { text: "DISPATCH UNIT", onPress: () => console.log("Dispatching..."), style: "default" },
        { text: "CLOSE", style: "cancel" }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. HUD HEADER - Tactical Overview */}
      <View style={styles.hudContainer}>
        <View style={styles.headerRow}>
           <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBox}>
             <Ionicons name="chevron-back" size={24} color="#fff" />
           </TouchableOpacity>
           <View style={styles.titleCenter}>
             <Text style={styles.hudTitle}>TACTICAL MONITORING</Text>
             <Text style={styles.unitID}>UNIT: CENTRAL_COMMAND_KTM</Text>
           </View>
           <View style={styles.iconBox}>
             <Ionicons name="shield-checkmark" size={24} color="#38bdf8" />
           </View>
        </View>
        
        <View style={styles.statusRow}>
          <View style={styles.liveDot} />
          <Text style={styles.statusText}>ENCRYPTED SATELLITE FEED ACTIVE</Text>
        </View>
      </View>

      {/* 2. THE INTERACTIVE MAP */}
      <View style={styles.mapWrapper}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          customMapStyle={mapDarkStyle} // Applied the tactical dark theme
          initialRegion={INITIAL_REGION}
        >
          {!loading && sosList.map((item, index) => (
            <Marker
              key={item._id || index}
              coordinate={{
                latitude: item.latitude || (27.7172 + (index * 0.01)), // fallback logic
                longitude: item.longitude || (85.3240 + (index * 0.01)),
              }}
              onPress={() => handleMarkerPress(item)}
            >
              <View style={styles.markerContainer}>
                <View style={styles.pulseRing} />
                <View style={[
                  styles.coreMarker, 
                  item.type === 'Violence' ? {backgroundColor: '#FF0000'} : {backgroundColor: '#EF4444'}
                ]} />
                <View style={styles.markerLabel}>
                  <Text style={styles.labelText}>{item.type?.toUpperCase() || 'SOS'}</Text>
                </View>
              </View>
            </Marker>
          ))}
        </MapView>

        {/* EMPTY STATE OVERLAY */}
        {!loading && sosList.length === 0 && (
            <View style={styles.noSignals}>
                <Ionicons name="shield-checkmark-outline" size={50} color="#22c55e" />
                <Text style={styles.noSignalsText}>SECURE: NO ACTIVE SOS SIGNALS</Text>
            </View>
        )}

        {/* LOADING OVERLAY */}
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#38bdf8" />
            <Text style={styles.loaderText}>DECRYPTING DATA FEED...</Text>
          </View>
        )}
      </View>

      {/* 3. TACTICAL FOOTER */}
      <View style={styles.footer}>
        <View style={styles.statLine}>
            <View>
              <Text style={styles.footerLabel}>ACTIVE SIGNALS</Text>
              <Text style={styles.footerValue}>{sosList.length}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.footerLabel}>REGION</Text>
              <Text style={styles.footerValue}>KTM_VALLEY</Text>
            </View>
        </View>
        <Text style={styles.subFooterText}>SAFE NEPAL • ENCRYPTED RESPONDER CHANNEL • v2.0</Text>
      </View>
    </SafeAreaView>
  );
}

// Tactical Dark Theme for Google Maps
const mapDarkStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#020617" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#020617" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] }
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  hudContainer: {
    padding: 15,
    backgroundColor: '#0f172a',
    borderBottomWidth: 2,
    borderBottomColor: '#1e293b',
    paddingTop: Platform.OS === 'android' ? 40 : 10,
    zIndex: 10,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconBox: { width: 40, alignItems: 'center' },
  titleCenter: { alignItems: 'center' },
  hudTitle: { color: '#f8fafc', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  unitID: { color: '#38bdf8', fontSize: 10, fontWeight: 'bold', opacity: 0.8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, justifyContent: 'center' },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 8, shadowColor: '#22c55e', shadowRadius: 5, shadowOpacity: 1 },
  statusText: { color: '#22c55e', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  mapWrapper: { flex: 1, backgroundColor: '#000' },
  map: { ...StyleSheet.absoluteFillObject },
  markerContainer: { alignItems: 'center', justifyContent: 'center', width: 70, height: 70 },
  coreMarker: {
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2, borderColor: '#fff', zIndex: 5,
  },
  pulseRing: {
    position: 'absolute', width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(239, 68, 68, 0.2)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  markerLabel: {
    marginTop: 4, backgroundColor: 'rgba(2, 6, 23, 0.9)',
    paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4,
    borderWidth: 1, borderColor: '#ef4444'
  },
  labelText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  noSignals: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(2, 6, 23, 0.7)' },
  noSignalsText: { color: '#64748b', marginTop: 15, fontWeight: 'bold', letterSpacing: 1 },
  loaderContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(2, 6, 23, 0.9)' },
  loaderText: { color: '#38bdf8', marginTop: 12, fontSize: 11, fontWeight: '900', letterSpacing: 2 },
  footer: { padding: 15, backgroundColor: '#0f172a', borderTopWidth: 2, borderTopColor: '#1e293b' },
  statLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  footerLabel: { color: '#64748b', fontSize: 9, fontWeight: 'bold' },
  footerValue: { color: '#f8fafc', fontSize: 20, fontWeight: '900' },
  subFooterText: { color: '#334155', fontSize: 8, textAlign: 'center', fontWeight: 'bold', letterSpacing: 1 }
});