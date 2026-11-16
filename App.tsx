import React from 'react';
import { Text, type TextProps } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { colors, font } from './src/theme';
import TabNavigator from './src/navigation/TabNavigator';
import { DashboardProfileProvider } from './src/personas';

const TextWithDefaults = Text as typeof Text & { defaultProps?: TextProps };
TextWithDefaults.defaultProps = {
  ...TextWithDefaults.defaultProps,
  style: [
    TextWithDefaults.defaultProps?.style,
    { fontFamily: font.body.regular },
  ],
};

export default function App() {
  const [fontsLoaded] = useFonts({
    [font.body.regular]: require('./assets/fonts/TDSansBody-Regular.ttf'),
    [font.body.medium]: require('./assets/fonts/TDSansBody-Medium.ttf'),
    [font.body.bold]: require('./assets/fonts/TDSansBody-Bold.ttf'),
    [font.headline.regular]: require('./assets/fonts/TDSansHeadline-Regular.ttf'),
    [font.headline.bold]: require('./assets/fonts/TDSansHeadline-Bold.ttf'),
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
        <DashboardProfileProvider>
          <TabNavigator />
        </DashboardProfileProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
