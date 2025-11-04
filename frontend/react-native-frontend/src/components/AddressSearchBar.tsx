import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { GooglePlacesAutocomplete, GooglePlacesAutocompleteRef } from "react-native-google-places-autocomplete";
import { GOOGLE_PLACES_API_KEY } from "@env";
import polyline from "@mapbox/polyline";

type AddressSearchBarProps = {
    userLocation: { latitude: number; longitude: number } | null;
    onRouteFetched: (coords: { latitude: number; longitude: number }[]) => void;
    onDestinationSelected?: (dest: { latitude: number; longitude: number }) => void;
    onPress?: (data: any, details: any) => void;
    onFocusExpandSheet?: () => void;
};

const AddressSearchBar: React.FC<AddressSearchBarProps> = ({ userLocation, onRouteFetched, onDestinationSelected, onPress, onFocusExpandSheet, }) => {
    const placesRef = useRef<GooglePlacesAutocompleteRef>(null);
    const handlePlaceSelect = async (data: any, details: any) => {
        placesRef.current?.blur();
        if (!details || !userLocation) return;

        const destination = {
            latitude: details.geometry.location.lat,
            longitude: details.geometry.location.lng,
        };

        onDestinationSelected?.(destination);

        // Notify parent if callback exists
        onPress?.(data, details);

        // Fetch route from Google Directions API
        try {
            const response = await fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation.latitude},${userLocation.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_PLACES_API_KEY}`
            );

            const dataJson = await response.json();
            if (!dataJson.routes?.length) return;

            const routeCoords: { latitude: number; longitude: number }[] = [];

            const steps = dataJson.routes[0].legs[0].steps;
            for (const step of steps) {
            const stepPoints = polyline.decode(step.polyline.points);
            stepPoints.forEach((p: number[]) => routeCoords.push({ latitude: p[0], longitude: p[1] }));
            }

            const simplifiedRoute = routeCoords.filter((_, index) => index % 3 === 0);
            onRouteFetched(simplifiedRoute);
        } catch (error) {
            console.error("Failed to fetch route:", error);
        }
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
            listUnderlayColor="#c8c7cc"
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
            }}
            timeout={20000}
        />
        </View>
    );
};

const styles = StyleSheet.create({
  container: { flex: 0 },
  textInput: {
    height: 44,
    fontSize: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  listView: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  row: { backgroundColor: "#fff", padding: 13, height: 44, flexDirection: "row" },
  separator: { height: 0.5, backgroundColor: "#c8c7cc" },
  description: { fontSize: 14 },
});

export default AddressSearchBar;
