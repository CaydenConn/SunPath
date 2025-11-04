import { StyleSheet, Text, TouchableWithoutFeedback, View, Image, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../styles/ThemeContext';

export default function Header() {
  const insets = useSafeAreaInsets();

  const handleSettingsPress = (): void => {
      console.log("Settings Pressed");
  };

  const { theme, colorScheme, toggleTheme } = useTheme();
  const styles = createStyles(theme);

  return (
      <View style={[styles.top_holder, {
          top: insets.top,
          paddingLeft: insets.left,
          paddingRight: insets.right,
      }]}>
          <View style={styles.settings_weather_container}>
            {/* Settings Icon */}
            <TouchableWithoutFeedback onPress={ handleSettingsPress }>
                <View style={styles.settings_icon_container}>
                    <Image style={styles.settings_icon} source={require('../../assets/settings.png')} />
                </View>
            </TouchableWithoutFeedback>

            {/* Weather Data */}
            <View style={styles.weather_box}>
                <Text>Weather Data</Text>
            </View>
          </View>

          <View style={styles.color_mode_toggle}>
            <TouchableWithoutFeedback onPress={ toggleTheme }>
                <View style={styles.color_mode_icon_container}>
                    <Image 
                    style={styles.color_mode_icon} 
                    source={
                      colorScheme === "light" 
                      ? require('../../assets/header_moon.png')
                      : require('../../assets/header_sun.png')
                    }
                    />
                </View>
            </TouchableWithoutFeedback>
          </View>
      </View>
  );
}

const createStyles = (theme : any) => 
  StyleSheet.create({
    top_holder: {
      position: 'absolute',
      left: 0,
      right: 0,
      flexDirection: 'column',
      alignItems: 'center',
      zIndex: 0,

      shadowColor: theme.header.shadowColor,
      shadowOpacity: theme.header.shadowOpacity,
      shadowRadius: theme.header.shadowRadius,
      shadowOffset: theme.header.shadowOffset,
    },
    settings_weather_container: {
      flexDirection: 'row',
      },
    settings_icon_container: {
      backgroundColor: theme.header.color,
      height: theme.header.height,
      width: theme.header.height,
      borderRadius: theme.header.borderRadius,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: theme.header.margin,
    },
    settings_icon: {
      width: 45,
      height: 45,
    },
    weather_box: {
      flex: 1,
      borderRadius: theme.header.borderRadius,
      padding: 10,
      marginLeft: theme.header.margin,
      marginRight: theme.header.margin,
      backgroundColor: theme.header.color,
      height: theme.header.height,
      justifyContent: 'center',
    },
    color_mode_toggle: {
      alignSelf: 'flex-end',
      marginRight: theme.header.margin,
      marginTop: theme.header.margin,
    },
    color_mode_icon_container: {
      backgroundColor: theme.header.color,
      borderRadius: theme.header.borderRadius,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: theme.header.margin,
    },
    color_mode_icon: {
      width: 30,
      height: 30,
    },
});