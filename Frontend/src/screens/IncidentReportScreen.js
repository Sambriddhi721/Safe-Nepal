import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function IncidentManager({ navigation }) {
  const [activeView, setActiveView] = useState("history"); // 'history' or 'report'
  
  // Data State for past reports (Matches image_1232fe.png)
  const [reports, setReports] = useState([
    { id: "1", title: "Melamchi, Sindhupalchowk", date: "15 Aug 2023, 10:30 AM", level: "High", status: "Verified", color: "#ff4d4d", type: "Landslide" },
    { id: "2", title: "Narayani River, Chitwan", date: "14 Aug 2023, 08:00 PM", level: "Medium", status: "Pending", color: "#f5c542", type: "Flood" },
    { id: "3", title: "Koshi Barrage, Saptari", date: "12 Aug 2023, 03:45 PM", level: "Low", status: "Resolved", color: "#34c759", type: "Flood" },
  ]);

  // Form State for new report
  const [incidentType, setIncidentType] = useState("Landslide");
  const [msg, setMsg] = useState("");

  const submitNewReport = () => {
    if (!msg) return Alert.alert("Error", "Please add a short message.");
    
    const newEntry = {
      id: Date.now().toString(),
      title: "Current Location",
      date: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      level: "High",
      status: "Pending",
      color: incidentType === "Landslide" ? "#ff4d4d" : "#1e90ff",
      type: incidentType,
    };

    setReports([newEntry, ...reports]);
    Alert.alert("Success", "Incident reported successfully!");
    setActiveView("history");
    setMsg("");
  };

  // --- RENDER HISTORY LIST (image_1232fe.png) ---
  const renderHistory = () => (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Reports</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={18} color="#aaa" />
        <TextInput placeholder="Search by location or keyword..." placeholderTextColor="#999" style={styles.searchInput} />
      </View>

      <View style={styles.filterContainer}>
        {["Type", "Status", "Severity"].map((item) => (
          <View key={item} style={styles.filterBadge}>
            <Text style={styles.filterText}>{item}</Text>
            <Ionicons name="chevron-down" size={14} color="#fff" />
          </View>
        ))}
      </View>

      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reportCard}>
            <View style={[styles.cardIcon, { backgroundColor: item.color + "20" }]}>
              <MaterialIcons name={item.type === "Flood" ? "waves" : "landscape"} size={22} color={item.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDate}>{item.date}</Text>
              <View style={styles.tagRow}>
                <View style={[styles.tag, { backgroundColor: item.color + "30" }]}>
                  <Text style={[styles.tagText, { color: item.color }]}>● {item.level}</Text>
                </View>
                <View style={styles.statusTag}>
                  <Text style={styles.statusText}>{item.status}</Text>
                </View>
              </View>
            </View>
            <Ionicons name="map-outline" size={20} color="#aaa" />
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setActiveView("report")}>
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );

  // --- RENDER WRITE REPORT FORM (image_0eea9b.jpg design) ---
  const renderWriteReport = () => (
    <ScrollView style={{ flex: 1 }}>
      <TouchableOpacity onPress={() => setActiveView("history")} style={{ marginTop: 10 }}>
        <Ionicons name="close" size={30} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.sosMain}>EMERGENCY ALERT</Text>
      <Text style={styles.sosSub}>Hold SOS button for 3 seconds to alert responders</Text>

      <View style={styles.sosCircle}>
        <TouchableOpacity style={styles.sosInner} onLongPress={submitNewReport}>
          <Text style={styles.sosText}>SOS</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Emergency Type</Text>
      <View style={styles.typeSelector}>
        {["Landslide", "Flood"].map((t) => (
          <TouchableOpacity 
            key={t} 
            onPress={() => setIncidentType(t)}
            style={[styles.typeBtn, incidentType === t && styles.typeBtnActive]}
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
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      {activeView === "history" ? renderHistory() : renderWriteReport()}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 50 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  searchBar: { flexDirection: "row", backgroundColor: "#1b263b", padding: 12, borderRadius: 10, alignItems: "center" },
  searchInput: { color: "#fff", marginLeft: 10, flex: 1 },
  filterContainer: { flexDirection: "row", justifyContent: "space-between", marginVertical: 15 },
  filterBadge: { flexDirection: "row", backgroundColor: "#1b263b", padding: 8, borderRadius: 20, width: '30%', justifyContent: "center" },
  filterText: { color: "#fff", fontSize: 12, marginRight: 5 },
  reportCard: { flexDirection: "row", backgroundColor: "#1b263b", padding: 15, borderRadius: 15, marginBottom: 12, alignItems: "center" },
  cardIcon: { width: 45, height: 45, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 15 },
  cardTitle: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  cardDate: { color: "#aaa", fontSize: 11, marginVertical: 4 },
  tagRow: { flexDirection: "row" },
  tag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5, marginRight: 10 },
  tagText: { fontSize: 10, fontWeight: "bold" },
  statusTag: { backgroundColor: "#2c3e50", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
  statusText: { color: "#aaa", fontSize: 10 },
  fab: { position: "absolute", bottom: 30, right: 10, width: 60, height: 60, backgroundColor: "#1e90ff", borderRadius: 30, justifyContent: "center", alignItems: "center" },
  // SOS/Report Styles
  sosMain: { color: "#fff", fontSize: 20, fontWeight: "bold", textAlign: "center", marginTop: 20 },
  sosSub: { color: "#aaa", fontSize: 12, textAlign: "center", marginTop: 5 },
  sosCircle: { alignItems: "center", marginVertical: 40 },
  sosInner: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#ff1744", justifyContent: "center", alignItems: "center", borderWidth: 8, borderColor: "rgba(255,23,68,0.2)" },
  sosText: { color: "#fff", fontSize: 28, fontWeight: "bold" },
  label: { color: "#f1c40f", fontWeight: "bold", marginTop: 20, marginBottom: 10 },
  typeSelector: { flexDirection: "row", justifyContent: "space-between" },
  typeBtn: { width: '48%', backgroundColor: "#1b263b", padding: 15, borderRadius: 10, alignItems: "center" },
  typeBtnActive: { borderWidth: 1, borderColor: "#1e90ff" },
  btnText: { color: "#fff", fontWeight: "600" },
  msgInput: { backgroundColor: "#1b263b", borderRadius: 10, padding: 15, color: "#fff", height: 100, textAlignVertical: "top" },
  finalSubmit: { backgroundColor: "#1e90ff", padding: 18, borderRadius: 10, marginTop: 25, alignItems: "center", marginBottom: 30 },
  submitText: { color: "#fff", fontWeight: "bold", fontSize: 16 }
});