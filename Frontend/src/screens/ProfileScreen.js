import React, { useContext } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Alert, Switch, Image, StatusBar 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext"; 
import { ThemeContext } from "../context/ThemeContext"; // Import Global Theme

export default function ProfileScreen({ navigation }) {
  // 1. Get Auth Context (with crash protection)
  const auth = useContext(AuthContext) || {};
  const { signOut } = auth;

  // 2. Get Global Theme Context
  const { isDarkMode, toggleTheme, colors } = useContext(ThemeContext);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Log Out", 
        style: "destructive", 
        onPress: () => signOut ? signOut() : Alert.alert("Note", "Auth system not connected yet.") 
      }
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Dynamic StatusBar based on theme */}
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
        backgroundColor={colors.background}
      />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* PROFILE HEADER - Featuring Esprihya Dawadi */}
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: 'https://ui-avatars.com/api/?name=Esprihya+Dawadi&background=3b82f6&color=fff' }} 
            style={styles.avatar} 
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>Esprihya Dawadi</Text>
            <Text style={[styles.userEmail, { color: colors.subText }]}>Personal Info, Password</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate("AccountSettings")}>
            <Ionicons name="chevron-forward" size={24} color={colors.subText} />
          </TouchableOpacity>
        </View>

        {/* GENERAL SECTION */}
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>General</Text>
        <View style={[styles.cardGroup, { backgroundColor: colors.card }]}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]}>
                <Ionicons name={isDarkMode ? "moon" : "sunny"} size={20} color={colors.accent} />
              </View>
              <Text style={[styles.rowText, { color: colors.text }]}>Dark Mode</Text>
            </View>
            <Switch 
              value={isDarkMode} 
              onValueChange={toggleTheme} // Calls the global toggle
              trackColor={{ false: "#cbd5e1", true: colors.success }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* PREFERENCES & SECURITY */}
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>Preferences & Security</Text>
        <View style={[styles.cardGroup, { backgroundColor: colors.card }]}>
          <SettingItem 
            colors={colors} icon="notifications" label="Notification" sub="Alerts, Sounds"
            onPress={() => navigation.navigate("NotificationSettings")} 
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingItem 
            colors={colors} icon="shield-checkmark" label="Privacy" sub="Location, Data Sharing"
            onPress={() => navigation.navigate("PrivacySettings")} 
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          
          {/* SECURITY - Linked to your SecuritySettings.js */}
          <SettingItem 
            colors={colors} icon="lock-closed" label="Security" sub="Two-Factor, Login Activity"
            onPress={() => navigation.navigate("SecuritySettings")} 
          />
          
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingItem 
            colors={colors} icon="person" label="Account" sub="Linked Accounts, Export"
            onPress={() => navigation.navigate("AccountSettings")} 
          />
        </View>

        {/* SUPPORT */}
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>Support</Text>
        <View style={[styles.cardGroup, { backgroundColor: colors.card }]}>
          <SettingItem 
            colors={colors} icon="help-circle" label="Help & FAQ" sub="Support Center"
            onPress={() => Alert.alert("Support", "Contact: support@safenepal.com")} 
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <SettingItem 
            colors={colors} icon="information-circle" label="About" sub="App Version 1.3.6"
            onPress={() => navigation.navigate("About")} 
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: colors.card }]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>Log Out</Text>
        </TouchableOpacity>

        <Text style={[styles.footerVersion, { color: colors.subText }]}>v1.3.6 • Safe Nepal</Text>
      </ScrollView>
    </View>
  );
}

// Sub-component for individual rows
function SettingItem({ colors, icon, label, sub, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
          <Ionicons name={icon} size={20} color={colors.accent} />
        </View>
        <View>
          <Text style={[styles.rowText, { color: colors.text }]}>{label}</Text>
          <Text style={[styles.rowSubText, { color: colors.subText }]}>{sub}</Text>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.subText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 60, paddingBottom: 40 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, paddingHorizontal: 4 },
  avatar: { width: 60, height: 60, borderRadius: 30, marginRight: 15 },
  profileInfo: { flex: 1 },
  userName: { fontSize: 22, fontWeight: 'bold' },
  userEmail: { fontSize: 14, marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '800', marginBottom: 10, marginTop: 22, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1 },
  cardGroup: { borderRadius: 20, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconContainer: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  rowText: { fontSize: 16, fontWeight: '600' },
  rowSubText: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginLeft: 70 },
  logoutBtn: { marginTop: 30, padding: 16, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logoutText: { fontWeight: "bold", fontSize: 16, marginLeft: 10 },
  footerVersion: { textAlign: 'center', marginTop: 20, fontSize: 12, opacity: 0.6 }
});