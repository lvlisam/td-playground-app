import React from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import SendPayScreen from '../screens/SendPayScreen';
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
  const desktopPreview = width >= 650;

  return (
    <View style={[styles.stage, desktopPreview && styles.desktopStage]}>
      <View
        style={[
          styles.appFrame,
          desktopPreview && {
            width: Math.min(430, width - 32),
            height: Math.max(480, height - 28),
            borderRadius: 38,
            borderWidth: 8,
            borderColor: frameColors.bezel,
            overflow: 'hidden',
          },
        ]}
      >
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 64 + insets.bottom,
              backgroundColor: frameColors.white,
              borderTopWidth: 1,
              borderTopColor: 'rgba(22,25,23,0.11)',
              elevation: 0,
            },
            tabBarActiveTintColor: frameColors.green,
            tabBarInactiveTintColor: frameColors.muted,
            tabBarLabelStyle: {
              fontSize: font.size.xs,
              fontWeight: font.weight.medium,
              marginBottom: 5,
            },
            tabBarItemStyle: { paddingTop: 4 },
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
            name="Activity"
            component={TransactionsScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'list' : 'list-outline'} focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Send"
            component={SendPayScreen}
            options={{
              tabBarIcon: () => (
                <View style={styles.sendTab}>
                  <Ionicons name="paper-plane" size={19} color={frameColors.bezel} />
                </View>
              ),
              tabBarLabel: () => null,
            }}
          />
          <Tab.Screen
            name="Cards"
            component={CardsScreen}
            options={{
              tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'card' : 'card-outline'} focused={focused} />,
            }}
          />
        </Tab.Navigator>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: frameColors.screen },
  desktopStage: { alignItems: 'center', justifyContent: 'center', backgroundColor: frameColors.stage },
  appFrame: { flex: 1, width: '100%', backgroundColor: frameColors.screen },
  tabIcon: {
    width: 34,
    height: 29,
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
