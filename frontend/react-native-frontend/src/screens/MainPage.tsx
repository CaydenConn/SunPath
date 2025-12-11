import { View, StyleSheet, TouchableOpacity, Text, Pressable, Button, Image } from 'react-native';
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
import { Modal } from '../components/Modal';
import { useTheme } from '../../styles/ThemeContext';
import { TextInput } from 'react-native-gesture-handler';
import AddressSearchBar from '../components/AddressSearchBar';
import { API_BASE_URL } from '@env';

// Define your navigation stack types 
type RootStackParamList = {
  MainPage: undefined;
  // Add other screens if needed
};

type PinnedCoordsParams = {
    address: string;
    lat: number | null;
    lng: number | null;
}

type AddressItem = {
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  place_id?: string;
  ts?: string;
};

// Props for MainPage
type MainPageProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'MainPage'>;
  route: RouteProp<RootStackParamList, 'MainPage'>;
};

const MainPage : React.FC<MainPageProps> = ({ navigation }) => {
    const { theme, colorScheme } = useTheme();
    const styles = createStyles(theme);
    
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [pinnedLabel, setPinnedLabel] = useState<string | undefined>(undefined)
    const [pinnedCoords, setPinnedCoords] = useState<PinnedCoordsParams>({
        address: "",
        lat: null,
        lng: null
    })
    const [item, setItem] = useState<AddressItem>({
        label: "",
        address: "",
        latitude: 0,
        longitude: 0,
        place_id: undefined,
        ts: undefined,
    })

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

    const handleSearchBarSelection = async (data: any, details: any) => {
        if (!details) return;
        
        const destination = {
            address: details.formatted_address ?? "",
            lat: details.geometry.location.lat,
            lng: details.geometry.location.lng,
        };
        setPinnedCoords(destination);
    }

    const handleCreatePinClicked = async () => {
        try {
            const idToken = await FIREBASE_AUTH.currentUser?.getIdToken();
            if (!idToken) throw new Error("No auth token");
            
            if(item.label === "Home" || item.label === "Work"){
                // Creating Endpoint Based on Item Passed Through
                let endpoint = "/api/users/favorites";
                if (item?.label === "Home") endpoint += "/home";
                if (item?.label === "Work") endpoint += "/work";

                const body = {
                    address: pinnedCoords.address ?? "", 
                    latitude: pinnedCoords.lat,
                    longitude: pinnedCoords.lng,
                }
                const postResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${idToken}`,
                    },
                    body: JSON.stringify(body),
                })
                const postJson = await postResponse.json();
                console.log("Home Pin Edited: ", postJson)

                // Cleanup
                setItem({
                    label: "",
                    address: "",
                    latitude: 0,
                    longitude: 0,
                    place_id: undefined,
                    ts: undefined,
                })
                setPinnedCoords({
                    address: "",
                    lat: null,
                    lng: null,
                })
                setPinnedLabel(undefined)
                setIsModalVisible(false)
            }else{
                const postResponse = await fetch(`${API_BASE_URL}/api/users/favorites`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${idToken}`,
                    },
                    body: JSON.stringify({
                        label: pinnedLabel ?? "",
                        address: pinnedCoords.address ?? "", 
                        latitude: pinnedCoords.lat,
                        longitude: pinnedCoords.lng,
                    }),
                });
                const postJson = await postResponse.json();
                console.log("Pinned saved: ", postJson)

                setPinnedCoords({
                    address: "",
                    lat: null,
                    lng: null,
                })
                setPinnedLabel(undefined)
                setIsModalVisible(false)
            }
        }catch(error){
            console.log("Failed to add Pinned location: ", error)
        }

    }

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
            <InputBottomSheet 
            userLocation={userLocation} 
            onRouteFetched={setRouteCoordinates} 
            onDestinationSelected={setDestination}
            setIsModalVisible={setIsModalVisible}
            setModalItem={setItem}
            />


            {/* Add Or Update Favorites Modal */}
            <Modal
            isVisible={isModalVisible}>
                <View style={styles.modal_container}>
                    <View style={styles.modal_title_container}>
                        <Text style={styles.modal_title}>Add Pinned Location</Text>
                        {colorScheme === 'light'
                        ? (
                            <TouchableOpacity activeOpacity={0.6} onPress={() => {setIsModalVisible(false)}}>
                                <Image style={styles.modal_close} source={require('../../assets/close.png')}/>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => {setIsModalVisible(false)}}>
                                <Image style={styles.modal_close} source={require('../../assets/close_white.png')}/>
                            </TouchableOpacity>
                        )}
                    </View>
                    <View style={styles.modal_content_container}>
                        <Text style={styles.modal_subtitle}>Label</Text>
                        <TextInput 
                        value={pinnedLabel}
                        onChangeText={setPinnedLabel}
                        style={styles.textInput}
                        placeholderTextColor={theme.textColor}
                        placeholder={
                            ( item.label === "Work" || item.label === "Home" )
                            ? item.label 
                            : pinnedLabel ?? "Enter Label"
                        }
                        editable={!(item?.label === "Home" || item?.label === "Work")}/>
                    </View>
                    <View style={styles.modal_content_container}>
                        <Text style={styles.modal_subtitle}>Address</Text>
                        <AddressSearchBar
                        handleSearchBarSelection={handleSearchBarSelection}/>
                    </View>
                    <TouchableOpacity
                    onPress={handleCreatePinClicked} 
                    style={styles.modal_button}>
                        <Text style={styles.modal_button_text}>Create Pin</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}
const createStyles = (theme : any) => 
    StyleSheet.create({
    container: {
        flex: 1,
    },
    top: {
        zIndex: 100,
        flex: 1,
    },
    centerUserButton: {
        position: 'absolute',
            bottom: 180,
            right: 20,
    },
    modal_container: {
        width: '100%',
        padding: 10,
        backgroundColor: theme.color,
        borderRadius: theme.header.borderRadius,
        zIndex: 1000,
        position: 'absolute',
        gap: 10,
    },
    modal_title_container: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-between'
    },
    modal_title: {
        color: theme.textColor,
        fontWeight: 600,
        fontSize: 20,
    },
    modal_close: {
        width: 30,
        height: 30,
    },
    modal_content_container: {
        flex: 1,
        flexDirection: 'column',
    },
    modal_subtitle: {
        color: theme.textColor,
        fontSize: 14,
    },
    modal_button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4285F4',
        height: 55,
        borderRadius: theme.header.borderRadius,
        marginTop: 15,
    },
    modal_button_text: {
        fontWeight: 'bold',
        fontSize: 20,
        color: 'white',
    },
    textInput: {
        height: 44,
        fontSize: 16,
        backgroundColor: theme.sheetShading1,
        borderRadius: 8,
        paddingHorizontal: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        color: theme.textColor,
    },
});

export default MainPage