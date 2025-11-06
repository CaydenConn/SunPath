import { StyleSheet, Text, TouchableWithoutFeedback, View, Image, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../styles/ThemeContext';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParam = {
  Login: undefined;
  Inside: undefined;
};
type NavigationProp = NativeStackNavigationProp<RootStackParam>;

export default function Header() {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation<NavigationProp>();
  const handleSettingsPress = (): void => {
      console.log("Settings Pressed");
      // navigation.navigate('Login');
  };

  const { theme, colorScheme, toggleTheme } = useTheme();
  const styles = createStyles(theme);

  //WEATHER API
  const [currentWeatherData,setCurrentWeatherData] = useState<any>(null)
  const [forecastData,setForecastData] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try { 
        const now = Date.now();
        
        const cachedCurrentWeather = await AsyncStorage.getItem('cachedCurrentWeather')
        const cachedCurrentWeatherTimestamp = await AsyncStorage.getItem('cachedCurrentWeatherTimestamp')
        const cachedForecast = await AsyncStorage.getItem('cachedWeatherForecast');
        const cachedForecastTimestamp = await AsyncStorage.getItem('cachedWeatherForecastTimestamp');

        if (cachedForecast && cachedForecastTimestamp && (now - parseInt(cachedForecastTimestamp) < 3600000) 
            && cachedCurrentWeather && cachedCurrentWeatherTimestamp && (now - parseInt(cachedCurrentWeatherTimestamp) < 3600000) ) {
          // Cached data is less than 1 hour old
          setCurrentWeatherData(JSON.parse(cachedCurrentWeather))
          setForecastData(JSON.parse(cachedForecast))
          return;
        }

        // If no cached data get new data
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
          axios.get(`${API_BASE_URL}/api/get_user_pos_current_weather`),
          axios.get(`${API_BASE_URL}/api/get_user_pos_forecast_weather`)
        ])

        setCurrentWeatherData(currentWeatherResponse.data.data.current)
        setForecastData(forecastResponse.data.data.forecast)

        await AsyncStorage.setItem('cachedCurrentWeather', JSON.stringify(currentWeatherResponse.data.data.current))
        await AsyncStorage.setItem('cachedCurrentWeatherTimestamp', now.toString())
        await AsyncStorage.setItem('cachedWeatherForecast', JSON.stringify(forecastResponse.data.data.forecast))
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
                    { 
                      colorScheme === 'light'
                      ? <Image style={styles.settings_icon} source={require('../../assets/settings.png')} />
                      : <Image style={styles.settings_icon} source={require('../../assets/settings_white.png')} />
                    }
                    
                </View>
            </TouchableWithoutFeedback>

            {/* Weather Data */}
            { (currentWeatherData && forecastData) 
              ? (
                <View style={styles.weather_box}>
                  <View style={styles.forecast_data}>
                    <Text style={styles.forecast_data_text}>Now</Text>
                    <Text style={styles.forecast_data_text}>{currentWeatherData?.temp_f}°F</Text>
                  </View>
                  <View style={styles.forecast_data}>
                    <Text style={styles.forecast_data_text}>1 Hr</Text>
                    <Text style={styles.forecast_data_text}>{forecastData?.forecast_hour_1?.temp_f}°F</Text>
                  </View>
                  <View style={styles.forecast_data}>
                    <Text style={styles.forecast_data_text}>3 Hr</Text>
                    <Text style={styles.forecast_data_text}>{forecastData?.forecast_hour_3?.temp_f}°F</Text>
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
                      ? require('../../assets/header_sun.png')
                      : require('../../assets/header_moon.png')
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
      elevation: theme.header.elevation,
    },
    settings_weather_container: {
      flexDirection: 'row',
      },
    settings_icon_container: {
      backgroundColor: theme.color,
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
      backgroundColor: theme.color,
      height: theme.header.height,
      justifyContent: 'space-evenly',
      alignItems: 'center',
      // borderColor: 'red',
      // borderWidth: 1,
    },
    forecast_data: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    },
    forecast_data_text: {
      color: theme.textColor,
    },
    color_mode_toggle: {
      alignSelf: 'flex-end',
      marginRight: theme.header.margin,
      marginTop: theme.header.margin,
    },
    color_mode_icon_container: {
      backgroundColor: theme.color,
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