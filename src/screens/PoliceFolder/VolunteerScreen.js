import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Platform, ScrollView, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // ✅ correct import
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemeContext } from '../../context/ThemeContext';

const CATEGORIES = ['All', 'Medical', 'Supplies', 'Labor', 'Food'];

const MOCK_REQUESTS = [
  {
    id: '1',
    title: 'Clean Water Needed',
    location: 'Kathmandu, Ward 4',
    description: 'Drinking water supply disrupted. Need 2–3 jars for an elderly couple.',
    type: 'Supplies',
    time: '10m ago',
    icon: 'faucet',
    color: '#3b82f6',
  },
  {
    id: '2',
    title: 'First Aid Kit / Bandages',
    location: 'Lalitpur, Ward 2',
    description: 'Minor injuries from debris. Need antiseptic and clean bandages immediately.',
    type: 'Medical',
    time: '25m ago',   // ✅ was missing — caused undefined render
    icon: 'first-aid',
    color: '#ef4444',
  },
  {
    id: '3',
    title: 'Debris Clearance',
    location: 'Bhaktapur',
    description: 'Landslide blocking alley. Need 2 people with shovels and basic clearing tools.',
    type: 'Labor',
    time: '1h ago',    // ✅ was missing
    icon: 'tools',
    color: '#f59e0b',
  },
];

export default function VolunteerScreen({ navigation }) {
  // ✅ Safe destructure — ThemeContext may not provide `colors` or `subText`
  const themeCtx = useContext(ThemeContext) || {};
  const theme    = themeCtx.theme  ?? 'light';
  const colors   = themeCtx.colors ?? {};

  const isDark = theme === 'dark';

  // ✅ Local fallbacks so colors.text / colors.subText never throw
  const textColor = colors.text    ?? (isDark ? '#f1f5f9' : '#1e293b');
  const subText   = colors.subText ?? (isDark ? '#94a3b8' : '#64748b');

  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredRequests =
    selectedCategory === 'All'
      ? MOCK_REQUESTS
      : MOCK_REQUESTS.filter((r) => r.type === selectedCategory);

  const handleVolunteer = (title) => {
    Alert.alert(
      'Confirm Commitment',
      `Are you sure you want to volunteer for:\n"${title}"?`,
      [
        { text: 'Go Back', style: 'cancel' },
        {
          text: "I'm on my way",
          onPress: () =>
            Alert.alert(
              'Confirmed!',
              'The requester has been notified. Please stay safe while traveling.'
            ),
        },
      ]
    );
  };

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <LinearGradient
      colors={isDark ? ['#0f2027', '#13262f', '#0f2027'] : ['#f8fafc', '#f1f5f9']}
      style={styles.container}
    >
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.navCircle,
              { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff' },
            ]}
            onPress={() => navigation?.goBack?.()}
          >
            <Ionicons name="chevron-back" size={24} color={textColor} />
          </TouchableOpacity>

          <View style={styles.headerTextWrap}>
            <Text style={styles.headerSubtitle}>COMMUNITY SUPPORT</Text>
            <Text style={[styles.headerTitle, { color: textColor }]}>Help Near Me</Text>
          </View>

          {/* Active count pill */}
          <View style={[styles.countPill, { backgroundColor: isDark ? 'rgba(59,130,246,0.15)' : '#eff6ff' }]}>
            <Text style={styles.countPillText}>{filteredRequests.length} Active</Text>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.filterSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.chip,
                  selectedCategory === cat
                    ? styles.activeChip
                    : {
                        backgroundColor: isDark ? '#111827' : '#fff',
                        borderColor:     isDark ? '#1e293b' : '#e2e8f0',
                      },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    {
                      color:
                        selectedCategory === cat
                          ? '#fff'
                          : isDark ? '#6b7280' : '#475569',
                    },
                  ]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Request List */}
        <FlatList
          data={filteredRequests}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View
              style={[
                styles.card,
                {
                  backgroundColor: isDark ? '#111827' : '#fff',
                  borderColor:     isDark ? '#1e293b' : '#f1f5f9',
                },
              ]}
            >
              {/* Left accent bar */}
              <View style={[styles.accentBar, { backgroundColor: item.color }]} />

              <View style={styles.cardContent}>
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={[styles.iconBox, { backgroundColor: `${item.color}18` }]}>
                    <FontAwesome5 name={item.icon} size={18} color={item.color} />
                  </View>
                  <View style={styles.cardHeaderInfo}>
                    <View style={styles.badgeRow}>
                      <View style={[styles.typePill, { backgroundColor: `${item.color}18` }]}>
                        <Text style={[styles.typeLabel, { color: item.color }]}>
                          {item.type.toUpperCase()}
                        </Text>
                      </View>
                      {/* ✅ item.time is now always defined */}
                      <Text style={[styles.timeLabel, { color: subText }]}>{item.time}</Text>
                    </View>
                    <Text style={[styles.cardTitle, { color: textColor }]}>{item.title}</Text>
                  </View>
                </View>

                {/* Location */}
                <View style={styles.locationContainer}>
                  <Ionicons name="location" size={13} color="#3b82f6" />
                  <Text style={[styles.locationText, { color: subText }]}>{item.location}</Text>
                </View>

                {/* Description */}
                <Text style={[styles.description, { color: isDark ? '#9ca3af' : '#475569' }]}>
                  {item.description}
                </Text>

                {/* CTA Button */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.volunteerBtn, { backgroundColor: item.color }]}
                  onPress={() => handleVolunteer(item.title)}
                >
                  <MaterialCommunityIcons name="hand-heart" size={20} color="#fff" />
                  <Text style={styles.volunteerBtnText}>I Can Help</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons
                name="comment-check-outline"
                size={64}
                color={isDark ? '#1f2937' : '#e2e8f0'}
              />
              <Text style={[styles.emptyText, { color: subText }]}>
                No active requests in this category.
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea:  { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: Platform.OS === 'android' ? 25 : 0,
  },
  navCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  headerTextWrap: { alignItems: 'center', flex: 1, marginHorizontal: 10 },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
    color: '#3b82f6',
    marginBottom: 2,
  },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  countPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  countPillText: { color: '#3b82f6', fontWeight: '800', fontSize: 12 },

  // Filter
  filterSection: { marginVertical: 12 },
  filterScroll: { paddingHorizontal: 20 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
    marginRight: 10,
    borderWidth: 1,
  },
  activeChip:  { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
  chipText:    { fontWeight: '700', fontSize: 13 },

  // Card
  card: {
    borderRadius: 22,
    marginBottom: 18,
    borderWidth: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  accentBar:   { width: 5 },
  cardContent: { flex: 1, padding: 18 },

  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderInfo: { flex: 1, marginLeft: 14 },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  timeLabel: { fontSize: 11, fontWeight: '600' },
  cardTitle: { fontSize: 17, fontWeight: '800' },

  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationText: { fontSize: 13, marginLeft: 5, fontWeight: '600' },
  description:  { fontSize: 14, lineHeight: 22, marginBottom: 18 },

  volunteerBtn: {
    height: 52,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    gap: 10,
  },
  volunteerBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  // Empty
  emptyContainer: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 15, fontSize: 15, fontWeight: '700' },
});