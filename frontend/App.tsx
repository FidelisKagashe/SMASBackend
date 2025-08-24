import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import NetInfo from '@react-native-community/netinfo';

import { store, persistor } from './src/store';
import { useAppDispatch } from './src/hooks/redux';
import { setOnlineStatus } from './src/store/slices/syncSlice';
import { loadStoredAuth } from './src/store/slices/authSlice';
import AppNavigator from './src/navigation/AppNavigator';
import ThemeProvider from './src/components/ThemeProvider';
import LoadingScreen from './src/components/LoadingScreen';
import './src/i18n';

function AppContent() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Load stored authentication data
    dispatch(loadStoredAuth());

    // Set up network status listener
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch(setOnlineStatus(state.isConnected ?? false));
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <PaperProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </PaperProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}