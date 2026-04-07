import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  FlatList, 
  StatusBar, 
  SafeAreaView, 
  Platform 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";

// Data consistent with project scope
const MOCK_ALERTS = [
  { id: "1", title: "Severe Flash Flood", type: "Flood", status: "Active", location: "Sindhupalchok", time: "25m ago", severity: "High", color: "#FF4D4D" },
  { id: "2", title: "River Level Overflow", type: "Flood", status: "Active", location: "Gorkha", time: "2h ago", severity: "High", color: "#FFB020" },
  { id: "3", title: "Landslide Warning", type: "Landslide", status: "Active", location: "Manang", time: "8h ago", severity: "Moderate", color: "#1E90FF" },
  { id: "4", title: "Heavy Monsoon History", type: "Flood", status: "Past", location: "Kathmandu Valley", time: "2d ago", severity: "Moderate", color: "#9ca3af" },
];

export default function AlertScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("Active");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filteredAlerts = MOCK_ALERTS.filter((item) => {
    const matchesTab = item.status === activeTab;
    const matchesCategory = categoryFilter === "All" || item.type === categoryFilter;
    const matchesSearch = item.location.toLowerCase().includes(search.toLowerCase()) || 
                          item.title.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesCategory && matchesSearch;
  });

  return (
    <LinearGradient colors={["#0f2027", "#13262f", "#0f2027"]} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header Section with Navigation Fix */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>NEPAL DISASTER WATCH</Text>
            <Text style={styles.headerTitle}>Live Alerts</Text>
          </View>
          <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="close-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Feather name="search" size={18} color="#9ca3af" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search location or incident..." 
            placeholderTextColor="#4b5563"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Category Horizontal Filter */}
        <View style={styles.filterWrapper}>
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

        {/* Status Tab Switcher */}
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

        {/* Main Alerts List */}
        <FlatList
          data={filteredAlerts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => navigation.navigate("AlertDetails", { alert: item })}
            >
              <View style={[styles.severityBar, { backgroundColor: item.color }]} />
              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.alertTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={14} color="#9ca3af" />
                  <Text style={styles.locationText}>{item.location}</Text>
                </View>
                <View style={styles.cardFooter}>
                   <View style={[styles.typeBadge, { backgroundColor: `${item.color}25` }]}>
                      <MaterialCommunityIcons 
                        name={item.type === "Flood" ? "water-alert" : "image-filter-hdr"} 
                        size={14} color={item.color} 
                      />
                      <Text style={[styles.typeText, { color: item.color }]}>{item.type}</Text>
                   </View>
                   <Text style={styles.severityText}>{item.severity} Risk</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="shield-check-outline" size={60} color="#1f2937" />
              <Text style={styles.emptyText}>No alerts found in this sector.</Text>
            </View>
          }
        />

        {/* Floating Action Button linked to Citizen/Police reporting */}
        <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate("ReportDisaster")}>
          <LinearGradient colors={["#1e90ff", "#0052D4"]} style={styles.fabGradient}>
            <Ionicons name="megaphone" size={28} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { 
    paddingHorizontal: 20, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginTop: Platform.OS === 'android' ? 40 : 10 
  },
  headerSubtitle: { color: "#1e90ff", fontSize: 10, fontWeight: "900", letterSpacing: 2 },
  headerTitle: { color: "#fff", fontSize: 32, fontWeight: "800" },
  bellBtn: { backgroundColor: "#111827", padding: 12, borderRadius: 15, borderWidth: 1, borderColor: '#1f2937' },
  searchContainer: { 
    backgroundColor: "#0b121f", 
    marginHorizontal: 20, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    height: 55, 
    marginTop: 20, 
    borderWidth: 1, 
    borderColor: '#1f2937' 
  },
  searchInput: { color: "#fff", marginLeft: 10, flex: 1, fontSize: 16 },
  filterWrapper: { height: 50, marginVertical: 15 },
  chip: { 
    backgroundColor: '#111827', 
    paddingHorizontal: 20, 
    paddingVertical: 8, 
    borderRadius: 12, 
    marginRight: 10, 
    height: 40, 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: '#1f2937' 
  },
  activeChip: { backgroundColor: '#1e90ff', borderColor: '#3b82f6' },
  chipText: { color: '#6b7280', fontWeight: 'bold', fontSize: 13 },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: "#0b121f", 
    marginHorizontal: 20, 
    borderRadius: 12, 
    padding: 4, 
    marginBottom: 20, 
    borderWidth: 1, 
    borderColor: '#1f2937' 
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#1f2937' },
  tabText: { color: "#4b5563", fontWeight: '700' },
  activeTabText: { color: "#fff" },
  card: { 
    backgroundColor: "#111827", 
    borderRadius: 20, 
    marginBottom: 15, 
    flexDirection: 'row', 
    overflow: 'hidden', 
    elevation: 5 
  },
  severityBar: { width: 5 },
  cardBody: { flex: 1, padding: 16 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  alertTitle: { color: "#fff", fontWeight: '800', fontSize: 17, flex: 1, marginRight: 10 },
  timeText: { color: "#6b7280", fontSize: 11, fontWeight: '600' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  locationText: { color: "#9ca3af", marginLeft: 5, fontSize: 13, fontWeight: '500' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  typeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  typeText: { fontSize: 11, fontWeight: '900', marginLeft: 5, textTransform: 'uppercase' },
  severityText: { color: '#4b5563', fontSize: 12, fontWeight: '800' },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#374151', marginTop: 15, fontSize: 15, fontWeight: '700' },
  fab: { position: 'absolute', right: 20, bottom: 30, borderRadius: 32.5, elevation: 10 },
  fabGradient: { width: 65, height: 65, borderRadius: 32.5, justifyContent: 'center', alignItems: 'center' }
});