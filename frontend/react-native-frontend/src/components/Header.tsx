import { StyleSheet, Text, TouchableWithoutFeedback, View, Image, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../styles/ThemeContext';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';

export default function Header() {
  const insets = useSafeAreaInsets();

  const handleSettingsPress = (): void => {
      console.log("Settings Pressed");
  };

  const { theme, colorScheme, toggleTheme } = useTheme();
  const styles = createStyles(theme);

  //WEATHER API
  const [data,setData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {  
        const cached = await AsyncStorage.getItem('cachedWeatherForecast');
        const cachedTimestamp = await AsyncStorage.getItem('cachedWeatherForecastTimestamp');
        const now = Date.now();

        if (cached && cachedTimestamp && (now - parseInt(cachedTimestamp) < 3600000) ) {
          // Cached data is less than 1 hour old
          setData(JSON.parse(cached));
          return;
        }

        // If no cached data get new data
        const response = await axios.get(`${API_BASE_URL}/api/get_user_pos_forecast_weather`)
        setData(response.data.data.forecast)

        await AsyncStorage.setItem('cachedWeatherForecast', JSON.stringify(response.data.data.forecast))
        await AsyncStorage.setItem('cachedWeatherForecastTimestamp', now.toString())
      } catch(error) {
        console.log("Error: ", error)
      }
    }

    // Call on component load
    fetchData()
    // Call every hour
    const interval = setInterval(fetchData, 3600000)
    return () => clearInterval(interval);
  }, [])

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
            { data 
              ? (
                <View style={styles.weather_box}>
                  <View style={styles.forecast_data}>
                    <Text>Now</Text>
                    <Text>{data?.forecast_hour_2?.temp_f}°F</Text>
                  </View>
                  <View>
                    <Text>1 Hour</Text>
                    <Text>{data?.forecast_hour_2?.temp_f}°F</Text>
                  </View>
                  <View>
                    <Text>3 Hour</Text>
                    <Text>{data?.forecast_hour_2?.temp_f}°F</Text>
                  </View>
                </View>
              ) : ( 
                <View style={styles.weather_box}>
                  <Text>Weather Data Unavailable</Text>
                </View> 
              )
            }
        
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
      flexDirection: 'row',
      borderRadius: theme.header.borderRadius,
      padding: 10,
      marginLeft: theme.header.margin,
      marginRight: theme.header.margin,
      backgroundColor: theme.header.color,
      height: theme.header.height,
      justifyContent: 'space-evenly',
      alignItems: 'center',
      // borderColor: 'red',
      // borderWidth: 1,
    },
    forecast_data: {
      // borderColor: 'red',
      // borderWidth: 1,
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