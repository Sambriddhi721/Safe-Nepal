import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  StatusBar, FlatList, Alert
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BillingScreen({ navigation }) {
  const [selectedPlan, setSelectedPlan] = useState("Standard");

  const theme = {
    bg: "#020617",
    card: "#0f172a",
    text: "#F1F5F9",
    subText: "#94A3B8",
    border: "#1e293b",
    accent: "#3b82f6",
    success: "#22c55e"
  };

  const proFeatures = [
    { id: '1', icon: 'flash', text: 'Real-time AI Risk Predictions' },
    { id: '2', icon: 'map', text: 'Offline Emergency Maps' },
    { id: '3', icon: 'notifications-active', text: 'Priority SMS Alerts' },
    { id: '4', icon: 'cloud-download', text: 'Historical Data Exports' }
  ];

  const handleUpgrade = () => {
    Alert.alert(
      "Upgrade to Pro",
      "This will initiate a secure payment gateway. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Proceed", onPress: () => console.log("Integrate eSewa/Khalti here") }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Billing & Plans</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* CURRENT PLAN STATUS */}
        <View style={[styles.planCard, { backgroundColor: theme.card, borderColor: theme.accent }]}>
          <Text style={[styles.planLabel, { color: theme.accent }]}>YOUR CURRENT PLAN</Text>
          <Text style={[styles.planName, { color: theme.text }]}>Safe Nepal Standard</Text>
          <Text style={[styles.planPrice, { color: theme.subText }]}>$0.00 / month</Text>
        </View>

        {/* PRO UPGRADE SECTION */}
        <View style={[styles.upgradeContainer, { backgroundColor: theme.card }]}>
          <View style={styles.proBadge}>
            <Text style={styles.proText}>PRO FEATURES</Text>
          </View>
          
          <Text style={[styles.upgradeTitle, { color: theme.text }]}>Unlock Safe Nepal Pro</Text>
          
          {proFeatures.map((feature) => (
            <View key={feature.id} style={styles.featureRow}>
              <Ionicons name={feature.icon} size={20} color={theme.success} />
              <Text style={[styles.featureText, { color: theme.subText }]}>{feature.text}</Text>
            </View>
          ))}

          <TouchableOpacity style={[styles.buyButton, { backgroundColor: theme.accent }]} onPress={handleUpgrade}>
            <Text style={styles.buyButtonText}>Upgrade Now — $0.00</Text>
          </TouchableOpacity>
        </View>

        {/* PAYMENT METHODS */}
        <Text style={styles.sectionLabel}>Payment Methods</Text>
        <TouchableOpacity style={[styles.methodRow, { backgroundColor: theme.card }]}>
          <View style={styles.methodLeft}>
            <Ionicons name="card" size={24} color={theme.subText} />
            <Text style={[styles.methodText, { color: theme.text }]}>Add Debit/Credit Card</Text>
          </View>
          <Ionicons name="add" size={24} color={theme.accent} />
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
  
  planCard: { padding: 25, borderRadius: 24, borderWidth: 2, marginBottom: 25 },
  planLabel: { fontSize: 12, fontWeight: '800', marginBottom: 8 },
  planName: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  planPrice: { fontSize: 16 },

  upgradeContainer: { padding: 25, borderRadius: 24, marginBottom: 30 },
  proBadge: { backgroundColor: 'rgba(59, 130, 246, 0.15)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 15 },
  proText: { color: '#3b82f6', fontSize: 10, fontWeight: '900' },
  upgradeTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  featureText: { fontSize: 15, marginLeft: 12 },
  
  buyButton: { marginTop: 20, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  buyButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  sectionLabel: { fontSize: 13, fontWeight: '700', color: '#64748b', marginBottom: 15, textTransform: 'uppercase' },
  methodRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 18 },
  methodLeft: { flexDirection: 'row', alignItems: 'center' },
  methodText: { fontSize: 16, marginLeft: 15, fontWeight: '500' }
});