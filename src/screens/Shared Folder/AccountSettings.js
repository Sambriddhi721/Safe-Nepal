import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar, 
  Platform 
} from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';

export default function AccountSettings({ navigation }) {
  const { colors, theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const isDarkMode = theme === 'dark';

  // Navigation row component
  const NavRow = ({ label, icon, onPress, showBorder = true }) => (
    <TouchableOpacity 
      style={[
        styles.navRow, 
        showBorder && { 
          borderBottomWidth: 1, 
          borderBottomColor: isDarkMode ? '#1e293b' : '#f1f5f9' 
        }
      ]} 
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.rowLeft}>
        <View style={styles.iconWrapper}>
          <Feather name={icon} size={20} color={isDarkMode ? '#94a3b8' : '#64748b'} />
        </View>
        <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      </View>
      <Feather name="chevron-right" size={20} color="#64748b" />
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Account Settings</Text>
        <View style={{ width: 28 }} /> 
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.content}
      >
        <Text style={[styles.sectionHeader, { color: colors.text }]}>Manage Account</Text>

        {/* --- 1. BILLING LINK (Plan Card) --- */}
        <TouchableOpacity 
          style={[styles.planCard, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}
          onPress={() => navigation.navigate('BillingScreen')}
          activeOpacity={0.8}
        >
          <View style={styles.planHeader}>
            <Text style={styles.planSubText}>CURRENT PLAN</Text>
            <View style={styles.freeBadge}>
              <Text style={styles.freeText}>FREE</Text>
            </View>
          </View>
          <Text style={[styles.planTitle, { color: colors.text }]}>Safe Nepal Standard</Text>
          <Text style={styles.upgradeLink}>Upgrade to Pro for $0.00 →</Text>
        </TouchableOpacity>

        {/* ACCOUNT MANAGEMENT SECTION */}
        <Text style={styles.groupLabel}>ACCOUNT MANAGEMENT</Text>
        <View style={[styles.groupCard, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
          <NavRow 
            label="Personal Information" 
            icon="user" 
            onPress={() => navigation.navigate('EditProfile')} 
          />
          {/* --- 2. BILLING LINK (Row) --- */}
          <NavRow 
            label="Payments & Billing" 
            icon="credit-card" 
            onPress={() => navigation.navigate('BillingScreen')} 
          />
          <NavRow 
            label="Backup & Sync" 
            icon="cloud" 
            onPress={() => {}} 
            showBorder={false}
          />
        </View>

        {/* DATA CONTROL SECTION */}
        <Text style={styles.groupLabel}>DATA CONTROL</Text>
        <View style={[styles.groupCard, { backgroundColor: isDarkMode ? '#0f172a' : '#f8fafc' }]}>
          {/* --- 3. LINKED ACCOUNTS LINK --- */}
          <NavRow 
            label="Linked Accounts" 
            icon="share-2" 
            onPress={() => navigation.navigate('LinkedAccountsScreen')} 
          />
          <NavRow 
            label="Export Account History" 
            icon="file-text" 
            onPress={() => {}} 
            showBorder={false}
          />
        </View>

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
    paddingHorizontal: 20, 
    paddingBottom: 20 
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 4 },
  content: { padding: 20, paddingBottom: 40 },
  
  sectionHeader: { 
    fontSize: 22, 
    fontWeight: '800', 
    textAlign: 'center', 
    marginVertical: 20 
  },

  planCard: { 
    borderRadius: 24, 
    padding: 24, 
    marginBottom: 30,
    borderWidth: 1,
    borderColor: '#1e293b',
    // Added shadow for better visibility
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
      android: { elevation: 4 }
    })
  },
  planHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 12 
  },
  planSubText: { color: '#64748b', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  freeBadge: { 
    backgroundColor: 'rgba(59, 130, 246, 0.1)', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 8 
  },
  freeText: { color: '#3b82f6', fontSize: 10, fontWeight: '900' },
  planTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12 },
  upgradeLink: { color: '#3b82f6', fontWeight: '700', fontSize: 14 },

  groupLabel: { 
    color: '#64748b', 
    fontSize: 12, 
    fontWeight: '800', 
    marginBottom: 12, 
    marginLeft: 8,
    letterSpacing: 1
  },
  groupCard: { 
    borderRadius: 24, 
    overflow: 'hidden', 
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#1e293b'
  },

  navRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 20 
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconWrapper: { 
    width: 36, 
    height: 36, 
    borderRadius: 10, 
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15 
  },
  rowLabel: { fontSize: 16, fontWeight: '600' },
});