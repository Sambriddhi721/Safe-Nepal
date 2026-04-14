import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  Platform,
  Linking,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart, BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function ReliefCenterDetails({ route, navigation }) {
  // Get center data passed from ReliefCenterScreen
  const { center } = route.params;

  // Function to open native Maps
  const openMaps = () => {
    const { latitude, longitude } = center.coords;
    const label = center.title;
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${latitude},${longitude}`,
      android: `geo:0,0?q=${latitude},${longitude}(${label})`,
    });
    Linking.openURL(url);
  };

  // Mock data for resource tracking
  const supplyData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [{ data: [40, 65, 30, 85, 95, 60] }],
  };

  const inventoryData = {
    labels: ["Shelter", "Food", "Medical", "Water"],
    datasets: [{ data: [85, 40, 60, 90] }],
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue theme
    labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
    style: { borderRadius: 16 },
    propsForDots: { r: "6", strokeWidth: "2", stroke: "#3b82f6" },
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details & Analytics</Text>
        <TouchableOpacity onPress={openMaps}>
          <Ionicons name="map-outline" size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Info Card */}
        <View style={styles.infoSection}>
          <View style={styles.badgeRow}>
            <Text style={styles.typeBadge}>{center.type.toUpperCase()}</Text>
            {center.distance && (
              <Text style={styles.distanceText}>
                <Ionicons name="navigate" size={12} /> {center.distance.toFixed(1)} km away
              </Text>
            )}
          </View>
          
          <Text style={styles.title}>{center.title}</Text>
          
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color="#ef4444" />
            <Text style={styles.locationText}>{center.location}</Text>
          </View>

          <Text style={styles.descriptionText}>{center.description}</Text>
          
          <View style={styles.tagRow}>
            {center.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <MaterialCommunityIcons name={tag.icon} size={16} color="#3b82f6" />
                <Text style={styles.tagText}>{tag.name}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.divider} />

        {/* Analytics Section */}
        <View style={styles.graphSection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="trending-up" size={20} color="#111827" />
            <Text style={styles.sectionTitle}>Aid Distribution Trends</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Units distributed over the last 6 days</Text>
          <LineChart
            data={supplyData}
            width={screenWidth - 40}
            height={200}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />

          <View style={[styles.sectionHeader, { marginTop: 30 }]}>
            <MaterialCommunityIcons name="package-variant" size={20} color="#111827" />
            <Text style={styles.sectionTitle}>Current Stock Levels (%)</Text>
          </View>
          <BarChart
            data={inventoryData}
            width={screenWidth - 40}
            height={200}
            chartConfig={chartConfig}
            style={styles.chart}
            fromZero
            showValuesOnTopOfBars
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.directionsButton} onPress={openMaps}>
            <Ionicons name="location" size={20} color="#fff" />
            <Text style={styles.buttonText}>Get Directions</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.contactButton}>
            <Ionicons name="call" size={20} color="#3b82f6" />
            <Text style={[styles.buttonText, { color: "#3b82f6" }]}>Contact Hub</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
  scrollContent: { paddingBottom: 40 },
  infoSection: { padding: 20 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  typeBadge: { color: '#3b82f6', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  distanceText: { color: '#ef4444', fontWeight: '700', fontSize: 13 },
  title: { fontSize: 26, fontWeight: "800", color: "#111827", marginBottom: 10 },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  locationText: { fontSize: 15, color: "#6b7280", marginLeft: 5, flex: 1 },
  descriptionText: { fontSize: 15, color: "#4b5563", lineHeight: 22, marginBottom: 20 },
  tagRow: { flexDirection: "row", flexWrap: "wrap" },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 8
  },
  tagText: { color: "#3b82f6", fontSize: 13, fontWeight: "600", marginLeft: 6 },
  divider: { height: 8, backgroundColor: "#f9fafb" },
  graphSection: { padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#111827", marginLeft: 8 },
  sectionSubtitle: { fontSize: 13, color: "#9ca3af", marginBottom: 15, marginLeft: 28 },
  chart: { marginVertical: 8, borderRadius: 16 },
  buttonContainer: { padding: 20 },
  directionsButton: {
    backgroundColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2
  },
  contactButton: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#3b82f6"
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 10 },
});