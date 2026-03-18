import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  Image,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SERVER_URL = "https://thunderingly-cuspidat-e-app.ngrok-free.app"; 

// --- DUMMY DATA ---
const DUMMY_REPORTS = [
  {
    id: "d1",
    category: "Flood",
    severity: "High",
    location: "Balkhu, Kathmandu",
    description: "Water levels are rising rapidly near the river bank. Residents are advised to stay alert.",
    photo: "https://images.unsplash.com/photo-1547619292-8816ee7cdd50?q=80&w=1000&auto=format&fit=crop", // Example flood image
    timestamp: new Date().toISOString(),
  },
  {
    id: "d2",
    category: "Landslide",
    severity: "Moderate",
    location: "Mugling Highway",
    description: "Minor landslide blocking one lane. Traffic is moving slowly.",
    photo: "https://images.unsplash.com/photo-1578351649107-1063b1aa864c?q=80&w=1000&auto=format&fit=crop", // Example landslide image
    timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  },
  {
    id: "d3",
    category: "Earthquake",
    severity: "Normal",
    location: "Pokhara, Nepal",
    description: "Minor tremors felt. No damage reported so far.",
    photo: null, // Test how it looks without a photo
    timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
  }
];

export default function PastReportsScreen() {
  // Initialize with Dummy Data so the screen isn't empty
  const [reports, setReports] = useState(DUMMY_REPORTS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${SERVER_URL}/reports`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true' 
        },
      });

      if (response.ok) {
        const data = await response.json();
        // If server has data, combine it with dummy data or replace it
        // To show ONLY server data, use: setReports(data.reverse());
        setReports([...data.reverse(), ...DUMMY_REPORTS]);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
      // Keep showing dummy data even if fetch fails
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const renderReportItem = ({ item }) => (
    <View style={styles.reportCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.categoryText}>{item.category || "General"}</Text>
        {/* FIXED: Changed <div> to <View> */}
        <View style={[styles.statusBadge, item.severity === 'High' ? styles.bgRed : styles.bgBlue]}>
          <Text style={styles.statusText}>{item.severity || "Normal"}</Text>
        </View>
      </View>
      
      <Text style={styles.locationText}>
        <Ionicons name="location" size={12}/> {item.location || "Unknown Location"}
      </Text>
      
      <Text style={styles.descriptionText}>{item.description}</Text>
      
      {item.photo && (
        <Image 
          source={{ uri: item.photo }} 
          style={styles.reportImage}
          resizeMode="cover"
        />
      )}
      
      <Text style={styles.timestampText}>
        {new Date(item.timestamp).toLocaleString()}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading && reports.length === 0 ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderReportItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={fetchReports} 
              tintColor="#2196F3"
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No reports have been submitted yet.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121C22" },
  listContent: { padding: 20 },
  reportCard: { 
    backgroundColor: '#1C2931', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 15, 
    borderWidth: 1, 
    borderColor: '#2A3C46' 
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginBottom: 5 
  },
  categoryText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  bgRed: { backgroundColor: '#EF4444' },
  bgBlue: { backgroundColor: '#2196F3' },
  statusText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  locationText: { color: '#2196F3', fontSize: 12, marginBottom: 5 },
  descriptionText: { color: '#D1D5DB', fontSize: 14, marginBottom: 10 },
  reportImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 5,
  },
  timestampText: {
    color: '#888',
    fontSize: 10,
    marginTop: 10,
    textAlign: 'right',
  },
  emptyText: { color: '#5F6E78', textAlign: 'center', marginTop: 50 }
});