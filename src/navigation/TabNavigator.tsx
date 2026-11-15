import React from 'react';
import { Platform, Text, TouchableOpacity, View, StyleSheet, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardScreen from '../screens/DashboardScreen';
import PlanScreen from '../screens/PlanScreen';
import SendPayScreen from '../screens/SendPayScreen';
import BenefitsScreen from '../screens/BenefitsScreen';
import CardsScreen from '../screens/CardsScreen';
import TediScreen from '../screens/TediScreen';
import AccountServicingScreen from '../screens/AccountServicingScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import { AccountsProvider } from '../accounts';
import { colors, font, radius } from '../theme';

const Tab = createBottomTabNavigator();

const frameColors = {
  stage: colors.surfaceMid,
  screen: colors.bg,
  bezel: colors.text,
  white: colors.surface,
  green: colors.greenDeep,
  muted: colors.textSecondary,
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

function TransferTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon name="swap-horizontal" focused={focused} />;
}

function PhoneStatusBar({ light }: { light: boolean }) {
  const statusColor = light ? frameColors.white : frameColors.bezel;

  return (
    <View pointerEvents="none" accessible={false} style={styles.phoneStatusBar}>
      <Text style={[styles.phoneStatusTime, { color: statusColor }]}>9:41</Text>
      <View style={styles.phoneStatusIndicators}>
        <View style={styles.signalBars}>
          <View style={[styles.signalBar, styles.signalBarOne, { backgroundColor: statusColor }]} />
          <View style={[styles.signalBar, styles.signalBarTwo, { backgroundColor: statusColor }]} />
          <View style={[styles.signalBar, styles.signalBarThree, { backgroundColor: statusColor }]} />
          <View style={[styles.signalBar, styles.signalBarFour, { backgroundColor: statusColor }]} />
        </View>
        <Ionicons name="wifi" size={14} color={statusColor} />
        <View style={styles.batteryGroup}>
          <View style={[styles.batteryShell, { borderColor: statusColor }]}>
            <View style={[styles.batteryCharge, { backgroundColor: statusColor }]} />
          </View>
          <View style={[styles.batteryCap, { backgroundColor: statusColor }]} />
        </View>
      </View>
    </View>
  );
}

const desktopNavigationItems = [
  { label: 'Home', route: 'Home', icon: 'home-outline' },
  { label: 'Plan', route: 'Plan', icon: 'analytics-outline' },
  { label: 'Move money', route: 'Pay & Transfer', icon: 'swap-horizontal' },
  { label: 'Benefits', route: 'Benefits', icon: 'gift-outline' },
  { label: 'Tedi', route: 'Tedi', icon: 'sparkles-outline' },
] as const;

function DesktopNavigationMenu({ navigation }: { navigation: NavigationProp<ParamListBase> }) {
  return (
    <View style={styles.desktopMenu}>
      <View style={styles.desktopMenuHeading}>
        <View style={styles.desktopMenuBrandMark}><Text style={styles.desktopMenuBrandText}>TD</Text></View>
        <View>
          <Text style={styles.desktopMenuBrandTitle}>TD Banking</Text>
          <Text style={styles.desktopMenuBrandCaption}>Quick access</Text>
        </View>
      </View>
      <View style={styles.desktopMenuDivider} />
      {desktopNavigationItems.map((item) => (
        <TouchableOpacity
          key={item.route}
          accessibilityRole="button"
          accessibilityLabel={`Go to ${item.label}`}
          onPress={() => navigation.navigate(item.route)}
          style={styles.desktopMenuButton}
        >
          <View style={styles.desktopMenuIcon}>
            <Ionicons name={item.icon} size={17} color={colors.greenDeep} />
          </View>
          <Text numberOfLines={1} style={styles.desktopMenuLabel}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function DesktopCustomerInsights() {
  const personas = [
    { initials: 'AR', name: 'Ava', detail: 'Planning for a growing family', need: 'A goal plan that flexes with life.' },
    { initials: 'JM', name: 'Jordan', detail: 'Saving for a first home', need: 'A clearer path from today to someday.' },
    { initials: 'SK', name: 'Sam', detail: 'Running a small business', need: 'One simpler view of personal and business money.' },
  ];

  return (
    <View style={styles.desktopInsightsPanel} accessibilityLabel="Illustrative TD customer personas and needs">
      <View style={styles.insightsEyebrowRow}>
        <Ionicons name="people-outline" size={14} color={colors.greenDeep} />
        <Text style={styles.insightsEyebrow}>ILLUSTRATIVE DESIGN LENS</Text>
      </View>
      <Text accessibilityRole="header" style={styles.insightsTitle}>What TD customers may want</Text>
      <Text style={styles.insightsIntro}>Clear everyday money, meaningful next steps, and guidance that adapts when life changes.</Text>
      <View style={styles.personaList}>
        {personas.map((persona) => (
          <View key={persona.initials} style={styles.personaRow}>
            <View style={styles.personaAvatar}><Text style={styles.personaInitials}>{persona.initials}</Text></View>
            <View style={styles.personaCopy}>
              <Text style={styles.personaName}>{persona.name}</Text>
              <Text style={styles.personaDetail}>{persona.detail}</Text>
              <Text style={styles.personaNeed}>{persona.need}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={styles.customerQuoteCard}>
        <Ionicons name="chatbubble-ellipses-outline" size={17} color={colors.greenDeep} />
        <Text style={styles.customerQuote}>“Help me see what’s safe to spend and keep my bigger goals moving.”</Text>
        <Text style={styles.customerQuoteAttribution}>Ava · family planner</Text>
        <Text style={styles.quoteDisclaimer}>Illustrative persona quote, not a verbatim customer testimonial.</Text>
      </View>
    </View>
  );
}

export default function TabNavigator() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [activeTab, setActiveTab] = React.useState('Home');
  const showDeviceFrame = Platform.OS === 'web' && width >= 650;
  const showCustomerInsights = showDeviceFrame && width >= 1100;
  const deviceWidth = showDeviceFrame ? Math.min(390, width - 32, (height - 32) * 0.47) : width;
  const deviceHeight = showDeviceFrame ? deviceWidth / 0.47 : height;
  return (
    <View style={[styles.stage, showDeviceFrame && styles.previewStage]}>
      {showDeviceFrame && <DesktopNavigationMenu navigation={navigation} />}
      <View
        style={[
          styles.device,
          !showDeviceFrame && styles.nativeDevice,
          showDeviceFrame && { flexGrow: 0, flexShrink: 0, flexBasis: deviceWidth, width: deviceWidth, height: deviceHeight },
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
              <AccountsProvider>
              <Tab.Navigator
                  screenListeners={({ route }) => ({
                    focus: () => setActiveTab(route.name),
                  })}
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
                      borderTopColor: colors.border,
                      elevation: 0,
                    },
                    tabBarActiveTintColor: frameColors.green,
                    tabBarInactiveTintColor: frameColors.muted,
                    tabBarLabelPosition: 'below-icon',
                    tabBarLabelStyle: {
                      width: '100%',
                      flexShrink: 1,
                      fontFamily: font.body.medium,
                      fontSize: width < 360 ? 9 : 10.5,
                      fontWeight: font.weight.medium,
                      lineHeight: width < 360 ? 11 : 13,
                      textAlign: 'center',
                      marginBottom: 2,
                    },
                    tabBarItemStyle: { flex: 1, flexDirection: 'column', paddingHorizontal: 0, paddingVertical: 3, minWidth: 0 },
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
                    component={PlanScreen}
                    options={{
                      tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'analytics' : 'analytics-outline'} focused={focused} />,
                    }}
                  />
                  <Tab.Screen
                    name="Pay & Transfer"
                    component={SendPayScreen}
                    options={{
                      tabBarLabel: 'Move money',
                      tabBarAccessibilityLabel: 'Move money',
                      tabBarIcon: ({ focused }) => <TransferTabIcon focused={focused} />,
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
                    name="Tedi"
                    component={TediScreen}
                    options={{
                      tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'sparkles' : 'sparkles-outline'} focused={focused} />,
                    }}
                  />
                  <Tab.Screen
                    name="Account servicing"
                    component={AccountServicingScreen}
                    options={{ tabBarButton: () => null }}
                  />
                  <Tab.Screen
                    name="Account settings"
                    component={AccountSettingsScreen}
                    options={{ tabBarButton: () => null }}
                  />
                  <Tab.Screen
                    name="Card Manager"
                    component={CardsScreen}
                    options={{ tabBarButton: () => null }}
                  />
              </Tab.Navigator>
              </AccountsProvider>
              {Platform.OS === 'web' && <PhoneStatusBar light={activeTab === 'Home'} />}
            </View>
          </View>
        </View>
        {showDeviceFrame && (
          <>
            <View pointerEvents="none" accessible={false} style={styles.dynamicIsland}>
              <View style={styles.cameraLens}>
                <View style={styles.cameraLensCenter} />
              </View>
            </View>
            <View pointerEvents="none" accessible={false} style={styles.homeIndicator} />
          </>
        )}
      </View>
      {showCustomerInsights ? <DesktopCustomerInsights /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: frameColors.screen },
  previewStage: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, paddingHorizontal: 16, backgroundColor: frameColors.stage },
  desktopMenu: { width: 152, padding: 10, borderRadius: 18, borderWidth: 1, borderColor: colors.borderFaint, backgroundColor: frameColors.white, gap: 4 },
  desktopMenuHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 2, paddingBottom: 5 },
  desktopMenuBrandMark: { width: 32, height: 32, borderRadius: 10, backgroundColor: colors.greenDeep, alignItems: 'center', justifyContent: 'center' },
  desktopMenuBrandText: { color: frameColors.white, fontSize: 12, fontWeight: '800', letterSpacing: -0.5 },
  desktopMenuBrandTitle: { color: colors.text, fontSize: 12, lineHeight: 15, fontFamily: font.headline.semibold },
  desktopMenuBrandCaption: { color: colors.textSecondary, fontSize: 9, lineHeight: 12 },
  desktopMenuDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderFaint, marginBottom: 3 },
  desktopMenuButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6, borderRadius: 11 },
  desktopMenuIcon: { width: 28, height: 28, borderRadius: 9, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  desktopMenuLabel: { flex: 1, color: colors.text, fontSize: 11, lineHeight: 15, fontFamily: font.body.medium },
  desktopInsightsPanel: { width: 286, maxHeight: '92%', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: colors.borderFaint, backgroundColor: frameColors.white, gap: 12, shadowColor: colors.text, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.06, shadowRadius: 14, elevation: 2 },
  insightsEyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  insightsEyebrow: { color: colors.greenDeep, fontSize: 9, lineHeight: 12, fontFamily: font.body.bold, letterSpacing: 0.7 },
  insightsTitle: { color: colors.text, fontSize: 21, lineHeight: 26, fontFamily: font.headline.bold },
  insightsIntro: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  personaList: { gap: 10 },
  personaRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 9 },
  personaAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  personaInitials: { color: colors.greenDeep, fontSize: 10, fontFamily: font.body.bold },
  personaCopy: { flex: 1, gap: 1 },
  personaName: { color: colors.text, fontSize: 12, lineHeight: 16, fontFamily: font.headline.semibold },
  personaDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  personaNeed: { color: colors.greenDeep, fontSize: 10, lineHeight: 14, fontFamily: font.body.medium },
  customerQuoteCard: { padding: 12, borderRadius: 14, backgroundColor: colors.greenDim, gap: 6 },
  customerQuote: { color: colors.text, fontSize: 13, lineHeight: 19, fontFamily: font.headline.semibold },
  customerQuoteAttribution: { color: colors.greenDeep, fontSize: 10, lineHeight: 14, fontFamily: font.body.bold },
  quoteDisclaimer: { color: colors.textSecondary, fontSize: 9, lineHeight: 13 },
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
  cameraLens: { width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: '#283342', backgroundColor: '#111923', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginRight: 13 },
  cameraLensCenter: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#294A68' },
  phoneStatusBar: { position: 'absolute', zIndex: 4, top: 6, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
  phoneStatusTime: { color: frameColors.white, fontSize: 11, lineHeight: 14, fontFamily: font.body.bold },
  phoneStatusIndicators: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  signalBars: { height: 11, flexDirection: 'row', alignItems: 'flex-end', gap: 1 },
  signalBar: { width: 2, borderRadius: 1, backgroundColor: frameColors.white },
  signalBarOne: { height: 3 },
  signalBarTwo: { height: 5 },
  signalBarThree: { height: 7 },
  signalBarFour: { height: 9 },
  batteryGroup: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  batteryShell: { width: 18, height: 9, borderRadius: 3, borderWidth: 1, borderColor: frameColors.white, padding: 1, justifyContent: 'center' },
  batteryCharge: { width: '78%', height: '100%', borderRadius: 1, backgroundColor: frameColors.white },
  batteryCap: { width: 2, height: 4, borderTopRightRadius: 1, borderBottomRightRadius: 1, backgroundColor: frameColors.white },

  tabButton: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: 4,
  },
  tabButtonActive: { borderColor: colors.greenGlow },
  tabIcon: {
    width: 34,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: { backgroundColor: colors.greenDim },
});
