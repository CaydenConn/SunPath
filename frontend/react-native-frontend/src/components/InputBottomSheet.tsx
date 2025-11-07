import React, { useMemo, useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../styles/ThemeContext';
import AddressSearchBar from './AddressSearchBar';

type InputBottomSheetProps = {
  userLocation: { latitude: number; longitude: number } | null;
  onRouteFetched: (coords: { latitude: number; longitude: number }[]) => void;
  onDestinationSelected?: (dest: { latitude: number; longitude: number }) => void;
};

const InputBottomSheet: React.FC<InputBottomSheetProps> = ({ userLocation, onRouteFetched, onDestinationSelected, }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%', '87%'], []);


  const initialMapState = {
    categories: [
      {
        name: 'Home',
      },
      {
        name: 'Work'
      },
      {
        name: '1111',
      },
      {
        name: '2222'
      },
      {
        name: '3333',
      },
      {
        name: '4444'
      },
      {
        name: '5555',
      },
      {
        name: '6666'
      },
    ],
  }

  const [state, setState] = React.useState(initialMapState);


  return (
    <BottomSheet 
    ref={bottomSheetRef}
    snapPoints={snapPoints} 
    enableContentPanningGesture={true}
    style={styles.sheet}
    backgroundStyle={{ backgroundColor: theme.color }}
    >
      <BottomSheetView style={styles.content}>
        <View>
          <AddressSearchBar
            userLocation={userLocation}
            onRouteFetched={onRouteFetched}
            onDestinationSelected={(dest) => {
              onDestinationSelected?.(dest);
              bottomSheetRef.current?.snapToIndex(1);
            }}
            onFocusExpandSheet={() => bottomSheetRef.current?.expand()}
          />

        </View>
        {/* PINNED LOCATIONS */}
        <View style={styles.pinned_locations}>
          <Text>📍Pinned Locations</Text>
          <BottomSheetScrollView 
          horizontal 
          scrollEventThrottle={16} 
          showsHorizontalScrollIndicator={false} 
          nestedScrollEnabled={true}
          simultaneousHandlers={bottomSheetRef}
          style={styles.pinned_locations_container}>
            {state.categories.map((category, index) => (
              <TouchableOpacity key={index} style={styles.pinned_item}>
                <Text>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </BottomSheetScrollView>
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
    },
    pinned_locations: {
      flexDirection: 'column',
      borderColor: 'blue',
      borderWidth: 1,
      flex: 1,
    },
    pinned_locations_container: {
      paddingHorizontal: 5,
      height: 100,
      borderColor: 'red',
      borderWidth: 1,
    },
    pinned_item: {
      flexDirection:"row",
      backgroundColor:'#fff', 
      borderRadius:20,
      padding:8,
      paddingHorizontal:20, 
      marginHorizontal:10,
      height:35,
      shadowColor: '#ccc',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.5,
      shadowRadius: 5,
      elevation: 10,
    },
});

export default InputBottomSheet;