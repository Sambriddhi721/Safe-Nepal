import React, { useState, useContext } from "react";
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, 
  ScrollView, Alert, ActivityIndicator 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

export default function EditProfileScreen({ navigation }) {
  const { colors, theme } = useContext(ThemeContext);
  const { user, updateProfile } = useContext(AuthContext) || {}; // Assuming you'll add updateProfile to context
  const isDarkMode = theme === 'dark';

  const [formData, setFormData] = useState({
    name: "Sambriddhi Dawadi",
    email: "sambriddhi.d@university.edu",
    phone: "+977 98XXXXXXXX",
    bio: "Software Engineering Student | Disaster Risk Analyst"
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API Call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // If you have an update function in AuthContext, call it here:
      // await updateProfile(formData);

      Alert.alert("Success", "Profile updated successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const InputField = ({ label, value, onChangeText, keyboardType = "default", multiline = false }) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9", 
            color: colors.text,
            textAlignVertical: multiline ? 'top' : 'center',
            height: multiline ? 100 : 50
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholderTextColor="#64748b"
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: "#ef4444", fontSize: 16, fontWeight: "600" }}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.accent} />
          ) : (
            <Text style={{ color: colors.accent, fontSize: 16, fontWeight: "700" }}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.accent }]}>
             <Ionicons name="camera" size={30} color="#fff" />
          </View>
          <TouchableOpacity>
            <Text style={[styles.changePhoto, { color: colors.accent }]}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        <InputField 
          label="Full Name" 
          value={formData.name} 
          onChangeText={(txt) => setFormData({...formData, name: txt})} 
        />
        <InputField 
          label="Email Address" 
          value={formData.email} 
          keyboardType="email-address"
          onChangeText={(txt) => setFormData({...formData, email: txt})} 
        />
        <InputField 
          label="Phone Number" 
          value={formData.phone} 
          keyboardType="phone-pad"
          onChangeText={(txt) => setFormData({...formData, phone: txt})} 
        />
        <InputField 
          label="Bio / Research Focus" 
          value={formData.bio} 
          multiline={true}
          onChangeText={(txt) => setFormData({...formData, bio: txt})} 
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    paddingTop: 60, 
    paddingBottom: 20 
  },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  scrollContent: { padding: 20 },
  avatarSection: { alignItems: "center", marginBottom: 30 },
  avatarCircle: { 
    width: 100, height: 100, borderRadius: 50, 
    justifyContent: "center", alignItems: "center", marginBottom: 10 
  },
  changePhoto: { fontWeight: "600", fontSize: 14 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "700", marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 },
  input: { borderRadius: 12, paddingHorizontal: 15, fontSize: 16 },
});