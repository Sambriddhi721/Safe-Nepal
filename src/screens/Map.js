import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';

// Ensure this matches your ipconfig and Flask port
const API_URL = 'http://192.168.111.70:5000';

export default function RealTimeMapScreen() {
  const [status, setStatus] = useState('Initializing...');
  const [userLocation, setUserLocation] = useState(null);
  const [sosData, setSosData] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        // 1. Location Request
        setStatus('Requesting Location...');
        let { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus !== 'granted') {
          setStatus('Location Permission Denied');
          return;
        }

        let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        // 2. Fetching SOS Data
        // IMPORTANT: We use /api/sos/all because that is the common blueprint pattern
        setStatus('Connecting to Backend...');
        const response = await axios.get(`${API_URL}/api/sos/all`, { timeout: 8000 });
        setSosData(response.data);
        setStatus('Connected ✅');
      } catch (err) {
        // If this says 404, check your routes/sos.py file
        setStatus(`Backend Error: ${err.message}`);
        console.log("Full Error:", err);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.statusBar}>
        <Text style={styles.statusText}>{status}</Text>
      </View>

      <MapView
        style={styles.map}
        // Force the app to ignore the missing Google API Key
        provider={null} 
        mapType={Platform.OS === 'android' ? "none" : "standard"}
        initialRegion={userLocation || {
          latitude: 27.7172,
          longitude: 85.3240,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
      >
        {/* Forces OSM tiles to replace the "Beige" screen */}
        <UrlTile 
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          zIndex={1}
          maximumZ={19}
          tileSize={256}
          shouldReplaceMapContent={true} 
        />

        {userLocation && (
          <Marker 
            coordinate={userLocation} 
            title="Your Location" 
            pinColor="blue" 
            zIndex={10} 
          />
        )}

        {sosData.map((item, idx) => (
          <Marker 
            key={idx} 
            coordinate={{ latitude: item.lat, longitude: item.lng }} 
            title={item.type || "SOS Alert"} 
            description={item.message}
            zIndex={11} 
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  statusBar: {
    paddingTop: 50,
    paddingBottom: 10,
    backgroundColor: '#0E1621',
    alignItems: 'center',
    zIndex: 10,
  },
  statusText: { color: '#fff', fontWeight: 'bold' }
});