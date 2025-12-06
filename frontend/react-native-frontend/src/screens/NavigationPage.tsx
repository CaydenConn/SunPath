import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import NavigationHeader from '../components/NavigationHeader'
import Map, { MapRef } from '../components/Map'
import CenterButton from '../components/CenterUserButton';

import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import NavigationBottomSheet from '../components/NavigationBottomSheet';
import polyline from "@mapbox/polyline";

import * as Location from 'expo-location';
import { API_BASE_URL, GOOGLE_PLACES_API_KEY } from '@env';
import { getAuth } from 'firebase/auth';

// Define your navigation stack types 
type InsideStackParam = {
    MainPage: undefined;
    NavigationPage: {
        details: any;
        destination: {
            latitude: number,
            longitude: number,
        };
        simplifiedRoute: { 
            latitude: number;
            longitude: number
        }[] | null;
    };
  // Add other screens if needed
};

type UserLocation = {
  latitude: number;
  longitude: number;
};

// Props for NavigationPage
type NavigationPageProps = {
  navigation: NativeStackNavigationProp<InsideStackParam, 'NavigationPage'>;
  route: RouteProp<InsideStackParam, 'NavigationPage'>;
};

const NavigationPage : React.FC<NavigationPageProps> = ({ route }) => {
    const { details, destination, simplifiedRoute } = route.params;

    const mapRef = useRef<MapRef>(null);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [initialCamera, setInitialCamera] = useState({
        center: {
            latitude: destination.latitude,
            longitude: destination.longitude,
        },
        pitch: 55,      // Navigation tilt
        heading: 0,     // Can update later with compass
        altitude: 220,  // Navigation zoom level
    });
    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;
            const loc = await Location.getCurrentPositionAsync({});
            setUserLocation({ 
                latitude: loc.coords.latitude, 
                longitude: loc.coords.longitude 
            });
            setInitialCamera({
                center: {
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                },
                pitch: 20,
                heading: 0,
                altitude: 275,
            });
            setTimeout(() => {
                handleCenter();
            }, 200);
        })();
    }, []);

    const handleCenter = (): void => {
        mapRef.current?.centerOnUserNav();
    };

    return (
        <View style={styles.container}>
            <NavigationHeader userLocation={userLocation}></NavigationHeader>
            <Map ref={mapRef}
                navigationMode={true} 
                initialCamera={initialCamera} 
                routeCoordinates={simplifiedRoute} 
                destination={destination}
                userLocation={userLocation}/>
            <NavigationBottomSheet></NavigationBottomSheet>
            <CenterButton addedStyle={styles.centerUserButton} onPress={handleCenter}/>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    top: {
        zIndex: 10000,
        flex: 1,
    },
    centerUserButton: {
        position: 'absolute',
            bottom: 140,
            left: 15,
    }
});

export default NavigationPage