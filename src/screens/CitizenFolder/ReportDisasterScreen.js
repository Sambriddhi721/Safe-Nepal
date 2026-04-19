import React, { useState, useContext } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Image 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from 'expo-location'; 
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from "../../context/AuthContext";

// Ensure this matches your Laptop's IP exactly!
const SERVER_URL = "http://192.168.111.70:5000"; 

export default function ReportDisasterScreen({ navigation }) {
  const { userToken, logout } = useContext(AuthContext); 
  
  const [category, setCategory] = useState("Flood");
  const [severity, setSeverity] = useState("Moderate");
  const [locationName, setLocationName] = useState("");
  const [details, setDetails] = useState("");
  const [image, setImage] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [fetchingLoc, setFetchingLoc] = useState(false);

  // --- 1. Updated Image Picker (SDK 53 Compatible) ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Camera access is required for verification.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      // FIXED: Uses new MediaType string format to solve SDK 53 warning
      mediaTypes: 'images', 
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.6, 
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // --- 2. Real Submission Logic ---
  const handleSubmit = async () => {
    if (!locationName.trim() || !details.trim() || !image) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return Alert.alert("Missing Info", "Please provide location, description, and a photo.");
    }

    setLoading(true);

    try {
      // Step A: Fetch GPS Location
      setFetchingLoc(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      let coords = { latitude: 0, longitude: 0 };
      if (status === 'granted') {
        const currentLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        coords = currentLoc.coords;
      }
      setFetchingLoc(false);

      // Step B: Prepare Multipart Form Data (Crucial for Images)
      const formData = new FormData();
      formData.append("category", category);
      formData.append("severity", severity);
      formData.append("location", locationName);
      formData.append("description", details);
      formData.append("latitude", coords.latitude.toString());
      formData.append("longitude", coords.longitude.toString());

      // Prepare Image File
      const uriParts = image.split('.');
      const fileType = uriParts[uriParts.length - 1];
      const fileName = `report_${Date.now()}.${fileType}`;

      formData.append("image", {
        uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
        name: fileName,
        type: `image/${fileType}`,
      });

      // Step C: Actual Network Request
      console.log(`📡 Sending report to: ${SERVER_URL}/api/report`);
      
      const response = await fetch(`${SERVER_URL}/api/report`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${userToken}`,
          "Accept": "application/json",
          // Note: Do NOT manually set 'Content-Type': 'multipart/form-data'
          // Fetch will automatically set the boundary if you leave it out
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", "Report sent and verified by AI.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else if (response.status === 400 && result.error.includes("AI")) {
        // AI Fraud Detection hit
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("AI Warning", result.error);
      } else if (response.status === 403) {
        // Strike limit reached
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Banned", "Account disabled due to fake reports.");
        logout(); 
      } else {
        throw new Error(result.error || "Backend is currently unreachable.");
      }

    } catch (error) {
      console.error("Upload Error:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Connection Error", "Could not connect to backend. Ensure you are on the same WiFi and the Server is running.");
    } finally {
      setLoading(false);
      setFetchingLoc(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Disaster Report</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        
        <Text style={styles.label}>Visual Evidence (Required)</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={42} color="#3b82f6" />
              <Text style={styles.imagePlaceholderText}>Take Photo of Incident</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Disaster Category</Text>
        <View style={styles.row}>
          {["Flood", "Landslide", "Other"].map(item => (
            <TouchableOpacity 
              key={item} 
              style={[styles.choice, category === item ? styles.choiceActive : styles.choiceInactive, { flex: 1 }]} 
              onPress={() => {
                setCategory(item);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.choiceText, category === item && styles.choiceTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Location / Landmark</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="location" size={20} color="#3b82f6" style={{ marginRight: 12 }} />
          <TextInput 
            style={styles.textInput} 
            placeholder="e.g., Sindhupalchowk, Ward 5" 
            placeholderTextColor="#64748b"
            value={locationName}
            onChangeText={setLocationName}
          />
        </View>

        <Text style={styles.label}>Situation Description</Text>
        <View style={[styles.inputContainer, styles.multiLineContainer]}>
          <TextInput 
            style={[styles.textInput, { textAlignVertical: 'top' }]} 
            placeholder="Details for responders..." 
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={4}
            value={details}
            onChangeText={setDetails}
          />
        </View>

        <View style={styles.warningCard}>
          <Ionicons name="shield-checkmark" size={20} color="#fca5a5" />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.warningTitle}>ANTI-FRAUD PROTECTION</Text>
            <Text style={styles.warningText}>
              Reports are analyzed by local AI. Fake photos lead to strikes. 3 strikes result in a permanent ban.
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, (loading || fetchingLoc) && { opacity: 0.6 }]} 
          onPress={handleSubmit} 
          disabled={loading || fetchingLoc}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>SEND REPORT</Text>
          )}
        </TouchableOpacity>
        
        {fetchingLoc && <Text style={styles.fetchingText}>Retrieving GPS...</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", paddingHorizontal: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
  label: { color: '#94a3b8', fontSize: 12, fontWeight: '700', marginBottom: 10, textTransform: 'uppercase' },
  row: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  choice: { paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  choiceInactive: { backgroundColor: "#1e293b", borderColor: "#334155" },
  choiceActive: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  choiceText: { color: "#94a3b8", fontWeight: '700' },
  choiceTextActive: { color: 'white' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#1e293b", borderRadius: 12, paddingHorizontal: 15, minHeight: 55, marginBottom: 20, borderWidth: 1, borderColor: '#334155' },
  multiLineContainer: { height: 100, alignItems: 'flex-start', paddingTop: 15 },
  textInput: { flex: 1, color: 'white', fontSize: 15 },
  imagePicker: { width: '100%', height: 180, backgroundColor: '#1e293b', borderRadius: 15, borderStyle: 'dashed', borderWidth: 2, borderColor: '#334155', justifyContent: 'center', alignItems: 'center', marginBottom: 25, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderText: { color: '#64748b', marginTop: 10, fontWeight: '600' },
  warningCard: { flexDirection: 'row', backgroundColor: '#450a0a', padding: 15, borderRadius: 12, marginBottom: 25 },
  warningTitle: { color: '#fca5a5', fontWeight: '900', fontSize: 12 },
  warningText: { color: '#fecaca', fontSize: 11 },
  submitButton: { backgroundColor: "#ef4444", height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  submitText: { color: 'white', fontSize: 16, fontWeight: '900' },
  fetchingText: { color: '#3b82f6', textAlign: 'center', marginBottom: 20, fontSize: 12 }
});