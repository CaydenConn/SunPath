import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../styles/ThemeContext';
import { getDistance } from 'geolib';
import polyline from "@mapbox/polyline";
import AddressSearchBar from './AddressSearchBar';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { API_BASE_URL, GOOGLE_PLACES_API_KEY } from "@env";
import { getAuth } from 'firebase/auth';

// type NavigationBottomSheetProps = {
//   userLocation: { latitude: number; longitude: number } | null;
//   onRouteFetched: (coords: { latitude: number; longitude: number }[]) => void;
//   onDestinationSelected?: (dest: { latitude: number; longitude: number }) => void;
// };
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
  }
};

type NavigationProp = NativeStackNavigationProp<InsideStackParam>;

const NavigationBottomSheet = () => {
 
  const { theme, colorScheme } = useTheme();
  const styles = createStyles(theme);
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['14%'], []);

  const navigation = useNavigation<NavigationProp>();

  const [distanceMetric, setDistanceMetric] = useState<string>("miles")
  const handleEndPressed = () => {
    navigation.pop();
  }
  return (
    <BottomSheet 
    ref={bottomSheetRef}
    snapPoints={snapPoints}
    index={1} 
    enablePanDownToClose={false}
    enableContentPanningGesture={false}
    enableHandlePanningGesture={false}
    handleComponent={null}
    style={styles.sheet}
    backgroundStyle={{ backgroundColor: theme.color }}
    >
      <BottomSheetView style={styles.content}>
        <View>
          <Text style={styles.sheet_title}>ETA, Time + Distance Remaining</Text>
        </View>
        <TouchableOpacity
        onPress={handleEndPressed}
        style={styles.end_button}>
          <Text style={styles.sheet_title}>END</Text>
        </TouchableOpacity>

      </BottomSheetView>
    </BottomSheet>
  );
};

const createStyles = (theme : any) => 
  StyleSheet.create({
    sheet: {
      zIndex: 10000,
      flex: 1,

      shadowColor: theme.import_bottom.shadowColor,
      shadowOpacity: theme.import_bottom.shadowOpacity,
      shadowRadius: theme.import_bottom.shadowRadius,
      shadowOffset: theme.import_bottom.shadowOffset,
    },
    content: {
      flex: 1,
      padding: 16,
      flexDirection: 'column',
      gap: 15,
    },
    sheet_title: {
      color: theme.textColor,
      fontWeight: 'bold',
      fontSize: 16
    },
    end_button: {
      backgroundColor: 'coral'
    },
});

export default NavigationBottomSheet;