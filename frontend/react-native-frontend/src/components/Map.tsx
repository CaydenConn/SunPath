import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import MapView, { MapViewProps, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';


// Type for the user location state
type UserLocation = {
  latitude: number;
  longitude: number;
};

// Type for the ref object exposed via forwardRef
export type MapRef = {
  centerOnUser: () => void;
  fitToRoute: (coordinates: { latitude: number; longitude: number }[]) => void;
};

type MapProps = MapViewProps & {
  routeCoordinates?: { latitude: number; longitude: number }[];
  destination?: { latitude: number; longitude: number; name: string } | null;
};

const Map = forwardRef<MapRef, MapProps>(({ routeCoordinates = [], destination = null, ...props }, ref) => {
  // State for user-added markers
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const mapRef = useRef<MapView>(null);

  // Get user location on component mount
  useEffect(() => {
      (async () => {
          try {
              // Request location permissions
              let { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                  Alert.alert('Permission Denied', 'Location permission is required to show your position');
                  return;
              }

              // Get current location
              let location = await Location.getCurrentPositionAsync({});
              setUserLocation({
                  latitude: location.coords.latitude,
                  longitude: location.coords.longitude,
              });

              console.log('User location:', location.coords);
          } catch (error) {
              console.error('Error getting location:', error);
              Alert.alert('Location Error', 'Could not get your location');
          }
      })();
  }, []);

  // Center map on user location
  const centerOnUser = () => {
      if (userLocation && mapRef.current) {
          mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
          }, 1000);
      } else {
          Alert.alert('Location Not Available', 'Your location is not available yet');
      }
  };

  // Fit map to show entire route
  const fitToRoute = (coordinates: { latitude: number; longitude: number }[]) => {
      if (coordinates.length > 0 && mapRef.current) {
          mapRef.current.fitToCoordinates(coordinates, {
              edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
              animated: true,
          });
      }
  };

  useImperativeHandle(ref, () => ({ centerOnUser, fitToRoute }));

  return (
    <MapView
      ref={mapRef}
      style={styles.map}
      initialRegion={{
          latitude: 30.4383,
          longitude: -84.2807,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
      }}
      showsUserLocation={true}
      showsMyLocationButton={false}
    >
      {/* User Location Marker - Custom marker for your position */}
      {userLocation && (
          <Marker
              coordinate={userLocation}
              title="You Are Here"
              description="Your current location"
              pinColor="green"
          >
              <View style={styles.userMarker}>
                  <View style={styles.userMarkerInner} />
              </View>
          </Marker>
      )}
      
      {/* Route Polyline */}
      {routeCoordinates.length > 0 && (
          <Polyline
              coordinates={routeCoordinates}
              strokeColor="#4285F4"
              strokeWidth={4}
          />
      )}
      
      {/* Destination Marker */}
      {destination && (
          <Marker
              coordinate={{
                  latitude: destination.latitude,
                  longitude: destination.longitude,
              }}
              title={destination.name}
              description="Destination"
              pinColor="red"
          />
      )}
    </MapView>
  );
});

const styles = StyleSheet.create({
    map: {
        width: '100%',
        height: '100%',
    },
    userMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(76, 175, 80, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    userMarkerInner: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#4CAF50',
    },
});

export default Map