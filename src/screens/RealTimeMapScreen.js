import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, View, ActivityIndicator, Text, PermissionsAndroid, Platform } from "react-native";
import { WebView } from "react-native-webview";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { API_BASE } from "../config";

export default function RealTimeMapScreen() {
  const { token } = useContext(AuthContext);
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Request Android Permissions
  useEffect(() => {
    const requestLocation = async () => {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
        } catch (err) {
          console.warn(err);
        }
      }
    };
    requestLocation();
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/sos/all`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true' 
          },
        });
        setSosList(res.data);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, [token]);

  const mapHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>
        #map { height: 100vh; width: 100vw; margin: 0; }
        body { margin: 0; }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map');

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

        // 2. This part finds YOUR location
        map.locate({setView: true, maxZoom: 16, watch: true});

        function onLocationFound(e) {
          var radius = e.accuracy / 2;
          L.marker(e.latlng).addTo(map)
            .bindPopup("You are here").openPopup();
          L.circle(e.latlng, radius).addTo(map);
        }
        
        map.on('locationfound', onLocationFound);

        // Add backend markers
        const markers = ${JSON.stringify(sosList)};
        markers.forEach(p => {
          if(p.lat && p.lng) L.marker([p.lat, p.lng]).addTo(map).bindPopup(p.message);
        });
      </script>
    </body>
    </html>
  `;

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#EF4444" style={styles.center} />
      ) : (
        <WebView 
          originWhitelist={['*']}
          source={{ html: mapHtml }} 
          style={styles.map}
          // IMPORTANT: Enable these two props for location to work
          geolocationEnabled={true} 
          javaScriptEnabled={true}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  center: { marginTop: 50 }
});