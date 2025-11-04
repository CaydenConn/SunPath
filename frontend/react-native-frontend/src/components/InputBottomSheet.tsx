import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../styles/ThemeContext';
import AddressSearchBar from './AddressSearchBar';
import { MapRef } from "./Map";

type InputBottomSheetProps = {
  userLocation: { latitude: number; longitude: number } | null;
  onRouteFetched: (coords: { latitude: number; longitude: number }[]) => void;
  onDestinationSelected?: (dest: { latitude: number; longitude: number }) => void;
  mapRef?: React.RefObject<MapRef | null>
};

const InputBottomSheet: React.FC<InputBottomSheetProps> = ({ userLocation, onRouteFetched, onDestinationSelected, mapRef }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  
  const snapPoints = useMemo(() => ['40%', '87%'], []);

  return (
    <BottomSheet 
        snapPoints={snapPoints} 
        style={styles.sheet}
        backgroundStyle={{ backgroundColor: theme.import_bottom.color }}
        >
      <BottomSheetView style={styles.content}>
        <AddressSearchBar
          userLocation={userLocation}
          onRouteFetched={onRouteFetched}
          onDestinationSelected={onDestinationSelected}
          mapRef={mapRef}
        />
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
    },
});

export default InputBottomSheet;