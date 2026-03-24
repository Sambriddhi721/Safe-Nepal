import React, { useState, useContext, useRef, useEffect } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  Alert, ActivityIndicator, Animated, Platform, Vibration 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as Location from "expo-location";

export default function SOSScreen({ navigation }) {
  const [type, setType] = useState("Landslide");
  const [message, setMessage] = useState("");
  const [locationText, setLocationText] = useState("Fetching location...");
  const [isHolding, setIsHolding] = useState(false);

  // Animation Refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  const holdTimer = useRef(null);

  useEffect(() => {
    // Synchronized Pulse and Blink
    const animation = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 0.5, duration: 600, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ])
    );
    animation.start();
    fetchLocation();
    return () => animation.stop();
  }, []);

  const fetchLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationText("Permission denied");
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    setLocationText(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
  };

  const triggerSOS = () => {
    Vibration.vibrate([0, 500, 200, 500]);
    Alert.alert("SOS SENT", "Emergency services and your contacts have been notified.");
    setIsHolding(false);
  };

  const onPressIn = () => {
    setIsHolding(true);
    holdTimer.current = setTimeout(triggerSOS, 3000);
  };

  const onPressOut = () => {
    clearTimeout(holdTimer.current);
    setIsHolding(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>EMERGENCY ALERT</Text>
      <Text style={styles.subText}>Press and hold the button for 3 seconds to send an emergency alert.</Text>

      {/* SOS Blinking Container */}
      <View style={styles.sosWrapper}>
        <View style={styles.outerRing} />
        <View style={styles.middleRing} />
        <Animated.View style={{ transform: [{ scale: pulseAnim }], opacity: blinkAnim }}>
          <TouchableOpacity 
            style={[styles.sosButton, isHolding && styles.sosActive]} 
            onPressIn={onPressIn} 
            onPressOut={onPressOut}
            activeOpacity={0.9}
          >
            <Text style={styles.sosText}>SOS</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Quick Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.blueBtn} onPress={() => Linking.openURL("tel:100")}>
          <Ionicons name="call" size={20} color="white" />
          <Text style={styles.btnText}> Call Emergency</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.blueBtn} onPress={() => Linking.openURL("sms:100")}>
          <Ionicons name="mail" size={20} color="white" />
          <Text style={styles.btnText}> Send SMS</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Emergency Type</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity style={[styles.typeBtn, type === "Landslide" && styles.activeType]} onPress={() => setType("Landslide")}>
          <Ionicons name="warning" size={18} color="white" />
          <Text style={styles.typeText}> Landslide</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.typeBtn, type === "Flood" && styles.activeType]} onPress={() => setType("Flood")}>
          <Ionicons name="water" size={18} color="white" />
          <Text style={styles.typeText}> Flood</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Your Location</Text>
      <View style={styles.inputBox}>
        <Ionicons name="location" size={20} color="#F1C40F" />
        <Text style={styles.locValue}>{locationText}</Text>
        <TouchableOpacity onPress={fetchLocation}><Ionicons name="refresh" size={18} color="white" /></TouchableOpacity>
      </View>

      <TextInput 
        style={styles.messageInput} 
        placeholder="Add short message" 
        placeholderTextColor="#5F6E78" 
        value={message} 
        onChangeText={setMessage} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#121C22", padding: 25 },
  closeBtn: { marginTop: 20 },
  headerTitle: { color: "white", fontSize: 20, fontWeight: "bold", textAlign: "center", marginTop: -30 },
  subText: { color: "#8A9AA4", textAlign: "center", marginTop: 25, fontSize: 13, lineHeight: 20 },
  sosWrapper: { height: 300, justifyContent: 'center', alignItems: 'center' },
  outerRing: { position: 'absolute', width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(255,0,0,0.05)' },
  middleRing: { position: 'absolute', width: 190, height: 190, borderRadius: 95, backgroundColor: 'rgba(255,0,0,0.1)' },
  sosButton: { width: 130, height: 130, borderRadius: 65, backgroundColor: '#FF1E1E', justifyContent: 'center', alignItems: 'center', elevation: 15 },
  sosActive: { backgroundColor: '#B31212' },
  sosText: { color: 'white', fontSize: 36, fontWeight: '900' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  blueBtn: { backgroundColor: '#2196F3', flexDirection: 'row', padding: 16, borderRadius: 12, width: '48%', justifyContent: 'center', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 13 },
  sectionLabel: { color: '#F1C40F', fontWeight: 'bold', marginBottom: 12, fontSize: 14 },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  typeBtn: { flexDirection: 'row', backgroundColor: '#1C2931', padding: 15, borderRadius: 12, width: '48%', justifyContent: 'center', alignItems: 'center' },
  activeType: { borderWidth: 1, borderColor: 'white' },
  typeText: { color: 'white', fontWeight: 'bold' },
  inputBox: { backgroundColor: '#1C2931', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  locValue: { color: 'white', flex: 1, marginLeft: 10 },
  messageInput: { backgroundColor: '#1C2931', padding: 16, borderRadius: 12, color: 'white' }
});