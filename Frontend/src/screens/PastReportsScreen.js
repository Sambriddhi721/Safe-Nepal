import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PastReportsScreen() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const response = await fetch("http://192.168.111.64:5000/reports");
      const data = await response.json();
      setReports(data.reverse());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const renderReportItem = ({ item }) => (
    <View style={styles.reportCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.categoryText}>{item.category}</Text>
        <View style={[styles.statusBadge, item.severity === 'High' ? styles.bgRed : styles.bgBlue]}>
          <Text style={styles.statusText}>{item.severity}</Text>
        </View>
      </View>
      <Text style={styles.locationText}><Ionicons name="location" size={12}/> {item.location}</Text>
      <Text style={styles.descriptionText}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#2196F3" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderReportItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchReports} tintColor="#2196F3" />}
          ListEmptyComponent={<Text style={styles.emptyText}>No reports yet.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121C22" },
  listContent: { padding: 20 },
  reportCard: { backgroundColor: '#1C2931', borderRadius: 12, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#2A3C46' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  categoryText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  bgRed: { backgroundColor: '#EF4444' },
  bgBlue: { backgroundColor: '#2196F3' },
  statusText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  locationText: { color: '#2196F3', fontSize: 12, marginBottom: 5 },
  descriptionText: { color: '#D1D5DB', fontSize: 14 },
  emptyText: { color: '#5F6E78', textAlign: 'center', marginTop: 50 }
});