import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import sw from './locales/sw.json';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Get saved language preference
      const savedLanguage = await AsyncStorage.getItem('user_language');
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
      
      // Fall back to device locale
      const deviceLanguage = Localization.locale.split('-')[0];
      callback(deviceLanguage);
    } catch (error) {
      console.error('Language detection failed:', error);
      callback('en'); // Default to English
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem('user_language', lng);
    } catch (error) {
      console.error('Failed to cache language:', error);
    }
  },
};

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      sw: { translation: sw },
    },
    fallbackLng: 'en',
    debug: __DEV__,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;