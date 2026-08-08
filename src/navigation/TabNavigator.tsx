import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import DashboardScreen from '../screens/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import SendPayScreen from '../screens/SendPayScreen';
import CardsScreen from '../screens/CardsScreen';
import { colors, font, radius } from '../theme';

const Tab = createBottomTabNavigator();

type TabIconProps = {
  name: keyof typeof Ionicons.glyphMap;
  focused: boolean;
};

function TabIcon({ name, focused }: TabIconProps) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Ionicons
        name={name}
        size={22}
        color={focused ? colors.green : colors.textTertiary}
      />
    </View>
  );
}

export default function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 60 + insets.bottom,
          backgroundColor: 'rgba(10,10,10,0.92)',
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: font.size.xs,
          fontWeight: font.weight.medium,
          marginBottom: 4,
        },
        tabBarItemStyle: { paddingTop: 6 },
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
          tabBarIcon: ({ focused }) => (
            <View style={styles.sendTab}>
              <Ionicons name="paper-plane" size={20} color="#000" />
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
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 36, height: 36, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: colors.greenDim,
  },
  sendTab: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.green,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
    shadowColor: colors.green,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
