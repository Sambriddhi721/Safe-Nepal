import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Dimensions, SafeAreaView, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE, Marker, Circle } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get('window');

export default function EmergencyMapScreen() {
  const mapRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [searchMarker, setSearchMarker] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    (async () => {
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      // Get current user position
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

  const moveToLocation = (details) => {
    // Safety check for geometry data to prevent app crashes
    if (!details || !details.geometry) return;

    const newCoords = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    
    setSearchMarker(newCoords);
    // Smooth animation to the searched location
    mapRef.current?.animateToRegion(newCoords, 1000);
  };

  if (errorMsg) {
    return <View style={styles.center}><Text style={styles.errorText}>{errorMsg}</Text></View>;
  }

  if (!location) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#EF4444" />
        <Text style={{ marginTop: 10, fontWeight: '600' }}>Initializing Safe Nepal Map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={location}
      >
        {/* User's current location marker */}
        <Marker coordinate={location} title="You Are Here" pinColor="blue" />

        {/* Marker for searched results */}
        {searchMarker && (
          <Marker coordinate={searchMarker} title="Searched Location" pinColor="green" />
        )}

        {/* Visual risk or safety radius */}
        <Circle 
          center={location}
          radius={200}
          fillColor="rgba(59, 130, 246, 0.2)"
          strokeColor="#3B82F6"
        />
      </MapView>

      {/* Floating search bar overlay */}
      <SafeAreaView style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search safe areas, hospitals..."
          fetchDetails={true}
          onPress={(data, details = null) => moveToLocation(details)}
          query={{
            key: 'YOUR_GOOGLE_API_KEY', // Replace with your verified API key
            language: 'en',
            components: 'country:np', // Restricts search results to Nepal
          }}
          styles={{
            textInputContainer: styles.textInputContainer,
            textInput: styles.textInput,
            listView: styles.listView,
          }}
          enablePoweredByGoogle={false}
          debounce={400}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'white' },
  map: { flex: 1 }, 
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#EF4444', fontWeight: 'bold' },
  searchContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20, // Dynamic top padding for notches
    width: '92%',
    alignSelf: 'center',
    zIndex: 10,
    elevation: 10,
  },
  textInputContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  textInput: {
    height: 48,
    color: '#333',
    fontSize: 16,
    paddingHorizontal: 15,
  },
  listView: {
    backgroundColor: 'white',
    borderRadius: 10,
    marginTop: 5,
    elevation: 5,
  },
});