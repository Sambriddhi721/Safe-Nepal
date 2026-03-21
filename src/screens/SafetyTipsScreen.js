import React, { useState, useCallback, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from "@expo/vector-icons";

// --- UPDATED DATA (Added First Aid) ---
const SAFETY_DATA = {
  Flood: {
    Before: [
      { title: "Pack SOS Bag", desc: "Include 3 liters of water per person, dry food (Noodles, Biscuits), a whistle, and vital documents.", icon: "briefcase-outline", lib: "Ionicons", color: "#ffa500" },
      { title: "Map High Ground", desc: "Identify the nearest sturdy concrete building or safe hill. Practice the route with family.", icon: "map-outline", lib: "Ionicons", color: "#2ed573" },
    ],
    During: [
      { title: "Move Immediately", desc: "If you hear a flood warning, move to higher ground. Do not wait for official orders.", icon: "trending-up", lib: "Feather", color: "#ff4757" },
      { title: "Turn Around", desc: "Never walk or drive through floodwater. 6 inches can knock you down.", icon: "car-outline", lib: "Ionicons", color: "#ff4757" },
    ],
    After: [
      { title: "Boil All Water", desc: "Floodwater contaminates taps. Boil for 3 minutes before drinking to avoid cholera.", icon: "water-outline", lib: "Ionicons", color: "#2ed573" },
    ],
  },
  Landslide: {
    Before: [
      { title: "Watch Soil Cracks", desc: "Look for new cracks in the ground or tilted trees. These are early warning signs.", icon: "alert-triangle-outline", lib: "Ionicons", color: "#ffa500" },
    ],
    During: [
      { title: "Run Perpendicular", desc: "If a slide starts, run sideways to the path of flow, not downhill.", icon: "run", lib: "MaterialCommunityIcons", color: "#ff4757" },
    ],
    After: [
      { title: "Examine Foundation", desc: "Check your home for new cracks. If the ground shifted, the building may be unsafe.", icon: "business-outline", lib: "Ionicons", color: "#2ed573" },
    ],
  },
  // --- NEW: FIRST AID DATA ---
  "First Aid": {
    "Trauma & Injuries": [
      { title: "Severe Bleeding", desc: "Apply firm, direct pressure to the wound with a clean cloth. Elevate the limb above heart level.", icon: "opacity", lib: "MaterialIcons", color: "#ff4757" },
      { title: "Fractures", desc: "Do not try to straighten a broken bone. Splint the limb using a sturdy stick and cloth to prevent movement.", icon: "bone", lib: "FontAwesome5", color: "#ffa500" },
      { title: "Head Injury", desc: "Keep the person still. If they are drowsy or vomiting, seek immediate medical help (102).", icon: "head-side-mask", lib: "FontAwesome5", color: "#ff4757" },
    ],
    "Environment": [
      { title: "Hypothermia", desc: "Remove wet clothes. Wrap the person in dry blankets or extra layers. Give warm (not hot) liquids.", icon: "thermometer-minus", lib: "MaterialCommunityIcons", color: "#1e90ff" },
      { title: "Snake Bite", desc: "Keep the bitten area still and below heart level. Do not cut the wound or try to suck out venom.", icon: "snake", lib: "MaterialCommunityIcons", color: "#ff4757" },
    ],
    "Rescue Breathing": [
      { title: "Drowning / CPR", desc: "If the person isn't breathing, start chest compressions (100-120 per minute) in the center of the chest.", icon: "heart-pulse", lib: "MaterialCommunityIcons", color: "#ff4757" },
    ],
  }
};

const NavItem = memo(({ icon, label, active, onPress }) => (
  <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name={icon} size={22} color={active ? "#1e90ff" : "#aaa"} />
    <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
  </TouchableOpacity>
));

export default function SafetyTipsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("Flood");
  const [openSection, setOpenSection] = useState(activeTab === "First Aid" ? "Trauma & Injuries" : "Before");

  const onShare = async () => {
    try {
      await Share.share({
        message: `Emergency Guide: Check out these ${activeTab} safety and medical tips from Safe Nepal!`,
      });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const renderIcon = (item) => {
    const IconLib = item.lib === "MaterialCommunityIcons" ? MaterialCommunityIcons : 
                    item.lib === "Feather" ? Feather : 
                    item.lib === "FontAwesome5" ? FontAwesome5 : Ionicons;
    return <IconLib name={item.icon} size={22} color={item.color} />;
  };

  const renderAccordion = useCallback((sectionName) => {
    const isOpen = openSection === sectionName;
    const items = SAFETY_DATA[activeTab][sectionName] || [];

    return (
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setOpenSection(isOpen ? "" : sectionName)}
          activeOpacity={0.8}
        >
          <View style={styles.headerLeft}>
             <View style={[styles.dot, { backgroundColor: sectionName === "During" || sectionName === "Rescue Breathing" ? "#ff4757" : "#2ed573" }]} />
             <Text style={styles.sectionTitle}>{sectionName}</Text>
          </View>
          <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color="#fff" />
        </TouchableOpacity>

        {isOpen && items.map((item, index) => (
          <View key={index} style={styles.tipCard}>
            <View style={styles.iconContainer}>{renderIcon(item)}</View>
            <View style={styles.tipTextBox}>
              <Text style={styles.tipTitle}>{item.title}</Text>
              <Text style={styles.tipDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  }, [activeTab, openSection]);

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0f2027", "#1e293b", "#0f172a"]} style={styles.container}>
        
        {/* HEADER */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safety & First Aid</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* UPDATED TAB SELECTOR (3 Tabs now) */}
        <View style={styles.toggleRow}>
          {["Flood", "Landslide", "First Aid"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.toggleBtn, activeTab === tab && styles.activeToggle]}
              onPress={() => {
                setActiveTab(tab);
                setOpenSection(tab === "First Aid" ? "Trauma & Injuries" : "Before");
              }}
            >
              <Text style={[styles.toggleText, activeTab === tab && styles.activeToggleText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView 
          contentContainerStyle={{ paddingBottom: 160 }}
          showsVerticalScrollIndicator={false}
        >
          {Object.keys(SAFETY_DATA[activeTab]).map(section => renderAccordion(section))}
        </ScrollView>

        {/* SHARE ACTION */}
        <TouchableOpacity style={[styles.shareBtn, { bottom: insets.bottom + 85 }]} onPress={onShare}>
          <Ionicons name="share-social" size={20} color="#fff" />
          <Text style={styles.shareText}>Share Emergency Tips</Text>
        </TouchableOpacity>

        {/* PERSISTENT BOTTOM NAV */}
        <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 10 }]}>
          <NavItem icon="home-outline" label="Home" onPress={() => navigation?.navigate('Home')} />
          <NavItem icon="map-outline" label="Map" onPress={() => navigation?.navigate('RealTimeMap')} />
          <NavItem icon="notifications-outline" label="Alerts" onPress={() => navigation?.navigate('Alerts')} />
          <NavItem icon="shield-checkmark" label="Safety" active />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 15,
  },
  backBtn: { padding: 4 },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  toggleRow: {
    flexDirection: "row",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    marginHorizontal: 16,
    borderRadius: 15,
    padding: 5,
    marginBottom: 20,
  },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12 },
  activeToggle: { backgroundColor: "#1e90ff" },
  toggleText: { color: "#94a3b8", fontWeight: "600", fontSize: 13 }, // Reduced font size to fit 3 tabs
  activeToggleText: { color: "#fff" },
  section: {
    backgroundColor: "rgba(30, 41, 59, 0.7)",
    borderRadius: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  sectionHeader: { 
    padding: 18, 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center" 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  sectionTitle: { color: "#fff", fontWeight: "700", fontSize: 17, textTransform: 'capitalize' },
  tipCard: {
    flexDirection: "row",
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    padding: 18,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: 'center',
    alignItems: 'center'
  },
  tipTextBox: { marginLeft: 15, flex: 1 },
  tipTitle: { color: "#fff", fontWeight: "700", fontSize: 15 },
  tipDesc: { color: "#94a3b8", fontSize: 13, marginTop: 5, lineHeight: 20 },
  shareBtn: {
    position: "absolute",
    alignSelf: "center",
    flexDirection: "row",
    backgroundColor: "#1e90ff",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    elevation: 8,
    alignItems: 'center',
  },
  shareText: { color: "#fff", fontWeight: "800", fontSize: 15, marginLeft: 10 },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#0f172a",
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  navItem: { flex: 1, alignItems: "center" },
  navText: { color: "#94a3b8", fontSize: 11, marginTop: 5 },
  navTextActive: { color: "#1e90ff", fontWeight: "800" },
});