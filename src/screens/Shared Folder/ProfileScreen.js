import React, { useContext, useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Switch, Image, StatusBar, ActivityIndicator, Alert, Platform 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons"; 

// Biometric & Feedback Imports
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';

// Context Imports
import { AuthContext } from "../../context/AuthContext"; 
import { ThemeContext } from "../../context/ThemeContext"; 

export default function ProfileScreen({ navigation }) {
  const { signOut, user } = useContext(AuthContext) || {};
  const { theme, toggleTheme, colors } = useContext(ThemeContext) || {};
  const isDarkMode = theme === 'dark';
  
  const [isSwitching, setIsSwitching] = useState(false);
  const displayName = user?.full_name || "Sambriddhi Dawadi";

  // --- POLICE MODE AUTHENTICATION ---
  const handlePoliceMode = async () => {
    // Physical feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access Responder Tools',
        fallbackLabel: 'Use Passcode',
      });

      if (!result.success) {
        Alert.alert("Access Denied", "Biometric authentication is required for Police Mode.");
        return; 
      }
    }

    // Success Animation & Navigation
    setIsSwitching(true);
    setTimeout(() => {
      setIsSwitching(false);
      navigation.navigate("ResponderDashboard"); 
    }, 1800); 
  };

  // Reusable Setting Row Component
  const SettingRow = ({ icon, name, subText, onPress, isSwitch, value, onToggle, color = "#3b82f6", lib = "Ionicons" }) => {
    const IconLib = lib === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;
    return (
      <TouchableOpacity 
        style={styles.rowItem} 
        onPress={onPress} 
        disabled={isSwitch}
        activeOpacity={0.7}
      >
        <View style={styles.rowLeft}>
          <View style={[styles.iconBox, { backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.6)' : '#f1f5f9' }]}>
            <IconLib name={icon} size={22} color={color} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowLabel, { color: isDarkMode ? '#fff' : '#1e293b' }]}>{name}</Text>
            {subText && <Text style={styles.subLabelText}>{subText}</Text>}
          </View>
        </View>
        {isSwitch ? (
          <Switch 
            value={value} 
            onValueChange={onToggle} 
            trackColor={{ false: "#334155", true: "#10b981" }}
            thumbColor={Platform.OS === 'ios' ? undefined : '#f8fafc'}
          />
        ) : (
          <Ionicons name="chevron-forward" size={18} color="#64748b" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.mainWrapper, { backgroundColor: isDarkMode ? '#020617' : '#f8fafc' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* POLICE MODE TRANSITION OVERLAY */}
      {isSwitching && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.overlayText}>Switching to Police Mode...</Text>
          <Text style={styles.subOverlayText}>ENCRYPTED RESPONDER SESSION</Text>
        </View>
      )}

      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* USER HEADER */}
          <View style={styles.headerProfile}>
             <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff&size=128` }} 
              style={styles.avatar} 
            />
            <View style={styles.headerText}>
              <Text style={[styles.userName, { color: isDarkMode ? '#fff' : '#1e293b' }]}>{displayName}</Text>
              <Text style={styles.userSub}>University Student • Nepal</Text>
            </View>
          </View>

          {/* SECTION: GENERAL */}
          <Text style={styles.sectionHeader}>GENERAL</Text>
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#0f172a' : '#fff' }]}>
            <SettingRow 
              icon="moon" 
              name="Dark Mode" 
              isSwitch 
              value={isDarkMode} 
              onToggle={toggleTheme} 
              color="#3b82f6"
            />
          </View>

          {/* SECTION: PREFERENCES & SECURITY */}
          <Text style={styles.sectionHeader}>PREFERENCES & SECURITY</Text>
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#0f172a' : '#fff' }]}>
            <SettingRow 
              icon="notifications" 
              name="Notifications" 
              subText="Alerts, Flood & Landslide updates" 
              onPress={() => navigation.navigate("NotificationSettings")} 
              color="#f59e0b"
            />
            <View style={styles.separator} />
            <SettingRow 
              icon="shield-checkmark" 
              name="Privacy" 
              subText="Location & Data usage" 
              onPress={() => navigation.navigate("PrivacySettings")} 
              color="#10b981"
            />
            <View style={styles.separator} />
            <SettingRow 
              icon="shield-lock-outline" 
              lib="MaterialCommunityIcons"
              name="Security" 
              subText="Responder Dashboard & Biometrics" 
              onPress={handlePoliceMode} 
              color="#ef4444"
            />
            <View style={styles.separator} />
            <SettingRow 
              icon="person" 
              name="Account" 
              subText="Personal Details & Research Bio" 
              onPress={() => navigation.navigate("AccountSettings")} 
              color="#6366f1"
            />
          </View>

          {/* SECTION: SUPPORT */}
          <Text style={styles.sectionHeader}>SUPPORT</Text>
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#0f172a' : '#fff' }]}>
            <SettingRow 
              icon="help-circle" 
              name="Help & FAQ" 
              subText="SARIMAX Engine info & support" 
              onPress={() => { /* Add Help Link */ }} 
              color="#8b5cf6"
            />
            <View style={styles.separator} />
            <SettingRow 
              icon="information-circle" 
              name="About Safe Nepal" 
              subText="v2.1.0 Beta" 
              onPress={() => navigation.navigate("About")} 
              color="#94a3b8"
            />
          </View>

          {/* LOGOUT BUTTON */}
          <TouchableOpacity style={styles.logoutAction} onPress={signOut}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Log Out from Device</Text>
          </TouchableOpacity>

          <Text style={styles.footerVersion}>Safe Nepal • 2026</Text>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2, 6, 23, 0.95)', justifyContent: 'center', alignItems: 'center', zIndex: 9999 },
  overlayText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  subOverlayText: { color: '#10b981', fontSize: 10, marginTop: 8, letterSpacing: 2, fontWeight: '800' },
  headerProfile: { flexDirection: 'row', alignItems: 'center', padding: 25, marginBottom: 5 },
  avatar: { width: 70, height: 70, borderRadius: 35, borderWidth: 2, borderColor: '#3b82f6' },
  headerText: { flex: 1, marginLeft: 18 },
  userName: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  userSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  sectionHeader: { fontSize: 11, fontWeight: '900', color: '#64748b', marginLeft: 25, marginTop: 25, marginBottom: 10, letterSpacing: 1.5, textTransform: 'uppercase' },
  card: { marginHorizontal: 16, borderRadius: 24, paddingHorizontal: 16, elevation: 1, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
  rowItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  rowLabel: { fontSize: 16, fontWeight: '700' },
  subLabelText: { fontSize: 12, color: '#64748b', marginTop: 2 },
  separator: { height: 1, backgroundColor: 'rgba(100, 116, 139, 0.1)', marginLeft: 58 },
  logoutAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 40, padding: 18, marginHorizontal: 30, borderRadius: 20, backgroundColor: 'rgba(239, 68, 68, 0.08)' },
  logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 16, marginLeft: 10 },
  footerVersion: { textAlign: 'center', color: '#64748b', fontSize: 11, marginTop: 20, opacity: 0.6 }
});