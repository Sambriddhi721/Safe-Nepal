import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";

const MOCK_DATA = [
  {
    id: "1",
    title: "Red Cross Relief Camp",
    time: "Posted 2h ago",
    description: "Emergency supplies and temporary housing available for families displaced by the recent floods.",
    location: "Pokhara Exhibition Center",
    tags: [
      { name: "Food", icon: "food-apple" },
      { name: "Shelter", icon: "home" },
      { name: "Medical", icon: "medical-bag" },
    ],
  },
  {
    id: "2",
    title: "Community Kitchen Initiative",
    time: "Posted 5h ago",
    description: "Providing hot meals and clean drinking water to all affected individuals in the capital region.",
    location: "Kathmandu Valley",
    tags: [
      { name: "Food", icon: "food-variant" },
      { name: "Water", icon: "water" },
    ],
  },
  {
    id: "3",
    title: "Clothing Donation Drive",
    time: "Posted 8h ago",
    description: "Warm clothing, blankets, and essentials collection and distribution center for all age groups.",
    location: "Lalitpur District",
    tags: [
      { name: "Clothes", icon: "tshirt-crew" },
      { name: "Blankets", icon: "bed" },
    ],
  },
];

export default function ReliefCenterScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("Latest");

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
        onPress={() => navigation.navigate("ReliefCenterDetails", { itemId: item.id })}
      >
        <Text style={styles.detailsButtonText}>View Details & Graphs</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
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

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput 
          placeholder="Search by location or aid type"
          placeholderTextColor="#9ca3af"
          style={styles.searchInput}
        />
      </View>

      {/* List */}
      <FlatList
        data={MOCK_DATA}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tab: { flex: 1, alignItems: "center", paddingVertical: 15 },
  activeTab: { borderBottomWidth: 3, borderBottomColor: "#3b82f6" },
  tabText: { fontSize: 16, color: "#6b7280", fontWeight: "600" },
  activeTabText: { color: "#3b82f6" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    margin: 15,
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: "#111827" },
  listContent: { paddingBottom: 20 },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginBottom: 15,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#111827", flex: 1 },
  cardTime: { fontSize: 12, color: "#6b7280" },
  description: { fontSize: 14, color: "#4b5563", lineHeight: 20, marginBottom: 12 },
  locationContainer: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  locationText: { fontSize: 13, color: "#6b7280", marginLeft: 5 },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 20 },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: { color: "#3b82f6", fontSize: 13, fontWeight: "600", marginLeft: 6 },
  detailsButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  detailsButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
});