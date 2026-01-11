import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, Feather } from "@expo/vector-icons";

// Mock Data for Alerts
const MOCK_ALERTS = [
  {
    id: "1",
    title: "High Flood",
    type: "Flood",
    location: "Sindhupalchok District",
    time: "25 mins ago",
    severity: "High",
    color: "#FF4D4D",
    icon: "water",
  },
  {
    id: "2",
    title: "Risk of Flash Flood",
    type: "Flood",
    location: "Gorkha Municipality",
    time: "2 hours ago",
    severity: "High",
    color: "#FFB020",
    icon: "terrain",
  },
  {
    id: "3",
    title: "Landslide Warning",
    type: "Landslide",
    location: "Manang Location",
    time: "8 hours ago",
    severity: "Moderate",
    color: "#1E90FF",
    icon: "layers",
  },
];

export default function AlertsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("Active");
  const [search, setSearch] = useState("");

  const renderAlertCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate("AlertDetails", { alertId: item.id })}
    >
      {/* Side Color Indicator */}
      <View style={[styles.severityBar, { backgroundColor: item.color }]} />
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, { backgroundColor: item.color + "15" }]}>
            <MaterialIcons name={item.icon} size={24} color={item.color} />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.alertTitle}>{item.title}</Text>
            <Text style={[styles.severityLabel, { color: item.color }]}>
              {item.severity} Severity
            </Text>
          </View>
          <Text style={styles.timeText}>{item.time}</Text>
        </View>
        
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={14} color="#9ca3af" />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Feather name="search" size={18} color="#9ca3af" />
        <TextInput
          placeholder="Search by location..."
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        <FilterChip label="Filter" icon="tune" isActive={false} />
        <FilterChip label="Landslide" isActive={false} />
        <FilterChip label="Flood" isActive={true} />
        <FilterChip label="Severity" icon="expand-more" isActive={false} />
      </ScrollView>

      {/* Tab Switcher */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "Active" && styles.activeTab]} 
          onPress={() => setActiveTab("Active")}
        >
          <Text style={[styles.tabText, activeTab === "Active" && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "Past" && styles.activeTab]} 
          onPress={() => setActiveTab("Past")}
        >
          <Text style={[styles.tabText, activeTab === "Past" && styles.activeTabText]}>Past</Text>
        </TouchableOpacity>
      </View>

      {/* Alerts List */}
      <FlatList
        data={MOCK_ALERTS}
        renderItem={renderAlertCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add-location" size={28} color="#fff" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

// Sub-component for Filter Chips
const FilterChip = ({ label, icon, isActive }) => (
  <TouchableOpacity style={[styles.chip, isActive && styles.activeChip]}>
    {icon && <MaterialIcons name={icon} size={16} color={isActive ? "#fff" : "#9ca3af"} style={{ marginRight: 4 }} />}
    <Text style={[styles.chipText, isActive && styles.activeChipText]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20
  },
  headerTitle: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  
  searchContainer: {
    backgroundColor: "#111827",
    marginHorizontal: 20,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 50,
    marginBottom: 15,
  },
  searchInput: { color: "#fff", marginLeft: 10, flex: 1 },

  filterRow: { paddingLeft: 20, marginBottom: 20, maxHeight: 40 },
  chip: {
    backgroundColor: "#1f2937",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#374151'
  },
  activeChip: { backgroundColor: '#1e90ff', borderColor: '#1e90ff' },
  chipText: { color: "#9ca3af", fontSize: 14, fontWeight: '600' },
  activeChipText: { color: "#fff" },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: "#111827",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 4,
    marginBottom: 20
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  activeTab: { backgroundColor: '#1f2937' },
  tabText: { color: "#9ca3af", fontWeight: '600' },
  activeTabText: { color: "#fff" },

  listContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    marginBottom: 15,
    flexDirection: 'row',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1f2937'
  },
  severityBar: { width: 6 },
  cardContent: { flex: 1, padding: 15 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  iconBox: { width: 45, height: 45, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  titleContainer: { flex: 1, marginLeft: 12 },
  alertTitle: { color: "#fff", fontSize: 16, fontWeight: 'bold' },
  severityLabel: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  timeText: { color: "#9ca3af", fontSize: 12 },
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginLeft: 57 },
  locationText: { color: "#9ca3af", fontSize: 13, marginLeft: 5 },

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#1e90ff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  }
});