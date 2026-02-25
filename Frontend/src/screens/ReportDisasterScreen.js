import React, { useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  ScrollView, KeyboardAvoidingView, Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ReportDisasterScreen({ navigation }) {
  const [category, setCategory] = useState("Flood");
  const [severity, setSeverity] = useState("Moderate");
  const [location, setLocation] = useState("");
  const [details, setDetails] = useState("");

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.header}>
           <TouchableOpacity onPress={() => navigation.goBack()}><Ionicons name="close" size={28} color="white" /></TouchableOpacity>
           <Text style={styles.headerTitle}>Report Incident</Text>
           <View style={{width: 28}} />
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
          <Ionicons name="location-outline" size={20} color="#5F6E78" style={{marginRight: 10}} />
          <TextInput 
            style={styles.textInput} 
            placeholder="e.g. Sindhupalchok, Ward 4" 
            placeholderTextColor="#5F6E78"
            value={location}
            onChangeText={setLocation}
          />
        </View>

        <Text style={styles.label}>Details</Text>
        <View style={[styles.inputContainer, styles.multiLineContainer]}>
          <TextInput 
            style={styles.textInput} 
            placeholder="Describe the current situation..." 
            placeholderTextColor="#5F6E78"
            multiline
            value={details}
            onChangeText={setDetails}
          />
        </View>

        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitText}>Submit Report</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121C22" },
  content: { padding: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, marginTop: 15 },
  headerTitle: { color: 'white', fontSize: 22, fontWeight: 'bold' },
  label: { color: 'white', fontSize: 16, fontWeight: '700', marginTop: 20, marginBottom: 12 },
  row: { flexDirection: 'row', gap: 10 },
  choice: { flex: 1, backgroundColor: '#1C2931', paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  choiceActive: { backgroundColor: '#2196F3' },
  choiceText: { color: '#8A9AA4', fontWeight: 'bold' },
  choiceTextActive: { color: 'white' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1C2931', borderRadius: 12, paddingHorizontal: 15, height: 55, marginTop: 5 },
  multiLineContainer: { height: 130, alignItems: 'flex-start', paddingTop: 15 },
  textInput: { flex: 1, color: 'white', fontSize: 15 },
  submitButton: { backgroundColor: '#2196F3', height: 60, borderRadius: 15, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  submitText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});