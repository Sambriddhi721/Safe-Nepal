import React, { useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Alert, SafeAreaView, Platform, ScrollView 
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

// ✅ FIX: Path depth (assuming this is in src/screens/Citizen Folder/ or similar)
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
    description: 'Landslide blocking alley. Need 2 people with shovels.',
    type: 'Labor',
    icon: 'tools',
    color: '#f59e0b'
  }
];

export default function VolunteerScreen({ navigation }) {
  const { colors, theme } = useContext(ThemeContext);
  const [selectedCategory, setSelectedCategory] = useState("All");

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
          onPress: () => Alert.alert("Confirmed!", "The requester has been notified that you are coming to help.") 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backBtn, { backgroundColor: colors.card }]} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help Near Me</Text>
        <View style={{ width: 40 }} /> {/* Spacer for centering */}
      </View>

      {/* Category Filter Chips */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.chip, 
                { 
                  backgroundColor: selectedCategory === cat ? "#3b82f6" : colors.card,
                  borderColor: theme === 'dark' ? '#334155' : '#e2e8f0',
                  borderWidth: 1
                }
              ]}
            >
              <Text style={{ 
                color: selectedCategory === cat ? "#fff" : colors.subText, 
                fontWeight: 'bold',
                fontSize: 13
              }}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="Checkmark-circle-outline" size={60} color={colors.subText} />
            <Text style={[styles.emptyText, { color: colors.subText }]}>No requests in this category.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: theme === 'dark' ? '#1e293b' : '#f1f5f9', borderWidth: 1 }]}>
            <View style={styles.cardTop}>
              <View style={[styles.iconWrap, { backgroundColor: item.color + '15' }]}>
                <FontAwesome5 name={item.icon} size={18} color={item.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={styles.typeBadge}>
                   <Text style={[styles.typeText, { color: item.color }]}>{item.type.toUpperCase()}</Text>
                </View>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                <View style={styles.locationRow}>
                   <Ionicons name="location-outline" size={14} color={colors.subText} />
                   <Text style={{ color: colors.subText, fontSize: 12, marginLeft: 4 }}>{item.location} • {item.time}</Text>
                </View>
              </View>
            </View>
            
            <Text style={[styles.desc, { color: theme === 'dark' ? '#cbd5e1' : '#475569' }]}>
              {item.description}
            </Text>

            <TouchableOpacity 
              style={[styles.btn, { backgroundColor: item.color }]} 
              onPress={() => handleVolunteer(item.title)}
            >
              <Text style={styles.btnText}>Volunteer Now</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15,
    paddingTop: Platform.OS === 'android' ? 50 : 10 
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  filterSection: { marginBottom: 5 },
  filterScroll: { paddingLeft: 20, paddingBottom: 10 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, marginRight: 8, elevation: 1 },
  card: { borderRadius: 24, padding: 20, marginBottom: 18, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  iconWrap: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  typeBadge: { marginBottom: 4 },
  typeText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  locationRow: { flexDirection: 'row', alignItems: 'center' },
  desc: { fontSize: 14, marginBottom: 20, lineHeight: 22 },
  btn: { borderRadius: 15, paddingVertical: 14, alignItems: 'center', elevation: 2 },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, fontSize: 16, fontWeight: '600' }
});