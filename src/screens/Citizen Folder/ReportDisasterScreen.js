import React, { useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const SERVER_URL = "http://127.0.0.1:5000"; 

export default function ReportDisasterScreen({ navigation }) {
  const [category, setCategory] = useState("Flood");
  const [severity, setSeverity] = useState("Moderate");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!location || !details) return Alert.alert("Error", "Please fill all fields");

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
        }),
      });

      if (response.ok) {
        Alert.alert("Success", "Incident Reported to Authorities.");
        navigation.goBack(); 
      } else {
        Alert.alert("Error", "Failed to submit to server.");
      }
    } catch (error) {
      Alert.alert("Error", "Server unreachable. Check ADB connection.");
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Incident</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
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
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
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
    backgroundColor: "#162a31", // The exact dark teal from your screenshot
    paddingHorizontal: 20, 
    paddingTop: 50 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 35 
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
    justifyContent: 'center'
  },
  choiceInactive: { 
    backgroundColor: "#1e293b" 
  },
  choiceActive: { 
    backgroundColor: "#3b82f6" // The vibrant blue from your UI
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
    marginBottom: 20 
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
    marginTop: 20, 
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