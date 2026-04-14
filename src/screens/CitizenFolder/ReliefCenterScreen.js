import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from 'expo-location';

// DUMMY DATA: Expanded with coordinates for Relief Centers and Hospitals in Kathmandu
const DATA_STORES = [
  {
    id: "1",
    title: "Nepal Red Cross Society (NRCS) HQ",
    type: "Relief Center",
    time: "Active: 24/7",
    description: "National central hub for blood bank services and disaster response.",
    location: "Red Cross Marg, Kalimati, Kathmandu",
    coords: { latitude: 27.6985, longitude: 85.3000 },
    views: 1250,
    tags: [{ name: "Medical", icon: "medical-bag" }, { name: "Blood Bank", icon: "blood-bag" }],
  },
  {
    id: "2",
    title: "Maitra Nepal Relief Center",
    type: "Relief Center",
    time: "Posted 4h ago",
    description: "Dedicated support for women and children affected by natural disasters.",
    location: "Gaushala, Pingalasthan, Kathmandu",
    coords: { latitude: 27.7082, longitude: 85.3484 },
    views: 450,
    tags: [{ name: "Shelter", icon: "home" }, { name: "Support", icon: "account-group" }],
  },
  {
    id: "3",
    title: "Tribhuvan University Teaching Hospital (TUTH)",
    type: "Hospital",
    time: "Emergency: 24/7",
    description: "Major public hospital providing comprehensive emergency and trauma care.",
    location: "Maharajgunj, Kathmandu",
    coords: { latitude: 27.7351, longitude: 85.3303 },
    views: 2100,
    tags: [{ name: "Hospital", icon: "hospital-building" }, { name: "ER", icon: "alert" }],
  },
  {
    id: "4",
    title: "Bir Hospital",
    type: "Hospital",
    time: "Emergency: 24/7",
    description: "Oldest and busiest government hospital in Nepal with trauma services.",
    location: "Kanti Path, Kathmandu",
    coords: { latitude: 27.7061, longitude: 85.3138 },
    views: 1800,
    tags: [{ name: "Hospital", icon: "hospital-building" }, { name: "Trauma", icon: "bandage" }],
  },
  {
    id: "5",
    title: "Norvic International Hospital",
    type: "Hospital",
    time: "Active Now",
    description: "Private multi-specialty hospital known for critical care and cardiology.",
    location: "Thapathali, Kathmandu",
    coords: { latitude: 27.6908, longitude: 85.3188 },
    views: 950,
    tags: [{ name: "Private", icon: "shield-check" }, { name: "Medical", icon: "medical-bag" }],
  },
  {
    id: "6",
    title: "Kathmandu Model Hospital",
    type: "Hospital",
    time: "Active 24/7",
    description: "Emergency medical relief and trauma center for nearby residents.",
    location: "Pr प्रदर्शनी Marg, Kathmandu",
    coords: { latitude: 27.7042, longitude: 85.3150 },
    views: 900,
    tags: [{ name: "Hospital", icon: "hospital-building" }, { name: "Medical", icon: "medical-bag" }],
  },
];

