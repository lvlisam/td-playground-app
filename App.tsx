import React from 'react';
import { Platform, Text, type TextProps } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { font } from './src/theme';
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
  useFonts({
    [font.headline.medium]: Inter_500Medium,
    [font.headline.semibold]: Inter_600SemiBold,
    [font.headline.bold]: Inter_700Bold,
    [font.headline.heavy]: Inter_800ExtraBold,
  });

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
