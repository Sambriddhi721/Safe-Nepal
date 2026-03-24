import React, { useState, useEffect, useContext, useRef } from 'react';
import { StyleSheet, View, Text, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import MapView, { Marker, UrlTile, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';

// 1. Corrected Imports for the new folder structure
import { API_BASE } from '../../config'; 
import { ThemeContext } from '../../context/ThemeContext';

export default function RealTimeMapScreen() {
  const { theme, colors } = useContext(ThemeContext);
  const mapRef = useRef(null);
  
  const [status, setStatus] = useState('Initializing...');
  const [userLocation, setUserLocation] = useState(null);
  const [sosData, setSosData] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDarkMode = theme === 'dark';

  // Function to recenter map on user
  const recenter = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(userLocation, 1000);
    }
  };

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
        const region = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.02, // Zoomed in more for tactical view
          longitudeDelta: 0.02,
        };
        setUserLocation(region);

        // 3. Fetch SOS Data using global API_BASE
        setStatus('Fetching SOS Data...');
        const response = await axios.get(`${API_BASE}/api/sos/all`, { timeout: 8000 });
        setSosData(response.data);
        setStatus('Live Tactical Map Active');
      } catch (err) {
        setStatus(`Network Issue: Showing Offline Cache`);
        console.log("Map Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#020617' : '#f5f5f5' }]}>
      
      {/* HEADER STATUS BAR */}
      <View style={[styles.statusBar, { backgroundColor: isDarkMode ? '#0f172a' : '#3b82f6' }]}>
        <Text style={styles.statusText}>{status}</Text>
        {loading && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 10 }} />}
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        // Key for OSM on Android to hide the default Google logo/grid
        mapType={Platform.OS === 'android' ? "none" : "standard"}
        initialRegion={userLocation || {
          latitude: 27.7172,
          longitude: 85.3240,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        }}
        showsUserLocation={true} // Shows the native blue dot too
        rotateEnabled={false}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          tileSize={256}
          shouldReplaceMapContent={true}
          zIndex={1}
        />

        {/* User Marker (Custom overlay) */}
        {userLocation && (
          <Marker 
            coordinate={userLocation} 
            title="Your Position" 
            zIndex={10}
          >
             <Ionicons name="navigate-circle" size={30} color="#3b82f6" />
          </Marker>
        )}

        {/* SOS Markers from Backend */}
        {sosData.map((item, idx) => (
          <Marker 
            key={item.id || idx} 
            coordinate={{ 
              latitude: parseFloat(item.lat), 
              longitude: parseFloat(item.lng) 
            }} 
            title={item.type || "Emergency"} 
            description={item.message || "Immediate assistance required"}
            pinColor="#ef4444"
            zIndex={11} 
          />
        ))}
      </MapView>

      {/* FLOATING ACTION BUTTONS */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity style={[styles.fab, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]} onPress={recenter}>
          <Ionicons name="locate" size={24} color={isDarkMode ? '#F1F5F9' : '#3b82f6'} />
        </TouchableOpacity>
      </View>

      {/* MAP LEGEND */}
      <View style={[styles.legend, { backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', borderColor: isDarkMode ? '#1e293b' : '#e2e8f0' }]}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
          <Text style={[styles.legendText, { color: isDarkMode ? '#F1F5F9' : '#1e293b' }]}>Responder</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
          <Text style={[styles.legendText, { color: isDarkMode ? '#F1F5F9' : '#1e293b' }]}>Active SOS</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  statusBar: {
    flexDirection: 'row',
    paddingTop: 50,
    paddingBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 4
  },
  statusText: { color: '#FFF', fontWeight: '700', fontSize: 13, letterSpacing: 0.5 },
  floatingButtons: {
    position: 'absolute',
    top: 120,
    right: 20,
    zIndex: 20
  },
  fab: {
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3
  },
  legend: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  legendText: { fontSize: 12, fontWeight: '700' }
});