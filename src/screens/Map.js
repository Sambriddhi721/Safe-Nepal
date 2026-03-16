import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Platform, ActivityIndicator } from 'react-native';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

const API_URL = 'http://192.168.111.70:5000';

export default function RealTimeMapScreen() {
  const [status, setStatus] = useState('Initializing...');
  const [userLocation, setUserLocation] = useState(null);
  const [sosData, setSosData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // 1. Get Permission
        setStatus('Requesting Location...');
        let { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus !== 'granted') {
          setStatus('Location Denied');
          setLoading(false);
          return;
        }

        // 2. Get Position
        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const initialRegion = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setUserLocation(initialRegion);

        // 3. Fetch SOS Data
        setStatus('Fetching SOS Data...');
        const response = await axios.get(`${API_URL}/api/sos/all`, { timeout: 5000 });
        setSosData(response.data);
        setStatus('Live Map Active');
      } catch (err) {
        setStatus(`Offline Mode: ${err.message}`);
        console.log("Error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      {/* HEADER STATUS BAR */}
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>{status}</Text>
        {loading && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 10 }} />}
      </View>

      <MapView
        style={styles.map}
        // PROVIDER_DEFAULT + empty mapType is key for OSM on Android
        provider={PROVIDER_DEFAULT}
        mapType={Platform.OS === 'android' ? "none" : "standard"}
        initialRegion={userLocation || {
          latitude: 27.7172,
          longitude: 85.3240,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
        rotateEnabled={false}
      >
        <UrlTile
          /** * Using a high-reliability OSM mirror 
           * {z} = zoom, {x} = x-axis, {y} = y-axis
           */
          urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          flipY={false}
          tileSize={256}
          // shouldReplaceMapContent ensures Google/Apple maps don't show under OSM
          shouldReplaceMapContent={true}
          zIndex={1}
        />

        {/* User Marker */}
        {userLocation && (
          <Marker 
            coordinate={userLocation} 
            title="You" 
            pinColor="#3b82f6"
            zIndex={10} 
          />
        )}

        {/* SOS Markers from Backend */}
        {sosData.map((item, idx) => (
          <Marker 
            key={idx} 
            coordinate={{ 
              latitude: parseFloat(item.lat), 
              longitude: parseFloat(item.lng) 
            }} 
            title={item.type || "Emergency"} 
            description={item.message}
            pinColor="#ef4444" // Red for SOS
            zIndex={11} 
          />
        ))}
      </MapView>

      {/* MAP LEGEND */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
          <Text style={styles.legendText}>You</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
          <Text style={styles.legendText}>SOS Alerts</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  map: { flex: 1 },
  statusBar: {
    flexDirection: 'row',
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  statusText: { color: '#F1F5F9', fontWeight: '700', fontSize: 14 },
  legend: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#0f172a',
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#1e293b',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { color: '#F1F5F9', fontSize: 12, fontWeight: '600' }
});