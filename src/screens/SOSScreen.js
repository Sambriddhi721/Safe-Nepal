import React, { useState, useRef, useEffect } from "react";
import { 
  View, Text, StyleSheet, TouchableOpacity, TextInput, 
  Alert, Animated, Vibration, Platform 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import * as Location from "expo-location";
import axios from 'axios';

// Ensure this IP matches your Flask server
const API_URL = 'http://192.168.111.70:5000';

export default function SOSScreen({ navigation }) {
  const [type, setType] = useState("Landslide");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState(null);
  const [locationText, setLocationText] = useState("Fetching location...");
  const [isHolding, setIsHolding] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animation Refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const holdProgress = useRef(new Animated.Value(0)).current;
  const holdTimer = useRef(null);

  useEffect(() => {
    // Pulsing Animation Loop
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    );
    pulse.start();
    fetchLocation();
    return () => pulse.stop();
  }, []);

  const fetchLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationText("Permission denied");
        return;
      }
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);
      setLocationText(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
    } catch (e) {
      setLocationText("Error getting location");
    }
  };

  const triggerSOS = async () => {
    if (!location) {
      Alert.alert("Error", "Wait for location fix before sending SOS.");
      setIsHolding(false);
      return;
    }

    setLoading(true);
    Vibration.vibrate([0, 500, 100, 500]); // Heavy vibration for success

    try {
      const payload = {
        lat: location.latitude,
        lng: location.longitude,
        type: type,
        message: message || `Immediate SOS: ${type} reported at this location.`,
        timestamp: new Date().toISOString()
      };

      // POST to your backend
      await axios.post(`${API_URL}/api/sos/report`, payload);
      
      Alert.alert(
        "SOS BROADCASTED", 
        "Your emergency has been pinned on the live map and responders are being notified.",
        [{ text: "OK", onPress: () => navigation.navigate("RealTimeMap") }]
      );
    } catch (err) {
      console.log("SOS Send Error:", err);
      Alert.alert("Network Error", "Failed to send SOS to server, but local alerts triggered.");
    } finally {
      setLoading(false);
      setIsHolding(false);
      holdProgress.setValue(0);
    }
  };

  const onPressIn = () => {
    setIsHolding(true);
    // Vibrate to let user know hold started
    Vibration.vibrate(100);
    
    // Start progress bar animation
    Animated.timing(holdProgress, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false
    }).start();

    holdTimer.current = setTimeout(triggerSOS, 3000);
  };

  const onPressOut = () => {
    clearTimeout(holdTimer.current);
    setIsHolding(false);
    // Reset progress if they let go early
    Animated.spring(holdProgress, { toValue: 0, useNativeDriver: false }).start();
  };

  // Interpolate width for the "Hold Progress" bar
  const progressWidth = holdProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="close" size={30} color="white" />
      </TouchableOpacity>

      <Text style={styles.headerTitle}>EMERGENCY ALERT</Text>
      <Text style={styles.subText}>
        Hold the button until the bar fills up to broadcast your emergency.
      </Text>

      {/* SOS Button Section */}
      <View style={styles.sosWrapper}>
        <Animated.View style={[styles.outerRing, { transform: [{ scale: pulseAnim }] }]} />
        
        <TouchableOpacity 
          style={[styles.sosButton, isHolding && styles.sosActive]} 
          onPressIn={onPressIn} 
          onPressOut={onPressOut}
          activeOpacity={0.9}
        >
          {loading ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <Text style={styles.sosText}>{isHolding ? "HOLD" : "SOS"}</Text>
          )}
        </TouchableOpacity>

        {/* Hold Progress Bar */}
        <View style={styles.progressContainer}>
          <Animated.View style={[styles.progressBar, { width: progressWidth }]} />
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.blueBtn} onPress={() => Linking.openURL("tel:100")}>
          <Ionicons name="call" size={20} color="white" />
          <Text style={styles.btnText}> Call 100</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.blueBtn} onPress={() => Linking.openURL("sms:100")}>
          <Ionicons name="mail" size={20} color="white" />
          <Text style={styles.btnText}> SMS 100</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Emergency Type</Text>
      <View style={styles.typeRow}>
        <TouchableOpacity 
            style={[styles.typeBtn, type === "Landslide" && styles.activeType]} 
            onPress={() => setType("Landslide")}
        >
          <Ionicons name="warning" size={18} color={type === "Landslide" ? "#FF1E1E" : "white"} />
          <Text style={styles.typeText}> Landslide</Text>
        </TouchableOpacity>
        <TouchableOpacity 
            style={[styles.typeBtn, type === "Flood" && styles.activeType]} 
            onPress={() => setType("Flood")}
        >
          <Ionicons name="water" size={18} color={type === "Flood" ? "#3b82f6" : "white"} />
          <Text style={styles.typeText}> Flood</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionLabel}>Location Context</Text>
      <View style={styles.inputBox}>
        <Ionicons name="location" size={20} color="#F1C40F" />
        <Text style={styles.locValue}>{locationText}</Text>
        <TouchableOpacity onPress={fetchLocation}>
            <Ionicons name="refresh" size={18} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      <TextInput 
        style={styles.messageInput} 
        placeholder="Help needed? (e.g. 5 people trapped)" 
        placeholderTextColor="#5F6E78" 
        value={message} 
        onChangeText={setMessage} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#020617", padding: 25 },
  closeBtn: { marginTop: 20 },
  headerTitle: { color: "white", fontSize: 22, fontWeight: "900", textAlign: "center", marginTop: -10 },
  subText: { color: "#94A3B8", textAlign: "center", marginTop: 20, fontSize: 14, lineHeight: 22 },
  
  sosWrapper: { height: 280, justifyContent: 'center', alignItems: 'center' },
  outerRing: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255, 30, 30, 0.15)' },
  sosButton: { width: 140, height: 140, borderRadius: 70, backgroundColor: '#FF1E1E', justifyContent: 'center', alignItems: 'center', elevation: 20, shadowColor: '#FF1E1E', shadowOpacity: 0.5, shadowRadius: 15 },
  sosActive: { backgroundColor: '#800000', transform: [{ scale: 0.95 }] },
  sosText: { color: 'white', fontSize: 32, fontWeight: '900' },
  
  progressContainer: { width: '80%', height: 6, backgroundColor: '#1e293b', borderRadius: 3, marginTop: 40, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#FF1E1E' },

  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  blueBtn: { backgroundColor: '#1e293b', borderWidth: 1, borderColor: '#334155', flexDirection: 'row', padding: 16, borderRadius: 16, width: '48%', justifyContent: 'center', alignItems: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' },

  sectionLabel: { color: '#F1C40F', fontWeight: '800', marginBottom: 10, fontSize: 12, textTransform: 'uppercase' },
  typeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  typeBtn: { flexDirection: 'row', backgroundColor: '#0f172a', padding: 15, borderRadius: 16, width: '48%', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1e293b' },
  activeType: { borderColor: '#F1C40F', backgroundColor: '#1e293b' },
  typeText: { color: 'white', fontWeight: 'bold' },

  inputBox: { backgroundColor: '#0f172a', padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#1e293b' },
  locValue: { color: '#F1F5F9', flex: 1, marginLeft: 10, fontSize: 13 },
  messageInput: { backgroundColor: '#0f172a', padding: 18, borderRadius: 16, color: 'white', borderWidth: 1, borderColor: '#1e293b' }
});