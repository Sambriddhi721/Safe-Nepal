import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, StatusBar, Alert, ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Define theme outside to avoid re-renders
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

  // 1. Load data safely
  useEffect(() => {
    const loadPrivacyData = async () => {
      try {
        const keys = ['@priv_loc', '@priv_anlyt', '@priv_pub'];
        const stores = await AsyncStorage.multiGet(keys);
        
        if (stores) {
          setPrivacy({
            location: stores[0][1] !== null ? JSON.parse(stores[0][1]) : true,
            analytics: stores[1][1] !== null ? JSON.parse(stores[1][1]) : false,
            publicProfile: stores[2][1] !== null ? JSON.parse(stores[2][1]) : true,
          });
        }
      } catch (err) {
        console.warn("Storage Load Error:", err);
      } finally {
        // Ensure loading state is turned off even if storage fails
        setIsLoading(false);
      }
    };
    loadPrivacyData();
  }, []);

  // 2. Persist data safely
  const toggleSwitch = async (key, storageKey) => {
    try {
      const newValue = !privacy[key];
      // Update UI first for speed (Optimistic UI)
      setPrivacy(prev => ({ ...prev, [key]: newValue }));
      // Save to disk
      await AsyncStorage.setItem(`@${storageKey}`, JSON.stringify(newValue));
    } catch (err) {
      Alert.alert("Error", "Could not save your setting.");
      // Rollback UI on failure
      setPrivacy(prev => ({ ...prev, [key]: !prev[key] }));
    }
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
      
      {/* HEADER - Using optional chaining ?. to prevent 'undefined' errors */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation?.goBack()} 
          style={styles.backBtn}
        >
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy Settings</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        <Text style={styles.sectionLabel}>Permissions</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <PrivacyRow 
            icon="location" 
            label="Location Services" 
            detail="Used for precise weather and disaster alerts"
            value={privacy.location}
            onToggle={() => toggleSwitch('location', 'priv_loc')}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <PrivacyRow 
            icon="stats-chart" 
            label="Usage Analytics" 
            detail="Help us improve by sharing anonymous data"
            value={privacy.analytics}
            onToggle={() => toggleSwitch('analytics', 'priv_anlyt')}
          />
        </View>

        <Text style={styles.sectionLabel}>Visibility</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <PrivacyRow 
            icon="eye" 
            label="Public Profile" 
            detail="Allow others to see your contributions"
            value={privacy.publicProfile}
            onToggle={() => toggleSwitch('publicProfile', 'priv_pub')}
          />
        </View>

        <Text style={styles.sectionLabel}>Your Data</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={() => Alert.alert("Request Sent", "A copy of your data will be sent to your email.")}
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

// Sub-component for rows
function PrivacyRow({ icon, label, detail, value, onToggle }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={styles.iconBox}>
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
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backBtn: { padding: 8 },
  scrollContent: { padding: 20 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8, marginLeft: 4 },
  cardGroup: { borderRadius: 16, marginBottom: 24, overflow: 'hidden', borderWidth: 1, borderColor: '#1e293b' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#1e293b', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  textWrapper: { flex: 1 },
  rowText: { fontSize: 16, fontWeight: '600' },
  rowDetail: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, width: '100%', backgroundColor: '#1e293b' },
  actionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  footerInfo: { textAlign: 'center', fontSize: 12, marginTop: 10, paddingHorizontal: 30 },
});