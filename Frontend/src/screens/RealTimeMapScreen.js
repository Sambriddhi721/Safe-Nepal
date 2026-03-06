import React, { useEffect, useState, useContext, useCallback } from "react";
import { StyleSheet, View, StatusBar, ActivityIndicator, Text, TouchableOpacity } from "react-native";
import MapView, { Marker, UrlTile, PROVIDER_GOOGLE } from "react-native-maps";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../config";

const STADIA_API_KEY = "177da6b6-b7e8-47b3-a29d-59af760d6f2b";

export default function RealTimeMapScreen() {
  const { token } = useContext(AuthContext);
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSOS = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await axios.get(`${API_BASE}/api/sos/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSosList(res.data);
    } catch (err) {
      console.log("Error fetching SOS data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    fetchSOS();
    // Optional: Set up an interval to auto-refresh every 30 seconds
    const interval = setInterval(() => fetchSOS(), 30000);
    return () => clearInterval(interval);
  }, [fetchSOS]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Fetching Live SOS Alerts...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            mapType="none" // Required for custom UrlTile themes
            initialRegion={{
              latitude: 27.7172,
              longitude: 85.324,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
          >
            <UrlTile
              urlTemplate={`https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png?api_key=${STADIA_API_KEY}`}
              maximumZ={19}
              tileSize={256}
              flipY={false}
            />

            {sosList.map((sos) => (
              <Marker
                key={sos.id}
                coordinate={{
                  latitude: parseFloat(sos.lat),
                  longitude: parseFloat(sos.lng),
                }}
                title="EMERGENCY"
                description={sos.message}
              >
                <View style={styles.markerGlow}>
                  <View style={styles.markerCore} />
                </View>
              </Marker>
            ))}
          </MapView>

          {/* Refresh Button Overlay */}
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={() => fetchSOS(true)}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.refreshText}>Refresh Feed</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#94a3b8", marginTop: 10, fontSize: 14 },
  markerGlow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(239, 68, 68, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  markerCore: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  refreshButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  refreshText: { color: 'white', fontWeight: 'bold' },
});