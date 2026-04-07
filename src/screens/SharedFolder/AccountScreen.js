import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';

export default function AccountScreen({ navigation }) {
  const { colors, theme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const isDarkMode = theme === 'dark';

  const handleLogout = async () => {
    await logout();
    // navigation.replace('Login') is usually handled by AppNavigator logic
  };

  // Reusable component for settings rows
  const SettingItem = ({ icon, label, subLabel, onPress, color = colors.primary }) => (
    <TouchableOpacity 
      style={[styles.settingItem, { borderBottomColor: colors.border }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.settingText}>
        <Text style={[styles.settingLabel, { color: colors.text }]}>{label}</Text>
        {subLabel && <Text style={[styles.settingSubLabel, { color: colors.subText }]}>{subLabel}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.subText} />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Profile</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* --- SECTION 1: PREFERENCES & SECURITY --- */}
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>Preferences & Security</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingItem 
            icon="notifications-outline" 
            label="Notifications" 
            subLabel="Flood & Disaster Alert Settings"
            onPress={() => navigation.navigate('NotificationSettings')}
            color="#f59e0b"
          />
          <SettingItem 
            icon="shield-outline" 
            label="Privacy" 
            subLabel="Manage Location & Data Permissions"
            onPress={() => navigation.navigate('PrivacySettings')}
            color="#10b981"
          />
          <SettingItem 
            icon="person-outline" 
            label="Account" 
            subLabel="Personal Details & Research Focus"
            onPress={() => navigation.navigate('AccountSettings')}
            color="#6366f1"
          />
        </View>

        {/* --- SECTION 2: SUPPORT --- */}
        <Text style={[styles.sectionTitle, { color: colors.subText }]}>Support</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <SettingItem 
            icon="help-circle-outline" 
            label="Help & FAQ" 
            subLabel="SARIMAX Predictive Engine Support"
            onPress={() => navigation.navigate('Help')}
            color="#8b5cf6"
          />
          <SettingItem 
            icon="information-circle-outline" 
            label="About Safe Nepal" 
            subLabel="Version 2.1.0 Beta (2026)"
            onPress={() => navigation.navigate('About')}
            color="#64748b"
          />
        </View>

        {/* --- SECTION 3: LOG OUT --- */}
        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: isDarkMode ? '#1e1b1b' : '#fff1f1' }]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Log Out from Device</Text>
        </TouchableOpacity>

        {/* --- SECTION 4: SWITCH MODE (Last Item) --- */}
        <Text style={[styles.sectionTitle, { color: colors.subText, marginTop: 20 }]}>Responder Tools</Text>
        <TouchableOpacity 
          style={styles.policeModeBtn} 
          onPress={() => navigation.navigate('PoliceDashboard')}
        >
          <Ionicons name="shield-checkmark" size={22} color="#000" />
          <Text style={styles.policeModeText}>Switch to Police Mode</Text>
        </TouchableOpacity>

        {/* Footer Text */}
        <Text style={[styles.footerBrand, { color: colors.subText }]}>
          Safe Nepal • Kathmandu, Nepal
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
    paddingHorizontal: 20, 
    paddingBottom: 20 
  },
  headerTitle: { fontSize: 22, fontWeight: '800' },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  scrollContent: { padding: 16, paddingBottom: 60 },
  sectionTitle: { 
    fontSize: 12, 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    letterSpacing: 1, 
    marginBottom: 10, 
    marginLeft: 10 
  },
  card: { borderRadius: 24, overflow: 'hidden', marginBottom: 25, elevation: 2 },
  settingItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 16, 
    borderBottomWidth: 0.5 
  },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  settingText: { flex: 1 },
  settingLabel: { fontSize: 16, fontWeight: '700' },
  settingSubLabel: { fontSize: 12, marginTop: 2 },
  
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 18, 
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)'
  },
  logoutText: { color: '#ef4444', fontSize: 16, fontWeight: '800', marginLeft: 10 },

  policeModeBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 18, 
    borderRadius: 20, 
    backgroundColor: '#bef264', // Your Lime Green Color
    shadowColor: '#bef264',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5
  },
  policeModeText: { color: '#000', fontSize: 16, fontWeight: '800', marginLeft: 10 },
  
  footerBrand: { 
    textAlign: 'center', 
    marginTop: 30, 
    fontSize: 12, 
    fontWeight: '600' 
  }
});