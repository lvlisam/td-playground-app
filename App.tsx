import React from 'react';
import { Platform, Text, type TextProps } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { colors, font } from './src/theme';
import TabNavigator from './src/navigation/TabNavigator';

const TextWithDefaults = Text as typeof Text & { defaultProps?: TextProps };
TextWithDefaults.defaultProps = {
  ...TextWithDefaults.defaultProps,
  style: [
    TextWithDefaults.defaultProps?.style,
    { fontFamily: Platform.select({ web: font.body.regular, ios: 'System', android: 'Roboto', default: 'System' }) },
  ],
};

export default function App() {
  const [fontsLoaded] = useFonts({
    [font.body.light]: Inter_300Light,
    [font.body.regular]: Inter_400Regular,
    [font.body.medium]: Inter_500Medium,
    [font.headline.regular]: Inter_400Regular,
    [font.headline.medium]: Inter_500Medium,
    [font.headline.semibold]: Inter_600SemiBold,
    [font.headline.bold]: Inter_700Bold,
    [font.headline.heavy]: Inter_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer
        theme={{
          dark: false,
          colors: {
            primary: colors.green,
            background: colors.bg,
            card: colors.surface,
            text: colors.text,
            border: colors.border,
            notification: colors.red,
          },
        }}
      >
        <StatusBar style="dark" />
        <TabNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
