import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../styles/ThemeContext';
import { getDistance } from 'geolib';
import polyline from "@mapbox/polyline";
import AddressSearchBar from './AddressSearchBar';

import { API_BASE_URL, GOOGLE_PLACES_API_KEY } from "@env";
import { getAuth } from 'firebase/auth';

type NavigationBottomSheetProps = {
  userLocation: { latitude: number; longitude: number } | null;
  onRouteFetched: (coords: { latitude: number; longitude: number }[]) => void;
  onDestinationSelected?: (dest: { latitude: number; longitude: number }) => void;
};

const NavigationBottomSheet: React.FC<NavigationBottomSheetProps> = ({ userLocation, onRouteFetched, onDestinationSelected, }) => {
 
  const { theme, colorScheme } = useTheme();
  const styles = createStyles(theme);
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['14%'], []);

  const [distanceMetric, setDistanceMetric] = useState<string>("miles")

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
          <Text>Hello</Text>
        </View>

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
    pinned_locations: {
      flexDirection: 'column',
    },
    pinned_locations_container: {
      height: 120,
      borderRadius: 10,
      backgroundColor: theme.sheetShading1,
    },
    pinned_locations_container_inner: {
      justifyContent: "center",
      alignItems: 'center',
      paddingHorizontal: 5,
    },
    pinned_item: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pinned_icon_container: {
      flexDirection:"column",
      backgroundColor: theme.sheetShading2, 
      borderRadius:30,
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      marginHorizontal:10,
      height:65,
      zIndex: 1,
    },
    pinned_icon: {
      height: 45,
      width: 45,
    },
    add_icon: {
      height: 25,
      width: 25,
    },
    recents: {
      flexDirection: 'column',
    },
    recents_container: {
      borderRadius: 10,
      backgroundColor: theme.sheetShading1,
      height: 500,
    },
    recents_container_inner: {
      justifyContent: "center",
      alignItems: 'center',
    },
    recent_item: {
      flexDirection: 'row',
      width: '100%',
      borderColor: theme.sheetShading2,
      borderBottomWidth: 1,
      justifyContent: 'center',
      paddingVertical: 10,
    },
    recent_icon_container: {
      flexDirection:"column",
      backgroundColor: theme.sheetShading2, 
      borderRadius:30,
      justifyContent: 'center',
      alignItems: 'center',
      width: 50,
      height:50,
      marginHorizontal: 4,
      zIndex: 1,
    },
    recent_icon: {
      height: 30,
      width: 30,
    },
    recent_info: {
      flexDirection: 'column',
      flex: 1,
      justifyContent: 'center',
    },
    text: {
      color: theme.textColor,
      fontSize: 14,
    },
    sub_text: {
      color: theme.textColor,
      fontSize: 13,
    }
});

export default NavigationBottomSheet;