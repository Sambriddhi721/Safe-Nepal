import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen({ navigation }) {
  const theme = {
    bg: "#020617",
    card: "#0f172a",
    text: "#F1F5F9",
    subText: "#94A3B8",
    border: "#1e293b",
    accent: "#3b82f6",
  };

  const menuItems = [
    {
      id: '1',
      title: 'Personal Information',
      subtitle: 'Name, Email, Phone number',
      icon: 'person-outline',
      target: 'AccountSettings'
    },
    {
      id: '2',
      title: 'Linked Accounts',
      subtitle: 'Google, Facebook, eSewa',
      icon: 'link-outline',
      target: 'LinkedAccounts'
    },
    {
      id: '3',
      title: 'Billing & Plans',
      subtitle: 'Manage subscriptions and payments',
      icon: 'card-outline',
      target: 'Billing'
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Manage Account</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* PROFILE SUMMARY */}
        <View style={[styles.profileCard, { backgroundColor: theme.card }]}>
          <View style={[styles.avatar, { backgroundColor: theme.accent }]}>
            <Text style={styles.avatarText}>SN</Text>
          </View>
          <Text style={[styles.userName, { color: theme.text }]}>Safe Nepal User</Text>
          <Text style={[styles.userEmail, { color: theme.subText }]}>user@safenepal.org</Text>
        </View>

        {/* NAVIGATION LIST */}
        <Text style={styles.sectionLabel}>Account Settings</Text>
        <View style={[styles.menuGroup, { backgroundColor: theme.card }]}>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <TouchableOpacity 
                style={styles.menuItem} 
                onPress={() => navigation.navigate(item.target)}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.iconBox, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                    <Ionicons name={item.icon} size={22} color={theme.accent} />
                  </View>
                  <View style={{ marginLeft: 15 }}>
                    <Text style={[styles.itemTitle, { color: theme.text }]}>{item.title}</Text>
                    <Text style={[styles.itemSubtitle, { color: theme.subText }]}>{item.subtitle}</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.border} />
              </TouchableOpacity>
              {index < menuItems.length - 1 && (
                <View style={[styles.divider, { backgroundColor: theme.border }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutBtn}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 15 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  scrollContent: { padding: 20 },
  profileCard: { padding: 25, borderRadius: 24, alignItems: 'center', marginBottom: 30 },
  avatar: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  userName: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  userEmail: { fontSize: 14 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 12, textTransform: 'uppercase', marginLeft: 5 },
  menuGroup: { borderRadius: 20, overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  itemTitle: { fontSize: 16, fontWeight: '600' },
  itemSubtitle: { fontSize: 12, marginTop: 2 },
  divider: { height: 1, marginLeft: 70 },
  signOutBtn: { marginTop: 40, padding: 18, borderRadius: 16, alignItems: 'center', borderWeight: 1, borderColor: '#ef4444', borderWidth: 1 },
  signOutText: { color: '#ef4444', fontWeight: 'bold', fontSize: 16 }
});