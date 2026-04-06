import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet } from 'react-native';

// Safe wrapper that prevents MapView from crashing
export default function SafeMapView({ region, children, style, onError }) {
  // Always render placeholder instead of MapView
  return (
    <View style={[styles.container, style]}>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>📍 Map View</Text>
        {region && (
          <Text style={styles.coordsText}>
            {region.latitude.toFixed(4)}, {region.longitude.toFixed(4)}
          </Text>
        )}
        <Text style={styles.subText}>
          Google Maps API key required
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    padding: 20,
  },
  placeholderText: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  coordsText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  subText: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
});

