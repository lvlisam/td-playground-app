import React from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View, StyleSheet, useWindowDimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardScreen, { ColleagueHomeDetails, getDashboardAccounts, getSavingsThisMonth } from '../screens/DashboardScreen';
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
import { AccountsProvider, useAccounts } from '../accounts';
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

type WorkspaceTab = 'Home' | 'Customer' | 'Journey' | 'Top tools';

const workspaceTabRoutes: Record<WorkspaceTab, string> = {
  Home: 'Home',
  Customer: 'Home',
  Journey: 'Insights',
  'Top tools': 'Get Help',
};

const mobileRouteWorkspaceTabs: Partial<Record<string, WorkspaceTab>> = {
  Home: 'Home',
  Insights: 'Journey',
  'Get Help': 'Top tools',
};

function DesktopNavigationMenu({ navigation, activeTab }: { navigation: NavigationProp<ParamListBase>; activeTab: string }) {
  return (
    <View style={styles.desktopMenu} accessibilityLabel="Shared screen navigation">
      {desktopNavigationItems.slice(0, 5).map((item) => {
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
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function parseColleagueAmount(value: string) {
  const amount = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(amount) ? amount : 0;
}

function formatColleagueCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}

function formatColleagueMonthlySavings(value: number) {
  return `${value < 0 ? '−' : '+'}${formatColleagueCurrency(Math.abs(value))}`;
}

function ColleagueFinancialDetails({ profileId, onOpenPlans }: { profileId: ReturnType<typeof useDashboardProfile>['activeProfileId']; onOpenPlans: () => void }) {
  const { accounts } = useAccounts();
  const customerAccounts = getDashboardAccounts(profileId, accounts);
  const savingsGoalAccount = customerAccounts.find((account) => account.plan?.kind === 'savings-goal');
  const savingsGoalPlan = savingsGoalAccount?.plan?.kind === 'savings-goal' ? savingsGoalAccount.plan : null;
  const goalProgress = savingsGoalPlan
    ? Math.max(0, Math.min(100, Math.round((savingsGoalPlan.savedAmount / savingsGoalPlan.targetAmount) * 100)))
    : 0;
  const savingsThisMonth = getSavingsThisMonth(profileId);
  const monthlyContributionProgress = savingsGoalPlan
    ? Math.max(0, Math.min(100, Math.round((savingsThisMonth / savingsGoalPlan.monthlyContribution) * 100)))
    : 0;
  const totalBalance = customerAccounts.reduce((total, account) => {
    const amount = parseColleagueAmount(account.amount);
    return total + (account.id.endsWith('card') ? -amount : amount);
  }, 0);

  return (
    <View style={styles.workspaceFinancialRow}>
      <View style={styles.workspaceFinancialPanel}>
        <View style={styles.workspaceFinancialPanelHeading}>
          <View style={styles.workspaceFinancialTitleRow}>
            <View style={styles.workspaceFinancialIcon}><Ionicons name="wallet-outline" size={15} color={colors.greenDeep} /></View>
            <Text accessibilityRole="header" style={styles.workspaceFinancialTitle}>Accounts</Text>
          </View>
          <Text style={styles.workspaceFinancialMeta}>{customerAccounts.length} linked</Text>
        </View>
        <View style={styles.workspaceBalanceRow}>
          <Text style={styles.workspaceBalanceLabel}>Total balance</Text>
          <Text style={styles.workspaceBalanceAmount}>{formatColleagueCurrency(totalBalance)}</Text>
        </View>
        <View style={styles.workspaceFinancialAccountList}>
          {customerAccounts.map((account, index) => (
            <View
              key={account.id}
              accessible
              accessibilityRole="text"
              accessibilityLabel={`${account.name}, ${account.detail}, ${account.amount}${account.note ? `, ${account.note}` : ''}`}
              style={[styles.workspaceFinancialAccount, index < customerAccounts.length - 1 && styles.workspaceFinancialAccountDivider]}
            >
              <View style={[styles.workspaceFinancialAccountIcon, { backgroundColor: account.id.endsWith('card') ? colors.surfaceMid : colors.greenDim }]}>
                <Ionicons name={account.id.endsWith('card') ? 'card-outline' : 'wallet-outline'} size={13} color={account.id.endsWith('card') ? colors.textSecondary : colors.greenDeep} />
              </View>
              <View style={styles.workspaceFinancialAccountCopy}>
                <Text numberOfLines={1} style={styles.workspaceFinancialAccountName}>{account.name}</Text>
                <Text numberOfLines={1} style={styles.workspaceFinancialAccountDetail}>{account.productLabel} · {account.detail}</Text>
                {account.note ? <Text numberOfLines={1} style={styles.workspaceFinancialAccountNote}>{account.note}</Text> : null}
              </View>
              <View style={styles.workspaceFinancialAccountValues}>
                <Text style={styles.workspaceFinancialAccountLabel}>{account.amountLabel}</Text>
                <Text numberOfLines={1} style={styles.workspaceFinancialAccountAmount}>{account.amount}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.workspaceFinancialPanel}>
        <View style={styles.workspaceFinancialPanelHeading}>
          <View style={styles.workspaceFinancialTitleRow}>
            <View style={styles.workspaceFinancialIcon}><Ionicons name="flag-outline" size={15} color={colors.greenDeep} /></View>
            <Text accessibilityRole="header" style={styles.workspaceFinancialTitle}>Savings goals</Text>
          </View>
          <TouchableOpacity accessibilityRole="button" accessibilityLabel="Open savings and account plans" onPress={onOpenPlans} style={styles.workspacePlanLink}>
            <Text style={styles.workspacePlanLinkText}>View plan</Text>
            <Ionicons name="chevron-forward" size={12} color={colors.greenDeep} />
          </TouchableOpacity>
        </View>
        {savingsGoalAccount && savingsGoalPlan ? (
          <View style={styles.workspaceGoalCard}>
            <View style={styles.workspaceGoalTopRow}>
              <View style={styles.workspaceGoalCopy}>
                <Text numberOfLines={1} style={styles.workspaceGoalName}>{savingsGoalAccount.name}</Text>
                <Text style={styles.workspaceGoalDate}>Target {savingsGoalPlan.targetDate}</Text>
              </View>
              <Text style={styles.workspaceGoalPercent}>{goalProgress}%</Text>
            </View>
            <View
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel={`${savingsGoalAccount.name} progress`}
              accessibilityValue={{ min: 0, max: 100, now: goalProgress }}
              style={styles.workspaceGoalTrack}
            >
              <View style={[styles.workspaceGoalFill, { width: `${goalProgress}%` }]} />
            </View>
            <View style={styles.workspaceGoalAmounts}>
              <Text style={styles.workspaceGoalAmount}>{formatColleagueCurrency(savingsGoalPlan.savedAmount)} saved</Text>
              <Text style={styles.workspaceGoalAmount}>{formatColleagueCurrency(savingsGoalPlan.targetAmount)} goal</Text>
            </View>
            <View style={styles.workspaceGoalMonthlyHeading}>
              <View style={styles.workspaceGoalMonthlyCopy}>
                <Text style={styles.workspaceGoalMonthlyLabel}>Saved this month</Text>
                <Text style={styles.workspaceGoalMonthlyValue}>{formatColleagueMonthlySavings(savingsThisMonth)}</Text>
              </View>
              <View style={[styles.workspaceGoalMonthlyCopy, styles.workspaceGoalMonthlyTarget]}>
                <Text style={styles.workspaceGoalMonthlyLabel}>Monthly contribution</Text>
                <Text style={styles.workspaceGoalMonthlyValue}>{formatColleagueCurrency(savingsGoalPlan.monthlyContribution)}</Text>
              </View>
            </View>
            <View
              accessible
              accessibilityRole="progressbar"
              accessibilityLabel="Monthly savings contribution progress"
              accessibilityValue={{ min: 0, max: 100, now: monthlyContributionProgress }}
              style={styles.workspaceGoalMonthlyTrack}
            >
              <View style={[styles.workspaceGoalMonthlyFill, { width: `${monthlyContributionProgress}%` }]} />
            </View>
            <Text style={styles.workspaceGoalMonthlyFootnote}>{monthlyContributionProgress}% of the monthly contribution goal</Text>
          </View>
        ) : (
          <View style={styles.workspaceGoalEmpty}>
            <Ionicons name="flag-outline" size={19} color={colors.textTertiary} />
            <Text style={styles.workspaceGoalEmptyText}>No savings goal is currently tracked for this profile.</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function DesktopCustomerContactPanel({ profile }: { profile: (typeof dashboardProfileOptions)[number] }) {
  const contactMethods = [
    { icon: 'mail-outline', label: 'EMAIL', value: profile.contactEmail },
    { icon: 'call-outline', label: 'PHONE', value: profile.contactPhone },
  ] as const;

  return (
    <View style={styles.workspaceContactPanel} accessibilityLabel={`${profile.name} customer contact information`}>
      <View style={styles.workspaceContactHeading}>
        <View style={styles.workspaceContactHeadingIcon}>
          <Ionicons name="person-circle-outline" size={15} color={colors.greenDeep} />
        </View>
        <Text style={styles.workspaceContactEyebrow}>CUSTOMER CONTACT</Text>
      </View>
      <View style={styles.workspaceContactIdentity}>
        <View style={styles.workspaceContactAvatar}>
          <Text style={styles.workspaceContactInitials}>{profile.initials}</Text>
        </View>
        <View style={styles.workspaceContactIdentityCopy}>
          <Text style={styles.workspaceContactName}>{profile.contactName}</Text>
          <Text style={styles.workspaceContactRelationship}>{profile.relationship} · {profile.detail}</Text>
          <View style={styles.workspaceContactBadge}>
            <Text style={styles.workspaceContactBadgeText}>{profile.badge}</Text>
          </View>
        </View>
      </View>
      <View style={styles.workspaceContactDivider} />
      {contactMethods.map((method) => (
        <View key={method.label} style={styles.workspaceContactMethod}>
          <View style={styles.workspaceContactMethodIcon}>
            <Ionicons name={method.icon} size={14} color={colors.greenDeep} />
          </View>
          <View style={styles.workspaceContactMethodCopy}>
            <Text style={styles.workspaceContactMethodLabel}>{method.label}</Text>
            <Text style={styles.workspaceContactMethodValue}>{method.value}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function DesktopProfileDetails({ profile }: { profile: (typeof dashboardProfileOptions)[number] }) {
  const details = [
    { icon: 'calendar-outline', title: 'Age', detail: profile.ageLabel },
    { icon: 'time-outline', title: 'TD relationship', detail: `${profile.tdRelationshipLength} with TD` },
  ] as const;

  return (
    <View style={styles.workspaceProfileDetailsCard}>
      <View style={styles.workspaceProfileDetailsHeading}>
        <View style={styles.workspaceProfileDetailsHeadingIcon}>
          <Ionicons name="person-circle-outline" size={15} color={colors.greenDeep} />
        </View>
        <Text style={styles.workspaceProfileDetailsEyebrow}>PROFILE DETAILS</Text>
      </View>
      <View style={styles.workspaceProfileDetailsGrid}>
        {details.map((item) => (
          <View key={item.title} style={styles.workspaceProfileDetailItem}>
            <View style={styles.workspaceProfileDetailIcon}>
              <Ionicons name={item.icon} size={14} color={colors.greenDeep} />
            </View>
            <View style={styles.workspaceProfileDetailCopy}>
              <Text style={styles.workspaceProfileDetailLabel}>{item.title}</Text>
              <Text style={styles.workspaceProfileDetailValue}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function DesktopColleagueWorkspace({
  navigation,
  activeTab,
  activeWorkspaceTab,
  onSelectWorkspaceTab,
}: {
  navigation: NavigationProp<ParamListBase>;
  activeTab: string;
  activeWorkspaceTab: WorkspaceTab;
  onSelectWorkspaceTab: (tab: WorkspaceTab) => void;
}) {
  const { activeProfileId, activeProfile, selectProfile } = useDashboardProfile();
  const [journeyOpen, setJourneyOpen] = React.useState(true);
  const [journeyIdVisible, setJourneyIdVisible] = React.useState(false);
  const [lastUpdated, setLastUpdated] = React.useState('just now');
  const screen = desktopScreenContent[activeTab] ?? desktopScreenContent.Home;
  const workspaceSections = {
    Home: { eyebrow: 'STORE OVERVIEW', title: 'Customer onboarding', description: 'Welcome back. Review your active customer journey and continue where you left off.' },
    Customer: { eyebrow: 'CUSTOMER PROFILE', title: 'Customer details', description: 'Review the selected customer and keep their journey moving.' },
    Journey: { eyebrow: 'ONBOARDING JOURNEY', title: 'Journey progress', description: 'Follow the customer experience from identity review through account setup.' },
    'Top tools': { eyebrow: 'QUICK ACCESS', title: 'Top tools', description: 'Open the tools used most often during a customer conversation.' },
  } as const;
  const section = workspaceSections[activeWorkspaceTab];

  return (
    <View style={styles.colleagueWorkspace} accessibilityLabel="Colleague desktop workspace">
      <View style={styles.workspaceHeader}>
        <View style={styles.workspaceBrand}>
          <View style={styles.workspaceBrandMark}><Text style={styles.workspaceBrandText}>TD</Text></View>
          <Text style={styles.workspaceBrandName}>TD Future</Text>
        </View>
        <View style={styles.workspaceHeaderMeta}>
          <Text style={styles.workspaceHeaderGreeting}>Hello, Colleague</Text>
          <View style={styles.workspaceHeaderDivider} />
          <Text style={styles.workspaceHeaderStore}>Store: 0000</Text>
        </View>
      </View>

      <View style={styles.workspaceSubnav} accessibilityLabel="Workspace sections">
        {(['Home', 'Customer', 'Journey', 'Top tools'] as const).map((tab) => {
          const selected = activeWorkspaceTab === tab;
          return (
            <TouchableOpacity
              key={tab}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={`Show ${tab} view on mobile and desktop`}
              onPress={() => onSelectWorkspaceTab(tab)}
              style={[styles.workspaceSubnavButton, selected && styles.workspaceSubnavButtonActive]}
            >
              <Text style={[styles.workspaceSubnavLabel, selected && styles.workspaceSubnavLabelActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.journeyToolbar}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Open active journey"
          disabled={!journeyOpen}
          onPress={() => onSelectWorkspaceTab('Journey')}
          style={styles.journeyStatus}
        >
          <View style={[styles.journeyStatusDot, !journeyOpen && styles.journeyStatusDotClosed]} />
          <Text style={styles.journeyStatusText}>{journeyOpen ? 'Active journey' : 'Journey closed'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Refresh journey view"
          onPress={() => setLastUpdated(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))}
          style={styles.journeyToolbarLink}
        >
          <Ionicons name="refresh-outline" size={15} color={colors.greenDeep} />
          <Text style={styles.journeyToolbarLinkText}>Refresh</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={journeyIdVisible ? 'Hide journey ID' : 'View journey ID'}
          onPress={() => setJourneyIdVisible((visible) => !visible)}
          style={styles.journeyToolbarLink}
        >
          <Ionicons name="document-text-outline" size={15} color={colors.greenDeep} />
          <Text style={styles.journeyToolbarLinkText}>{journeyIdVisible ? 'Hide journey ID' : 'View journey ID'}</Text>
        </TouchableOpacity>
        {journeyIdVisible && <Text style={styles.journeyIdText}>JRN-0000-0001</Text>}
        <Text style={styles.journeyUpdatedText}>Updated {lastUpdated}</Text>
        <View style={styles.journeyToolbarSpacer} />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Close journey"
          accessibilityState={{ disabled: !journeyOpen }}
          disabled={!journeyOpen}
          onPress={() => setJourneyOpen(false)}
          style={[styles.journeyCloseButton, !journeyOpen && styles.journeyCloseButtonDisabled]}
        >
          <Text style={[styles.journeyCloseText, !journeyOpen && styles.journeyCloseTextDisabled]}>{journeyOpen ? 'Close journey' : 'Journey closed'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.desktopWorkspaceBody}>
        <DesktopNavigationMenu navigation={navigation} activeTab={activeTab} />
        <DesktopCustomerContactPanel profile={activeProfile} />
        <View style={styles.workspaceContentArea}>
          <ScrollView
            style={styles.workspaceMain}
            contentContainerStyle={styles.workspaceMainContent}
            showsVerticalScrollIndicator
          >
            <View style={styles.workspaceHeadingRow}>
              <View style={styles.workspaceHeadingCopy}>
                <Text style={styles.workspaceEyebrow}>{section.eyebrow}</Text>
                {activeWorkspaceTab !== 'Customer' && (
                  <>
                    <Text accessibilityRole="header" style={styles.workspaceTitle}>{section.title}</Text>
                    <Text style={styles.workspaceSectionDescription}>{section.description}</Text>
                  </>
                )}
              </View>
              <Ionicons name="ellipsis-horizontal" size={19} color={colors.textSecondary} />
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator
              style={styles.workspaceProfileTabs}
              contentContainerStyle={styles.workspaceProfileTabsContent}
              accessibilityLabel="Customer profile tabs"
            >
              {dashboardProfileOptions.map((profile) => {
                const selected = activeProfileId === profile.id;
                return (
                  <TouchableOpacity
                    key={profile.id}
                    accessibilityRole="tab"
                    accessibilityLabel={`Show ${profile.name} customer profile`}
                    accessibilityState={{ selected }}
                    onPress={() => selectProfile(profile.id)}
                    style={[styles.workspaceProfileTab, selected && styles.workspaceProfileTabSelected]}
                  >
                    <View style={[styles.workspaceProfileTabInitials, selected && styles.workspaceProfileTabInitialsSelected]}>
                      <Text style={[styles.workspaceProfileTabInitialsText, selected && styles.workspaceProfileTabInitialsTextSelected]}>{profile.initials}</Text>
                    </View>
                    <Text numberOfLines={1} style={[styles.workspaceProfileTabText, selected && styles.workspaceProfileTabTextSelected]}>{profile.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            {activeTab !== 'Home' && (
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
            )}
            <ColleagueFinancialDetails profileId={activeProfileId} onOpenPlans={() => navigation.navigate('Insights')} />
            {activeWorkspaceTab === 'Customer' ? (
              <ColleagueHomeDetails
                profileId={activeProfileId}
                onOpenPlans={() => navigation.navigate('Insights')}
                onNavigate={(destination) => navigation.navigate(destination)}
              />
            ) : null}
            <View style={styles.workspaceSummaryRow}>
              <View style={[styles.workspaceContextCard, styles.workspaceContextCardWide]}>
                <View style={styles.workspaceContextHeading}>
                  <View style={styles.workspaceContextIcon}><Ionicons name="sparkles-outline" size={15} color={colors.greenDeep} /></View>
                  <Text style={styles.workspaceContextEyebrow}>SHARED CUSTOMER CONTEXT</Text>
                </View>
                <Text style={styles.workspaceContextTitle}>{activeProfile.need}</Text>
                <Text style={styles.workspaceContextBody}>This profile and selected screen stay in sync with the mobile preview.</Text>
              </View>
            </View>
            <DesktopProfileDetails profile={activeProfile} />
          </ScrollView>
        </View>
      </View>
    </View>
  );
}

export default function TabNavigator() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { authFlowVisible } = useAuth();
  const [activeTab, setActiveTab] = React.useState('Home');
  const [activeWorkspaceTab, setActiveWorkspaceTab] = React.useState<WorkspaceTab>('Customer');
  const workspaceTabNavigation = React.useRef<{ route: string; tab: WorkspaceTab } | null>(null);
  const showDeviceFrame = Platform.OS === 'web' && width >= 650;
  const showOmnichannelView = Platform.OS === 'web' && width >= 900;
  const deviceWidth = showDeviceFrame
    ? showOmnichannelView
      ? Math.min(270, width * 0.28, Math.max(300, height - 120) * 0.46)
      : Math.min(390, width - 32, Math.max(320, height - 104) * 0.47)
    : width;
  const deviceHeight = showDeviceFrame
    ? showOmnichannelView
      ? Math.min(deviceWidth / 0.47, Math.max(320, height - 120))
      : deviceWidth / 0.47
    : height;
  const selectWorkspaceTab = (tab: WorkspaceTab) => {
    const route = workspaceTabRoutes[tab];
    setActiveWorkspaceTab(tab);
    if (route === activeTab) {
      workspaceTabNavigation.current = null;
      return;
    }
    workspaceTabNavigation.current = { route, tab };
    navigation.navigate(route);
  };

  return (
    <View style={[styles.stage, showDeviceFrame && styles.previewStage, showOmnichannelView && styles.desktopWorkspaceStage]}>
      {showDeviceFrame && !showOmnichannelView && (
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
      <View style={showOmnichannelView ? styles.desktopFullPreview : showDeviceFrame ? styles.desktopPreviewBody : styles.mobilePreviewBody}>
      <AccountsProvider>
      {showDeviceFrame && !showOmnichannelView && <DesktopNavigationMenu navigation={navigation} activeTab={activeTab} />}
      <View
        style={[
          styles.device,
          !showDeviceFrame && styles.nativeDevice,
          showDeviceFrame && { flexGrow: 0, flexShrink: 0, flexBasis: deviceWidth, width: deviceWidth, height: deviceHeight },
          showOmnichannelView && styles.omnichannelDevice,
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
                  backBehavior="history"
                  screenListeners={({ route }) => ({
                    focus: () => {
                      const pendingWorkspaceTab = workspaceTabNavigation.current;
                      if (pendingWorkspaceTab?.route === route.name) {
                        setActiveWorkspaceTab(pendingWorkspaceTab.tab);
                        workspaceTabNavigation.current = null;
                      } else {
                        workspaceTabNavigation.current = null;
                        if (activeTab !== route.name) {
                          const matchingWorkspaceTab = mobileRouteWorkspaceTabs[route.name];
                          if (matchingWorkspaceTab) setActiveWorkspaceTab(matchingWorkspaceTab);
                        }
                      }
                      setActiveTab(route.name);
                    },
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
      {showOmnichannelView ? (
        <View style={styles.desktopMonitorAssembly} accessibilityLabel="Desktop monitor">
          <View style={styles.desktopMonitorFrame}>
            <View style={styles.desktopMonitorScreen}>
              <DesktopColleagueWorkspace
                navigation={navigation}
                activeTab={activeTab}
                activeWorkspaceTab={activeWorkspaceTab}
                onSelectWorkspaceTab={selectWorkspaceTab}
              />
            </View>
          </View>
          <View style={styles.desktopMonitorStand} />
          <View style={styles.desktopMonitorBase} />
        </View>
      ) : null}
      </AccountsProvider>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { flex: 1, backgroundColor: frameColors.screen },
  previewStage: { flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 12, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: frameColors.stage },
  desktopWorkspaceStage: { paddingHorizontal: 0, paddingVertical: 0, gap: 0, alignItems: 'stretch', backgroundColor: colors.bg },
  desktopPageHeader: { width: '100%', maxWidth: 1180, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 4 },
  desktopPageHeaderAccent: { width: 4, height: 34, borderRadius: 2, backgroundColor: colors.green },
  desktopPageHeaderCopy: { flex: 1, gap: 2 },
  desktopPageHeaderTitle: { flexShrink: 1, color: colors.text, fontSize: 18, lineHeight: 22, fontFamily: font.headline.bold },
  desktopPageHeaderTagline: { color: colors.textSecondary, fontSize: 12, lineHeight: 16, fontFamily: font.body.medium },
  desktopPreviewBody: { flex: 1, width: '100%', minHeight: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18 },
  desktopFullPreview: { flex: 1, width: '100%', minHeight: 0, flexDirection: 'row', alignItems: 'stretch', justifyContent: 'flex-start' },
  mobilePreviewBody: { flex: 1 },
  omnichannelDevice: { alignSelf: 'center' },
  desktopMenu: { width: 56, alignSelf: 'stretch', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 6, borderRadius: 14, borderWidth: 1, borderColor: colors.borderFaint, backgroundColor: frameColors.white, gap: 5 },
  desktopMonitorAssembly: { flex: 1, minWidth: 0, minHeight: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  desktopMonitorFrame: { width: '100%', aspectRatio: 16 / 10, maxHeight: '100%', minWidth: 0, minHeight: 0, padding: 7, borderRadius: 18, borderWidth: 1, borderColor: colors.textTertiary, backgroundColor: frameColors.bezel },
  desktopMonitorScreen: { flex: 1, minWidth: 0, minHeight: 0, overflow: 'hidden', borderRadius: 10, backgroundColor: frameColors.white },
  desktopMonitorStand: { width: 56, height: 24, backgroundColor: frameColors.bezel },
  desktopMonitorBase: { width: 142, height: 8, borderRadius: radius.full, backgroundColor: frameColors.bezel },
  desktopWorkspaceBody: { flex: 1, minHeight: 0, flexDirection: 'row', gap: 10, padding: 12, backgroundColor: colors.bg },
  workspaceContactPanel: { width: 200, flexShrink: 0, alignSelf: 'stretch', padding: 12, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: frameColors.white, gap: 12 },
  workspaceContactHeading: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  workspaceContactHeadingIcon: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenDim },
  workspaceContactEyebrow: { color: colors.greenDeep, fontSize: 8, lineHeight: 11, fontFamily: font.body.bold, letterSpacing: 0.5 },
  workspaceContactIdentity: { flexDirection: 'column', alignItems: 'flex-start', gap: 9 },
  workspaceContactAvatar: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenDim },
  workspaceContactInitials: { color: colors.greenDeep, fontSize: 11, fontFamily: font.body.bold },
  workspaceContactIdentityCopy: { alignSelf: 'stretch', minWidth: 0, gap: 4 },
  workspaceContactName: { color: colors.text, fontSize: 13, lineHeight: 17, fontFamily: font.headline.bold },
  workspaceContactRelationship: { color: colors.textSecondary, fontSize: 9, lineHeight: 13 },
  workspaceContactBadge: { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 4, borderRadius: radius.full, backgroundColor: colors.greenDim },
  workspaceContactBadgeText: { color: colors.greenDeep, fontSize: 8, lineHeight: 10, fontFamily: font.body.bold },
  workspaceContactDivider: { height: 1, backgroundColor: colors.borderFaint },
  workspaceContactMethod: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  workspaceContactMethodIcon: { width: 25, height: 25, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMid },
  workspaceContactMethodCopy: { flex: 1, minWidth: 0, gap: 3 },
  workspaceContactMethodLabel: { color: colors.textTertiary, fontSize: 7, lineHeight: 10, fontFamily: font.body.bold, letterSpacing: 0.4 },
  workspaceContactMethodValue: { color: colors.text, fontSize: 9, lineHeight: 13, fontFamily: font.body.medium },
  workspaceContentArea: { flex: 1, minWidth: 0, borderRadius: 14, backgroundColor: frameColors.white, overflow: 'hidden' },
  workspaceHeader: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, backgroundColor: frameColors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  workspaceHeaderMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  workspaceHeaderGreeting: { color: colors.text, fontSize: 13, fontFamily: font.body.medium },
  workspaceHeaderDivider: { width: 1, height: 19, backgroundColor: colors.border },
  workspaceHeaderStore: { color: colors.textSecondary, fontSize: 12, fontFamily: font.body.medium },
  workspaceSubnav: { minHeight: 46, flexDirection: 'row', alignItems: 'stretch', gap: 24, paddingHorizontal: 24, backgroundColor: frameColors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  workspaceSubnavButton: { minWidth: 66, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  workspaceSubnavButtonActive: { borderBottomColor: colors.greenDeep },
  workspaceSubnavLabel: { color: colors.textSecondary, fontSize: 12, fontFamily: font.body.medium },
  workspaceSubnavLabelActive: { color: colors.greenDeep, fontFamily: font.body.bold },
  journeyToolbar: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 18, paddingHorizontal: 24, backgroundColor: frameColors.white, borderBottomWidth: 1, borderBottomColor: colors.border },
  journeyStatus: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7 },
  journeyStatusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.greenDeep },
  journeyStatusDotClosed: { backgroundColor: colors.textTertiary },
  journeyStatusText: { color: colors.text, fontSize: 12, fontFamily: font.body.bold },
  journeyToolbarLink: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 44, paddingHorizontal: 4 },
  journeyToolbarLinkText: { color: colors.greenDeep, fontSize: 11, fontFamily: font.body.medium },
  journeyUpdatedText: { color: colors.textTertiary, fontSize: 10 },
  journeyIdText: { color: colors.textSecondary, fontSize: 10, fontFamily: font.body.medium },
  journeyToolbarSpacer: { flex: 1 },
  journeyCloseButton: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 13, borderRadius: radius.md, backgroundColor: colors.greenDeep },
  journeyCloseButtonDisabled: { backgroundColor: colors.surfaceMid },
  journeyCloseText: { color: colors.white, fontSize: 11, fontFamily: font.body.bold },
  journeyCloseTextDisabled: { color: colors.textSecondary },
  workspaceProfileTabs: { flexGrow: 0, flexShrink: 0, height: 51 },
  workspaceProfileTabsContent: { minWidth: '100%', flexDirection: 'row', alignItems: 'stretch', borderBottomWidth: 1, borderBottomColor: colors.border },
  workspaceProfileTab: { width: 92, minWidth: 92, flexGrow: 0, flexShrink: 0, minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingHorizontal: 7, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  workspaceProfileTabSelected: { borderBottomColor: colors.greenDeep },
  workspaceProfileTabInitials: { width: 25, height: 25, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMid },
  workspaceProfileTabInitialsSelected: { backgroundColor: colors.greenDim },
  workspaceProfileTabInitialsText: { color: colors.textSecondary, fontSize: 8, fontFamily: font.body.bold },
  workspaceProfileTabInitialsTextSelected: { color: colors.greenDeep },
  workspaceProfileTabText: { color: colors.textSecondary, fontSize: 10, fontFamily: font.body.medium },
  workspaceProfileTabTextSelected: { color: colors.greenDeep, fontFamily: font.body.bold },
  desktopMenuButton: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 11 },
  desktopMenuButtonActive: { backgroundColor: colors.greenDim },
  desktopMenuIcon: { width: 30, height: 30, borderRadius: 9, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  desktopMenuIconActive: { backgroundColor: colors.greenDeep },
  colleagueWorkspace: { flex: 1, width: '100%', minWidth: 0, backgroundColor: frameColors.white, overflow: 'hidden' },
  workspaceBrand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  workspaceBrandMark: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenDeep },
  workspaceBrandText: { color: colors.white, fontSize: 13, fontFamily: font.body.bold },
  workspaceBrandName: { color: colors.text, fontSize: 15, fontFamily: font.headline.bold },
  workspacePreviewBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 7, paddingVertical: 4, borderRadius: radius.full, backgroundColor: colors.greenDim },
  workspacePreviewDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.greenDeep },
  workspacePreviewText: { color: colors.greenDeep, fontSize: 8, fontFamily: font.body.bold, letterSpacing: 0.4 },
  workspaceMain: { flex: 1, minWidth: 0 },
  workspaceMainContent: { padding: 18, gap: 12 },
  workspaceHeadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  workspaceHeadingCopy: { flex: 1, gap: 2 },
  workspaceSectionDescription: { color: colors.textSecondary, fontSize: 11, lineHeight: 16, marginTop: 2 },
  workspaceSummaryRow: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
  workspaceFinancialRow: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
  workspaceFinancialPanel: { flex: 1, minWidth: 0, padding: 10, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 8 },
  workspaceFinancialPanelHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  workspaceFinancialTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, minWidth: 0 },
  workspaceFinancialIcon: { width: 25, height: 25, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenDim },
  workspaceFinancialTitle: { color: colors.text, fontSize: 12, lineHeight: 16, fontFamily: font.headline.bold },
  workspaceFinancialMeta: { color: colors.textSecondary, fontSize: 8, fontFamily: font.body.medium },
  workspaceBalanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5, paddingVertical: 3 },
  workspaceBalanceLabel: { color: colors.textSecondary, fontSize: 9, lineHeight: 12 },
  workspaceBalanceAmount: { color: colors.text, fontSize: 10, lineHeight: 13, fontFamily: font.body.bold },
  workspaceFinancialAccountList: { gap: 0 },
  workspaceFinancialAccount: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 7 },
  workspaceFinancialAccountDivider: { borderBottomWidth: 1, borderBottomColor: colors.borderFaint },
  workspaceFinancialAccountIcon: { width: 23, height: 23, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  workspaceFinancialAccountCopy: { flex: 1, minWidth: 0, gap: 2 },
  workspaceFinancialAccountName: { color: colors.text, fontSize: 10, lineHeight: 13, fontFamily: font.body.bold },
  workspaceFinancialAccountDetail: { color: colors.textSecondary, fontSize: 9, lineHeight: 12 },
  workspaceFinancialAccountNote: { color: colors.greenDeep, fontSize: 9, lineHeight: 12, fontFamily: font.body.medium },
  workspaceFinancialAccountValues: { maxWidth: 92, alignItems: 'flex-end', gap: 1 },
  workspaceFinancialAccountLabel: { color: colors.textTertiary, fontSize: 8, lineHeight: 10, textAlign: 'right' },
  workspaceFinancialAccountAmount: { color: colors.text, fontSize: 10, lineHeight: 13, fontFamily: font.body.bold, textAlign: 'right' },
  workspacePlanLink: { minHeight: 30, flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 2 },
  workspacePlanLinkText: { color: colors.greenDeep, fontSize: 8, fontFamily: font.body.bold },
  workspaceGoalCard: { flex: 1, justifyContent: 'center', gap: 9, padding: 10, borderRadius: 11, backgroundColor: colors.greenDim },
  workspaceGoalTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 5 },
  workspaceGoalCopy: { flex: 1, minWidth: 0, gap: 2 },
  workspaceGoalName: { color: colors.text, fontSize: 9, lineHeight: 12, fontFamily: font.body.bold },
  workspaceGoalDate: { color: colors.textSecondary, fontSize: 7, lineHeight: 10 },
  workspaceGoalPercent: { color: colors.greenDeep, fontSize: 12, lineHeight: 16, fontFamily: font.headline.bold },
  workspaceGoalTrack: { height: 6, borderRadius: 3, backgroundColor: colors.white, overflow: 'hidden' },
  workspaceGoalFill: { height: '100%', borderRadius: 3, backgroundColor: colors.greenDeep },
  workspaceGoalAmounts: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 4 },
  workspaceGoalAmount: { color: colors.textSecondary, fontSize: 9, lineHeight: 12 },
  workspaceGoalMonthlyHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.border },
  workspaceGoalMonthlyCopy: { flex: 1, gap: 2 },
  workspaceGoalMonthlyTarget: { alignItems: 'flex-end' },
  workspaceGoalMonthlyLabel: { color: colors.textSecondary, fontSize: 9, lineHeight: 12 },
  workspaceGoalMonthlyValue: { color: colors.text, fontSize: 10, lineHeight: 13, fontFamily: font.body.bold },
  workspaceGoalMonthlyTrack: { height: 5, borderRadius: 3, backgroundColor: colors.white, overflow: 'hidden' },
  workspaceGoalMonthlyFill: { height: '100%', borderRadius: 3, backgroundColor: colors.greenDeep },
  workspaceGoalMonthlyFootnote: { color: colors.textSecondary, fontSize: 9, lineHeight: 12 },
  workspaceGoalEmpty: { flex: 1, minHeight: 100, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 12, borderRadius: 11, backgroundColor: colors.surfaceMid },
  workspaceGoalEmptyText: { maxWidth: 190, color: colors.textSecondary, fontSize: 8, lineHeight: 12, textAlign: 'center' },
  workspaceContextCardWide: { flex: 1, minWidth: 0, justifyContent: 'center' },
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
  workspaceProfileDetailsCard: { padding: 11, borderRadius: 13, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 9 },
  workspaceProfileDetailsHeading: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  workspaceProfileDetailsHeadingIcon: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenDim },
  workspaceProfileDetailsEyebrow: { color: colors.greenDeep, fontSize: 8, lineHeight: 11, fontFamily: font.body.bold, letterSpacing: 0.5 },
  workspaceProfileDetailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  workspaceProfileDetailItem: { flexGrow: 1, flexBasis: '42%', minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 10, backgroundColor: colors.surfaceMid },
  workspaceProfileDetailIcon: { width: 24, height: 24, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white },
  workspaceProfileDetailCopy: { flex: 1, minWidth: 0, gap: 2 },
  workspaceProfileDetailLabel: { color: colors.textSecondary, fontSize: 7, lineHeight: 10, fontFamily: font.body.bold },
  workspaceProfileDetailValue: { color: colors.text, fontSize: 9, lineHeight: 12, fontFamily: font.body.medium },
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
