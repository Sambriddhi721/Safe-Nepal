import React, { useContext } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  Alert, SafeAreaView, ScrollView, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';

// Contexts
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

export default function PoliceSettingsScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext) || {};
  const { theme } = useContext(ThemeContext) || { theme: 'dark' };
  const isDarkMode = theme === 'dark';

  const handleRoleSwitch = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware || !isEnrolled) {
      // Fallback if no biometrics are set up
      Alert.alert("Switch Mode", "Confirm return to Citizen Dashboard?", [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => navigation.replace("HomeScreen") }
      ]);
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify Identity to Exit Tactical Terminal',
      fallbackLabel: 'Use Passcode',
    });

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace("HomeScreen"); 
    }
  };

  const SettingItem = ({ icon, title, subtitle, onPress, color = "#3b82f6" }) => (
    <TouchableOpacity 
      style={[styles.item, { borderBottomColor: isDarkMode ? '#1e293b' : '#e2e8f0' }]} 
      onPress={onRefresh ? () => { Haptics.selectionAsync(); onPress(); } : onPress}
    >
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
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.goBack(); }}
          style={styles.backBtn}
        >
          <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#000' }]}>TERMINAL SETTINGS</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT PROTOCOL</Text>
          <SettingItem 
            icon="person-circle" 
            title="Profile Details" 
            subtitle={user?.name || "Active Officer"} 
          />
          <SettingItem 
            icon="finger-print" 
            title="Security & Biometrics" 
            subtitle="Encrypted & Active" 
            color="#10b981"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SYSTEM MODES</Text>
          <SettingItem 
            icon="swap-horizontal" 
            title="Switch to Citizen Mode" 
            subtitle="Exit tactical interface" 
            color="#3b82f6"
            onPress={handleRoleSwitch} 
          />
          <SettingItem 
            icon="moon" 
            title="Dark Mode" 
            subtitle="Always On (Terminal Default)" 
            color="#a855f7" 
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>INFORMATION</Text>
          <SettingItem icon="shield-checkmark" title="Version" subtitle="2.0.4-Stable" color="#64748b" />
        </View>

        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            logout();
          }}
        >
          <Text style={styles.logoutText}>TERMINATE SESSION</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>SECURE TERMINAL CONNECTION ACTIVE</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    alignItems: 'center' 
  },
  backBtn: {
    padding: 10,
    backgroundColor: '#1e293b40',
    borderRadius: 12
  },
  headerTitle: { fontSize: 14, fontWeight: '900', letterSpacing: 2 },
  scroll: { padding: 20 },
  section: { marginBottom: 35 },
  sectionLabel: { fontSize: 10, fontWeight: '900', color: '#64748b', letterSpacing: 1.5, marginBottom: 15 },
  item: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 18, 
    borderBottomWidth: 1 
  },
  iconBox: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 15 
  },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700' },
  itemSub: { fontSize: 12, color: '#64748b', marginTop: 4, fontWeight: '500' },
  logoutBtn: { 
    backgroundColor: '#ef444415', 
    padding: 20, 
    borderRadius: 20, 
    alignItems: 'center', 
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ef444430'
  },
  logoutText: { color: '#ef4444', fontWeight: '900', fontSize: 12, letterSpacing: 1.5 },
  footerNote: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 30,
    letterSpacing: 1
  }
});