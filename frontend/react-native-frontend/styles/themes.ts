const lightBackground = "#ffffffff";
const darkBackground = "black";

const lightTextColor = 'black'
const descTextColor = 'grey'
const darkTextColor = 'white'


const lightSheetShading1 = '#F2F2F2'
const lightSheetShading2 = '#D9D9D9'
const darkSheetShading1 = '#1A1A1A'
const darkSheetShading2 = '#333333'

const navHeader1 = darkSheetShading1
const navHeader2 = '#555555'

// GLOBAL COLORS
export const COLORS = {
    
    light: {
        color: lightBackground,
        textColor: lightTextColor,
        descTextColor: descTextColor,
        sheetShading1: lightSheetShading1,
        sheetShading2: lightSheetShading2,
        // HEADER
        header: {
            height: 60,
            padding: 7.5,
            borderRadius: 10,
            margin: 7,
            


            shadowColor: 'black',
            shadowOpacity: 0.35,
            shadowRadius: 5,
            shadowOffset: {
                width: 0,
                height: 4
            },
            elevation: 6,
        },
        // INPUT BOTTOM SHEET
        import_bottom: {
            shadowColor: 'black',
            shadowOpacity: 0.35,
            shadowRadius: 5,
            shadowOffset: {
                width: 0,
                height: -4
            },
        },
        //CENTER ON USER BUTTON
        center_on_button: {
            shadowColor: 'black',
            shadowOpacity: 0.35,
            shadowRadius: 5,
            shadowOffset: {
                width: 0,
                height: 4
            },
            elevation: 5,
        },
        //NAVIGTION HEADER
        navigation_header: {
            current_container_height: 170,
            current_container_color: navHeader1,
            
            text_color: darkTextColor,

            next_container_height: 50,
            next_container_color: navHeader2,
        },
    },

    dark: {
        color: darkBackground,
        textColor: darkTextColor,
        descTextColor: descTextColor,
        sheetShading1: darkSheetShading1,
        sheetShading2: darkSheetShading2,
        // HEADER
        header: {
            height: 60,
            padding: 7.5,
            borderRadius: 10,
            margin: 7,



            shadowColor: 'black',
            shadowOpacity: 0.35,
            shadowRadius: 5,
            shadowOffset: {
                width: 0,
                height: 4
            },
            elevation: 5,
        },
        // INPUT BOTTOM SHEET
        import_bottom: {
            shadowColor: 'black',
            shadowOpacity: 0.35,
            shadowRadius: 5,
            shadowOffset: {
                width: 0,
                height: -4
            },
        },
        //CENTER ON USER BUTTON
        center_on_button: {
            shadowColor: 'black',
            shadowOpacity: 0.35,
            shadowRadius: 5,
            shadowOffset: {
                width: 0,
                height: 4
            },
            elevation: 5,
        },
        //NAVIGTION HEADER
        navigation_header: {
            current_container_height: 170,
            current_container_color: navHeader1,

            text_color: darkTextColor,

            next_container_height: 50,
            next_container_color: navHeader2,
        },
    }

}

export const MAP = {

    light: [
        {
            "elementType": "labels.text.fill",
            "stylers": [
            {
                "color": "#746855"
            }
            ]
        },
    ],
    dark: [
        {
            "elementType": "geometry",
            "stylers": [
            {
                "color": "#242f3e"
            }
            ]
        },
        {
            "elementType": "labels.text.fill",
            "stylers": [
            {
                "color": "#746855"
            }
            ]
        },
        {
            "elementType": "labels.text.stroke",
            "stylers": [
            {
                "color": "#242f3e"
            }
            ]
        },
        {
            "featureType": "administrative.locality",
            "elementType": "labels.text.fill",
            "stylers": [
            {
                "color": "#d59563"
            }
            ]
        },
        {
            "featureType": "poi",
            "elementType": "labels.text.fill",
            "stylers": [
            {
                "color": "#d59563"
            }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "geometry",
            "stylers": [
            {
                "color": "#263c3f"
            }
            ]
        },
        {
            "featureType": "poi.park",
            "elementType": "labels.text.fill",
            "stylers": [
            {
                "color": "#6b9a76"
            }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry",
            "stylers": [
            {
                "color": "#38414e"
            }
            ]
        },
        {
            "featureType": "road",
            "elementType": "geometry.stroke",
            "stylers": [
            {
                "color": "#212a37"
            }
            ]
        },
        {
            "featureType": "road",
            "elementType": "labels.text.fill",
            "stylers": [
            {
                "color": "#9ca5b3"
            }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry",
            "stylers": [
            {
                "color": "#746855"
            }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "geometry.stroke",
            "stylers": [
            {
                "color": "#1f2835"
            }
            ]
        },
        {
            "featureType": "road.highway",
            "elementType": "labels.text.fill",
            "stylers": [
            {
                "color": "#f3d19c"
            }
            ]
        },
        {
            "featureType": "transit",
            "elementType": "geometry",
            "stylers": [
            {
                "color": "#2f3948"
            }
            ]
        },
        {
            "featureType": "transit.station",
            "elementType": "labels.text.fill",
            "stylers": [
            {
                "color": "#d59563"
            }
            ]
        },
        {
            "featureType": "water",
            "elementType": "geometry",
            "stylers": [
            {
                "color": "#17263c"
            }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.fill",
            "stylers": [
            {
                "color": "#515c6d"
            }
            ]
        },
        {
            "featureType": "water",
            "elementType": "labels.text.stroke",
            "stylers": [
            {
                "color": "#17263c"
            }
            ]
        }
        ]
}

