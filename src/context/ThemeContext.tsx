import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { lightColors, darkColors, Colors } from '../theme/colors';

interface ThemeContextData {
  isDark: boolean;
  colors: Colors;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    setIsDark(systemColorScheme === 'dark');
  }, [systemColorScheme]);

  const toggleTheme = () => setIsDark(prev => !prev);

  const themeData: ThemeContextData = {
    isDark,
    colors: isDark ? darkColors : lightColors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={themeData}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
