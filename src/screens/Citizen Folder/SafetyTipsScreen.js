import React, { useState, useCallback, memo, useEffect } from "react";
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
import { useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5, MaterialIcons } from "@expo/vector-icons";

const SAFETY_DATA = {
  "Disaster Safety": {
    Flood: {
      Before: [
        { title: "Pack SOS Bag", desc: "Include 3 liters of water per person, dry food, and a whistle.", icon: "briefcase-outline", lib: "Ionicons", color: "#ffa500" },
        { title: "Identify High Ground", desc: "Know the quickest route to safe zones like Tudikhel.", icon: "map-outline", lib: "Ionicons", color: "#3b82f6" },
      ],
      During: [
        { title: "Move Immediately", desc: "Seek higher ground instantly. Avoid walking through moving water.", icon: "trending-up", lib: "Feather", color: "#ff4757" },
        { title: "Turn Off Utilities", desc: "Switch off gas and electricity to prevent fire or electrocution.", icon: "power", lib: "Feather", color: "#ffa500" },
      ],
      After: [
        { title: "Wait for Clearance", desc: "Only return home when local authorities (DHM) say it is safe.", icon: "checkmark-circle-outline", lib: "Ionicons", color: "#2ed573" },
        { title: "Clean & Disinfect", desc: "Everything that got wet may have mud or sewage contamination.", icon: "shrub", lib: "Entypo", color: "#06b6d4" },
      ],
    },
    Landslide: {
      Before: [
        { title: "Watch Soil Cracks", desc: "Look for new cracks in the ground or tilted trees/fences.", icon: "alert-triangle-outline", lib: "Ionicons", color: "#ffa500" },
        { title: "Consult DHM Data", desc: "Check regional risk reports if you live on a slope.", icon: "bar-chart-outline", lib: "Ionicons", color: "#3b82f6" },
      ],
      During: [
        { title: "Run Perpendicular", desc: "Run sideways to the path of flow, not downhill.", icon: "run", lib: "MaterialCommunityIcons", color: "#ff4757" },
        { title: "Curl into a Ball", desc: "If you can't escape, protect your head and stay tight.", icon: "human-child", lib: "MaterialCommunityIcons", color: "#ffa500" },
      ],
      After: [
        { title: "Stay Away", desc: "Secondary landslides often follow the first one. Stay clear.", icon: "hand-right-outline", lib: "Ionicons", color: "#ff4757" },
        { title: "Check for Victims", desc: "Look for trapped people without entering the slide area.", icon: "person-search", lib: "MaterialIcons", color: "#2ed573" },
      ],
    },
  },
  "Medical/First Aid": {
    "Trauma & Injuries": [
      { title: "Severe Bleeding", desc: "Apply firm, direct pressure. Elevate the limb.", icon: "opacity", lib: "MaterialIcons", color: "#ff4757" },
      { title: "Fractures", desc: "Splint the limb to prevent movement. Do not straighten.", icon: "bone", lib: "FontAwesome5", color: "#ffa500" },
    ],
    "Environment": [
      { title: "Snake Bite", desc: "Keep the area still and below heart level. Seek help (102).", icon: "snake", lib: "MaterialCommunityIcons", color: "#ff4757" },
    ],
  }
};

