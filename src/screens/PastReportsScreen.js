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

// --- CONFIG ---
// Use your active ngrok URL here
const SERVER_URL = "https://thunderingly-cuspidat-e-app.ngrok-free.app"; 
const screenWidth = Dimensions.get('window').width;

export default function PastReportsScreen() {
  const [reports, setReports] = useState([]);
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
          // CRITICAL: This bypasses the ngrok warning page that causes fetch errors
          'ngrok-skip-browser-warning': 'true' 
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      // Reverse to show newest reports first
      setReports(data.reverse());
    } catch (error) {
      console.error("Error fetching reports:", error);
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
        <div style={[styles.statusBadge, item.severity === 'High' ? styles.bgRed : styles.bgBlue]}>
          <Text style={styles.statusText}>{item.severity || "Normal"}</Text>
        </div>
      </View>
      
      <Text style={styles.locationText}>
        <Ionicons name="location" size={12}/> {item.location || "Unknown Location"}
      </Text>
      
      <Text style={styles.descriptionText}>{item.description}</Text>
      
      {/* --- IMAGE RENDERING --- */}
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
      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item, index) => item.id ? item.id.toString() : index.toString()}
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