import React, { useState, useContext } from "react";
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
  // Using updateUserProfile from our updated AuthContext
  const { user, updateUserProfile } = useContext(AuthContext); 
  const isDarkMode = theme === 'dark';

  // Initialize state with current user data
  // Note: Ensure the keys (name, phone, bio) match your context logic
  const [formData, setFormData] = useState({
    name: user?.full_name || user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || ""
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Validation", "Name cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      // 1. Call the Firebase-linked function from AuthContext
      const result = await updateUserProfile(formData);

      if (result.success) {
        Alert.alert("Success", "Profile synced with Safe Nepal Cloud!", [
          { text: "OK", onPress: () => navigation.goBack() }
        ]);
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Update Error:", error);
      Alert.alert("Error", "Failed to sync profile. Please check your internet.");
    } finally {
      setSaving(false);
    }
  };

  const InputField = ({ label, value, onChangeText, keyboardType = "default", multiline = false, editable = true }) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
      <TextInput
        style={[
          styles.input, 
          { 
            backgroundColor: isDarkMode ? "rgba(255,255,255,0.05)" : "#f1f5f9", 
            color: editable ? colors.text : colors.subText,
            textAlignVertical: multiline ? 'top' : 'center',
            height: multiline ? 120 : 55,
            borderWidth: 1,
            borderColor: isDarkMode ? "#334155" : "#e2e8f0",
            opacity: editable ? 1 : 0.6
          }
        ]}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        editable={editable}
        placeholderTextColor="#94a3b8"
      />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 50 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} disabled={saving}>
          <Text style={{ color: "#ef4444", fontSize: 16, fontWeight: "600" }}>Cancel</Text>
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.primary || colors.accent} />
          ) : (
            <Text style={{ color: colors.primary || colors.accent, fontSize: 16, fontWeight: "700" }}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* AVATAR SECTION */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary || colors.accent }]}>
             <Ionicons name="person" size={45} color="#fff" />
             <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={16} color="#fff" />
             </View>
          </View>
          <Text style={[styles.emailDisplay, { color: colors.subText }]}>{user?.email}</Text>
        </View>

        {/* FORM FIELDS */}
        <InputField 
          label="Full Name" 
          value={formData.name} 
          onChangeText={(txt) => setFormData({...formData, name: txt})} 
        />
        
        <InputField 
          label="Email Address" 
          value={formData.email} 
          editable={false} // Email usually handled via Firebase Auth re-auth
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
    paddingBottom: 20 
  },
  headerTitle: { fontSize: 18, fontWeight: "800" },
  scrollContent: { padding: 20 },
  avatarSection: { alignItems: "center", marginBottom: 35 },
  avatarCircle: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    justifyContent: "center", 
    alignItems: "center", 
    marginBottom: 12,
    position: 'relative'
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#3b82f6',
    padding: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff'
  },
  emailDisplay: { fontSize: 14, fontWeight: "500" },
  inputGroup: { marginBottom: 22 },
  label: { 
    fontSize: 11, 
    fontWeight: "800", 
    marginBottom: 8, 
    textTransform: "uppercase", 
    letterSpacing: 1 
  },
  input: { 
    borderRadius: 15, 
    paddingHorizontal: 16, 
    fontSize: 16,
    fontWeight: "500" 
  },
});