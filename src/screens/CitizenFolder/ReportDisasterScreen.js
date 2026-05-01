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

// REPLACE with your laptop's current IP address
const SERVER_URL = "http://192.168.111.70:5000"; 

export default function ReportDisasterScreen({ navigation }) {
  const { userToken } = useContext(AuthContext); 
  
  const [category, setCategory] = useState("Flood");
  const [locationName, setLocationName] = useState("");
  const [details, setDetails] = useState("");
  const [image, setImage] = useState(null); 
  const [loading, setLoading] = useState(false);
  const [fetchingLoc, setFetchingLoc] = useState(false);

  // --- 1. Location Logic ---
  const handleAutoLocation = async () => {
    setFetchingLoc(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission Denied", "Location access is needed to find your address.");
        return;
      }

      const currentLoc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const address = await Location.reverseGeocodeAsync({
        latitude: currentLoc.coords.latitude,
        longitude: currentLoc.coords.longitude,
      });

      if (address.length > 0) {
        const item = address[0];
        // Formats address cleanly: e.g., "123 Street Name, City"
        const formattedAddress = `${item.name || ''} ${item.street || ''}, ${item.city || item.district || ''}`
          .replace(/\s+/g, ' ')
          .trim();
        setLocationName(formattedAddress);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (error) {
      Alert.alert("Error", "Could not fetch location automatically. Please type it manually.");
    } finally {
      setFetchingLoc(false);
    }
  };

  // --- 2. Camera Logic ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Camera access is required for emergency reporting.");
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5, 
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  // --- 3. Submit Logic ---
  const handleSubmit = async () => {
    if (!locationName.trim() || !details.trim() || !image) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return Alert.alert("Missing Info", "Please provide a photo, location, and description.");
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("category", category);
      formData.append("location", locationName);
      formData.append("description", details);

      // Robust file handling
      const filename = image.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append("image", {
        uri: Platform.OS === 'android' ? image : image.replace('file://', ''),
        name: filename,
        type: type,
      });

      const response = await fetch(`${SERVER_URL}/api/report`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${userToken}`,
          "Accept": "application/json",
          // Content-Type is NOT set manually for FormData; fetch sets it with the boundary
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Report Sent", "Your emergency report has been submitted and is being reviewed.", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert("Submission Failed", result.error || "The server rejected the report.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Network Error", "Unable to connect to server. Check your WiFi connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Emergency Report</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.label}>1. Take a Photo (Required)</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="camera" size={42} color="#3b82f6" />
              <Text style={styles.imagePlaceholderText}>Tap to open Camera</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>2. What is the problem?</Text>
        <View style={styles.row}>
          {["Flood", "Landslide", "Other"].map(item => (
            <TouchableOpacity 
              key={item} 
              style={[styles.choice, category === item ? styles.choiceActive : styles.choiceInactive]} 
              onPress={() => {
                setCategory(item);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.choiceText, category === item && styles.choiceTextActive]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>3. Where is this happening?</Text>
        <View style={styles.inputContainer}>
          <TouchableOpacity onPress={handleAutoLocation} disabled={fetchingLoc}>
            {fetchingLoc ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <Ionicons name="location" size={24} color="#3b82f6" />
            )}
          </TouchableOpacity>
          <TextInput 
            style={styles.textInput} 
            placeholder="Tap icon for GPS or type address" 
            placeholderTextColor="#64748b"
            value={locationName}
            onChangeText={setLocationName}
          />
        </View>

        <Text style={styles.label}>4. Describe the situation</Text>
        <View style={[styles.inputContainer, styles.multiLineContainer]}>
          <TextInput 
            style={[styles.textInput, { textAlignVertical: 'top' }]} 
            placeholder="How bad is it? Are people in danger?" 
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={4}
            value={details}
            onChangeText={setDetails}
          />
        </View>

        <View style={styles.warningCard}>
          <Ionicons name="alert-circle" size={24} color="#fca5a5" />
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={styles.warningTitle}>IMPORTANT NOTICE</Text>
            <Text style={styles.warningText}>
              Please only send real photos. False reporting is a crime and will result in a permanent ban.
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && { opacity: 0.6 }]} 
          onPress={handleSubmit} 
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.submitText}>SEND REPORT NOW</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a", paddingHorizontal: 20, paddingTop: 50 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: '800' },
  label: { color: '#94a3b8', fontSize: 13, fontWeight: '700', marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  choice: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  choiceInactive: { backgroundColor: "#1e293b", borderColor: "#334155" },
  choiceActive: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  choiceText: { color: "#94a3b8", fontWeight: '700' },
  choiceTextActive: { color: 'white' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#1e293b", borderRadius: 12, paddingHorizontal: 15, minHeight: 55, marginBottom: 20, gap: 10 },
  multiLineContainer: { height: 120, alignItems: 'flex-start', paddingTop: 15 },
  textInput: { flex: 1, color: 'white', fontSize: 15 },
  imagePicker: { width: '100%', height: 180, backgroundColor: '#1e293b', borderRadius: 15, borderStyle: 'dashed', borderWidth: 2, borderColor: '#334155', justifyContent: 'center', alignItems: 'center', marginBottom: 25, overflow: 'hidden' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imagePlaceholder: { alignItems: 'center' },
  imagePlaceholderText: { color: '#64748b', marginTop: 10, fontWeight: '600' },
  warningCard: { flexDirection: 'row', backgroundColor: '#450a0a', padding: 15, borderRadius: 12, marginBottom: 25 },
  warningTitle: { color: '#fca5a5', fontWeight: '900', fontSize: 12 },
  warningText: { color: '#fecaca', fontSize: 11, lineHeight: 16 },
  submitButton: { backgroundColor: "#ef4444", height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  submitText: { color: 'white', fontSize: 16, fontWeight: '900' }
});