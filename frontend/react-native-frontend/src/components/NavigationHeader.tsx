import { StyleSheet, Text, TouchableWithoutFeedback, View, Image, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../styles/ThemeContext';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationHeaderProps = {
  userLocation: { latitude: number; longitude: number } | null;
}

export default function NavigationHeader({ userLocation }: NavigationHeaderProps) {
    const insets = useSafeAreaInsets();

    const { theme, colorScheme, toggleTheme } = useTheme();
    const styles = createStyles(theme);
    return (
        <View style={styles.top_holder}>
            <View style={styles.current_direction_container}>
            {/* Weather Data */}
                <View style={[styles.weather_box,
                    {
                        paddingTop: insets.top,
                        paddingLeft: insets.left,
                        paddingRight: insets.right,
                    }
                ]}>
                    <Text>Weather Data Unavailable</Text>
                </View>  
            </View>

            <View style={styles.next_direction_container}>
            {/* Weather Data */}
                <View style={styles.weather_box}>
                    <Text>Weather Data Unavailable</Text>
                </View>  
            </View>
        </View>
    );
}

const createStyles = (theme : any) => 
  StyleSheet.create({
    top_holder: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'column',
        alignItems: 'center',
        zIndex: 100,

    },
    current_direction_container: {
        flexDirection: 'row',
        backgroundColor: theme.color,
        height: theme.navigation_header.current_container_height,
    },
    weather_box: {
        flex: 1,
        flexDirection: 'row',
        padding: 10,
        paddingRight: 16,
        justifyContent: 'space-between',
        alignItems: 'center',
        // borderColor: 'red',
        // borderWidth: 1,
    },
    next_direction_container: {
        flexDirection: 'row',
        backgroundColor: theme.color,
        height: theme.navigation_header.next_container_height,
        backgroundColor: theme.navigation_header.next_container_color,
    },
});