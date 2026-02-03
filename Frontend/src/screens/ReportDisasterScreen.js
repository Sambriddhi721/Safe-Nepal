import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function ReportDisasterScreen({ navigation }) {
  const [type, setType] = useState("Flood");
  const [severity, setSeverity] = useState("Moderate");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!location || !description) {
      Alert.alert("Error", "Please fill in all fields before submitting.");
      return;
    }

    // In a real app, you would send this to your backend/Firebase here
    Alert.alert(
      "Report Submitted",
      "Thank you for your report. Authorities and nearby users have been notified.",
      [{ text: "OK", onPress: () => navigation.goBack() }]
    );
  };

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Incident</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.form}>
          
          <Text style={styles.label}>Disaster Type</Text>
          <View style={styles.row}>
            {["Flood", "Landslide", "Other"].map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.typeBtn, type === item && styles.activeType]}
                onPress={() => setType(item)}
              >
                <Text style={[styles.typeBtnText, type === item && styles.activeText]}>{item}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Severity Level</Text>
          <View style={styles.row}>
            {["Low", "Moderate", "High"].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.sevBtn, 
                  severity === level && { backgroundColor: level === 'High' ? '#FF4D4D' : '#1e90ff' }
                ]}
                onPress={() => setSeverity(level)}
              >
                <Text style={[styles.typeBtnText, severity === level && styles.activeText]}>{level}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Location</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={20} color="#9ca3af" />
            <TextInput
              style={styles.input}
              placeholder="e.g. Sindhupalchok, Ward 4"
              placeholderTextColor="#9ca3af"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <Text style={styles.label}>Details</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the current situation..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>Submit Report</Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  form: { padding: 20 },
  label: { color: "#fff", fontSize: 16, fontWeight: "600", marginBottom: 10, marginTop: 10 },
  row: { flexDirection: 'row', marginBottom: 20, justifyContent: 'space-between' },
  typeBtn: { flex: 1, backgroundColor: "#111827", padding: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#374151' },
  activeType: { backgroundColor: "#1e90ff", borderColor: "#1e90ff" },
  sevBtn: { flex: 1, backgroundColor: "#111827", padding: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 4, borderWidth: 1, borderColor: '#374151' },
  typeBtnText: { color: "#9ca3af", fontWeight: "600" },
  activeText: { color: "#fff" },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#111827", borderRadius: 12, paddingHorizontal: 15, height: 55, marginBottom: 20 },
  input: { flex: 1, color: "#fff", marginLeft: 10 },
  textArea: { backgroundColor: "#111827", borderRadius: 12, padding: 15, height: 120, textAlignVertical: 'top', color: "#fff" },
  submitBtn: { backgroundColor: "#1e90ff", padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 30 },
  submitText: { color: "#fff", fontSize: 18, fontWeight: "bold" }
});