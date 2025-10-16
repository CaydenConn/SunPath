import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import React, { useRef } from 'react';

import Header from '../components/Header.js'
import Map from '../components/Map.js'
import CenterButton from '../components/CenterUserButton.js';

import { FIREBASE_AUTH } from '../../FirebaseConfig.js';

const MainPage = ({ navigation }) => {

    const mapRef = useRef(null);

    const handleCenter = () => {
        mapRef.current?.centerOnUser();
    };

    return (
        <View style={styles.container}>
            <Header/>
            <Map ref={mapRef}/>
            <CenterButton onPress={handleCenter}/>
            
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
});

export default MainPage