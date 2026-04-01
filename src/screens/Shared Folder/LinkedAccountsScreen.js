import React, { useState, useContext } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  StatusBar, Switch, Alert, ActivityIndicator, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext"; // Adjust path as needed

export default function LinkedAccountsScreen({ navigation }) {
  const { colors, theme } = useContext(ThemeContext);
  const isDark = theme === "dark";

  // State to track connections
  const [links, setLinks] = useState({
    google: true,
    facebook: false,
    esewa: false,
    citizenship: false
  });

  // State to show a loading spinner during "handshake"
  const [loadingProvider, setLoadingProvider] = useState(null);

  const toggleLink = async (key, providerName) => {
    // If currently connected, just disconnect immediately
    if (links[key]) {
      setLinks(prev => ({ ...prev, [key]: false }));
      return;
    }

    // If connecting, show confirmation and simulate API call
    Alert.alert(
      `Link ${providerName}`,
      `Safe Nepal will redirect you to ${providerName} for secure authentication.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Connect", 
          onPress: async () => {
            setLoadingProvider(key);
            try {
              // Simulate a 1.5 second network request/auth redirect
              await new Promise(resolve => setTimeout(resolve, 1500));
              setLinks(prev => ({ ...prev, [key]: true }));
              
              // Optional: Save to your backend/dbService here
              // await saveSetting(`link_${key}`, true);
              
            } catch (error) {
              Alert.alert("Connection Failed", `Could not link to ${providerName}.`);
            } finally {
              setLoadingProvider(null);
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Linked Accounts</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[styles.description, { color: colors.subText }]}>
          Connected accounts help us verify your reports and provide faster assistance during emergencies.
        </Text>

        <Text style={styles.sectionLabel}>Social & Identity</Text>
        <View style={[styles.cardGroup, { backgroundColor: colors.card }]}>
          <AccountRow 
            icon="logo-google" 
            label="Google" 
            iconColor="#ea4335" 
            connected={links.google} 
            isLoading={loadingProvider === 'google'}
            onToggle={() => toggleLink('google', 'Google')}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
          <AccountRow 
            icon="logo-facebook" 
            label="Facebook" 
            iconColor="#1877f2" 
            connected={links.facebook} 
            isLoading={loadingProvider === 'facebook'}
            onToggle={() => toggleLink('facebook', 'Facebook')}
            colors={colors}
          />
        </View>

        <Text style={styles.sectionLabel}>Local Services & Wallets</Text>
        <View style={[styles.cardGroup, { backgroundColor: colors.card }]}>
          <AccountRow 
            icon="wallet-outline" 
            label="eSewa / Khalti" 
            iconColor="#60bb46" 
            connected={links.esewa} 
            isLoading={loadingProvider === 'esewa'}
            onToggle={() => toggleLink('esewa', 'eSewa')}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]} />
          <AccountRow 
            icon="id-card-outline" 
            label="Citizenship Verification" 
            iconColor={colors.primary} 
            connected={links.citizenship} 
            isLoading={loadingProvider === 'citizenship'}
            onToggle={() => toggleLink('citizenship', 'Citizenship ID')}
            colors={colors}
          />
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#22c55e" />
          <Text style={[styles.infoText, { color: colors.subText }]}>
            Your data is encrypted. We never post to your social accounts without permission.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

// Sub-component for individual account rows
function AccountRow({ icon, label, iconColor, connected, onToggle, colors, isLoading }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View style={[styles.iconCircle, { backgroundColor: 'rgba(148, 163, 184, 0.1)' }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        <View style={{ marginLeft: 15 }}>
          <Text style={[styles.rowText, { color: colors.text }]}>{label}</Text>
          <Text style={{ color: connected ? '#22c55e' : colors.subText, fontSize: 12 }}>
            {connected ? 'Connected' : 'Not Linked'}
          </Text>
        </View>
      </View>
      
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginRight: 10 }} />
      ) : (
        <Switch 
          value={connected} 
          onValueChange={onToggle}
          trackColor={{ false: "#767577", true: "rgba(59, 130, 246, 0.5)" }}
          thumbColor={connected ? "#3b82f6" : "#f4f3f4"}
        />
      )}
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
    paddingBottom: 15 
  },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 4 },
  scrollContent: { padding: 20 },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 30 },
  sectionLabel: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: '#64748b', 
    marginBottom: 12, 
    textTransform: 'uppercase', 
    marginLeft: 5,
    letterSpacing: 1.2
  },
  cardGroup: { 
    borderRadius: 24, 
    overflow: 'hidden', 
    marginBottom: 30,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)' 
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 18 
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center' },
  iconCircle: { 
    width: 42, 
    height: 42, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  rowText: { fontSize: 16, fontWeight: '700' },
  divider: { height: 1, marginLeft: 70 },
  infoBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginTop: 10, 
    padding: 15,
    borderRadius: 15,
    backgroundColor: 'rgba(34, 197, 94, 0.05)' 
  },
  infoText: { fontSize: 12, marginLeft: 12, flex: 1, lineHeight: 18 }
});