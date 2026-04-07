import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TextInput, 
  TouchableOpacity, 
  RefreshControl,
  SafeAreaView // ADDED THIS IMPORT
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// 1. CHANGE THIS to your laptop's IP address (e.g., 192.168.1.X) 
// to work on a real phone.
const SERVER_URL = "http://10.0.2.2:5000"; // 10.0.2.2 is the alias for localhost on Android Emulators

const MOCK_REPORTS = [
  { id: "f1", category: "Flood", severity: "High", location: "Bishnumati Corridor, Kathmandu", description: "River levels rising rapidly. Residents being evacuated.", timestamp: "2026-03-31 10:30" },
  { id: "f2", category: "Flood", severity: "Moderate", location: "Koshi Barrage Area", description: "Minor overflow in fields. Water levels stable.", timestamp: "2026-03-30 14:15" },
  { id: "l1", category: "Landslide", severity: "High", location: "Muglin-Narayanghat Road", description: "Major landslide blocking the highway. Avoid route.", timestamp: "2026-03-31 08:45" },
  { id: "l2", category: "Landslide", severity: "Moderate", location: "Sindhupalchok, Ward 4", description: "Small mudslide near residential area. No injuries.", timestamp: "2026-03-30 18:20" }
];

export default function PastReportsScreen() {
  const [activeTab, setActiveTab] = useState("Flood");
  const [searchQuery, setSearchQuery] = useState("");
  const [allReports, setAllReports] = useState(MOCK_REPORTS);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    setRefreshing(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/reports`);
      if (response.ok) {
        const data = await response.json();
        // If server returns data, use it. Otherwise, stay with Mock.
        setAllReports(data && data.length > 0 ? data : MOCK_REPORTS);
      } else {
        setAllReports(MOCK_REPORTS);
      }
    } catch (error) {
      console.log("Fetch failed, using mock data instead.");
      setAllReports(MOCK_REPORTS);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchReports(); 
  }, []);

  const filteredData = allReports.filter(item => 
    item.category === activeTab && 
    item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSeverityColor = (sev) => {
    if (sev === "High") return "#ef4444";
    if (sev === "Moderate") return "#f59e0b";
    return "#10b981";
  };

  const renderReportItem = ({ item }) => (
    <View style={styles.reportCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.locationText}>📍 {item.location}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getSeverityColor(item.severity) }]}>
          <Text style={styles.statusText}>{item.severity}</Text>
        </View>
      </View>
      <Text style={styles.detailText}>{item.description}</Text>
      <Text style={styles.timeText}>{item.timestamp}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94a3b8" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search place (e.g. Kathmandu)..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        {["Flood", "Landslide"].map(tab => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tabItem, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab}s
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredData}
        keyExtractor={item => item.id}
        renderItem={renderReportItem}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={fetchReports} 
            tintColor="#3b82f6" 
            colors={["#3b82f6"]}
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={50} color="#334155" />
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} reports found.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#162a31" },
  searchSection: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 15 },
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: "#0f172a", 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    height: 50 
  },
  searchInput: { flex: 1, color: 'white', marginLeft: 10, fontSize: 14 },
  tabBar: { 
    flexDirection: 'row', 
    marginHorizontal: 20, 
    marginBottom: 15, 
    backgroundColor: "#1e293b", 
    borderRadius: 10, 
    padding: 4 
  },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabActive: { backgroundColor: "#3b82f6" },
  tabText: { color: "#94a3b8", fontWeight: '700' },
  tabTextActive: { color: "white" },
  reportCard: { 
    backgroundColor: "#1e293b", 
    borderRadius: 15, 
    padding: 18, 
    marginHorizontal: 20, 
    marginTop: 12, 
    borderWidth: 1, 
    borderColor: "#334155" 
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  locationText: { color: "#f1f5f9", fontWeight: '700', fontSize: 14, flex: 0.8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 5 },
  statusText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  detailText: { color: "#94a3b8", fontSize: 13, lineHeight: 18 },
  timeText: { color: "#64748b", fontSize: 10, marginTop: 10, textAlign: 'right' },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: "#64748b", marginTop: 10, fontSize: 14 }
});