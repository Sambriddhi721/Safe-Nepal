import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, StatusBar, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function NotificationSettings({ navigation }) {
  // Theme consistent with your Safe Nepal deep blue design
  const theme = {
    bg: "#020617",
    card: "#0f172a",
    text: "#F1F5F9",
    subText: "#94A3B8",
    border: "#1e293b",
    accent: "#3b82f6",
    success: "#22c55e"
  };

  const [alerts, setAlerts] = useState({
    push: true,
    email: false,
    disaster: true,
    rain: true,
    news: false
  });

  const toggleSwitch = (key) => {
    setAlerts(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation?.canGoBack() ? navigation.goBack() : null} 
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionLabel}>Master Settings</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <NotificationRow 
            theme={theme} 
            icon="notifications-outline" 
            label="Push Notifications" 
            detail="Allow app to send alerts to your device"
            value={alerts.push}
            onToggle={() => toggleSwitch('push')}
          />
        </View>

        <Text style={styles.sectionLabel}>Disaster Alerts</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <NotificationRow 
            theme={theme} 
            icon="alert-circle-outline" 
            label="Emergency Alerts" 
            detail="Critical weather & disaster warnings"
            value={alerts.disaster}
            onToggle={() => toggleSwitch('disaster')}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <NotificationRow 
            theme={theme} 
            icon="rainy-outline" 
            label="Rainfall Updates" 
            detail="Get notified about heavy rain in Nepal"
            value={alerts.rain}
            onToggle={() => toggleSwitch('rain')}
          />
        </View>

        <Text style={styles.sectionLabel}>Other Channels</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <NotificationRow 
            theme={theme} 
            icon="mail-outline" 
            label="Email Notifications" 
            detail="Weekly summaries and safety tips"
            value={alerts.email}
            onToggle={() => toggleSwitch('email')}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <NotificationRow 
            theme={theme} 
            icon="newspaper-outline" 
            label="App News" 
            detail="Updates about new features"
            value={alerts.news}
            onToggle={() => toggleSwitch('news')}
          />
        </View>

        <Text style={[styles.infoText, { color: theme.subText }]}>
          Turning off critical alerts may delay your response to natural disasters in your area.
        </Text>
      </ScrollView>
    </View>
  );
}

function NotificationRow({ theme, icon, label, detail, value, onToggle }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, { backgroundColor: '#1e293b' }]}>
          <Ionicons name={icon} size={18} color={theme.accent} />
        </View>
        <View style={styles.textWrapper}>
          <Text style={[styles.rowText, { color: theme.text }]}>{label}</Text>
          <Text style={[styles.rowDetail, { color: theme.subText }]}>{detail}</Text>
        </View>
      </View>
      <Switch 
        value={value} 
        onValueChange={onToggle}
        trackColor={{ false: "#334155", true: theme.success }}
        thumbColor={Platform.OS === 'ios' ? '#fff' : value ? '#fff' : '#94a3b8'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 10, marginTop: 25, marginLeft: 4, textTransform: 'uppercase' },
  cardGroup: { borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  textWrapper: { flex: 1, paddingRight: 10 },
  rowText: { fontSize: 16, fontWeight: '600' },
  rowDetail: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginHorizontal: 16 },
  infoText: { textAlign: 'center', marginTop: 30, fontSize: 12, lineHeight: 18, paddingHorizontal: 20 }
});