import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Switch, StatusBar, Alert, ActivityIndicator
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// --- FIXED IMPORT ---
// Updated from "../services/storage" to your actual file "../services/dbService"
import { saveSetting, getSetting } from "../services/dbService";

export default function PrivacySettings({ navigation }) {
  const theme = {
    bg: "#020617",
    card: "#0f172a",
    text: "#F1F5F9",
    subText: "#94A3B8",
    border: "#1e293b",
    accent: "#3b82f6",
    success: "#22c55e"
  };

  const [isLoading, setIsLoading] = useState(true);
  const [privacy, setPrivacy] = useState({
    location: true,
    analytics: false,
    publicProfile: true,
  });

  // 1. Load persisted data when the screen opens
  useEffect(() => {
    const loadPrivacyData = async () => {
      try {
        const location = await getSetting('privacy_location', true);
        const analytics = await getSetting('privacy_analytics', false);
        const publicProfile = await getSetting('privacy_public', true);
        
        setPrivacy({
          location,
          analytics,
          publicProfile
        });
      } catch (err) {
        console.error("Failed to load privacy settings", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadPrivacyData();
  }, []);

  // 2. Save choice to AsyncStorage whenever a switch is toggled
  const toggleSwitch = async (key, storageKey) => {
    const newValue = !privacy[key];
    
    // Update local state for immediate UI feedback
    setPrivacy(prev => ({ ...prev, [key]: newValue }));
    
    // Persist to storage
    await saveSetting(storageKey, newValue);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.accent} />
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
            onToggle={() => toggleSwitch('location', 'privacy_location')}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <PrivacyRow 
            theme={theme} 
            icon="stats-chart" 
            label="Usage Analytics" 
            detail="Help us improve by sharing anonymous data"
            value={privacy.analytics}
            onToggle={() => toggleSwitch('analytics', 'privacy_analytics')}
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
            onToggle={() => toggleSwitch('publicProfile', 'privacy_public')}
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
        thumbColor={value ? "#FFFFFF" : "#94A3B8"}
        trackColor={{ false: "#334155", true: theme.success }}
      />
    </View>
  );
}