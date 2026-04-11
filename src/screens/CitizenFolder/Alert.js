import React, { useContext, useState, useEffect } from "react";
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  StatusBar, ActivityIndicator, RefreshControl, TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";

export default function AlertScreen({ navigation }) {
  const { theme } = useContext(ThemeContext) || {};
  const isDarkMode = theme === 'dark';

  const [activeTab, setActiveTab] = useState("Active");
  const [filter, setFilter] = useState("All");
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data to match your screenshot exactly
  const mockData = [
    { id: '1', title: 'High Flood', severity: 'High Severity', location: 'Sindhupalchok District', time: '25 mins ago', type: 'Flood' },
    { id: '2', title: 'Risk of Flash Flood', severity: 'High Severity', location: 'Gorkha Municipality', time: '2 hours ago', type: 'Flood' },
    { id: '3', title: 'Landslide Warning', severity: 'Moderate Severity', location: 'Manang Location', time: '8 hours ago', type: 'Landslide' },
  ];

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setAlerts(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const renderFilterChip = (label) => (
    <TouchableOpacity 
      onPress={() => setFilter(label)}
      style={[styles.chip, filter === label && styles.activeChip]}
    >
      <Text style={[styles.chipText, filter === label && styles.activeChipText]}>{label}</Text>
    </TouchableOpacity>
  );

  const renderAlertItem = ({ item }) => {
    const isFlood = item.type === 'Flood';
    const accentColor = item.severity.includes('High') ? '#ef4444' : '#3b82f6';

    return (
      <TouchableOpacity style={[styles.alertCard, { backgroundColor: isDarkMode ? "#1e293b" : "#ffffff" }]}>
        <View style={[styles.sideIndicator, { backgroundColor: accentColor }]} />
        <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
                name={isFlood ? "waves" : "terrain"} 
                size={24} 
                color={isDarkMode ? "#ff5252" : "#444"} 
            />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardRow}>
            <Text style={[styles.cardTitle, { color: isDarkMode ? "#fff" : "#000" }]}>{item.title}</Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
          <Text style={[styles.severityText, { color: accentColor }]}>{item.severity}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#64748b" />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? "#0f172a" : "#f8fafc" }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alert</Text>
        <TouchableOpacity><Ionicons name="notifications-outline" size={24} color="white" /></TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
        <TextInput 
          placeholder="Search by location..." 
          placeholderTextColor="#64748b"
          style={styles.searchInput}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterIcon}><Ionicons name="options-outline" size={20} color="white" /><Text style={styles.filterText}>Filter</Text></TouchableOpacity>
        {renderFilterChip("Landslide")}
        {renderFilterChip("Flood")}
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity onPress={() => setActiveTab("Active")} style={[styles.tab, activeTab === "Active" && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === "Active" && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setActiveTab("Past")} style={[styles.tab, activeTab === "Past" && styles.activeTab]}>
          <Text style={[styles.tabText, activeTab === "Past" && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={alerts}
        renderItem={renderAlertItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
      />

      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>?</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: 'white' },
  searchContainer: { flexDirection: 'row', backgroundColor: '#1e293b', margin: 20, borderRadius: 12, alignItems: 'center', paddingHorizontal: 15 },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, height: 50, color: 'white' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20 },
  filterIcon: { flexDirection: 'row', backgroundColor: '#334155', padding: 10, borderRadius: 20, alignItems: 'center', marginRight: 10 },
  filterText: { color: 'white', marginLeft: 5 },
  chip: { backgroundColor: '#334155', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, marginRight: 10 },
  activeChip: { backgroundColor: '#3b82f6' },
  chipText: { color: '#94a3b8' },
  activeChipText: { color: 'white' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#1e293b', marginHorizontal: 20, borderRadius: 10, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { backgroundColor: '#334155', borderRadius: 10 },
  tabText: { color: '#64748b', fontWeight: 'bold' },
  activeTabText: { color: 'white' },
  list: { paddingHorizontal: 20 },
  alertCard: { flexDirection: 'row', borderRadius: 15, marginBottom: 15, overflow: 'hidden' },
  sideIndicator: { width: 5 },
  iconContainer: { padding: 15, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  cardContent: { flex: 1, padding: 15 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between' },
  cardTitle: { fontSize: 18, fontWeight: 'bold' },
  timeText: { fontSize: 12, color: '#64748b' },
  severityText: { fontWeight: 'bold', marginVertical: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  locationText: { color: '#64748b', marginLeft: 5, fontSize: 13 },
  fab: { position: 'absolute', bottom: 20, right: 20, width: 60, height: 60, borderRadius: 30, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center' },
  fabText: { color: 'white', fontSize: 24, fontWeight: 'bold' }
});