import React, { useEffect, useState, useContext } from "react";
import { 
  StyleSheet, View, Text, Image, Dimensions, 
  ActivityIndicator, SafeAreaView, Platform, TouchableOpacity, Alert 
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";

import { AuthContext } from "../../context/AuthContext";
import { API_BASE } from "../../config";

const { width, height } = Dimensions.get('window');

export default function RealTimeMapScreen({ navigation }) {
  const { token } = useContext(AuthContext);
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMarkers();
    // Optional: Poll every 30 seconds for live updates
    const interval = setInterval(fetchMarkers, 30000);
    return () => clearInterval(interval);
  }, [token]);

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

  const handleMarkerPress = (item) => {
    Alert.alert(
      `${item.type || 'Emergency'} Alert`,
      `Location: ${item.location || 'Unknown'}\nStatus: Active Signal`,
      [{ text: "Close", style: "cancel" }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* 1. HUD OVERLAY */}
      <View style={styles.hudContainer}>
        <View style={styles.headerRow}>
           <TouchableOpacity onPress={() => navigation.goBack()}>
             <Ionicons name="chevron-back" size={24} color="#fff" />
           </TouchableOpacity>
           <Text style={styles.hudTitle}>HAZARD MONITORING</Text>
           <View style={{ width: 24 }} />
        </View>
        
        <View style={styles.statusRow}>
          <View style={styles.liveDot} />
          <Text style={styles.statusText}>TOPOGRAPHICAL ACTIVE FEED</Text>
        </View>
      </View>

      {/* 2. THE MAP CONTAINER */}
      <View style={styles.mapWrapper}>
        <Image 
          // Ensure this path is correct relative to the file location
          source={require('./nepal_map.jpg')} 
          style={styles.mapImage}
          resizeMode="cover" 
        />

        {/* 3. DYNAMIC SOS MARKERS */}
        {!loading && sosList.map((item, index) => {
          /**
           * LOGIC: If your backend provides Lat/Long, you'd calculate position here.
           * For now, we use a deterministic "scatter" based on the index.
           */
          const topPos = `${25 + (index * 17) % 55}%`;
          const leftPos = `${15 + (index * 23) % 70}%`;

          return (
            <TouchableOpacity 
              key={item._id || index} 
              onPress={() => handleMarkerPress(item)}
              style={[
                styles.markerContainer, 
                { top: topPos, left: leftPos }
              ]} 
            >
              {/* Pulsing Effect Container */}
              <View style={styles.pulseContainer}>
                <View style={styles.pulseRing} />
                <View style={styles.coreMarker} />
              </View>

              <View style={styles.markerLabel}>
                 <Text style={styles.labelText}>{item.type?.toUpperCase() || 'SOS'}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        {/* EMPTY STATE */}
        {!loading && sosList.length === 0 && (
            <View style={styles.noSignals}>
                <Ionicons name="shield-checkmark-outline" size={40} color="#22c55e" />
                <Text style={styles.noSignalsText}>No Active SOS Signals Detected</Text>
            </View>
        )}
      </View>

      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={styles.loaderText}>Syncing Satellite Data...</Text>
        </View>
      )}

      {/* 4. FOOTER STATS */}
      <View style={styles.footer}>
        <View style={styles.statLine}>
            <Text style={styles.footerText}>ACTIVE SIGNALS: {sosList.length}</Text>
            <Text style={styles.regionText}>REGION: KATHMANDU VALLEY</Text>
        </View>
        <Text style={styles.subFooterText}>SAFE NEPAL • ENCRYPTED RESPONDER CHANNEL</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  hudContainer: {
    padding: 20,
    backgroundColor: '#0f172a',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingTop: Platform.OS === 'android' ? 45 : 10,
    zIndex: 10,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hudTitle: { color: '#f8fafc', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, justifyContent: 'center' },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e', marginRight: 8 },
  statusText: { color: '#22c55e', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  mapWrapper: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden'
  },
  mapImage: {
    width: width,
    height: '100%',
    opacity: 0.5, 
  },
  markerContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
  },
  pulseContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  coreMarker: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: "#ef4444",
    shadowOpacity: 1,
    shadowRadius: 10,
    zIndex: 5,
  },
  pulseRing: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.6)',
  },
  markerLabel: {
    marginTop: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ef4444'
  },
  labelText: { color: '#fff', fontSize: 8, fontWeight: '900' },
  noSignals: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },
  noSignalsText: { color: '#64748b', marginTop: 10, fontWeight: 'bold' },
  loaderContainer: { 
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(2, 6, 23, 0.9)' 
  },
  loaderText: { color: '#ef4444', marginTop: 12, fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  footer: {
    padding: 15,
    backgroundColor: '#0f172a',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  statLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  footerText: { color: '#38bdf8', fontWeight: '900', fontSize: 12 },
  regionText: { color: '#94a3b8', fontSize: 10, fontWeight: 'bold' },
  subFooterText: { color: '#475569', fontSize: 9, textAlign: 'center', fontWeight: 'bold' }
});