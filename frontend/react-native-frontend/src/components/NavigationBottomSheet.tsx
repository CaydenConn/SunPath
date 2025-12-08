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
    etaDetails: {
      etaText: string,
      etaSeconds: number,
      distanceText: string,
      distanceMeters: number,
    }
  }
};

type NavigationProp = NativeStackNavigationProp<InsideStackParam>;

type NavBottomSheetProps = {
  etaDetails: {
      etaText: string,
      etaSeconds: number,
      distanceText: string,
      distanceMeters: number,
  };
}

const NavigationBottomSheet : React.FC<NavBottomSheetProps> = ({ etaDetails }) => {
 
  const { theme, colorScheme } = useTheme();
  const styles = createStyles(theme);
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['14%'], []);

  const navigation = useNavigation<NavigationProp>();

  const [distanceMetric, setDistanceMetric] = useState<string>("miles")
  const handleEndPressed = () => {
    navigation.pop();
  }

  const [currentTime, setCurrentTime] = useState(new Date());
  // Gets Current Time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // updates every second

    return () => clearInterval(interval);
  }, []);

  const arrivalDate = new Date(currentTime.getTime() + etaDetails.etaSeconds * 1000); // convert seconds → ms
  const arrivalHoursMilitary = arrivalDate.getHours();
  var arrivalHoursRegular = arrivalHoursMilitary % 12;
  arrivalHoursRegular = arrivalHoursRegular === 0 ? 12 : arrivalHoursRegular; // Goes away from military time
  const arrivalMinutes = arrivalDate.getMinutes().toString().padStart(2, '0'); // always 2 digits
  const arrivalTime = `${arrivalHoursRegular}:${arrivalMinutes}`;
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
          <View style={styles.navitem_container}>
            <Text style={styles.sheet_title}>{arrivalTime}</Text>
            <Text style={styles.sheet_desc}>arrival</Text>
          </View>
          {
            Math.floor(etaDetails.etaSeconds / 60 / 60 / 24) != 0 && (
              <View style={styles.navitem_container}>
                <Text style={styles.sheet_title}> {Math.floor(etaDetails.etaSeconds / 60 / 60 / 24)}:{Math.round(etaDetails.etaSeconds / 60 / 60 % 24)}</Text>
                <Text style={styles.sheet_desc}>days</Text>
              </View>
            )
          }
          {
            Math.floor(etaDetails.etaSeconds / 60 / 60) < 24 && Math.floor(etaDetails.etaSeconds / 60 / 60) > 0 && (
              <View style={styles.navitem_container}>
                <Text style={styles.sheet_title}> {Math.floor(etaDetails.etaSeconds / 60 / 60)}:{Math.round(etaDetails.etaSeconds / 60 % 60)}</Text>
                <Text style={styles.sheet_desc}>hrs</Text>
              </View>
            )
          }
          {
            Math.floor(etaDetails.etaSeconds / 60) < 60 && (
              <View style={styles.navitem_container}>
                <Text style={styles.sheet_title}> {Math.floor(etaDetails.etaSeconds / 60)}</Text>
                <Text style={styles.sheet_desc}>mins</Text>
              </View>
            )
          }
          
          <View style={styles.navitem_container}>
            <Text style={styles.sheet_title}>{(etaDetails.distanceMeters / 1609).toFixed(1)}</Text>
            <Text style={styles.sheet_desc}>mi</Text>
          </View>
          
        <TouchableOpacity
        onPress={handleEndPressed}
        style={styles.end_button}>
          <Text style={[styles.sheet_title, styles.end_button_text]}>End Route</Text>
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
      padding: 12,
      paddingTop: 20,
      flexDirection: 'row',
      
    },
    navitem_container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'center',
    },
    sheet_title: {
      color: theme.textColor,
      fontWeight: 'bold',
      fontSize: 20
    },
    sheet_desc: {
      color: theme.descTextColor,
      fontSize: 16,

    },
    end_button: {
      backgroundColor: 'red',
      width: 125,
      height: 60,
      borderRadius: theme.header.borderRadius,
      justifyContent: 'center',
      alignItems: 'center',
    },
    end_button_text: {
      color: 'white',
    }

});

export default NavigationBottomSheet;