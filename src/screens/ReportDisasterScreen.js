import React, { useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  FlatList, KeyboardAvoidingView, Platform, Alert // Added Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const DUMMY_REPORTS = [
  {
    id: "1",
    category: "Flood",
    severity: "High",
    location: "Melamchi, Sindhupalchok",
    details: "River level rising rapidly. Residents are evacuating.",
    date: "2026-03-15",
  },
  {
    id: "2",
    category: "Landslide",
    severity: "Moderate",
    location: "Mugling Road",
    details: "Small debris blocking one lane.",
    date: "2026-03-17",
  }
];

export default function ReportDisasterScreen({ navigation }) {
  const [category, setCategory] = useState("Flood");
  const [severity, setSeverity] = useState("Moderate");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [reports, setReports] = useState(DUMMY_REPORTS);

  const handleSubmit = () => {
    if (!location || !details) return alert("Please fill all fields");

    const newReport = {
      id: Math.random().toString(),
      category,
      severity,
      location,
      details,
      date: new Date().toLocaleDateString(),
    };

    setReports([newReport, ...reports]);
    setLocation("");
    setDetails("");
    alert("Report Submitted Successfully!");
  };

  // --- DELETE FUNCTION ---
  const deleteReport = (id) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to remove this incident record?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            setReports(prev => prev.filter(item => item.id !== id));
          } 
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.formContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Incident</Text>
        <View style={{ width: 28 }} />
      </View>

      <Text style={styles.label}>Disaster Type</Text>
      <View style={styles.row}>
        {["Flood", "Landslide", "Other"].map(item => (
          <TouchableOpacity 
            key={item} 
            style={[styles.choice, category === item && styles.choiceActive]} 
            onPress={() => setCategory(item)}
          >
            <Text style={[styles.choiceText, category === item && styles.choiceTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Severity Level</Text>
      <View style={styles.row}>
        {["Low", "Moderate", "High"].map(item => (
          <TouchableOpacity 
            key={item} 
            style={[styles.choice, severity === item && styles.choiceActive]} 
            onPress={() => setSeverity(item)}
          >
            <Text style={[styles.choiceText, severity === item && styles.choiceTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Location</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={20} color="#5F6E78" style={{ marginRight: 10 }} />
        <TextInput 
          style={styles.textInput} 
          placeholder="e.g. Sindhupalchok" 
          placeholderTextColor="#5F6E78"
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <Text style={styles.label}>Details</Text>
      <View style={[styles.inputContainer, styles.multiLineContainer]}>
        <TextInput 
          style={styles.textInput} 
          placeholder="Describe situation..." 
          placeholderTextColor="#5F6E78"
          multiline
          value={details}
          onChangeText={setDetails}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Report</Text>
      </TouchableOpacity>

      <Text style={[styles.label, { marginTop: 40, fontSize: 20 }]}>Recent Reports</Text>
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.reportCard}>
      <View style={styles.cardTop}>
        <Text style={styles.cardCategory}>{item.category}</Text>
        <View style={[styles.severityDot, { backgroundColor: item.severity === 'High' ? '#FF4444' : '#FFBB33' }]} />
        
        {/* TRASH ICON FOR DELETE */}
        <TouchableOpacity onPress={() => deleteReport(item.id)} style={styles.deleteBtn}>
          <Ionicons name="trash-outline" size={18} color="#5F6E78" />
        </TouchableOpacity>

        <Text style={styles.cardDate}>{item.date}</Text>
      </View>
      <Text style={styles.cardLocation}>📍 {item.location}</Text>
      <Text style={styles.cardDetails}>{item.details}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: "#121C22" }}>
      <FlatList
        data={reports}
        ListHeaderComponent={renderHeader}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 22 },
  formContainer: { marginBottom: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, marginTop: 15 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  label: { color: 'white', fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10 },
  choice: { flex: 1, backgroundColor: '#1C2931', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  choiceActive: { backgroundColor: '#2196F3' },
  choiceText: { color: '#8A9AA4', fontWeight: 'bold' },
  choiceTextActive: { color: 'white' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C2931', borderRadius: 12, paddingHorizontal: 15, height: 55, marginTop: 5 },
  multiLineContainer: { height: 100, alignItems: 'flex-start', paddingTop: 15 },
  textInput: { flex: 1, color: 'white', fontSize: 15 },
  submitButton: { backgroundColor: '#2196F3', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 30 },
  submitText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  
  // Report Card Styles
  reportCard: { backgroundColor: '#1C2931', padding: 15, borderRadius: 15, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: '#2196F3' },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 5 },
  cardCategory: { color: 'white', fontWeight: 'bold', marginRight: 10 },
  severityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 5 },
  deleteBtn: { padding: 5, marginLeft: 5 }, // Style for trash icon
  cardDate: { color: '#5F6E78', fontSize: 12, marginLeft: 'auto' },
  cardLocation: { color: '#2196F3', fontSize: 14, fontWeight: '600', marginBottom: 4 },
  cardDetails: { color: '#8A9AA4', fontSize: 13 }
});