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
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

// --- FULL SAFETY DATA (30 REAL-WORLD TIPS) ---
const SAFETY_DATA = {
  Flood: {
    Before: [
      { title: "Pack SOS Bag", desc: "Include 3 liters of water per person, dry food (Noodles,Biscuits ), a whistle, and vital documents in a waterproof bag.", icon: "briefcase-outline", lib: "Ionicons", color: "#ffa500" },
      { title: "Map High Ground", desc: "Identify the nearest sturdy concrete building or safe hill. Practice the fastest route with your family.", icon: "map-outline", lib: "Ionicons", color: "#2ed573" },
      { title: "Seal & Elevate", desc: "Move electronics, grains, and citizenship papers to upper floors or high shelves to prevent damage.", icon: "home-outline", lib: "Ionicons", color: "#1e90ff" },
      { title: "Clear Drains", desc: "Ensure local gutters and drainage pipes near your home are clear of trash to prevent water from backing up.", icon: "trash-2", lib: "Feather", color: "#95a5a6" },
      { title: "Unplug Power", desc: "If flooding is likely, unplug all electrical appliances to prevent short circuits and fire hazards.", icon: "power", lib: "Feather", color: "#f1c40f" },
    ],
    During: [
      { title: "Move Immediately", desc: "If you hear a flood warning or see water rising, move to higher ground. Do not wait for an official order.", icon: "trending-up", lib: "Feather", color: "#ff4757" },
      { title: "Turn Around, Don't Drown", desc: "Never walk or drive through floodwater. 6 inches can knock you down; 2 feet can sweep a car away.", icon: "car-outline", lib: "Ionicons", color: "#ff4757" },
      { title: "Avoid Bridges", desc: "Fast-moving water can weaken foundations. Stay away from bridges over fast-flowing, muddy rivers.", icon: "alert-triangle", lib: "Feather", color: "#e67e22" },
      { title: "Avoid Electricity", desc: "Do not touch electrical equipment if you are wet or in water. Stay far from fallen power lines.", icon: "zap", lib: "Feather", color: "#ff4757" },
      { title: "Use a Stick", desc: "If you must walk in water, use a stick to check the ground's firmness and depth in front of you.", icon: "walk", lib: "MaterialCommunityIcons", color: "#ff4757" },
    ],
    After: [
      { title: "Boil All Water", desc: "Floodwater contaminates taps. Boil water for 3 minutes before drinking to avoid cholera/typhoid.", icon: "water-outline", lib: "Ionicons", color: "#2ed573" },
      { title: "Check for Snakes", desc: "Snakes seek dry shelter in homes after floods. Use a stick to check under furniture and debris.", icon: "bug-outline", lib: "Ionicons", color: "#e67e22" },
      { title: "Wait for All-Clear", desc: "Only return home after authorities confirm it is safe. Check for structural damage before entering.", icon: "checkmark-circle-outline", lib: "Ionicons", color: "#2ed573" },
      { title: "Discard Soaked Food", desc: "Throw away any food (even cans) that touched floodwater, as it likely contains harmful bacteria.", icon: "close-circle-outline", lib: "Ionicons", color: "#ff4757" },
      { title: "Wear Protective Gear", desc: "When cleaning, wear boots and gloves. Flood mud contains sharp glass, nails, and chemicals.", icon: "shield-checkmark-outline", lib: "Ionicons", color: "#3498db" },
    ],
  },
  Landslide: {
    Before: [
      { title: "Watch for Soil Cracks", desc: "Look for new cracks in the ground, tilted trees, or poles. These are early landslide warning signs.", icon: "alert-triangle-outline", lib: "Ionicons", color: "#ffa500" },
      { title: "Monitor Water Flow", desc: "A sudden increase/decrease in stream flow or water turning muddy indicates a slide upstream.", icon: "water", lib: "Feather", color: "#1e90ff" },
      { title: "Improve Drainage", desc: "Direct rain runoff away from steep slopes near your house. Soggy soil is much more likely to slide.", icon: "umbrella-outline", lib: "Ionicons", color: "#2ed573" },
      { title: "Sign Up for Alerts", desc: "Keep your phone on and ensure you can hear emergency notifications even while sleeping.", icon: "notifications-outline", lib: "Ionicons", color: "#1e90ff" },
      { title: "Plan Your Escape", desc: "Identify safe zones away from slopes. Plan to run sideways (perpendicular), not downhill.", icon: "map-outline", lib: "Ionicons", color: "#2ed573" },
    ],
    During: [
      { title: "Listen for Rumbling", desc: "Listen for trees cracking or boulders knocking—this is the sound of an approaching landslide.", icon: "volume-high-outline", lib: "Ionicons", color: "#ff4757" },
      { title: "Run Perpendicular", desc: "If a slide starts, run to the nearest stable ground sideways to the path of the flow.", icon: "run", lib: "MaterialCommunityIcons", color: "#ff4757" },
      { title: "Curl and Protect", desc: "If you cannot escape, curl into a tight ball and cover your head with your arms to protect against debris.", icon: "human-handsup", lib: "MaterialCommunityIcons", color: "#ff4757" },
      { title: "Stay Awake & Alert", desc: "Deaths often happen during sleep. Have family take turns staying 'on watch' during heavy monsoon storms.", icon: "eye-outline", lib: "Ionicons", color: "#ff4757" },
      { title: "Avoid Valleys", desc: "Stay away from river valleys; slides can block rivers and cause sudden, massive flash floods.", icon: "landscape-outline", lib: "Ionicons", color: "#ff4757" },
    ],
    After: [
      { title: "Stay Away from Site", desc: "Secondary slides often follow the first. Stay away until experts confirm the slope is stable.", icon: "alert-octagon", lib: "Feather", color: "#ff4757" },
      { title: "Check for Gas/Leaks", desc: "Slides break underground pipes. Check for gas smells and report broken utility lines immediately.", icon: "flash-outline", lib: "Ionicons", color: "#e67e22" },
      { title: "Report Road Blocks", desc: "Inform local police or the Ward Office about blockages so rescue teams can reach your area.", icon: "megaphone-outline", lib: "Ionicons", color: "#3498db" },
      { title: "Examine Foundation", desc: "Check your home for new cracks or tilting. If the ground shifted, the building may be unsafe.", icon: "business-outline", lib: "Ionicons", color: "#2ed573" },
      { title: "Help Neighbors Safely", desc: "Assist trapped people if safe, but don't enter unstable zones. Direct professional rescuers to them.", icon: "people-outline", lib: "Ionicons", color: "#2ed573" },
    ],
  },
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
  const [openSection, setOpenSection] = useState("Before");

  const onShare = async () => {
    try {
      await Share.share({
        message: `Stay Safe! Here are essential ${activeTab} safety tips for before, during, and after an emergency.`,
      });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const renderIcon = (item) => {
    const IconLib = item.lib === "MaterialCommunityIcons" ? MaterialCommunityIcons : item.lib === "Feather" ? Feather : Ionicons;
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
             <View style={[styles.dot, { backgroundColor: sectionName === "During" ? "#ff4757" : "#2ed573" }]} />
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
          <Text style={styles.headerTitle}>Safety Awareness</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* DISASTER TAB SELECTOR */}
        <View style={styles.toggleRow}>
          {["Flood", "Landslide"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.toggleBtn, activeTab === tab && styles.activeToggle]}
              onPress={() => {
                setActiveTab(tab);
                setOpenSection("Before");
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
          {renderAccordion("Before")}
          {renderAccordion("During")}
          {renderAccordion("After")}
        </ScrollView>

        {/* SHARE ACTION */}
        <TouchableOpacity style={[styles.shareBtn, { bottom: insets.bottom + 85 }]} onPress={onShare}>
          <Ionicons name="share-social" size={20} color="#fff" />
          <Text style={styles.shareText}>Share Safety Tips</Text>
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
  toggleText: { color: "#94a3b8", fontWeight: "600", fontSize: 15 },
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