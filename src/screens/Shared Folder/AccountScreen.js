import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image, 
  StatusBar,
  Platform 
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';

export default function AccountScreen({ navigation }) {
  const { colors, theme } = useContext(ThemeContext);
  const { user, signOut } = useContext(AuthContext);
  const insets = useSafeAreaInsets();
  const isDarkMode = theme === 'dark';

  // Helper to render navigation rows
  const MenuRow = ({ icon, title, target, lib = 'Ionicons' }) => {
    const IconLib = lib === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;
    
    return (
      <TouchableOpacity 
        style={[styles.menuItem, { borderBottomColor: colors.border }]} 
        onPress={() => navigation.navigate(target)}
        activeOpacity={0.7}
      >
        <View style={styles.menuLeft}>
          <View style={[styles.iconBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
            <IconLib name={icon} size={22} color={colors.primary || '#3b82f6'} />
          </View>
          <Text style={[styles.menuTitle, { color: colors.text }]}>{title}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.subText} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + 20, paddingBottom: 40 }}
      >
        {/* HERO SECTION */}
        <View style={styles.profileHero}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ 
                uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Sambriddhi Dawadi')}&background=3b82f6&color=fff&size=128` 
              }} 
              style={styles.avatar} 
            />
            <View style={[styles.editIndicator, { borderColor: colors.background }]}>
              <Ionicons name="shield-checkmark" size={12} color="#fff" />
            </View>
          </View>
          
          <Text style={[styles.heroName, { color: colors.text }]}>
            {user?.full_name || "Sambriddhi Dawadi"}
          </Text>
          
          <View style={styles.pill}>
            <MaterialCommunityIcons name="school-outline" size={14} color="#3b82f6" />
            <Text style={styles.pillText}>Student ID: 2331203</Text>
          </View>
        </View>

        {/* ACCOUNT & IDENTITY SECTION */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.subText }]}>Account & Identity</Text>
          <View style={[styles.group, { backgroundColor: colors.card }]}>
            {/* Navigates to the Personal Details Display screen */}
            <MenuRow 
              icon="person-outline" 
              title="Personal Details" 
              target="AccountSettings" 
            />
            <MenuRow 
              icon="shield-lock-outline" 
              title="Password & Security" 
              target="SecuritySettings" 
              lib="MaterialCommunityIcons" 
            />
            <MenuRow 
              icon="notifications-outline" 
              title="Notifications" 
              target="NotificationSettings" 
            />
          </View>
        </View>

        {/* APP SETTINGS SECTION */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.subText }]}>Preferences</Text>
          <View style={[styles.group, { backgroundColor: colors.card }]}>
            <MenuRow 
              icon="information-circle-outline" 
              title="About Safe Nepal" 
              target="About" 
            />
            <MenuRow 
              icon="shield-outline" 
              title="Privacy Policy" 
              target="PrivacySettings" 
            />
          </View>
        </View>

        {/* LOGOUT */}
        <TouchableOpacity 
          style={[styles.logoutBtn, { backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.08)' }]} 
          onPress={signOut}
        >
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Sign Out from Device</Text>
        </TouchableOpacity>

        <Text style={[styles.versionText, { color: colors.subText }]}>
          Safe Nepal v1.4.2 (Beta)
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  profileHero: { alignItems: 'center', marginBottom: 30 },
  avatarContainer: { position: 'relative' },
  avatar: { 
    width: 110, 
    height: 110, 
    borderRadius: 55, 
    borderWidth: 3, 
    borderColor: '#3b82f6' 
  },
  editIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#3b82f6',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  heroName: { 
    fontSize: 24, 
    fontWeight: '900', 
    marginTop: 15,
    letterSpacing: -0.5 
  },
  pill: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(59, 130, 246, 0.1)', 
    paddingHorizontal: 14, 
    paddingVertical: 6, 
    borderRadius: 20, 
    marginTop: 10 
  },
  pillText: { 
    color: '#3b82f6', 
    fontSize: 12, 
    fontWeight: '700', 
    marginLeft: 6 
  },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionLabel: { 
    fontSize: 11, 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    marginBottom: 12, 
    marginLeft: 10, 
    letterSpacing: 1.5 
  },
  group: { borderRadius: 24, overflow: 'hidden' },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 18, 
    borderBottomWidth: 0.5 
  },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  menuTitle: { fontSize: 16, fontWeight: '700' },
  logoutBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 40, 
    padding: 18, 
    marginHorizontal: 16, 
    borderRadius: 22 
  },
  logoutText: { 
    color: '#ef4444', 
    fontWeight: '800', 
    fontSize: 16, 
    marginLeft: 10 
  },
  versionText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.6
  }
});