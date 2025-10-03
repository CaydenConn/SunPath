import { View, StyleSheet, Button, TouchableOpacity, Text, Alert } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import MapView, { Marker, Polyline, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { FIREBASE_AUTH } from '../FirebaseConfig';

const LoggedIn = ({ navigation }) => {
    // State for user-added markers
    const [markers, setMarkers] = useState([]);
    const [selectedMarker, setSelectedMarker] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const mapRef = useRef(null);
    
    // FSU static marker
    const fsuLocation = {
        latitude: 30.4383,
        longitude: -84.2807,
    };

    // Get user location on component mount
    useEffect(() => {
        (async () => {
            try {
                // Request location permissions
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    Alert.alert('Permission Denied', 'Location permission is required to show your position');
                    return;
                }

                // Get current location
                let location = await Location.getCurrentPositionAsync({});
                setUserLocation({
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                });

                console.log('User location:', location.coords);
            } catch (error) {
                console.error('Error getting location:', error);
                Alert.alert('Location Error', 'Could not get your location');
            }
        })();
    }, []);

    // Center map on user location
    const centerOnUser = () => {
        if (userLocation && mapRef.current) {
            mapRef.current.animateToRegion({
                ...userLocation,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
            }, 1000);
        } else {
            Alert.alert('Location Not Available', 'Your location is not available yet');
        }
    };

    // Handle map press - add new marker where user taps
    const handleMapPress = (event) => {
        const { coordinate } = event.nativeEvent;
        const newMarker = {
            id: Date.now().toString(),
            coordinate: coordinate,
            title: `Point ${markers.length + 1}`,
        };
        setMarkers([...markers, newMarker]);
    };

    // Remove a marker
    const removeMarker = (markerId) => {
        setMarkers(markers.filter(m => m.id !== markerId));
        setSelectedMarker(null);
    };

    // Clear all user markers
    const clearAllMarkers = () => {
        setMarkers([]);
        setSelectedMarker(null);
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: 30.4383,
                    longitude: -84.2807,
                    latitudeDelta: 0.0922,
                    longitudeDelta: 0.0421,
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                onPress={handleMapPress}  // Tap to add markers
            >
                {/* FSU Static Marker */}
                <Marker
                    coordinate={fsuLocation}
                    title="Florida State University"
                    description="FSU Campus"
                    pinColor="red"
                />

                {/* Circle around FSU - shows radius */}
                <Circle
                    center={fsuLocation}
                    radius={500}  // 500 meters
                    strokeColor="rgba(255, 0, 0, 0.5)"
                    fillColor="rgba(255, 0, 0, 0.1)"
                />

                {/* User Location Marker - Custom marker for your position */}
                {userLocation && (
                    <Marker
                        coordinate={userLocation}
                        title="You Are Here"
                        description="Your current location"
                        pinColor="green"
                    >
                        <View style={styles.userMarker}>
                            <View style={styles.userMarkerInner} />
                        </View>
                    </Marker>
                )}

                {/* User-added markers */}
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        coordinate={marker.coordinate}
                        title={marker.title}
                        description="Tap to remove"
                        pinColor="blue"
                        onPress={() => setSelectedMarker(marker.id)}
                    />
                ))}

                {/* Draw line connecting all markers */}
                {markers.length > 1 && (
                    <Polyline
                        coordinates={markers.map(m => m.coordinate)}
                        strokeColor="#0066ff"
                        strokeWidth={3}
                    />
                )}
            </MapView>
            
            {/* Custom UI overlay - Instructions */}
            <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsText}>
                    Tap map to add markers
                </Text>
                <Text style={styles.markerCount}>
                    Markers: {markers.length}
                </Text>
                {userLocation && (
                    <Text style={styles.locationStatus}>📍 Location: Active</Text>
                )}
            </View>

            {/* Center on User button */}
            {userLocation && (
                <TouchableOpacity 
                    style={styles.centerUserButton}
                    onPress={centerOnUser}
                >
                    <Text style={styles.centerUserButtonText}>📍</Text>
                </TouchableOpacity>
            )}

            {/* Clear markers button */}
            {markers.length > 0 && (
                <TouchableOpacity 
                    style={styles.clearButton}
                    onPress={clearAllMarkers}
                >
                    <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
            )}

            {/* Remove selected marker button */}
            {selectedMarker && (
                <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeMarker(selectedMarker)}
                >
                    <Text style={styles.removeButtonText}>Remove Selected</Text>
                </TouchableOpacity>
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
    map: {
        width: '100%',
        height: '100%',
    },
    logoutContainer: {
        position: 'absolute',
        top: 50,
        right: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    instructionsContainer: {
        position: 'absolute',
        top: 50,
        left: 20,
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    instructionsText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    markerCount: {
        fontSize: 12,
        color: '#666',
        marginTop: 4,
    },
    clearButton: {
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',
        backgroundColor: '#ff5252',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    clearButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    removeButton: {
        position: 'absolute',
        bottom: 40,
        alignSelf: 'center',
        backgroundColor: '#ff9800',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 25,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    removeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    locationStatus: {
        fontSize: 11,
        color: '#4CAF50',
        marginTop: 4,
        fontWeight: '600',
    },
    userMarker: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(76, 175, 80, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#4CAF50',
    },
    userMarkerInner: {
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: '#4CAF50',
    },
    centerUserButton: {
        position: 'absolute',
        bottom: 180,
        right: 20,
        backgroundColor: '#4CAF50',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    centerUserButtonText: {
        fontSize: 24,
    },
});

export default LoggedIn