import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, Image, Touchable } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../styles/ThemeContext';
import { getDistance } from 'geolib';
import polyline from "@mapbox/polyline";
import AddressSearchBar from './AddressSearchBar';

import { API_BASE_URL, GOOGLE_PLACES_API_KEY } from "@env";
import { getAuth } from 'firebase/auth';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';

type InputBottomSheetProps = {
  userLocation: { latitude: number; longitude: number } | null;
  onRouteFetched: (coords: { latitude: number; longitude: number }[]) => void;
  onDestinationSelected?: (dest: { latitude: number; longitude: number }) => void;
  setIsModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
};
type Step = {
    html_instructions: string;
    end_location: {
        lat: number;
        lng: number;
    };
    start_location: {
        lat: number;
        lng: number;
    };
    polyline: {
        points: string;
    };
    maneuver?: string;
    duration: {
        text: string;
        value: number;
    };
    distance: {
        text: string;
        value: number;
    };
};
type InsideStackParam = {
  MainPage: undefined;
  NavigationPage: {
    details: any;
    destination: {
        latitude: number,
        longitude: number,
    };
    simplifiedRoute: { 
        latitude: number;
        longitude: number
    }[] | null;
    etaDetails: {
        etaText: string,
        etaSeconds: number,
        distanceText: string,
        distanceMeters: number,
    };
    steps: Step[];
  }
};
type NavigationProp = NativeStackNavigationProp<InsideStackParam>;
type RecentItem = {
  label: string;
  address: string;
  lat: number;
  lng: number;
  place_id?: string;
  ts?: string;
};
const InputBottomSheet: React.FC<InputBottomSheetProps> = ({ userLocation, onRouteFetched, onDestinationSelected, setIsModalVisible}) => {
  const navigation = useNavigation<NavigationProp>();
  const placesRef = useRef<GooglePlacesAutocompleteRef>(null);
  const handleSearchBarSelection = async (data: any, details: any) => {
    placesRef.current?.blur();
    if (!details || !userLocation) return;

    const destination = {
        latitude: details.geometry.location.lat,
        longitude: details.geometry.location.lng,
    };

    if (bottomSheetRef?.current) {
        setTimeout(() => {
            bottomSheetRef.current?.snapToIndex(1);
        }, 50);
    }

    // Fetch route from Google Directions API
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation.latitude},${userLocation.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_PLACES_API_KEY}`
        );

        const dataJson = await response.json();
        if (!dataJson.routes?.length) return;

        const leg = dataJson.routes[0].legs[0]
        const steps: Step[] = leg.steps;
        const routeCoords = steps.flatMap((step: Step) =>
            polyline.decode(step.polyline.points).map((p: [number, number]) => ({
                latitude: p[0],
                longitude: p[1],
            }))
        );
        // const simplifiedRoute = routeCoords.filter((_, index) => index % 2 === 0);
        const simplifiedRoute = routeCoords
        
        // Navigate to the NavPage + Pass all relevent data
        navigation.navigate('NavigationPage', {
            details,
            destination,
            simplifiedRoute: simplifiedRoute, 
            etaDetails: {
                etaText: leg.duration.text,
                etaSeconds: leg.duration.value,
                distanceText: leg.distance.text,
                distanceMeters: leg.distance.value,
            },
            steps: dataJson.routes[0].legs[0].steps
        });

        // Adds Searched Locations to Recents
        const postResponse = await fetch(`${API_BASE_URL}/api/recents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-User-Id": `${getAuth().currentUser?.uid}`,
            },
            body: JSON.stringify({
                label: details.name ?? details.formatted_address ?? "",
                address: details.formatted_address ?? "", 
                lat: details.geometry.location.lat,
                lng: details.geometry.location.lng,
                place_id: details.place_id,
            }),
        });
        const postJson = await postResponse.json();
        console.log("Recent saved: ", postJson)

        placesRef.current?.setAddressText('');
    } catch (error) {
        console.error("Failed to fetch route: ", error);
    }
  }
  const handlePinnedLocationPress = (): void => {
      console.log("Favorite Pressed");
  };
  const handleLocationPress = async (item: RecentItem) => {
    if (!userLocation) return;
    const destination = {
            latitude: item.lat,
            longitude: item.lng,
        };

        if (bottomSheetRef?.current) {
            setTimeout(() => {
                bottomSheetRef.current?.snapToIndex(1);
            }, 50);
        }

    // Fetch route to destination (same as AddressSearchBar)
    try {
      const response = await fetch(
          `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation.latitude},${userLocation.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_PLACES_API_KEY}`
      );

      const dataJson = await response.json();
      if (!dataJson.routes?.length) return;

      const leg = dataJson.routes[0].legs[0]
      const steps: Step[] = leg.steps;
      const routeCoords = steps.flatMap((step: Step) =>
          polyline.decode(step.polyline.points).map((p: [number, number]) => ({
              latitude: p[0],
              longitude: p[1],
          }))
      );
      // const simplifiedRoute = routeCoords.filter((_, index) => index % 2 === 0);
      const simplifiedRoute = routeCoords
      
      // Navigate to the NavPage + Pass all relevent data
      navigation.navigate('NavigationPage', {
          details: item,
          destination,
          simplifiedRoute: simplifiedRoute, 
          etaDetails: {
              etaText: leg.duration.text,
              etaSeconds: leg.duration.value,
              distanceText: leg.distance.text,
              distanceMeters: leg.distance.value,
          },
          steps: dataJson.routes[0].legs[0].steps
      });

      // Adds Searched Locations to Recents
      const postResponse = await fetch(`${API_BASE_URL}/api/recents`, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              "X-User-Id": `${getAuth().currentUser?.uid}`,
          },
          body: JSON.stringify({
              label: item.label ?? "",
              address: item.address ?? "", 
              lat: item.lat,
              lng: item.lng,
              place_id: item.place_id,
          }),
      });
      const postJson = await postResponse.json();
      console.log("Recent saved: ", postJson)

    } catch (error) {
        console.error("Failed to fetch route: ", error);
    }
  };
  const handleRemoveSpecificRecent = async (item: any) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/recents`)
    } catch(error){
      console.log("Failed to delete recent item: ", error)
    }
  }
  const handleRemoveAllRecents = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/recents`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": `${getAuth().currentUser?.uid}`,
        },
      })
      const result = await res.json();
      console.log('Deleted successfully:', result);
      fetchRecents();
    } catch (error) {
      console.error("Failed to delet recents: ", error);
    }
  }
  const handleAddPinnedClicked = () => {
    if (bottomSheetRef?.current) {
      bottomSheetRef.current?.snapToIndex(0);
    }
    setIsModalVisible(true)
  }
  const { theme, colorScheme } = useTheme();
  const styles = createStyles(theme);
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['11%', '40%', '87%'], []);

  const [distanceMetric, setDistanceMetric] = useState<string>("miles")
  const [recents, setRecents] = useState<RecentItem[]>([]);
  const fetchRecents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/recents?limit=10`, {
          headers: {
            "X-User-Id": `${getAuth().currentUser!.uid}`,
          },
        });
        const json = await res.json();
        setRecents(json);
      } catch (err) {
        console.log("Error:", err);
      }
    };
  // Loads Recents
  useEffect(() => {
    fetchRecents(); // initial load
    // const interval = setInterval(fetchRecents, 5000); // refresh every 5 sec
    return //() => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log("🔁 recents state updated:", recents);
  }, [recents]);

  const pinnedLocationsMap = {
    categories: [
      {
        name: '0000',
        location: {
          latitude: 26.127987,
          longitude: -80.224480
        }
      },
      {
        name: '8888',
        location: {
          latitude: 26.127987,
          longitude: -80.224480
        }
      },
      {
        name: '1111',
        location: {
          latitude: 26.127987,
          longitude: -80.224480
        }
      },
      {
        name: '2222',
        location: {
          latitude: 26.127987,
          longitude: -80.224480
        }
      },
      {
        name: '3333',
        location: {
          latitude: 26.127987,
          longitude: -80.224480
        }
      },
      {
        name: '4444',
        location: {
          latitude: 26.127987,
          longitude: -80.224480
        }
      },
      {
        name: '5555',
        location: {
          latitude: 26.127987,
          longitude: -80.224480
        }
      },
      {
        name: '6666',
        location: {
          latitude: 26.127987,
          longitude: -80.224480
        }
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
    handleIndicatorStyle={{
      backgroundColor: colorScheme === 'light' ? 'black' : 'white',
    }}
    >
      <BottomSheetView style={styles.content}>
        <View>
          <AddressSearchBar
            userLocation={userLocation}
            handleSearchBarSelection={handleSearchBarSelection}
            onRouteFetched={onRouteFetched}
            onDestinationSelected={(dest) => {
              onDestinationSelected?.(dest);
            }}
            onFocusExpandSheet={() => bottomSheetRef.current?.expand()}
            bottomSheetRef={bottomSheetRef}
          />

        </View>
        {/* PINNED LOCATIONS */}
        <View style={styles.pinned_locations}>
          <View style={styles.title_container}>
            <Text style={styles.sheet_title}>Pinned Locations📍</Text>
            <TouchableOpacity onPress={handleRemoveAllRecents}>
              <Text style={styles.sheet_title}>Remove All</Text>
            </TouchableOpacity>
          </View>
          
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
              {distanceMetric === "km"
                ? <Text style={styles.sub_text}>493km</Text>
                : <Text style={styles.sub_text}>493mi</Text>
                }
            </TouchableOpacity>
            
            <TouchableOpacity 
            onPress={handlePinnedLocationPress}
            activeOpacity={0.75} 
            style={styles.pinned_item}>
              <View style={styles.pinned_icon_container}>
                <Image style={styles.pinned_icon} source={require("../../assets/suitcase.png")}/>
              </View>
              <Text style={styles.text}>Work</Text>
              {distanceMetric === "km"
                ? <Text style={styles.sub_text}>493km</Text>
                : <Text style={styles.sub_text}>493mi</Text>
              }
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
                {userLocation && category.location ? (
                  distanceMetric === "km"
                    ? <Text style={styles.sub_text}>
                        {(getDistance(userLocation, category.location) / 1000).toFixed(1)} km
                      </Text>
                    : <Text style={styles.sub_text}>
                        {(getDistance(userLocation, category.location) / 1000 * 0.621371).toFixed(1)} mi
                      </Text>
                ) : (
                  <Text></Text>
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              onPress={handleAddPinnedClicked}
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
              <Text></Text>
            </TouchableOpacity>
            
          </BottomSheetScrollView>
        </View>

        {/* RECENT LOCATIONS */}
        <View style={styles.recents}>
          <View style={styles.title_container}>
            <Text style={styles.sheet_title}>Recents🔄</Text>
            <TouchableOpacity onPress={handleRemoveAllRecents}>
              <Text style={styles.sheet_title}>Remove All</Text>
            </TouchableOpacity>
          </View>
          
          <BottomSheetScrollView 
          vertical
          scrollEventThrottle={16} 
          showsVerticalScrollIndicator={false} 
          nestedScrollEnabled={true}
          simultaneousHandlers={bottomSheetRef}
          style={styles.recents_container}
          contentContainerStyle={styles.recents_container_inner}>

            {recents.map((item, index) => (
              <View style={styles.recent_item}
              key={index}>
                <TouchableOpacity 
                onPress={() => handleLocationPress(item)}
                activeOpacity={0.6} 
                style={styles.item_info}>
                  <View style={styles.recent_icon_container}>
                    <Image style={styles.recent_icon} source={require("../../assets/location.png")}/>
                  </View>
                  <View  style={styles.recent_info}>
                    <Text style={styles.text}>{item.label}</Text>
                    <Text style={styles.text}>{item.address}</Text>
                  </View> 
                </TouchableOpacity>
                <TouchableOpacity 
                onPress={() => handleRemoveSpecificRecent(item)}
                activeOpacity={0.6}
                style={styles.delete_container}>
                  {
                  colorScheme === 'light' 
                  ? <Image style={styles.delete_icon} source={require("../../assets/delete.png")}/>
                  : <Image style={styles.delete_icon} source={require("../../assets/delete_white.png")}/>
                  }
                </TouchableOpacity>
              </View>
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
    title_container: {
      flex: 1,
      flexDirection: 'row',
      justifyContent:'space-between',
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
      height: 120,
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
    delete_container: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingRight: 10,
    },
    delete_icon: {
      height: 25,
      width: 25,
    },
    recents_container: {
      borderRadius: 10,
      backgroundColor: theme.sheetShading1,
      height: 500,
    },
    recents_container_inner: {
      justifyContent: "center",
      alignItems: 'center',
    },
    recent_item: {
      flexDirection: 'row',
      width: '100%',
      borderColor: theme.sheetShading2,
      borderBottomWidth: 1,
      justifyContent: 'center',
      paddingVertical: 10,
    },
    item_info: {
      flexDirection: 'row',
      justifyContent: 'center',
      flex: 1,
    },
    recent_icon_container: {
      flexDirection:"column",
      backgroundColor: theme.sheetShading2, 
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
      fontSize: 14,
    },
    sub_text: {
      color: theme.textColor,
      fontSize: 13,
    }
});

export default InputBottomSheet;