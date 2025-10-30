import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { COLORS } from './themes';

// Define type for context value
type ThemeContextType = {
  theme: typeof COLORS.light;
  colorScheme: 'light' | 'dark';
  toggleTheme: () => void;
};

// Create context with correct type
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Provider component
export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemColorScheme = useColorScheme();
    const [colorScheme, setColorScheme] = useState<'light' | 'dark'>(systemColorScheme || 'light');

    // Keep in sync with system preference
    useEffect(() => {
        if (systemColorScheme) setColorScheme(systemColorScheme);
    }, [systemColorScheme]);

    // Toggle manually
    const toggleTheme = () => {
        setColorScheme((prev) => (prev === 'light' ? 'dark' : 'light'));
    };

    const theme = COLORS[colorScheme];

    return (
        <ThemeContext.Provider value={{ theme, colorScheme, toggleTheme }}>
        {children}
        </ThemeContext.Provider>
    );
}

// Custom hook for using theme
export function useTheme() {
    const context = useContext(ThemeContext);
    return context ?? { 
        theme: COLORS.light, 
        colorScheme: 'light', 
        toggleTheme: () => {} };
}
