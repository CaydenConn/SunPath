import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import Header from '../components/Header'
import Map, { MapRef } from '../components/Map'
import CenterButton from '../components/CenterUserButton';

import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import InputBottomSheet from '../components/InputBottomSheet';

import * as Location from 'expo-location';

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

const MainPage : React.FC<MainPageProps> = ({ navigation }) => {

    const mapRef = useRef<MapRef>(null);
    const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
    const [destination, setDestination] = useState<{ latitude: number; longitude: number } | null>(null);
    const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [initialRegion, setInitialRegion] = useState({
        latitude: 30.4383,
        longitude: -84.2807,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
    });

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
            <Header userLocation={userLocation}/>
            <Map ref={mapRef}
                navigationMode={false} 
                initialRegion={initialRegion} 
                routeCoordinates={routeCoordinates} 
                destination={destination}
                userLocation={userLocation}
                showDefaultUserIcon={true}
                />
            <CenterButton addedStyle={styles.centerUserButton} onPress={handleCenter}/>
            <InputBottomSheet userLocation={userLocation} onRouteFetched={setRouteCoordinates} onDestinationSelected={setDestination}/>
            {/* Logout button */}
            {/* <View style={styles.logoutContainer}>
                <Button title="Log out" onPress={() => FIREBASE_AUTH.signOut()} />
            </View> */}
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
            bottom: 180,
            right: 20,
    }

});

export default MainPage