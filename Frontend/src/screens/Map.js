import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps'; // Removed PROVIDER_GOOGLE
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function RealTimeMapScreen() {
  const mapRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        let loc = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="red" />
        <Text>Loading Map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        // If this is set to PROVIDER_GOOGLE and you have no key, it will crash.
        // Leaving it empty uses Apple Maps on iOS and Basic Google on Android.
        initialRegion={userLocation || {
          latitude: 28.3949,
          longitude: 84.1240,
          latitudeDelta: 7,
          longitudeDelta: 7,
        }}
      >
        {userLocation && <Marker coordinate={userLocation} title="You" />}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'blue' }, // If you see BLUE, the file is working
  map: { width: width, height: height },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});