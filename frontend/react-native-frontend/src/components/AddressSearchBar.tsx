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
    userLocation?: { latitude: number; longitude: number } | null;
    handleSearchBarSelection: (data: any, details: any) => void | Promise<void>;
    onRouteFetched?: (coords: { latitude: number; longitude: number }[]) => void;
    onDestinationSelected?: (dest: { latitude: number; longitude: number }) => void;
    onPress?: (data: any, details: any) => void;
    onFocusExpandSheet?: () => void;
    bottomSheetRef?: React.RefObject<BottomSheetMethods | null>;
};

const AddressSearchBar: React.FC<AddressSearchBarProps> = ({ userLocation, handleSearchBarSelection, onRouteFetched, onDestinationSelected, onPress, onFocusExpandSheet, bottomSheetRef }) => {
    const { theme, colorScheme, toggleTheme } = useTheme();
    const styles = createStyles(theme);

    const placesRef = useRef<GooglePlacesAutocompleteRef>(null);

    if (!GOOGLE_PLACES_API_KEY) return null;

    return (
        <View style={styles.container}>
            <GooglePlacesAutocomplete
                ref={placesRef}
                placeholder="Search"
                onPress={handleSearchBarSelection}
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
