import React, { useState, useContext, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, StatusBar, Platform, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { NotificationService } from "../../../sharedfolder/NotificationService"; // ✅ Import the service

export default function NotificationSettings({ navigation }) {
  const { theme, colors } = useContext(ThemeContext);
  const { user, updateUserProfile } = useContext(AuthContext);
  const isDarkMode = theme === 'dark';

  // Initialize state from user profile if available, otherwise use defaults
  const [alerts, setAlerts] = useState({
    push: user?.notificationSettings?.push ?? false,
    email: user?.notificationSettings?.email ?? false,
    disaster: user?.notificationSettings?.disaster ?? true,
    rain: user?.notificationSettings?.rain ?? true,
    news: user?.notificationSettings?.news ?? false
  });

  // Check actual system permission on mount to keep UI in sync
  useEffect(() => {
    const checkPermissions = async () => {
      const hasPermission = await NotificationService.requestPermissions();
      setAlerts(prev => ({ ...prev, push: hasPermission }));
    };
    checkPermissions();
  }, []);

  const toggleSwitch = async (key) => {
    const newValue = !alerts[key];

    // ✅ Logic for System Permissions
    if (key === 'push' && newValue) {
      const granted = await NotificationService.requestPermissions();
      if (!granted) {
        Alert.alert(
          "Permission Denied",
          "Please enable notifications in your device settings to receive emergency alerts.",
          [{ text: "OK" }]
        );
        return; // Don't toggle the switch if permission is denied
      }
    }

    // Update Local State
    const updatedSettings = { ...alerts, [key]: newValue };
    setAlerts(updatedSettings);

    // ✅ Safety Warning for Disasters
    if (key === 'disaster' && !newValue) {
      Alert.alert(
        "Warning",
        "Disabling Emergency Alerts is not recommended for your safety in high-risk zones.",
        [{ text: "I Understand", style: "destructive" }]
      );
    }

    // ✅ Sync with AuthContext/Backend
    if (updateUserProfile) {
      updateUserProfile({ notificationSettings: updatedSettings });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()}>
           <Text style={{ color: colors.accent, fontWeight: '700' }}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionLabel}>Master Settings</Text>
        <View style={[styles.cardGroup, { backgroundColor: isDarkMode ? "#0f172a" : "#fff" }]}>
          <NotificationRow 
            colors={colors} 
            icon="notifications" 
            label="Push Notifications" 
            detail="Allow app to send alerts to your device"
            value={alerts.push}
            onToggle={() => toggleSwitch('push')}
          />
        </View>

        <Text style={styles.sectionLabel}>Disaster Alerts (Nepal Specific)</Text>
        <View style={[styles.cardGroup, { backgroundColor: isDarkMode ? "#0f172a" : "#fff" }]}>
          <NotificationRow 
            colors={colors} 
            icon="alert-circle" 
            label="Emergency Alerts" 
            detail="Critical weather & earthquake warnings"
            value={alerts.disaster}
            onToggle={() => toggleSwitch('disaster')}
          />
          <View style={[styles.divider, { backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9" }]} />
          <NotificationRow 
            colors={colors} 
            icon="rainy" 
            label="Monsoon Updates" 
            detail="Landslide and flood risk notifications"
            value={alerts.rain}
            onToggle={() => toggleSwitch('rain')}
          />
        </View>

        <Text style={styles.sectionLabel}>Communication</Text>
        <View style={[styles.cardGroup, { backgroundColor: isDarkMode ? "#0f172a" : "#fff" }]}>
          <NotificationRow 
            colors={colors} 
            icon="mail" 
            label="Email Summaries" 
            detail="Weekly disaster research & safety tips"
            value={alerts.email}
            onToggle={() => toggleSwitch('email')}
          />
          <View style={[styles.divider, { backgroundColor: isDarkMode ? "#1e293b" : "#f1f5f9" }]} />
          <NotificationRow 
            colors={colors} 
            icon="megaphone" 
            label="Safety Workshops" 
            detail="Notifications for local safety training"
            value={alerts.news}
            onToggle={() => toggleSwitch('news')}
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#64748b" />
          <Text style={[styles.infoText, { color: colors.subText }]}>
            Disabling critical alerts may significantly delay your response time during natural disasters.
          </Text>
        </View>
        
        {/* Test Trigger for Sambriddhi (Development Only) */}
        <TouchableOpacity 
          style={styles.testBtn} 
          onPress={() => NotificationService.triggerDisasterAlert("Test Alert", "This is a test of the Safe Nepal notification engine.")}
        >
          <Text style={{color: '#64748b', fontSize: 10}}>DEBUG: Send Test Notification</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// ... NotificationRow and Styles remain largely the same, added testBtn style ...

const styles = StyleSheet.create({
  // ... (Your existing styles) ...
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingTop: Platform.OS === 'ios' ? 60 : 40, 
    paddingBottom: 20,
    borderBottomWidth: 1
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  saveBtn: { width: 50, alignItems: 'flex-end', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionLabel: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#64748b', 
    marginBottom: 10, 
    marginTop: 25, 
    marginLeft: 4, 
    letterSpacing: 1 
  },
  cardGroup: { borderRadius: 20, overflow: 'hidden', elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  textWrapper: { flex: 1, paddingRight: 10 },
  rowText: { fontSize: 16, fontWeight: '700' },
  rowDetail: { fontSize: 12, marginTop: 3, lineHeight: 16 },
  divider: { height: 1, marginHorizontal: 18 },
  infoBox: { flexDirection: 'row', marginTop: 30, paddingHorizontal: 20, alignItems: 'center' },
  infoText: { flex: 1, marginLeft: 10, fontSize: 12, lineHeight: 18 },
  testBtn: { marginTop: 40, alignSelf: 'center', padding: 10, opacity: 0.5 }
});

function NotificationRow({ colors, icon, label, detail, value, onToggle }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
          <Ionicons name={icon} size={20} color={colors.accent} />
        </View>
        <View style={styles.textWrapper}>
          <Text style={[styles.rowText, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.rowDetail, { color: colors.subText }]}>{detail}</Text>
        </View>
      </View>
      <Switch 
        value={value} 
        onValueChange={onToggle}
        trackColor={{ false: "#334155", true: "#10b981" }}
        thumbColor="#fff"
      />
    </View>
  );
}