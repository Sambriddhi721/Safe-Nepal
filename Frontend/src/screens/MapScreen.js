import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Dimensions } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function EmergencyMapScreen() {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [searchMarker, setSearchMarker] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let userLocation = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setLocation(coords);
    })();
  }, []);

  // Function to move map when a place is selected
  const moveToLocation = (details) => {
    const newCoords = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    setSearchMarker(newCoords); // Drop a marker on the searched spot
    mapRef.current?.animateToRegion(newCoords, 1000); // Smooth zoom
  };

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="red" />
        <Text>Initializing Safe Nepal Map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar - Positioned absolutely at the top */}
      <GooglePlacesAutocomplete
        placeholder="Search safe areas, hospitals..."
        fetchDetails={true} // Needed to get lat/lng coordinates
        onPress={(data, details = null) => moveToLocation(details)}
        query={{
          key: 'YOUR_GOOGLE_API_KEY',
          language: 'en',
          components: 'country:np', // Limits search to Nepal only
        }}
        styles={searchStyles}
        enablePoweredByGoogle={false}
      />

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={location}
      >
        {/* Your Current Location */}
        <Marker coordinate={location} title="You Are Here" pinColor="blue" />

        {/* Searched Location Marker */}
        {searchMarker && (
          <Marker coordinate={searchMarker} title="Searched Location" pinColor="green" />
        )}

        {/* Danger Zone */}
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

const searchStyles = {
  container: {
    position: 'absolute',
    top: 50, // Pushes it below the status bar
    width: '90%',
    alignSelf: 'center',
    zIndex: 1, // Ensures search stays above the map
  },
  textInputContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
  textInput: { height: 45, color: '#5d5d5d', fontSize: 16 },
  listView: { backgroundColor: 'white', borderRadius: 8 }, // Dropdown style
};