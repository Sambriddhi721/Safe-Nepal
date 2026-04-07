import React, { useState, useContext, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, StatusBar, Platform, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Notifications from "expo-notifications";

import { ThemeContext } from "../../context/ThemeContext";
import { AuthContext } from "../../context/AuthContext";
import { NotificationService } from "./NotificationService";

export default function NotificationSettings({ navigation }) {
  const { colors, isDarkMode } = useContext(ThemeContext);
  const { user, updateUserProfile } = useContext(AuthContext);

  // Initialize state with safety fallbacks
  const [alerts, setAlerts] = useState({
    push: false,
    disaster: user?.notificationSettings?.disaster ?? true,
    rain: user?.notificationSettings?.rain ?? true,
    email: user?.notificationSettings?.email ?? false,
    news: user?.notificationSettings?.news ?? false
  });

  /**
   * Sync UI with actual device permission status on mount
   */
  useEffect(() => {
    const syncPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      setAlerts(prev => ({ ...prev, push: status === 'granted' }));
    };
    syncPermissions();
  }, []);

  const toggleSwitch = async (key) => {
    let newValue = !alerts[key];

    // ✅ Special handling for Master Push Toggle
    if (key === 'push' && newValue) {
      const granted = await NotificationService.init();
      if (!granted) {
        Alert.alert(
          "Permission Denied",
          "Please enable notifications in your system settings to receive emergency alerts.",
          [{ text: "OK" }]
        );
        return;
      }
    }

    // ✅ Safety Warning for critical hazard alerts
    if (key === 'disaster' && !newValue) {
      Alert.alert(
        "Critical Warning",
        "Disabling Emergency Alerts is highly discouraged. You may miss life-saving warnings for floods or landslides.",
        [
          { text: "Keep Enabled", onPress: () => {}, style: "cancel" },
          { text: "Disable Anyway", onPress: () => finalizeToggle(key, newValue), style: "destructive" }
        ]
      );
      return;
    }

    finalizeToggle(key, newValue);
  };

  const finalizeToggle = (key, value) => {
    const updatedSettings = { ...alerts, [key]: value };
    setAlerts(updatedSettings);

    // ✅ Sync to AuthContext (and subsequently AsyncStorage/Backend)
    if (updateUserProfile) {
      updateUserProfile({ notificationSettings: updatedSettings });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Alert Preferences</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={() => navigation.goBack()}>
           <Text style={{ color: colors.accent, fontWeight: '700' }}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionLabel}>Device Connectivity</Text>
        <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <NotificationRow 
            colors={colors} 
            icon="notifications" 
            label="Push Notifications" 
            detail="Master toggle for all mobile alerts"
            value={alerts.push}
            onToggle={() => toggleSwitch('push')}
          />
        </View>

        <Text style={styles.sectionLabel}>Hazard & Disaster Alerts</Text>
        <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <NotificationRow 
            colors={colors} 
            icon="alert-circle" 
            label="Emergency Alerts" 
            detail="Critical weather & earthquake warnings"
            value={alerts.disaster}
            onToggle={() => toggleSwitch('disaster')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <NotificationRow 
            colors={colors} 
            icon="rainy" 
            label="Monsoon Risk" 
            detail="Real-time flood and landslide updates"
            value={alerts.rain}
            onToggle={() => toggleSwitch('rain')}
          />
        </View>

        <Text style={styles.sectionLabel}>Community & Education</Text>
        <View style={[styles.cardGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <NotificationRow 
            colors={colors} 
            icon="mail" 
            label="Safety Summaries" 
            detail="Weekly disaster research & safety tips"
            value={alerts.email}
            onToggle={() => toggleSwitch('email')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <NotificationRow 
            colors={colors} 
            icon="megaphone" 
            label="Local Workshops" 
            detail="Notifications for safety training sessions"
            value={alerts.news}
            onToggle={() => toggleSwitch('news')}
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} />
          <Text style={[styles.infoText, { color: colors.subText }]}>
            High-priority alerts use a specialized SARIMAX engine to ensure you receive warnings before a hazard reaches your zone.
          </Text>
        </View>
        
        {/* DEBUG: Helper for testing notification sound/visuals */}
        <TouchableOpacity 
          style={styles.testBtn} 
          onPress={() => NotificationService.triggerDisasterAlert("System Test", "The Safe Nepal notification engine is online and operational.")}
        >
          <Text style={{color: colors.subText, fontSize: 10, letterSpacing: 1}}>
            DEVELOPER: TRIGGER TEST ALERT
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

function NotificationRow({ colors, icon, label, detail, value, onToggle }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
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

const styles = StyleSheet.create({
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
  headerTitle: { fontSize: 18, fontWeight: '900' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  saveBtn: { width: 50, alignItems: 'flex-end', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionLabel: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#64748b', 
    marginBottom: 10, 
    marginTop: 25, 
    marginLeft: 4, 
    textTransform: 'uppercase',
    letterSpacing: 1.5 
  },
  cardGroup: { borderRadius: 24, overflow: 'hidden', borderWidth: 1 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  textWrapper: { flex: 1, paddingRight: 10 },
  rowText: { fontSize: 16, fontWeight: '700' },
  rowDetail: { fontSize: 12, marginTop: 4, lineHeight: 16 },
  divider: { height: 1, marginHorizontal: 20 },
  infoBox: { flexDirection: 'row', marginTop: 30, paddingHorizontal: 20, alignItems: 'center' },
  infoText: { flex: 1, marginLeft: 12, fontSize: 12, lineHeight: 18 },
  testBtn: { marginTop: 50, alignSelf: 'center', padding: 15, opacity: 0.6 }
});