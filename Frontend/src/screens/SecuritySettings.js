import React, { useState, useContext } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, StatusBar, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext"; // Import global theme

export default function SecuritySettings({ navigation }) {
  // Use the global theme colors we set up earlier
  const { colors, isDarkMode } = useContext(ThemeContext);

  const [security, setSecurity] = useState({
    biometrics: true,
    twoFactor: false,
    loginAlerts: true
  });

  const toggleSwitch = (key) => {
    setSecurity(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* HEADER - Changed <div> to <View> to fix the crash */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* LOGIN SECURITY SECTION */}
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>Login Security</Text>
        <View style={[styles.cardGroup, { backgroundColor: colors.card }]}>
          <TouchableOpacity 
            style={[styles.row, { borderBottomWidth: 1, borderBottomColor: colors.border }]}
            onPress={() => Alert.alert("Password", "Navigate to Change Password screen.")}
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
              onValueChange={() => toggleSwitch('biometrics')}
              trackColor={{ false: "#334155", true: colors.success }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* ADVANCED PROTECTION SECTION */}
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
              onValueChange={() => toggleSwitch('twoFactor')}
              trackColor={{ false: "#334155", true: colors.success }}
              thumbColor="#fff"
            />
          </View>

          <TouchableOpacity 
            style={styles.row} 
            onPress={() => Alert.alert("Devices", "Currently logged in on 1 device.")}
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
    paddingTop: 50, 
    paddingBottom: 15 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionLabel: { 
    fontSize: 12, 
    fontWeight: '800', 
    marginBottom: 10, 
    marginTop: 25, 
    marginLeft: 4, 
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  cardGroup: { borderRadius: 20, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  textWrapper: { flex: 1, paddingRight: 10 },
  rowText: { fontSize: 16, fontWeight: '600' },
  rowDetail: { fontSize: 12, marginTop: 2 },
  footerInfo: { textAlign: 'center', marginTop: 30, fontSize: 12, lineHeight: 18, paddingHorizontal: 20 }
});