import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppSelector } from '../hooks/redux';
import { DefaultTheme, ColorPalettes, ColorCombinations } from '../constants/colors';
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
    
    // Apply color scheme or custom primary color
    let primaryColor = baseColors.primary;
    let secondaryColor = baseColors.secondary;
    
    if (preferences.colorScheme && preferences.colorScheme !== 'custom') {
      const combination = ColorCombinations[preferences.colorScheme];
      primaryColor = combination.primary;
      secondaryColor = combination.secondary;
    } else if (preferences.primaryColor) {
      primaryColor = preferences.primaryColor;
    }
    
    return {
      colors: {
        ...baseColors,
        primary: primaryColor,
        secondary: secondaryColor,
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
        h3: {
          fontSize: 20,
          fontWeight: 'bold',
          lineHeight: 28,
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
  }, [isDark, preferences.primaryColor, preferences.colorScheme]);

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