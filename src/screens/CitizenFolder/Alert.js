import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemeContext } from "../../context/ThemeContext";

//mock data
const ALL_MOCK_DATA = [
  {
    id: "1",
    title: "High Flood",
    severity: "High Severity",
    location: "Sindhupalchok District",
    time: "25 mins ago",
    type: "Flood",
    status: "Active",
    description:
      "Severe flooding reported along the Bhote Koshi River. Residents near riverbanks are advised to evacuate immediately. Water levels are 3 metres above danger level.",
    affectedPeople: "~1,200",
    reportedBy: "DHM Nepal",
  },
  {
    id: "2",
    title: "Risk of Flash Flood",
    severity: "High Severity",
    location: "Gorkha Municipality",
    time: "2 hours ago",
    type: "Flood",
    status: "Active",
    description:
      "Heavy rainfall upstream has raised flash flood risk significantly. Stay away from river banks and low-lying areas.",
    affectedPeople: "~850",
    reportedBy: "NDRRMA",
  },
  {
    id: "3",
    title: "Landslide Warning",
    severity: "Moderate Severity",
    location: "Manang District",
    time: "8 hours ago",
    type: "Landslide",
    status: "Active",
    description:
      "Continuous rainfall has destabilised slopes in the upper Manang valley. Road blockages possible. Avoid travel through mountain passes.",
    affectedPeople: "~300",
    reportedBy: "Department of Mines",
  },
  {
    id: "4",
    title: "Landslide Blockage",
    severity: "High Severity",
    location: "Rasuwa District",
    time: "12 hours ago",
    type: "Landslide",
    status: "Active",
    description:
      "Major landslide has blocked the Pasang Lhamu Highway. Rescue teams deployed. Do not attempt to clear debris without official clearance.",
    affectedPeople: "~560",
    reportedBy: "Armed Police Force",
  },
  {
    id: "5",
    title: "Flood Receded",
    severity: "Low Severity",
    location: "Bhaktapur District",
    time: "2 days ago",
    type: "Flood",
    status: "Past",
    description:
      "Flood waters have receded. Cleanup operations ongoing. Residents may return but should boil drinking water.",
    affectedPeople: "~400",
    reportedBy: "Municipality Office",
  },
  {
    id: "6",
    title: "Landslide Cleared",
    severity: "Moderate Severity",
    location: "Dolakha District",
    time: "3 days ago",
    type: "Landslide",
    status: "Past",
    description:
      "Road cleared after landslide. Engineers conducting safety inspection before reopening to heavy vehicles.",
    affectedPeople: "~200",
    reportedBy: "DoR Nepal",
  },
];

// ─── Severity config ──────────────────────────────────────────────────────────
const SEVERITY_CONFIG = {
  "High Severity":     { color: "#ef4444", bg: "#fef2f2" },
  "Moderate Severity": { color: "#f97316", bg: "#fff7ed" },
  "Low Severity":      { color: "#3b82f6", bg: "#eff6ff" },
};

const getSeverityStyle = (severity) =>
  SEVERITY_CONFIG[severity] || { color: "#64748b", bg: "#f1f5f9" };

// ─── Info Row (Detail Screen) ─────────────────────────────────────────────────
function InfoRow({ icon, label, value, textColor, subColor }) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={subColor} style={{ marginRight: 10 }} />
      <View>
        <Text style={[styles.infoLabel, { color: subColor }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: textColor }]}>{value}</Text>
      </View>
    </View>
  );
}

function Divider({ isDarkMode }) {
  return (
    <View
      style={[styles.divider, { backgroundColor: isDarkMode ? "#334155" : "#f1f5f9" }]}
    />
  );
}

