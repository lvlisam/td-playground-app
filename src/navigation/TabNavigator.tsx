import React from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View, StyleSheet, useWindowDimensions } from 'react-native';
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
import GetHelpScreen from '../screens/GetHelpScreen';
import AccountServicingScreen from '../screens/AccountServicingScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import SupportBookingScreen from '../screens/SupportBookingScreen';
import { AccountsProvider } from '../accounts';
import { colors, font, radius } from '../theme';
import { dashboardProfileOptions, useDashboardProfile } from '../personas';
import { useAuth } from '../auth';

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
  { label: 'Insights', route: 'Insights', icon: 'analytics-outline' },
  { label: 'Move money', route: 'Pay & Transfer', icon: 'swap-horizontal' },
  { label: 'Benefits', route: 'Benefits', icon: 'gift-outline' },
  { label: 'Get Help', route: 'Get Help', icon: 'help-circle-outline' },
  { label: 'Card Manager', route: 'Card Manager', icon: 'card-outline' },
  { label: 'Account servicing', route: 'Account servicing', icon: 'construct-outline' },
  { label: 'Account settings', route: 'Account settings', icon: 'settings-outline' },
  { label: 'Notifications', route: 'Notifications', icon: 'notifications-outline' },
] as const;

const desktopScreenContent: Record<string, { eyebrow: string; title: string; description: string; detail: string; icon: keyof typeof Ionicons.glyphMap }> = {
  Home: {
    eyebrow: 'ACCOUNT OVERVIEW',
    title: 'Your accounts, at a glance',
    description: 'A clear view of balances, recent activity and what needs attention.',
    detail: 'Review account activity and upcoming payments.',
    icon: 'wallet-outline',
  },
  Insights: {
    eyebrow: 'FINANCIAL INSIGHTS',
    title: 'Make your money work for you',
    description: 'Explore spending patterns and practical ways to reach your goals.',
    detail: 'See spending trends and personalized guidance.',
    icon: 'analytics-outline',
  },
  'Pay & Transfer': {
    eyebrow: 'PAYMENTS',
    title: 'Move money with confidence',
    description: 'Choose a payment or transfer and review the details before continuing.',
    detail: 'Send money, pay bills and manage transfers.',
    icon: 'swap-horizontal',
  },
  Benefits: {
    eyebrow: 'MEMBER BENEFITS',
    title: 'More value from your banking',
    description: 'Discover offers and benefits selected for your banking relationship.',
    detail: 'Explore programs and eligible offers.',
    icon: 'gift-outline',
  },
  'Get Help': {
    eyebrow: 'SUPPORT',
    title: 'How can we help?',
    description: 'Find answers, connect with support or book time with a colleague.',
    detail: 'Choose the support option that works for you.',
    icon: 'help-circle-outline',
  },
  'Card Manager': {
    eyebrow: 'CARD SERVICES',
    title: 'Manage your cards',
    description: 'Review card details and access the tools you need to stay in control.',
    detail: 'View card controls and servicing options.',
    icon: 'card-outline',
  },
  'Account servicing': {
    eyebrow: 'ACCOUNT SERVICES',
    title: 'Take care of your accounts',
    description: 'Access common account requests and servicing options in one place.',
    detail: 'Find account maintenance and service requests.',
    icon: 'construct-outline',
  },
  'Account settings': {
    eyebrow: 'PREFERENCES',
    title: 'Make it yours',
    description: 'Keep your profile and account preferences up to date.',
    detail: 'Review personal and security preferences.',
    icon: 'settings-outline',
  },
  Notifications: {
    eyebrow: 'NOTIFICATIONS',
    title: 'Stay in the know',
    description: 'Review updates and reminders connected to your accounts.',
    detail: 'See recent alerts and account updates.',
    icon: 'notifications-outline',
  },
};

