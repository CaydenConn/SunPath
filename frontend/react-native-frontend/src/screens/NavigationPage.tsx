import { View, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
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
import { Marker } from 'react-native-maps';
import { getDistance } from 'geolib';

type Step = {
    html_instructions: string;
    end_location: {
        lat: number;
        lng: number;
    };
    start_location: {
        lat: number;
        lng: number;
    };
    polyline: {
        points: string;
    };
    maneuver?: string;
    duration: {
        text: string;
        value: number;
    };
    distance: {
        text: string;
        value: number;
    };
}
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
        etaDetails: {
            etaText: string,
            etaSeconds: number,
            distanceText: string,
            distanceMeters: number,
        };
        steps: Step[];
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
    const { details, destination, simplifiedRoute, etaDetails, steps } = route.params;

    const mapRef = useRef<MapRef>(null);
    const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
    const [userHeading, setUserHeading] = useState<number>(0);
    const [isFollowing, setIsFollowing] = useState(true);
    const [initialCamera, setInitialCamera] = useState({
        center: {
            latitude: destination.latitude || 0,
            longitude: destination.longitude || 0,
        },
        pitch: 55,      // Navigation tilt
        heading: 0,     // Can update later with compass
        altitude: 220,  // Navigation zoom level
    });
    const [initialRegion, setInitialRegion] = useState({
        latitude: destination.latitude || 0,
        longitude: destination.longitude || 0,
        latitudeDelta: 0.00175,
        longitudeDelta: 0.00175,
    })

    // For live direction text update
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [currentInstruction, setCurrentInstruction] = useState('');
    const [nextInstruction, setNextInstruction] = useState('');
    const [distanceToTurn, setDistanceToTurn] = useState(0);
    const [currentManeuver, setCurrentManeuver] = useState('');
    const [nextManeuver, setNextManeuver] = useState('');

    useEffect(() => {
        let headingSubscription: Location.LocationSubscription;
        let locationSubscription: Location.LocationSubscription;

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
            setInitialRegion({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                latitudeDelta: 0.00175,
                longitudeDelta: 0.00175,
            })

            // 🔹 WATCH HEADING
            headingSubscription = await Location.watchHeadingAsync((heading) => {
                setUserHeading(heading.trueHeading);
            });

            // WATCH USER LOCATION
            locationSubscription = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, distanceInterval: 25 },
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation({ latitude, longitude });
                }
            );

            setTimeout(() => {
                handleCenter();
            }, 200);
        })();
    }, []);

    // Initial Instruction (on mount + no user movement required)
    useEffect(() => {
        if (!steps || steps.length === 0) return;
        // Set initial instructions
        const step = steps[0];

        setCurrentInstruction(step.html_instructions.replace(/<div.*$/i, '').replace(/<[^>]+>/g, ''));
        setCurrentManeuver(step?.maneuver ?? "")
        const next = steps[1];
        setNextInstruction(next ? next.html_instructions.replace(/<div.*$/i, '').replace(/<[^>]+>/g, '') : "");
        setNextManeuver(next?.maneuver ?? "")
    }, []);
    // Instructions updated as the user moves along the route
    useEffect(() => {
        if (!userLocation || steps.length === 0) return;

        const step = steps[currentStepIndex];

        if (!step) return;

        // Measure distance from user to end of step
        const dist = getDistance(
            userLocation,
            {
                latitude: step.start_location.lat,
                longitude: step.start_location.lng
            }
        );

        setDistanceToTurn(dist);

        // if close to step end, go to next step
        if (dist < 25) {
            setCurrentStepIndex(curr => curr + 1);
        }
        // update text instructions
        setCurrentInstruction(step.html_instructions.replace(/<div.*$/i, '').replace(/<[^>]+>/g, ''));
        setCurrentManeuver(step?.maneuver ?? "")

        const nextStep = steps[currentStepIndex + 1];
        setNextInstruction(nextStep ? nextStep.html_instructions.replace(/<div.*$/i, '').replace(/<[^>]+>/g, '') : "");
        setNextManeuver(nextStep?.maneuver ?? "")

        let remainingDistance = 0;
        for (let i = currentStepIndex; i < steps.length; i++) {
            remainingDistance += steps[i].distance.value; // Google gives meters
        }

        etaDetails.distanceMeters = remainingDistance;

        // ETA from Google step duration
        let remainingSeconds = 0;
        for (let i = currentStepIndex; i < steps.length; i++) {
            remainingSeconds += steps[i].duration.value; // seconds
        }

        etaDetails.etaSeconds = remainingSeconds;
    }, [userLocation, currentStepIndex]);

     // 🔹 AUTO-FOLLOW: move camera as user moves
    useEffect(() => {
        if (!isFollowing || !userLocation) return;
            const timeout = setTimeout(() => {
                mapRef.current?.centerOnUserNav(userHeading);
            }, 500); // wait a little for map to settle
        return () => clearTimeout(timeout);
    }, [userLocation, userHeading, isFollowing]);

    const handleCenter = (): void => {
        setIsFollowing(true);
        mapRef.current?.centerOnUserNav(userHeading);
    };
    return (
        <View style={styles.container}>
            <NavigationHeader 
                userLocation={userLocation}
                instruction={currentInstruction}
                nextInstruction={nextInstruction}
                distanceToTurn={distanceToTurn}
                currentManeuver={currentManeuver ?? ""}
                nextManeuver={nextManeuver ?? ""}
                >   
                </NavigationHeader>
            <View
                style={{ flex: 1 }}
                onStartShouldSetResponder={() => {
                    setIsFollowing(false);
                    return false;
                }}
                onMoveShouldSetResponder={() => {
                    setIsFollowing(false);
                    return false;
                }}>
                <Map ref={mapRef}
                    navigationMode={true} 
                    showDefaultUserIcon={false}
                    initialRegion={initialRegion}
                    initialCamera={initialCamera} 
                    routeCoordinates={simplifiedRoute} 
                    destination={destination}
                    userLocation={userLocation}
                    userHeading={userHeading}>
                        {userLocation && (
                            <Marker
                            coordinate={userLocation}
                            rotation={userHeading}
                            anchor={{ x: 0.5, y: 0.5 }}
                            flat={true}>
                                <Image 
                                    source={require('../../assets/user_nav_icon.png')} 
                                    style={{ width: 40, height: 40 }} />
                            </Marker>
                        )}
                </Map>
            </View>
            <NavigationBottomSheet 
                etaDetails={etaDetails}
                >     
                </NavigationBottomSheet>
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