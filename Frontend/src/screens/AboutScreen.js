import React from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, Linking, StatusBar
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

  const openLink = (url) => {
    // In a real app, use Linking.openURL(url)
    console.log("Opening:", url);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>About</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* APP LOGO & VERSION */}
        <View style={styles.logoSection}>
          <View style={[styles.iconCircle, { backgroundColor: theme.accent }]}>
             <Ionicons name="shield-checkmark" size={50} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: theme.text }]}>Safe Nepal</Text>
          <Text style={[styles.version, { color: theme.subText }]}>Version 1.3.6 (Build 102)</Text>
        </View>

        {/* MISSION SECTION */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Our Mission</Text>
          <Text style={[styles.cardText, { color: theme.subText }]}>
            Safe Nepal is dedicated to providing real-time disaster alerts, rainfall monitoring, 
            and emergency resources to keep the citizens of Nepal informed and safe 
            during natural disasters.
          </Text>
        </View>

        {/* LINKS SECTION */}
        <Text style={styles.sectionLabel}>Legal & Social</Text>
        <View style={[styles.cardGroup, { backgroundColor: theme.card }]}>
          <AboutRow theme={theme} label="Privacy Policy" icon="document-text-outline" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <AboutRow theme={theme} label="Terms of Service" icon="reader-outline" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <AboutRow theme={theme} label="Official Website" icon="globe-outline" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <AboutRow theme={theme} label="Contact Support" icon="mail-outline" last />
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.subText }]}>Made with ❤️ for Nepal</Text>
          <Text style={[styles.footerText, { color: theme.subText }]}>© 2024 Safe Nepal Team</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function AboutRow({ theme, label, icon, last }) {
  return (
    <TouchableOpacity style={styles.row}>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 60, paddingBottom: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold' },
  backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  scrollContent: { paddingHorizontal: 16, paddingBottom: 40 },
  
  logoSection: { alignItems: 'center', marginVertical: 40 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 15, elevation: 5 },
  appName: { fontSize: 24, fontWeight: 'bold' },
  version: { fontSize: 14, marginTop: 5 },

  card: { padding: 20, borderRadius: 16, marginBottom: 25 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  cardText: { fontSize: 15, lineHeight: 22 },

  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#64748b', marginBottom: 10, marginLeft: 4, textTransform: 'uppercase' },
  cardGroup: { borderRadius: 16, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18 },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  rowText: { fontSize: 16, fontWeight: '500', marginLeft: 15 },
  divider: { height: 1, marginHorizontal: 16 },

  footer: { marginTop: 40, alignItems: 'center' },
  footerText: { fontSize: 12, marginBottom: 4 }
});