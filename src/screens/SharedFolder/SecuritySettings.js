import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  StatusBar,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';

export default function SecuritySettings({ navigation }) {
  // Use both Theme and Auth context
  const { isDarkMode } = useContext(ThemeContext);
  const { user, updateUserProfile } = useContext(AuthContext);

  // Sync toggles with the user's data from AuthContext
  // If the field doesn't exist yet in Firebase, default to false/true
  const settings = {
    twoFactor: user?.twoFactor || false,
    biometrics: user?.biometrics ?? true, 
  };

  const handleToggle = async (key, value) => {
    try {
      // Save the change to Firebase and Local Storage via AuthContext
      const result = await updateUserProfile({ [key]: value });
      if (!result.success) {
        Alert.alert("Error", "Failed to update security settings.");
      }
    } catch (err) {
      console.error("Toggle Error:", err);
    }
  };

  // UI Palette
  const customColors = {
    bg: '#0f172a', 
    card: '#1e293b', 
    accent: '#3b82f6', 
    text: '#ffffff',
    subText: '#94a3b8',
    iconBg: 'rgba(59, 130, 246, 0.15)',
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.mainTitle}>Security</Text>

        {/* LOGIN SECURITY */}
        <Text style={[styles.sectionLabel, { color: customColors.subText }]}>Login Security</Text>
        <View style={[styles.card, { backgroundColor: customColors.card }]}>
          
          <TouchableOpacity 
            style={[styles.row, styles.borderBottom]}
            onPress={() => Alert.alert("Reset Password", "A password reset link will be sent to your email.")}
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
                <Text style={[styles.rowSubtext, { color: customColors.subText }]}>FaceID or Fingerprint</Text>
              </View>
            </View>
            <Switch
              value={settings.biometrics}
              onValueChange={(val) => handleToggle('biometrics', val)}
              trackColor={{ false: '#334155', true: '#22c55e' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {/* ADVANCED PROTECTION */}
        <Text style={[styles.sectionLabel, { color: customColors.subText }]}>Advanced Protection</Text>
        <View style={[styles.card, { backgroundColor: customColors.card }]}>
          
          <View style={[styles.row, styles.borderBottom]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: customColors.iconBg }]}>
                <Ionicons name="shield-checkmark" size={20} color={customColors.accent} />
              </View>
              <View style={styles.textStack}>
                <Text style={[styles.rowText, { color: customColors.text }]}>Two-Factor Auth</Text>
                <Text style={[styles.rowSubtext, { color: customColors.subText }]}>Secure account via SMS</Text>
              </View>
            </View>
            <Switch
              value={settings.twoFactor}
              onValueChange={(val) => handleToggle('twoFactor', val)}
              trackColor={{ false: '#334155', true: '#22c55e' }}
              thumbColor="#ffffff"
            />
          </View>

          <TouchableOpacity 
            style={styles.row}
            onPress={() => navigation.navigate('LinkedAccountsScreen')}
          >
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
          Keep your security settings updated to protect your data.
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
    textAlign: 'center',
    marginVertical: 30,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingLeft: 4,
  },
  card: { 
    borderRadius: 24, 
    paddingHorizontal: 8,
    marginBottom: 25,
    overflow: 'hidden'
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
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowText: { fontSize: 16, fontWeight: '600', marginLeft: 15 },
  textStack: { marginLeft: 15, flex: 1 },
  rowSubtext: { fontSize: 12, marginTop: 2, opacity: 0.7 },
  footerInfo: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
    paddingHorizontal: 40,
    opacity: 0.6,
  },
});