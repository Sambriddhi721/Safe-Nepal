import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

export default function AccountSettings({ navigation }) {
  const { colors, isDarkMode } = useContext(ThemeContext);
  
  // Mock user data - you can link this to your AuthContext later
  const [profile, setProfile] = useState({
    name: 'Sambriddhi Dawadi',
    email: 'user@example.com',
    phone: '+977-98XXXXXXXX'
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.card }]}>
            <Ionicons name="person" size={50} color={colors.accent} />
          </View>
          <TouchableOpacity>
            <Text style={[styles.changePhotoText, { color: colors.accent }]}>Change Profile Photo</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.label, { color: colors.subText }]}>Full Name</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={profile.name}
          onChangeText={(txt) => setProfile({...profile, name: txt})}
        />

        <Text style={[styles.label, { color: colors.subText }]}>Email Address</Text>
        <TextInput 
          style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.border }]}
          value={profile.email}
          editable={false} // Usually emails are locked
        />

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.accent }]}>
          <Text style={styles.saveBtnText}>Update Profile</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  changePhotoText: { fontWeight: '600' },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', marginTop: 15 },
  input: { height: 50, borderRadius: 12, paddingHorizontal: 15, borderWidth: 1 },
  saveBtn: { height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});