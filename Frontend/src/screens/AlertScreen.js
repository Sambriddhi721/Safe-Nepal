import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, FlatList, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather } from "@expo/vector-icons";

// Expanded Mock Data to include "Past" alerts
const MOCK_ALERTS = [
  { id: "1", title: "High Flood", type: "Flood", status: "Active", location: "Sindhupalchok District", time: "25 mins ago", severity: "High", color: "#FF4D4D" },
  { id: "2", title: "Risk of Flash Flood", type: "Flood", status: "Active", location: "Gorkha Municipality", time: "2 hours ago", severity: "High", color: "#FFB020" },
  { id: "3", title: "Landslide Warning", type: "Landslide", status: "Active", location: "Manang Location", time: "8 hours ago", severity: "Moderate", color: "#1E90FF" },
  // Past Alerts
  { id: "4", title: "Heavy Rain Flood", type: "Flood", status: "Past", location: "Kathmandu Valley", time: "2 days ago", severity: "Moderate", color: "#9ca3af" },
  { id: "5", title: "Minor Landslide", type: "Landslide", status: "Past", location: "Nuwakot District", time: "1 week ago", severity: "Low", color: "#9ca3af" },
];

export default function AlertScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("Active");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");

  // FIX: Multi-layered filtering logic
  const filteredAlerts = MOCK_ALERTS.filter((item) => {
    const matchesTab = item.status === activeTab;
    const matchesCategory = categoryFilter === "All" || item.type === categoryFilter;
    
    // Search by location OR title for better responsiveness
    const matchesSearch = 
        item.location.toLowerCase().includes(search.toLowerCase()) || 
        item.title.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesCategory && matchesSearch;
  });

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      <SafeAreaView style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        <TouchableOpacity><Ionicons name="notifications-outline" size={24} color="#fff" /></TouchableOpacity>
      </SafeAreaView>

      {/* SEARCH BAR - Now responsive */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#9ca3af" />
        <TextInput 
            style={styles.searchInput} 
            placeholder="Search location or title..." 
            placeholderTextColor="#9ca3af"
            value={search}
            onChangeText={(text) => setSearch(text)} // Direct update
            autoCorrect={false}
        />
        {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#9ca3af" />
            </TouchableOpacity>
        )}
      </View>

      {/* FILTER CHIPS (All / Flood / Landslide) */}
      <View style={{ height: 50, marginBottom: 10 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {["All", "Flood", "Landslide"].map((cat) => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.chip, categoryFilter === cat && styles.activeChip]}
              onPress={() => setCategoryFilter(cat)}
            >
              <Text style={[styles.chipText, categoryFilter === cat && { color: '#fff' }]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* TABS (Active / Past) */}
      <View style={styles.tabContainer}>
        {["Active", "Past"].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.tab, activeTab === tab && styles.activeTab]} 
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LIST VIEW */}
      <FlatList
        data={filteredAlerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={50} color="#374151" />
                <Text style={styles.emptyText}>No alerts found for this criteria.</Text>
            </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card} 
            onPress={() => navigation.navigate("AlertDetails", { alert: item })}
          >
            <View style={[styles.severityBar, { backgroundColor: item.color }]} />
            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.titleGroup}>
                  <Text style={styles.alertTitle}>{item.title}</Text>
                  <Text style={[styles.severityLabel, { color: item.color }]}>{item.severity} Severity</Text>
                </View>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <View style={styles.locRow}>
                <Ionicons name="location-outline" size={14} color="#9ca3af" />
                <Text style={styles.locationText}>{item.location}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => navigation.navigate("ReportDisaster")}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 50, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  searchContainer: { backgroundColor: "#111827", marginHorizontal: 20, borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 50, marginVertical: 15 },
  searchInput: { color: "#fff", marginLeft: 10, flex: 1, fontSize: 16 },
  chip: { backgroundColor: '#1f2937', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, marginRight: 10, height: 40, justifyContent: 'center' },
  activeChip: { backgroundColor: '#1e90ff' },
  chipText: { color: '#9ca3af', fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', backgroundColor: "#111827", marginHorizontal: 20, borderRadius: 10, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#1f2937' },
  tabText: { color: "#9ca3af" },
  activeTabText: { color: "#fff", fontWeight: 'bold' },
  card: { backgroundColor: "#111827", marginHorizontal: 20, borderRadius: 12, marginBottom: 12, flexDirection: 'row', overflow: 'hidden' },
  severityBar: { width: 5 },
  cardContent: { flex: 1, padding: 15 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  titleGroup: { flex: 1 },
  alertTitle: { color: "#fff", fontWeight: 'bold', fontSize: 16 },
  severityLabel: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  timeText: { color: "#9ca3af", fontSize: 12 },
  locRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  locationText: { color: "#9ca3af", marginLeft: 5, fontSize: 13 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#9ca3af', marginTop: 10, fontSize: 14 },
  fab: { position: 'absolute', right: 20, bottom: 30, backgroundColor: '#1e90ff', width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center', elevation: 5 }
});