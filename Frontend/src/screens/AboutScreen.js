import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AboutScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Description from Prakop Alert */}
        <Text style={styles.description}>
          Prakop Alert, developed by the International Center for Integrated Mountain Development (ICIMOD) 
          in partnership with the Nepal Red Cross Society (NRCS) and Danish Red Cross (DRC), offers flood 
          and weather information to the users. The applications utilise data obtained from the High-Impact 
          Weather Assessment Toolkit (HIWAT) and the Flash Flood Prediction Tool (FFPT).
        </Text>
        
        <Text style={styles.sectionTitle}>Weather Terminology</Text>
        <View style={styles.divider} />
        
        {/* Weather Items with Icons */}
        <WeatherItem icon="cloud-outline" label="No rain" val="(0 mm)" />
        <WeatherItem icon="rainy-outline" label="Light rain" val="(0 - 10 mm)" />
        <WeatherItem icon="thunderstorm-outline" label="Moderate rain" val="(10 - 50 mm)" />
        <WeatherItem icon="water-outline" label="Heavy rain" val="(50 - 100 mm)" />

        {/* Rain Nepal Branding */}
        <View style={styles.brandingContainer}>
            <Text style={styles.brandName}>Rain Nepal</Text>
            <Text style={styles.version}>Version 1.3.6</Text>
            <Text style={styles.tagline}>Nepal's community safety platform for real-time reporting</Text>
            <Text style={styles.madeWith}>Made with ❤️ for Nepal</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const WeatherItem = ({ icon, label, val }) => (
  <View style={styles.weatherRow}>
    <Ionicons name={icon} size={30} color="#fff" />
    <View style={{ marginLeft: 18 }}>
      <Text style={styles.weatherLabel}>{label}</Text>
      <Text style={styles.weatherVal}>{val}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0070BA' }, // Blue theme
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15 },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  content: { padding: 25 },
  description: { color: '#fff', lineHeight: 24, fontSize: 16, marginBottom: 40 },
  sectionTitle: { color: '#fff', fontSize: 19, fontWeight: '700' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 15 },
  weatherRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  weatherLabel: { color: '#fff', fontSize: 17, fontWeight: '600' },
  weatherVal: { color: '#fff', fontSize: 14, opacity: 0.9, marginTop: 2 },
  brandingContainer: { marginTop: 40, alignItems: 'center', paddingBottom: 20 },
  brandName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  version: { color: '#fff', fontSize: 14, opacity: 0.8, marginTop: 5 },
  tagline: { color: '#fff', fontSize: 12, textAlign: 'center', marginTop: 15, opacity: 0.7, paddingHorizontal: 20 },
  madeWith: { color: '#fff', fontSize: 14, marginTop: 20, fontWeight: '600' }
});