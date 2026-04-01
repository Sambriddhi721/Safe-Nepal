import React, { useContext, useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  StatusBar, Alert, ActivityIndicator, Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";

export default function BillingScreen({ navigation }) {
  const { colors, theme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  
  // State to manage which plan is currently active
  const [currentPlan, setCurrentPlan] = useState('Standard');
  const [isProcessing, setIsProcessing] = useState(false);

  const proFeatures = [
    { id: '1', icon: 'thunderstorm-outline', text: 'Real-time AI Risk Predictions' },
    { id: '2', icon: 'map-outline', text: 'Offline Emergency Maps' },
    { id: '3', icon: 'notifications-outline', text: 'Priority SMS Alerts' },
    { id: '4', icon: 'cloud-download-outline', text: 'Historical Data Exports' }
  ];

  const handleUpgrade = () => {
    if (currentPlan === 'Pro') {
      Alert.alert("Already Pro", "You are already enjoying all Pro features.");
      return;
    }

    Alert.alert(
      "Upgrade to Pro",
      "This will initiate a secure payment gateway (eSewa/Khalti). Proceed to payment?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Proceed", 
          onPress: async () => {
            setIsProcessing(true);
            try {
              // Simulate Gateway Handshake
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              setCurrentPlan('Pro');
              Alert.alert("Success!", "Welcome to Safe Nepal Pro. Your features are now unlocked.");
            } catch (error) {
              Alert.alert("Error", "Payment failed. Please try again.");
            } finally {
              setIsProcessing(false);
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
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Billing & Plans</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* CURRENT PLAN CARD */}
        <View style={[
          styles.planCard, 
          { 
            backgroundColor: colors.card, 
            borderColor: currentPlan === 'Pro' ? "#22c55e" : colors.primary || "#3b82f6" 
          }
        ]}>
          <Text style={[styles.planLabel, { color: currentPlan === 'Pro' ? "#22c55e" : colors.primary || "#3b82f6" }]}>
            {currentPlan === 'Pro' ? "PREMIUM PLAN ACTIVE" : "YOUR CURRENT PLAN"}
          </Text>
          <Text style={[styles.planName, { color: colors.text }]}>
            Safe Nepal {currentPlan}
          </Text>
          <Text style={[styles.planPrice, { color: colors.subText }]}>
            {currentPlan === 'Pro' ? "$9.99 / year" : "$0.00 / month"}
          </Text>
        </View>

        {/* UPGRADE SECTION (Only show or change style if not Pro) */}
        <View style={[styles.upgradeContainer, { backgroundColor: colors.card }]}>
          <View style={styles.proBadge}>
            <Text style={[styles.proText, { color: colors.primary || "#3b82f6" }]}>PRO FEATURES</Text>
          </View>
          
          <Text style={[styles.upgradeTitle, { color: colors.text }]}>
            {currentPlan === 'Pro' ? "All Features Unlocked" : "Unlock Safe Nepal Pro"}
          </Text>
          
          {proFeatures.map((feature) => (
            <View key={feature.id} style={styles.featureRow}>
              <View style={styles.iconCircle}>
                <Ionicons name={feature.icon} size={18} color="#22c55e" />
              </View>
              <Text style={[styles.featureText, { color: colors.text }]}>{feature.text}</Text>
            </View>
          ))}

          <TouchableOpacity 
            style={[
              styles.buyButton, 
              { backgroundColor: currentPlan === 'Pro' ? "#1e293b" : (colors.primary || "#3b82f6") }
            ]} 
            onPress={handleUpgrade}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buyButtonText}>
                {currentPlan === 'Pro' ? "Manage Subscription" : "Upgrade Now — $9.99/yr"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* PAYMENT METHODS */}
        <Text style={styles.sectionLabel}>Payment Methods</Text>
        <TouchableOpacity style={[styles.methodRow, { backgroundColor: colors.card }]}>
          <View style={styles.methodLeft}>
            <View style={styles.methodIconBg}>
              <Ionicons name="card-outline" size={22} color={colors.subText} />
            </View>
            <Text style={[styles.methodText, { color: colors.text }]}>Add Debit/Credit Card</Text>
          </View>
          <Ionicons name="add-circle" size={24} color={colors.primary || "#3b82f6"} />
        </TouchableOpacity>
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
    paddingHorizontal: 16, 
    paddingBottom: 15 
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20 },
  planCard: { 
    padding: 25, 
    borderRadius: 24, 
    borderWidth: 2, 
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3
  },
  planLabel: { fontSize: 11, fontWeight: '900', marginBottom: 8, letterSpacing: 1 },
  planName: { fontSize: 24, fontWeight: 'bold' },
  planPrice: { fontSize: 15, marginTop: 4 },
  upgradeContainer: { padding: 25, borderRadius: 28, marginBottom: 30 },
  proBadge: { 
    backgroundColor: 'rgba(59, 130, 246, 0.1)', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 10, 
    marginBottom: 15 
  },
  proText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  upgradeTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  featureText: { fontSize: 15, marginLeft: 15, fontWeight: '500' },
  buyButton: { 
    marginTop: 10, 
    paddingVertical: 18, 
    borderRadius: 18, 
    alignItems: 'center',
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  buyButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '800', color: '#64748b', marginBottom: 15, textTransform: 'uppercase', letterSpacing: 1.5, marginLeft: 5 },
  methodRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    padding: 16, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(148, 163, 184, 0.1)'
  },
  methodLeft: { flexDirection: 'row', alignItems: 'center' },
  methodIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(148, 163, 184, 0.1)',
    alignItems: 'center',
    justifyContent: 'center'
  },
  methodText: { fontSize: 16, marginLeft: 15, fontWeight: '600' }
});