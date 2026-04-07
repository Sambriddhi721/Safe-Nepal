import React, { useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Updated with your specific local IPv4 address
const SERVER_URL = "http://192.168.111.70:5000"; 

export default function ReportDisasterScreen({ navigation }) {
  const [category, setCategory] = useState("Flood");
  const [severity, setSeverity] = useState("Moderate");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // Basic validation
    if (!location.trim() || !details.trim()) {
      return Alert.alert("Required Fields", "Please provide a location and situation details.");
    }

    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/api/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          severity,
          location,
          description: details,
          timestamp: new Date().toISOString(), // Vital for Police Dashboard sorting
          status: "Pending",                  // Default status for responders
        }),
      });

      if (response.ok) {
        Alert.alert(
          "Report Submitted", 
          "Your incident report has been sent to the authorities successfully.",
          [{ text: "OK", onPress: () => navigation.goBack() }]
        );
      } else {
        const errorData = await response.json();
        Alert.alert("Submission Failed", errorData.message || "Failed to submit to server.");
      }
    } catch (error) {
      Alert.alert(
        "Connection Error", 
        "Cannot reach the server. Make sure your PC and Phone are on the same Wi-Fi and the backend is running."
      );
      console.error("Submit Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      {/* Header Area */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Incident</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Disaster Type Section */}
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

        {/* Severity Level Section */}
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

        {/* Location Input Area */}
        <Text style={styles.label}>Location</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="location-outline" size={20} color="#94a3b8" style={{ marginRight: 12 }} />
          <TextInput 
            style={styles.textInput} 
            placeholder="e.g. Sindhupalchok, Ward 4" 
            placeholderTextColor="#64748b"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        {/* Details Input Area */}
        <Text style={styles.label}>Details</Text>
        <View style={[styles.inputContainer, styles.multiLineContainer]}>
          <TextInput 
            style={[styles.textInput, { textAlignVertical: 'top' }]} 
            placeholder="Describe the current situation..." 
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={4}
            value={details}
            onChangeText={setDetails}
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && { opacity: 0.7 }]} 
          onPress={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#162a31", 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 30 
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 22, 
    fontWeight: '800' 
  },
  label: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: '700', 
    marginTop: 10, 
    marginBottom: 12 
  },
  row: { 
    flexDirection: 'row', 
    gap: 10, 
    marginBottom: 20 
  },
  choice: { 
    flex: 1, 
    paddingVertical: 14, 
    borderRadius: 10, 
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent'
  },
  choiceInactive: { 
    backgroundColor: "#1e293b",
    borderColor: "#334155"
  },
  choiceActive: { 
    backgroundColor: "#3b82f6" 
  }, 
  choiceText: { 
    color: "#94a3b8", 
    fontWeight: '700',
    fontSize: 14
  },
  choiceTextActive: { 
    color: 'white' 
  },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: "#0f172a", 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    height: 60, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#1e293b"
  },
  multiLineContainer: { 
    height: 140, 
    alignItems: 'flex-start', 
    paddingTop: 15 
  },
  textInput: { 
    flex: 1, 
    color: 'white', 
    fontSize: 15 
  },
  submitButton: { 
    backgroundColor: "#3b82f6", 
    height: 60, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10, 
    marginBottom: 40,
    elevation: 4,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5
  },
  submitText: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: '800' 
  },
});