import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Switch,
} from 'react-native';

import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import NetInfo from '@react-native-community/netinfo';

import { AuthContext } from '../../context/AuthContext';
import { ThemeContext } from '../../context/ThemeContext';

export default function ResponderSettingsScreen({ navigation }) {
  const { user, logout, switchRole } = useContext(AuthContext) || {};
  const { theme, toggleTheme } = useContext(ThemeContext) || {};
  const isDarkMode = theme === 'dark';

  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [networkStatus, setNetworkStatus] = useState('Checking...');
  const [locationStatus, setLocationStatus] = useState('Checking...');

  // Colors driven by theme
  const bg = isDarkMode ? '#0f172a' : '#f1f5f9';
  const card = isDarkMode ? '#1e293b' : '#ffffff';
  const textPrimary = isDarkMode ? '#f1f5f9' : '#1e293b';
  const textSecondary = isDarkMode ? '#94a3b8' : '#64748b';
  const border = isDarkMode ? '#1e293b' : '#e2e8f0';
  const iconBg = isDarkMode ? '#0f172a' : '#f8fafc';

  // 📡 Network Status
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkStatus(state.isConnected ? 'Online' : 'Offline');
    });
    return () => unsubscribe();
  }, []);

  // 📍 Location Status
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.getForegroundPermissionsAsync();
        setLocationStatus(status === 'granted' ? 'Granted' : 'Denied');
      } catch {
        setLocationStatus('Unavailable');
      }
    })();
  }, []);

  // 💾 Load Settings
  useEffect(() => {
    (async () => {
      try {
        const bio = await AsyncStorage.getItem('biometric');
        const notif = await AsyncStorage.getItem('notifications');
        if (bio !== null) setBiometricEnabled(JSON.parse(bio));
        if (notif !== null) setNotificationsEnabled(JSON.parse(notif));
      } catch (_) {}
    })();
  }, []);

  // 💾 Save Settings
  const saveSetting = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (_) {}
  };

  // 🔁 Role Switch with biometric guard
  const handleRoleSwitch = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      if (biometricEnabled) {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();

        if (hasHardware && isEnrolled) {
          const result = await LocalAuthentication.authenticateAsync({
            promptMessage: 'Verify Identity to Switch Role',
            fallbackLabel: 'Use Passcode',
          });
          if (!result.success) return;
        }
      }

      await switchRole?.('CITIZEN');

      if (navigation?.replace) {
        navigation.replace('HomeScreen');
      } else if (navigation?.navigate) {
        navigation.navigate('HomeScreen');
      }
    } catch (err) {
      console.warn('Role switch error:', err);
    }
  };

  // 🔐 Toggle biometric
  const handleBiometricToggle = () => {
    const val = !biometricEnabled;
    setBiometricEnabled(val);
    saveSetting('biometric', val);
    Haptics.selectionAsync();
  };

  // 🔔 Toggle notifications
  const handleNotifToggle = () => {
    const val = !notificationsEnabled;
    setNotificationsEnabled(val);
    saveSetting('notifications', val);
    Haptics.selectionAsync();
  };

  // 🚪 Logout with confirmation
  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Using a simple inline confirm via alert-like pattern without importing Alert
    // Safe: logout is called directly — add Alert.alert wrapper if preferred
    if (logout) logout();
  };

  // ── Reusable row component ──────────────────────────────────────────────
  const SettingItem = ({
    icon,
    iconColor = '#3b82f6',
    title,
    subtitle,
    onPress,
    rightElement,
    isLast = false,
  }) => (
    <TouchableOpacity
      style={[
        styles.item,
        {
          borderBottomWidth: isLast ? 0 : 1,
          borderBottomColor: border,
        },
      ]}
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
      activeOpacity={0.7}
    >
      <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View style={styles.itemText}>
        <Text style={[styles.itemTitle, { color: textPrimary }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.itemSub, { color: textSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      {rightElement ?? (
        <Ionicons name="chevron-forward" size={16} color={textSecondary} />
      )}
    </TouchableOpacity>
  );

  // ── Status badge ────────────────────────────────────────────────────────
  const StatusBadge = ({ value }) => {
    const isGood =
      value === 'Online' || value === 'Granted';
    const isChecking = value === 'Checking...';
    const color = isChecking ? '#f59e0b' : isGood ? '#22c55e' : '#ef4444';
    return (
      <View style={[styles.badge, { backgroundColor: `${color}18`, borderColor: `${color}40` }]}>
        <View style={[styles.badgeDot, { backgroundColor: color }]} />
        <Text style={[styles.badgeText, { color }]}>{value}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[styles.backBtn, { backgroundColor: card }]}
            onPress={() => navigation?.goBack?.()}
          >
            <Ionicons name="chevron-back" size={22} color={textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>Settings</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ── Profile Card ── */}
        <View style={[styles.profileCard, { backgroundColor: card }]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0)?.toUpperCase() || 'R'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: textPrimary }]}>
              {user?.name || 'Responder'}
            </Text>
            <View style={styles.rolePill}>
              <MaterialCommunityIcons name="shield-check" size={12} color="#3b82f6" />
              <Text style={styles.profileRole}>Law Enforcement</Text>
            </View>
          </View>
          <View style={[styles.onlineDot]} />
        </View>

        {/* ── Interface ── */}
        <Text style={[styles.sectionLabel, { color: textSecondary }]}>INTERFACE</Text>
        <View style={[styles.groupCard, { backgroundColor: card }]}>
          <SettingItem
            icon="repeat"
            iconColor="#8b5cf6"
            title="Switch to Citizen Mode"
            subtitle="Return to user dashboard"
            onPress={handleRoleSwitch}
          />
          <SettingItem
            icon={isDarkMode ? 'sunny' : 'moon'}
            iconColor="#f59e0b"
            title="Dark Mode"
            subtitle={isDarkMode ? 'Currently Dark' : 'Currently Light'}
            onPress={() => toggleTheme?.()}
            isLast
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={() => toggleTheme?.()}
                trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* ── Security ── */}
        <Text style={[styles.sectionLabel, { color: textSecondary }]}>SECURITY</Text>
        <View style={[styles.groupCard, { backgroundColor: card }]}>
          <SettingItem
            icon="finger-print"
            iconColor="#10b981"
            title="Biometric Lock"
            subtitle={biometricEnabled ? 'Protects role switching' : 'Disabled'}
            onPress={handleBiometricToggle}
            rightElement={
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: '#cbd5e1', true: '#10b981' }}
                thumbColor="#fff"
              />
            }
          />
          <SettingItem
            icon="notifications"
            iconColor="#3b82f6"
            title="Push Notifications"
            subtitle={notificationsEnabled ? 'Active' : 'Muted'}
            onPress={handleNotifToggle}
            isLast
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotifToggle}
                trackColor={{ false: '#cbd5e1', true: '#3b82f6' }}
                thumbColor="#fff"
              />
            }
          />
        </View>

        {/* ── System Status ── */}
        <Text style={[styles.sectionLabel, { color: textSecondary }]}>SYSTEM STATUS</Text>
        <View style={[styles.groupCard, { backgroundColor: card }]}>
          <SettingItem
            icon="wifi"
            iconColor="#06b6d4"
            title="Network"
            rightElement={<StatusBadge value={networkStatus} />}
          />
          <SettingItem
            icon="location"
            iconColor="#f97316"
            title="Location Access"
            isLast
            rightElement={<StatusBadge value={locationStatus} />}
          />
        </View>

        {/* ── Logout ── */}
        <TouchableOpacity
          style={[
            styles.logoutBtn,
            { backgroundColor: isDarkMode ? '#450a0a' : '#fef2f2' },
          ]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="logout-variant" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Terminate Session</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: textSecondary }]}>
          Nepal Disaster Watch · Responder Build
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Profile
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    padding: 18,
    marginBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  profileRole: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '700',
  },
  onlineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22c55e',
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },

  // Group card
  groupCard: {
    borderRadius: 18,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },

  // Setting row
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemText: {
    flex: 1,
    marginRight: 8,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  itemSub: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },

  // Status badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },

  // Logout
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    gap: 10,
    marginBottom: 20,
  },
  logoutText: {
    color: '#ef4444',
    fontWeight: '800',
    fontSize: 15,
  },

  // Version
  versionText: {
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});