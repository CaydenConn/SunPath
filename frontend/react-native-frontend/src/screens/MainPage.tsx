import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import React, { useMemo, useRef } from 'react';

import Header from '../components/Header'
import Map, { MapRef } from '../components/Map'
import CenterButton from '../components/CenterUserButton';

import { FIREBASE_AUTH } from '../../FirebaseConfig';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import InputBottomSheet from '../components/InputBottomSheet';

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

    const handleCenter = (): void => {
        mapRef.current?.centerOnUser();
    };

    return (
        <View style={styles.container}>
            <Header/>
            <Map ref={mapRef}/>
            <CenterButton onPress={handleCenter}/>
            <InputBottomSheet/>
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
    }
});

export default MainPage