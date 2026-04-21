import React, { useContext } from 'react';
import {
  NavigationContainer,
  DefaultTheme as NavDefaultTheme,
  DarkTheme as NavDarkTheme,
} from '@react-navigation/native';
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider, AppContext } from './src/contexts/AppContext';
import AppNavigator from './src/navigation/AppNavigator';

const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6C63FF',
    primaryContainer: '#E8E6FF',
    secondary: '#03DAC6',
    secondaryContainer: '#C8FFF4',
    background: '#F5F5FA',
    surface: '#FFFFFF',
    surfaceVariant: '#E8E6FF',
    error: '#FF5252',
    onPrimary: '#FFFFFF',
    onBackground: '#1A1A2E',
    onSurface: '#1A1A2E',
    outline: '#D0CFE2',
    elevation: {
      ...MD3LightTheme.colors.elevation,
      level1: '#FFFFFF',
      level2: '#F8F7FF',
      level3: '#F0EEFF',
    },
  },
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#A78BFA',
    primaryContainer: '#3730A3',
    secondary: '#34D399',
    secondaryContainer: '#064E3B',
    background: '#0F0E1A',
    surface: '#1A1A2E',
    surfaceVariant: '#252540',
    error: '#FF6B6B',
    onPrimary: '#FFFFFF',
    onBackground: '#E5E5F0',
    onSurface: '#E5E5F0',
    outline: '#3D3D5C',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: '#1A1A2E',
      level2: '#222240',
      level3: '#2A2A4A',
    },
  },
};

const navLight = {
  ...NavDefaultTheme,
  colors: {
    ...NavDefaultTheme.colors,
    primary: '#6C63FF',
    background: '#F5F5FA',
    card: '#FFFFFF',
    text: '#1A1A2E',
    border: '#D0CFE2',
    notification: '#FF5252',
  },
};

const navDark = {
  ...NavDarkTheme,
  colors: {
    ...NavDarkTheme.colors,
    primary: '#A78BFA',
    background: '#0F0E1A',
    card: '#1A1A2E',
    text: '#E5E5F0',
    border: '#3D3D5C',
    notification: '#FF6B6B',
  },
};

function InnerApp() {
  const { isDarkMode } = useContext(AppContext);
  const paperTheme = isDarkMode ? customDarkTheme : customLightTheme;
  const navTheme = isDarkMode ? navDark : navLight;

  return (
    <PaperProvider theme={paperTheme}>
      <NavigationContainer theme={navTheme}>
        <StatusBar style={isDarkMode ? 'light' : 'dark'} />
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <InnerApp />
      </AppProvider>
    </SafeAreaProvider>
  );
}
