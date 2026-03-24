import React, { useContext, useState } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Alert, Switch, Image, StatusBar, Modal, ActivityIndicator 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext"; 
import { ThemeContext } from "../../context/ThemeContext"; 

export default function ProfileScreen({ navigation }) {
  // Destructure context with fallbacks
  const { signOut, user, role, switchRole } = useContext(AuthContext) || {};
  const { theme, toggleTheme } = useContext(ThemeContext) || {};
  const isDarkMode = theme === 'dark';

  const [isSwitching, setIsSwitching] = useState(false);

  // Check current role from AuthContext
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

            // 1.5 second delay for a smooth visual transition
            setTimeout(() => {
              if (switchRole) {
                switchRole(); // This updates the role in AuthContext
              }
              
              setIsSwitching(false);

              // ✅ THE FIX: Reset the navigation stack to 'Home'
              // This forces the AppNavigator to re-evaluate the 'role' 
              // and show the correct Dashboard.
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
      
      {/* TRANSITION OVERLAY */}
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
          
          <TouchableOpacity style={styles.userInfoRow} onPress={() => navigation.navigate("AccountSettings")}>
            <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=3b82f6&color=fff` }} 
              style={styles.avatarCircle} 
            />
            <View style={styles.nameContainer}>
              <Text style={[styles.userName, { color: isDarkMode ? '#fff' : '#000' }]}>
                {user?.full_name || "Sambriddhi Dawadi"}
              </Text>
              <View style={styles.ratingRow}>
                {[1, 2, 3, 4, 5].map((s) => (
                  <FontAwesome key={s} name="star" size={12} color="#f59e0b" style={{ marginRight: 2 }} />
                ))}
                <Text style={[styles.ratingText, { color: '#64748b' }]}>4.82 (112)</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          {/* THEME SETTINGS */}
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

          {/* APP PREFERENCES */}
          <Text style={styles.sectionTitle}>PREFERENCES & SECURITY</Text>
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }]}>
            <MenuOption isDarkMode={isDarkMode} icon="notifications" label="Notification" subLabel="Alerts, Sounds" onPress={() => navigation.navigate("NotificationSettings")} />
            <MenuOption isDarkMode={isDarkMode} icon="shield-checkmark" label="Privacy" subLabel="Location, Data Sharing" onPress={() => navigation.navigate("PrivacySettings")} />
            <MenuOption isDarkMode={isDarkMode} icon="lock-closed" label="Security" subLabel="Two-Factor, Login Activity" onPress={() => navigation.navigate("SecuritySettings")} />
            <MenuOption isDarkMode={isDarkMode} icon="person" label="Account" subLabel="Linked Accounts, Export" borderNone onPress={() => navigation.navigate("AccountSettings")} />
          </View>

          {/* SUPPORT */}
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }]}>
            <MenuOption isDarkMode={isDarkMode} icon="help-circle" label="Help & FAQ" subLabel="Support Center" onPress={() => Alert.alert("Support", "Coming soon!")} />
            <MenuOption isDarkMode={isDarkMode} icon="information-circle" label="About" subLabel="App Version 1.3.6" borderNone onPress={() => navigation.navigate("About")} />
          </View>

          {/* LOGOUT */}
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
             <Text style={[styles.versionText, { color: '#64748b' }]}>v1.3.6 • Safe Nepal</Text>
          </View>
        </ScrollView>

        {/* FLOATING ROLE SWITCH BUTTON */}
        <View style={[styles.bottomButtonContainer, { backgroundColor: isDarkMode ? '#020617' : '#f5f5f5' }]}>
            <TouchableOpacity style={styles.roleModeBtn} onPress={handleToggleMode} activeOpacity={0.8}>
                <Text style={styles.roleModeText}>
                    {isCurrentlyResponder ? "Switch to Citizen mode" : "Switch to Police mode"}
                </Text>
            </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

// HELPER COMPONENT FOR MENU ROWS
function MenuOption({ icon, label, subLabel, borderNone, onPress, isDarkMode }) {
  return (
    <TouchableOpacity 
        style={[styles.menuRow, !borderNone && { borderBottomWidth: 0.5, borderBottomColor: isDarkMode ? '#334155' : '#e2e8f0' }]} 
        onPress={onPress}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, { backgroundColor: isDarkMode ? '#0f172a' : '#f1f5f9' }]}>
            <Ionicons name={icon} size={20} color="#3b82f6" />
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
  profileHeader: { paddingHorizontal: 20, paddingTop: 10, marginBottom: 15 },
  closeBtn: { paddingVertical: 10 },
  avatarCircle: { width: 55, height: 55, borderRadius: 28 },
  userInfoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  nameContainer: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 20, fontWeight: '700' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  ratingText: { fontSize: 13, marginLeft: 5 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#64748b', marginLeft: 25, marginTop: 20, marginBottom: 8, letterSpacing: 1 },
  card: { marginHorizontal: 15, borderRadius: 20, paddingHorizontal: 15, overflow: 'hidden' },
  rowItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18 },
  menuRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  subLabelText: { fontSize: 12, color: '#64748b', marginTop: 2 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginHorizontal: 15, marginTop: 25, paddingVertical: 18, borderRadius: 20 },
  logoutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 },
  footerContainer: { alignItems: 'center', marginTop: 40, paddingBottom: 20 },
  socialRow: { flexDirection: 'row', marginBottom: 15 },
  socialIcon: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginHorizontal: 10 },
  versionText: { fontSize: 12, opacity: 0.5 },
  bottomButtonContainer: { position: 'absolute', bottom: 0, width: '100%', paddingHorizontal: 20, paddingBottom: 25, paddingTop: 10 },
  roleModeBtn: { 
    backgroundColor: '#c4ff37', 
    height: 60, 
    borderRadius: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8 
  },
  roleModeText: { color: '#000', fontSize: 18, fontWeight: 'bold' },
  overlayContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
  overlayContent: { alignItems: 'center', padding: 20 },
  overlayText: { color: '#fff', fontSize: 20, fontWeight: '700', marginTop: 20, textAlign: 'center' }
});