import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Text, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTheme } from '../../styles/ThemeContext';
import { getDistance } from 'geolib';
import polyline from "@mapbox/polyline";
import AddressSearchBar from './AddressSearchBar';

import { API_BASE_URL, GOOGLE_PLACES_API_KEY } from "@env";
import { getAuth } from 'firebase/auth';

type InputBottomSheetProps = {
  userLocation: { latitude: number; longitude: number } | null;
  onRouteFetched: (coords: { latitude: number; longitude: number }[]) => void;
  onDestinationSelected?: (dest: { latitude: number; longitude: number }) => void;
};

type RecentItem = {
  label: string;
  address: string;
  lat: number;
  lng: number;
  place_id?: string;
  ts?: string;
};
const InputBottomSheet: React.FC<InputBottomSheetProps> = ({ userLocation, onRouteFetched, onDestinationSelected, }) => {
  const handlePinnedLocationPress = (): void => {
      console.log("Favorite Pressed");
  };
  const handleLocationPress = async (item: RecentItem) => {
    if (!userLocation) return;
    bottomSheetRef.current?.snapToIndex(1);
    const destination = { latitude: item.lat, longitude: item.lng };
    
    // Notify parent about destination selection
    onDestinationSelected?.(destination);

    // Fetch route to destination (same as AddressSearchBar)
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/directions/json?origin=${userLocation.latitude},${userLocation.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_PLACES_API_KEY}`
      );
      const dataJson = await response.json();
      if (!dataJson.routes?.length) return;

      const routeCoords: { latitude: number; longitude: number }[] = [];
      const steps = dataJson.routes[0].legs[0].steps;
      for (const step of steps) {
        const stepPoints = polyline.decode(step.polyline.points);
        stepPoints.forEach((p: number[]) =>
          routeCoords.push({ latitude: p[0], longitude: p[1] })
        );
      }

      const simplifiedRoute = routeCoords.filter((_, index) => index % 3 === 0);
      onRouteFetched(simplifiedRoute);

      // Adds Searched Locations to Recents
                  const postResponse = await fetch(`${API_BASE_URL}/api/recents`, {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/json",
                          "X-User-Id": `${getAuth().currentUser?.uid}`,
                      },
                      body: JSON.stringify({
                          label: item.label ?? item.address ?? "",
                          address: item.address ?? "", 
                          lat: item.lat,
                          lng: item.lng,
                          place_id: item.place_id,
                      }),
                  });
                  const postJson = await postResponse.json();
                  console.log("Recent saved: ", postJson)
    } catch (error) {
      console.error("Failed to fetch route for recent: ", error);
    }
  };
  const { theme, colorScheme } = useTheme();
  const styles = createStyles(theme);
  
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['11%', '40%', '87%'], []);

  const [distanceMetric, setDistanceMetric] = useState<string>("miles")
  const [recents, setRecents] = useState<RecentItem[]>([]);
  
  useEffect(() => {
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

    fetchRecents(); // initial load

    const interval = setInterval(fetchRecents, 5000); // refresh every 5 sec
    return () => clearInterval(interval);
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
              <Text></Text>
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

            {recents.map((item, index) => (
              <TouchableOpacity 
              key={index}
              onPress={() => handleLocationPress(item)}
              activeOpacity={0.6} 
              style={styles.recent_item}>
                <View style={styles.recent_icon_container}>
                  <Image style={styles.recent_icon} source={require("../../assets/location.png")}/>
                </View>
                <View  style={styles.recent_info}>
                  <Text style={styles.text}>{item.label}</Text>
                  <Text style={styles.text}>{item.address}</Text>
                </View>
                
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={[styles.recent_item, { borderBottomWidth: 0 }]}>
              <View>
                <Image style={styles.recent_icon}/>
              </View>
              <View  style={styles.recent_info}>
                <Text style={styles.text}></Text>
                <Text style={styles.text}></Text>
              </View>
            </TouchableOpacity>

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