// ─── Alert Detail Screen ──────────────────────────────────────────────────────
function AlertDetailScreen({ alert, onBack, isDarkMode }) {
  if (!alert) return null;

  const { color } = getSeverityStyle(alert.severity);
  const isFlood      = alert.type === "Flood";
  const cardBg       = isDarkMode ? "#1e293b" : "#ffffff";
  const textPrimary  = isDarkMode ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDarkMode ? "#94a3b8" : "#64748b";
  const containerBg  = isDarkMode ? "#0f172a" : "#f8fafc";

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: containerBg }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Alert Detail</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={{ padding: 20 }}>
        {/* Type Badge */}
        <View style={styles.detailTypeBadge}>
          <MaterialCommunityIcons
            name={isFlood ? "waves" : "terrain"}
            size={18}
            color={color}
          />
          <Text style={[styles.detailTypeText, { color }]}>{alert.type}</Text>
        </View>

        {/* Title */}
        <Text style={[styles.detailTitle, { color: textPrimary }]}>{alert.title}</Text>

        {/* Severity Badge */}
        <View
          style={[
            styles.severityBadge,
            {
              backgroundColor: isDarkMode ? "#1e293b" : getSeverityStyle(alert.severity).bg,
              borderColor: color,
            },
          ]}
        >
          <View style={[styles.severityDot, { backgroundColor: color }]} />
          <Text style={[styles.severityBadgeText, { color }]}>{alert.severity}</Text>
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
          <InfoRow icon="location-outline" label="Location"    value={alert.location}               textColor={textPrimary} subColor={textSecondary} />
          <Divider isDarkMode={isDarkMode} />
          <InfoRow icon="time-outline"     label="Reported"    value={alert.time}                   textColor={textPrimary} subColor={textSecondary} />
          <Divider isDarkMode={isDarkMode} />
          <InfoRow icon="people-outline"   label="Affected"    value={alert.affectedPeople + " people"} textColor={textPrimary} subColor={textSecondary} />
          <Divider isDarkMode={isDarkMode} />
          <InfoRow icon="shield-checkmark-outline" label="Reported By" value={alert.reportedBy}    textColor={textPrimary} subColor={textSecondary} />
        </View>

        {/* Description */}
        <View style={[styles.infoCard, { backgroundColor: cardBg, marginTop: 16 }]}>
          <Text style={[styles.descLabel, { color: textSecondary }]}>DESCRIPTION</Text>
          <Text style={[styles.descText, { color: textPrimary }]}>{alert.description}</Text>
        </View>

        {/* Status pill */}
        <View
          style={[
            styles.statusRow,
            { backgroundColor: alert.status === "Active" ? "#fef2f2" : "#f0fdf4" },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: alert.status === "Active" ? "#ef4444" : "#22c55e" },
            ]}
          />
          <Text
            style={[
              styles.statusText,
              { color: alert.status === "Active" ? "#ef4444" : "#22c55e" },
            ]}
          >
            {alert.status === "Active" ? "Currently Active" : "Resolved"}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Main Alert Screen ────────────────────────────────────────────────────────
