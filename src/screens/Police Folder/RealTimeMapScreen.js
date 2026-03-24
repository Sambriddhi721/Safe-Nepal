import React, { useEffect, useState, useContext } from "react";
import { 
  StyleSheet, View, Text, Image, Dimensions, 
  ActivityIndicator, SafeAreaView, Platform 
} from "react-native";
import axios from "axios";

// ✅ Path remains ../../ because these are in the root src folder
import { AuthContext } from "../../context/AuthContext";
import { API_BASE } from "../../config";

const { width } = Dimensions.get('window');

export default function RealTimeMapScreen() {
  const { token } = useContext(AuthContext);
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/sos/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSosList(res.data);
      } catch (err) {
        console.error("Backend Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkers();
  }, [token]);

  return (
    <SafeAreaView style={styles.container}>
      {/* 1. HUD OVERLAY */}
      <View style={styles.hudContainer}>
        <Text style={styles.hudTitle}>HAZARD MONITORING</Text>
        <View style={styles.statusRow}>
          <View style={styles.liveDot} />
          <Text style={styles.statusText}>FULL TOPOGRAPHICAL VIEW</Text>
        </View>
      </View>

      {/* 2. THE FULL MAP CONTAINER */}
      <View style={styles.mapWrapper}>
        <Image 
          // ✅ FIX: Changed to ./ because the image is in the same folder as this file
          source={require('./nepal_map.jpg')} 
          style={styles.mapImage}
          resizeMode="contain" 
        />

        {/* 3. SOS MARKERS */}
        {!loading && sosList.map((item, index) => {
          // Spread markers across the static image
          const topPos = `${20 + (index * 15) % 60}%`;
          const leftPos = `${10 + (index * 25) % 80}%`;

          return (
            <View 
              key={index} 
              style={[
                styles.markerContainer, 
                { top: topPos, left: leftPos }
              ]} 
            >
              <View style={styles.pulseRing} />
              <View style={styles.coreMarker} />
              <View style={styles.markerLabel}>
                 <Text style={styles.labelText}>{item.type || 'SOS'}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={styles.loaderText}>Loading Full Terrain...</Text>
        </View>
      )}

      {/* 4. FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Active SOS Signals: {sosList.length}</Text>
        <Text style={styles.subFooterText}>Safe Nepal Disaster Management System</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  hudContainer: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingTop: Platform.OS === 'android' ? 45 : 20,
    zIndex: 10,
  },
  hudTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold', letterSpacing: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 8 },
  statusText: { color: '#22c55e', fontSize: 10, fontWeight: 'bold' },
  mapWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  mapImage: {
    width: width,
    height: '100%',
    opacity: 0.6, 
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreMarker: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#fff',
    zIndex: 5,
  },
  pulseRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(239, 68, 68, 0.4)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  markerLabel: {
    position: 'absolute',
    top: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#EF4444'
  },
  labelText: { color: '#fff', fontSize: 8, fontWeight: 'bold' },
  loaderContainer: { 
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(2, 6, 23, 0.85)' 
  },
  loaderText: { color: '#94a3b8', marginTop: 12, fontSize: 12, fontWeight: 'bold' },
  footer: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  footerText: { color: '#38bdf8', fontWeight: 'bold', textAlign: 'center' },
  subFooterText: { color: '#64748b', fontSize: 10, textAlign: 'center', marginTop: 5 }
});