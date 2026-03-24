import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  StatusBar, Switch, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function LinkedAccountsScreen({ navigation }) {
  const [links, setLinks] = useState({
    google: true,
    facebook: false,
    esewa: false,
    citizenship: false
  });

  const theme = {
    bg: "#020617",
    card: "#0f172a",
    text: "#F1F5F9",
    subText: "#94A3B8",
    border: "#1e293b",
    accent: "#3b82f6",
  };

  const toggleLink = (key, providerName) => {
    if (!links[key]) {
      Alert.alert(
        `Link ${providerName}`,
        `Safe Nepal will request access to your ${providerName} profile.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Connect", onPress: () => setLinks({ ...links, [key]: true }) }
        ]
      );
    } else {
      setLinks({ ...links, [key]: false });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Linked Accounts</Text>
        {/* FIXED: Changed <div> to <View> */}
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.description, { color: theme.subText }]}>
          Connected accounts help us verify your reports and provide faster assistance during emergencies.
        </Text>

        <Text style={styles.sectionLabel}>Social & Identity</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <AccountRow 
            icon="logo-google" 
            label="Google" 
            color="#ea4335" 
            connected={links.google} 
            onToggle={() => toggleLink('google', 'Google')}
            theme={theme}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <AccountRow 
            icon="logo-facebook" 
            label="Facebook" 
            color="#1877f2" 
            connected={links.facebook} 
            onToggle={() => toggleLink('facebook', 'Facebook')}
            theme={theme}
          />
        </View>

        <Text style={styles.sectionLabel}>Local Services & Wallets</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <AccountRow 
            icon="wallet-outline" 
            label="eSewa / Khalti" 
            color="#60bb46" 
            connected={links.esewa} 
            onToggle={() => toggleLink('esewa', 'eSewa')}
            theme={theme}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <AccountRow 
            icon="id-card-outline" 
            label="Citizenship Verification" 
            color={theme.accent} 
            connected={links.citizenship} 
            onToggle={() => toggleLink('citizenship', 'Citizenship ID')}
            theme={theme}
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color={theme.accent} />
          <Text style={[styles.infoText, { color: theme.subText }]}>
            Your data is encrypted. We never post to your social accounts without permission.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function AccountRow({ icon, label, color, connected, onToggle, theme }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <View>
          <Text style={[styles.rowText, { color: theme.text }]}>{label}</Text>
          <Text style={{ color: connected ? '#22c55e' : theme.subText, fontSize: 12, marginLeft: 15 }}>
            {connected ? 'Connected' : 'Not Linked'}
          </Text>
        </View>
      </View>
      <Switch 
        value={connected} 
        onValueChange={onToggle}
        trackColor={{ false: "#334155", true: "#3b82f6" }}
        thumbColor={"#f8fafc"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 15 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  scrollContent: { padding: 20 },
  description: { fontSize: 14, lineHeight: 20, marginBottom: 25 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 10, textTransform: 'uppercase', marginLeft: 5 },
  cardGroup: { borderRadius: 20, overflow: 'hidden', marginBottom: 25 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowText: { fontSize: 16, fontWeight: '600', marginLeft: 15 },
  divider: { height: 1, marginLeft: 70 },
  infoBox: { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 10 },
  infoText: { fontSize: 12, marginLeft: 10, flex: 1 }
});