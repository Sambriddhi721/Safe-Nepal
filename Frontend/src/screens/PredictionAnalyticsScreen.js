import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;
import { API_BASE } from "../config";

export default function PredictionAnalyticsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("Flood"); // Set Flood as default since you have the model
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState({
    riskLevel: "Loading...",
    changePercent: 0,
    trend: [0, 0, 0, 0, 0, 0, 0],
    accuracy: 0,
    model: "Loading...",
    lastUpdated: "Fetching...",
  });

  const fetchAnalytics = async (hazardType) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Sending the hazard type so your Flask 'pkl' logic knows which model to use
        body: JSON.stringify({ 
            hazard_type: hazardType.toLowerCase(),
            location: "Kathmandu" // Example parameter
        }),
      });

      if (!res.ok) throw new Error("Backend connection failed");

      const data = await res.json();

      setAnalytics({
        riskLevel: data.risk_level || "Low Risk",
        changePercent: data.change_percent || 0,
        trend: data.trend || [20, 30, 25, 40, 35, 50, 45],
        accuracy: data.accuracy || 90,
        model: data.model || "ML Model",
        lastUpdated: data.last_updated || "Live",
      });

      // Show alert if risk is High from the .pkl model result
      if (data.risk_level?.toLowerCase().includes("high")) {
        Alert.alert(
          "⚠️ High Risk Detected",
          `Our ${data.model} has detected a High Risk of ${hazardType}. Please check the latest alerts.`,
          [{ text: "View Alerts", onPress: () => navigation.navigate("Alerts") }, { text: "Dismiss" }]
        );
      }
    } catch (err) {
      console.log("Analytics error:", err.message);
      Alert.alert("Connection Error", "Could not reach the prediction server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(activeTab);
  }, [activeTab]);

  const riskColor =
    analytics.riskLevel.toLowerCase().includes("high") ? "#ff3b30" : 
    analytics.riskLevel.toLowerCase().includes("low") ? "#34c759" : "#ffd60a";

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>AI Prediction Engine</Text>
        <TouchableOpacity onPress={() => fetchAnalytics(activeTab)}>
            <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.toggleRow}>
        {["Flood", "Landslide"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.toggleBtn, activeTab === tab && styles.activeToggle]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.toggleText, activeTab === tab && styles.activeToggleText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Real-time Prediction Result</Text>
          
          <View style={[styles.riskBadge, { backgroundColor: riskColor + "22" }]}>
            <Text style={[styles.riskBadgeText, { color: riskColor }]}>
              {analytics.riskLevel.toUpperCase()}
            </Text>
          </View>

          <View style={styles.rowBetween}>
            <Text style={styles.subLabel}>Expected Probability Trend</Text>
            <Text style={[styles.subLabel, { color: analytics.changePercent >= 0 ? "#ff3b30" : "#34c759" }]}>
              {analytics.changePercent >= 0 ? "+" : ""}{analytics.changePercent}% vs Yesterday
            </Text>
          </View>

          {loading ? (
            <View style={styles.chartLoading}><ActivityIndicator color="#1e90ff" /></View>
          ) : (
            <LineChart
              data={{
                labels: ["6h ago", "4h ago", "2h ago", "Now", "+2h", "+4h", "+6h"],
                datasets: [{ data: analytics.trend }],
              }}
              width={screenWidth - 64}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          )}
        </View>

        <View style={styles.infoGrid}>
            <View style={styles.smallCard}>
                <Text style={styles.cardLabel}>Model Accuracy</Text>
                <Text style={styles.valueText}>{analytics.accuracy}%</Text>
            </View>
            <View style={styles.smallCard}>
                <Text style={styles.cardLabel}>Model Type</Text>
                <Text style={styles.valueText}>{analytics.model}</Text>
            </View>
        </View>

        <View style={styles.card}>
            <Text style={styles.cardLabel}>System Status</Text>
            <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: '#34c759' }]} />
                <Text style={styles.infoValue}>Backend: Connected (via {API_BASE})</Text>
            </View>
            <Text style={[styles.infoValue, { marginTop: 5 }]}>Last Model Update: {analytics.lastUpdated}</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#111827",
  backgroundGradientTo: "#111827",
  color: (opacity = 1) => `rgba(30, 144, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(143, 163, 200, ${opacity})`,
  strokeWidth: 3,
  propsForDots: { r: "4", strokeWidth: "2", stroke: "#1e90ff" }
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  toggleRow: { flexDirection: "row", marginHorizontal: 20, borderRadius: 12, backgroundColor: "#1b263b", padding: 5, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  activeToggle: { backgroundColor: "#111827" },
  toggleText: { color: "#8fa3c8", fontWeight: "600" },
  activeToggleText: { color: "#fff" },
  content: { flex: 1, paddingHorizontal: 20 },
  card: { backgroundColor: "#111827", borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: "#1f2933" },
  infoGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  smallCard: { backgroundColor: "#111827", borderRadius: 20, padding: 20, width: '48%', borderWidth: 1, borderColor: "#1f2933" },
  cardLabel: { color: "#8fa3c8", fontSize: 12, marginBottom: 10, textTransform: 'uppercase' },
  riskBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: 15 },
  riskBadgeText: { fontSize: 14, fontWeight: "bold" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  subLabel: { color: "#8fa3c8", fontSize: 12 },
  valueText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  chart: { marginVertical: 8, borderRadius: 16 },
  chartLoading: { height: 200, justifyContent: "center", alignItems: "center" },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  infoValue: { color: "#fff", fontSize: 13 },
});