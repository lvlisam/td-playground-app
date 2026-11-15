import React from 'react';
import { Platform, TouchableOpacity, View, StyleSheet, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import SendPayScreen from '../screens/SendPayScreen';
import BenefitsScreen from '../screens/BenefitsScreen';
import CardsScreen from '../screens/CardsScreen';
import { font, radius } from '../theme';

const Tab = createBottomTabNavigator();

const frameColors = {
  stage: '#EEF0ED',
  screen: '#F4F5F3',
  bezel: '#161917',
  white: '#FFFFFF',
  green: '#46B649',
  muted: 'rgba(22,25,23,0.52)',
};

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
};

function TabIcon({ name, focused }: TabIconProps) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Ionicons
        name={name}
        size={21}
        color={focused ? frameColors.green : frameColors.muted}
      />
    </View>
  );
}

export default function TabNavigator() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const showDeviceFrame = Platform.OS === 'web' && width >= 650;
  const compactPreview = showDeviceFrame && width < 650;
  const desktopPreview = showDeviceFrame;
  const deviceWidth = compactPreview
    ? Math.min(width - 28, (height - 24) * 0.47)
    : Math.min(430, width - 32);
  const deviceHeight = compactPreview
    ? Math.min(height - 24, deviceWidth / 0.47)
    : Math.max(480, height - 28);
  return (
    <View style={[styles.stage, showDeviceFrame && styles.previewStage]}>
      <View
        style={[
          styles.device,
          !showDeviceFrame && styles.nativeDevice,
          compactPreview && { width: deviceWidth, height: deviceHeight },
          desktopPreview && { width: deviceWidth, height: deviceHeight },
        ]}
      >
        {showDeviceFrame && (
          <>
            <View pointerEvents="none" style={[styles.hardwareButton, styles.leftButtonTop]} />
            <View pointerEvents="none" style={[styles.hardwareButton, styles.leftButtonMiddle]} />
            <View pointerEvents="none" style={[styles.hardwareButton, styles.leftButtonBottom]} />
            <View pointerEvents="none" style={[styles.hardwareButton, styles.rightButton]} />
          </>
        )}
        <View style={[styles.deviceRim, !showDeviceFrame && styles.nativeRim]}>
          <View style={[styles.deviceBezel, !showDeviceFrame && styles.nativeBezel]}>
            <View style={[styles.deviceScreen, !showDeviceFrame && styles.nativeScreen]}>
              <Tab.Navigator
                  screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 68 + insets.bottom + (showDeviceFrame ? 18 : 0),
                      paddingBottom: showDeviceFrame ? 14 : insets.bottom || 4,
                      backgroundColor: frameColors.white,
                      borderTopWidth: 1,
                      borderTopColor: 'rgba(22,25,23,0.11)',
                      elevation: 0,
                    },
                    tabBarActiveTintColor: frameColors.green,
                    tabBarInactiveTintColor: frameColors.muted,
                    tabBarLabelStyle: {
                      fontSize: width < 360 ? 9 : 10.5,
                      fontWeight: font.weight.medium,
                      textAlign: 'center',
                      marginBottom: 3,
                    },
                    tabBarItemStyle: { paddingHorizontal: 1, paddingVertical: 3, minWidth: 0 },
                    tabBarButton: (props) => (
                      <TouchableOpacity
                        {...props}
                        style={[
                          props.style,
                          styles.tabButton,
                          props.accessibilityState?.selected && styles.tabButtonActive,
                        ]}
                      />
                    ),
                  }}
                >
                  <Tab.Screen
                    name="Home"
                    component={DashboardScreen}
                    options={{
                      tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'home' : 'home-outline'} focused={focused} />,
                    }}
                  />
                  <Tab.Screen
                    name="Plan"
                    component={TransactionsScreen}
                    options={{
                      tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'analytics' : 'analytics-outline'} focused={focused} />,
                    }}
                  />
                  <Tab.Screen
                    name="Pay & Transfer"
                    component={SendPayScreen}
                    options={{
                      tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'swap-horizontal' : 'swap-horizontal-outline'} focused={focused} />,
                    }}
                  />
                  <Tab.Screen
                    name="Benefits"
                    component={BenefitsScreen}
                    options={{
                      tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'gift' : 'gift-outline'} focused={focused} />,
                    }}
                  />
                  <Tab.Screen
                    name="Settings"
                    component={CardsScreen}
                    options={{
                      tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'settings' : 'settings-outline'} focused={focused} />,
                    }}
                  />
              </Tab.Navigator>
            </View>
          </View>
        </View>
        {showDeviceFrame && (
          <>
            <View pointerEvents="none" accessible={false} style={styles.dynamicIsland} />
            <View pointerEvents="none" accessible={false} style={styles.homeIndicator} />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: frameColors.screen },
  previewStage: { alignItems: 'center', justifyContent: 'center', backgroundColor: frameColors.stage },
  device: { position: 'relative', flex: 1, width: '100%' },
  nativeDevice: { backgroundColor: frameColors.screen },
  deviceRim: {
    flex: 1,
    zIndex: 1,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: '#A5ABA7',
    backgroundColor: '#737B77',
    padding: 3,
  },
  nativeRim: { borderWidth: 0, borderRadius: 0, padding: 0, backgroundColor: frameColors.screen },
  deviceBezel: {
    flex: 1,
    borderRadius: 44,
    backgroundColor: frameColors.bezel,
    padding: 5,
    overflow: 'hidden',
  },
  nativeBezel: { borderRadius: 0, padding: 0, backgroundColor: frameColors.screen },
  deviceScreen: { flex: 1, borderRadius: 37, overflow: 'hidden', backgroundColor: frameColors.screen },
  nativeScreen: { borderRadius: 0 },
  hardwareButton: {
    position: 'absolute',
    zIndex: 2,
    width: 3,
    borderRadius: 2,
    backgroundColor: '#A5ABA7',
  },
  leftButtonTop: { left: -1, top: 100, height: 22 },
  leftButtonMiddle: { left: -1, top: 138, height: 38 },
  leftButtonBottom: { left: -1, top: 184, height: 38 },
  rightButton: { right: -1, top: 150, height: 58 },
  dynamicIsland: {
    position: 'absolute',
    zIndex: 3,
    top: 11,
    alignSelf: 'center',
    width: 96,
    height: 28,
    borderRadius: 18,
    backgroundColor: '#050606',
  },
  homeIndicator: {
    position: 'absolute',
    zIndex: 3,
    bottom: 10,
    alignSelf: 'center',
    width: 96,
    height: 4,
    borderRadius: 3,
    backgroundColor: 'rgba(22,25,23,0.72)',
  },

  tabButton: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 4,
  },
  tabButtonActive: { borderColor: 'rgba(70,182,73,0.58)' },
  tabIcon: {
    width: 34,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: { backgroundColor: 'rgba(70,182,73,0.12)' },
  sendTab: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: frameColors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },
});
