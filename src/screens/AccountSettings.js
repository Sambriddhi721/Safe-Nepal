import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Alert, ActivityIndicator, RefreshControl
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native'; // Required for auto-refresh
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function AccountScreen({ navigation }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const theme = {
    bg: "#020617",
    card: "#0f172a",
    text: "#F1F5F9",
    subText: "#94A3B8",
    border: "#1e293b",
    accent: "#3b82f6",
    danger: "#ef4444"
  };

  // Automatically refresh data whenever this screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const fetchUserData = async () => {
    try {
      // Use your Flask server IP
      const response = await fetch("http://192.168.111.70:5000/api/user/profile");
      const data = await response.json();
      setUserData(data);
    } catch (error) {
      console.error("Error fetching user:", error);
      // Fallback data for testing
      setUserData({ 
        name: "Sambriddhi Dawadi", 
        plan: "Standard", 
        status: "FREE",
        email: "sambriddhi@example.com",
        phone: "+977-98XXXXXXXX"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUserData();
  };

  const handleExportData = async () => {
    Alert.alert("Exporting", "Preparing your data report...");
    try {
      const fileUri = FileSystem.documentDirectory + "SafeNepal_Account_Data.json";
      const dataToExport = JSON.stringify(userData, null, 2);
      await FileSystem.writeAsStringAsync(fileUri, dataToExport);
      await Sharing.shareAsync(fileUri);
    } catch (error) {
      Alert.alert("Error", "Could not export data.");
    }
  };

  const handleSwitchAccount = () => {
    Alert.alert("Switch Account", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", onPress: () => navigation.replace("Login"), style: "destructive" }
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center' }]}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

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

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />
        }
      >
        
        {/* SUBSCRIPTION STATUS */}
        <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.statusHeader}>
             <Text style={[styles.statusLabel, { color: theme.subText }]}>Current Plan</Text>
             <View style={[styles.badge, { backgroundColor: 'rgba(59, 130, 246, 0.2)' }]}>
                <Text style={[styles.badgeText, { color: theme.accent }]}>{userData?.status || 'FREE'}</Text>
             </View>
          </View>
          <Text style={[styles.statusTitle, { color: theme.text }]}>Safe Nepal {userData?.plan || 'Standard'}</Text>
          <TouchableOpacity 
            style={styles.upgradeLink} 
            onPress={() => navigation.navigate("Billing")} // Link to Billing screen
          >
            <Text style={{ color: theme.accent, fontWeight: '700' }}>Manage Subscription →</Text>
          </TouchableOpacity>
        </View>

        {/* ACCOUNT OPTIONS */}
        <Text style={styles.sectionLabel}>Account Management</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <AccountOption 
            theme={theme} 
            icon="person-circle-outline" 
            label="Personal Information" 
            subLabel={userData?.name}
            onPress={() => navigation.navigate("AccountSettings", { user: userData })} 
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <AccountOption 
            theme={theme} 
            icon="card-outline" 
            label="Payments & Billing" 
            onPress={() => navigation.navigate("Billing")}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <AccountOption 
            theme={theme} 
            icon="cloud-upload-outline" 
            label="Backup & Sync" 
            onPress={() => Alert.alert("Sync", "Cloud backup is synchronized.")}
          />
        </View>

        {/* DATA & EXPORT */}
        <Text style={styles.sectionLabel}>Data Control</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <AccountOption 
            theme={theme} 
            icon="share-social-outline" 
            label="Linked Accounts" 
            onPress={() => navigation.navigate("LinkedAccounts")}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <AccountOption 
            theme={theme} 
            icon="document-text-outline" 
            label="Export Account History" 
            onPress={handleExportData}
          />
        </View>

        <TouchableOpacity 
          style={[styles.logoutRow, { backgroundColor: theme.card, marginTop: 30 }]}
          onPress={handleSwitchAccount}
        >
          <Ionicons name="log-out-outline" size={22} color={theme.danger} />
          <Text style={[styles.logoutText, { color: theme.danger }]}>Switch Account</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

function AccountOption({ theme, icon, label, subLabel, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={22} color={theme.subText} />
        <View>
          <Text style={[styles.rowText, { color: theme.text }]}>{label}</Text>
          {subLabel && <Text style={{ color: theme.subText, fontSize: 12, marginLeft: 15 }}>{subLabel}</Text>}
        </View>
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
  logoutText: { fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});