const NavItem = memo(({ icon, label, active, onPress, lib = "Ionicons" }) => {
  const IconLib = lib === "MaterialCommunityIcons" ? MaterialCommunityIcons : Ionicons;
  return (
    <TouchableOpacity style={styles.navItem} onPress={onPress} activeOpacity={0.7}>
      <IconLib name={icon} size={22} color={active ? "#1e90ff" : "#aaa"} />
      <Text style={[styles.navText, active && styles.navTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
});

export default function SafetyTipsScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  const [activeTab, setActiveTab] = useState("Disaster Safety");
  const [openSection, setOpenSection] = useState("");

  useEffect(() => {
    if (route.params?.openMedical) setActiveTab("Medical/First Aid");
  }, [route.params]);

  const onShare = async () => {
    try {
      await Share.share({ message: `Emergency Guide: Check out these ${activeTab} tips from Safe Nepal!` });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const renderIcon = (item) => {
    const libs = { MaterialCommunityIcons, Feather, FontAwesome5, MaterialIcons, Ionicons };
    const IconLib = libs[item.lib] || Ionicons;
    return <IconLib name={item.icon} size={22} color={item.color} />;
  };

  const renderAccordion = useCallback((sectionName) => {
    const isOpen = openSection === sectionName;
    const content = SAFETY_DATA[activeTab][sectionName];

    return (
      <View key={`${activeTab}-${sectionName}`} style={styles.section}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setOpenSection(isOpen ? "" : sectionName)}
          activeOpacity={0.8}
        >
          <View style={styles.headerLeft}>
             <View style={[styles.dot, { backgroundColor: activeTab === "Medical/First Aid" ? "#ff4757" : "#3b82f6" }]} />
             <Text style={styles.sectionTitle}>{sectionName}</Text>
          </View>
          <Ionicons name={isOpen ? "chevron-up" : "chevron-down"} size={18} color="#fff" />
        </TouchableOpacity>

        {isOpen && (
          activeTab === "Disaster Safety" ? (
            // Nested Before/During/After logic
            Object.keys(content).map(stage => (
              <View key={stage} style={styles.stageContainer}>
                <Text style={styles.stageTitle}>{stage}</Text>
                {content[stage].map((item, idx) => (
                  <View key={`${stage}-${idx}`} style={styles.tipCard}>
                    <View style={styles.iconContainer}>{renderIcon(item)}</View>
                    <View style={styles.tipTextBox}>
                      <Text style={styles.tipTitle}>{item.title}</Text>
                      <Text style={styles.tipDesc}>{item.desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ))
          ) : (
            // Regular First Aid logic
            content.map((item, index) => (
              <View key={`tip-${index}`} style={styles.tipCard}>
                <View style={styles.iconContainer}>{renderIcon(item)}</View>
                <View style={styles.tipTextBox}>
                  <Text style={styles.tipTitle}>{item.title}</Text>
                  <Text style={styles.tipDesc}>{item.desc}</Text>
                </View>
              </View>
            ))
          )
        )}
      </View>
    );
  }, [activeTab, openSection]);

  return (
    <View style={styles.wrapper}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#0f2027", "#1e293b", "#0f172a"]} style={styles.container}>
        
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => navigation?.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Safety & Medical</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.toggleRow}>
          {Object.keys(SAFETY_DATA).map((tab) => (
            <TouchableOpacity
              key={`tab-${tab}`}
              style={[styles.toggleBtn, activeTab === tab && styles.activeToggle]}
              onPress={() => { setActiveTab(tab); setOpenSection(""); }}
            >
              <Text style={[styles.toggleText, activeTab === tab && styles.activeToggleText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
          {Object.keys(SAFETY_DATA[activeTab]).map(section => renderAccordion(section))}
        </ScrollView>

        <TouchableOpacity style={[styles.shareBtn, { bottom: insets.bottom + 85 }]} onPress={onShare}>
          <Ionicons name="share-social" size={20} color="#fff" />
          <Text style={styles.shareText}>Share Tips</Text>
        </TouchableOpacity>

        <View style={[styles.bottomNav, { paddingBottom: insets.bottom + 10 }]}>
          <NavItem icon="home-outline" label="Home" onPress={() => navigation?.navigate('Home')} />
          <NavItem icon="map-outline" label="Map" onPress={() => navigation?.navigate('RealTimeMap')} />
          <NavItem icon="home-city-outline" label="Safe Zones" lib="MaterialCommunityIcons" onPress={() => navigation?.navigate('SafeZones')} />
          <NavItem icon="shield-checkmark" label="Safety" active />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1 },
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingBottom: 15 },
  headerTitle: { flex: 1, textAlign: "center", color: "#fff", fontSize: 19, fontWeight: "800" },
  toggleRow: { flexDirection: "row", backgroundColor: "rgba(255, 255, 255, 0.1)", marginHorizontal: 16, borderRadius: 15, padding: 5, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12 },
  activeToggle: { backgroundColor: "#1e90ff" },
  toggleText: { color: "#94a3b8", fontWeight: "600", fontSize: 13 },
  activeToggleText: { color: "#fff" },
  section: { backgroundColor: "rgba(30, 41, 59, 0.7)", borderRadius: 18, marginHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.05)", overflow: "hidden" },
  sectionHeader: { padding: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 10 },
  sectionTitle: { color: "#fff", fontWeight: "700", fontSize: 16 },
  stageContainer: { paddingBottom: 10 },
  stageTitle: { color: "#1e90ff", fontWeight: "800", fontSize: 12, textTransform: "uppercase", marginLeft: 18, marginTop: 10, letterSpacing: 1 },
  tipCard: { flexDirection: "row", padding: 18 },
  iconContainer: { width: 42, height: 42, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", justifyContent: 'center', alignItems: 'center' },
  tipTextBox: { marginLeft: 15, flex: 1 },
  tipTitle: { color: "#fff", fontWeight: "700", fontSize: 15 },
  tipDesc: { color: "#94a3b8", fontSize: 13, marginTop: 5, lineHeight: 18 },
  shareBtn: { position: "absolute", alignSelf: "center", flexDirection: "row", backgroundColor: "#1e90ff", paddingVertical: 14, paddingHorizontal: 28, borderRadius: 30, elevation: 8, alignItems: 'center' },
  shareText: { color: "#fff", fontWeight: "800", fontSize: 14, marginLeft: 10 },
  bottomNav: { position: "absolute", bottom: 0, left: 0, right: 0, flexDirection: "row", backgroundColor: "#010101", paddingTop: 15, borderTopWidth: 1, borderTopColor: "rgba(255,255,255,0.1)" },
  navItem: { flex: 1, alignItems: "center" },
  navText: { color: "#94a3b8", fontSize: 10, marginTop: 5 },
  navTextActive: { color: "#1e90ff", fontWeight: "800" },
});