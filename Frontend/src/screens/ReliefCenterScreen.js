import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function ReliefCentersScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("Latest");

  return (
    <LinearGradient colors={["#ffffff", "#f5f7fa"]} style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relief Centers & Aid</Text>
        <Ionicons name="notifications-outline" size={22} color="#000" />
      </View>

      {/* TABS */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "Latest" && styles.activeTab]}
          onPress={() => setActiveTab("Latest")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Latest" && styles.activeTabText,
            ]}
          >
            Latest
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, activeTab === "Trending" && styles.activeTab]}
          onPress={() => setActiveTab("Trending")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "Trending" && styles.activeTabText,
            ]}
          >
            Trending
          </Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color="#777" />
        <TextInput
          placeholder="Search by location or aid type"
          placeholderTextColor="#888"
          style={styles.searchInput}
        />
      </View>

      {/* LIST */}
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {/* CARD 1 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Red Cross Relief Camp</Text>
            <Text style={styles.time}>Posted 2h ago</Text>
          </View>

          <Text style={styles.desc}>
            Emergency supplies and temporary housing available for families
            displaced by the recent floods.
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#555" />
            <Text style={styles.locationText}> Pokhara Exhibition Center</Text>
          </View>

          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Ionicons name="fast-food-outline" size={14} color="#2979ff" />
              <Text style={styles.tagText}> Food</Text>
            </View>

            <View style={styles.tag}>
              <Ionicons name="home-outline" size={14} color="#2979ff" />
              <Text style={styles.tagText}> Shelter</Text>
            </View>

            <View style={styles.tag}>
              <MaterialCommunityIcons
                name="medical-bag"
                size={14}
                color="#2979ff"
              />
              <Text style={styles.tagText}> Medical</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.btnText}>View Details & Graphs</Text>
          </TouchableOpacity>
        </View>

        {/* CARD 2 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Community Kitchen Initiative</Text>
            <Text style={styles.time}>Posted 5h ago</Text>
          </View>

          <Text style={styles.desc}>
            Providing hot meals and clean drinking water to all affected
            individuals in the capital region.
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#555" />
            <Text style={styles.locationText}> Kathmandu Valley</Text>
          </View>

          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Ionicons name="fast-food-outline" size={14} color="#2979ff" />
              <Text style={styles.tagText}> Food</Text>
            </View>

            <View style={styles.tag}>
              <MaterialCommunityIcons name="water" size={14} color="#2979ff" />
              <Text style={styles.tagText}> Water</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.btnText}>View Details & Graphs</Text>
          </TouchableOpacity>
        </View>

        {/* CARD 3 */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Clothing Donation Drive</Text>
            <Text style={styles.time}>Posted 8h ago</Text>
          </View>

          <Text style={styles.desc}>
            Warm clothing, blankets, and essentials collection and distribution
            center for all age groups.
          </Text>

          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={14} color="#555" />
            <Text style={styles.locationText}> Lalitpur District</Text>
          </View>

          <View style={styles.tagRow}>
            <View style={styles.tag}>
              <Ionicons name="shirt-outline" size={14} color="#2979ff" />
              <Text style={styles.tagText}> Clothes</Text>
            </View>

            <View style={styles.tag}>
              <MaterialCommunityIcons
                name="bed-outline"
                size={14}
                color="#2979ff"
              />
              <Text style={styles.tagText}> Blankets</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.btnText}>View Details & Graphs</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#000",
  },

  tabRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 12,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderColor: "#ddd",
  },

  activeTab: {
    borderColor: "#2979ff",
  },

  tabText: {
    color: "#777",
    fontWeight: "600",
  },

  activeTabText: {
    color: "#2979ff",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eef2f7",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginBottom: 12,
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 14,
    elevation: 2,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  cardTitle: {
    fontWeight: "700",
    fontSize: 14,
  },

  time: {
    fontSize: 11,
    color: "#888",
  },

  desc: {
    color: "#555",
    fontSize: 13,
    marginVertical: 8,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  locationText: {
    color: "#555",
    fontSize: 12,
  },

  tagRow: {
    flexDirection: "row",
    marginBottom: 12,
  },

  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginRight: 8,
  },

  tagText: {
    color: "#2979ff",
    fontSize: 12,
    fontWeight: "600",
  },

  actionBtn: {
    backgroundColor: "#2979ff",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
  },
});
