import React, { useEffect, useState, useContext } from "react";
import { 
  StyleSheet, View, Text, Image, Dimensions, 
  ActivityIndicator, SafeAreaView, Platform 
} from "react-native";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../config";

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
      {/* 1. HUD OVERLAY - Kept at the top */}
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
          source={require('./nepal_map.jpg')} 
          style={styles.mapImage}
          resizeMode="contain" // Changed to contain to show the whole image
        />

        {/* 3. SOS MARKERS */}
        {!loading && sosList.map((item, index) => (
          <View 
            key={index} 
            style={[
              styles.markerContainer, 
              { 
                // Adjusted math to fit the contained map area
                top: '30%', 
                left: `${15 + (index * 20) % 70}%` 
              }
            ]} 
          >
            <View style={styles.pulseRing} />
            <View style={styles.coreMarker} />
          </View>
        ))}
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
  container: { 
    flex: 1, 
    backgroundColor: '#020617' 
  },
  hudContainer: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    zIndex: 10,
  },
  hudTitle: { color: '#f8fafc', fontSize: 18, fontWeight: 'bold' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 8 },
  statusText: { color: '#22c55e', fontSize: 10, fontWeight: 'bold' },
  
  // Wrapper allows the image to take up the center space fully
  mapWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapImage: {
    width: width,
    height: '100%',
    opacity: 0.8,
  },
  
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coreMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#fff',
  },
  pulseRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  loaderContainer: { 
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(2, 6, 23, 0.7)' 
  },
  loaderText: { color: '#94a3b8', marginTop: 12, fontSize: 12 },
  footer: {
    padding: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  footerText: { color: '#38bdf8', fontWeight: 'bold', textAlign: 'center' },
  subFooterText: { color: '#64748b', fontSize: 10, textAlign: 'center', marginTop: 5 }
});