function DesktopNavigationMenu({ navigation, activeTab }: { navigation: NavigationProp<ParamListBase>; activeTab: string }) {
  return (
    <View style={styles.desktopMenu} accessibilityLabel="Shared screen navigation">
      {desktopNavigationItems.map((item) => {
        const selected = activeTab === item.route;
        return (
          <TouchableOpacity
            key={item.route}
            accessibilityRole="button"
            accessibilityLabel={`Show ${item.label} on mobile and desktop`}
            accessibilityState={{ selected }}
            onPress={() => navigation.navigate(item.route)}
            style={[styles.desktopMenuButton, selected && styles.desktopMenuButtonActive]}
          >
            <View style={[styles.desktopMenuIcon, selected && styles.desktopMenuIconActive]}>
              <Ionicons name={item.icon} size={17} color={selected ? colors.white : colors.greenDeep} />
            </View>
            <Text numberOfLines={1} style={[styles.desktopMenuLabel, selected && styles.desktopMenuLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function DesktopColleagueWorkspace({ activeTab }: { activeTab: string }) {
  const { activeProfileId, activeProfile, selectProfile } = useDashboardProfile();
  const screen = desktopScreenContent[activeTab] ?? desktopScreenContent.Home;
  const activeLabel = desktopNavigationItems.find((item) => item.route === activeTab)?.label ?? activeTab;

  return (
    <View style={styles.colleagueWorkspace} accessibilityLabel={`Colleague desktop preview showing ${activeLabel}`}>
      <View style={styles.workspaceChrome}>
        <View style={styles.workspaceBrand}>
          <View style={styles.workspaceBrandMark}><Text style={styles.workspaceBrandText}>TD</Text></View>
          <Text style={styles.workspaceBrandName}>Colleague workspace</Text>
        </View>
        <View style={styles.workspacePreviewBadge}>
          <View style={styles.workspacePreviewDot} />
          <Text style={styles.workspacePreviewText}>SYNCED PREVIEW</Text>
        </View>
      </View>
      <ScrollView
        style={styles.workspaceMain}
        contentContainerStyle={styles.workspaceMainContent}
        showsVerticalScrollIndicator
      >
        <View style={styles.workspaceHeadingRow}>
          <View style={styles.workspaceHeadingCopy}>
            <Text style={styles.workspaceEyebrow}>DESKTOP · {activeLabel.toUpperCase()}</Text>
            <Text accessibilityRole="header" style={styles.workspaceTitle}>{screen.title}</Text>
          </View>
          <Ionicons name="ellipsis-horizontal" size={19} color={colors.textSecondary} />
        </View>
        <Text style={styles.workspaceSectionLabel}>SELECT A CUSTOMER PROFILE</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.workspaceProfileList}
          accessibilityLabel="Customer profiles"
        >
          {dashboardProfileOptions.map((profile) => {
            const selected = activeProfileId === profile.id;
            return (
              <TouchableOpacity
                key={profile.id}
                accessibilityRole="button"
                accessibilityLabel={`Show ${profile.name} in both desktop and mobile experiences`}
                accessibilityState={{ selected }}
                onPress={() => selectProfile(profile.id)}
                style={[styles.workspaceProfileChip, selected && styles.workspaceProfileChipSelected]}
              >
                <View style={[styles.workspaceProfileInitials, selected && styles.workspaceProfileInitialsSelected]}>
                  <Text style={[styles.workspaceProfileInitialsText, selected && styles.workspaceProfileInitialsTextSelected]}>{profile.initials}</Text>
                </View>
                <Text numberOfLines={1} style={[styles.workspaceProfileName, selected && styles.workspaceProfileNameSelected]}>{profile.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <View style={styles.workspaceScreenCard}>
          <View style={styles.workspaceContextHeading}>
            <View style={styles.workspaceScreenIcon}><Ionicons name={screen.icon} size={17} color={colors.greenDeep} /></View>
            <Text style={styles.workspaceContextEyebrow}>{screen.eyebrow}</Text>
          </View>
          <Text style={styles.workspaceScreenTitle}>{screen.title}</Text>
          <Text style={styles.workspaceScreenBody}>{screen.description}</Text>
          <View style={styles.workspaceScreenDetail}>
            <Text style={styles.workspaceScreenDetailLabel}>ON THIS SCREEN</Text>
            <Text style={styles.workspaceScreenBody}>{screen.detail}</Text>
          </View>
        </View>
        <View style={styles.workspaceCustomerCard} accessibilityLabel={`${activeProfile.name}, ${activeProfile.relationship}`}>
          <View style={styles.workspaceCustomerAvatar}>
            <Text style={styles.workspaceCustomerInitials}>{activeProfile.initials}</Text>
          </View>
          <View style={styles.workspaceCustomerCopy}>
            <View style={styles.workspaceCustomerNameRow}>
              <Text numberOfLines={1} style={styles.workspaceCustomerName}>{activeProfile.name}</Text>
              <View style={styles.workspaceCustomerBadge}><Text style={styles.workspaceCustomerBadgeText}>{activeProfile.badge}</Text></View>
            </View>
            <Text style={styles.workspaceCustomerRelationship}>{activeProfile.relationship} · {activeProfile.detail}</Text>
            <Text style={styles.workspaceCustomerMeta}>{activeProfile.tdRelationshipLength} with TD</Text>
          </View>
        </View>
        <View style={styles.workspaceContextCard}>
          <View style={styles.workspaceContextHeading}>
            <View style={styles.workspaceContextIcon}><Ionicons name="sparkles-outline" size={15} color={colors.greenDeep} /></View>
            <Text style={styles.workspaceContextEyebrow}>SHARED CUSTOMER CONTEXT</Text>
          </View>
          <Text style={styles.workspaceContextTitle}>{activeProfile.need}</Text>
          <Text style={styles.workspaceContextBody}>This profile and selected screen stay in sync with the mobile preview.</Text>
        </View>
        <View style={styles.workspaceChannelRow} accessibilityLabel="Desktop and mobile previews showing the same screen">
          <View style={styles.workspaceChannelItem}>
            <Ionicons name="desktop-outline" size={15} color={colors.greenDeep} />
            <Text style={styles.workspaceChannelText}>Desktop</Text>
          </View>
          <Ionicons name="sync-outline" size={14} color={colors.textTertiary} />
          <View style={styles.workspaceChannelItem}>
            <Ionicons name="phone-portrait-outline" size={15} color={colors.greenDeep} />
            <Text style={styles.workspaceChannelText}>Mobile · {activeLabel}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

export default function TabNavigator() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { authFlowVisible } = useAuth();
  const [activeTab, setActiveTab] = React.useState('Home');
  const showDeviceFrame = Platform.OS === 'web' && width >= 650;
  const showOmnichannelView = Platform.OS === 'web' && width >= 900;
  const deviceWidth = showDeviceFrame
    ? showOmnichannelView
      ? Math.min(320, width * 0.32, Math.max(300, height - 120) * 0.52)
      : Math.min(390, width - 32, Math.max(320, height - 104) * 0.47)
    : width;
  const deviceHeight = showDeviceFrame
    ? showOmnichannelView
      ? Math.min(deviceWidth / 0.47, Math.max(320, height - 120))
      : deviceWidth / 0.47
    : height;
  return (
    <View style={[styles.stage, showDeviceFrame && styles.previewStage]}>
      {showDeviceFrame && (
        <View style={styles.desktopPageHeader}>
          <View style={styles.desktopPageHeaderAccent} />
          <View style={styles.desktopPageHeaderCopy}>
              <Text accessibilityRole="header" style={styles.desktopPageHeaderTitle}>
            One screen, two views
          </Text>
          <Text style={styles.desktopPageHeaderTagline}>Use the left navigation to compare the same experience on mobile and desktop.</Text>
          </View>
        </View>
      )}
      <View style={showDeviceFrame ? styles.desktopPreviewBody : styles.mobilePreviewBody}>
      {showDeviceFrame && <DesktopNavigationMenu navigation={navigation} activeTab={activeTab} />}
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
                  backBehavior="history"
                  screenListeners={({ route }) => ({
                    focus: () => setActiveTab(route.name),
                  })}
                  screenOptions={{
                    headerShown: false,
                    tabBarStyle: {
                      display: authFlowVisible ? 'none' : 'flex',
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
                      fontSize: deviceWidth < 360 ? 9 : 10.5,
                      fontWeight: font.weight.medium,
                      lineHeight: deviceWidth < 360 ? 11 : 13,
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
                    name="Insights"
                    component={PlanScreen}
                    options={{
                      tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'analytics' : 'analytics-outline'} focused={focused} />,
                    }}
                  />
                  <Tab.Screen
                    name="Pay & Transfer"
                    component={SendPayScreen}
                    options={{
                      tabBarLabel: ({ color }) => (
                        <Text numberOfLines={2} style={[styles.transferTabLabel, { color }]}>
                          Move{"\n"}money
                        </Text>
                      ),
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
                    name="Get Help"
                    component={GetHelpScreen}
                    options={{
                      tabBarIcon: ({ focused }) => <TabIcon name={focused ? 'help-circle' : 'help-circle-outline'} focused={focused} />,
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
                    name="Notifications"
                    component={NotificationsScreen}
                    options={{ tabBarButton: () => null }}
                  />
                  <Tab.Screen
                    name="Card Manager"
                    component={CardsScreen}
                    options={{ tabBarButton: () => null }}
                  />
                  <Tab.Screen
                    name="Support & booking"
                    component={SupportBookingScreen}
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
      {showOmnichannelView ? <DesktopColleagueWorkspace activeTab={activeTab} /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: frameColors.screen },
  previewStage: { flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: frameColors.stage },
  desktopPageHeader: { width: '100%', maxWidth: 1180, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 4 },
  desktopPageHeaderAccent: { width: 4, height: 34, borderRadius: 2, backgroundColor: colors.green },
  desktopPageHeaderCopy: { flex: 1, gap: 2 },
  desktopPageHeaderTitle: { flexShrink: 1, color: colors.text, fontSize: 18, lineHeight: 22, fontFamily: font.headline.bold },
  desktopPageHeaderTagline: { color: colors.textSecondary, fontSize: 12, lineHeight: 16, fontFamily: font.body.medium },
  desktopPreviewBody: { flex: 1, width: '100%', minHeight: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 },
  mobilePreviewBody: { flex: 1 },
  desktopMenu: { width: 184, padding: 10, borderRadius: 18, borderWidth: 1, borderColor: colors.borderFaint, backgroundColor: frameColors.white, gap: 4 },
  desktopMenuButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 6, borderRadius: 11 },
  desktopMenuButtonActive: { backgroundColor: colors.greenDim },
  desktopMenuIcon: { width: 28, height: 28, borderRadius: 9, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  desktopMenuIconActive: { backgroundColor: colors.greenDeep },
  desktopMenuLabel: { flex: 1, color: colors.text, fontSize: 11, lineHeight: 15, fontFamily: font.body.medium },
  desktopMenuLabelActive: { color: colors.greenDeep, fontFamily: font.body.bold },
  colleagueWorkspace: { flex: 1, minWidth: 0, maxWidth: 560, maxHeight: '96%', borderRadius: 18, borderWidth: 1, borderColor: colors.border, backgroundColor: frameColors.white, overflow: 'hidden', shadowColor: colors.text, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
  workspaceChrome: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, backgroundColor: colors.surfaceMid, borderBottomWidth: 1, borderBottomColor: colors.border },
  workspaceBrand: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  workspaceBrandMark: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenDeep },
  workspaceBrandText: { color: colors.white, fontSize: 10, fontFamily: font.body.bold },
  workspaceBrandName: { color: colors.text, fontSize: 11, fontFamily: font.body.bold },
  workspacePreviewBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 7, paddingVertical: 4, borderRadius: radius.full, backgroundColor: colors.greenDim },
  workspacePreviewDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.greenDeep },
  workspacePreviewText: { color: colors.greenDeep, fontSize: 8, fontFamily: font.body.bold, letterSpacing: 0.4 },
  workspaceMain: { flex: 1, minWidth: 0 },
  workspaceMainContent: { padding: 12, gap: 10 },
  workspaceHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  workspaceHeadingCopy: { flex: 1, gap: 2 },
  workspaceEyebrow: { color: colors.greenDeep, fontSize: 8, lineHeight: 11, fontFamily: font.body.bold, letterSpacing: 0.7 },
  workspaceTitle: { color: colors.text, fontSize: 18, lineHeight: 23, fontFamily: font.headline.bold },
  workspaceSectionLabel: { color: colors.textSecondary, fontSize: 8, lineHeight: 11, fontFamily: font.body.bold, letterSpacing: 0.5 },
  workspaceProfileList: { flexDirection: 'row', gap: 6, paddingVertical: 1 },
  workspaceProfileChip: { width: 66, minHeight: 60, alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 4, paddingVertical: 5, borderRadius: 11, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  workspaceProfileChipSelected: { borderColor: colors.green, backgroundColor: colors.greenDim },
  workspaceProfileInitials: { width: 25, height: 25, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMid },
  workspaceProfileInitialsSelected: { backgroundColor: colors.white },
  workspaceProfileInitialsText: { color: colors.textSecondary, fontSize: 8, fontFamily: font.body.bold },
  workspaceProfileInitialsTextSelected: { color: colors.greenDeep },
  workspaceProfileName: { maxWidth: 58, color: colors.textSecondary, fontSize: 8, lineHeight: 10, fontFamily: font.body.medium },
  workspaceProfileNameSelected: { color: colors.greenDeep, fontFamily: font.body.bold },
  workspaceCustomerCard: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 10, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  workspaceCustomerAvatar: { width: 38, height: 38, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenDim },
  workspaceCustomerInitials: { color: colors.greenDeep, fontSize: 10, fontFamily: font.body.bold },
  workspaceCustomerCopy: { flex: 1, minWidth: 0, gap: 2 },
  workspaceCustomerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  workspaceCustomerName: { flexShrink: 1, color: colors.text, fontSize: 13, lineHeight: 17, fontFamily: font.headline.bold },
  workspaceCustomerBadge: { paddingHorizontal: 6, paddingVertical: 3, borderRadius: radius.full, backgroundColor: colors.greenDim },
  workspaceCustomerBadgeText: { color: colors.greenDeep, fontSize: 7, fontFamily: font.body.bold },
  workspaceCustomerRelationship: { color: colors.textSecondary, fontSize: 9, lineHeight: 12 },
  workspaceCustomerMeta: { color: colors.textTertiary, fontSize: 8, lineHeight: 11 },
  workspaceContextCard: { padding: 11, borderRadius: 13, backgroundColor: colors.greenDim, gap: 6 },
  workspaceContextHeading: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  workspaceContextIcon: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  workspaceContextEyebrow: { color: colors.greenDeep, fontSize: 8, lineHeight: 11, fontFamily: font.body.bold, letterSpacing: 0.5 },
  workspaceContextTitle: { color: colors.text, fontSize: 12, lineHeight: 16, fontFamily: font.headline.bold },
  workspaceContextBody: { color: colors.textSecondary, fontSize: 9, lineHeight: 13 },
  workspaceScreenCard: { padding: 12, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 7 },
  workspaceScreenIcon: { width: 27, height: 27, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenDim },
  workspaceScreenTitle: { color: colors.text, fontSize: 15, lineHeight: 20, fontFamily: font.headline.bold },
  workspaceScreenBody: { color: colors.textSecondary, fontSize: 9, lineHeight: 13 },
  workspaceScreenDetail: { gap: 4, paddingTop: 7, borderTopWidth: 1, borderTopColor: colors.border },
  workspaceScreenDetailLabel: { color: colors.greenDeep, fontSize: 7, lineHeight: 10, fontFamily: font.body.bold, letterSpacing: 0.5 },
  workspaceChannelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 7, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.surfaceMid },
  workspaceChannelItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  workspaceChannelText: { color: colors.textSecondary, fontSize: 8, lineHeight: 11, fontFamily: font.body.medium },
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
  transferTabLabel: {
    width: '100%',
    flexShrink: 1,
    fontFamily: font.body.medium,
    fontSize: 10.5,
    fontWeight: font.weight.medium,
    lineHeight: 11,
    textAlign: 'center',
    marginBottom: 2,
  },
  tabIcon: {
    width: 34,
    height: 28,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: { backgroundColor: colors.greenDim },
});
