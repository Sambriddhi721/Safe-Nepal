import React, { useState, useContext } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, 
  Alert, SafeAreaView, Platform, ScrollView 
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { ThemeContext } from '../context/ThemeContext';

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
  const { colors } = useContext(ThemeContext);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredRequests = selectedCategory === "All" 
    ? MOCK_REQUESTS 
    : MOCK_REQUESTS.filter(req => req.type === selectedCategory);

  const handleVolunteer = (title) => {
    Alert.alert("Confirm Help", `Commit to: ${title}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "I'll Help", onPress: () => Alert.alert("Thank You!", "Requester has been notified.") }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help Near Me</Text>
        <TouchableOpacity>
          <Ionicons name="add-circle" size={30} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      {/* Category Filter Chips */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat} 
              onPress={() => setSelectedCategory(cat)}
              style={[
                styles.chip, 
                { backgroundColor: selectedCategory === cat ? "#3b82f6" : colors.card }
              ]}
            >
              <Text style={{ color: selectedCategory === cat ? "#fff" : colors.subText, fontWeight: 'bold' }}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredRequests}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 20 }}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.cardTop}>
              <View style={[styles.iconWrap, { backgroundColor: item.color + '20' }]}>
                <FontAwesome5 name={item.icon} size={20} color={item.color} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={{ color: colors.subText, fontSize: 12 }}>{item.location} • {item.time}</Text>
              </View>
            </View>
            <Text style={[styles.desc, { color: colors.text }]}>{item.description}</Text>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: Platform.OS === 'android' ? 40 : 10 },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  filterScroll: { paddingLeft: 20, paddingBottom: 15 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, marginRight: 10, elevation: 2 },
  card: { borderRadius: 20, padding: 20, marginBottom: 15, elevation: 3 },
  cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  desc: { fontSize: 14, marginBottom: 15, lineHeight: 20 },
  btn: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold' }
});