import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

// REAL DATA: 5 Major Relief/Aid Hubs in Nepal
const REAL_NEPAL_CENTERS = [
  {
    id: "1",
    title: "Nepal Red Cross Society (NRCS) HQ",
    time: "Active: 24/7",
    description: "National central hub for blood bank services, emergency disaster response, and first aid distribution.",
    location: "Red Cross Marg, Kalimati, Kathmandu",
    views: 1250, // Higher views for Trending logic
    tags: [
      { name: "Medical", icon: "medical-bag" },
      { name: "Blood Bank", icon: "blood-bag" },
      { name: "Emergency", icon: "alert-decagram" },
    ],
  },
  {
    id: "2",
    title: "Maitra Nepal Relief Center",
    time: "Posted 4h ago",
    description: "Dedicated support for women and children affected by natural disasters, providing safe shelter and counseling.",
    location: "Gaushala, Pingalasthan, Kathmandu",
    views: 450,
    tags: [
      { name: "Shelter", icon: "home" },
      { name: "Support", icon: "account-group" },
    ],
  },
  {
    id: "3",
    title: "Pokhara Regional Crisis Hub",
    time: "Posted 1d ago",
    description: "Regional distribution point for food supplies and blankets for landslide victims in Kaski and Parbat districts.",
    location: "Nayabazar, Pokhara",
    views: 890,
    tags: [
      { name: "Food", icon: "food-variant" },
      { name: "Blankets", icon: "bed" },
    ],
  },
  {
    id: "4",
    title: "Lumbini Humanitarian Warehouse",
    time: "Active Now",
    description: "Large-scale storage and dispatch center for clean drinking water and hygiene kits for the Terai region.",
    location: "Siddharthanagar, Bhairahawa",
    views: 320,
    tags: [
      { name: "Water", icon: "water" },
      { name: "Hygiene", icon: "hand-water" },
    ],
  },
  {
    id: "5",
    title: "Biratnagar Disaster Resource Center",
    time: "Posted 6h ago",
    description: "Local community-led initiative providing hot meals and temporary tents for flood-displaced families.",
    location: "Main Road, Biratnagar",
    views: 700,
    tags: [
      { name: "Food", icon: "food-apple" },
      { name: "Tents", icon: "tent" },
    ],
  },
];

export default function ReliefCenterScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("Latest");
  const [searchQuery, setSearchQuery] = useState("");

  // FUNCTIONAL LOGIC: Filtering and Sorting
  const filteredData = useMemo(() => {
    let result = [...REAL_NEPAL_CENTERS];

    // 1. Search Logic (Filters by Title, Location, or Tag name)
    if (searchQuery) {
      result = result.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.location.toLowerCase().includes(query) ||
          item.tags.some(tag => tag.name.toLowerCase().includes(query))
        );
      });
    }

    // 2. Trending Logic (Sorts by 'views' count)
    if (activeTab === "Trending") {
      result.sort((a, b) => b.views - a.views);
    }

    return result;
  }, [searchQuery, activeTab]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardTime}>{item.time}</Text>
      </View>
      
      <Text style={styles.description}>{item.description}</Text>
      
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={16} color="#6b7280" />
        <Text style={styles.locationText}>{item.location}</Text>
      </View>

      <View style={styles.tagContainer}>
        {item.tags.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <MaterialCommunityIcons name={tag.icon} size={16} color="#3b82f6" />
            <Text style={styles.tagText}>{tag.name}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.detailsButton}
        onPress={() => navigation.navigate("ReliefCenterDetails", { center: item })}
      >
        <Text style={styles.detailsButtonText}>View Details & Graphs</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relief Centers & Aid</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "Latest" && styles.activeTab]}
          onPress={() => setActiveTab("Latest")}
        >
          <Text style={[styles.tabText, activeTab === "Latest" && styles.activeTabText]}>Latest</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "Trending" && styles.activeTab]}
          onPress={() => setActiveTab("Trending")}
        >
          <Text style={[styles.tabText, activeTab === "Trending" && styles.activeTabText]}>Trending</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR - Functional */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput 
          placeholder="Search Kathmandu, Food, Medical..."
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No centers found in this area.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 15, backgroundColor: "#fff" },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  tabContainer: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 15 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: "#3b82f6" },
  tabText: { fontSize: 16, color: "#6b7280", fontWeight: "600" },
  activeTabText: { color: "#3b82f6" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#f3f4f6", margin: 15, paddingHorizontal: 15, borderRadius: 12, height: 50 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: "#111827" },
  listContent: { paddingBottom: 20 },
  card: { backgroundColor: "#fff", marginHorizontal: 15, marginBottom: 15, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e5e7eb", elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#111827", flex: 1 },
  cardTime: { fontSize: 12, color: "#6b7280" },
  description: { fontSize: 14, color: "#4b5563", lineHeight: 20, marginBottom: 12 },
  locationContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  locationText: { fontSize: 13, color: "#6b7280", marginLeft: 5 },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  tag: { flexDirection: "row", alignItems: "center", backgroundColor: "#eff6ff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  tagText: { color: "#3b82f6", fontSize: 13, fontWeight: "600", marginLeft: 6 },
  detailsButton: { backgroundColor: "#3b82f6", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  detailsButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#9ca3af', fontSize: 16 }
});