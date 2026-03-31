import React, { useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  FlatList, KeyboardAvoidingView, Platform, Alert, StatusBar 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const COLORS = {
  background: "#16252C", 
  surface: "#1C262F",    // Inactive button/Card color
  inputBg: "#0D151B",    // Recessed input color
  primary: "#2589F5",    // Electric blue from SS
  textMain: "#FFFFFF",
  textDim: "#8A9AA4",
  placeholder: "#5F6E78",
  danger: "#FF4444"
};

export default function ReportDisasterScreen({ navigation }) {
  const [category, setCategory] = useState("Flood");
  const [severity, setSeverity] = useState("Moderate");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [reports, setReports] = useState([]); // Start with empty or dummy data

  const handleSubmit = () => {
    if (!location || !details) return Alert.alert("Error", "Please fill all fields");

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
    Alert.alert("Success", "Incident Reported.");
  };

  const deleteReport = (id) => {
    setReports(prev => prev.filter(item => item.id !== id));
  };

  const renderHeader = () => (
    <View style={styles.formContainer}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation?.goBack()}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Incident</Text>
        <View style={{ width: 30 }} />
      </View>

      <Text style={styles.label}>Disaster Type</Text>
      <View style={styles.row}>
        {["Flood", "Landslide", "Other"].map(item => (
          <TouchableOpacity 
            key={item} 
            style={[styles.choice, category === item ? styles.choiceActive : styles.choiceInactive]} 
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
            style={[styles.choice, severity === item ? styles.choiceActive : styles.choiceInactive]} 
            onPress={() => setSeverity(item)}
          >
            <Text style={[styles.choiceText, severity === item && styles.choiceTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Location</Text>
      <View style={styles.inputContainer}>
        <Ionicons name="location-outline" size={20} color={COLORS.placeholder} style={{ marginRight: 12 }} />
        <TextInput 
          style={styles.textInput} 
          placeholder="e.g. Sindhupalchok, Ward 4" 
          placeholderTextColor={COLORS.placeholder}
          value={location}
          onChangeText={setLocation}
        />
      </View>

      <Text style={styles.label}>Details</Text>
      <View style={[styles.inputContainer, styles.multiLineContainer]}>
        <TextInput 
          style={styles.textInput} 
          placeholder="Describe the current situation..." 
          placeholderTextColor={COLORS.placeholder}
          multiline
          value={details}
          onChangeText={setDetails}
        />
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Report</Text>
      </TouchableOpacity>

      {reports.length > 0 && (
        <Text style={[styles.label, { marginTop: 40, fontSize: 20 }]}>Recent Reports</Text>
      )}
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.reportCard}>
      <View style={styles.cardHeader}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.category}</Text>
        </View>
        <Text style={styles.cardDate}>{item.date}</Text>
        <TouchableOpacity onPress={() => deleteReport(item.id)}>
          <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.cardLocation}>📍 {item.location}</Text>
      <Text style={styles.cardDetails}>{item.details}</Text>
      
      <View style={styles.severityIndicator}>
        <Text style={styles.severityText}>Severity: {item.severity}</Text>
        <View style={[styles.dot, { backgroundColor: item.severity === 'High' ? COLORS.danger : COLORS.primary }]} />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={{ flex: 1, backgroundColor: COLORS.background }}
    >
      <StatusBar barStyle="light-content" />
      <FlatList
        data={reports}
        ListHeaderComponent={renderHeader}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  listPadding: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  formContainer: { marginBottom: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  headerTitle: { color: 'white', fontSize: 24, fontWeight: '800' },
  label: { color: 'white', fontSize: 18, fontWeight: '700', marginTop: 25, marginBottom: 12 },
  
  row: { flexDirection: 'row', gap: 10 },
  choice: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  choiceInactive: { backgroundColor: COLORS.surface },
  choiceActive: { backgroundColor: COLORS.primary }, 
  choiceText: { color: COLORS.textDim, fontWeight: 'bold' },
  choiceTextActive: { color: 'white' },

  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', 
    backgroundColor: COLORS.inputBg, borderRadius: 14, 
    paddingHorizontal: 18, height: 65 
  },
  multiLineContainer: { height: 120, alignItems: 'flex-start', paddingTop: 18 },
  textInput: { flex: 1, color: 'white', fontSize: 16 },
  
  submitButton: { 
    backgroundColor: COLORS.primary, height: 65, borderRadius: 16, 
    justifyContent: 'center', alignItems: 'center', marginTop: 40 
  },
  submitText: { color: 'white', fontSize: 19, fontWeight: 'bold' },

  // --- REPORT LIST STYLES ---
  reportCard: {
    backgroundColor: COLORS.surface,
    padding: 18,
    borderRadius: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#2A3742'
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  tag: { backgroundColor: COLORS.inputBg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  tagText: { color: COLORS.primary, fontWeight: 'bold', fontSize: 12 },
  cardDate: { color: COLORS.textDim, fontSize: 12, marginLeft: 'auto', marginRight: 10 },
  cardLocation: { color: 'white', fontWeight: 'bold', fontSize: 16, marginBottom: 6 },
  cardDetails: { color: COLORS.textDim, fontSize: 14, lineHeight: 20 },
  severityIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#2A3742' },
  severityText: { color: COLORS.textDim, fontSize: 12, marginRight: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 }
});