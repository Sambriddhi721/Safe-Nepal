import React, { useContext } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  Alert, SafeAreaView, ScrollView, StatusBar, Dimensions 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';

// Contexts
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";

const { width } = Dimensions.get('window');

export default function PoliceSettingsScreen({ navigation }) {
  // Added switchRole from AuthContext to handle the logic globally
  const { user, logout, switchRole } = useContext(AuthContext) || {};
  const { theme } = useContext(ThemeContext) || { theme: 'dark' };
  const isDarkMode = theme === 'dark';

  const handleRoleSwitch = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    
    // 1. Check for biometric capability
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    const performSwitch = async () => {
      if (switchRole) {
        // This updates the global Auth state so the app knows you are now a CITIZEN
        await switchRole('CITIZEN'); 
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.replace("HomeScreen"); 
      } else {
        navigation.replace("HomeScreen");
      }
    };

    if (!hasHardware || !isEnrolled) {
      Alert.alert(
        "Identity Verification", 
        "Proceed to Citizen Dashboard?", 
        [
          { text: "Cancel", style: "cancel" },
          { text: "Confirm", onPress: performSwitch }
        ]
      );
      return;
    }

    // 2. Authenticate before leaving tactical mode
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verify Identity to Deactivate Tactical Terminal',
      fallbackLabel: 'Use Passcode',
    });

    if (result.success) {
      performSwitch();
    }
  };

  const SettingItem = ({ icon, title, subtitle, onPress, color = "#3b82f6", isLast = false }) => (
    <TouchableOpacity 
      style={[
        styles.item, 
        { borderBottomWidth: isLast ? 0 : 1, borderBottomColor: isDarkMode ? '#1e293b' : '#f1f5f9' }
      ]} 
      onPress={() => {
        Haptics.selectionAsync();
        onPress?.();
      }}
    >
      <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.itemText}>
        <Text style={[styles.itemTitle, { color: isDarkMode ? '#f8fafc' : '#1e293b' }]}>{title}</Text>
        {subtitle && <Text style={styles.itemSub}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#64748b" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.goBack(); }}
          style={[styles.backBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}
        >
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? '#fff' : '#1e293b'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? '#fff' : '#1e293b' }]}>Settings</Text>
        <View style={{ width: 45 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* PROFILE CARD */}
        <View style={[styles.profileCard, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.name?.charAt(0) || 'P'}</Text>
          </View>
          <View>
            <Text style={[styles.profileName, { color: isDarkMode ? '#fff' : '#1e293b' }]}>{user?.name || "Officer"}</Text>
            <Text style={styles.profileRole}>Law Enforcement Division</Text>
          </View>
        </View>

        {/* SECTION: MODES */}
        <Text style={styles.sectionLabel}>INTERFACE MODES</Text>
        <View style={[styles.groupCard, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}>
          <SettingItem 
            icon="repeat" 
            title="Switch to Citizen Mode" 
            subtitle="Standard user dashboard" 
            color="#3b82f6"
            onPress={handleRoleSwitch} 
          />
          <SettingItem 
            icon="moon-outline" 
            title="Dark Mode" 
            subtitle="Current: System Default" 
            color="#a855f7" 
            isLast={true}
          />
        </View>

        {/* SECTION: SECURITY */}
        <Text style={styles.sectionLabel}>SECURITY PROTOCOL</Text>
        <View style={[styles.groupCard, { backgroundColor: isDarkMode ? '#1e293b' : '#fff' }]}>
          <SettingItem 
            icon="finger-print-outline" 
            title="Biometric Lock" 
            subtitle="Fingerprint/FaceID Active" 
            color="#10b981"
          />
          <SettingItem 
            icon="shield-checkmark-outline" 
            title="Encrypted Vault" 
            subtitle="End-to-end data protection" 
            color="#6366f1"
            isLast={true}
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: isDarkMode ? '#451a1a' : '#fee2e2' }]} 
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            logout();
          }}
        >
          <MaterialCommunityIcons name="logout-variant" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Terminate Session</Text>
        </TouchableOpacity>
        
        <Text style={styles.footerNote}>Terminal Build v2.0.4 • Secured Connection</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    paddingVertical: 15, 
    alignItems: 'center' 
  },
  backBtn: {
    padding: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  scroll: { padding: 20 },
  
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 24,
    marginBottom: 30,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  profileName: { fontSize: 18, fontWeight: '800' },
  profileRole: { color: '#94a3b8', fontSize: 13, fontWeight: '500' },

  sectionLabel: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#64748b', 
    marginLeft: 5, 
    marginBottom: 10,
    letterSpacing: 0.5 
  },
  groupCard: {
    borderRadius: 24,
    paddingHorizontal: 15,
    marginBottom: 25,
    overflow: 'hidden'
  },
  item: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingVertical: 18, 
  },
  iconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginRight: 15 
  },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700' },
  itemSub: { fontSize: 12, color: '#94a3b8', marginTop: 2, fontWeight: '500' },

  logoutBtn: { 
    flexDirection: 'row',
    padding: 18, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginTop: 10,
  },
  logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 15, marginLeft: 10 },
  footerNote: {
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 30,
    marginBottom: 20
  }
});