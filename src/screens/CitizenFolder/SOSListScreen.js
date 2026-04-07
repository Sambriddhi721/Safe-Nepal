import React, { useEffect, useState, useContext } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import * as Linking from "expo-linking";
import { AuthContext } from "../../context/AuthContext";
import { API_BASE } from "../../config";

export default function SOSListScreen() {
  const { token } = useContext(AuthContext);
  const [sosList, setSosList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSOS = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/sos/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSosList(res.data);
    } catch (err) {
      console.log("Fetch Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchSOS(); }, []);

  const updateStatus = async (id, action) => {
    try {
      await axios.patch(`${API_BASE}/api/sos/${id}/${action}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchSOS();
    } catch (err) {
      alert("Update failed");
    }
  };

  const openMap = (lat, lng) => {
    const url = Platform.select({
      ios: `maps:0,0?q=${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}`,
    });
    Linking.openURL(url);
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator size="large" color="#ff1e1e" /></View>
  );

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      <Text style={styles.title}>Active SOS Requests</Text>
      <FlatList
        data={sosList}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchSOS();}} tintColor="#fff" />}
        renderItem={({ item }) => (
          <View style={[styles.card, { borderLeftColor: item.status === 'resolved' ? '#2ecc71' : '#ff1e1e' }]}>
            <View style={styles.badgeRow}>
              <Text style={styles.typeTag}>{item.type?.toUpperCase() || "GENERAL"}</Text>
              <View style={[styles.statusBadge, { backgroundColor: item.status === 'pending' ? '#e74c3c' : '#f1c40f' }]}>
                 <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            
            <Text style={styles.message}>{item.message}</Text>
            
            <TouchableOpacity onPress={() => openMap(item.lat, item.lng)}>
              <Text style={styles.location}>📍 View on Map ({item.lat.toFixed(4)}, {item.lng.toFixed(4)})</Text>
            </TouchableOpacity>

            <View style={styles.actions}>
              {item.status !== 'resolved' && (
                <>
                  <TouchableOpacity style={[styles.button, styles.accept]} onPress={() => updateStatus(item.id, "accept")}>
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.button, styles.resolve]} onPress={() => updateStatus(item.id, "resolve")}>
                    <Text style={styles.buttonText}>Resolve</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No active alerts.</Text>}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f2027" },
  title: { color: "#fff", fontSize: 24, fontWeight: "800", marginBottom: 20, marginTop: 40 },
  card: { backgroundColor: "#1b263b", padding: 16, borderRadius: 14, marginBottom: 15, borderLeftWidth: 6, elevation: 5 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  typeTag: { color: '#ff4d4d', fontWeight: '900', fontSize: 15 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase' },
  message: { color: "#fff", fontSize: 16, marginBottom: 8, lineHeight: 22 },
  location: { color: "#3498db", fontSize: 14, textDecorationLine: 'underline' },
  actions: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: "center" },
  accept: { backgroundColor: "#2ecc71", marginRight: 8 },
  resolve: { backgroundColor: "#e67e22", marginLeft: 8 },
  buttonText: { color: "#fff", fontWeight: "800" },
  empty: { color: '#aaa', textAlign: 'center', marginTop: 50, fontSize: 16 }
});