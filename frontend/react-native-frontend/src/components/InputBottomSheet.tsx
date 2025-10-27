import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { styles_import_bottom } from '../../styles/themes';
const InputBottomSheet: React.FC = () => {
  const snapPoints = useMemo(() => ['40%', '87%'], []);

  return (
    <BottomSheet 
        snapPoints={snapPoints} 
        style={styles.sheet}
        backgroundStyle={{ backgroundColor: styles_import_bottom.color }}
        >
      <BottomSheetView style={styles.content}>
        <Text>Hello World</Text>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheet: {
    zIndex: 10000,
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

export default InputBottomSheet;