import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

// --- API CONFIG ---
// UPDATED IP ADDRESS FROM YOUR IPCONFIG OUTPUT
const SERVER_URL = "http://192.168.111.70:5000";

export default function IncidentManager({ navigation }) {
  const [activeView, setActiveView] = useState("history"); // 'history' or 'report'
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form State for new report
  const [incidentType, setIncidentType] = useState("Landslide");
  const [msg, setMsg] = useState("");

  // --- LOAD REPORTS FROM BACKEND ---
  useEffect(() => {
    if (activeView === "history") {
      fetchReports();
    }
  }, [activeView]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/reports`);
      const data = await response.json();
      // Reverse to show newest first
      setReports(data.reverse());
    } catch (error) {
      Alert.alert("Error", "Could not connect to server");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // --- SUBMIT REPORT TO BACKEND ---
  const submitNewReport = async () => {
    if (!msg) return Alert.alert("Error", "Please add a description.");

    const reportData = {
      description: msg,
      category: incidentType,
      location: "Chandragiri", // You can update this with Geolocation API
      severity: "High", // Defaulting to high for SOS
      // photo: null // Add photo logic here later
    };

    try {
      const response = await fetch(`${SERVER_URL}/report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      const result = await response.json();

      if (result.success) {
        Alert.alert("Success", "Incident reported to server!");
        setMsg("");
        setActiveView("history");
        fetchReports(); // Refresh the list
      } else {
        Alert.alert("Error", "Failed to report incident");
      }
    } catch (error) {
      Alert.alert("Error", "Server unreachable");
      console.error(error);
    }
  };

  // --- RENDER HISTORY LIST ---
  const renderHistory = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Reports</Text>
        <TouchableOpacity onPress={fetchReports}>
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#aaa" />
        <TextInput
          placeholder="Search reports..."
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1e90ff" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={reports}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.reportCard}>
              <View style={[styles.cardIcon, { backgroundColor: item.category === "Landslide" ? "#ff4d4d20" : "#1e90ff20" }]}>
                <MaterialIcons
                  name={item.category === "Flood" ? "waves" : "landscape"}
                  size={22}
                  color={item.category === "Landslide" ? "#ff4d4d" : "#1e90ff"}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.location}</Text>
                <Text style={styles.cardDate}>{new Date(item.timestamp).toLocaleString()}</Text>
                <View style={styles.tagRow}>
                  <View style={[styles.tag, { backgroundColor: item.category === "Landslide" ? "#ff4d4d30" : "#1e90ff30" }]}>
                    <Text style={[styles.tagText, { color: item.category === "Landslide" ? "#ff4d4d" : "#1e90ff" }]}>
                      ● {item.severity}
                    </Text>
                  </View>
                  <View style={styles.statusTag}>
                    <Text style={styles.statusText}>{item.status || "Pending"}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="map-outline" size={20} color="#aaa" />
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setActiveView("report")}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  // --- RENDER WRITE REPORT FORM ---
  const renderWriteReport = () => (
    <ScrollView style={{ flex: 1 }}>
      <TouchableOpacity
        onPress={() => setActiveView("history")}
        style={{ marginTop: 10 }}
      >
        <Ionicons name="close" size={30} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.sosMain}>EMERGENCY ALERT</Text>
      <Text style={styles.sosSub}>
        Hold SOS button for 3 seconds to alert responders
      </Text>

      <View style={styles.sosCircle}>
        <TouchableOpacity
          style={styles.sosInner}
          onLongPress={submitNewReport}
          delayLongPress={3000}
        >
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Emergency Type</Text>
      <View style={styles.typeSelector}>
        {["Landslide", "Flood"].map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setIncidentType(t)}
            style={[
              styles.typeBtn,
              incidentType === t && styles.typeBtnActive,
            ]}
          >
            <Text style={styles.btnText}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.msgInput}
        placeholder="Describe the situation..."
        placeholderTextColor="#555"
        multiline
        value={msg}
        onChangeText={setMsg}
      />

      <TouchableOpacity style={styles.finalSubmit} onPress={submitNewReport}>
        <Text style={styles.submitText}>Report Incident</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <LinearGradient
      colors={["#0f2027", "#203a43", "#2c5364"]}
      style={styles.container}
    >
      {activeView === "history" ? renderHistory() : renderWriteReport()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  searchBar: {
    flexDirection: "row",
    backgroundColor: "#1b263b",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  searchInput: { color: "#fff", marginLeft: 10, flex: 1 },
  reportCard: {
    flexDirection: "row",
    backgroundColor: "#1b263b",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    alignItems: "center",
  },
  cardIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardTitle: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  cardDate: { color: "#aaa", fontSize: 11, marginVertical: 4 },
  tagRow: { flexDirection: "row" },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginRight: 10 },
  tagText: { fontSize: 10, fontWeight: "bold" },
  statusTag: {
    backgroundColor: "#2c3e50",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 5,
  },
  statusText: { color: "#aaa", fontSize: 10 },
  fab: {
    position: "absolute",
    bottom: 30,
    right: 10,
    width: 60,
    height: 60,
    backgroundColor: "#1e90ff",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  // SOS/Report Styles
  sosMain: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 20,
  },
  sosSub: { color: "#aaa", fontSize: 12, textAlign: "center", marginTop: 5 },
  sosCircle: { alignItems: "center", marginVertical: 40 },
  sosInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ff1744",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 8,
    borderColor: "rgba(255,23,68,0.2)",
  },
  sosText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  label: { color: "#f1c40f", fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  typeSelector: { flexDirection: "row", justifyContent: "space-between" },
  typeBtn: {
    width: "48%",
    backgroundColor: "#1b263b",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  typeBtnActive: { borderWidth: 1, borderColor: "#1e90ff" },
  btnText: { color: "#fff", fontWeight: "600" },
  msgInput: {
    backgroundColor: "#1b263b",
    borderRadius: 10,
    padding: 15,
    color: "#fff",
    height: 100,
    textAlignVertical: "top",
  },
  finalSubmit: {
    backgroundColor: "#1e90ff",
    padding: 18,
    borderRadius: 10,
    marginTop: 25,
    alignItems: "center",
    marginBottom: 30,
  },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});