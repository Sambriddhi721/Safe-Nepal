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

  // Local state to manage the UI toggles
  const [settings, setSettings] = useState({
    twoFactor: false,
    biometrics: false,
    dataEncryption: true,
  });

  const toggleSwitch = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Security & Safety</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>Login & Access</Text>
        
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {/* Change Password Link */}
          <TouchableOpacity 
            style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => navigation.navigate('SecuritySettings')} // You can update this to a specific ChangePassword screen later
          >
            <View style={styles.rowLeft}>
              <Ionicons name="key-outline" size={22} color={colors.accent} />
              <Text style={[styles.rowText, { color: colors.text }]}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.subText} />
          </TouchableOpacity>

          {/* Biometric Toggle (Visual only for now) */}
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Ionicons name="finger-print-outline" size={22} color={colors.accent} />
              <View style={styles.textStack}>
                <Text style={[styles.rowText, { color: colors.text }]}>Biometric Lock</Text>
                <Text style={[styles.rowSubtext, { color: colors.subText }]}>Use FaceID or Fingerprint</Text>
              </View>
            </View>
            <Switch
              value={settings.biometrics}
              onValueChange={() => toggleSwitch('biometrics')}
              trackColor={{ false: '#3e3e3e', true: colors.accent }}
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.subText }]}>Advanced Protection</Text>
        
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {/* 2FA Toggle */}
          <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.rowLeft}>
              <Ionicons name="shield-checkmark-outline" size={22} color={colors.accent} />
              <Text style={[styles.rowText, { color: colors.text }]}>Two-Factor Auth</Text>
            </View>
            <Switch
              value={settings.twoFactor}
              onValueChange={() => toggleSwitch('twoFactor')}
              trackColor={{ false: '#3e3e3e', true: colors.accent }}
            />
          </View>

          {/* Active Sessions Link */}
          <TouchableOpacity 
            style={styles.row}
            onPress={() => console.log('Navigate to Sessions')}
          >
            <View style={styles.rowLeft}>
              <Ionicons name="phone-portrait-outline" size={22} color={colors.accent} />
              <Text style={[styles.rowText, { color: colors.text }]}>Active Sessions</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.subText} />
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.subText} />
          <Text style={[styles.infoText, { color: colors.subText }]}>
            Enabling these features helps protect your disaster reports and personal data on Safe Nepal.
          </Text>
        </View>
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
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  scrollContent: { padding: 16 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
    marginLeft: 4,
  },
  card: { borderRadius: 16, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowText: { fontSize: 16, fontWeight: '500', marginLeft: 12 },
  textStack: { marginLeft: 12 },
  rowSubtext: { fontSize: 12, marginTop: 2 },
  infoBox: {
    flexDirection: 'row',
    marginTop: 30,
    paddingHorizontal: 10,
    alignItems: 'flex-start',
  },
  infoText: { fontSize: 13, marginLeft: 8, lineHeight: 18, flex: 1 },
});