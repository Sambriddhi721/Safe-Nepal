import React, { useContext } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  Switch, Image, StatusBar, Platform 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Entypo } from "@expo/vector-icons"; 
import { AuthContext } from "../../context/AuthContext"; 
import { ThemeContext } from "../../context/ThemeContext"; 

export default function ProfileScreen({ navigation }) {
  const { signOut, user } = useContext(AuthContext) || {}; // Added 'user' to pull dynamic data
  const { theme, toggleTheme } = useContext(ThemeContext) || {};
  const isDarkMode = theme === 'dark';

  // Use the name from context, fallback to the default if not found
  const displayName = user?.full_name || "Sambriddhi Dawadi";

  const SettingRow = ({ icon, label, subLabel, onPress, borderNone }) => (
    <TouchableOpacity 
      style={[styles.rowItem, !borderNone && { borderBottomWidth: 1, borderBottomColor: isDarkMode ? '#1e293b' : '#f1f5f9' }]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, { backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.1)' : '#f8fafc' }]}>
          <Ionicons name={icon} size={22} color="#3b82f6" />
        </View>
        <View>
          <Text style={[styles.rowLabel, { color: isDarkMode ? '#fff' : '#000' }]}>{label}</Text>
          {subLabel && <Text style={styles.subLabelText}>{subLabel}</Text>}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#64748b" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.mainWrapper, { backgroundColor: isDarkMode ? '#020617' : '#f8fafc' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          
          {/* HEADER NAVIGATION TO ACCOUNT SETTINGS */}
          <TouchableOpacity 
            style={styles.headerProfile}
            onPress={() => navigation.navigate("AccountSettings")}
          >
            <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff&size=128` }} 
              style={styles.avatar} 
            />
            <View style={styles.headerText}>
              <Text style={[styles.userName, { color: isDarkMode ? '#fff' : '#000' }]}>{displayName}</Text>
              <Text style={styles.userSub}>View Profile & ID</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
          </TouchableOpacity>

          {/* GENERAL SECTION */}
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

          {/* PREFERENCES & SECURITY */}
          <Text style={styles.sectionHeader}>PREFERENCES & SECURITY</Text>
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#0f172a' : '#fff' }]}>
            <SettingRow 
              icon="notifications" 
              label="Notification" 
              subLabel="Alerts, Sounds" 
              onPress={() => navigation.navigate("Notification")} 
            />
            <SettingRow 
              icon="shield-checkmark" 
              label="Privacy" 
              subLabel="Location, Data Sharing" 
              onPress={() => navigation.navigate("Privacy")} 
            />
            <SettingRow 
              icon="lock-closed" 
              label="Security" 
              subLabel="Two-Factor, Login Activity" 
              borderNone 
              onPress={() => navigation.navigate("Security")} 
            />
          </View>

          {/* SUPPORT */}
          <Text style={styles.sectionHeader}>SUPPORT</Text>
          <View style={[styles.card, { backgroundColor: isDarkMode ? '#0f172a' : '#fff' }]}>
            <SettingRow 
              icon="help-circle" 
              label="Help & FAQ" 
              subLabel="Support Center" 
              onPress={() => navigation.navigate("Help")} // ✅ Linked to Help Screen
            />
            <SettingRow 
              icon="information-circle" 
              label="About" 
              subLabel="v2.1.0 • Production Beta" 
              borderNone 
              onPress={() => navigation.navigate("About")} 
            />
          </View>

          {/* BRANDED SOCIALS & LOGOUT */}
          <View style={styles.footerContainer}>
            <View style={styles.socialRow}>
               <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#1877F2' }]}>
                  <Ionicons name="logo-facebook" size={20} color="#fff" />
               </TouchableOpacity>
               <TouchableOpacity style={[styles.socialBtn, { backgroundColor: '#E1306C' }]}>
                  <Entypo name="instagram" size={18} color="#fff" />
               </TouchableOpacity>
            </View>
            
            <TouchableOpacity style={styles.logoutAction} onPress={signOut}>
              <Ionicons name="log-out-outline" size={22} color="#ef4444" />
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainWrapper: { flex: 1 },
  headerProfile: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 25, 
    marginTop: 10 
  },
  avatar: { width: 60, height: 60, borderRadius: 30 },
  headerText: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 20, fontWeight: 'bold' },
  userSub: { fontSize: 13, color: '#64748b', marginTop: 2 },
  sectionHeader: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#64748b', 
    marginLeft: 25, 
    marginTop: 25, 
    marginBottom: 10,
    letterSpacing: 1
  },
  card: { 
    marginHorizontal: 15, 
    borderRadius: 20, 
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2
  },
  rowItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 16 
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  subLabelText: { fontSize: 12, color: '#64748b', marginTop: 2 },
  footerContainer: { alignItems: 'center', marginTop: 50 },
  socialRow: { flexDirection: 'row', marginBottom: 25 },
  socialBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginHorizontal: 10 
  },
  logoutAction: { flexDirection: 'row', alignItems: 'center' },
  logoutText: { 
    color: '#ef4444', 
    fontWeight: 'bold', 
    fontSize: 16, 
    marginLeft: 10 
  }
});