import React, { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { 
  StyleSheet, View, Text, Platform, ActivityIndicator, 
  TouchableOpacity, SafeAreaView, StatusBar 
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
  
  const [status, setStatus] = useState('Initializing...');
  const [userLocation, setUserLocation] = useState(null);
  const [sosData, setSosData] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDarkMode = theme === 'dark';

  // Memoize marker data to prevent unnecessary re-renders
  const markers = useMemo(() => sosData, [sosData]);

  const recenter = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  useEffect(() => {
    let locationSubscription;

    const initializeMap = async () => {
      try {
        setLoading(true);
        setStatus('Locating...');

        // 1. Permissions
        const { status: locStatus } = await Location.requestForegroundPermissionsAsync();
        if (locStatus !== 'granted') {
          setStatus('Location Permission Denied');
          setLoading(false);
          return;
        }

        // 2. Initial Position
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const initialRegion = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        };
        setUserLocation(initialRegion);

        // 3. Fetch Data
        fetchEmergencyData();

        // 4. Watch location for real-time movement
        locationSubscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.High, distanceInterval: 10 },
          (newLoc) => {
            setUserLocation(prev => ({
              ...prev,
              latitude: newLoc.coords.latitude,
              longitude: newLoc.coords.longitude,
            }));
          }
        );

      } catch (err) {
        setStatus('Connection Error');
        console.error("Initialization Error:", err);
      } finally {
        setLoading(false);
      }
    };

    initializeMap();

    return () => {
      if (locationSubscription) locationSubscription.remove();
    };
  }, []);

  const fetchEmergencyData = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/sos/all`, { timeout: 5000 });
      setSosData(response.data || []);
      setStatus('Live Tactical View');
    } catch (err) {
      setStatus('Offline Mode');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#020617' : '#f8fafc' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* HEADER STATUS BAR */}
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#0f172a' : '#3b82f6' }]}>
        <View style={styles.statusBarContent}>
          <Ionicons 
            name={status.includes('Live') ? "shield-checkmark" : "warning"} 
            size={16} 
            color="#FFF" 
          />
          <Text style={styles.statusText}>{status.toUpperCase()}</Text>
          {loading && <ActivityIndicator size="small" color="#fff" style={{ marginLeft: 10 }} />}
        </View>
      </SafeAreaView>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        mapType={Platform.OS === 'android' ? "none" : "standard"}
        initialRegion={userLocation || {
          latitude: 27.7172,
          longitude: 85.3240,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        showsUserLocation={false} // Using custom marker for better tactical styling
        rotateEnabled={false}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          tileSize={256}
          shouldReplaceMapContent={true}
          zIndex={1}
        />

        {/* Tactical Dark Overlay (Optional - only if you want OSM to look darker) */}
        {isDarkMode && (
           <UrlTile
             urlTemplate="https://stamen-tiles.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}.png"
             opacity={0.3}
             zIndex={2}
           />
        )}

        {/* User Tactical Marker */}
        {userLocation && (
          <Marker 
            coordinate={userLocation} 
            anchor={{ x: 0.5, y: 0.5 }}
            zIndex={20}
          >
             <View style={styles.userMarkerContainer}>
                <View style={styles.userMarkerPulse} />
                <Ionicons name="navigate" size={20} color="#3b82f6" />
             </View>
          </Marker>
        )}

        {/* SOS Markers */}
        {markers.map((item, idx) => (
          <Marker 
            key={item.id || `sos-${idx}`} 
            coordinate={{ 
              latitude: parseFloat(item.lat), 
              longitude: parseFloat(item.lng) 
            }} 
            zIndex={15}
          >
            <Ionicons name="alert-circle" size={32} color="#ef4444" />
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{item.type || "Emergency"}</Text>
                <Text style={styles.calloutDesc}>{item.message || "Assistance needed"}</Text>
                <View style={styles.calloutArrow} />
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* FLOATING ACTION BUTTONS */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]} 
          onPress={fetchEmergencyData}
        >
          <Ionicons name="refresh" size={22} color={isDarkMode ? '#94a3b8' : '#3b82f6'} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: isDarkMode ? '#1e293b' : '#fff', marginTop: 12 }]} 
          onPress={recenter}
        >
          <Ionicons name="locate" size={22} color={isDarkMode ? '#F1F5F9' : '#3b82f6'} />
        </TouchableOpacity>
      </View>

      {/* MAP LEGEND */}
      <View style={[styles.legend, { 
        backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)', 
        borderColor: isDarkMode ? '#334155' : '#e2e8f0' 
      }]}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#3b82f6' }]} />
          <Text style={[styles.legendText, { color: isDarkMode ? '#cbd5e1' : '#1e293b' }]}>My Position</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#ef4444' }]} />
          <Text style={[styles.legendText, { color: isDarkMode ? '#cbd5e1' : '#1e293b' }]}>Active SOS</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  safeArea: {
    zIndex: 10,
    elevation: 10,
  },
  statusBarContent: {
    flexDirection: 'row',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusText: { 
    color: '#FFF', 
    fontWeight: '800', 
    fontSize: 11, 
    letterSpacing: 1, 
    marginLeft: 8 
  },
  floatingButtons: {
    position: 'absolute',
    top: 100,
    right: 16,
    zIndex: 20
  },
  fab: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  userMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerPulse: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.4)',
  },
  calloutContainer: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    width: 200,
    marginBottom: 5,
  },
  calloutTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginBottom: 4 },
  calloutDesc: { color: '#94a3b8', fontSize: 12 },
  calloutArrow: {
    borderTopColor: '#1e293b',
    borderTopWidth: 8,
    borderRightColor: 'transparent',
    borderRightWidth: 8,
    borderLeftColor: 'transparent',
    borderLeftWidth: 8,
    alignSelf: 'center',
    marginBottom: -16,
  },
  legend: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  legendText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }
});