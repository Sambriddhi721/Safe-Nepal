import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  Platform, 
  StatusBar 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext'; 

export default function AccountSettings({ navigation }) {
  const { colors } = useContext(ThemeContext);
  const { user, signOut } = useContext(AuthContext); 

  // Reusable row component for the settings list
  const SettingRow = ({ icon, label, subLabel, onPress, iconLib = "Ionicons", color }) => {
    const IconLib = 
      iconLib === "MaterialCommunityIcons" ? MaterialCommunityIcons : 
      iconLib === "Feather" ? Feather : 
      Ionicons;

    return (
      <TouchableOpacity 
        style={[styles.row, { borderBottomColor: colors.border }]} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.rowLeft}>
          <View style={[styles.iconContainer, { backgroundColor: colors.card }]}>
            <IconLib name={icon} size={20} color={color || colors.accent} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
            {subLabel && <Text style={[styles.rowSubLabel, { color: colors.subText }]}>{subLabel}</Text>}
          </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.subText} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Account Center</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollPadding}>
        
        {/* PROFILE CARD */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatarLarge, { backgroundColor: colors.card, borderColor: colors.accent }]}>
              <Text style={[styles.avatarText, { color: colors.accent }]}>
                {user?.full_name?.charAt(0) || 'S'}
              </Text>
            </View>
            <TouchableOpacity style={styles.cameraBadge}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.nameText, { color: colors.text }]}>{user?.full_name || 'Sambriddhi Dawadi'}</Text>
          <Text style={[styles.idText, { color: colors.subText }]}>Student ID: 2331203</Text>
        </View>

        {/* ACCOUNT SETTINGS GROUP */}
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={[styles.group, { backgroundColor: colors.card }]}>
          <SettingRow 
            icon="person-outline" 
            label="Personal Details" 
            subLabel="Name, email, and contact info"
            onPress={() => navigation.navigate('EditProfile')} 
          />
          <SettingRow 
            icon="shield-lock-outline" 
            iconLib="MaterialCommunityIcons"
            label="Password & Security" 
            subLabel="Login activity and 2FA"
            onPress={() => navigation.navigate('SecuritySettings')} 
          />
          <SettingRow 
            icon="users" 
            iconLib="Feather"
            label="Emergency Contacts" 
            subLabel="Manage your SOS responders"
            onPress={() => navigation.navigate('EmergencyContactScreen')} 
          />
        </View>

        {/* PREFERENCES GROUP */}
        <Text style={styles.sectionTitle}>App Preferences</Text>
        <View style={[styles.group, { backgroundColor: colors.card }]}>
          <SettingRow 
            icon="notifications-outline" 
            label="Notifications" 
            subLabel="Alert sounds and push settings"
            onPress={() => {}} 
          />
          <SettingRow 
            icon="moon-outline" 
            label="Appearance" 
            subLabel="Dark mode and themes"
            onPress={() => {}} 
          />
        </View>

        {/* LOGOUT */}
        <TouchableOpacity style={styles.logoutBtn} onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color="#ff4757" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Safe Nepal v1.4.2 (Beta)</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingBottom: 15 
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  scrollPadding: { paddingBottom: 50 },
  
  profileSection: { alignItems: 'center', marginVertical: 30 },
  avatarWrapper: { position: 'relative' },
  avatarLarge: { 
    width: 100, 
    height: 100, 
    borderRadius: 50, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2 
  },
  avatarText: { fontSize: 36, fontWeight: 'bold' },
  cameraBadge: { 
    position: 'absolute', 
    bottom: 0, 
    right: 0, 
    backgroundColor: '#3b82f6', 
    width: 30, 
    height: 30, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 3, 
    borderColor: '#000' 
  },
  nameText: { fontSize: 22, fontWeight: 'bold', marginTop: 15 },
  idText: { fontSize: 13, marginTop: 4, letterSpacing: 1 },

  sectionTitle: { 
    fontSize: 12, 
    fontWeight: '800', 
    color: '#64748b', 
    marginLeft: 20, 
    marginBottom: 10, 
    marginTop: 25, 
    textTransform: 'uppercase' 
  },
  group: { 
    marginHorizontal: 16, 
    borderRadius: 20, 
    overflow: 'hidden' 
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderBottomWidth: 1 
  },
  rowLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1 
  },
  iconContainer: { 
    width: 40, 
    height: 40, 
    borderRadius: 12, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  textContainer: { marginLeft: 15 },
  rowLabel: { fontSize: 15, fontWeight: '600' },
  rowSubLabel: { fontSize: 12, marginTop: 2 },

  logoutBtn: { 
    flexDirection: 'row', 
    marginHorizontal: 16, 
    marginTop: 30, 
    height: 55, 
    borderRadius: 15, 
    backgroundColor: 'rgba(255, 71, 87, 0.1)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 10 
  },
  logoutText: { color: '#ff4757', fontWeight: 'bold', fontSize: 16 },
  versionText: { 
    textAlign: 'center', 
    color: '#475569', 
    fontSize: 12, 
    marginTop: 30 
  }
});