export default function AlertScreen() {
  const { theme } = useContext(ThemeContext) || {};
  const isDarkMode = theme === "dark";

  const [activeTab, setActiveTab]         = useState("Active");
  const [filter, setFilter]               = useState("All");
  const [searchQuery, setSearchQuery]     = useState("");
  const [alerts, setAlerts]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  // ── Data loading ───────────────────────────────────────────────────────
  const loadData = useCallback(() => {
    setTimeout(() => {
      setAlerts(ALL_MOCK_DATA);
      setLoading(false);
      setRefreshing(false);
    }, 800);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // ── Filtering ──────────────────────────────────────────────────────────
  const filteredAlerts = alerts.filter((item) => {
    const matchesTab    = item.status === activeTab;
    const matchesFilter = filter === "All" || item.type === filter;
    const query         = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query);
    return matchesTab && matchesFilter && matchesSearch;
  });

  // ── Theme helpers ──────────────────────────────────────────────────────
  const containerBg = isDarkMode ? "#0f172a" : "#f8fafc";
  const cardBg      = isDarkMode ? "#1e293b" : "#ffffff";
  const inputBg     = isDarkMode ? "#1e293b" : "#e2e8f0";
  const textPrimary = isDarkMode ? "#f1f5f9" : "#0f172a";
  const textMuted   = isDarkMode ? "#94a3b8" : "#64748b";

  // ── Filter chips ───────────────────────────────────────────────────────
  const renderFilterChip = (label) => {
    const isActive = filter === label;
    return (
      <TouchableOpacity
        key={label}
        onPress={() => setFilter(label)}
        style={[
          styles.chip,
          {
            backgroundColor: isActive
              ? "#3b82f6"
              : isDarkMode ? "#334155" : "#e2e8f0",
          },
        ]}
      >
        <Text style={[styles.chipText, { color: isActive ? "#fff" : textMuted }]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // ── Alert card ─────────────────────────────────────────────────────────
  const renderAlertItem = ({ item }) => {
    const { color } = getSeverityStyle(item.severity);
    const isFlood   = item.type === "Flood";

    return (
      <TouchableOpacity
        style={[styles.alertCard, { backgroundColor: cardBg }]}
        activeOpacity={0.75}
        onPress={() => setSelectedAlert(item)}
      >
        <View style={[styles.sideIndicator, { backgroundColor: color }]} />

        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isDarkMode
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.03)",
            },
          ]}
        >
          <MaterialCommunityIcons
            name={isFlood ? "waves" : "terrain"}
            size={26}
            color={color}
          />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.cardRow}>
            <Text
              style={[styles.cardTitle, { color: textPrimary }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Text style={[styles.timeText, { color: textMuted }]}>{item.time}</Text>
          </View>

          <View style={styles.severityInlineRow}>
            <View style={[styles.severityDot, { backgroundColor: color }]} />
            <Text style={[styles.severityText, { color }]}>{item.severity}</Text>
          </View>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={textMuted} />
            <Text
              style={[styles.locationText, { color: textMuted }]}
              numberOfLines={1}
            >
              {item.location}
            </Text>
          </View>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={textMuted}
          style={{ marginRight: 12, alignSelf: "center" }}
        />
      </TouchableOpacity>
    );
  };

  // ── Empty state ────────────────────────────────────────────────────────
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="bell-off-outline" size={60} color={textMuted} />
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>No Alerts Found</Text>
      <Text style={[styles.emptySubtitle, { color: textMuted }]}>
        {searchQuery
          ? "Try a different search term."
          : "No alerts match the current filter."}
      </Text>
    </View>
  );

  // ── Show detail if selected ────────────────────────────────────────────
  if (selectedAlert) {
    return (
      <AlertDetailScreen
        alert={selectedAlert}
        onBack={() => setSelectedAlert(null)}
        isDarkMode={isDarkMode}
      />
    );
  }

  // ── Main list view ─────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: containerBg }]}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Alerts</Text>
        <TouchableOpacity>
          <Ionicons name="notifications-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: inputBg }]}>
        <Ionicons name="search" size={18} color={textMuted} style={styles.searchIcon} />
        <TextInput
          placeholder="Search by title or location..."
          placeholderTextColor={textMuted}
          style={[styles.searchInput, { color: textPrimary }]}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color={textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter chips */}
      <View style={styles.filterRow}>
        {["All", "Flood", "Landslide"].map(renderFilterChip)}
      </View>

      {/* Tabs */}
      <View
        style={[
          styles.tabContainer,
          { backgroundColor: isDarkMode ? "#1e293b" : "#e2e8f0" },
        ]}
      >
        {["Active", "Past"].map((tab) => {
          const count = alerts.filter(
            (a) => a.status === tab && (filter === "All" || a.type === filter)
          ).length;
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && [
                  styles.activeTab,
                  { backgroundColor: isDarkMode ? "#334155" : "#ffffff" },
                ],
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: activeTab === tab ? textPrimary : textMuted },
                ]}
              >
                {tab}
              </Text>
              {count > 0 && (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: tab === "Active" ? "#ef4444" : "#64748b" },
                  ]}
                >
                  <Text style={styles.badgeText}>{count}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List / Loader */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#3b82f6"
          style={{ marginTop: 40 }}
        />
      ) : (
        <FlatList
          data={filteredAlerts}
          renderItem={renderAlertItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.list,
            filteredAlerts.length === 0 && { flex: 1 },
          ]}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#3b82f6"
              colors={["#3b82f6"]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} activeOpacity={0.85}>
        <Ionicons name="help" size={26} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: "#0f172a",
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: "white" },
  backButton:  { padding: 4 },

  // Search
  searchContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 14,
    borderRadius: 12,
    alignItems: "center",
    paddingHorizontal: 14,
    height: 48,
  },
  searchIcon:  { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15 },

  // Filters
  filterRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 14,
    gap: 8,
  },
  chip:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  chipText: { fontSize: 13, fontWeight: "600" },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    borderRadius: 10,
    marginBottom: 16,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  activeTab: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText:   { fontWeight: "700", fontSize: 14 },
  badge:     { borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1, minWidth: 20, alignItems: "center" },
  badgeText: { color: "white", fontSize: 11, fontWeight: "bold" },

  // List
  list: { paddingHorizontal: 20, paddingBottom: 100 },

  // Card
  alertCard: {
    flexDirection: "row",
    borderRadius: 14,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  sideIndicator:    { width: 4 },
  iconContainer:    { width: 56, justifyContent: "center", alignItems: "center" },
  cardContent:      { flex: 1, paddingVertical: 14, paddingHorizontal: 12 },
  cardRow:          { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  cardTitle:        { fontSize: 16, fontWeight: "700", flex: 1, marginRight: 8 },
  timeText:         { fontSize: 11, marginTop: 2 },
  severityInlineRow:{ flexDirection: "row", alignItems: "center", marginBottom: 5 },
  severityDot:      { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  severityText:     { fontSize: 12, fontWeight: "700" },
  locationRow:      { flexDirection: "row", alignItems: "center" },
  locationText:     { fontSize: 12, marginLeft: 4, flex: 1 },

  // Empty
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 60 },
  emptyTitle:     { fontSize: 18, fontWeight: "700", marginTop: 16, marginBottom: 6 },
  emptySubtitle:  { fontSize: 14, textAlign: "center", paddingHorizontal: 40 },

  // FAB
  fab: {
    position: "absolute",
    bottom: 28,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3b82f6",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },

  // ── Detail Screen ──────────────────────────────────────────────────────
  detailTypeBadge:  { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 6 },
  detailTypeText:   { fontSize: 14, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  detailTitle:      { fontSize: 26, fontWeight: "800", marginBottom: 12, lineHeight: 32 },
  severityBadge:    { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", borderWidth: 1.5, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, marginBottom: 20 },
  severityBadgeText:{ fontSize: 13, fontWeight: "700", marginLeft: 6 },
  infoCard:         { borderRadius: 14, overflow: "hidden", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  infoRow:          { flexDirection: "row", alignItems: "center", padding: 14 },
  infoLabel:        { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 },
  infoValue:        { fontSize: 15, fontWeight: "600" },
  divider:          { height: 1, marginHorizontal: 14 },
  descLabel:        { fontSize: 11, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.4, padding: 14, paddingBottom: 0 },
  descText:         { fontSize: 15, lineHeight: 23, padding: 14, paddingTop: 6 },
  statusRow:        { flexDirection: "row", alignItems: "center", marginTop: 20, padding: 14, borderRadius: 12 },
  statusDot:        { width: 9, height: 9, borderRadius: 5, marginRight: 8 },
  statusText:       { fontSize: 14, fontWeight: "700" },
});