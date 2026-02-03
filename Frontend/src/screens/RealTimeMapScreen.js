import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, View, StatusBar, ActivityIndicator } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../config";
// YOUR PROVIDED KEY
const STADIA_API_KEY = "177da6b6-b7e8-47b3-a29d-59af760d6f2b";

export default function RealTimeMapScreen() {
  const { token } = useContext(AuthContext);
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSOS();
  }, []);

  const fetchSOS = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/sos/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSosList(res.data);
    } catch (err) {
      console.log("Error fetching SOS data:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <MapView
          style={styles.map}
          // "none" hides the default Google Maps background
          mapType="none" 
          initialRegion={{
            latitude: 27.7172,
            longitude: 85.324,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
        >
          {/* THE DARK THEME TILE LAYER USING YOUR KEY */}
          <UrlTile
            urlTemplate={`https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png?api_key=${STADIA_API_KEY}`}
            maximumZ={19}
            flipY={false}
          />

          {sosList.map((sos) => (
            <Marker
              key={sos.id}
              coordinate={{
                latitude: parseFloat(sos.lat),
                longitude: parseFloat(sos.lng),
              }}
              title="SOS Alert"
              description={sos.message}
            >
              {/* Custom Red Marker */}
              <View style={styles.markerGlow}>
                <View style={styles.markerCore} />
              </View>
            </Marker>
          ))}
        </MapView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
  map: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  markerGlow: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(239, 68, 68, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  markerCore: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});