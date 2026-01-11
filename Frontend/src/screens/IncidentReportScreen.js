import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function IncidentReportScreen({ navigation }) {
  const reports = [
    {
      id: "1",
      title: "Melamchi, Sindhupalchowk",
      date: "15 Aug 2023, 10:30 AM",
      level: "High",
      status: "Verified",
      color: "#ff4d4d",
    },
    {
      id: "2",
      title: "Narayani River, Chitwan",
      date: "14 Aug 2023, 08:00 PM",
      level: "Medium",
      status: "Pending",
      color: "#f5c542",
    },
    {
      id: "3",
      title: "Koshi Barrage, Saptari",
      date: "12 Aug 2023, 03:45 PM",
      level: "Low",
      status: "Resolved",
      color: "#34c759",
    },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.leftBox}>
        <View style={[styles.iconBox, { backgroundColor: item.color }]}>
          <MaterialIcons name="report" size={20} color="#fff" />
        </View>
      </View>

      <View style={styles.textBox}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.date}>{item.date}</Text>

        <View style={styles.tagRow}>
          <View style={[styles.levelTag, { backgroundColor: item.color }]}>
            <Text style={styles.tagText}>{item.level}</Text>
          </View>

          <View style={styles.statusTag}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
      </View>

      <Ionicons name="map-outline" size={20} color="#aaa" />
    </View>
  );

  return (
    <LinearGradient colors={["#0f2027", "#203a43", "#2c5364"]} style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Incident Reports</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#aaa" />
        <TextInput
          placeholder="Search by location or keyword..."
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View>

      {/* FILTERS */}
      <View style={styles.filterRow}>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>Type</Text>
          <Ionicons name="chevron-down" size={14} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>Status</Text>
          <Ionicons name="chevron-down" size={14} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>Severity</Text>
          <Ionicons name="chevron-down" size={14} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* REPORT LIST */}
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 120 }}
        renderItem={renderItem}
      />

      {/* EMPTY BOX PREVIEW (DESIGN MATCH) */}
      <View style={styles.emptyBox}>
        <View style={styles.emptyIcon}>
          <Ionicons name="document-text" size={22} color="#aaa" />
        </View>
        <Text style={styles.emptyTitle}>No reports found</Text>
        <Text style={styles.emptyDesc}>
          Try adjusting your filters or create a new report.
        </Text>
      </View>

      {/* FLOATING ADD BUTTON */}
      <TouchableOpacity style={styles.fab}>
        <Ionicons name="add" size={26} color="#fff" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
    paddingHorizontal: 18,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b263b",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
  },

  searchInput: {
    color: "#fff",
    marginLeft: 8,
    flex: 1,
  },

  filterRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  filterBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1b263b",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },

  filterText: {
    color: "#fff",
    marginRight: 6,
    fontSize: 12,
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#1b263b",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  leftBox: {
    marginRight: 12,
  },

  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  textBox: {
    flex: 1,
  },

  title: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  date: {
    color: "#aaa",
    fontSize: 11,
    marginVertical: 2,
  },

  tagRow: {
    flexDirection: "row",
    marginTop: 6,
  },

  levelTag: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginRight: 8,
  },

  tagText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  statusTag: {
    backgroundColor: "#2c3e50",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
  },

  statusText: {
    color: "#fff",
    fontSize: 11,
  },

  emptyBox: {
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#444",
    borderStyle: "dashed",
    padding: 24,
    alignItems: "center",
  },

  emptyIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#1b263b",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  emptyTitle: {
    color: "#fff",
    fontWeight: "700",
    marginBottom: 6,
  },

  emptyDesc: {
    color: "#aaa",
    fontSize: 12,
    textAlign: "center",
  },

  fab: {
    position: "absolute",
    bottom: 26,
    right: 26,
    width: 56,
    height: 56,
    backgroundColor: "#1e90ff",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});
