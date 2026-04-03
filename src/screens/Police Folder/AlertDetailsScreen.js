import React from "react";
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  Dimensions, SafeAreaView, Platform, StatusBar 
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import SafeMapView from "../../components/SafeMapView";

const { width } = Dimensions.get("window");

export default function AlertDetailsScreen({ route, navigation }) {
  const { alert } = route.params || {};

  if (!alert) {
    return (
      <View style={styles.errorBox}>
        <MaterialIcons name="error-outline" size={80} color="#FF4D4D" />
        <Text style={styles.errorText}>Detailed intel unavailable.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
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
        
        {/* Map Header */}
        <View style={styles.mapHero}>
          <SafeMapView
            style={styles.map}
            region={{
              latitude: alert.lat || 27.7172, 
              longitude: alert.lng || 85.324,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
          />
          <LinearGradient colors={["rgba(15,32,39,0.9)", "transparent"]} style={styles.topNavOverlay}>
            <SafeAreaView style={styles.navHeader}>
              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.blurCircle}>
                <Ionicons name="chevron-back" size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.navTitle}>SITUATION REPORT</Text>
              <TouchableOpacity style={styles.blurCircle}>
                <Ionicons name="share-social" size={22} color="#fff" />
              </TouchableOpacity>
            </SafeAreaView>
          </LinearGradient>
          
          <View style={styles.locationFloat}>
            <Ionicons name="location-sharp" size={18} color="#FF4D4D" />
            <Text style={styles.locationFloatText}>{alert.location}</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.detailBody}>
          <View style={styles.dragHandle} />
          
          <View style={styles.statusLine}>
            <View style={[styles.riskTag, { backgroundColor: `${alert.color}20`, borderColor: alert.color }]}>
              <Text style={[styles.riskTagText, { color: alert.color }]}>{alert.severity.toUpperCase()} SEVERITY</Text>
            </View>
            <Text style={styles.metaTime}>{isActive ? "LIVE BROADCAST" : "ARCHIVED ALERT"}</Text>
          </View>

          <Text style={styles.mainTitle}>{alert.title}</Text>
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              {isActive 
                ? `Emergency warning for ${alert.location}. Critical ${alert.type.toLowerCase()} conditions detected. Authorities advise immediate action and strict adherence to safety protocols.`
                : `Past report of a ${alert.type.toLowerCase()} event in this sector. Data provided for historical monitoring and terrain assessment.`}
            </Text>
          </View>

          {/* Safety Protocols */}
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

          {/* Emergency Actions */}
          {isActive && (
            <View style={styles.actionGrid}>
              <TouchableOpacity style={styles.callRescue}>
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.actionBtnText}>Local Units</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.sosBroadcast}
                onPress={() => navigation.navigate("SOS")}
              >
                <MaterialIcons name="sos" size={30} color="#fff" />
                <Text style={styles.actionBtnText}>SOS ALERT</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

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

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: "#0f2027" },
  errorBox: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0f2027", padding: 40 },
  errorText: { color: "#9ca3af", fontSize: 16, marginTop: 20, textAlign: 'center' },
  backBtn: { marginTop: 30, backgroundColor: "#1e90ff", paddingHorizontal: 30, paddingVertical: 15, borderRadius: 12 },
  backBtnText: { color: '#fff', fontWeight: '800' },
  
  mapHero: { height: 380, width: '100%' },
  map: { flex: 1 },
  topNavOverlay: { position: 'absolute', top: 0, left: 0, right: 0, height: 120 },
  navHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: Platform.OS === 'android' ? 30 : 0 },
  blurCircle: { width: 45, height: 45, borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  navTitle: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 2 },
  locationFloat: { position: 'absolute', bottom: 45, left: 20, backgroundColor: '#111827', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 15, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#1f2937' },
  locationFloatText: { color: '#fff', fontWeight: '700', marginLeft: 8, fontSize: 13 },
  
  detailBody: { padding: 25, backgroundColor: '#0f2027', borderTopLeftRadius: 35, borderTopRightRadius: 35, marginTop: -35, flex: 1, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  dragHandle: { width: 40, height: 4, backgroundColor: '#1f2937', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  statusLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  riskTag: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  riskTagText: { fontWeight: '900', fontSize: 10, letterSpacing: 1 },
  metaTime: { color: '#4b5563', fontSize: 11, fontWeight: '800' },
  mainTitle: { color: '#fff', fontSize: 30, fontWeight: '800', marginBottom: 20, letterSpacing: -0.5 },
  infoBox: { backgroundColor: 'rgba(30,144,255,0.05)', padding: 20, borderRadius: 20, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(30,144,255,0.1)' },
  infoText: { color: '#9ca3af', fontSize: 15, lineHeight: 24, fontWeight: '500' },
  sectionHeader: { color: '#fff', fontSize: 20, fontWeight: '800', marginBottom: 20, letterSpacing: 0.5 },
  protocolContainer: { marginBottom: 30 },
  protocolItem: { flexDirection: 'row', marginBottom: 25, alignItems: 'center' },
  protocolIconBox: { width: 55, height: 55, borderRadius: 18, backgroundColor: 'rgba(30,144,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 18 },
  protocolTextBox: { flex: 1 },
  protocolTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  protocolDesc: { color: '#6b7280', fontSize: 13, lineHeight: 18, fontWeight: '500' },
  
  actionGrid: { flexDirection: 'row', gap: 15, marginBottom: 20 },
  sosBroadcast: { flex: 1.5, backgroundColor: '#FF4D4D', height: 65, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 5 },
  callRescue: { flex: 1, backgroundColor: '#1f2937', height: 65, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#374151' },
  actionBtnText: { color: '#fff', fontWeight: '900', marginLeft: 10, fontSize: 14, letterSpacing: 0.5 }
});