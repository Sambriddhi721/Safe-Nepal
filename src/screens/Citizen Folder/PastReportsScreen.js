import React, { useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  RefreshControl, TouchableOpacity, Share, SafeAreaView, 
  TextInput, ScrollView 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- INTERNAL MOCK DATA FOR DEMO ---
const DEMO_REPORTS = [
  {
    id: "MOCK-1",
    category: "Flood",
    location: "Balkhu, Kathmandu",
    description: "Bagmati river levels rising rapidly. Local residences at risk of inundation. Emergency teams notified.",
    status: "VERIFIED",
    timestamp: "Today, 08:30 AM",
  },
  {
    id: "MOCK-2",
    category: "Landslide",
    location: "Muglin-Narayanghat Road",
    description: "Major landslide blocking the highway near Kurintar. Two vehicles partially trapped. Rescue in progress.",
    status: "CRITICAL",
    timestamp: "Today, 09:15 AM",
  },
  {
    id: "MOCK-3",
    category: "Fire",
    location: "Thamel, Ward 26",
    description: "Electrical short circuit in a commercial building. Fire contained by local fire brigade. No casualties.",
    status: "RESOLVED",
    timestamp: "Yesterday, 10:45 PM",
  },
  {
    id: "MOCK-4",
    category: "Earthquake",
    location: "Gorkha District",
    description: "Mild tremors felt (4.2 magnitude). No immediate reports of structural damage. Monitoring active.",
    status: "MONITORING",
    timestamp: "2 days ago",
  }
];

const SERVER_URL = "https://thunderingly-cuspidat-e-app.ngrok-free.app"; 

export default function PastReportsScreen() {
  const [allReports, setAllReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const fetchReports = async () => {
    setRefreshing(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(`${SERVER_URL}/api/reports/my-history`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'ngrok-skip-browser-warning': 'true' 
        },
      });

      if (response.ok) {
        const data = await response.json();
        const formattedData = data.map(item => ({
          id: item.id.toString(),
          category: item.report_type, 
          location: item.location || "Kathmandu, Nepal",
          description: item.description,
          status: item.status || "SUBMITTED",
          timestamp: item.date || "Just now",
        }));
        // Merge Backend Data + Demo Data so the list is never empty
        const combined = [...formattedData, ...DEMO_REPORTS];
        setAllReports(combined);
        applyLogic(searchQuery, activeFilter, combined);
      } else {
        throw new Error("Offline");
      }
    } catch (error) {
      // If server fails, just show Demo Data
      setAllReports(DEMO_REPORTS);
      applyLogic(searchQuery, activeFilter, DEMO_REPORTS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const applyLogic = (query, filter, data = allReports) => {
    let result = [...data];
    if (filter !== "All") result = result.filter(r => r.category === filter);
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(r => r.location.toLowerCase().includes(q) || r.description.toLowerCase().includes(q));
    }
    setFilteredReports(result);
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    applyLogic(text, activeFilter);
  };

  const onShare = async (report) => {
    const message = `🚨 SAFE NEPAL REPORT\nType: ${report.category}\nLoc: ${report.location}\nStatus: ${report.status}`;
    await Share.share({ message });
  };

  const renderReportItem = ({ item }) => {
    const isCritical = item.status === 'CRITICAL' || item.category === 'Landslide';
    return (
      <View style={styles.reportCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.categoryText}>{item.category.toUpperCase()}</Text>
          <View style={[styles.statusBadge, { backgroundColor: isCritical ? '#ef4444' : '#3b82f6' }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.locationText}>📍 {item.location}</Text>
        <Text style={styles.dateText}>{item.timestamp}</Text>
        <View style={styles.divider} />
        <Text style={styles.detailText}>{item.description}</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={() => onShare(item)}>
          <Ionicons name="share-social-outline" size={16} color="#94a3b8" />
          <Text style={styles.shareText}>Share Report</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.headerTitle}>Incident History</Text>
        <View style={styles.liveBadge}><Text style={styles.liveText}>● SYSTEM ACTIVE</Text></View>
      </View>

      <View style={styles.searchSection}>
        <TextInput 
          placeholder="Search by location..." 
          placeholderTextColor="#64748b"
          style={styles.searchInput}
          onChangeText={handleSearch}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
          {["All", "Flood", "Landslide", "Fire"].map(f => (
            <TouchableOpacity key={f} onPress={() => {setActiveFilter(f); applyLogic(searchQuery, f);}}
              style={[styles.chip, activeFilter === f && styles.chipActive]}>
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredReports}
        keyExtractor={item => item.id}
        renderItem={renderReportItem}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchReports} tintColor="#38bdf8" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },
  screenHeader: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "#0f172a" },
  headerTitle: { color: "#f8fafc", fontSize: 22, fontWeight: "800" },
  liveBadge: { backgroundColor: 'rgba(34, 197, 94, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  liveText: { color: '#22c55e', fontSize: 10, fontWeight: 'bold' },
  searchSection: { padding: 15 },
  searchInput: { backgroundColor: "#1e293b", color: "white", padding: 12, borderRadius: 10, marginBottom: 10 },
  filterBar: { flexDirection: 'row' },
  chip: { paddingHorizontal: 15, paddingVertical: 6, borderRadius: 20, backgroundColor: "#1e293b", marginRight: 8 },
  chipActive: { backgroundColor: "#38bdf8" },
  chipText: { color: "#94a3b8", fontSize: 12 },
  chipTextActive: { color: "#020617", fontWeight: 'bold' },
  reportCard: { backgroundColor: "#0f172a", borderRadius: 15, padding: 15, marginHorizontal: 15, marginBottom: 15, borderWidth: 1, borderColor: "#1e293b" },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryText: { color: "#38bdf8", fontWeight: 'bold', fontSize: 14 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  statusText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  locationText: { color: "white", fontSize: 15, fontWeight: 'bold', marginTop: 10 },
  dateText: { color: "#64748b", fontSize: 12 },
  divider: { height: 1, backgroundColor: "#1e293b", marginVertical: 10 },
  detailText: { color: "#cbd5e1", fontSize: 13, lineHeight: 20 },
  shareBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  shareText: { color: "#94a3b8", fontSize: 12, marginLeft: 5 }
});