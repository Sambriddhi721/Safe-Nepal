import React, { useContext } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Alert, Linking, Platform
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";

export default function AboutScreen({ navigation }) {
  const { colors, theme } = useContext(ThemeContext);
  const isDarkMode = theme === 'dark';

  const handleOpenLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", "Your device cannot open this link.");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>About Safe Nepal</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* BRAND SECTION */}
        <View style={styles.logoSection}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary || '#3b82f6' }]}>
             <Ionicons name="shield-checkmark" size={55} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>Safe Nepal</Text>
          <View style={[styles.versionBadge, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' }]}>
            <Text style={[styles.version, { color: colors.primary || '#3b82f6' }]}>v2.1.0 • PRODUCTION BETA</Text>
          </View>
        </View>

        {/* CORE TECH SECTION */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Platform Intelligence</Text>
          <Text style={[styles.cardText, { color: colors.subText }]}>
            Safe Nepal leverages advanced AI to mitigate environmental risks. We implement 
            <Text style={{ fontWeight: 'bold', color: colors.text }}> SARIMAX </Text> 
            for precision time-series flood forecasting and 
            <Text style={{ fontWeight: 'bold', color: colors.text }}> Random Forest </Text> 
            regressors for real-time risk classification across Nepal's diverse topography.
          </Text>
          
          <View style={styles.algoRow}>
            <View style={[styles.algoTag, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                <Text style={styles.algoTagText}>SARIMAX</Text>
            </View>
            <View style={[styles.algoTag, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Text style={[styles.algoTagText, { color: '#10b981' }]}>Random Forest</Text>
            </View>
          </View>
        </View>

        {/* LEGAL & CONTACT */}
        <Text style={styles.sectionLabel}>Connect & Support</Text>
        <View style={[styles.cardGroup, { backgroundColor: colors.card }]}>
          <AboutRow 
            colors={colors} 
            label="Official Website" 
            icon="globe-outline" 
            onPress={() => handleOpenLink('https://safenepal.com')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <AboutRow 
            colors={colors} 
            label="Privacy Policy" 
            icon="document-lock-outline" 
            onPress={() => handleOpenLink('https://safenepal.com/privacy')}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <AboutRow 
            colors={colors} 
            label="Contact Team" 
            icon="mail-outline" 
            onPress={() => handleOpenLink('mailto:support@safenepal.com')}
          />
        </View>

        {/* RESEARCHER INFO */}
        <Text style={styles.sectionLabel}>Project Lead</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
           <View style={styles.devHeader}>
              <View>
                <Text style={[styles.devName, { color: colors.text }]}>Sambriddhi Dawadi</Text>
                <Text style={[styles.devId, { color: colors.subText }]}>University Student ID: 2331203</Text>
                <Text style={[styles.devDept, { color: colors.primary || '#3b82f6' }]}>Dept. of Software Engineering</Text>
              </View>
              <TouchableOpacity onPress={() => handleOpenLink('https://github.com/sambriddhi')}>
                <Ionicons name="logo-github" size={34} color={colors.text} />
              </TouchableOpacity>
           </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.subText }]}>Department of Hydrology and Meteorology Data</Text>
          <Text style={[styles.footerText, { color: colors.subText }]}>© 2026 Safe Nepal • Kathmandu, Nepal</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function AboutRow({ colors, label, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={22} color={colors.primary || '#3b82f6'} />
        <Text style={[styles.rowText, { color: colors.text }]}>{label}</Text>
      </View>
      <Ionicons name="open-outline" size={16} color={colors.subText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 15 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  
  logoSection: { alignItems: 'center', marginVertical: 40 },
  iconCircle: { 
    width: 110, height: 110, borderRadius: 35, // Squared-circle look
    alignItems: 'center', justifyContent: 'center', 
    marginBottom: 20, elevation: 12,
    shadowColor: '#3b82f6', shadowOpacity: 0.3, shadowRadius: 15 
  },
  appName: { fontSize: 28, fontWeight: '900', letterSpacing: 0.5 },
  versionBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 10, marginTop: 10 },
  version: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  card: { padding: 22, borderRadius: 28, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  cardText: { fontSize: 14, lineHeight: 24, textAlign: 'left' },
  
  algoRow: { flexDirection: 'row', marginTop: 15 },
  algoTag: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginRight: 10 },
  algoTagText: { fontSize: 11, fontWeight: '800', color: '#3b82f6' },

  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#64748b', marginBottom: 12, marginTop: 15, marginLeft: 8, textTransform: 'uppercase', letterSpacing: 1.5 },
  cardGroup: { borderRadius: 28, overflow: 'hidden', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowText: { fontSize: 15, fontWeight: '700', marginLeft: 15 },
  divider: { height: 1, marginHorizontal: 20, opacity: 0.2 },

  devHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  devName: { fontSize: 18, fontWeight: '800' },
  devId: { fontSize: 12, marginTop: 2 },
  devDept: { fontSize: 12, marginTop: 4, fontWeight: '700' },

  footer: { marginTop: 30, marginBottom: 20, alignItems: 'center' },
  footerText: { fontSize: 11, marginBottom: 4, fontWeight: '600', opacity: 0.6 }
});