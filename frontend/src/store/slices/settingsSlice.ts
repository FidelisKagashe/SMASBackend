import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserPreferences } from '../../types';

interface SettingsState {
  preferences: UserPreferences;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  preferences: {
    theme: 'light',
    language: 'en',
    primaryColor: '#3182CE',
    colorScheme: 'ocean',
    biometricEnabled: false,
  },
  isLoading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updatePreferences: (state, action: PayloadAction<Partial<UserPreferences>>) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.preferences.theme = action.payload;
    },
    setLanguage: (state, action: PayloadAction<'en' | 'sw'>) => {
      state.preferences.language = action.payload;
    },
    setPrimaryColor: (state, action: PayloadAction<string>) => {
      state.preferences.primaryColor = action.payload;
    },
    setBiometricEnabled: (state, action: PayloadAction<boolean>) => {
      state.preferences.biometricEnabled = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  updatePreferences,
  setTheme,
  setLanguage,
  setPrimaryColor,
  setBiometricEnabled,
  setLoading,
  setError,
  clearError,
} = settingsSlice.actions;

export default settingsSlice.reducer;