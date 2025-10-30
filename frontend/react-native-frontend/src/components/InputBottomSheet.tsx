import React, { useMemo } from 'react';
import { Text, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../styles/ThemeContext';

const InputBottomSheet: React.FC = () => {
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
        <Text>Hello World</Text>
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