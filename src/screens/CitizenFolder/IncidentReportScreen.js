import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// --- API CONFIG (Using USB Bridge) ---
const SERVER_URL = "http://127.0.0.1:5000";

export default function IncidentManager({ navigation }) {
  const [activeView, setActiveView] = useState("report"); 
  const [loading, setLoading] = useState(false);

  // Form States to match the UI screenshot
  const [disasterType, setDisasterType] = useState("Flood");
  const [severity, setSeverity] = useState("Moderate");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");

  const submitNewReport = async () => {
    if (!details || !location) return Alert.alert("Error", "Please fill all fields.");

    setLoading(true);
    const reportData = {
      description: details,
      category: disasterType,
      location: location,
      severity: severity,
    };

    try {
      const response = await fetch(`${SERVER_URL}/api/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      const result = await response.json();
      if (result.success || response.ok) {
        Alert.alert("Success", "Incident reported successfully!");
        setDetails("");
        setLocation("");
      } else {
        Alert.alert("Error", "Failed to report incident");
      }
    } catch (error) {
      Alert.alert("Error", "Server unreachable via USB bridge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Incident</Text>
        <View style={{ width: 28 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Disaster Type */}
        <Text style={styles.label}>Disaster Type</Text>
        <View style={styles.row}>
          {["Flood", "Landslide", "Other"].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.chip, disasterType === type && styles.chipActive]}
              onPress={() => setDisasterType(type)}
            >
              <Text style={[styles.chipText, disasterType === type && styles.chipTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Severity Level */}
        <Text style={styles.label}>Severity Level</Text>
        <View style={styles.row}>
          {["Low", "Moderate", "High"].map((level) => (
            <TouchableOpacity
              key={level}
              style={[styles.chip, severity === level && styles.chipActive]}
              onPress={() => setSeverity(level)}
            >
              <Text style={[styles.chipText, severity === level && styles.chipTextActive]}>
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location Input */}
        <Text style={styles.label}>Location</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="e.g. Sindhupalchok, Ward 4"
            placeholderTextColor="#64748b"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Details Input */}
        <Text style={styles.label}>Details</Text>
        <View style={[styles.inputContainer, { height: 120, alignItems: 'flex-start', paddingTop: 12 }]}>
          <TextInput
            style={[styles.input, { textAlignVertical: 'top' }]}
            placeholder="Describe the current situation..."
            placeholderTextColor="#64748b"
            multiline
            value={details}
            onChangeText={setDetails}
          />
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={submitNewReport}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#162a31", // Matches your screenshot's dark slate/teal
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },
  label: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  chip: {
    flex: 1,
    backgroundColor: "#1e293b",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chipActive: {
    backgroundColor: "#3b82f6", // The bright blue from your image
    borderColor: "#60a5fa",
  },
  chipText: {
    color: "#94a3b8",
    fontWeight: "600",
    fontSize: 14,
  },
  chipTextActive: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    backgroundColor: "#0f172a",
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 56,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
  },
  submitButton: {
    backgroundColor: "#3b82f6",
    height: 60,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 40,
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});