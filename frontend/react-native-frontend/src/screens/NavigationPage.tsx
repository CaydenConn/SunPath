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

// Props for NavigationPage
type NavigationPageProps = {
  navigation: NativeStackNavigationProp<InsideStackParam, 'NavigationPage'>;
  route: RouteProp<InsideStackParam, 'NavigationPage'>;
};

const NavigationPage : React.FC<NavigationPageProps> = ({ route }) => {
    const { details, destination, simplifiedRoute } = route.params;

    const mapRef = useRef<MapRef>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

    useEffect(() => {
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== "granted") return;
            const loc = await Location.getCurrentPositionAsync({});
            setUserLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
            })();
    }, []);

    const handleCenter = (): void => {
        mapRef.current?.centerOnUser();
    };

    return (
        <View style={styles.container}>
            <NavigationHeader userLocation={userLocation}></NavigationHeader>
            <Map ref={mapRef} routeCoordinates={simplifiedRoute} destination={destination}/>
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