import React, { useContext, useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Alert, Switch, Image, StatusBar, Modal, ActivityIndicator 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons"; 
import { AuthContext } from "../../context/AuthContext"; 
import { ThemeContext } from "../../context/ThemeContext"; 

export default function ProfileScreen({ navigation }) {
  const { signOut, user, role, switchRole } = useContext(AuthContext) || {};
  const { theme, toggleTheme } = useContext(ThemeContext) || {};
  const isDarkMode = theme === 'dark';

  const [isSwitching, setIsSwitching] = useState(false);
  const isCurrentlyResponder = role === "RESPONDER";

  const handleToggleMode = () => {
    const targetMode = isCurrentlyResponder ? "Citizen" : "Police/Responder";
    
    Alert.alert(
      "Mode Switch",
      `Are you sure you want to switch to ${targetMode} mode?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: () => {
            setIsSwitching(true);
            setTimeout(() => {
              if (switchRole) {
                switchRole();
              }
              setIsSwitching(false);
              // Navigation reset to refresh the Home dashboard for the new role
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            }, 1500);
          } 
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout", 
      "Are you sure you want to log out?", 
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: () => signOut ? signOut() : console.log("Signout not available") 
        }
      ]
    );
  };

  return (
    <View style={[styles.mainWrapper, { backgroundColor: isDarkMode ? '#020617' : '#f5f5f5' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* MODE SWITCHING OVERLAY */}
      <Modal transparent={true} visible={isSwitching} animationType="fade">
        <View style={styles.overlayContainer}>
           <View style={styles.overlayContent}>
              <ActivityIndicator size="large" color="#c4ff37" />
              <Text style={styles.overlayText}>
                 {isCurrentlyResponder ? "Entering Citizen Mode..." : "Entering Police Mode..."}
              </Text>
           </View>
        </View>
      </Modal>

      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {/* HEADER SECTION */}
        <View style={styles.profileHeader}>
          <TouchableOpacity 
            onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate("Home")} 
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={28} color={isDarkMode ? '#fff' : '#000'} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.userInfoRow, { backgroundColor: isDarkMode ? '#1e293b' : '#fff', padding: 15, borderRadius: 20 }]} 
            onPress={() => navigation.navigate("AccountSettings")}
          >
            <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=3b82f6&color=fff` }} 
              style={styles.avatarCircle} 
            />
            <View style={styles.nameContainer}>
              <Text style={[styles.userName, { color: isDarkMode ? '#fff' : '#000' }]}>
                {user?.full_name || "Sambriddhi Dawadi"}
              </Text>
              <Text style={styles.idSubText}>Student ID: 2331203</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>
          
          <Text style={styles.sectionTitle}>GENERAL</Text>
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }]}>
             <View style={styles.rowItem}>
                <View style={styles.rowLeft}>
                    <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }]}>
                        <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color="#3b82f6" />
                    </View>
                    <Text style={[styles.rowLabel, { color: isDarkMode ? '#fff' : '#000' }]}>Dark Mode</Text>
                </View>
                <Switch 
                  value={isDarkMode} 
                  onValueChange={toggleTheme} 
                  trackColor={{ false: "#334155", true: "#10b981" }} 
                  thumbColor={isDarkMode ? "#fff" : "#f4f3f4"}
                />
             </View>
          </View>

          <Text style={styles.sectionTitle}>SECURITY & SAFETY</Text>
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }]}>
            <MenuOption 
              isDarkMode={isDarkMode} 
              icon="shield-lock-outline" 
              lib="MaterialCommunityIcons"
              label="Password & Security" 
              subLabel="2FA, Login Activity" 
              onPress={() => navigation.navigate("SecuritySettings")} 
            />
            <MenuOption 
              isDarkMode={isDarkMode} 
              icon="users" 
              lib="Feather"
              label="Emergency Contacts" 
              subLabel="Trusted SOS Responders" 
              onPress={() => navigation.navigate("EmergencyContactScreen")} 
            />
            <MenuOption 
              isDarkMode={isDarkMode} 
              icon="person-outline" 
              label="Personal Details" 
              subLabel="Name, Email, University ID" 
              borderNone 
              onPress={() => navigation.navigate("AccountSettings")} 
            />
          </View>

          <Text style={styles.sectionTitle}>APP PREFERENCES</Text>
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }]}>
            <MenuOption isDarkMode={isDarkMode} icon="notifications-outline" label="Notification" subLabel="Alerts, Sounds" onPress={() => {}} />
            <MenuOption isDarkMode={isDarkMode} icon="help-circle-outline" label="Help & FAQ" subLabel="Support Center" onPress={() => Alert.alert("Support", "Connecting to Safe Nepal support...")} />
            <MenuOption isDarkMode={isDarkMode} icon="information-circle-outline" label="About" subLabel="v1.4.2 • Safe Nepal Beta" borderNone onPress={() => {}} />
          </View>

          <TouchableOpacity style={[styles.logoutBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }]} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#ef4444" style={{ marginRight: 10 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          <View style={styles.footerContainer}>
             <View style={styles.socialRow}>
                <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#3b82f6' }]}>
                  <Ionicons name="logo-facebook" size={24} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={[styles.socialIcon, { backgroundColor: '#e1306c' }]}>
                  <Ionicons name="logo-instagram" size={24} color="#fff" />
                </TouchableOpacity>
             </View>
             <Text style={[styles.versionText, { color: '#64748b' }]}>Safe Nepal Project • 2026</Text>
          </View>
        </ScrollView>

        <View style={[styles.bottomButtonContainer, { backgroundColor: isDarkMode ? '#020617' : '#f5f5f5' }]}>
            <TouchableOpacity 
              style={[styles.roleModeBtn, { backgroundColor: isCurrentlyResponder ? '#3b82f6' : '#c4ff37' }]} 
              onPress={handleToggleMode} 
              activeOpacity={0.8}
            >
                <Text style={[styles.roleModeText, { color: isCurrentlyResponder ? '#fff' : '#000' }]}>
                    {isCurrentlyResponder ? "Switch to Citizen mode" : "Switch to Police mode"}
                </Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function MenuOption({ icon, label, subLabel, borderNone, onPress, isDarkMode, lib = "Ionicons" }) {
  const IconLib = lib === "MaterialCommunityIcons" ? MaterialCommunityIcons : lib === "Feather" ? Feather : Ionicons;
  
  return (
    <TouchableOpacity 
        style={[styles.menuRow, !borderNone && { borderBottomWidth: 0.5, borderBottomColor: isDarkMode ? '#334155' : '#e2e8f0' }]} 
        onPress={onPress}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }]}>
            <IconLib name={icon} size={20} color="#3b82f6" />
        </View>
        <View>
            <Text style={[styles.rowLabel, { color: isDarkMode ? '#fff' : '#000' }]}>{label}</Text>
            {subLabel && <Text style={styles.subLabelText}>{subLabel}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#475569" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  profileHeader: { paddingHorizontal: 15, paddingTop: 10, marginBottom: 15 },
  closeBtn: { paddingVertical: 10, marginBottom: 5 },
  avatarCircle: { width: 55, height: 55, borderRadius: 28 },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  nameContainer: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 18, fontWeight: '700' },
  idSubText: { fontSize: 12, color: '#64748b', marginTop: 3 },
  sectionTitle: { fontSize: 11, fontWeight: '800', color: '#64748b', marginLeft: 25, marginTop: 25, marginBottom: 10, letterSpacing: 1.5, textTransform: 'uppercase' },
  card: { marginHorizontal: 15, borderRadius: 24, paddingHorizontal: 15, overflow: 'hidden' },
  rowItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  rowLabel: { fontSize: 15, fontWeight: '700' },
  subLabelText: { fontSize: 11, color: '#64748b', marginTop: 3 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 15, marginTop: 30, paddingVertical: 18, borderRadius: 22 },
  logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 16 },
  footerContainer: { alignItems: 'center', marginTop: 40, paddingBottom: 150 },
  socialRow: { flexDirection: 'row', marginBottom: 15 },
  socialIcon: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 },
  versionText: { fontSize: 11, fontWeight: '600' },
  bottomButtonContainer: { position: 'absolute', bottom: 0, width: '100%', paddingHorizontal: 20, paddingBottom: 30, paddingTop: 15 },
  roleModeBtn: { height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 6 },
  roleModeText: { fontSize: 17, fontWeight: '900', letterSpacing: 0.5 },
  overlayContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  overlayContent: { alignItems: 'center', padding: 20 },
  overlayText: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 25, textAlign: 'center' }
});