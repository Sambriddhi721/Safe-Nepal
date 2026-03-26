import React, { useContext, useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Switch, Image, StatusBar, ActivityIndicator, Alert 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons"; 

// NEW IMPORTS FOR BIOMETRICS & VIBRATION
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';

import { AuthContext } from "../../context/AuthContext"; 
import { ThemeContext } from "../../context/ThemeContext"; 

export default function ProfileScreen({ navigation }) {
  const { signOut, user } = useContext(AuthContext) || {};
  const { theme, toggleTheme } = useContext(ThemeContext) || {};
  const isDarkMode = theme === 'dark';
  
  // State for the hold-to-switch animation
  const [isSwitching, setIsSwitching] = useState(false);

  const displayName = user?.full_name || "User Name";

  // --- BIOMETRIC SWITCH LOGIC ---
  const handleSwitchMode = async () => {
    // 1. Give physical vibration feedback that the 2s hold is complete
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // 2. Check if hardware supports biometrics
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (hasHardware && isEnrolled) {
      // 3. Trigger Biometric Scanner
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to Enter Police Mode',
        fallbackLabel: 'Use Passcode',
      });

      if (!result.success) {
        Alert.alert("Authentication Failed", "Access to Responder Tools denied.");
        return; 
      }
    }

    // 4. If successful (or biometrics not available), show overlay and navigate
    setIsSwitching(true);
    setTimeout(() => {
      setIsSwitching(false);
      navigation.navigate("ResponderDashboard"); 
    }, 2000); 
  };

  return (
    <View style={[styles.mainWrapper, { backgroundColor: isDarkMode ? '#020617' : '#f8fafc' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* SWITCHING OVERLAY */}
      {isSwitching && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.overlayText}>Switching to Police Mode...</Text>
          <Text style={styles.subOverlayText}>SECURE BIOMETRIC AUTHENTICATION ACTIVE</Text>
        </View>
      )}

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          <View style={styles.headerProfile}>
            <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff` }} 
              style={styles.avatar} 
            />
            <View style={styles.headerText}>
              <Text style={[styles.userName, { color: isDarkMode ? '#fff' : '#000' }]}>{displayName}</Text>
              <Text style={styles.userSub}>Citizen Account</Text>
            </View>
          </View>

          {/* POLICE MODE SWITCH */}
          <Text style={styles.sectionHeader}>ACCOUNT MODE</Text>
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#0f172a' : '#fff' }]}>
            <TouchableOpacity 
              style={styles.rowItem}
              delayLongPress={2000} // 2 Seconds
              onLongPress={handleSwitchMode}
              activeOpacity={0.6}
            >
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <Ionicons name="shield-checkmark" size={22} color="#10b981" />
                </View>
                <View>
                  <Text style={[styles.rowLabel, { color: isDarkMode ? '#fff' : '#000' }]}>Police Dashboard</Text>
                  <Text style={styles.subLabelText}>Hold 2s + Biometrics to switch</Text>
                </View>
              </View>
              <Ionicons name="finger-print" size={20} color="#10b981" />
            </TouchableOpacity>
          </View>

          {/* GENERAL SETTINGS */}
          <Text style={styles.sectionHeader}>GENERAL</Text>
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#0f172a' : '#fff' }]}>
            <View style={styles.rowItem}>
              <View style={styles.rowLeft}>
                <View style={[styles.iconBox, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#f8fafc' }]}>
                  <Ionicons name="moon" size={22} color="#3b82f6" />
                </View>
                <Text style={[styles.rowLabel, { color: isDarkMode ? '#fff' : '#000' }]}>Dark Mode</Text>
              </View>
              <Switch 
                value={isDarkMode} 
                onValueChange={toggleTheme} 
                trackColor={{ false: "#334155", true: "#10b981" }}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.logoutAction} onPress={signOut}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  overlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(0,0,0,0.95)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    zIndex: 9999 
  },
  overlayText: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  subOverlayText: { color: '#10b981', fontSize: 10, marginTop: 10, letterSpacing: 2, fontWeight: '700' },
  headerProfile: { flexDirection: 'row', alignItems: 'center', padding: 25 },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  headerText: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 20, fontWeight: 'bold' },
  userSub: { fontSize: 13, color: '#64748b' },
  sectionHeader: { fontSize: 11, fontWeight: '800', color: '#64748b', marginLeft: 25, marginTop: 25, marginBottom: 10, letterSpacing: 1 },
  card: { marginHorizontal: 15, borderRadius: 20, paddingHorizontal: 15, elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  rowItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  subLabelText: { fontSize: 12, color: '#64748b' },
  logoutAction: { flexDirection: 'row', alignItems: 'center', alignSelf: 'center', marginTop: 40 },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});