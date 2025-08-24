import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppSelector } from '../hooks/redux';
import { DefaultTheme, ColorPalettes } from '../constants/colors';
import { AppTheme } from '../types';

interface ThemeContextType {
  theme: AppTheme;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const { preferences } = useAppSelector(state => state.settings);
  
  const isDark = useMemo(() => {
    if (preferences.theme === 'system') {
      return systemColorScheme === 'dark';
    }
    return preferences.theme === 'dark';
  }, [preferences.theme, systemColorScheme]);

  const theme: AppTheme = useMemo(() => {
    const baseColors = isDark ? DefaultTheme.dark : DefaultTheme.light;
    
    // Apply custom primary color if set
    const primaryColor = preferences.primaryColor || baseColors.primary;
    
    return {
      colors: {
        ...baseColors,
        primary: primaryColor,
      },
      spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
      },
      typography: {
        h1: {
          fontSize: 32,
          fontWeight: 'bold',
          lineHeight: 40,
        },
        h2: {
          fontSize: 24,
          fontWeight: 'bold',
          lineHeight: 32,
        },
        body: {
          fontSize: 16,
          lineHeight: 24,
        },
        caption: {
          fontSize: 12,
          lineHeight: 16,
        },
      },
    };
  }, [isDark, preferences.primaryColor]);

  const contextValue = useMemo(() => ({
    theme,
    isDark,
  }), [theme, isDark]);

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;