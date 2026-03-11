import React, { useState, useContext, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, StatusBar, Alert, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeContext } from "../context/ThemeContext";

const STORAGE_KEY = '@user_security_settings';

export default function SecuritySettings({ navigation }) {
  const { colors, isDarkMode } = useContext(ThemeContext);

  const [security, setSecurity] = useState({
    biometrics: false,
    twoFactor: false,
  });

  // 1. Load persisted settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setSecurity(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load security settings");
      }
    };
    loadSettings();
  }, []);

  // 2. Persist settings whenever they change
  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {
      Alert.alert("Error", "Failed to save security preferences.");
    }
  };

  // 3. Logic for Biometric Toggle
  const handleBiometricToggle = async () => {
    if (!security.biometrics) {
      // Check if hardware supports it
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        return Alert.alert(
          "Not Supported", 
          "Your device does not support biometrics or no fingerprints/FaceID are registered."
        );
      }

      // Verify user before enabling
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Confirm identity to enable Biometric Lock",
        fallbackLabel: "Use Passcode",
      });

      if (result.success) {
        const newSettings = { ...security, biometrics: true };
        setSecurity(newSettings);
        saveSettings(newSettings);
      }
    } else {
      // Simple disable
      const newSettings = { ...security, biometrics: false };
      setSecurity(newSettings);
      saveSettings(newSettings);
    }
  };

  // 4. Logic for 2FA (Mocking the navigation to setup)
  const handle2FAToggle = () => {
    if (!security.twoFactor) {
      Alert.alert(
        "Enable 2FA",
        "We will send a verification code to your registered phone number.",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Setup", 
            onPress: () => {
              const newSettings = { ...security, twoFactor: true };
              setSecurity(newSettings);
              saveSettings(newSettings);
            } 
          }
        ]
      );
    } else {
      setSecurity(prev => {
        const updated = { ...prev, twoFactor: false };
        saveSettings(updated);
        return updated;
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Security & Safety</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>Login Security</Text>
        <View style={[styles.cardGroup, { backgroundColor: colors.card }]}>
          <TouchableOpacity 
            style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => navigation.navigate("ChangePassword")} 
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
                <Ionicons name="key-outline" size={18} color={colors.accent} />
              </View>
              <Text style={[styles.rowText, { color: colors.text }]}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subText} />
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
                <Ionicons name="finger-print-outline" size={18} color={colors.accent} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={[styles.rowText, { color: colors.text }]}>Biometric Lock</Text>
                <Text style={[styles.rowDetail, { color: colors.subText }]}>Use FaceID or Fingerprint</Text>
              </View>
            </View>
            <Switch 
              value={security.biometrics} 
              onValueChange={handleBiometricToggle}
              trackColor={{ false: "#334155", true: colors.success }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.subText }]}>Advanced Protection</Text>
        <View style={[styles.cardGroup, { backgroundColor: colors.card }]}>
          <View style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
                <Ionicons name="shield-half-outline" size={18} color={colors.accent} />
              </View>
              <View style={styles.textWrapper}>
                <Text style={[styles.rowText, { color: colors.text }]}>Two-Factor Auth</Text>
                <Text style={[styles.rowDetail, { color: colors.subText }]}>Secure your account via SMS</Text>
              </View>
            </View>
            <Switch 
              value={security.twoFactor} 
              onValueChange={handle2FAToggle}
              trackColor={{ false: "#334155", true: colors.success }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity 
            style={styles.row} 
            onPress={() => navigation.navigate("ActiveSessions")}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
                <Ionicons name="laptop-outline" size={18} color={colors.accent} />
              </View>
              <Text style={[styles.rowText, { color: colors.text }]}>Active Sessions</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.subText} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.footerInfo, { color: colors.subText }]}>
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
    paddingHorizontal: 16, 
    paddingBottom: 15 
  },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionLabel: { 
    fontSize: 11, 
    fontWeight: '800', 
    marginBottom: 10, 
    marginTop: 25, 
    marginLeft: 4, 
    textTransform: 'uppercase',
    letterSpacing: 1.2
  },
  cardGroup: { borderRadius: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  textWrapper: { flex: 1, paddingRight: 10 },
  rowText: { fontSize: 16, fontWeight: '600' },
  rowDetail: { fontSize: 12, marginTop: 4, opacity: 0.8 },
  footerInfo: { textAlign: 'center', marginTop: 30, fontSize: 12, lineHeight: 20, paddingHorizontal: 30, opacity: 0.7 }
});