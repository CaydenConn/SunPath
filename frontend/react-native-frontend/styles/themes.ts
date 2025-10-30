const lightBackground = "#fff";
const darkBackground = "#020618";

// GLOBAL COLORS
export const COLORS = {
    
    light: {
        // HEADER
        header: {
            height: 60,
            padding: 7.5,
            borderRadius: 10,
            margin: 7,
            color: lightBackground,

            shadowColor: 'black',
            shadowOpacity: 0.35,
            shadowRadius: 5,
            shadowOffset: {
                width: 0,
                height: 4
            },
        },
        // INPUT BOTTOM SHEET
        import_bottom: {
            color: lightBackground,

            shadowColor: 'black',
            shadowOpacity: 0.35,
            shadowRadius: 5,
            shadowOffset: {
                width: 0,
                height: -4
            },
        },
    },

    dark: {
        // HEADER
        header: {
            height: 60,
            padding: 7.5,
            borderRadius: 10,
            margin: 7,
            color: darkBackground,

            shadowColor: 'black',
            shadowOpacity: 0.35,
            shadowRadius: 5,
            shadowOffset: {
                width: 0,
                height: 4
            },
        },
        // INPUT BOTTOM SHEET
        import_bottom: {
            color: darkBackground,

            shadowColor: 'black',
            shadowOpacity: 0.35,
            shadowRadius: 5,
            shadowOffset: {
                width: 0,
                height: -4
            },
        },
    }

}

