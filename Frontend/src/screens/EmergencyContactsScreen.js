import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function EmergencyContactsScreen() {
  return (
    <LinearGradient colors={["#000000", "#121212"]} style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Emergency Contacts</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {/* CONTACT CARD */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="local-police" size={22} color="#fff" />
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>Nepal Police</Text>
              <Text style={styles.sub}>100</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.btnText}> Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.msgBtn}>
              <Ionicons name="chatbubble" size={16} color="#fff" />
              <Text style={styles.btnText}> Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AMBULANCE */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <FontAwesome5 name="ambulance" size={18} color="#fff" />
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>Ambulance / Hospital</Text>
              <Text style={styles.sub}>102</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.btnText}> Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.msgBtn}>
              <Ionicons name="chatbubble" size={16} color="#fff" />
              <Text style={styles.btnText}> Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FIRE */}
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconCircle}>
              <MaterialIcons name="local-fire-department" size={20} color="#fff" />
            </View>
            <View style={styles.info}>
              <Text style={styles.title}>Fire Department</Text>
              <Text style={styles.sub}>101</Text>
            </View>
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.callBtn}>
              <Ionicons name="call" size={16} color="#fff" />
              <Text style={styles.btnText}> Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.msgBtn}>
              <Ionicons name="chatbubble" size={16} color="#fff" />
              <Text style={styles.btnText}> Message</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* MY CONTACTS */}
        <Text style={styles.sectionTitle}>My Contacts</Text>

        <View style={styles.addBox}>
          <Text style={styles.addText}>
            Add personal contacts for quick access during an emergency.
          </Text>
        </View>
      </ScrollView>

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
  },

  header: {
    paddingTop: 55,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },

  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#1b1b1b",
    marginHorizontal: 16,
    marginBottom: 14,
    borderRadius: 16,
    padding: 14,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#0d47a1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },

  info: {
    flex: 1,
  },

  title: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },

  sub: {
    color: "#aaa",
    fontSize: 12,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  callBtn: {
    flex: 1,
    backgroundColor: "#e53935",
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    flexDirection: "row",
  },

  msgBtn: {
    flex: 1,
    backgroundColor: "#1e90ff",
    paddingVertical: 10,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    flexDirection: "row",
  },

  btnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },

  sectionTitle: {
    color: "#fff",
    fontWeight: "700",
    marginTop: 18,
    marginBottom: 10,
    marginHorizontal: 16,
  },

  addBox: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderColor: "#555",
    borderWidth: 1,
    borderStyle: "dashed",
    padding: 18,
    alignItems: "center",
  },

  addText: {
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
    backgroundColor: "#e53935",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
});
