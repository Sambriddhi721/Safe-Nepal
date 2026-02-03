import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { LineChart, BarChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

export default function ReliefCenterDetails({ route, navigation }) {
  // Use data passed from the previous screen or fallback to a default
  const { center } = route.params || {
    center: {
      title: "Nepal Red Cross Society (NRCS) HQ",
      location: "Kalimati, Kathmandu",
      description: "National central hub for blood bank services and emergency disaster response.",
      tags: [{ name: "Medical", icon: "medical-bag" }],
    },
  };

  // Mock data for resource tracking graphs
  const supplyData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    datasets: [{ data: [40, 65, 30, 85, 95, 60] }],
  };

  const occupancyData = {
    labels: ["Shelter", "Food", "Medical", "Water"],
    datasets: [{ data: [85, 40, 60, 90] }],
  };

  const chartConfig = {
    backgroundColor: "#ffffff",
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
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
        <Text style={styles.headerTitle}>Center Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Main Info Card */}
        <View style={styles.infoSection}>
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

        {/* Graphs Section */}
        <View style={styles.graphSection}>
          <Text style={styles.sectionTitle}>Aid Distribution Trends</Text>
          <Text style={styles.sectionSubtitle}>Supplies distributed over the last 6 days</Text>
          <LineChart
            data={supplyData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />

          <Text style={[styles.sectionTitle, { marginTop: 25 }]}>Current Inventory Levels (%)</Text>
          <BarChart
            data={occupancyData}
            width={screenWidth - 40}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={0}
            style={styles.chart}
            fromZero
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.contactButton}>
          <Ionicons name="call" size={20} color="#fff" />
          <Text style={styles.contactButtonText}>Contact Center</Text>
        </TouchableOpacity>
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
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  scrollContent: { paddingBottom: 40 },
  infoSection: { padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#111827", marginBottom: 10 },
  locationRow: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  locationText: { fontSize: 16, color: "#6b7280", marginLeft: 5 },
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
  },
  tagText: { color: "#3b82f6", fontSize: 14, fontWeight: "600", marginLeft: 6 },
  divider: { height: 8, backgroundColor: "#f9fafb" },
  graphSection: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#111827", marginBottom: 5 },
  sectionSubtitle: { fontSize: 14, color: "#9ca3af", marginBottom: 15 },
  chart: { marginVertical: 8, borderRadius: 16 },
  contactButton: {
    backgroundColor: "#3b82f6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    margin: 20,
    paddingVertical: 15,
    borderRadius: 12,
  },
  contactButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold", marginLeft: 10 },
});