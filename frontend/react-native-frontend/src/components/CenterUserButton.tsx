import React from 'react';
import { StyleSheet, TouchableOpacity, Text, GestureResponderEvent, Image, View } from 'react-native';
import { useTheme } from '../../styles/ThemeContext';

type CenterButtonProps = {
  onPress: (event: GestureResponderEvent) => void;
  addedStyle?: any;
};

export default function CenterButton({ onPress, addedStyle }: CenterButtonProps) {
      const { theme, colorScheme, toggleTheme } = useTheme();
      const styles = createStyles(theme);
    
    return (
        <TouchableOpacity 
            activeOpacity={0.75}
            onPress={onPress}
            style={addedStyle}
        >
            <View style={styles.centerUserButton}>
                <Image style={styles.centerUserButtonIcon} source={require("../../assets/center_on_user_icon.png")}/>
            </View>
        </TouchableOpacity>
    );
}

const createStyles = (theme : any) => 
    StyleSheet.create({
        centerUserButton: {
            backgroundColor: theme.color,
            width: 50,
            height: 50,
            borderRadius: 25,
            justifyContent: 'center',
            alignItems: 'center',
            
            shadowColor: theme.center_on_button.shadowColor,
            shadowOffset: theme.center_on_button.shadowOffset,
            shadowOpacity: theme.center_on_button.Opacity,
            shadowRadius: theme.center_on_button.Radius,
            elevation: theme.center_on_button.elevation,
        },
        centerUserButtonIcon: {
            height: 30,
            width: 30,
        },
});