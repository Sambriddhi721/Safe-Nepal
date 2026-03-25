import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Platform } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../context/ThemeContext';
import { AuthContext } from '../../context/AuthContext';

export default function AccountSettings({ navigation }) {
  const { colors } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const InfoRow = ({ label, value, icon }) => (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={20} color={colors.primary || '#3b82f6'} />
      </View>
      <View style={styles.textStack}>
        <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
        <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* HEADER */}
      <View style={[styles.header, { paddingTop: Platform.OS === 'ios' ? 60 : 40 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Personal Details</Text>
        <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
          <Text style={{ color: colors.primary || '#3b82f6', fontWeight: '800' }}>Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <InfoRow label="Full Name" value="Sambriddhi Dawadi" icon="person-outline" />
          <InfoRow label="Email Address" value={user?.email || "sambriddhidawadi@university.edu"} icon="mail-outline" />
          <InfoRow label="Student ID" value="2331203" icon="fingerprint-outline" />
          <InfoRow label="Phone" value="+977 98XXXXXXXX" icon="call-outline" />
          <InfoRow label="University Group" value="L5CG3" icon="school-outline" />
        </View>

        <View style={styles.footerNote}>
          <Ionicons name="lock-closed-outline" size={12} color={colors.subText} />
          <Text style={[styles.footerText, { color: colors.subText }]}>
            Your identity details are encrypted for disaster response security.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 4 },
  content: { padding: 16 },
  card: { borderRadius: 28, paddingVertical: 10, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 0.5 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(59, 130, 246, 0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  textStack: { flex: 1 },
  label: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '700' },
  footerNote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 25, paddingHorizontal: 20 },
  footerText: { fontSize: 11, marginLeft: 6, textAlign: 'center', fontWeight: '600' }
});