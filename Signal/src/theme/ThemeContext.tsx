import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from './colors';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    colors: typeof Colors.light;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [theme, setThemeState] = useState<Theme>(systemScheme === 'dark' ? 'dark' : 'light');

    useEffect(() => {
        const loadTheme = async () => {
            const savedTheme = await AsyncStorage.getItem('user-theme');
            if (savedTheme) {
                setThemeState(savedTheme as Theme);
            } else if (systemScheme) {
                setThemeState(systemScheme as Theme);
            }
        };
        loadTheme();
    }, [systemScheme]);

    const toggleTheme = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setThemeState(newTheme);
        await AsyncStorage.setItem('user-theme', newTheme);
    };

    const setTheme = async (newTheme: Theme) => {
        setThemeState(newTheme);
        await AsyncStorage.setItem('user-theme', newTheme);
    };

    const colors = Colors[theme];

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
