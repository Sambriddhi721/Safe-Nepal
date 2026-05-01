/**
 * ResponderDetailScreen.js
 * Safe Nepal – Responder: Full Report Detail + Live Location + Navigation
 *
 * Receives `report` object via route.params.
 * Shows full report info, citizen GPS on map, call/navigate actions,
 * status update, and PDF-style report download.
 *
 * Requires:
 *   react-native-maps
 *   expo-haptics
 *   expo-sharing
 *   expo-file-system
 *   @expo/vector-icons  (Ionicons, MaterialCommunityIcons)
 *   react-native-safe-area-context
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  ScrollView, Alert, Linking, Platform, ActivityIndicator,
  Image, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../context/firebaseConfig';

// ─── Theme ────────────────────────────────────────────────────────────────────
const T = {
  bg:      '#0b1120',
  surface: '#111827',
  card:    '#161f2e',
  border:  '#1e2d45',
  t1:      '#e8eef8',
  t2:      '#64748b',
  t3:      '#94a3b8',
  blue:    '#3b82f6',
  blueDk:  '#1d4ed8',
  green:   '#22c55e',
  amber:   '#f59e0b',
  red:     '#ef4444',
  purple:  '#a78bfa',
  flood:   '#3b82f6',
  land:    '#f59e0b',
};

const DISASTER = {
  flood:     { icon: 'water',            color: T.flood, label: 'Flood'     },
  landslide: { icon: 'image-filter-hdr', color: T.land,  label: 'Landslide' },
};

const STAT_COLOR = { pending: T.red,  responding: T.amber, resolved: T.green };
const STAT_BG    = { pending: '#3f0808', responding: '#422006', resolved: '#052e16' };

const timeAgo = (ts) => {
  if (!ts) return '—';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  const diff  = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
};

const fullDateTime = (ts) => {
  if (!ts) return '—';
  const date = ts?.toDate ? ts.toDate() : new Date(ts);
  return date.toLocaleString('en-NP', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// ─── Section wrapper ──────────────────────────────────────────────────────────
const Section = ({ label, children }) => (
  <View style={{ marginBottom: 6 }}>
    <Text style={ds.secLabel}>{label}</Text>
    {children}
  </View>
);

// ─── Detail row ───────────────────────────────────────────────────────────────
const Row = ({ icon, label, value, accent, last }) => (
  <View style={[ds.detRow, last && { borderBottomWidth: 0 }]}>
    <View style={ds.rowLeft}>
      <Ionicons name={icon} size={13} color={T.t2} />
      <Text style={ds.rowLbl}>{label}</Text>
    </View>
    <Text style={[ds.rowVal, accent && { color: accent }]} numberOfLines={3}>{value || '—'}</Text>
  </View>
);

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function ResponderDetailScreen({ route, navigation }) {
  const { report: initial } = route?.params || {};
  const [report,   setReport]   = useState(initial || {});
  const [updating, setUpdating] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const mapRef = useRef(null);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 380, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 380, useNativeDriver: true }),
    ]).start();
  }, []);

  const dis   = DISASTER[report.type] || DISASTER.flood;
  const stCol = STAT_COLOR[report.status] || T.red;
  const stBg  = STAT_BG[report.status]   || STAT_BG.pending;

  const hasLocation = report.latitude && report.longitude;

  // ── Open maps ───────────────────────────────────────────────────────────────
  const navigateToScene = () => {
    if (!hasLocation) { Alert.alert('No GPS', 'This report has no GPS coordinates.'); return; }
    const { latitude, longitude } = report;
    const label = encodeURIComponent(report.location || 'Incident Scene');
    const url = Platform.select({
      ios:     `maps://app?daddr=${latitude},${longitude}&q=${label}`,
      android: `google.navigation:q=${latitude},${longitude}`,
    });
    Linking.openURL(url).catch(() =>
      Linking.openURL(`https://maps.google.com/?q=${latitude},${longitude}`)
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // ── Call citizen ─────────────────────────────────────────────────────────────
  const callCitizen = () => {
    if (!report.citizenPhone) { Alert.alert('No Phone', 'Citizen phone not provided.'); return; }
    Linking.openURL(`tel:${report.citizenPhone}`);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // ── Update status ─────────────────────────────────────────────────────────────
  const updateStatus = async (newStatus) => {
    if (report.status === newStatus) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'reports', report.id), { status: newStatus });
      setReport(prev => ({ ...prev, status: newStatus }));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Update Failed', e.message);
    }
    setUpdating(false);
  };

  // ── Generate + download report as text ───────────────────────────────────────
  const downloadReport = async () => {
    setDownloading(true);
    try {
      const reportedAt = fullDateTime(report.createdAt);
      const content = `
SAFE NEPAL – DISASTER INCIDENT REPORT
======================================
Report ID    : ${report.id?.toUpperCase() || 'N/A'}
Generated    : ${new Date().toLocaleString('en-NP')}

INCIDENT DETAILS
----------------
Disaster Type   : ${(report.type || '').toUpperCase()}
Severity Level  : ${report.severity || '—'}
Status          : ${(report.status || 'pending').toUpperCase()}
Reported At     : ${reportedAt}
Description     : ${report.description || 'No description provided.'}

LOCATION
--------
Address         : ${report.location || 'Unknown'}
Latitude        : ${report.latitude ? Number(report.latitude).toFixed(6) : 'N/A'}
Longitude       : ${report.longitude ? Number(report.longitude).toFixed(6) : 'N/A'}
Google Maps     : ${report.latitude ? `https://maps.google.com/?q=${report.latitude},${report.longitude}` : 'N/A'}

CITIZEN REPORTER
----------------
Name            : ${report.reportedBy || 'Anonymous'}
Phone           : ${report.citizenPhone || 'Not provided'}
Affected People : ~${report.affectedPeople || 0}

DISASTER-SPECIFIC
-----------------
${report.type === 'flood' ? `Water Level     : ${report.waterLevel || 'Not specified'}` : ''}
${report.type === 'landslide' ? `Road Blocked    : ${report.roadBlocked ? 'Yes – impassable' : 'No – passable'}` : ''}

Photo Attached  : ${report.imageUrl ? 'Yes (' + report.imageUrl + ')' : 'No'}

======================================
Safe Nepal Emergency Response System
Nepal Police · Disaster Management Division
Emergency: 112
======================================
`.trim();

      const fileName = `SafeNepal_Report_${report.id?.slice(0, 8).toUpperCase() || 'REPORT'}.txt`;
      const filePath = FileSystem.documentDirectory + fileName;
      await FileSystem.writeAsStringAsync(filePath, content, { encoding: FileSystem.EncodingType.UTF8 });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'text/plain',
          dialogTitle: 'Save Incident Report',
          UTI: 'public.plain-text',
        });
      } else {
        Alert.alert('Saved', `Report saved to: ${filePath}`);
      }
    } catch (e) {
      Alert.alert('Download Failed', e.message);
    }
    setDownloading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={ds.safe} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={T.bg} />

      {/* Nav bar */}
      <View style={ds.navbar}>
        <TouchableOpacity style={ds.backBtn} onPress={() => navigation?.goBack?.()} activeOpacity={0.75}>
          <Ionicons name="chevron-back" size={20} color={T.t1} />
        </TouchableOpacity>
        <Text style={ds.navTitle}>Incident Report</Text>
        <TouchableOpacity
          style={ds.downloadBtn}
          onPress={downloadReport}
          disabled={downloading}
          activeOpacity={0.8}
        >
          {downloading
            ? <ActivityIndicator size="small" color={T.blue} />
            : <Ionicons name="download-outline" size={19} color={T.blue} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1, backgroundColor: T.bg }} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* ── HERO ── */}
          <View style={ds.hero}>
            <View style={[ds.heroIcon, { backgroundColor: dis.color + '20' }]}>
              <MaterialCommunityIcons name={dis.icon} size={28} color={dis.color} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={ds.heroTitle}>{dis.label} Emergency</Text>
              <Text style={ds.heroId}>#{report.id?.slice(0, 8).toUpperCase() || '—'}</Text>
            </View>
            {/* Severity badge */}
            <View style={[ds.sevBadge, {
              backgroundColor: (STAT_COLOR[report.severity?.toLowerCase()] || T.blue) + '20',
              borderColor: (STAT_COLOR[report.severity?.toLowerCase()] || T.blue) + '50',
            }]}>
              <Text style={[ds.sevTxt, { color: STAT_COLOR[report.severity?.toLowerCase()] || T.blue }]}>
                {report.severity?.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Status pill + timestamp */}
          <View style={ds.metaRow}>
            <View style={[ds.statusPill, { backgroundColor: stBg, borderColor: stCol + '40' }]}>
              <View style={[ds.sDot, { backgroundColor: stCol }]} />
              <Text style={[ds.statusTxt, { color: stCol }]}>{(report.status || 'PENDING').toUpperCase()}</Text>
            </View>
            <Ionicons name="time-outline" size={13} color={T.t2} />
            <Text style={ds.metaTime}>{timeAgo(report.createdAt)}</Text>
            <Text style={ds.metaFull}>{fullDateTime(report.createdAt)}</Text>
          </View>

          {/* ── MAP ── */}
          {hasLocation && (
            <View style={ds.mapWrap}>
              <MapView
                ref={mapRef}
                style={ds.map}
                mapType="hybrid"
                initialRegion={{
                  latitude:       Number(report.latitude),
                  longitude:      Number(report.longitude),
                  latitudeDelta:  0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker
                  coordinate={{ latitude: Number(report.latitude), longitude: Number(report.longitude) }}
                  title={`${dis.label} Emergency`}
                  description={report.location}
                  pinColor={dis.color}
                />
                <Circle
                  center={{ latitude: Number(report.latitude), longitude: Number(report.longitude) }}
                  radius={100}
                  fillColor={dis.color + '25'}
                  strokeColor={dis.color + '80'}
                  strokeWidth={1.5}
                />
              </MapView>

              {/* Navigate button overlaid */}
              <TouchableOpacity style={ds.mapNavBtn} onPress={navigateToScene} activeOpacity={0.9}>
                <Ionicons name="navigate" size={16} color="#fff" />
                <Text style={ds.mapNavTxt}>Navigate to Scene</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── PHOTO ── */}
          {report.imageUrl && (
            <Section label="PHOTO EVIDENCE">
              <Image source={{ uri: report.imageUrl }} style={ds.photo} resizeMode="cover" />
            </Section>
          )}

          {/* ── INCIDENT DETAILS ── */}
          <Section label="INCIDENT DETAILS">
            <View style={ds.detCard}>
              <Row icon="document-text-outline" label="Description" value={report.description} />
              {report.type === 'flood' && report.waterLevel && (
                <Row icon="water-outline" label="Water Level" value={report.waterLevel} />
              )}
              {report.type === 'landslide' && (
                <Row
                  icon="car-outline"
                  label="Road Status"
                  value={report.roadBlocked ? 'Blocked – impassable' : 'Clear – passable'}
                  accent={report.roadBlocked ? T.red : T.green}
                />
              )}
              <Row
                icon="people-outline"
                label="Affected People"
                value={report.affectedPeople > 0 ? `~${report.affectedPeople} people` : 'Unknown'}
              />
              <Row icon="calendar-outline" label="Reported At" value={fullDateTime(report.createdAt)} last />
            </View>
          </Section>

          {/* ── CITIZEN ── */}
          <Section label="CITIZEN REPORTER">
            <View style={ds.detCard}>
              <Row icon="person-outline" label="Name"  value={report.reportedBy  || 'Anonymous'} />
              <Row icon="call-outline"   label="Phone" value={report.citizenPhone || 'Not provided'} last />
            </View>
          </Section>

          {/* ── LOCATION ── */}
          <Section label="LOCATION">
            <View style={ds.detCard}>
              <Row icon="location-outline" label="Address"     value={report.location || 'Unknown'} />
              <Row icon="navigate-outline" label="Coordinates"
                value={hasLocation
                  ? `${Number(report.latitude).toFixed(6)}, ${Number(report.longitude).toFixed(6)}`
                  : 'No GPS data'}
                last
              />
            </View>
          </Section>

          {/* ── ACTION BUTTONS ── */}
          <Text style={ds.secLabel}>RESPONDER ACTIONS</Text>

          <View style={ds.actionGrid}>
            <TouchableOpacity style={[ds.actionBtn, { borderColor: T.green + '50', backgroundColor: T.green + '10' }]} onPress={callCitizen} activeOpacity={0.8}>
              <View style={[ds.actionIcon, { backgroundColor: T.green + '20' }]}>
                <Ionicons name="call" size={20} color={T.green} />
              </View>
              <Text style={[ds.actionLbl, { color: T.green }]}>Call Citizen</Text>
              <Text style={ds.actionSub}>{report.citizenPhone || 'No number'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[ds.actionBtn, { borderColor: T.blue + '50', backgroundColor: T.blue + '10' }]} onPress={navigateToScene} activeOpacity={0.8}>
              <View style={[ds.actionIcon, { backgroundColor: T.blue + '20' }]}>
                <Ionicons name="navigate" size={20} color={T.blue} />
              </View>
              <Text style={[ds.actionLbl, { color: T.blue }]}>Navigate</Text>
              <Text style={ds.actionSub}>Open in Maps</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={ds.downloadFullBtn} onPress={downloadReport} disabled={downloading} activeOpacity={0.85}>
            {downloading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Ionicons name="document-text-outline" size={17} color="#fff" />
                  <Text style={ds.downloadFullTxt}>Download Full Report</Text>
                </>
            }
          </TouchableOpacity>

          {/* ── STATUS UPDATE ── */}
          <Text style={ds.secLabel}>UPDATE STATUS</Text>
          <View style={ds.statusCard}>
            <Text style={ds.statusCardSub}>Current: <Text style={{ color: stCol, fontWeight: '800' }}>{(report.status || 'pending').toUpperCase()}</Text></Text>
            <View style={ds.statusBtns}>
              {['pending', 'responding', 'resolved'].map((st) => {
                const col    = STAT_COLOR[st];
                const active = report.status === st;
                return (
                  <TouchableOpacity
                    key={st}
                    style={[ds.statusBtn, { borderColor: col, backgroundColor: active ? col + '25' : 'transparent' }]}
                    onPress={() => updateStatus(st)}
                    disabled={updating || active}
                    activeOpacity={0.75}
                  >
                    {updating && active
                      ? <ActivityIndicator size="small" color={col} />
                      : <>
                          <View style={[ds.sDot, { backgroundColor: col }]} />
                          <Text style={[ds.statusBtnTxt, { color: col }]}>
                            {st.charAt(0).toUpperCase() + st.slice(1)}
                          </Text>
                        </>
                    }
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ height: 50 }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const ds = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: T.bg },
  navbar:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14, paddingHorizontal: 16, backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border },
  backBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: T.card, justifyContent: 'center', alignItems: 'center' },
  navTitle:{ fontSize: 16, fontWeight: '800', color: T.t1 },
  downloadBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: T.blue + '18', justifyContent: 'center', alignItems: 'center' },

  hero:     { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18, paddingBottom: 14, backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border },
  heroIcon: { width: 50, height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  heroTitle:{ fontSize: 18, fontWeight: '800', color: T.t1 },
  heroId:   { fontSize: 12, color: T.t2, marginTop: 3 },
  sevBadge: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 9, borderWidth: 1 },
  sevTxt:   { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  metaRow:   { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 18, paddingVertical: 11, backgroundColor: T.surface, borderBottomWidth: 1, borderBottomColor: T.border, flexWrap: 'wrap' },
  statusPill:{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  sDot:      { width: 5, height: 5, borderRadius: 3 },
  statusTxt: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  metaTime:  { color: T.t2, fontSize: 12 },
  metaFull:  { color: T.t2, fontSize: 11, marginLeft: 'auto' },

  mapWrap: { marginHorizontal: 16, marginTop: 16, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: T.border, position: 'relative' },
  map:     { width: '100%', height: 220 },
  mapNavBtn: {
    position: 'absolute', bottom: 12, left: '50%',
    transform: [{ translateX: -80 }],
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: T.blueDk, borderRadius: 12,
    paddingHorizontal: 20, paddingVertical: 10,
    width: 160,
  },
  mapNavTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },

  photo:    { width: '100%', height: 200, marginHorizontal: 0 },

  secLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.8, color: T.t2, marginHorizontal: 18, marginTop: 20, marginBottom: 8 },
  detCard:  { marginHorizontal: 16, backgroundColor: T.card, borderRadius: 14, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  detRow:   { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: T.border },
  rowLeft:  { flexDirection: 'row', alignItems: 'center', gap: 7, minWidth: 110, paddingTop: 1 },
  rowLbl:   { color: T.t2, fontSize: 12, fontWeight: '600' },
  rowVal:   { color: T.t1, fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'right' },

  actionGrid: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginBottom: 10 },
  actionBtn:  { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center', gap: 7 },
  actionIcon: { width: 44, height: 44, borderRadius: 13, justifyContent: 'center', alignItems: 'center' },
  actionLbl:  { fontSize: 13, fontWeight: '800' },
  actionSub:  { fontSize: 11, color: T.t2 },

  downloadFullBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9, marginHorizontal: 16, backgroundColor: '#1e3a8a', borderRadius: 14, paddingVertical: 14, borderWidth: 1, borderColor: T.blue + '40', marginBottom: 4 },
  downloadFullTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },

  statusCard:    { marginHorizontal: 16, backgroundColor: T.card, borderRadius: 14, padding: 15, borderWidth: 1, borderColor: T.border },
  statusCardSub: { fontSize: 12, color: T.t2, marginBottom: 12 },
  statusBtns:    { flexDirection: 'row', gap: 8 },
  statusBtn:     { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5 },
  statusBtnTxt:  { fontSize: 11, fontWeight: '800' },
});