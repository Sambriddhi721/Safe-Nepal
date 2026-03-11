import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, StatusBar, Alert, ActivityIndicator, SafeAreaView, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Constants for Storage Keys to prevent typos
const KEYS = {
  LOCATION: '@priv_loc',
  ANALYTICS: '@priv_anlyt',
  PUBLIC: '@priv_pub'
};

const theme = {
  bg: "#020617",
  card: "#0f172a",
  text: "#F1F5F9",
  subText: "#94A3B8",
  border: "#1e293b",
  accent: "#3b82f6",
  success: "#22c55e"
};

export default function PrivacySettings({ navigation }) {
  const [isLoading, setIsLoading] = useState(true);
  const [privacy, setPrivacy] = useState({
    location: true,
    analytics: false,
    publicProfile: true,
  });

  // Load Data on Mount
  useEffect(() => {
    loadPrivacyData();
  }, []);

  const loadPrivacyData = async () => {
    try {
      const stores = await AsyncStorage.multiGet([KEYS.LOCATION, KEYS.ANALYTICS, KEYS.PUBLIC]);
      
      // Map results to state, providing defaults if null
      const mappedSettings = {
        location: stores[0][1] !== null ? JSON.parse(stores[0][1]) : true,
        analytics: stores[1][1] !== null ? JSON.parse(stores[1][1]) : false,
        publicProfile: stores[2][1] !== null ? JSON.parse(stores[2][1]) : true,
      };
      
      setPrivacy(mappedSettings);
    } catch (err) {
      console.error("Storage Load Error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Logic with Error Handling
  const handleToggle = async (key, storageKey) => {
    const previousValue = privacy[key];
    const newValue = !previousValue;

    try {
      // 1. Optimistic Update (Immediate UI response)
      setPrivacy(prev => ({ ...prev, [key]: newValue }));
      
      // 2. Save to Storage
      await AsyncStorage.setItem(storageKey, JSON.stringify(newValue));
      
      // 3. Optional: Trigger global app logic (like stopping a GPS service)
      if (key === 'location' && !newValue) {
        console.log("Stopping Location Services...");
      }
    } catch (err) {
      // 4. Rollback if save fails
      setPrivacy(prev => ({ ...prev, [key]: previousValue }));
      Alert.alert("Error", "Your preference couldn't be saved. Please try again.");
    }
  };

  const handleDownloadData = () => {
    Alert.alert(
      "Confirm Request",
      "We will compile your data and send a link to your registered email within 24 hours.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Send Request", onPress: () => console.log("Data request sent") }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation?.canGoBack() ? navigation.goBack() : Alert.alert("Note", "No back route found")} 
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={26} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionLabel}>Permissions</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <PrivacyRow 
            icon="location" 
            label="Location Services" 
            detail="Used for precise weather and disaster alerts"
            value={privacy.location}
            onToggle={() => handleToggle('location', KEYS.LOCATION)}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <PrivacyRow 
            icon="stats-chart" 
            label="Usage Analytics" 
            detail="Help us improve by sharing anonymous data"
            value={privacy.analytics}
            onToggle={() => handleToggle('analytics', KEYS.ANALYTICS)}
          />
        </View>

        <Text style={styles.sectionLabel}>Visibility</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <PrivacyRow 
            icon="eye" 
            label="Public Profile" 
            detail="Allow others to see your contributions"
            value={privacy.publicProfile}
            onToggle={() => handleToggle('publicProfile', KEYS.PUBLIC)}
          />
        </View>

        <Text style={styles.sectionLabel}>Your Data</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={handleDownloadData}
            activeOpacity={0.7}
          >
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}>
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
    </SafeAreaView>
  );
}

// Optimized Sub-component
const PrivacyRow = React.memo(({ icon, label, detail, value, onToggle }) => (
  <View style={styles.row}>
    <View style={styles.rowLeft}>
      <View style={styles.iconBox}>
        <Ionicons name={icon} size={20} color={theme.accent} />
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
      thumbColor={Platform.OS === 'ios' ? undefined : "#FFFFFF"}
    />
  </View>
));

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 8, 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0f172a'
  },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  backBtn: { padding: 8 },
  scrollContent: { padding: 20 },
  sectionLabel: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#64748b', 
    textTransform: 'uppercase', 
    letterSpacing: 1.2, 
    marginBottom: 10, 
    marginLeft: 4 
  },
  cardGroup: { 
    borderRadius: 16, 
    marginBottom: 28, 
    overflow: 'hidden', 
    borderWidth: 1, 
    borderColor: '#1e293b' 
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    backgroundColor: '#1e293b', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 14 
  },
  textWrapper: { flex: 1, paddingRight: 8 },
  rowText: { fontSize: 16, fontWeight: '600' },
  rowDetail: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  divider: { height: 1, marginHorizontal: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  footerInfo: { textAlign: 'center', fontSize: 13, marginTop: 10, paddingHorizontal: 40, lineHeight: 20 },
});