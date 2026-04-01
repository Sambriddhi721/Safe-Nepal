import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';

export default function SecuritySettings({ navigation }) {
  const { colors, isDarkMode } = useContext(ThemeContext);

  // Local state for toggles
  const [settings, setSettings] = useState({
    twoFactor: false,
    biometrics: true, // Matches your screenshot
  });

  const toggleSwitch = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Define colors to match the image exactly
  const customColors = {
    bg: '#0f172a', // Deep navy
    card: '#1e293b', // Lighter navy card
    accent: '#3b82f6', // Bright blue
    text: '#ffffff',
    subText: '#94a3b8',
    iconBg: 'rgba(59, 130, 246, 0.15)', // Faint blue for icon circles
  };

  return (
    <View style={[styles.container, { backgroundColor: customColors.bg }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={customColors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: customColors.text }]}>Security & Safety</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.mainTitle}>Security</Text>

        {/* LOGIN SECURITY SECTION */}
        <Text style={[styles.sectionLabel, { color: customColors.subText }]}>Login Security</Text>
        <View style={[styles.card, { backgroundColor: customColors.card }]}>
          
          <TouchableOpacity 
            style={[styles.row, styles.borderBottom]}
            onPress={() => console.log('Change Password')}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: customColors.iconBg }]}>
                <Ionicons name="key" size={20} color={customColors.accent} />
              </View>
              <Text style={[styles.rowText, { color: customColors.text }]}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={customColors.subText} />
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: customColors.iconBg }]}>
                <Ionicons name="finger-print" size={20} color={customColors.accent} />
              </View>
              <View style={styles.textStack}>
                <Text style={[styles.rowText, { color: customColors.text }]}>Biometric Lock</Text>
                <Text style={[styles.rowSubtext, { color: customColors.subText }]}>Use FaceID or Fingerprint</Text>
              </View>
            </View>
            <Switch
              value={settings.biometrics}
              onValueChange={() => toggleSwitch('biometrics')}
              trackColor={{ false: '#334155', true: '#22c55e' }} // Green for "On" as per common UI
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* ADVANCED PROTECTION SECTION */}
        <Text style={[styles.sectionLabel, { color: customColors.subText }]}>Advanced Protection</Text>
        <View style={[styles.card, { backgroundColor: customColors.card }]}>
          
          <View style={[styles.row, styles.borderBottom]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: customColors.iconBg }]}>
                <Ionicons name="shield-checkmark" size={20} color={customColors.accent} />
              </View>
              <View style={styles.textStack}>
                <Text style={[styles.rowText, { color: customColors.text }]}>Two-Factor Auth</Text>
                <Text style={[styles.rowSubtext, { color: customColors.subText }]}>Secure your account via SMS</Text>
              </View>
            </View>
            <Switch
              value={settings.twoFactor}
              onValueChange={() => toggleSwitch('twoFactor')}
              trackColor={{ false: '#334155', true: '#22c55e' }}
              thumbColor="#ffffff"
            />
          </View>

          <TouchableOpacity style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: customColors.iconBg }]}>
                <Ionicons name="desktop-outline" size={20} color={customColors.accent} />
              </View>
              <Text style={[styles.rowText, { color: customColors.text }]}>Active Sessions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={customColors.subText} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.footerInfo, { color: customColors.subText }]}>
          Keep your security settings updated to protect your disaster reporting data.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backBtn: { padding: 10 },
  scrollContent: { padding: 20 },
  mainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginVertical: 30,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: { 
    borderRadius: 24, 
    paddingHorizontal: 8,
    marginBottom: 25,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: { fontSize: 16, fontWeight: '600', marginLeft: 15 },
  textStack: { marginLeft: 15, flex: 1 },
  rowSubtext: { fontSize: 12, marginTop: 4, opacity: 0.8 },
  footerInfo: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 20,
    paddingHorizontal: 30,
  },
});