import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

export default function PoliceSettingsScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { theme } = useContext(ThemeContext);
  const isDarkMode = theme === 'dark';

  const handleRoleSwitch = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Confirm Identity to Switch to Citizen Mode',
    });

    if (result.success) {
      Alert.alert("Role Switched", "Returning to Citizen Dashboard.");
      navigation.replace("UserHome"); // Assuming UserHome is your Citizen Dashboard
    }
  };

  const SettingItem = ({ icon, title, subtitle, onPress, color = "#3b82f6" }) => (
    <TouchableOpacity style={[styles.item, { borderBottomColor: isDarkMode ? '#1e293b' : '#e2e8f0' }]} onPress={onPress}>
      <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <View style={styles.itemText}>
        <Text style={[styles.itemTitle, { color: isDarkMode ? '#fff' : '#000' }]}>{title}</Text>
        {subtitle && <Text style={styles.itemSub}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#64748b" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#020617' : '#f8fafc' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Terminal Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT PROTOCOL</Text>
          <SettingItem icon="person-circle" title="Profile Details" subtitle={user?.full_name} />
          <SettingItem icon="finger-print" title="Security & Biometrics" subtitle="Active" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SYSTEM MODES</Text>
          <SettingItem 
            icon="repeat" 
            title="Switch to Citizen Mode" 
            subtitle="Exit tactical interface" 
            color="#bef264"
            onPress={handleRoleSwitch} 
          />
          <SettingItem icon="moon" title="Dark Mode" subtitle="System Follow" color="#a855f7" />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>TERMINATE SESSION</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { padding: 20 },
  section: { marginBottom: 30 },
  sectionLabel: { fontSize: 10, fontWeight: '900', color: '#64748b', letterSpacing: 1.5, marginBottom: 15 },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1 },
  iconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700' },
  itemSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  logoutBtn: { backgroundColor: '#ef444420', padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 20 },
  logoutText: { color: '#ef4444', fontWeight: '900', fontSize: 12, letterSpacing: 1 }
});