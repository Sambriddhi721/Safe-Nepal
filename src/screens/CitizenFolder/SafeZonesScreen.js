import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
} from "react-native";
import MapView, {
  Marker,
  Callout,
  UrlTile,
  PROVIDER_DEFAULT,
} from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons, MaterialCommunityIcons, FontAwesome5, Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// ─── Data ─────────────────────────────────────────────────────────────────────
const SAFETY_DATA = [
  { id: "g1", name: "TU Teaching Hospital (TUTH)", district: "Kathmandu",  type: "Hospital",  subtype: "Government", lat: 27.7351, lng: 85.3303, detail: "Level 1 Trauma" },
  { id: "g2", name: "Bir Hospital",                district: "Kathmandu",  type: "Hospital",  subtype: "Government", lat: 27.7061, lng: 85.3148, detail: "Central Emergency" },
  { id: "g3", name: "Patan Hospital",              district: "Lalitpur",   type: "Hospital",  subtype: "Government", lat: 27.6685, lng: 85.3201, detail: "Disaster Hub" },
  { id: "p1", name: "Nepal Mediciti",              district: "Lalitpur",   type: "Hospital",  subtype: "Private",    lat: 27.6601, lng: 85.3032, detail: "Heli-Rescue Avail." },
  { id: "p2", name: "Grande International",        district: "Kathmandu",  type: "Hospital",  subtype: "Private",    lat: 27.7508, lng: 85.3262, detail: "Advanced ICU" },
  { id: "s1", name: "Tudikhel Open Space",         district: "Kathmandu",  type: "Safe Zone", subtype: "Flood",      lat: 27.7015, lng: 85.3150, detail: "Capacity: 100k+" },
  { id: "s2", name: "Pokhara High Ground Hub",     district: "Kaski",      type: "Safe Zone", subtype: "Landslide",  lat: 28.2095, lng: 83.9914, detail: "Elevated Zone" },
  { id: "s4", name: "Itahari Emergency Shelter",   district: "Sunsari",    type: "Safe Zone", subtype: "Flood",      lat: 26.6661, lng: 87.2736, detail: "Rescue Boat Point" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getColor = (item) => {
  if (item.subtype === "Government") return "#3b82f6";
  if (item.subtype === "Private")    return "#a855f7";
  if (item.subtype === "Flood")      return "#06b6d4";
  if (item.subtype === "Landslide")  return "#f59e0b";
  return "#10b981";
};

const getIcon = (item) => {
  if (item.type === "Hospital")           return "hospital-marker";
  if (item.subtype === "Flood")           return "waves";
  if (item.subtype === "Landslide")       return "terrain";
  return "shield-check";
};

/** Haversine distance in km */
const haversine = (lat1, lng1, lat2, lng2) => {
  const R  = 6371;
  const dL = ((lat2 - lat1) * Math.PI) / 180;
  const dG = ((lng2 - lng1) * Math.PI) / 180;
  const a  =
    Math.sin(dL / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dG / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const fmtDist = (km) =>
  km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;

// ─── Main Component ────────────────────────────────────────────────────────────
export default function SafeZonesScreen({ navigation }) {
  const insets  = useSafeAreaInsets();
  const mapRef  = useRef(null);

  const [searchQuery,    setSearchQuery]    = useState("");
  const [activeTab,      setActiveTab]      = useState("All");
  const [userLocation,   setUserLocation]   = useState(null);
  const [locationError,  setLocationError]  = useState(false);
  const [selectedItem,   setSelectedItem]   = useState(null);
  const flatListRef = useRef(null);

  // ── Get user location on mount ───────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError(true);
        return;
      }
      try {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coords = {
          latitude:  loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setUserLocation(coords);
        mapRef.current?.animateToRegion(
          { ...coords, latitudeDelta: 0.12, longitudeDelta: 0.12 },
          800
        );
      } catch {
        setLocationError(true);
      }
    })();
  }, []);

  // ── Re-center to user location ───────────────────────────────────────────
  const locateMe = useCallback(() => {
    if (!userLocation) {
      Alert.alert(
        "Location Unavailable",
        "Please enable location permissions in Settings."
      );
      return;
    }
    mapRef.current?.animateToRegion(
      { ...userLocation, latitudeDelta: 0.06, longitudeDelta: 0.06 },
      800
    );
  }, [userLocation]);

  // ── Filter + sort by distance ────────────────────────────────────────────
  const filteredData = useMemo(() => {
    const result = SAFETY_DATA.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        item.name.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (activeTab === "Gov")     return item.subtype === "Government";
      if (activeTab === "Private") return item.subtype === "Private";
      if (activeTab === "Safety")  return item.type === "Safe Zone";
      return true; // "All"
    });

    // Sort by distance if we have location
    if (userLocation) {
      result.sort(
        (a, b) =>
          haversine(userLocation.latitude, userLocation.longitude, a.lat, a.lng) -
          haversine(userLocation.latitude, userLocation.longitude, b.lat, b.lng)
      );
    }
    return result;
  }, [searchQuery, activeTab, userLocation]);

  // ── Fly to marker + scroll card list ────────────────────────────────────
  const focusOn = useCallback((item) => {
    setSelectedItem(item.id);
    mapRef.current?.animateToRegion(
      {
        latitude:       item.lat - 0.004, // offset so callout not hidden by header
        longitude:      item.lng,
        latitudeDelta:  0.018,
        longitudeDelta: 0.018,
      },
      700
    );
    const idx = filteredData.findIndex((d) => d.id === item.id);
    if (idx >= 0) {
      flatListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
    }
  }, [filteredData]);

  // ── Header height estimate (for map padding) ─────────────────────────────
  const HEADER_H = insets.top + 115;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* ── MAP (behind everything) ─────────────────────────────────────── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_DEFAULT}
        mapType="none"
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={false}
        mapPadding={{ top: HEADER_H, bottom: 160, left: 0, right: 0 }}
        initialRegion={{
          latitude:       27.7172,
          longitude:      85.3240,
          latitudeDelta:  0.25,
          longitudeDelta: 0.25,
        }}
      >
        {/* OpenStreetMap tiles — works on both Android & iOS, no API key needed */}
        <UrlTile
          urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
          shouldReplaceMapContent={true}
          flipY={false}
          zIndex={1}
        />

        {filteredData.map((item) => {
          const isSelected = selectedItem === item.id;
          return (
            <Marker
              key={item.id}
              coordinate={{ latitude: item.lat, longitude: item.lng }}
              tracksViewChanges={false}
              zIndex={isSelected ? 20 : 10}
              onPress={() => focusOn(item)}
            >
              {/* Custom marker bubble */}
              <View
                style={[
                  styles.marker,
                  { backgroundColor: getColor(item) },
                  isSelected && styles.markerSelected,
                ]}
              >
                <MaterialCommunityIcons
                  name={getIcon(item)}
                  size={isSelected ? 22 : 18}
                  color="#fff"
                />
              </View>

              {/* Callout popup */}
              <Callout tooltip>
                <View style={styles.callout}>
                  <Text style={styles.callTitle}>{item.name}</Text>
                  <Text style={[styles.callSub, { color: getColor(item) }]}>
                    {item.subtype} {item.type}
                  </Text>
                  <Text style={styles.callDetail}>{item.detail}</Text>
                  {userLocation && (
                    <Text style={styles.callDist}>
                      📍{" "}
                      {fmtDist(
                        haversine(
                          userLocation.latitude,
                          userLocation.longitude,
                          item.lat,
                          item.lng
                        )
                      )}{" "}
                      away
                    </Text>
                  )}
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* ── HEADER OVERLAY ─────────────────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.topRow}>
          <TouchableOpacity
            onPress={() => navigation?.goBack()}
            style={styles.iconBtn}
          >
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>

          <View style={styles.searchContainer}>
            <Ionicons name="search" size={16} color="#94a3b8" />
            <TextInput
              placeholder="Search facility or district..."
              placeholderTextColor="#64748b"
              style={styles.input}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={16} color="#64748b" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Filter tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tabsScroll}
          contentContainerStyle={{ paddingRight: 16 }}
        >
          {[
            { key: "All",     label: "All",        icon: "apps-outline" },
            { key: "Gov",     label: "Gov't",      icon: "business-outline" },
            { key: "Private", label: "Private",    icon: "medkit-outline" },
            { key: "Safety",  label: "Safe Zones", icon: "shield-checkmark-outline" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            >
              <Ionicons
                name={tab.icon}
                size={13}
                color={activeTab === tab.key ? "#fff" : "#94a3b8"}
                style={{ marginRight: 5 }}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── LOCATE ME FAB ──────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[styles.locateFab, { bottom: 170 + insets.bottom }]}
        onPress={locateMe}
        activeOpacity={0.85}
      >
        <Ionicons name="locate" size={22} color="#fff" />
      </TouchableOpacity>

      {/* ── LEGEND ─────────────────────────────────────────────────────── */}
      <View style={[styles.legend, { bottom: 170 + insets.bottom }]}>
        {[
          { color: "#3b82f6", label: "Gov't Hospital" },
          { color: "#a855f7", label: "Private Hospital" },
          { color: "#06b6d4", label: "Flood Safe Zone" },
          { color: "#f59e0b", label: "Landslide Safe Zone" },
        ].map((l) => (
          <View key={l.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: l.color }]} />
            <Text style={styles.legendText}>{l.label}</Text>
          </View>
        ))}
      </View>

      {/* ── BOTTOM CARD LIST ───────────────────────────────────────────── */}
      <View style={[styles.bottomOverlay, { paddingBottom: insets.bottom + 12 }]}>
        <Text style={styles.nearbyLabel}>
          {userLocation
            ? `${filteredData.length} locations nearby`
            : `${filteredData.length} locations`}
        </Text>

        {filteredData.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="search-outline" size={24} color="#64748b" />
            <Text style={styles.emptyText}>No locations match your search</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={filteredData}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            snapToInterval={296}
            decelerationRate="fast"
            contentContainerStyle={{ paddingHorizontal: 16 }}
            onScrollToIndexFailed={() => {}}
            renderItem={({ item }) => {
              const isSelected = selectedItem === item.id;
              const dist = userLocation
                ? haversine(
                    userLocation.latitude,
                    userLocation.longitude,
                    item.lat,
                    item.lng
                  )
                : null;

              return (
                <TouchableOpacity
                  style={[
                    styles.card,
                    isSelected && {
                      borderColor: getColor(item),
                      borderWidth: 2,
                    },
                  ]}
                  onPress={() => focusOn(item)}
                  activeOpacity={0.88}
                >
                  <View style={styles.cardLeft}>
                    <View
                      style={[
                        styles.cardIcon,
                        { backgroundColor: `${getColor(item)}22` },
                      ]}
                    >
                      <MaterialCommunityIcons
                        name={getIcon(item)}
                        size={20}
                        color={getColor(item)}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardName} numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text style={styles.cardDist}>
                        {item.district} •{" "}
                        <Text style={{ color: getColor(item) }}>
                          {item.subtype}
                        </Text>
                      </Text>
                      {dist !== null && (
                        <Text style={styles.cardDistance}>
                          📍 {fmtDist(dist)} away
                        </Text>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.navBtn, { backgroundColor: getColor(item) }]}
                    onPress={() => focusOn(item)}
                  >
                    <Feather name="navigation" size={16} color="#fff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617" },

  // Header
  header: {
    position: "absolute",
    top: 0,
    width: "100%",
    zIndex: 10,
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
  },
  topRow:          { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn:         { width: 42, height: 42, borderRadius: 11, backgroundColor: "#1e293b", justifyContent: "center", alignItems: "center" },
  searchContainer: { flex: 1, height: 42, backgroundColor: "#0f172a", borderRadius: 11, flexDirection: "row", alignItems: "center", paddingHorizontal: 12, borderWidth: 1, borderColor: "#334155" },
  input:           { flex: 1, color: "#f8fafc", marginLeft: 8, fontSize: 14 },
  tabsScroll:      { marginTop: 12 },
  tab:             { flexDirection: "row", alignItems: "center", paddingVertical: 7, paddingHorizontal: 14, borderRadius: 9, backgroundColor: "#1e293b", marginRight: 8, borderWidth: 1, borderColor: "#334155" },
  activeTab:       { backgroundColor: "#3b82f6", borderColor: "#60a5fa" },
  tabText:         { color: "#94a3b8", fontSize: 11, fontWeight: "700", letterSpacing: 0.3 },
  activeTabText:   { color: "#fff" },

  // Markers
  marker:         { padding: 7, borderRadius: 11, borderWidth: 2.5, borderColor: "#fff", elevation: 6, shadowColor: "#000", shadowOpacity: 0.35, shadowRadius: 4 },
  markerSelected: { padding: 9, borderColor: "#fbbf24", borderWidth: 3, elevation: 10 },

  // Callout
  callout:   { backgroundColor: "#0f172a", padding: 14, borderRadius: 12, width: 210, borderWidth: 1, borderColor: "#334155" },
  callTitle: { color: "#fff", fontWeight: "800", fontSize: 13, marginBottom: 3 },
  callSub:   { fontSize: 10, fontWeight: "900", marginBottom: 2, textTransform: "uppercase", letterSpacing: 0.5 },
  callDetail:{ color: "#94a3b8", fontSize: 12 },
  callDist:  { color: "#64748b", fontSize: 11, marginTop: 6 },

  // Locate FAB
  locateFab: { position: "absolute", right: 16, width: 46, height: 46, borderRadius: 13, backgroundColor: "#1e293b", borderWidth: 1, borderColor: "#334155", justifyContent: "center", alignItems: "center", elevation: 6, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 6 },

  // Legend
  legend:     { position: "absolute", left: 16, backgroundColor: "rgba(15,23,42,0.9)", padding: 10, borderRadius: 12, borderWidth: 1, borderColor: "#1e293b" },
  legendItem: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  legendDot:  { width: 10, height: 10, borderRadius: 5, marginRight: 7 },
  legendText: { color: "#94a3b8", fontSize: 10, fontWeight: "600" },

  // Bottom cards
  bottomOverlay: { position: "absolute", bottom: 0, width: "100%" },
  nearbyLabel:   { color: "#64748b", fontSize: 12, fontWeight: "700", paddingHorizontal: 20, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 },
  card:          { backgroundColor: "#1e293b", width: 280, marginRight: 12, borderRadius: 16, padding: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderWidth: 1, borderColor: "#334155", elevation: 10, shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 6 },
  cardLeft:      { flexDirection: "row", alignItems: "center", flex: 1, gap: 12 },
  cardIcon:      { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  cardName:      { color: "#f8fafc", fontSize: 14, fontWeight: "700" },
  cardDist:      { color: "#64748b", fontSize: 11, marginTop: 3 },
  cardDistance:  { color: "#475569", fontSize: 10, marginTop: 2 },
  navBtn:        { width: 38, height: 38, borderRadius: 10, justifyContent: "center", alignItems: "center" },

  // Empty
  emptyCard: { backgroundColor: "#1e293b", marginHorizontal: 16, borderRadius: 16, padding: 20, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "#334155" },
  emptyText: { color: "#64748b", fontSize: 14 },
});