import React from 'react';
import { Text, type TextProps } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { colors, font } from './src/theme';
import TabNavigator from './src/navigation/TabNavigator';

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
    [font.body.light]: require('./assets/fonts/TDSansBody-Light.ttf'),
    [font.body.lightItalic]: require('./assets/fonts/TDSansBody-LightItalic.ttf'),
    [font.body.regular]: require('./assets/fonts/TDSansBody-Regular.ttf'),
    [font.body.italic]: require('./assets/fonts/TDSansBody-Italic.ttf'),
    [font.body.medium]: require('./assets/fonts/TDSansBody-Medium.ttf'),
    [font.body.mediumItalic]: require('./assets/fonts/TDSansBody-MediumItalic.ttf'),
    [font.body.bold]: require('./assets/fonts/TDSansBody-Bold.ttf'),
    [font.body.boldItalic]: require('./assets/fonts/TDSansBody-BoldItalic.ttf'),
    [font.headline.light]: require('./assets/fonts/TDSansHeadline-Light.ttf'),
    [font.headline.lightItalic]: require('./assets/fonts/TDSansHeadline-LightItalic.ttf'),
    [font.headline.regular]: require('./assets/fonts/TDSansHeadline-Regular.ttf'),
    [font.headline.italic]: require('./assets/fonts/TDSansHeadline-Italic.ttf'),
    [font.headline.bold]: require('./assets/fonts/TDSansHeadline-Bold.ttf'),
    [font.headline.boldItalic]: require('./assets/fonts/TDSansHeadline-BoldItalic.ttf'),
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
