import React, { useState, useMemo, useRef } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, FlatList, 
  TextInput, ScrollView, Platform, StatusBar 
} from "react-native";
import MapView, { Marker, Callout, UrlTile, PROVIDER_DEFAULT } from "react-native-maps";
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// --- 🏔️ NEPAL CRITICAL INFRASTRUCTURE DATA ---
const SAFETY_DATA = [
  { id: 'g1', name: 'TU Teaching Hospital (TUTH)', district: 'Kathmandu', type: 'Hospital', subtype: 'Government', lat: 27.7351, lng: 85.3303, detail: 'Level 1 Trauma' },
  { id: 'g2', name: 'Bir Hospital', district: 'Kathmandu', type: 'Hospital', subtype: 'Government', lat: 27.7061, lng: 85.3148, detail: 'Central Emergency' },
  { id: 'g3', name: 'Patan Hospital', district: 'Lalitpur', type: 'Hospital', subtype: 'Government', lat: 27.6685, lng: 85.3201, detail: 'Disaster Hub' },
  { id: 'p1', name: 'Nepal Mediciti', district: 'Lalitpur', type: 'Hospital', subtype: 'Private', lat: 27.6601, lng: 85.3032, detail: 'Heli-Rescue Avail.' },
  { id: 'p2', name: 'Grande International', district: 'Kathmandu', type: 'Hospital', subtype: 'Private', lat: 27.7508, lng: 85.3262, detail: 'Advanced ICU' },
  { id: 's1', name: 'Tudikhel Open Space', district: 'Kathmandu', type: 'Safe Zone', subtype: 'Flood', lat: 27.7015, lng: 85.3150, detail: 'Capacity: 100k+' },
  { id: 's2', name: 'Pokhara High Ground Hub', district: 'Kaski', type: 'Safe Zone', subtype: 'Landslide', lat: 28.2095, lng: 83.9914, detail: 'Elevated Zone' },
  { id: 's4', name: 'Itahari Emergency Shelter', district: 'Sunsari', type: 'Safe Zone', subtype: 'Flood', lat: 26.6661, lng: 87.2736, detail: 'Rescue Boat Point' },
];

export default function SafeZonesScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const mapRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  const filteredData = useMemo(() => {
    return SAFETY_DATA.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            item.district.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeTab === "All") return matchesSearch;
      if (activeTab === "Gov") return matchesSearch && item.subtype === "Government";
      if (activeTab === "Private") return matchesSearch && item.subtype === "Private";
      if (activeTab === "Safety") return matchesSearch && item.type === "Safe Zone";
      return matchesSearch;
    });
  }, [searchQuery, activeTab]);

  const getColor = (item) => {
    if (item.subtype === 'Government') return '#3b82f6';
    if (item.subtype === 'Private') return '#a855f7';
    if (item.subtype === 'Flood') return '#06b6d4';
    if (item.subtype === 'Landslide') return '#f59e0b';
    return '#10b981';
  };

  const focusOn = (lat, lng) => {
    mapRef.current?.animateToRegion({ 
      latitude: lat, 
      longitude: lng, 
      latitudeDelta: 0.015, 
      longitudeDelta: 0.015 
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* HEADER OVERLAY */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.topRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color="#94a3b8" />
            <TextInput 
              placeholder="Search facility or district..." 
              placeholderTextColor="#64748b"
              style={styles.input}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs}>
          {["All", "Gov", "Private", "Safety"].map(tab => (
            <TouchableOpacity 
              key={tab} 
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* MAP VIEW */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        mapType={Platform.OS === 'android' ? "none" : "standard"}
        initialRegion={{ 
          latitude: 27.7172, 
          longitude: 85.3240, 
          latitudeDelta: 0.2, 
          longitudeDelta: 0.2 
        }}
      >
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          shouldReplaceMapContent={true}
          zIndex={1}
        />

        {filteredData.map(item => (
          <Marker 
            key={item.id} 
            coordinate={{ latitude: item.lat, longitude: item.lng }}
            tracksViewChanges={false}
            zIndex={10}
          >
            <View style={[styles.marker, { backgroundColor: getColor(item) }]}>
              <MaterialCommunityIcons 
                name={item.type === 'Hospital' ? 'hospital-marker' : 'shield-check'} 
                size={20} color="#fff" 
              />
            </View>
            <Callout tooltip onPress={() => focusOn(item.lat, item.lng)}>
              <View style={styles.callout}>
                <Text style={styles.callTitle}>{item.name}</Text>
                <Text style={[styles.callSub, { color: getColor(item) }]}>
                  {item.subtype} {item.type}
                </Text>
                <Text style={styles.callDetail}>{item.detail}</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* BOTTOM LISTING */}
      <View style={[styles.bottomOverlay, { paddingBottom: insets.bottom + 20 }]}>
        <FlatList
          data={filteredData}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          snapToInterval={296}
          decelerationRate="fast"
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => focusOn(item.lat, item.lng)}
              activeOpacity={0.9}
            >
              <View style={styles.cardLeft}>
                <View style={[styles.cardIcon, { backgroundColor: `${getColor(item)}20` }]}>
                  <FontAwesome5 
                    name={item.subtype === 'Flood' ? 'water' : item.subtype === 'Landslide' ? 'mountain' : 'plus-square'} 
                    size={16} color={getColor(item)} 
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.cardDist}>{item.district} • {item.subtype}</Text>
                </View>
              </View>
              <View style={[styles.navBtn, { backgroundColor: getColor(item) }]}>
                <Feather name="navigation" size={18} color="#fff" />
              </View>
            </TouchableOpacity>
          )}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  map: { width: '100%', height: '100%' },
  header: { 
    position: 'absolute', 
    top: 0, 
    width: '100%', 
    zIndex: 10, 
    backgroundColor: 'rgba(15, 23, 42, 0.95)', 
    paddingHorizontal: 16, 
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b'
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center' },
  searchContainer: { 
    flex: 1, 
    height: 44, 
    backgroundColor: '#0f172a', 
    borderRadius: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 12, 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  input: { flex: 1, color: '#f8fafc', marginLeft: 10, fontSize: 14 },
  tabs: { marginTop: 15 },
  tab: { 
    paddingVertical: 8, 
    paddingHorizontal: 20, 
    borderRadius: 10, 
    backgroundColor: '#1e293b', 
    marginRight: 10, 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  activeTab: { backgroundColor: '#3b82f6', borderColor: '#60a5fa' },
  tabText: { color: '#94a3b8', fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  activeTabText: { color: '#fff' },
  marker: { padding: 6, borderRadius: 10, borderWidth: 2, borderColor: '#fff', elevation: 5 },
  callout: { 
    backgroundColor: '#0f172a', 
    padding: 15, 
    borderRadius: 12, 
    width: 220, 
    borderWidth: 1, 
    borderColor: '#334155' 
  },
  callTitle: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  callSub: { fontSize: 10, fontWeight: '900', marginVertical: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  callDetail: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  bottomOverlay: { position: 'absolute', bottom: 0, width: '100%' },
  card: { 
    backgroundColor: '#1e293b', 
    width: 280, 
    marginLeft: 16, 
    borderRadius: 16, 
    padding: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    borderWidth: 1, 
    borderColor: '#334155', 
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3
  },
  cardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  cardIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardName: { color: '#f8fafc', fontSize: 14, fontWeight: '700' },
  cardDist: { color: '#64748b', fontSize: 11, marginTop: 4 },
  navBtn: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' }
});