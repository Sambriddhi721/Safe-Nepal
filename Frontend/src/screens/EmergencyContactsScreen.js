import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform, // FIXED: Added missing Platform import
  Linking
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

export default function EmergencyContactsScreen({ navigation }) {

  const handleAction = (type, number) => {
    let url = "";
    if (type === 'tel') {
      url = `tel:${number}`;
    } else if (type === 'sms') {
      const message = "EMERGENCY! I need immediate help. Please track my phone.";
      // FIXED: Platform.OS now works because it is imported
      url = `sms:${number}${Platform.OS === 'ios' ? '&' : '?'}body=${encodeURIComponent(message)}`;
    }

    Linking.openURL(url).catch(() => {
      Alert.alert("Error", "Your device does not support this action.");
    });
  };

  const ContactCard = ({ title, number, icon, color }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: color }]}>
          <MaterialIcons name={icon} size={22} color="#fff" />
        </View>
        <View style={styles.info}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.sub}>{number}</Text>
        </View>
      </View>
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.callBtn} onPress={() => handleAction('tel', number)}>
          <Ionicons name="call" size={16} color="#fff" />
          <Text style={styles.btnText}> Call Now</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.sosBtn} onPress={() => handleAction('sms', number)}>
          <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
          <Text style={styles.btnText}> Send SOS</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={["#0f172a", "#1e293b"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
           <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nepal Emergency Services</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <ContactCard title="Nepal Police" number="100" icon="local-police" color="#0d47a1" />
        <ContactCard title="Fire Brigade" number="101" icon="fire-truck" color="#d32f2f" />
        <ContactCard title="Ambulance" number="102" icon="medical-services" color="#388e3c" />
        <ContactCard title="Traffic Police" number="103" icon="traffic" color="#fbc02d" />

        <Text style={styles.sectionTitle}>Personal Safety Tip</Text>
        <View style={styles.addBox}>
          <Text style={styles.addText}>
            In case of disaster, stay calm and call 100. Always keep your GPS turned on so responders can find you.
          </Text>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => Alert.alert("Feature Coming Soon", "The ability to add custom personal contacts is currently in development.")}
      >
        <Ionicons name="person-add" size={26} color="#fff" />
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingTop: 60, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 15 },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "bold" },
  card: { backgroundColor: "#1e293b", marginHorizontal: 16, marginBottom: 14, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#334155' },
  row: { flexDirection: "row", alignItems: "center" },
  iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", marginRight: 12 },
  info: { flex: 1 },
  title: { color: "#fff", fontWeight: "700", fontSize: 16 },
  sub: { color: "#94a3b8", fontSize: 13 },
  actionRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 15 },
  callBtn: { flex: 1, backgroundColor: "#059669", paddingVertical: 12, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 8, flexDirection: "row" },
  sosBtn: { flex: 1, backgroundColor: "#dc2626", paddingVertical: 12, borderRadius: 10, justifyContent: "center", alignItems: "center", marginLeft: 8, flexDirection: "row" },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 13 },
  sectionTitle: { color: "#fff", fontWeight: "700", marginTop: 20, marginBottom: 10, marginHorizontal: 16 },
  addBox: { marginHorizontal: 16, borderRadius: 14, borderColor: "#334155", borderWidth: 1, padding: 20, alignItems: "center" },
  addText: { color: "#94a3b8", fontSize: 13, textAlign: "center", lineHeight: 18 },
  fab: { position: "absolute", bottom: 30, right: 30, width: 60, height: 60, backgroundColor: "#3b82f6", borderRadius: 30, justifyContent: "center", alignItems: "center", elevation: 8 },
});