import React, { useMemo, useRef } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../styles/ThemeContext';
import AddressSearchBar from './AddressSearchBar';

type InputBottomSheetProps = {
  userLocation: { latitude: number; longitude: number } | null;
  onRouteFetched: (coords: { latitude: number; longitude: number }[]) => void;
  onDestinationSelected?: (dest: { latitude: number; longitude: number }) => void;
};

const InputBottomSheet: React.FC<InputBottomSheetProps> = ({ userLocation, onRouteFetched, onDestinationSelected, }) => {
  const handlePinnedLocationPress = (): void => {
      console.log("Favorite Pressed");
  };
  
  const { theme, colorScheme } = useTheme();
  const styles = createStyles(theme);
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['11%', '40%', '87%'], []);


  const pinnedLocationsMap = {
    categories: [
      {
        name: '0000',
      },
      {
        name: '8888'
      },
      {
        name: '1111',
      },
      {
        name: '2222'
      },
      {
        name: '3333',
      },
      {
        name: '4444'
      },
      {
        name: '5555',
      },
      {
        name: '6666'
      },
    ],
  }

  const recentsMap = {
    categories: [
      {
        street: '432 Farmington Dr',
        city_state: 'Plantation, Fl'
      },
      {
        street: '918 Westministr Dr',
        city_state: 'Vermont'
      },
      {
        street: '345 Peachtree Rd',
        city_state: 'Alabama'
      },
      {
        street: '1122 HoooYeee Ct',
        city_state: 'Texas'
      },
      {
        street: '906 Leaftree Cr',
        city_state: 'Vermont'
      },
      {
        street: '432 Farmington Dr',
        city_state: 'Plantation, Fl'
      },
      {
        street: '918 Westministr Dr',
        city_state: 'Vermont'
      },
      {
        street: '345 Peachtree Rd',
        city_state: 'Alabama'
      },
      {
        street: '1122 HoooYeee Ct',
        city_state: 'Texas'
      },
      {
        street: '906 Leaftree Cr',
        city_state: 'Vermont'
      },
    ],
  }

  const [pinnedData, setPinnedData] = React.useState(pinnedLocationsMap);

  return (
    <BottomSheet 
    ref={bottomSheetRef}
    snapPoints={snapPoints}
    index={1} 
    enablePanDownToClose={false}
    enableContentPanningGesture={false}
    style={styles.sheet}
    backgroundStyle={{ backgroundColor: theme.color }}
    >
      <BottomSheetView style={styles.content}>
        <View>
          <AddressSearchBar
            userLocation={userLocation}
            onRouteFetched={onRouteFetched}
            onDestinationSelected={(dest) => {
              onDestinationSelected?.(dest);
              bottomSheetRef.current?.snapToIndex(1);
            }}
            onFocusExpandSheet={() => bottomSheetRef.current?.expand()}
          />

        </View>
        {/* PINNED LOCATIONS */}
        <View style={styles.pinned_locations}>
          <Text style={styles.sheet_title}>Pinned Locations📍</Text>
          <BottomSheetScrollView 
          horizontal 
          scrollEventThrottle={16} 
          showsHorizontalScrollIndicator={false} 
          nestedScrollEnabled={true}
          simultaneousHandlers={bottomSheetRef}
          style={styles.pinned_locations_container}
          contentContainerStyle={styles.pinned_locations_container_inner}>
          
            <TouchableOpacity 
            onPress={handlePinnedLocationPress}
            activeOpacity={0.75} 
            style={styles.pinned_item}>
              <View style={styles.pinned_icon_container}>
                <Image style={styles.pinned_icon} source={require("../../assets/house.png")}/>
              </View>
              <Text style={styles.text}>Home</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
            onPress={handlePinnedLocationPress}
            activeOpacity={0.75} 
            style={styles.pinned_item}>
              <View style={styles.pinned_icon_container}>
                <Image style={styles.pinned_icon} source={require("../../assets/suitcase.png")}/>
              </View>
              <Text style={styles.text}>Work</Text>
            </TouchableOpacity>
            
            {pinnedData.categories.map((category, index) => (
              <TouchableOpacity
              key={index} 
              onPress={handlePinnedLocationPress}
              activeOpacity={0.75} 
              style={styles.pinned_item}>
                <View style={styles.pinned_icon_container}>
                  <Image style={styles.pinned_icon} source={require("../../assets/location.png")}/>
                </View>
                <Text style={styles.text}>{category.name}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              // onPress={}
              activeOpacity={0.75} 
              style={styles.pinned_item}>
              <View style={styles.pinned_icon_container}>
                { 
                  colorScheme === 'light'
                  ? <Image style={styles.add_icon} source={require("../../assets/plus.png")}/>
                  : <Image style={styles.add_icon} source={require("../../assets/plus_white.png")}/>
                }
                
              </View>
              <Text style={styles.text}>Add</Text>
            </TouchableOpacity>
            
          </BottomSheetScrollView>
        </View>

        {/* RECENT LOCATIONS */}
        <View style={styles.recents}>
          <Text style={styles.sheet_title}>Recents🔄</Text>
          <BottomSheetScrollView 
          vertical
          scrollEventThrottle={16} 
          showsVerticalScrollIndicator={false} 
          nestedScrollEnabled={true}
          simultaneousHandlers={bottomSheetRef}
          style={styles.recents_container}
          contentContainerStyle={styles.recents_container_inner}>
            <TouchableOpacity 
            onPress={handlePinnedLocationPress}
            activeOpacity={0.75} 
            style={styles.recent_item}>
              <View style={styles.recent_icon_container}>
                <Image style={styles.recent_icon} source={require("../../assets/house.png")}/>
              </View>
              <View  style={styles.recent_info}>
                <Text style={styles.text}>432 Farmington Dr</Text>
                <Text style={styles.text}>Plantation, Fl</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
            onPress={handlePinnedLocationPress}
            activeOpacity={0.75} 
            style={styles.recent_item}>
              <View style={styles.recent_icon_container}>
                <Image style={styles.recent_icon} source={require("../../assets/suitcase.png")}/>
              </View>
              <View  style={styles.recent_info}>
                <Text style={styles.text}>Kimley Horn</Text>
                <Text style={styles.text}>West Palm Beach, Fl</Text>
              </View>
            </TouchableOpacity>
            
            {recentsMap.categories.map((category, index) => (
              <TouchableOpacity 
              key={index}
              onPress={handlePinnedLocationPress}
              activeOpacity={0.75} 
              style={styles.recent_item}>
                <View style={styles.recent_icon_container}>
                  <Image style={styles.recent_icon} source={require("../../assets/location.png")}/>
                </View>
                <View  style={styles.recent_info}>
                  <Text style={styles.text}>{category.street}</Text>
                  <Text style={styles.text}>{category.city_state}</Text>
                </View>
                
              </TouchableOpacity>
            ))}
          </BottomSheetScrollView>
        </View>


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
      flexDirection: 'column',
      gap: 15,
    },
    sheet_title: {
      color: theme.textColor,
      fontWeight: 'bold',
      fontSize: 16
    },
    pinned_locations: {
      flexDirection: 'column',
    },
    pinned_locations_container: {
      height: 100,
      borderRadius: 10,
      backgroundColor: theme.sheetShading1,
    },
    pinned_locations_container_inner: {
      justifyContent: "center",
      alignItems: 'center',
      paddingHorizontal: 5,
    },
    pinned_item: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pinned_icon_container: {
      flexDirection:"column",
      backgroundColor: theme.sheetShading2, 
      borderRadius:30,
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      marginHorizontal:10,
      height:65,
      zIndex: 1,
    },
    pinned_icon: {
      height: 45,
      width: 45,
    },
    add_icon: {
      height: 25,
      width: 25,
    },
    recents: {
      flexDirection: 'column',
    },
    recents_container: {
      borderRadius: 10,
      backgroundColor: theme.sheetShading1,
      maxHeight: 515,
    },
    recents_container_inner: {
      justifyContent: "center",
      alignItems: 'center',
    },
    recent_item: {
      flexDirection: 'row',
      width: '100%',
      borderColor: '#a3a3a3',
      borderBottomWidth: 1,
      justifyContent: 'center',
      paddingVertical: 10,
    },
    recent_icon_container: {
      flexDirection:"column",
      backgroundColor:'#a3a3a3', 
      borderRadius:30,
      justifyContent: 'center',
      alignItems: 'center',
      width: 50,
      height:50,
      marginHorizontal: 4,
      zIndex: 1,
    },
    recent_icon: {
      height: 30,
      width: 30,
    },
    recent_info: {
      flexDirection: 'column',
      flex: 1,
      justifyContent: 'center',
    },
    text: {
      color: theme.textColor,
    }
});

export default InputBottomSheet;