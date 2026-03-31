import React, { useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';

export default function AccountSettings({ navigation }) {
  const { colors, theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext); // This data will now update automatically
  const isDarkMode = theme === 'dark';

  const InfoRow = ({ label, value, icon }) => (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.1)' }]}>
        <Ionicons name={icon} size={20} color={colors.primary || '#3b82f6'} />
      </View>
      <View style={styles.textContainer}>
        <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {value || `Not set`}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Header Section */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Details</Text>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('EditProfile')}
          activeOpacity={0.7}
        >
          <Text style={[styles.editLabel, { color: colors.primary || '#3b82f6' }]}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <InfoRow 
            label="Full Name" 
            value={user?.full_name} 
            icon="person-outline" 
          />
          <InfoRow 
            label="Email Address" 
            value={user?.email} 
            icon="mail-outline" 
          />
          <InfoRow 
            label="Phone Number" 
            value={user?.phone} 
            icon="call-outline" 
          />
          <InfoRow 
            label="Research Focus / Bio" 
            value={user?.bio} 
            icon="document-text-outline" 
          />
        </View>

        {/* Security Footer Note */}
        <View style={styles.footer}>
          <Ionicons name="shield-checkmark-outline" size={16} color={colors.subText} />
          <Text style={[styles.footerText, { color: colors.subText }]}>
            These details help Responders verify your identity during emergencies.
          </Text>
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
  headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  editLabel: { fontSize: 16, fontWeight: '800' },
  content: { padding: 16 },
  card: { borderRadius: 24, overflow: 'hidden', elevation: 2, shadowOpacity: 0.05 },
  infoRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    padding: 20, 
    borderBottomWidth: 0.5 
  },
  iconContainer: { 
    width: 44, 
    height: 44, 
    borderRadius: 14, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginRight: 15 
  },
  textContainer: { flex: 1 },
  label: { 
    fontSize: 11, 
    fontWeight: '900', 
    textTransform: 'uppercase', 
    marginBottom: 4, 
    letterSpacing: 0.5 
  },
  value: { fontSize: 16, fontWeight: '700' },
  footer: { 
    flexDirection: 'row', 
    padding: 30, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  footerText: { 
    fontSize: 12, 
    marginLeft: 10, 
    textAlign: 'center', 
    lineHeight: 18, 
    fontWeight: '500' 
  }
});