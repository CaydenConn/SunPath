import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import MapView, { MapViewProps, Marker, Polyline } from 'react-native-maps';
import { useTheme } from '../../styles/ThemeContext';
import * as Location from 'expo-location';
import { MAP } from '../../styles/themes';


// Type for the user location state
type UserLocation = {
  latitude: number;
  longitude: number;
};

// Type for the ref object exposed via forwardRef
export type MapRef = {
  centerOnUser: () => void;
  centerOnUserNav: () => void;
};

type MapProps = MapViewProps & {
  navigationMode?: boolean;
  routeCoordinates: { latitude: number; longitude: number }[] | null;
  destination?: { latitude: number; longitude: number } | null;
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  initialCamera?: {
    center: { latitude: number; longitude: number };
    pitch: number;
    heading: number;
    altitude: number;
  };
  userLocation?: UserLocation | null;
};

const Map = forwardRef<MapRef, MapProps>(({ routeCoordinates = [], destination, initialCamera, initialRegion, userLocation, navigationMode, ...props },  ref) => {
    const { colorScheme } = useTheme();
  
    // State for user-added markers
    const mapRef = useRef<MapView>(null);

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

   const centerOnUserNav = () => {
      if (initialCamera && mapRef.current) {
        mapRef.current.animateCamera({
          center: {
            latitude: initialCamera.center.latitude,
            longitude: initialCamera.center.longitude,
          },
          pitch: initialCamera.pitch,        // 3D tilt
          heading: initialCamera.heading,       // Or use compass heading
          altitude: initialCamera.altitude,    // Lower = more zoomed-in
        }, { duration: 600 });
      } else {
          Alert.alert('Location Not Available', 'Your location is not available yet');
      }
  };

  useImperativeHandle(ref, () => ({ centerOnUser, centerOnUserNav }));

  return (
    <MapView
      ref={mapRef}
      customMapStyle={
        colorScheme === 'light'
        ? MAP.light
        : MAP.dark
      }
      style={styles.map}
      initialRegion={!navigationMode ? initialRegion : undefined}
      initialCamera={navigationMode ? initialCamera : undefined}
      showsUserLocation={true}
      showsMyLocationButton={false}
    >
        {destination && <Marker coordinate={destination} title="Destination"/>}
        {routeCoordinates && routeCoordinates.length > 0 && <Polyline coordinates={routeCoordinates} strokeWidth={9} strokeColor="blue" />}
    </MapView>
  );
});

const styles = StyleSheet.create({
    map: {
        width: '100%',
        height: '100%',
        zIndex: -1000
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