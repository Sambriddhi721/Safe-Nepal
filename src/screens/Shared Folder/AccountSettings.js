import React, { useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  TextInput, Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// ImagePicker import removed to fix native module error
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext'; 

export default function AccountSettings({ navigation }) {
  const { colors } = useContext(ThemeContext);
  const { user, setUser } = useContext(AuthContext); // Assuming setUser exists to update local state
  
  const [profile, setProfile] = useState({
    name: user?.full_name || 'Sambriddhi Dawadi',
    email: user?.email || 'user@example.com',
    avatar: user?.profile_image || null 
  });
  const [loading, setLoading] = useState(false);

  // Placeholder for when you fix the native module issues later
  const handlePhotoPress = () => {
    Alert.alert("Feature Paused", "Image uploading is currently being reconfigured. You can still update your name!");
  };

  const handleUpdate = async () => {
    if (!profile.name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    setLoading(true);

    try {
      // Using a standard JSON body since we aren't sending a file currently
      const response = await fetch('http://192.168.111.70:5000/api/auth/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Profile updated successfully!");
        // Update the global context so the change reflects everywhere
        if (setUser) {
          setUser({ ...user, full_name: profile.name });
        }
        navigation.goBack();
      } else {
        Alert.alert("Error", result.error || "Update failed");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Connection Error", "Ensure your Flask server is running at 192.168.111.70:5000");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"} 
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Account Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handlePhotoPress} style={[styles.avatarPlaceholder, { backgroundColor: colors.card }]}>
            {profile.avatar ? (
              <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={50} color={colors.accent} />
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePhotoPress}>
            <Text style={[styles.changePhotoText, { color: colors.accent }]}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.subText }]}>Full Name</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={profile.name}
          onChangeText={(txt) => setProfile({...profile, name: txt})}
          placeholderTextColor={colors.subText}
        />

        <Text style={[styles.label, { color: colors.subText }]}>Email Address</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border, opacity: 0.6 }]}
          value={profile.email}
          editable={false} 
        />

        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: colors.accent }]} 
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Update Profile</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingBottom: 10 
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  scrollContent: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarPlaceholder: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12, 
    overflow: 'hidden', 
    borderWidth: 2, 
    borderColor: '#3b82f6' 
  },
  avatarImage: { width: '100%', height: '100%' },
  changePhotoText: { fontWeight: '700', fontSize: 15 },
  label: { 
    fontSize: 11, 
    fontWeight: '800', 
    marginBottom: 8, 
    textTransform: 'uppercase', 
    marginTop: 15, 
    letterSpacing: 0.5 
  },
  input: { 
    height: 55, 
    borderRadius: 15, 
    paddingHorizontal: 15, 
    borderWidth: 1, 
    fontSize: 16 
  },
  saveBtn: { 
    height: 55, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 40, 
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});