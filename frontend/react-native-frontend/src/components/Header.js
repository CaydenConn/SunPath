import { StyleSheet, Text, TouchableWithoutFeedback, View, Image } from 'react-native';
import { styles_header } from '../../styles/themes.js'
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Header() {
    
    const insets = useSafeAreaInsets();

    const handleSettingsPress = () => {
        console.log("Settings Pressed");
    };

    return (
        <View style={[styles.top_holder, {
            top: insets.top,
            paddingLeft: insets.left,
            paddingRight: insets.right,
        }]}>

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
    );
}

const styles = StyleSheet.create({
  top_holder: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  settings_icon_container: {
    backgroundColor: styles_header.color,
    height: styles_header.height,
    width: styles_header.height,
    borderRadius: styles_header.borderRadius,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: styles_header.margin,
  },
  settings_icon: {
    width: 45,
    height: 45,
  },
  weather_box: {
    flex: 1,
    borderRadius: styles_header.borderRadius,
    padding: 10,
    marginLeft: styles_header.margin,
    marginRight: styles_header.margin,
    backgroundColor: styles_header.color,
    height: styles_header.height,
    justifyContent: 'center',
  }
});