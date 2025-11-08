import { StyleSheet, Text, TouchableWithoutFeedback, View, Image, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../styles/ThemeContext';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '@env';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

// WEATHER ICON IMPORTS
import sunnyIcon from "../../assets/weather-icons/sunny.png"
import clearIcon from "../../assets/weather-icons/clear.png"
import cloudySunIcon from "../../assets/weather-icons/cloudy-sun.png"
import lightningIcon from "../../assets/weather-icons/lightening.png"
import rainingIcon from "../../assets/weather-icons/raining.png"
import snowingIcon from "../../assets/weather-icons/snowing.png"
import cloudyIcon from "../../assets/weather-icons/cloudy.png"
import cloudyMoonIcon from "../../assets/weather-icons/cloudy-moon.png"
// END


type HeaderProps = {
  userLocation: { latitude: number; longitude: number } | null;
}
type InsideStackParam = {
  MainPage: undefined;
  SettingsPage: undefined;
};
type NavigationProp = NativeStackNavigationProp<InsideStackParam>;

type WeatherIconParam = {
  cur: any,
  forecast1: any,
  forecast3: any,
}


export default function Header({ userLocation }: HeaderProps) {
  const insets = useSafeAreaInsets();

  const navigation = useNavigation<NavigationProp>();
  const handleSettingsPress = (): void => {
      navigation.navigate('SettingsPage');
  };

  const { theme, colorScheme, toggleTheme } = useTheme();
  const styles = createStyles(theme);

  //WEATHER ICON MAP
  const descToIcon = new Map([
    ["sunny", sunnyIcon],
    ["clear", clearIcon],
    ["partly cloudy", cloudySunIcon],
    ["cloudy", cloudyIcon],
    ["overcast", cloudyIcon],
    ["mist", cloudyIcon],
    ["patchy rain possible", rainingIcon],
    ["patchy snow possible", snowingIcon],
    ["patchy sleet possible", snowingIcon],
    ["patchy freezing drizzle possible", snowingIcon],
    ["thundery outbreaks possible", lightningIcon],
    ["blowing snow", snowingIcon],
    ["blizzard", snowingIcon],
    ["fog", cloudyIcon],
    ["freezing fog", cloudyIcon],
    ["patchy light drizzle", rainingIcon],
    ["light drizzle", rainingIcon],
    ["freezing drizzle", rainingIcon],
    ["heavy freezing drizzle", rainingIcon],
    ["patchy light rain", rainingIcon],
    ["light rain", rainingIcon],
    ["moderate rain at times", rainingIcon],
    ["moderate rain", rainingIcon],
    ["heavy rain at times", rainingIcon],
    ["heavy rain", rainingIcon],
    ["light freezing rain", rainingIcon],
    ["moderate or heavy freezing rain", rainingIcon],
    ["light sleet", snowingIcon],
    ["moderate or heavy sleet", snowingIcon],
    ["patchy light snow", snowingIcon],
    ["light snow", snowingIcon],
    ["patchy moderate snow", snowingIcon],
    ["moderate snow", snowingIcon],
    ["patchy heavy snow", snowingIcon],
    ["heavy snow", snowingIcon],
    ["ice pellets", snowingIcon],
    ["light rain shower", rainingIcon],
    ["moderate or heavy rain shower", rainingIcon],
    ["torrential rain shower", rainingIcon],
    ["light sleet showers", snowingIcon],
    ["moderate or heavy sleet showers", snowingIcon],
    ["light snow showers", snowingIcon],
    ["moderate or heavy snow showers", snowingIcon],
    ["light showers of ice pellets", snowingIcon],
    ["moderate or heavy showers of ice pellets", snowingIcon],
    ["patchy light rain with thunder", lightningIcon],
    ["moderate or heavy rain with thunder", lightningIcon],
    ["patchy light snow with thunder", lightningIcon],
    ["moderate or heavy snow with thunder", lightningIcon],
  ])

  const [weatherIcons, setWeatherIcons] = useState<WeatherIconParam>({
      cur: null,
      forecast1: null,
      forecast3: null
  })
  
  //WEATHER API
  const [currentWeatherData,setCurrentWeatherData] = useState<any>(null)
  const [forecastData,setForecastData] = useState<any>(null)

  useEffect(() => {
    
    if (!userLocation) return;

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
          axios.get(`${API_BASE_URL}/api/get_user_pos_current_weather?lat_lon=${userLocation?.latitude},${userLocation?.longitude}`),
          axios.get(`${API_BASE_URL}/api/get_user_pos_forecast_weather?lat_lon=${userLocation?.latitude},${userLocation?.longitude}`)
        ])

        setCurrentWeatherData(currentWeatherResponse.data.data.current)
        setForecastData(forecastResponse.data.data.forecast)

        if (currentWeatherResponse.data.data.current) {
          await AsyncStorage.setItem('cachedCurrentWeather', JSON.stringify(currentWeatherResponse.data.data.current));
          await AsyncStorage.setItem('cachedCurrentWeatherTimestamp', now.toString());
        }
        if (forecastResponse.data.data.forecast) {
          await AsyncStorage.setItem('cachedWeatherForecast', JSON.stringify(forecastResponse.data.data.forecast));
          await AsyncStorage.setItem('cachedWeatherForecastTimestamp', now.toString());
        }

      } catch(error) {
        console.log("Error: ", error)
      }
    }
    console.log(currentWeatherData,forecastData)
    // Call on component load
    fetchData()
    // Call every hour
    const interval = setInterval(fetchData, 3600000)
    return () => clearInterval(interval);
  }, [userLocation])

  useEffect(() => {
    if(currentWeatherData && forecastData) {
      const normalize = (txt: string) => txt?.toLowerCase().trim();
      setWeatherIcons({
        cur: descToIcon.get(normalize(currentWeatherData.condition.text)) || lightningIcon,
        forecast1: descToIcon.get(normalize(forecastData.forecast_hour_1.condition.text)) || lightningIcon,
        forecast3: descToIcon.get(normalize(forecastData.forecast_hour_3.condition.text)) || lightningIcon
      })
      if(normalize(currentWeatherData.condition.text) === "partly cloudy" && currentWeatherData.is_day === 0){
        setWeatherIcons(prev => ({
          ...prev,
          cur: cloudyMoonIcon
        }));
      }
      if(normalize(forecastData.forecast_hour_1.condition.text) === "partly cloudy" && currentWeatherData.is_day === 0){
        setWeatherIcons(prev => ({
          ...prev,
          forecast1: cloudyMoonIcon
        }));
      }
      if(normalize(forecastData.forecast_hour_3.condition.text) === "partly cloudy" && currentWeatherData.is_day === 0){
        setWeatherIcons(prev => ({
          ...prev,
          forecast3: cloudyMoonIcon
        }));
      }
    }
  }, [currentWeatherData, forecastData])


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

                  <View style={styles.weather_item}>
                    <Image source={weatherIcons.cur} style={styles.weather_icon}/>
                    <View style={styles.forecast_data}>
                      <Text style={styles.forecast_data_text}>Now</Text>
                      <Text style={styles.forecast_data_text}>{currentWeatherData?.temp_f}°F</Text>
                    </View>
                  </View>

                  <View style={styles.weather_item}>
                    <Image source={weatherIcons.forecast1} style={styles.weather_icon}/>
                    <View style={styles.forecast_data}>
                      <Text style={styles.forecast_data_text}>1 Hr</Text>
                      <Text style={styles.forecast_data_text}>{forecastData?.forecast_hour_1?.temp_f}°F</Text>
                    </View>
                  </View>

                  <View style={styles.weather_item}>
                    <Image source={weatherIcons.forecast3} style={styles.weather_icon}/>
                    <View style={styles.forecast_data}>
                      <Text style={styles.forecast_data_text}>3 Hr</Text>
                      <Text style={styles.forecast_data_text}>{forecastData?.forecast_hour_3?.temp_f}°F</Text>
                    </View>
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
      paddingRight: 16,
      marginLeft: theme.header.margin,
      marginRight: theme.header.margin,
      backgroundColor: theme.color,
      height: theme.header.height,
      justifyContent: 'space-between',
      alignItems: 'center',
      // borderColor: 'red',
      // borderWidth: 1,
    },
    weather_item: {
      flexDirection: 'row'
    },
    weather_icon: {
      height: 50,
      width: 50,
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