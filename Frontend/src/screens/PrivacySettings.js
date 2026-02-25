import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, StatusBar, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PrivacySettings({ navigation }) {
  // Theme matches your Deep Blue and Black original theme
  const theme = {
    bg: "#020617",
    card: "#0f172a",
    text: "#F1F5F9",
    subText: "#94A3B8",
    border: "#1e293b",
    accent: "#3b82f6",
    success: "#22c55e"
  };

  const [privacy, setPrivacy] = useState({
    location: true,
    analytics: false,
    publicProfile: true,
    personalizedAds: false
  });

  const toggleSwitch = (key) => {
    setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* PERMISSIONS SECTION */}
        <Text style={styles.sectionLabel}>Permissions</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <PrivacyRow 
            theme={theme} 
            icon="location" 
            label="Location Services" 
            detail="Used for precise weather and disaster alerts"
            value={privacy.location}
            onToggle={() => toggleSwitch('location')}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <PrivacyRow 
            theme={theme} 
            icon="stats-chart" 
            label="Usage Analytics" 
            detail="Help us improve by sharing anonymous data"
            value={privacy.analytics}
            onToggle={() => toggleSwitch('analytics')}
          />
        </View>

        {/* VISIBILITY SECTION */}
        <Text style={styles.sectionLabel}>Visibility</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <PrivacyRow 
            theme={theme} 
            icon="eye" 
            label="Public Profile" 
            detail="Allow others to see your contributions"
            value={privacy.publicProfile}
            onToggle={() => toggleSwitch('publicProfile')}
          />
        </View>

        {/* DATA MANAGEMENT SECTION */}
        <Text style={styles.sectionLabel}>Your Data</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={() => Alert.alert("Request Sent", "A copy of your data will be sent to your email.")}
          >
            <View style={styles.rowLeft}>
              <View style={[styles.iconBox, { backgroundColor: '#1e293b' }]}>
                <Ionicons name="download-outline" size={18} color={theme.accent} />
              </View>
              <Text style={[styles.rowText, { color: theme.text }]}>Download My Data</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.subText} />
          </TouchableOpacity>
        </View>

        <Text style={[styles.footerInfo, { color: theme.subText }]}>
          We value your privacy. Your data is encrypted and never sold to third parties.
        </Text>
      </ScrollView>
    </View>
  );
}

// Sub-component for Privacy Rows
function PrivacyRow({ theme, icon, label, detail, value, onToggle }) {
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
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  textWrapper: { flex: 1, paddingRight: 10 },
  rowText: { fontSize: 16, fontWeight: '600' },
  rowDetail: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginHorizontal: 16 },
  footerInfo: { textAlign: 'center', marginTop: 30, fontSize: 12, lineHeight: 18, paddingHorizontal: 20 }
});