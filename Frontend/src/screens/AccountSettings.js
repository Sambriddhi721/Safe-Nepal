import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AccountScreen({ navigation }) {
  // Theme matches your Deep Blue and Black original theme
  const theme = {
    bg: "#020617",
    card: "#0f172a",
    text: "#F1F5F9",
    subText: "#94A3B8",
    border: "#1e293b",
    accent: "#3b82f6",
    premium: "#fbbf24" // Gold for subscription status
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Manage Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* SUBSCRIPTION STATUS CARD */}
        <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.statusHeader}>
             <Text style={[styles.statusLabel, { color: theme.subText }]}>Current Plan</Text>
             <View style={[styles.badge, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Text style={[styles.badgeText, { color: theme.accent }]}>FREE</Text>
             </View>
          </View>
          <Text style={[styles.statusTitle, { color: theme.text }]}>Safe Nepal Standard</Text>
          <TouchableOpacity style={[styles.upgradeLink]}>
            <Text style={{ color: theme.accent, fontWeight: '700' }}>Upgrade to Pro for $0.00 →</Text>
          </TouchableOpacity>
        </View>

        {/* ACCOUNT OPTIONS GROUP */}
        <Text style={styles.sectionLabel}>Account Management</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <AccountOption 
            theme={theme} 
            icon="person-circle-outline" 
            label="Personal Information" 
            onPress={() => navigation.navigate("AccountSettings")} 
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <AccountOption 
            theme={theme} 
            icon="card-outline" 
            label="Payments & Billing" 
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <AccountOption 
            theme={theme} 
            icon="cloud-upload-outline" 
            label="Backup & Sync" 
            last 
          />
        </View>

        {/* DATA & EXPORT */}
        <Text style={styles.sectionLabel}>Data Control</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <AccountOption 
            theme={theme} 
            icon="share-social-outline" 
            label="Linked Accounts" 
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <AccountOption 
            theme={theme} 
            icon="document-text-outline" 
            label="Export Account History" 
            last 
          />
        </View>

        {/* LOGOUT - Integrated into the list for a clean look */}
        <TouchableOpacity 
          style={[styles.logoutRow, { backgroundColor: theme.card, marginTop: 30 }]}
          onPress={() => navigation.navigate("Login")} // Or your signOut logic
        >
          <Ionicons name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Switch Account</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

function AccountOption({ theme, icon, label, onPress, last }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={22} color={theme.subText} />
        <Text style={[styles.rowText, { color: theme.text }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.subText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },

  statusCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 10 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  statusLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '900' },
  statusTitle: { fontSize: 22, fontWeight: 'bold' },
  upgradeLink: { marginTop: 15 },

  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 10, marginTop: 25, marginLeft: 4, textTransform: 'uppercase' },
  cardGroup: { borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowText: { fontSize: 16, fontWeight: '500', marginLeft: 15 },
  divider: { height: 1, marginLeft: 50 },

  logoutRow: { flexDirection: 'row', alignItems: 'center', padding: 18, borderRadius: 16, justifyContent: 'center' },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});