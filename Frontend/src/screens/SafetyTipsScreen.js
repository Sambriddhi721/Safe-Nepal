import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

export default function SafetyTipsScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("Flood");
  const [openSection, setOpenSection] = useState("Before");

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Awareness & Safety Tips</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* FLOOD / LANDSLIDE TOGGLE */}
      <View style={styles.toggleRow}>
        <TouchableOpacity
          style={[
            styles.toggleBtn,
            activeTab === "Flood" && styles.activeToggle,
          ]}
          onPress={() => setActiveTab("Flood")}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === "Flood" && styles.activeToggleText,
            ]}
          >
            Flood
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.toggleBtn,
            activeTab === "Landslide" && styles.activeToggle,
          ]}
          onPress={() => setActiveTab("Landslide")}
        >
          <Text
            style={[
              styles.toggleText,
              activeTab === "Landslide" && styles.activeToggleText,
            ]}
          >
            Landslide
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* BEFORE FLOOD */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setOpenSection(openSection === "Before" ? "" : "Before")}
          >
            <Text style={styles.sectionTitle}>Before Flood</Text>
            <Ionicons
              name={openSection === "Before" ? "chevron-up" : "chevron-down"}
              size={18}
              color="#fff"
            />
          </TouchableOpacity>

          {openSection === "Before" && (
            <>
              <View style={styles.tipCard}>
                <MaterialCommunityIcons name="first-aid" size={22} color="#4cd964" />
                <View style={styles.tipTextBox}>
                  <Text style={styles.tipTitle}>Create an Emergency Kit</Text>
                  <Text style={styles.tipDesc}>
                    Include water, non-perishable food, a first-aid kit,
                    flashlight, and important documents.
                  </Text>
                </View>
              </View>

              <View style={styles.tipCard}>
                <Feather name="navigation" size={22} color="#4cd964" />
                <View style={styles.tipTextBox}>
                  <Text style={styles.tipTitle}>Know Your Evacuation Route</Text>
                  <Text style={styles.tipDesc}>
                    Identify several routes to higher ground from your home and
                    workplace. Practice them.
                  </Text>
                </View>
              </View>

              <View style={styles.tipCard}>
                <Ionicons name="wifi" size={22} color="#ffd60a" />
                <View style={styles.tipTextBox}>
                  <Text style={styles.tipTitle}>Stay Informed</Text>
                  <Text style={styles.tipDesc}>
                    Listen to local news and official alerts for the latest
                    information and instructions.
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* DURING FLOOD */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setOpenSection(openSection === "During" ? "" : "During")}
          >
            <Text style={styles.sectionTitle}>During Flood</Text>
            <Ionicons
              name={openSection === "During" ? "chevron-up" : "chevron-down"}
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        </View>

        {/* AFTER FLOOD */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => setOpenSection(openSection === "After" ? "" : "After")}
          >
            <Text style={styles.sectionTitle}>After Flood</Text>
            <Ionicons
              name={openSection === "After" ? "chevron-up" : "chevron-down"}
              size={18}
              color="#fff"
            />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* SHARE BUTTON */}
      <TouchableOpacity style={styles.shareBtn}>
        <Ionicons name="share-social" size={18} color="#fff" />
        <Text style={styles.shareText}> Share Tips</Text>
      </TouchableOpacity>

      {/* BOTTOM NAV (UI ONLY – MATCH DESIGN) */}
      <View style={styles.bottomNav}>
        <View style={styles.navItem}>
          <Ionicons name="home-outline" size={18} color="#aaa" />
          <Text style={styles.navText}>Home</Text>
        </View>
        <View style={styles.navItem}>
          <Ionicons name="map-outline" size={18} color="#aaa" />
          <Text style={styles.navText}>Map</Text>
        </View>
        <View style={styles.navItem}>
          <Ionicons name="notifications-outline" size={18} color="#aaa" />
          <Text style={styles.navText}>Alerts</Text>
        </View>
        <View style={styles.navItemActive}>
          <Ionicons name="shield-checkmark" size={18} color="#1e90ff" />
          <Text style={styles.navTextActive}>Safety</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingTop: 55,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  toggleRow: {
    flexDirection: "row",
    backgroundColor: "#1b263b",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
  },

  toggleBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },

  activeToggle: {
    backgroundColor: "#1e90ff",
  },

  toggleText: {
    color: "#aaa",
    fontWeight: "600",
  },

  activeToggleText: {
    color: "#fff",
  },

  section: {
    backgroundColor: "#1b263b",
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    overflow: "hidden",
  },

  sectionHeader: {
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: "#fff",
    fontWeight: "700",
  },

  tipCard: {
    flexDirection: "row",
    backgroundColor: "#243447",
    padding: 14,
    borderTopWidth: 1,
    borderColor: "#2c3e50",
  },

  tipTextBox: {
    marginLeft: 10,
    flex: 1,
  },

  tipTitle: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  tipDesc: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 4,
  },

  shareBtn: {
    position: "absolute",
    bottom: 70,
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "#1e90ff",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 30,
  },

  shareText: {
    color: "#fff",
    fontWeight: "700",
  },

  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#0d1b2a",
    paddingVertical: 10,
  },

  navItem: {
    flex: 1,
    alignItems: "center",
  },

  navItemActive: {
    flex: 1,
    alignItems: "center",
  },

  navText: {
    color: "#aaa",
    fontSize: 11,
    marginTop: 2,
  },

  navTextActive: {
    color: "#1e90ff",
    fontSize: 11,
    marginTop: 2,
    fontWeight: "700",
  },
});
