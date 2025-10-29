import 'react-native-get-random-values'; 
import { View, StyleSheet, TouchableOpacity, Text, Button } from 'react-native';
import React, { useRef, useState, useEffect, Component } from 'react';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

import Header from '../components/Header'
import Map, { MapRef } from '../components/Map'
import CenterButton from '../components/CenterUserButton';

import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { GOOGLE_PLACES_API_KEY } from '@env';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

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

// Error boundary for the search bar
class SearchBarErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: any) {
        console.error('🔴 SearchBar crashed:', error);
        return { hasError: true };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error('🔴 SearchBar error details:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={{ padding: 10, backgroundColor: '#ffcccc', margin: 15, borderRadius: 8 }}>
                    <Text style={{ color: '#cc0000' }}>Search unavailable</Text>
                </View>
            );
        }
        return this.props.children;
    }
}

const MainPage : React.FC<MainPageProps> = ({ navigation }) => {

    const mapRef = useRef<MapRef>(null);
    const [showSearchBar, setShowSearchBar] = useState(false);

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

    const handlePlaceSelect = (data: any, details: any) => {
        console.log('Selected place:', data);
        console.log('Place details:', details);
        // TODO: Handle the selected place (navigate, add marker, etc.)
    };

    return (
        <View style={styles.container}>
            <Header/>
            <Map ref={mapRef}/>
            
            {/* Search Bar */}
            {GOOGLE_PLACES_API_KEY && showSearchBar && (
                <SearchBarErrorBoundary>
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
                        onFail={(error) => {
                            console.error('🔴 Google Places API Error:', error);
                        }}
                        onNotFound={() => console.log('⚠️ No results found')}
                        listEmptyComponent={() => (
                            <View style={{ padding: 10 }}>
                                <Text>No results</Text>
                            </View>
                        )}
                        keepResultsAfterBlur={true}
                        suppressDefaultStyles={false}
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
                </SearchBarErrorBoundary>
            )}
            
            <CenterButton onPress={handleCenter}/>
            
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
    logoutContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
    },
});

export default MainPage