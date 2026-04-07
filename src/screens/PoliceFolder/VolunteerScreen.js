import React, { useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Alert, Platform, ScrollView, StatusBar 
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from "expo-linear-gradient";

// Path depth based on your project structure
import { ThemeContext } from '../../context/ThemeContext';

const CATEGORIES = ["All", "Medical", "Supplies", "Labor", "Food"];

const MOCK_REQUESTS = [
  {
    id: '1',
    title: 'Clean Water Needed',
    location: 'Kathmandu, Ward 4',
    description: 'Drinking water supply disrupted. Need 2-3 jars for an elderly couple.',
    type: 'Supplies',
    time: '10m ago',
    icon: 'faucet',
    color: '#3b82f6'
  },
  {
    id: '2',
    title: 'First Aid Kit / Bandages',
    location: 'Lalitpur, Ward 2',
    description: 'Minor injuries from debris. Need antiseptic and clean bandages immediately.',
    type: 'Medical',
    icon: 'first-aid',
    color: '#ef4444'
  },
  {
    id: '3',
    title: 'Debris Clearance',
    location: 'Bhaktapur',
    description: 'Landslide blocking alley. Need 2 people with shovels and basic clearing tools.',
    type: 'Labor',
    icon: 'tools',
    color: '#f59e0b'
  }
];

export default function VolunteerScreen({ navigation }) {
  const { colors, theme } = useContext(ThemeContext);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const isDark = theme === 'dark';

  const filteredRequests = selectedCategory === "All" 
    ? MOCK_REQUESTS 
    : MOCK_REQUESTS.filter(req => req.type === selectedCategory);

  const handleVolunteer = (title) => {
    Alert.alert(
      "Confirm Commitment", 
      `Are you sure you want to volunteer for: ${title}?`, 
      [
        { text: "Go Back", style: "cancel" },
        { 
          text: "I'm on my way", 
          onPress: () => Alert.alert("Confirmed!", "The requester has been notified. Please stay safe while traveling.") 
        }
      ]
    );
  };

  return (
    <LinearGradient 
      colors={isDark ? ["#0f2027", "#13262f", "#0f2027"] : ["#f8fafc", "#f1f5f9"]} 
      style={styles.container}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <SafeAreaView style={styles.safeArea}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.navCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]} 
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={[styles.headerSubtitle, { color: '#3b82f6' }]}>COMMUNITY SUPPORT</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Help Near Me</Text>
          </View>
          <TouchableOpacity style={[styles.navCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' }]}>
            <Ionicons name="filter-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity 
                key={cat} 
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.chip, 
                  selectedCategory === cat ? styles.activeChip : { backgroundColor: isDark ? "#111827" : "#fff", borderColor: isDark ? '#1e293b' : '#e2e8f0' }
                ]}
              >
                <Text style={[styles.chipText, { color: selectedCategory === cat ? "#fff" : (isDark ? "#6b7280" : "#475569") }]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <FlatList
          data={filteredRequests}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: isDark ? "#111827" : "#fff", borderColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: `${item.color}15` }]}>
                  <FontAwesome5 name={item.icon} size={18} color={item.color} />
                </View>
                <View style={styles.cardHeaderInfo}>
                  <View style={styles.badgeRow}>
                    <Text style={[styles.typeLabel, { color: item.color }]}>{item.type.toUpperCase()}</Text>
                    <Text style={styles.timeLabel}>{item.time}</Text>
                  </View>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                </View>
              </View>

              <View style={styles.locationContainer}>
                <Ionicons name="location" size={14} color="#3b82f6" />
                <Text style={[styles.locationText, { color: colors.subText }]}>{item.location}</Text>
              </View>
              
              <Text style={[styles.description, { color: isDark ? '#9ca3af' : '#475569' }]}>
                {item.description}
              </Text>

              <TouchableOpacity 
                activeOpacity={0.8}
                style={[styles.volunteerBtn, { backgroundColor: item.color }]} 
                onPress={() => handleVolunteer(item.title)}
              >
                <MaterialCommunityIcons name="hand-heart" size={20} color="#fff" />
                <Text style={styles.volunteerBtnText}>I Can Help</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="comment-check-outline" size={64} color={isDark ? "#1f2937" : "#e2e8f0"} />
              <Text style={[styles.emptyText, { color: colors.subText }]}>No active requests found.</Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    marginTop: Platform.OS === 'android' ? 25 : 0 
  },
  navCircle: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  headerTextWrap: { alignItems: 'center' },
  headerSubtitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  
  filterSection: { marginVertical: 15 },
  filterScroll: { paddingHorizontal: 20 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12, marginRight: 10, borderWidth: 1 },
  activeChip: { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  chipText: { fontWeight: '700', fontSize: 13 },

  card: { borderRadius: 25, padding: 20, marginBottom: 20, borderWidth: 1, elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardHeaderInfo: { flex: 1, marginLeft: 15 },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  typeLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  timeLabel: { fontSize: 11, color: '#64748b', fontWeight: '600' },
  cardTitle: { fontSize: 18, fontWeight: '800' },
  
  locationContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  locationText: { fontSize: 13, marginLeft: 5, fontWeight: '600' },
  description: { fontSize: 14, lineHeight: 22, marginBottom: 20 },
  
  volunteerBtn: { height: 55, borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  volunteerBtnText: { color: '#fff', fontWeight: '800', fontSize: 15, marginLeft: 10 },
  
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, fontSize: 16, fontWeight: '700' }
});