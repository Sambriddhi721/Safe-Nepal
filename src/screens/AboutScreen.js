import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  StatusBar, Alert, Linking
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AboutScreen({ navigation }) {
  const theme = {
    bg: "#020617",
    card: "#0f172a",
    text: "#F1F5F9",
    subText: "#94A3B8",
    border: "#1e293b",
    accent: "#3b82f6",
  };

  const handleOpenLink = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Error", `Cannot open link: ${url}`);
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>About Safe Nepal</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* APP LOGO & VERSION */}
        <View style={styles.logoSection}>
          <View style={[styles.iconCircle, { backgroundColor: theme.accent }]}>
             <Ionicons name="shield-checkmark" size={50} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>Safe Nepal</Text>
          <Text style={[styles.version, { color: theme.subText }]}>Version 2.1.0 (BETA)</Text>
        </View>

        {/* MISSION SECTION */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Our Mission</Text>
          <Text style={[styles.cardText, { color: theme.subText }]}>
            Safe Nepal is an AI-powered disaster management platform utilizing SARIMAX for 
            time-series flood forecasting and Random Forest for risk classification. 
            Our goal is to provide citizens with actionable data to minimize loss of life 
            and property during natural disasters.
          </Text>
        </View>

        {/* LINKS SECTION */}
        <Text style={styles.sectionLabel}>Legal & Social</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <AboutRow 
            theme={theme} 
            label="Privacy Policy" 
            icon="document-lock-outline" 
            onPress={() => handleOpenLink('https://safenepal.com/privacy')}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <AboutRow 
            theme={theme} 
            label="Terms of Service" 
            icon="reader-outline" 
            onPress={() => handleOpenLink('https://safenepal.com/terms')}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <AboutRow 
            theme={theme} 
            label="Official Website" 
            icon="globe-outline" 
            onPress={() => handleOpenLink('https://safenepal.com')}
          />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <AboutRow 
            theme={theme} 
            label="Contact Support" 
            icon="mail-outline" 
            onPress={() => handleOpenLink('mailto:support@safenepal.com')}
          />
        </View>

        {/* DEVELOPER SECTION */}
        <Text style={styles.sectionLabel}>Project Info</Text>
        <View style={[styles.card, { backgroundColor: theme.card }]}>
           <View style={styles.devHeader}>
              <View>
                <Text style={[styles.devLabel, { color: theme.subText }]}>Developed by</Text>
                <Text style={[styles.devName, { color: theme.text }]}>Sambriddhi Dawadi</Text>
                <Text style={[styles.devId, { color: theme.accent }]}>ID: 2331203 | L5CG10</Text>
              </View>
              <TouchableOpacity onPress={() => handleOpenLink('https://github.com/sambriddhi')}>
                <Ionicons name="logo-github" size={32} color={theme.text} />
              </TouchableOpacity>
           </View>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.subText }]}>Developed for University Final Project</Text>
          <Text style={[styles.footerText, { color: theme.subText }]}>© 2026 Safe Nepal Team</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function AboutRow({ theme, label, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={20} color={theme.accent} />
        <Text style={[styles.rowText, { color: theme.text }]}>{label}</Text>
      </View>
      <Ionicons name="open-outline" size={16} color={theme.subText} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingTop: 60, 
    paddingBottom: 15 
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  
  logoSection: { alignItems: 'center', marginVertical: 30 },
  iconCircle: { 
    width: 100, height: 100, borderRadius: 50, 
    alignItems: 'center', justifyContent: 'center', 
    marginBottom: 15, elevation: 10,
    shadowColor: '#3b82f6', shadowOpacity: 0.4, shadowRadius: 12 
  },
  appName: { fontSize: 26, fontWeight: 'bold', letterSpacing: 0.5 },
  version: { fontSize: 14, marginTop: 5, letterSpacing: 1 },

  card: { padding: 22, borderRadius: 20, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  cardText: { fontSize: 14, lineHeight: 22, textAlign: 'justify' },

  sectionLabel: { 
    fontSize: 12, fontWeight: '900', color: '#64748b', 
    marginBottom: 10, marginTop: 10, marginLeft: 6, 
    textTransform: 'uppercase', letterSpacing: 1 
  },
  cardGroup: { borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowText: { fontSize: 16, fontWeight: '600', marginLeft: 15 },
  divider: { height: 1, marginHorizontal: 16 },

  devHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  devLabel: { fontSize: 11, textTransform: 'uppercase', fontWeight: '800', marginBottom: 4 },
  devName: { fontSize: 20, fontWeight: 'bold' },
  devId: { fontSize: 13, marginTop: 2, fontWeight: '600' },

  footer: { marginTop: 20, marginBottom: 20, alignItems: 'center' },
  footerText: { fontSize: 11, marginBottom: 4, fontWeight: '500' }
});