export default function ReliefCenterScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("Latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // 1. Haversine Formula for Distance calculation
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // 2. Fetch User Location
  const requestLocation = async () => {
    setLoadingLocation(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location access is needed to find nearest centers.");
        setLoadingLocation(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUserLocation(location.coords);
    } catch (error) {
      Alert.alert("Error", "Could not fetch your location.");
    } finally {
      setLoadingLocation(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  // 3. Filtering and Sorting Logic
  const filteredData = useMemo(() => {
    let result = DATA_STORES.map(item => {
      if (userLocation) {
        const dist = getDistance(
          userLocation.latitude, 
          userLocation.longitude, 
          item.coords.latitude, 
          item.coords.longitude
        );
        return { ...item, distance: dist };
      }
      return item;
    });

    // Handle Tabs
    if (activeTab === "Nearest") {
      result = result.filter(item => item.distance && item.distance <= 10);
      result.sort((a, b) => a.distance - b.distance);
    } else if (activeTab === "Trending") {
      result.sort((a, b) => b.views - a.views);
    }

    // Handle Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(query) || 
        item.location.toLowerCase().includes(query) ||
        item.type.toLowerCase().includes(query)
      );
    }

    return result;
  }, [searchQuery, activeTab, userLocation]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.titleContainer}>
          <Text style={styles.cardType}>{item.type.toUpperCase()}</Text>
          <Text style={styles.cardTitle}>{item.title}</Text>
        </View>
        <Text style={styles.cardDistance}>
          {item.distance ? `${item.distance.toFixed(1)} km` : item.time}
        </Text>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
      
      <View style={styles.locationContainer}>
        <Ionicons name="location-outline" size={14} color="#6b7280" />
        <Text style={styles.locationText}>{item.location}</Text>
      </View>

      <View style={styles.tagContainer}>
        {item.tags.map((tag, idx) => (
          <View key={idx} style={styles.tag}>
            <MaterialCommunityIcons name={tag.icon} size={14} color="#3b82f6" />
            <Text style={styles.tagText}>{tag.name}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity 
        style={styles.detailsButton}
        onPress={() => navigation.navigate("ReliefCenterDetails", { center: item })}
      >
        <Text style={styles.detailsButtonText}>View Details & Status</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Relief & Hospitals</Text>
          <Text style={styles.headerSub}>Emergency Resources in Kathmandu</Text>
        </View>
        <TouchableOpacity onPress={requestLocation}>
          {loadingLocation ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <Ionicons name="refresh-circle" size={32} color="#3b82f6" />
          )}
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        {["Latest", "Trending", "Nearest"].map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color="#9ca3af" />
        <TextInput 
          placeholder="Search Kathmandu, Hospital, Food..." 
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* List */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="map-marker-off" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>
              {activeTab === "Nearest" && !userLocation 
                ? "Enable location to see nearby help." 
                : "No matching results found."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    backgroundColor: "#fff" 
  },
  headerTitle: { fontSize: 24, fontWeight: "800", color: "#111827" },
  headerSub: { fontSize: 13, color: "#6b7280" },
  tabContainer: { flexDirection: "row", backgroundColor: "#fff", paddingHorizontal: 10 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 12, borderBottomWidth: 3, borderBottomColor: "transparent" },
  activeTab: { borderBottomColor: "#3b82f6" },
  tabText: { fontSize: 15, color: "#6b7280", fontWeight: "600" },
  activeTabText: { color: "#3b82f6" },
  searchBar: { flexDirection: "row", backgroundColor: "#f3f4f6", margin: 15, padding: 12, borderRadius: 12, alignItems: "center" },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16 },
  listContent: { paddingBottom: 20 },
  card: { backgroundColor: "#fff", marginHorizontal: 15, marginBottom: 15, borderRadius: 16, padding: 16, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: 'flex-start' },
  titleContainer: { flex: 1 },
  cardType: { fontSize: 10, fontWeight: "bold", color: "#3b82f6", marginBottom: 2 },
  cardTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  cardDistance: { fontSize: 13, fontWeight: "bold", color: "#ef4444" },
  description: { fontSize: 14, color: "#4b5563", marginVertical: 8, lineHeight: 20 },
  locationContainer: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  locationText: { fontSize: 12, color: "#9ca3af", marginLeft: 4 },
  tagContainer: { flexDirection: "row", flexWrap: "wrap", marginBottom: 15 },
  tag: { flexDirection: "row", alignItems: "center", backgroundColor: "#eff6ff", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginRight: 8, marginBottom: 4 },
  tagText: { color: "#3b82f6", fontSize: 12, fontWeight: "600", marginLeft: 4 },
  detailsButton: { backgroundColor: "#3b82f6", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  detailsButtonText: { color: "#fff", fontSize: 15, fontWeight: "bold" },
  emptyContainer: { alignItems: 'center', marginTop: 60, padding: 20 },
  emptyText: { color: '#9ca3af', marginTop: 10, fontSize: 16, textAlign: 'center' }
});