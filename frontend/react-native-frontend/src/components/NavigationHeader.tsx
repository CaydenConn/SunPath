import { StyleSheet, Text, TouchableWithoutFeedback, View, Image, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../styles/ThemeContext';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Traffic Icons
// Current Direction Icons
import turn_slight_left_icon from '../../assets/direction-icons/turn_slight_left_icon.png'
import turn_sharp_left_icon from '../../assets/direction-icons/turn_sharp_left_icon.png'
import uturn_left_icon from '../../assets/direction-icons/u_turn_left_icon.png'
import turn_left_icon from '../../assets/direction-icons/turn_left_icon.png'
import turn_slight_right_icon from '../../assets/direction-icons/turn_slight_right_icon.png'
import turn_sharp_right_icon from '../../assets/direction-icons/turn_sharp_right_icon.png'
import uturn_right_icon from '../../assets/direction-icons/u_turn_right_icon.png'
import turn_right_icon from '../../assets/direction-icons/turn_right_icon.png'
import straight_icon from '../../assets/direction-icons/straight_icon.png'
import ramp_left_icon from '../../assets/direction-icons/ramp_left_icon.png'
import ramp_right_icon from '../../assets/direction-icons/ramp_right_icon.png'
import merge_icon from '../../assets/direction-icons/merge_icon.png'
import fork_left_icon from '../../assets/direction-icons/fork_left_icon.png'
import fork_right_icon from '../../assets/direction-icons/fork_right_icon.png'
import roundabout_left_icon from '../../assets/direction-icons/roundabout_left_icon.png'
import roundabout_right_icon from '../../assets/direction-icons/roundabout_right_icon.png'
import depart_icon from '../../assets/direction-icons/depart_icon.png'

// End Traffic Icons

type NavigationHeaderProps = {
  userLocation: { latitude: number; longitude: number } | null;
  instruction: string;
  distanceToTurn: number;
  nextInstruction: string;
  currentManeuver: string,
  nextManeuver: string,
}

type DirectionIconParam = {
  curr: any,
  next: any,
}

export default function NavigationHeader({ userLocation, instruction, distanceToTurn, nextInstruction, currentManeuver, nextManeuver }: NavigationHeaderProps) {
    // Maneuver ICON MAP
    const descToIcon = new Map([
        ["turn-slight-left", turn_slight_left_icon],
        ["turn-sharp-left", turn_sharp_left_icon],
        ["uturn-left", uturn_left_icon],
        ["turn-left", turn_left_icon],
        ["turn-slight-right", turn_slight_right_icon],
        ["turn-sharp-right", turn_sharp_right_icon],
        ["uturn-right", uturn_right_icon],
        ["turn-right", turn_right_icon],
        ["straight", straight_icon],
        ["ramp-left", ramp_left_icon], 
        ["ramp-right", ramp_right_icon],
        ["merge", merge_icon],
        ["fork-left", fork_left_icon],
        ["fork-right", fork_right_icon],
        ["roundabout-left", roundabout_left_icon],
        ["roundabout-right", roundabout_right_icon],
        ["depart", depart_icon],
    ])
    // Maneuver TEXT MAP
    const descToText = new Map([
        ["turn-slight-left", "Turn Slight Left"],
        ["turn-sharp-left", "Turn Sharp Left"],
        ["uturn-left", "U-turn Left"],
        ["turn-left", "Turn Left"],
        ["turn-slight-right", "Turn Slight Right"],
        ["turn-sharp-right", "Turn Sharp Right"],
        ["uturn-right", "U-turn Right"],
        ["turn-right", "Turn Right"],
        ["straight", "Straight"],
        ["ramp-left", "Ramp Left"], 
        ["ramp-right", "Ramp Right"],
        ["merge", "Merge"],
        ["fork-left", "Fork Left"],
        ["fork-right", "Fork Right"],
        ["roundabout-left", "Roundabout Left"],
        ["roundabout-right", "Roundabout Right"],
        ["depart", "Start Route"],
    ])

    const insets = useSafeAreaInsets();

    const { theme, colorScheme, toggleTheme } = useTheme();
    const styles = createStyles(theme);
    
    const [directionIcons, setDirectionIcons] = useState<DirectionIconParam>({
        curr: null,
        next: null,
    })

    const [nextDirectionText, setNextDirectionText] = useState<any>(null);

    useEffect(() => {
        setDirectionIcons({
            curr: descToIcon.get(currentManeuver) ?? straight_icon,
            next: descToIcon.get(nextManeuver) ?? straight_icon,
        })
        setNextDirectionText(descToText.get(nextManeuver) ?? "Continue Straight")
    }, [currentManeuver, nextManeuver])
    return (
        <View style={styles.top_holder}>
            {/* Current Direction */}
            <View style={[styles.current_direction_container,
                {
                    paddingTop: insets.top,
                    paddingLeft: insets.left,
                    paddingRight: insets.right,
                }
            ]}>
                {directionIcons.curr && <Image style={styles.current_direction_icon} source={directionIcons.curr}/>}
                <View style={styles.textWrapper}>
                    <Text style={styles.curr_direction_text}>{instruction}</Text>
                </View>
            </View>

            {/* Next Direciton */}
            <View style={styles.next_direction_container}>
                {directionIcons.next && <Image style={styles.next_direction_icon} source={directionIcons.next}/>}
                <Text style={styles.next_direction_text}>{nextDirectionText}</Text>  
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
        justifyContent: 'flex-start',
        width: '100%',
        alignItems: 'center',
        backgroundColor: theme.navigation_header.current_container_color,
        height: theme.navigation_header.current_container_height,
        
    },
    next_direction_container: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: 5,
        height: theme.navigation_header.next_container_height,
        backgroundColor: theme.navigation_header.next_container_color,
    },
    textWrapper: {
        flex: 1,
    },
    curr_direction_text: {
        color: theme.navigation_header.text_color,
        fontSize: 24,
        fontWeight: '900',
        flexWrap: 'wrap',
    },
    current_direction_icon: {
        height: 60,
        width: 60,
    },
    next_direction_text: {
        color: theme.navigation_header.text_color,
        fontSize: 18
    },
    next_direction_icon: {
        height: 50,
        width: 50,
    },
});