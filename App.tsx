import React from 'react';
import { Platform, Text, type TextProps } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import TabNavigator from './src/navigation/TabNavigator';

const TextWithDefaults = Text as typeof Text & { defaultProps?: TextProps };
TextWithDefaults.defaultProps = {
  ...TextWithDefaults.defaultProps,
  style: [
    TextWithDefaults.defaultProps?.style,
    { fontFamily: Platform.select({ web: 'Arial', ios: 'System', android: 'Roboto', default: 'System' }) },
  ],
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          dark: false,
          colors: {
            primary: '#46B649',
            background: '#F4F5F3',
            card: '#FFFFFF',
            text: '#161917',
            border: 'rgba(22,25,23,0.12)',
            notification: '#46B649',
          },
        }}
      >
        <StatusBar style="auto" />
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
