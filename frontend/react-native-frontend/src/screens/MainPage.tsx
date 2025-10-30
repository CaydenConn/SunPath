import 'react-native-get-random-values'; 
import { View, StyleSheet, Button } from 'react-native';
import React, { useRef, useState, useEffect } from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import Header from '../components/Header'
import Map, { MapRef } from '../components/Map'
import CenterButton from '../components/CenterUserButton';

import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { GOOGLE_PLACES_API_KEY } from '@env';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';

// Define your navigation stack types
type RootStackParamList = {
  MainPage: undefined;
  // Add other screens if needed
};

// Props for MainPage
type MainPageProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainPage'>;
  route: RouteProp<RootStackParamList, 'MainPage'>;
};

interface RouteCoordinates {
    latitude: number;
    longitude: number;
}

const MainPage : React.FC<MainPageProps> = ({ navigation }) => {

    const mapRef = useRef<MapRef>(null);
    const [showSearchBar, setShowSearchBar] = useState(false);
    const [routeCoordinates, setRouteCoordinates] = useState<RouteCoordinates[]>([]);
    const [destination, setDestination] = useState<{ latitude: number; longitude: number; name: string } | null>(null);

    // Delay rendering search bar to avoid initialization race condition
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSearchBar(true);
        }, 1000); // Increased to 1 second
        return () => clearTimeout(timer);
    }, []);

    const handleCenter = (): void => {
        mapRef.current?.centerOnUser();
    };

    const getDirections = async (origin: { latitude: number; longitude: number }, destination: { latitude: number; longitude: number }) => {
        try {
            const originStr = `${origin.latitude},${origin.longitude}`;
            const destStr = `${destination.latitude},${destination.longitude}`;
            const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destStr}&key=${GOOGLE_PLACES_API_KEY}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.status === 'OK' && data.routes.length > 0) {
                const points = polyline.decode(data.routes[0].overview_polyline.points);
                const coords = points.map((point: number[]) => ({
                    latitude: point[0],
                    longitude: point[1]
                }));
                
                setRouteCoordinates(coords);
                mapRef.current?.fitToRoute(coords);
            } else {
                alert('Could not find a route to this location');
            }
        } catch (error) {
            console.error('Directions API error:', error);
            alert('Failed to get directions');
        }
    };

    const handlePlaceSelect = async (data: any, details: any) => {
        if (details?.geometry?.location) {
            const selectedLocation = {
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
                name: data.description || 'Selected Location'
            };
            
            setDestination(selectedLocation);
            
            // Get user's current location
            try {
                const location = await Location.getCurrentPositionAsync({});
                const userLocation = {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                };
                
                // Get and display route
                await getDirections(userLocation, selectedLocation);
            } catch (error) {
                console.error('Failed to get user location:', error);
                alert('Could not get your current location');
            }
        }
    };

    const handleCancelRoute = () => {
        setRouteCoordinates([]);
        setDestination(null);
        handleCenter();
    };

    return (
        <View style={styles.container}>
            <Header/>
            <Map ref={mapRef} routeCoordinates={routeCoordinates} destination={destination}/>
            
            {/* Search Bar */}
            {GOOGLE_PLACES_API_KEY && showSearchBar && (
                <View style={styles.searchContainer}>
                    <GooglePlacesAutocomplete
                        predefinedPlaces={[]}
                        textInputProps={{}} 
                        placeholder='Search for a place...'
                        onPress={handlePlaceSelect}
                        query={{
                            key: GOOGLE_PLACES_API_KEY,
                            language: 'en',
                        }}
                        fetchDetails={true}
                        enablePoweredByContainer={false}
                        debounce={400}
                        minLength={3}
                        styles={{
                        container: {
                            flex: 0,
                        },
                        textInput: {
                            height: 44,
                            fontSize: 16,
                            backgroundColor: '#FFFFFF',
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 4,
                            elevation: 5,
                        },
                        listView: {
                            backgroundColor: '#FFFFFF',
                            borderRadius: 8,
                            marginTop: 4,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 4,
                            elevation: 5,
                        },
                        row: {
                            backgroundColor: '#FFFFFF',
                            padding: 13,
                            height: 44,
                            flexDirection: 'row',
                        },
                        separator: {
                            height: 0.5,
                            backgroundColor: '#c8c7cc',
                        },
                        description: {
                            fontSize: 14,
                        },
                        poweredContainer: {
                            display: 'none',
                        },
                    }}
                    />
                </View>
            )}
            
            <CenterButton onPress={handleCenter}/>
            
            {/* Cancel Route Button */}
            {routeCoordinates.length > 0 && (
                <View style={styles.cancelRouteContainer}>
                    <Button title="Cancel Route" onPress={handleCancelRoute} color="#ff4444" />
                </View>
            )}
            
            {/* Logout button */}
            <View style={styles.logoutContainer}>
                <Button title="Log out" onPress={() => FIREBASE_AUTH.signOut()} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        position: 'absolute',
        top: 120, // Below the header
        left: 15,
        right: 15,
        zIndex: 5,
    },
    cancelRouteContainer: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: '#ff4444',
        borderRadius: 8,
        overflow: 'hidden',
    },
    logoutContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
});

export default MainPage