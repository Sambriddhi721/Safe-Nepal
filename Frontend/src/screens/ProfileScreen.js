import React, { useContext, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Alert, Switch, StatusBar, Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../context/AuthContext";

export default function ProfileScreen({ navigation }) {
  const { signOut } = useContext(AuthContext);
  
  // FUNCTIONAL STATES
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isNepali, setIsNepali] = useState(false);

  // THEME CONFIG (Matches Rain Nepal & Nepal Disaster Watch)
  const theme = {
    bg: isDarkMode ? "#0f172a" : "#F1F5F9",
    card: isDarkMode ? "#1e293b" : "#FFFFFF",
    text: isDarkMode ? "#FFFFFF" : "#0F172A",
    subText: isDarkMode ? "#94A3B8" : "#64748B",
    border: isDarkMode ? "#334155" : "#E2E8F0",
    accent: "#3b82f6"
  };

  const toggleLanguage = () => setIsNepali(!isNepali);

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isNepali ? "सेटिङहरू" : "Settings"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        
        {/* 1. USER PROFILE (Your Info Integrated) */}
        <TouchableOpacity style={[styles.profileRow, { borderBottomColor: theme.border }]}>
          <View style={styles.avatarContainer}>
             <Image 
                source={{ uri: 'https://ui-avatars.com/api/?name=Esprihya&background=random' }} 
                style={styles.profileImage} 
             />
          </View>
          <View style={styles.profileTextContainer}>
            <Text style={[styles.userName, { color: theme.text }]}>esprihya</Text>
            <Text style={[styles.editLabel, { color: theme.subText }]}>esprihyadawadi18@gmail.com</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.subText} />
        </TouchableOpacity>

        {/* 2. PRO BANNER */}
        <View style={[styles.upgradeCard, { backgroundColor: isDarkMode ? "#1e293b" : "#DBEAFE" }]}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.upgradeTitle, { color: isDarkMode ? "#fff" : "#1e40af" }]}>Upgrade Now - Go Pro</Text>
            <Text style={[styles.upgradeDesc, { color: isDarkMode ? "#94a3b8" : "#1e40af" }]}>Advanced alerts and detailed mapping.</Text>
          </View>
          <TouchableOpacity style={styles.upgradeBtn}>
            <Text style={styles.upgradeBtnText}>Upgrade</Text>
          </TouchableOpacity>
        </View>

        {/* 3. GENERAL SETTINGS */}
        <Text style={styles.sectionTitle}>{isNepali ? "सामान्य" : "General"}</Text>
        <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
          <View style={styles.settingRow}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}><Ionicons name="moon-outline" size={20} color={theme.text} /></View>
              <Text style={[styles.rowLabel, { color: theme.text }]}>{isNepali ? "डार्क मोड" : "Dark Mode"}</Text>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={setIsDarkMode}
              trackColor={{ false: "#94a3b8", true: theme.accent }}
            />
          </View>
          
          <TouchableOpacity onPress={toggleLanguage} style={[styles.settingRow, { borderTopWidth: 1, borderTopColor: theme.border }]}>
            <View style={styles.rowLeft}>
              <View style={styles.iconBox}><Ionicons name="language-outline" size={20} color={theme.text} /></View>
              <Text style={[styles.rowLabel, { color: theme.text }]}>{isNepali ? "भाषा" : "Language"}</Text>
            </View>
            <Text style={styles.statusText}>{isNepali ? "नेपाली" : "English"}</Text>
          </TouchableOpacity>
        </View>

        {/* 4. NOTIFICATION & ABOUT (Navigation Enabled) */}
        <Text style={styles.sectionTitle}>{isNepali ? "सेटिङहरू" : "Settings"}</Text>
        <View style={[styles.settingsCard, { backgroundColor: theme.card }]}>
          <OptionRow 
            theme={theme} icon="notifications-outline" 
            label={isNepali ? "सूचनाहरू" : "Notification"} 
            onPress={() => navigation.navigate("NotificationSettings")} 
          />
          <OptionRow theme={theme} icon="shield-outline" label="Privacy" />
          <OptionRow 
            theme={theme} icon="information-circle-outline" 
            label={isNepali ? "हाम्रो बारेमा" : "About"} 
            onPress={() => navigation.navigate("AboutScreen")}
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity 
          style={styles.logoutBtn} 
          onPress={() => Alert.alert("Log Out", "Are you sure?", [{text: "No"}, {text: "Yes", onPress: signOut}])}
        >
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={styles.footerContainer}>
           <Text style={[styles.versionText, { color: theme.subText }]}>Safe Nepal v1.3.6</Text>
           <Text style={[styles.madeByText, { color: theme.subText }]}>Made with ❤️ for Nepal</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Sub-Component for Rows
function OptionRow({ theme, icon, label, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.settingRow, { borderBottomWidth: 0.5, borderBottomColor: theme.border }]}>
      <View style={styles.rowLeft}>
        <View style={styles.iconBox}><Ionicons name={icon} size={20} color={theme.text} /></View>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.subText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingBottom: 20, paddingHorizontal: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  profileRow: { flexDirection: 'row', alignItems: 'center', padding: 20, marginHorizontal: 16, marginBottom: 20, borderBottomWidth: 1 },
  avatarContainer: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFE5D9', overflow: 'hidden' },
  profileImage: { width: '100%', height: '100%' },
  profileTextContainer: { flex: 1, marginLeft: 15 },
  userName: { fontSize: 18, fontWeight: '800' },
  editLabel: { fontSize: 13, marginTop: 2 },
  upgradeCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 16, marginHorizontal: 16, marginBottom: 25, borderWidth: 1, borderColor: '#334155' },
  upgradeTitle: { fontSize: 16, fontWeight: '800' },
  upgradeDesc: { fontSize: 12, marginTop: 4, width: '85%' },
  upgradeBtn: { backgroundColor: '#3b82f6', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 10 },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginLeft: 20, marginBottom: 10, color: '#64748b', textTransform: 'uppercase' },
  settingsCard: { marginHorizontal: 16, borderRadius: 16, overflow: 'hidden' },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 35, alignItems: 'center' },
  rowLabel: { fontSize: 15, fontWeight: '500', marginLeft: 5 },
  statusText: { color: '#3b82f6', fontWeight: '600' },
  logoutBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', marginHorizontal: 16, marginTop: 30, padding: 18, borderRadius: 12, alignItems: 'center' },
  logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 16 },
  footerContainer: { marginTop: 30, alignItems: 'center' },
  versionText: { fontSize: 12, fontWeight: '600' },
  madeByText: { fontSize: 11, marginTop: 4 }
});