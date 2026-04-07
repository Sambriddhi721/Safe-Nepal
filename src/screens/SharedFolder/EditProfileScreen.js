import React, { useState, useContext, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";

export default function EditProfileScreen({ navigation }) {
  const { colors, theme } = useContext(ThemeContext);
  const { user, updateUserProfile } = useContext(AuthContext); 
  const isDarkMode = theme === 'dark';

  // 1. Initialize state
  const [formData, setFormData] = useState({
    name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || ""
  });

  const [saving, setSaving] = useState(false);

  // 2. Keep form in sync if user data loads late
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || ""
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation", "Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      // result matches the return structure in your AuthContext
      const result = await updateUserProfile(formData);

      if (result.success) {
        Alert.alert("Success", "Profile updated successfully!", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(result.error || "Update failed");
      }
    } catch (error) {
      console.error("Update Error:", error);
      Alert.alert("Error", "Failed to sync profile. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  const InputField = ({ label, value, onChangeText, keyboardType = "default", multiline = false, editable = true }) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: isDarkMode ? "#94a3b8" : "#64748b" }]}>{label}</Text>
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f8fafc", 
            color: editable ? (isDarkMode ? "#fff" : "#0f172a") : "#94a3b8",
            textAlignVertical: multiline ? 'top' : 'center',
            height: multiline ? 100 : 55,
            borderWidth: 1,
            borderColor: isDarkMode ? "#334155" : "#e2e8f0",
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        editable={editable}
        placeholderTextColor="#64748b"
      />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: isDarkMode ? "#0f172a" : "#fff" }]}
    >
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 20 : 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={saving} style={styles.navBtn}>
          <Text style={{ color: "#ef4444", fontSize: 16, fontWeight: "600" }}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: isDarkMode ? "#fff" : "#0f172a" }]}>Edit Profile</Text>
        
        <TouchableOpacity onPress={handleSave} disabled={saving} style={styles.navBtn}>
          {saving ? (
            <ActivityIndicator size="small" color="#3b82f6" />
          ) : (
            <Text style={{ color: "#3b82f6", fontSize: 16, fontWeight: "700" }}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* AVATAR SECTION */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, { backgroundColor: "#3b82f6" }]}>
             <Ionicons name="person" size={45} color="#fff" />
             <TouchableOpacity style={styles.cameraBadge} activeOpacity={0.7}>
                <Ionicons name="camera" size={16} color="#fff" />
             </TouchableOpacity>
          </View>
          <Text style={[styles.emailDisplay, { color: isDarkMode ? "#94a3b8" : "#64748b" }]}>{user?.email}</Text>
        </View>

        {/* FORM FIELDS */}
        <InputField 
          label="Full Name" 
          value={formData.name} 
          onChangeText={(txt) => setFormData({...formData, name: txt})} 
        />
        
        <InputField 
          label="Email Address (Locked)" 
          value={formData.email} 
          editable={false} 
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

        <View style={{ height: 40 }} /> 
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(148, 163, 184, 0.1)',
  },
  navBtn: { padding: 5 },
  headerTitle: { fontSize: 17, fontWeight: "800" },
  scrollContent: { padding: 20 },
  avatarSection: { alignItems: "center", marginBottom: 30, marginTop: 10 },
  avatarCircle: { 
    width: 90, 
    height: 90, 
    borderRadius: 45, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 12,
    position: 'relative'
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    padding: 8,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#0f172a' // Matches the dark background
  },
  emailDisplay: { fontSize: 14, fontWeight: "500" },
  inputGroup: { marginBottom: 20 },
  label: { 
    fontSize: 11, 
    fontWeight: "800", 
    marginBottom: 8, 
    textTransform: "uppercase", 
    letterSpacing: 1 
  },
  input: { 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    fontSize: 16,
    fontWeight: "500" 
  },
});