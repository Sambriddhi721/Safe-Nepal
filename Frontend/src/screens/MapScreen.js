   import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';

export default function EmergencyMapScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      // 1. Ask for permission to access location
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // 2. Get current position
      let userLocation = await Location.getCurrentPositionAsync({});
      setLocation(userLocation.coords);
    })();
  }, []);

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#red" />
        <Text>Loading Emergency Map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        {/* User's current location marker */}
        <Marker 
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title="Your Location"
          pinColor="blue"
        />

        {/* Example Emergency Marker (Hospital) */}
        <Marker 
          coordinate={{ latitude: location.latitude + 0.002, longitude: location.longitude + 0.002 }}
          title="Nearest Hospital"
          description="Emergency Room Open 24/7"
          pinColor="red"
        />

        {/* Danger Zone Visualization */}
        <Circle 
          center={{ latitude: location.latitude - 0.003, longitude: location.longitude - 0.003 }}
          radius={200}
          fillColor="rgba(255, 0, 0, 0.3)"
          strokeColor="red"
        />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { width: '100%', height: '100%' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});