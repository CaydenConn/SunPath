import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import { API_BASE_URL, GOOGLE_PLACES_API_KEY } from "@env";
import polyline from "@mapbox/polyline";
import { useTheme } from "../../styles/ThemeContext";
import { getAuth } from "firebase/auth";
import BottomSheetMethods from '@gorhom/bottom-sheet';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AddressSearchBarProps = {
    userLocation: { latitude: number; longitude: number } | null;
    onRouteFetched: (coords: { latitude: number; longitude: number }[]) => void;
    onDestinationSelected?: (dest: { latitude: number; longitude: number }) => void;
    onPress?: (data: any, details: any) => void;
    onFocusExpandSheet?: () => void;
    bottomSheetRef?: React.RefObject<BottomSheetMethods | null>;
};
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
};
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
  }
};
type NavigationProp = NativeStackNavigationProp<InsideStackParam>;


const AddressSearchBar: React.FC<AddressSearchBarProps> = ({ userLocation, onRouteFetched, onDestinationSelected, onPress, onFocusExpandSheet, bottomSheetRef }) => {
    const { theme, colorScheme, toggleTheme } = useTheme();
    const styles = createStyles(theme);

    const navigation = useNavigation<NavigationProp>();

    const placesRef = useRef<GooglePlacesAutocompleteRef>(null);
    const handlePlaceSelect = async (data: any, details: any) => {
        placesRef.current?.blur();
        if (!details || !userLocation) return;

        const destination = {
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
        };

        if (bottomSheetRef?.current) {
            setTimeout(() => {
                bottomSheetRef.current?.snapToIndex(1);
            }, 50);
        }

        // Fetch route from Google Directions API
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation.latitude},${userLocation.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_PLACES_API_KEY}`
            );

            const dataJson = await response.json();
            if (!dataJson.routes?.length) return;

            const leg = dataJson.routes[0].legs[0]
            const steps: Step[] = leg.steps;
            const routeCoords = steps.flatMap((step: Step) =>
                polyline.decode(step.polyline.points).map((p: [number, number]) => ({
                    latitude: p[0],
                    longitude: p[1],
                }))
            );
            // const simplifiedRoute = routeCoords.filter((_, index) => index % 2 === 0);
            const simplifiedRoute = routeCoords
            
            // Navigate to the NavPage + Pass all relevent data
            navigation.navigate('NavigationPage', {
                details,
                destination,
                simplifiedRoute: simplifiedRoute, 
                etaDetails: {
                    etaText: leg.duration.text,
                    etaSeconds: leg.duration.value,
                    distanceText: leg.distance.text,
                    distanceMeters: leg.distance.value,
                },
                steps: dataJson.routes[0].legs[0].steps
            });
  
            // Adds Searched Locations to Recents
            const postResponse = await fetch(`${API_BASE_URL}/api/recents`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-User-Id": `${getAuth().currentUser?.uid}`,
                },
                body: JSON.stringify({
                    label: details.name ?? details.formatted_address ?? "",
                    address: details.formatted_address ?? "", 
                    lat: details.geometry.location.lat,
                    lng: details.geometry.location.lng,
                    place_id: details.place_id,
                }),
            });
            const postJson = await postResponse.json();
            console.log("Recent saved: ", postJson)

            placesRef.current?.setAddressText('');
        } catch (error) {
            console.error("Failed to fetch route: ", error);
        }
        

        // TO HERE
    };

    if (!GOOGLE_PLACES_API_KEY) return null;

    return (
        <View style={styles.container}>
            <GooglePlacesAutocomplete
                ref={placesRef}
                placeholder="Search"
                onPress={handlePlaceSelect}
                query={{ key: GOOGLE_PLACES_API_KEY, language: "en" }}
                fetchDetails={true}
                enablePoweredByContainer={false}
                debounce={400}
                minLength={3}
                styles={{
                    textInput: styles.textInput,
                    listView: styles.listView,
                    row: styles.row,
                    separator: styles.separator,
                    description: styles.description,
                }}

                autoFillOnNotFound={false}
                currentLocation={false}
                currentLocationLabel="Current location"
                disableScroll={false}
                enableHighAccuracyLocation={true}
                filterReverseGeocodingByTypes={[]}
                GooglePlacesDetailsQuery={{}}
                GooglePlacesSearchQuery={{
                rankby: 'distance',
                type: 'restaurant',
                }}
                GoogleReverseGeocodingQuery={{}}
                isRowScrollable={true}
                keyboardShouldPersistTaps="always"
                listUnderlayColor={theme.sheetShading2}
                listViewDisplayed="auto"
                keepResultsAfterBlur={false}
                nearbyPlacesAPI="GooglePlacesSearch"
                numberOfLines={1}
                onFail={() => {}}
                onNotFound={() => {}}
                onTimeout={() =>
                console.warn('google places autocomplete: request timeout')
                }
                predefinedPlaces={[]}
                predefinedPlacesAlwaysVisible={false}
                suppressDefaultStyles={false}
                textInputHide={false}
                textInputProps={{
                    onFocus: onFocusExpandSheet,
                    blurOnSubmit: true,
                    placeholderTextColor: theme.textColor,
                    color: theme.textColor,
                }}
                timeout={20000}
            />
        </View>
    );
};

const createStyles = (theme : any) => 
    StyleSheet.create({
        container: { flex: 0 },
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
        },
        listView: {
            backgroundColor: theme.sheetShading1 ,
            borderRadius: 8,
            marginTop: 4,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
        },
        row: { 
            backgroundColor: theme.sheetShading1, 
            padding: 13, 
            height: 44, 
            flexDirection: "row" 
        },
        separator: { height: 0.7, backgroundColor: theme.sheetShading2 },
        description: { 
            fontSize: 14,
            color: theme.textColor,
         },
});

export default AddressSearchBar;
