import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import TabNavigator from './src/navigation/TabNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          dark: true,
          colors: {
            primary: '#00C853',
            background: '#0A0A0A',
            card: '#141414',
            text: '#F5F5F5',
            border: '#2E2E2E',
            notification: '#00C853',
          },
        }}
      >
        <StatusBar style="light" />
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
