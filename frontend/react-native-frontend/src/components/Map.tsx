import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View, Alert, Platform } from 'react-native';
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
  centerOnUserNav: (heading: number) => void;
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
  userHeading?: number;
  userLocation?: UserLocation | null;
  showDefaultUserIcon?: boolean;
};

const Map = forwardRef<MapRef, MapProps>(({
  routeCoordinates = [],
  destination, 
  initialCamera, 
  initialRegion, 
  userLocation, 
  navigationMode,
  userHeading,
  showDefaultUserIcon, 
  ...props 
}, ref) => {
    const { colorScheme } = useTheme();
  
    // State for user-added markers
    const mapRef = useRef<MapView>(null);

  // Center map on user location
  const centerOnUser = (latD = 0.0922, lonD=0.0421) => {
      if (userLocation && mapRef.current) {
          mapRef.current.animateToRegion({
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: latD,
                longitudeDelta: lonD,
          }, 1000);
      } else {
          Alert.alert('Location Not Available', 'Your location is not available yet');
      }
  };

   const centerOnUserNav = (heading: number) => {
      if (initialCamera && mapRef.current) {
        if (Platform.OS === "android") { // Android has issues with initialCamera need to use initialRegion(centerOnUser supports this)
          centerOnUser(initialRegion?.latitudeDelta, initialRegion?.longitudeDelta);
          return;
        }
        mapRef.current.animateCamera({
          center: {
            latitude: userLocation?.latitude ?? initialCamera.center.latitude,
            longitude: userLocation?.longitude ?? initialCamera.center.longitude,
          },
          pitch: initialCamera.pitch,        // 3D tilt
          heading: heading ?? initialCamera.heading,       // Or use compass heading
          altitude: initialCamera.altitude,    // Lower = more zoomed-in
        }, { duration: 600 });
      } else {
          Alert.alert('Location Not Available', 'Your location is not available yet');
      }
  };

  useImperativeHandle(ref, () => ({ centerOnUser, centerOnUserNav}));

  const [remainingRoute, setRemainingRoute] = useState<{ latitude: number; longitude: number }[]>(routeCoordinates || []);

  useEffect(() => {
    if (!routeCoordinates || !userLocation) return;

    // Find the closest point on the route to the user
    let closestIndex = 0;
    let minDist = Number.MAX_VALUE;

    routeCoordinates.forEach((coord, index) => {
      const dLat = coord.latitude - userLocation.latitude;
      const dLng = coord.longitude - userLocation.longitude;
      const dist = Math.sqrt(dLat * dLat + dLng * dLng);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = index;
      }
    });

    // Only keep the route from the closest point forward
    setRemainingRoute(routeCoordinates.slice(closestIndex));
  }, [userLocation, routeCoordinates]);

  return (
    <MapView
      ref={mapRef}
      customMapStyle={
        colorScheme === 'light'
        ? MAP.light
        : MAP.dark
      }
      style={styles.map}
      {...(Platform.OS === 'android'
        ? { initialRegion: initialRegion }
        : { initialCamera: navigationMode ? initialCamera : undefined }
      )}
      showsUserLocation={showDefaultUserIcon ?? true}
    >
        {props.children}
        {destination && <Marker coordinate={destination} title="Destination"/>}
        {remainingRoute && remainingRoute.length > 0 && (
          <Polyline
            coordinates={remainingRoute}
            strokeWidth={9}
            strokeColor="blue"
          />
        )}

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