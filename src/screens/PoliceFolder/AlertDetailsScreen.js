import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView,
  Linking,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";

// Conditionally import MapView — if react-native-maps is not installed,
// we fall back to a styled placeholder that doesn't crash the app.
let MapView, Marker;
try {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
} catch (_) {
  MapView = null;
  Marker = null;
}

const { width } = Dimensions.get("window");

// ── Map or fallback ──────────────────────────────────────────────────────────
const LocationMap = ({ lat, lng, location, color }) => {
  const latitude = lat || 27.7172;
  const longitude = lng || 85.324;

  if (!MapView) {
    // Graceful fallback: styled card with coordinates + "Open in Maps" link
    const mapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
    return (
      <View style={mapFallback.box}>
        <LinearGradient
          colors={["#0b1a2a", "#0f2744"]}
          style={mapFallback.gradient}
        >
          {/* Grid lines for visual depth */}
          {[...Array(6)].map((_, i) => (
            <View
              key={`h${i}`}
              style={[mapFallback.gridH, { top: `${i * 20}%` }]}
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <View
              key={`v${i}`}
              style={[mapFallback.gridV, { left: `${i * 20}%` }]}
            />
          ))}

          {/* Center pin */}
          <View style={mapFallback.pinWrap}>
            <View style={[mapFallback.pingRing, { borderColor: color }]} />
            <View style={[mapFallback.pingRing2, { borderColor: color }]} />
            <View style={[mapFallback.pinDot, { backgroundColor: color }]}>
              <Ionicons name="location-sharp" size={20} color="#fff" />
            </View>
          </View>

          {/* Coordinate badge */}
          <View style={mapFallback.coordBadge}>
            <Text style={mapFallback.coordText}>
              {latitude.toFixed(4)}°N · {longitude.toFixed(4)}°E
            </Text>
          </View>

          {/* Open in Maps */}
          <TouchableOpacity
            style={mapFallback.openBtn}
            onPress={() => Linking.openURL(mapsUrl)}
          >
            <Ionicons name="navigate" size={14} color="#1e90ff" />
            <Text style={mapFallback.openBtnText}>Open in Maps</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  // Real MapView when react-native-maps is available
  return (
    <MapView
      style={{ flex: 1 }}
      initialRegion={{
        latitude,
        longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      mapType="satellite"
    >
      {Marker && (
        <Marker coordinate={{ latitude, longitude }} pinColor={color} />
      )}
    </MapView>
  );
};

// ── Main Screen ──────────────────────────────────────────────────────────────
export default function AlertDetailsScreen({ route, navigation }) {
  const { alert } = route?.params || {};

  const handleGoBack = () => {
    if (navigation?.goBack) navigation.goBack();
  };

  const handleNavigate = (screen, params) => {
    if (navigation?.navigate) navigation.navigate(screen, params);
  };

  if (!alert) {
    return (
      <View style={styles.errorBox}>
        <MaterialIcons name="error-outline" size={80} color="#FF4D4D" />
        <Text style={styles.errorText}>Detailed intel unavailable.</Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back to Monitor</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isActive = alert.status === "Active";

  return (
    <View style={styles.mainContainer}>
      <StatusBar barStyle="light-content" />
      <ScrollView bounces={false} showsVerticalScrollIndicator={false}>

        {/* ── Map Hero ── */}
        <View style={styles.mapHero}>
          <LocationMap
            lat={alert.lat}
            lng={alert.lng}
            location={alert.location}
            color={alert.color || "#1e90ff"}
          />

          {/* Top Navigation Overlay */}
          <LinearGradient
            colors={["rgba(15,32,39,0.92)", "transparent"]}
            style={styles.topNavOverlay}
          >
            <SafeAreaView style={styles.navHeader}>
              <TouchableOpacity
                onPress={handleGoBack}
                style={styles.blurCircle}
              >
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.navTitle}>SITUATION REPORT</Text>
              <TouchableOpacity style={styles.blurCircle}>
                <Ionicons name="share-social" size={22} color="#fff" />
              </TouchableOpacity>
            </SafeAreaView>
          </LinearGradient>

          {/* Location Float Badge */}
          <View style={styles.locationFloat}>
            <Ionicons name="location-sharp" size={18} color="#FF4D4D" />
            <Text style={styles.locationFloatText}>{alert.location}</Text>
          </View>
        </View>

        {/* ── Detail Body ── */}
        <View style={styles.detailBody}>
          <View style={styles.dragHandle} />

          {/* Status Row */}
          <View style={styles.statusLine}>
            <View
              style={[
                styles.riskTag,
                {
                  backgroundColor: `${alert.color}20`,
                  borderColor: alert.color,
                },
              ]}
            >
              <Text style={[styles.riskTagText, { color: alert.color }]}>
                {alert.severity
                  ? alert.severity.toUpperCase()
                  : "UNKNOWN"}{" "}
                SEVERITY
              </Text>
            </View>
            <Text style={styles.metaTime}>
              {isActive ? "● LIVE BROADCAST" : "ARCHIVED ALERT"}
            </Text>
          </View>

          <Text style={styles.mainTitle}>{alert.title}</Text>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {isActive
                ? `Emergency warning for ${alert.location}. Critical ${alert.type.toLowerCase()} conditions detected. Authorities advise immediate action and strict adherence to safety protocols.`
                : `Past report of a ${alert.type.toLowerCase()} event in this sector. Data provided for historical monitoring and terrain assessment.`}
            </Text>
          </View>

          {/* Quick Stats Row */}
          <View style={styles.statsRow}>
            <StatPill
              icon="time-outline"
              label="Reported"
              value={alert.time}
            />
            <StatPill
              icon={alert.type === "Flood" ? "water" : "trending-down"}
              label="Type"
              value={alert.type}
              color={alert.color}
            />
            <StatPill
              icon="pulse-outline"
              label="Risk"
              value={alert.severity}
              color={alert.color}
            />
          </View>

          {/* Emergency Protocols */}
          <Text style={styles.sectionHeader}>Emergency Protocols</Text>
          <View style={styles.protocolContainer}>
            <ProtocolRow
              icon="office-building-marker"
              title="Relocation"
              desc="Evacuate to the nearest designated high-ground safety hub."
            />
            {alert.type === "Flood" ? (
              <ProtocolRow
                icon="car-off"
                title="Traffic Control"
                desc="Strictly avoid low-lying bridges and roads near water bodies."
              />
            ) : (
              <ProtocolRow
                icon="slope-downhill"
                title="Terrain Awareness"
                desc="Stay clear of steep rock faces and debris flow channels."
              />
            )}
            <ProtocolRow
              icon="broadcast"
              title="Comms"
              desc="Keep emergency radio active and charge all battery backups."
            />
          </View>

          {/* Action Buttons — Active only */}
          {isActive && (
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.callRescue}
                onPress={() => Linking.openURL("tel:1155")}
              >
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Local Units</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.sosBroadcast}
                onPress={() => handleNavigate("SOS")}
              >
                <MaterialIcons name="sos" size={30} color="#fff" />
                <Text style={styles.actionBtnText}>SOS ALERT</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

const ProtocolRow = ({ icon, title, desc }) => (
  <View style={styles.protocolItem}>
    <View style={styles.protocolIconBox}>
      <MaterialCommunityIcons name={icon} size={24} color="#1e90ff" />
    </View>
    <View style={styles.protocolTextBox}>
      <Text style={styles.protocolTitle}>{title}</Text>
      <Text style={styles.protocolDesc}>{desc}</Text>
    </View>
  </View>
);

const StatPill = ({ icon, label, value, color = "#6b7280" }) => (
  <View style={styles.statPill}>
    <Ionicons name={icon} size={16} color={color} />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

// ── Map Fallback Styles ──────────────────────────────────────────────────────
const mapFallback = StyleSheet.create({
  box: { flex: 1 },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
  },
  gridH: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(30,144,255,0.08)",
  },
  gridV: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: "rgba(30,144,255,0.08)",
  },
  pinWrap: { alignItems: "center", justifyContent: "center" },
  pingRing: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1,
    opacity: 0.3,
  },
  pingRing2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    opacity: 0.15,
  },
  pinDot: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
  },
  coordBadge: {
    position: "absolute",
    bottom: 55,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  coordText: { color: "#9ca3af", fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  openBtn: {
    position: "absolute",
    bottom: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30,144,255,0.12)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(30,144,255,0.3)",
  },
  openBtnText: { color: "#1e90ff", fontSize: 12, fontWeight: "700", marginLeft: 6 },
});

// ── Main Styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#0f2027" },
  errorBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f2027",
    padding: 40,
  },
  errorText: {
    color: "#9ca3af",
    fontSize: 16,
    marginTop: 20,
    textAlign: "center",
  },
  backBtn: {
    marginTop: 30,
    backgroundColor: "#1e90ff",
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  backBtnText: { color: "#fff", fontWeight: "800" },

  mapHero: { height: 380, width: "100%" },
  topNavOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
  },
  navHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: Platform.OS === "android" ? 10 : 0,
  },
  blurCircle: {
    width: 45,
    height: 45,
    borderRadius: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  navTitle: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 2,
  },
  locationFloat: {
    position: "absolute",
    bottom: 45,
    left: 20,
    backgroundColor: "#111827",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  locationFloatText: {
    color: "#fff",
    fontWeight: "700",
    marginLeft: 8,
    fontSize: 13,
  },

  detailBody: {
    padding: 25,
    backgroundColor: "#0f2027",
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    marginTop: -35,
    minHeight: 500,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#1f2937",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  statusLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  riskTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  riskTagText: { fontWeight: "900", fontSize: 10, letterSpacing: 1 },
  metaTime: { color: "#4b5563", fontSize: 11, fontWeight: "800" },
  mainTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  infoBox: {
    backgroundColor: "rgba(30,144,255,0.05)",
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(30,144,255,0.1)",
  },
  infoText: {
    color: "#9ca3af",
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "500",
  },

  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 30,
  },
  statPill: {
    flex: 1,
    backgroundColor: "#111827",
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
    gap: 4,
  },
  statLabel: { color: "#4b5563", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  statValue: { fontSize: 12, fontWeight: "900" },

  sectionHeader: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 20,
    letterSpacing: 0.5,
  },
  protocolContainer: { marginBottom: 30 },
  protocolItem: {
    flexDirection: "row",
    marginBottom: 25,
    alignItems: "center",
  },
  protocolIconBox: {
    width: 55,
    height: 55,
    borderRadius: 18,
    backgroundColor: "rgba(30,144,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
  },
  protocolTextBox: { flex: 1 },
  protocolTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 4,
  },
  protocolDesc: {
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },

  actionGrid: { flexDirection: "row", gap: 15, marginBottom: 40 },
  sosBroadcast: {
    flex: 1.5,
    backgroundColor: "#FF4D4D",
    height: 65,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  callRescue: {
    flex: 1,
    backgroundColor: "#1f2937",
    height: 65,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#374151",
  },
  actionBtnText: {
    color: "#fff",
    fontWeight: "900",
    marginLeft: 10,
    fontSize: 14,
    letterSpacing: 0.5,
  },
});