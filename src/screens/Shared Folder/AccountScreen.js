import React, { useContext } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, StatusBar, Image, Platform 
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

  // Focused only on Personal/Identity data
  const PERSONAL_INFO_ITEMS = [
    { 
      id: '1', 
      title: 'Update Profile', 
      subtitle: 'Change name, phone, or photo', 
      icon: 'person-outline', 
      target: 'EditProfile' 
    },
    { 
      id: '2', 
      title: 'Identity Verification', 
      subtitle: 'Student ID: 2331203 • Verified', 
      icon: 'badge-account-outline', 
      lib: 'MaterialCommunityIcons' 
    },
    { 
      id: '3', 
      title: 'Email Address', 
      subtitle: user?.email || 'sambriddhidawadi@university.edu', 
      icon: 'mail-outline' 
    },
  ];

  const renderItem = (item, index) => {
    const IconLib = item.lib === 'MaterialCommunityIcons' ? MaterialCommunityIcons : Ionicons;
    return (
      <TouchableOpacity 
        key={item.id}
        activeOpacity={0.7}
        style={[
          styles.menuItem, 
          index !== PERSONAL_INFO_ITEMS.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: colors.border }
        ]}
        onPress={() => item.target ? navigation.navigate(item.target) : null}
      >
        <View style={styles.menuLeft}>
          <View style={[styles.iconBox, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}>
            <IconLib name={item.icon} size={20} color={colors.primary || '#3b82f6'} />
          </View>
          <View>
            <Text style={[styles.itemTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.itemSubtitle, { color: colors.subText }]}>{item.subtitle}</Text>
          </View>
        </View>
        {item.target && <Ionicons name="chevron-forward" size={18} color={colors.subText} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Information</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* LARGE PROFILE DISPLAY */}
        <View style={styles.profileHero}>
          <View style={styles.avatarWrapper}>
            <Image 
              source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'Sambriddhi')}&background=3b82f6&color=fff&size=128` }} 
              style={styles.largeAvatar} 
            />
            <View style={styles.editBadge}>
                <Ionicons name="camera" size={14} color="#fff" />
            </View>
          </View>
          <Text style={[styles.heroName, { color: colors.text }]}>{user?.full_name || "Sambriddhi Dawadi"}</Text>
          <View style={styles.statusPill}>
             <MaterialCommunityIcons name="shield-check" size={14} color="#3b82f6" />
             <Text style={styles.statusText}>Verified Citizen</Text>
          </View>
        </View>

        {/* DETAILS LIST */}
        <View style={styles.sectionWrapper}>
          <Text style={[styles.sectionLabel, { color: colors.subText }]}>Identity & Contact</Text>
          <View style={[styles.groupCard, { backgroundColor: colors.card }]}>
            {PERSONAL_INFO_ITEMS.map((item, index) => renderItem(item, index))}
          </View>
        </View>

        {/* LOGOUT BUTTON (Moved here for easier access) */}
        <TouchableOpacity 
            style={[styles.logoutCard, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]} 
            onPress={() => signOut()}
        >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" style={{marginRight: 8}} />
            <Text style={styles.logoutText}>Sign Out from Device</Text>
        </TouchableOpacity>

        <Text style={styles.footerVersion}>Safe Nepal v1.4.2 • Profile ID: SN-2331203</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  closeBtn: { padding: 4 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 40 },
  
  profileHero: { alignItems: 'center', marginVertical: 30 },
  avatarWrapper: { position: 'relative' },
  largeAvatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#3b82f6' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#3b82f6', borderRadius: 12, width: 28, height: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#020617' },
  heroName: { fontSize: 22, fontWeight: '800', marginTop: 15 },
  statusPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginTop: 8 },
  statusText: { color: '#3b82f6', fontSize: 12, fontWeight: '700', marginLeft: 6 },

  sectionWrapper: { marginBottom: 25 },
  sectionLabel: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', marginBottom: 12, marginLeft: 6, letterSpacing: 1.2 },
  groupCard: { borderRadius: 24, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  itemTitle: { fontSize: 15, fontWeight: '700' },
  itemSubtitle: { fontSize: 12, marginTop: 4, opacity: 0.7 },
  
  logoutCard: { borderRadius: 20, padding: 18, alignItems: 'center', marginTop: 20, flexDirection: 'row', justifyContent: 'center' },
  logoutText: { color: '#ef4444', fontWeight: '800', fontSize: 15 },
  footerVersion: { textAlign: 'center', color: '#64748b', fontSize: 11, marginTop: 40 },
});