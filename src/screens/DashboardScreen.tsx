import React, { useState } from 'react';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import {
  Image,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font } from '../theme';
import CreditAndBillsSection from '../components/CreditAndBillsSection';
import { useAccounts } from '../accounts';
import type { Account } from '../accounts';
import { upcomingBillPayments } from '../financeData';

const palette = {
  background: colors.bg,
  surface: colors.surface,
  ink: colors.text,
  green: colors.green,
  greenDeep: colors.greenDeep,
};

const recentTransactions = [
  {
    id: 'market',
    merchant: 'Greenway Market',
    category: 'Groceries · TD Debit',
    time: 'Today, 10:42 AM',
    amount: '−$42.18',
    logo: { mark: 'GW', background: colors.greenDim, foreground: colors.greenDeep },
  },
  {
    id: 'transit',
    merchant: 'City Transit',
    category: 'Transportation · TD Debit',
    time: 'Today, 8:15 AM',
    amount: '−$2.90',
    logo: { mark: 'CT', background: colors.blueDim, foreground: colors.teal },
  },
  {
    id: 'payroll',
    merchant: 'Payroll deposit',
    category: 'Income · Checking',
    time: 'Yesterday, 9:05 AM',
    amount: '+$2,450.00',
    logo: { mark: 'PAY', background: colors.greenDim, foreground: colors.greenDeep },
  },
] as const;

type AccountView = 'personal' | 'family' | 'business';
type DashboardAccount = Omit<Account, 'id'> & { id: string };
type DashboardTransaction = {
  id: string;
  merchant: string;
  category: string;
  time: string;
  amount: string;
  logo: { mark: string; background: string; foreground: string };
};

function parseDashboardAmount(value: string) {
  const parsed = Number(value.replace(/[^0-9.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDashboardCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}

const businessAccounts: DashboardAccount[] = [
  {
    id: 'business-checking',
    name: 'TD Small Business Checking',
    productLabel: 'Small business checking',
    detail: '•••• 6032',
    amount: '$17,384.22',
    amountLabel: 'Available balance',
    note: 'Operating account',
    swatch: colors.green,
    plan: null,
  },
  {
    id: 'business-savings',
    name: 'TD Business Savings',
    productLabel: 'Business savings',
    detail: '•••• 1186 · 2.50% APY',
    amount: '$32,100.00',
    amountLabel: 'Current balance',
    note: 'Tax reserve',
    swatch: colors.green,
    plan: null,
  },
  {
    id: 'business-card',
    name: 'TD Business Credit Card',
    productLabel: 'Business credit card',
    detail: '$8,520.00 available',
    amount: '−$842.60',
    amountLabel: 'Current balance',
    note: '12,480 TD Points',
    swatch: colors.text,
    plan: null,
  },
];

const businessTransactions: DashboardTransaction[] = [
  { id: 'payout', merchant: 'Card sales payout', category: 'Sales · Checking', time: 'Today, 8:42 AM', amount: '+$3,842.50', logo: { mark: 'CS', background: colors.greenDim, foreground: colors.greenDeep } },
  { id: 'supplies', merchant: 'Office supplies', category: 'Supplies · Business card', time: 'Yesterday, 2:10 PM', amount: '−$246.18', logo: { mark: 'OS', background: colors.orangeDim, foreground: colors.orange } },
  { id: 'software', merchant: 'Business software', category: 'Software · Business card', time: 'Nov 18, 10:15 AM', amount: '−$59.99', logo: { mark: 'BS', background: colors.purpleDim, foreground: colors.purple } },
];

const familyAccounts: DashboardAccount[] = [
  { id: 'family-checking', name: 'Shared household', productLabel: 'Family checking', detail: '•••• 2846', amount: '$12,480.30', amountLabel: 'Available balance', note: 'Shared household spending', swatch: colors.green, plan: null },
  { id: 'family-savings', name: 'Family goals', productLabel: 'Family savings', detail: '•••• 7451 · 4.25% APY', amount: '$41,500.00', amountLabel: 'Current balance', note: 'Home and travel goals', swatch: colors.green, plan: null },
  { id: 'family-card', name: 'Household rewards', productLabel: 'Family credit card', detail: '$9,850.00 available', amount: '−$628.45', amountLabel: 'Current balance', note: 'Shared purchases', swatch: colors.text, plan: null },
  { id: 'family-husband-checking', name: 'Husband’s checking', productLabel: 'Personal checking', detail: '•••• 6318', amount: '$5,240.15', amountLabel: 'Available balance', note: 'Personal spending', swatch: colors.green, plan: null },
  { id: 'family-child-one-savings', name: 'Child 1’s savings', productLabel: 'Youth savings', detail: '•••• 3920 · 4.25% APY', amount: '$1,250.00', amountLabel: 'Current balance', note: 'Education savings', swatch: colors.green, plan: null },
  { id: 'family-child-two-savings', name: 'Child 2’s savings', productLabel: 'Youth savings', detail: '•••• 7143 · 4.25% APY', amount: '$980.00', amountLabel: 'Current balance', note: 'Education savings', swatch: colors.green, plan: null },
];

const familyTransactions: DashboardTransaction[] = [
  { id: 'family-groceries', merchant: 'Greenway Market', category: 'Groceries · Shared checking', time: 'Today, 10:42 AM', amount: '−$126.40', logo: { mark: 'GW', background: colors.greenDim, foreground: colors.greenDeep } },
  { id: 'family-utilities', merchant: 'City utilities', category: 'Home · Household account', time: 'Yesterday, 4:20 PM', amount: '−$184.00', logo: { mark: 'CU', background: colors.yellowDim, foreground: colors.text } },
  { id: 'family-transfer', merchant: 'Monthly contribution', category: 'Savings · Family goals', time: 'Nov 18, 9:00 AM', amount: '+$450.00', logo: { mark: 'FG', background: colors.greenDim, foreground: colors.greenDeep } },
];

function AccountRow({ account, last, compact }: { account: DashboardAccount; last: boolean; compact: boolean }) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const accessibilityLabel = `${account.name}, ${account.amount}. ${account.detail}${account.note ? `. ${account.note}` : ''}`;
  const rowStyle = [styles.accountRow, compact && styles.accountRowCompact, !last && styles.accountDivider];
  const isBusinessAccount = account.id.startsWith('business-');
  const isFamilyAccount = account.id.startsWith('family-');
  const isStaticAccount = isBusinessAccount || isFamilyAccount;
  const isCreditAccount = account.id.endsWith('card');
  const content = (
    <>
      <View style={[styles.accountMark, compact && styles.accountMarkCompact, { backgroundColor: account.swatch }]}>
        <View style={styles.accountMarkLine} />
      </View>
      <View style={styles.accountCopy}>
        <Text numberOfLines={1} style={[styles.accountName, compact && styles.accountNameCompact]}>{account.name}</Text>
        <Text numberOfLines={1} style={[styles.accountDetail, compact && styles.accountDetailCompact]}>{account.detail}</Text>
        {account.note ? <Text numberOfLines={1} style={[styles.accountNote, compact && styles.accountNoteCompact]}>{account.note}</Text> : null}
      </View>
      <Text numberOfLines={1} style={[styles.accountAmount, compact && styles.accountAmountCompact]}>{account.amount}</Text>
      {!isStaticAccount ? <Ionicons name="chevron-forward" size={15} color={colors.textSecondary} /> : null}
    </>
  );

  if (isStaticAccount) {
    return <View accessible accessibilityRole="text" accessibilityLabel={accessibilityLabel} style={rowStyle}>{content}</View>;
  }

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Opens account servicing details"
      onPress={() => isCreditAccount
        ? navigation.navigate('Card Manager')
        : navigation.navigate('Account servicing', { accountId: account.id })}
      style={rowStyle}
    >
      {content}
    </TouchableOpacity>
  );
}

function RecentTransactionRow({ transaction, compact, last }: {
  transaction: DashboardTransaction;
  compact: boolean;
  last: boolean;
}) {
  const isCredit = transaction.amount.startsWith('+');

  return (
    <View
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${transaction.merchant}, ${transaction.category}, ${transaction.time}, ${transaction.amount}`}
      style={[styles.transactionRow, compact && styles.transactionRowCompact, !last && styles.transactionDivider]}
    >
      <View style={[styles.transactionIcon, { backgroundColor: transaction.logo.background }]} accessible={false}>
        <Text style={[styles.transactionLogo, { color: transaction.logo.foreground }]}>{transaction.logo.mark}</Text>
      </View>
      <View style={styles.transactionCopy}>
        <Text numberOfLines={1} style={styles.transactionMerchant}>{transaction.merchant}</Text>
        <Text numberOfLines={1} style={styles.transactionMeta}>{transaction.category} · {transaction.time}</Text>
      </View>
      <Text style={[styles.transactionAmount, isCredit && styles.transactionAmountCredit]}>{transaction.amount}</Text>
    </View>
  );
}

function RecentTransactionsSection({ compact, view }: { compact: boolean; view: AccountView }) {
  const transactions = view === 'business'
    ? businessTransactions
    : view === 'family'
      ? familyTransactions
      : recentTransactions;

  return (
    <View style={[styles.recentTransactionsCard, compact && styles.recentTransactionsCardCompact]}>
      <View style={styles.recentTransactionsHeading}>
        <Text accessibilityRole="header" style={styles.recentTransactionsTitle}>
          {view === 'business' ? 'Recent business activity' : view === 'family' ? 'Recent family activity' : 'Recent transactions'}
        </Text>
        <Text style={styles.recentTransactionsSubtitle}>Latest activity</Text>
      </View>
      {transactions.map((transaction, index) => (
        <RecentTransactionRow
          key={transaction.id}
          transaction={transaction}
          compact={compact}
          last={index === transactions.length - 1}
        />
      ))}
    </View>
  );
}

function FinancialHealthCard({ compact, view }: { compact: boolean; view: AccountView }) {
  const [accountsExpanded, setAccountsExpanded] = useState(false);
  const { accounts } = useAccounts();
  const isBusiness = view === 'business';
  const isFamily = view === 'family';
  const visibleAccounts: DashboardAccount[] = isBusiness
    ? businessAccounts
    : isFamily
      ? familyAccounts
      : accounts;
  const creditAccount = visibleAccounts.find((account) => account.id.endsWith('card'));
  const checkingAccount = visibleAccounts.find((account) => account.id.endsWith('checking'));
  const savingsGoal = view === 'personal' ? accounts.find((account) => account.id === 'savings')?.plan : null;
  const creditBalance = Math.abs(parseDashboardAmount(creditAccount?.amount ?? '0'));
  const depositBalance = visibleAccounts
    .filter((account) => !account.id.endsWith('card'))
    .reduce((total, account) => total + parseDashboardAmount(account.amount), 0);
  const plannedGoalContribution = savingsGoal?.kind === 'savings-goal' ? savingsGoal.monthlyContribution : isFamily ? 450 : 0;
  const upcomingBillsTotal = isBusiness
    ? 0
    : upcomingBillPayments.reduce((total, bill) => total + parseDashboardAmount(bill.amount), 0);
  const netBalance = depositBalance - creditBalance;
  const availableAmount = Math.max(0, parseDashboardAmount(checkingAccount?.amount ?? '0') - creditBalance - plannedGoalContribution - upcomingBillsTotal);
  const score = isBusiness ? 76 : isFamily ? 79 : 82;
  const viewLabel = isBusiness ? 'Business' : isFamily ? 'Family' : 'Your Financial Snapshot';
  const accountLabel = isBusiness ? 'Business accounts' : isFamily ? 'Family accounts' : 'Personal accounts';

  return (
    <View style={[styles.financialHealthCard, compact && styles.financialHealthCardCompact]}>
      <View style={styles.healthSummary}>
        <View style={styles.healthHeader}>
          <Text numberOfLines={1} style={[styles.healthTitle, compact && styles.healthTitleCompact]}>
            {isBusiness ? 'Business overview' : isFamily ? 'Family finances' : 'Your Financial Snapshot'}
          </Text>
        </View>
        <View style={styles.healthMeterRow}>
          <View accessibilityLabel={`${viewLabel} score: ${score} percent`} style={styles.healthMeterTrack}>
            <View style={[styles.healthMeterFill, { width: `${score}%` }]} />
          </View>
          <Text accessibilityLabel={`${viewLabel} score ${score} out of 100`} style={[styles.healthScore, compact && styles.healthScoreCompact]}>
            {score}<Text style={styles.healthScoreScale}> / 100</Text>
          </Text>
        </View>
      </View>
      <View style={styles.totalBalanceRow}>
        <View style={styles.totalBalanceCopy}>
          <Text style={styles.totalBalanceLabel}>NET AFTER CREDIT</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.totalBalanceValue, compact && styles.totalBalanceValueCompact]}>
            {formatDashboardCurrency(netBalance)}
          </Text>
        </View>
        <View style={styles.totalBalanceIcon}>
          <Ionicons name={isBusiness ? 'briefcase-outline' : 'wallet-outline'} size={20} color={colors.greenDeep} />
        </View>
      </View>
      <View style={[styles.healthMetrics, compact && styles.healthMetricsCompact]}>
        <View style={styles.healthMetricTile}>
          <Text numberOfLines={compact ? 2 : 1} style={[styles.healthMetricLabel, compact && styles.healthMetricLabelCompact]}>{isBusiness ? 'CASH AFTER CARD' : 'LEFT BEFORE PAYDAY'}</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.healthMetricValue, compact && styles.healthMetricValueCompact]}>
            {formatDashboardCurrency(availableAmount)}
          </Text>
        </View>
        <View style={styles.healthMetricTile}>
          <Text numberOfLines={compact ? 2 : 1} style={[styles.healthMetricLabel, compact && styles.healthMetricLabelCompact]}>SAVED THIS MONTH</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.healthMetricValue, compact && styles.healthMetricValueCompact]}>
            {isBusiness ? '+$1,200' : isFamily ? '+$450' : '+$240'}
          </Text>
        </View>
      </View>
      <View style={styles.healthDivider} />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${accountLabel}, ${visibleAccounts.length} linked`}
        accessibilityHint={accountsExpanded ? 'Hides your linked accounts' : 'Shows your linked accounts'}
        accessibilityState={{ expanded: accountsExpanded }}
        onPress={() => setAccountsExpanded((expanded) => !expanded)}
        style={styles.accountSectionHeader}
      >
        <View style={styles.accountSectionCopy}>
          <Text style={styles.accountSectionTitle}>{accountLabel}</Text>
          <Text style={styles.linkedAccountCount}>{visibleAccounts.length} linked</Text>
        </View>
        <Ionicons name={accountsExpanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
      </TouchableOpacity>
      {accountsExpanded ? (
        <View style={styles.accountList}>
          {visibleAccounts.map((account, index) => (
            <AccountRow key={account.id} account={account} last={index === visibleAccounts.length - 1} compact={compact} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function DashboardProfileMenu({ view, onChange, compact }: {
  view: AccountView;
  onChange: (view: AccountView) => void;
  compact: boolean;
}) {
  const options = [
    { id: 'personal' as const, label: 'Ava', detail: 'Personal banking', icon: 'person-outline' as const },
    { id: 'family' as const, label: 'Family', detail: 'Shared household finances', icon: 'people-outline' as const },
    { id: 'business' as const, label: 'Small business', detail: 'Ava’s business banking', icon: 'briefcase-outline' as const },
  ];

  return (
    <View accessibilityRole="menu" accessibilityLabel="Choose a banking profile" style={[styles.profileMenu, compact && styles.profileMenuCompact]}>
      {options.map((option) => {
        const selected = view === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            accessibilityRole="menuitem"
            accessibilityLabel={`${option.label}${selected ? ', selected' : ''}`}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id)}
            style={styles.profileMenuOption}
          >
            <View style={[styles.profileMenuIcon, selected && styles.profileMenuIconSelected]}>
              <Ionicons name={option.icon} size={16} color={selected ? colors.greenDeep : colors.textSecondary} />
            </View>
            <View style={styles.profileMenuCopy}>
              <Text style={[styles.profileMenuTitle, selected && styles.profileMenuTitleSelected]}>{option.label}</Text>
              <Text style={styles.profileMenuDetail}>{option.detail}</Text>
            </View>
            {selected ? <Ionicons name="checkmark-circle" size={18} color={colors.greenDeep} /> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { width, height } = useWindowDimensions();
  const previewDeviceWidth = Platform.OS === 'web' && width >= 650
    ? Math.min(390, width - 32, (height - 32) * 0.47)
    : width;
  const compact = previewDeviceWidth < 360;
  const [accountView, setAccountView] = useState<AccountView>('personal');
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const previewTopInset = Platform.OS === 'web' ? (width < 650 ? 24 : 48) : insets.top;
  const heroGradientColors = accountView === 'business'
    ? ['rgba(7,20,33,0.78)', 'rgba(7,20,33,0.5)', 'rgba(7,20,33,0.2)', 'rgba(246,247,244,0.82)']
    : accountView === 'personal'
      ? ['rgba(10,54,30,0.68)', 'rgba(10,54,30,0.42)', 'rgba(10,54,30,0.2)', 'rgba(246,247,244,0.82)']
      : ['rgba(35,139,20,0.72)', 'rgba(35,139,20,0.46)', 'rgba(35,139,20,0.28)', 'rgba(246,247,244,0.82)'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 78 }}
      >
        <View style={[styles.hero, compact && styles.heroCompact]}>
          <Image
            source={accountView === 'business'
              ? require('../../assets/nyc-skyline.png')
              : accountView === 'family'
                ? require('../../assets/td-family-hero.png')
                : require('../../assets/td-human-banking-hero.png')}
            resizeMode="cover"
            style={[StyleSheet.absoluteFill, styles.heroImage]}
            accessible={false}
          />
          <LinearGradient
            colors={heroGradientColors}
            locations={[0, 0.44, 0.72, 1]}
            style={[StyleSheet.absoluteFill, styles.heroGradient]}
          />
          <View style={[styles.heroForeground, compact && styles.heroForegroundCompact, { paddingTop: previewTopInset + (compact ? 2 : 8) }]}>
            <View style={[styles.topBar, compact && styles.topBarCompact]}>
              <View style={[styles.identity, compact && styles.identityCompact]}>
                <View>
                  <Text style={[styles.greeting, compact && styles.greetingCompact]}>Good afternoon,</Text>
                  <View style={[styles.profileHeaderRow, compact && styles.profileHeaderRowCompact]}>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Open Ava’s account settings"
                      accessibilityHint="Opens account settings"
                      onPress={() => navigation.navigate('Account settings')}
                      style={styles.avatarSettingsButton}
                    >
                      <Image
                        source={require('../../assets/maya-avatar.png')}
                        style={[styles.customerAvatar, compact && styles.customerAvatarCompact]}
                        resizeMode="cover"
                        accessible={false}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel={`Ava, ${accountView} view`}
                      accessibilityHint={profileMenuOpen ? 'Closes banking views' : 'Opens banking views'}
                      accessibilityState={{ expanded: profileMenuOpen }}
                      onPress={() => setProfileMenuOpen((open) => !open)}
                      style={styles.customerProfileButton}
                    >
                      <Text style={[styles.customerName, compact && styles.customerNameCompact]}>Ava</Text>
                      <Ionicons name={profileMenuOpen ? 'chevron-up' : 'chevron-down'} size={15} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="TD Select relationship tier. View benefits"
                      accessibilityHint="Opens your TD relationship benefits"
                      hitSlop={8}
                      onPress={() => navigation.navigate('Benefits')}
                      style={[styles.relationshipBadge, compact && styles.relationshipBadgeCompact]}
                    >
                      <Ionicons name="ribbon-outline" size={compact ? 11 : 12} color={colors.white} />
                      <Text style={[styles.relationshipText, compact && styles.relationshipTextCompact]}>TD Select</Text>
                      <Ionicons name="chevron-forward" size={9} color={colors.white} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            <View style={[styles.topActions, compact && styles.topActionsCompact]}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Notifications, 3 unread"
                accessibilityHint="Opens recent alerts and account activity"
                onPress={() => navigation.navigate('Notifications')}
                style={[styles.notificationButton, compact && styles.notificationButtonCompact]}
              >
                <Ionicons name="notifications-outline" size={compact ? 18 : 22} color={colors.white} />
                <View style={styles.notificationCount}><Text style={styles.notificationCountText}>3</Text></View>
              </TouchableOpacity>
            </View>
          </View>
          {profileMenuOpen ? (
            <DashboardProfileMenu
              view={accountView}
              onChange={(view) => {
                setAccountView(view);
                setProfileMenuOpen(false);
              }}
              compact={compact}
            />
          ) : null}
          </View>
        </View>

        <FinancialHealthCard compact={compact} view={accountView} />
        {accountView === 'family' ? <CreditAndBillsSection compact={compact} /> : null}
        <RecentTransactionsSection compact={compact} view={accountView} />

        <View style={[styles.content, compact && styles.contentCompact]}>
          <View style={styles.offersHeading}>
            <View style={styles.offersTitleGroup}>
              <View style={styles.smallTdLogo}><Text style={styles.smallTdLogoText}>TD</Text></View>
              <Text style={styles.offersTitle}>{accountView === 'business' ? 'TD for your business' : accountView === 'family' ? 'TD for your family' : 'TD for you'}</Text>
            </View>
            <Text style={styles.offerCount}>3 offers · swipe</Text>
          </View>
          <TouchableOpacity accessibilityRole="button" style={styles.offerCard}>
            <View style={styles.offerIcon}><Ionicons name="leaf-outline" size={22} color={palette.green} /></View>
            <View style={styles.offerCopy}>
              <Text style={styles.offerEyebrow}>{accountView === 'business' ? 'BUSINESS BANKING' : accountView === 'family' ? 'FAMILY BANKING' : 'MADE FOR AVA'}</Text>
              <Text style={styles.offerTitle}>{accountView === 'business' ? 'More time for your business' : accountView === 'family' ? 'Plans for the whole household' : 'A little more room to grow'}</Text>
              <Text style={styles.offerDescription}>
                {accountView === 'business' ? 'Explore tools to streamline your everyday banking.' : accountView === 'family' ? 'See shared balances and family goals in one view.' : 'Explore ways to make your savings go further.'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color="rgba(28,28,28,0.58)" />
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.background },
  hero: { minHeight: 172, position: 'relative', overflow: 'hidden' },
  heroImage: { width: '100%', height: '100%', zIndex: 0 },
  heroGradient: { zIndex: 1 },
  heroForeground: { zIndex: 2, paddingBottom: 30 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  greeting: { color: 'rgba(255,255,255,0.72)', fontSize: 13, lineHeight: 18 },
  profileHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarSettingsButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 },
  customerProfileButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  relationshipBadge: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.34)' },
  relationshipBadgeCompact: { paddingHorizontal: 6 },
  relationshipText: { color: colors.white, fontSize: 10, lineHeight: 13, fontWeight: '700', letterSpacing: 0.2 },
  relationshipTextCompact: { fontSize: 9, lineHeight: 12 },
  customerAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.white, overflow: 'hidden' },
  customerName: { color: colors.white, fontSize: 17, fontFamily: font.headline.bold, lineHeight: 22 },
  profileMenu: { alignSelf: 'flex-start', minWidth: 250, marginLeft: 18, marginTop: 8, padding: 6, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint, shadowColor: colors.text, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 12, elevation: 6 },
  profileMenuCompact: { minWidth: 225, marginLeft: 14, marginTop: 6 },
  profileMenuOption: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 8, borderRadius: 10 },
  profileMenuIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: colors.surfaceMid, alignItems: 'center', justifyContent: 'center' },
  profileMenuIconSelected: { backgroundColor: colors.greenDim },
  profileMenuCopy: { flex: 1, gap: 2 },
  profileMenuTitle: { color: colors.text, fontSize: 12, lineHeight: 16, fontFamily: font.headline.semibold },
  profileMenuTitleSelected: { color: colors.greenDeep },
  profileMenuDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notificationButton: { width: 46, height: 46, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.13)', alignItems: 'center', justifyContent: 'center' },
  notificationCount: { position: 'absolute', right: -1, top: -3, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.red, borderWidth: 1.5, borderColor: palette.greenDeep, alignItems: 'center', justifyContent: 'center' },
  notificationCountText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  financialHealthCard: { marginHorizontal: 16, marginTop: -26, marginBottom: 14, padding: 14, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint, gap: 10, shadowColor: colors.greenDeep, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  healthSummary: { gap: 5 },
  healthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  healthTitle: { flex: 1, minWidth: 0, color: palette.ink, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  healthMeterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  healthScore: { flexShrink: 0, color: colors.greenDeep, fontSize: 13, lineHeight: 16, fontFamily: font.headline.bold },
  healthScoreScale: { color: colors.textSecondary, fontSize: 9, fontFamily: font.body.regular },
  totalBalanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surfaceMid },
  totalBalanceCopy: { flex: 1, minWidth: 0 },
  totalBalanceLabel: { color: colors.textSecondary, fontSize: 9, lineHeight: 13, fontWeight: '700', letterSpacing: 0.5 },
  totalBalanceValue: { flexShrink: 1, color: palette.ink, fontSize: 21, lineHeight: 26, fontFamily: font.headline.bold },
  totalBalanceDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  totalBalanceIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  healthMeterTrack: { flex: 1, height: 7, borderRadius: 4, backgroundColor: colors.surfaceHigh, overflow: 'hidden' },
  healthMeterFill: { width: '82%', height: '100%', borderRadius: 4, backgroundColor: colors.green },
  healthMetrics: { flexDirection: 'row', gap: 8 },
  healthMetricTile: { flex: 1, minWidth: 0, padding: 10, borderRadius: 12, backgroundColor: colors.surfaceMid, gap: 3 },
  healthMetricLabel: { color: colors.textSecondary, fontSize: 9, lineHeight: 13, fontWeight: '700', letterSpacing: 0.5 },
  healthMetricValue: { color: palette.ink, fontSize: 19, lineHeight: 24, fontFamily: font.headline.bold },
  healthMetricDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  creditBalanceRow: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 10, borderRadius: 12, backgroundColor: colors.surfaceMid },
  creditBalanceIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.greenDim },
  creditBalanceCopy: { flex: 1, minWidth: 0, gap: 2 },
  creditBalanceLabel: { color: palette.ink, fontSize: 12, lineHeight: 16, fontFamily: font.headline.semibold },
  creditBalanceDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  creditBalanceValue: { color: palette.ink, fontSize: 12, lineHeight: 16, fontFamily: font.headline.bold, flexShrink: 0 },
  healthDivider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderFaint },
  accountSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 38 },
  accountSectionCopy: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accountSectionTitle: { color: palette.ink, fontSize: 14, fontFamily: font.headline.semibold },
  linkedAccountCount: { color: colors.textSecondary, fontSize: 11 },
  content: { paddingHorizontal: 16, marginTop: -5 },
  feeNotice: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 10 },
  feeNoticeCopy: { flex: 1, minWidth: 0, gap: 2 },
  feeNoticeText: { color: palette.ink, fontSize: 14, lineHeight: 19, fontWeight: '600' },
  feeNoticeSubtext: { color: colors.textSecondary, fontSize: 11, lineHeight: 15, fontFamily: font.body.regular },
  recentTransactionsCard: { marginHorizontal: 16, padding: 14, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint },
  recentTransactionsCardCompact: { marginHorizontal: 12, padding: 12, borderRadius: 16 },
  recentTransactionsHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 },
  recentTransactionsTitle: { color: palette.ink, fontSize: 16, lineHeight: 21, fontFamily: font.headline.bold },
  recentTransactionsSubtitle: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  transactionRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10 },
  transactionRowCompact: { minHeight: 52, gap: 8 },
  transactionDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderFaint },
  transactionIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  transactionLogo: { fontSize: 10, lineHeight: 13, fontFamily: font.body.bold, letterSpacing: 0.1, textAlign: 'center' },
  transactionCopy: { flex: 1, minWidth: 0, gap: 2 },
  transactionMerchant: { color: palette.ink, fontSize: 13, lineHeight: 17, fontFamily: font.headline.semibold },
  transactionMeta: { color: colors.textSecondary, fontSize: 10, lineHeight: 14, fontFamily: font.body.regular },
  transactionAmount: { color: palette.ink, fontSize: 12, lineHeight: 16, fontFamily: font.headline.bold, flexShrink: 0 },
  transactionAmountCredit: { color: colors.greenDeep },
  accountList: { backgroundColor: colors.surface, borderRadius: 12, overflow: 'hidden' },
  accountRow: { minHeight: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, gap: 8 },
  accountDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderFaint },
  accountMark: { width: 36, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  accountMarkLine: { width: 22, height: 3, borderRadius: 2, backgroundColor: 'rgba(28,28,28,0.3)', marginTop: 12 },
  accountCopy: { flex: 1, minWidth: 0 },
  accountName: { color: palette.ink, fontSize: 13, fontWeight: '600', lineHeight: 17 },
  accountDetail: { color: colors.textSecondary, fontSize: 11, lineHeight: 14 },
  accountNote: { color: colors.greenDeep, fontSize: 10, fontWeight: '600', lineHeight: 13 },
  accountAmount: { color: palette.ink, fontSize: 13, fontWeight: '700', maxWidth: 104, textAlign: 'right' },
  offersHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 9 },
  offersTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  smallTdLogo: { width: 26, height: 26, borderRadius: 7, backgroundColor: palette.green, alignItems: 'center', justifyContent: 'center' },
  smallTdLogoText: { color: colors.text, fontSize: 13, fontWeight: '800', letterSpacing: -1 },
  offersTitle: { color: palette.ink, fontSize: 17, fontFamily: font.headline.bold },
  offerCount: { color: 'rgba(28,28,28,0.58)', fontSize: 11 },
  offerCard: { minHeight: 86, borderRadius: 17, backgroundColor: palette.surface, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 6 },
  offerIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  offerCopy: { flex: 1 },
  offerEyebrow: { color: colors.greenDeep, fontSize: 9, fontWeight: '700', letterSpacing: 0.7 },
  offerTitle: { color: palette.ink, fontSize: 13, fontFamily: font.headline.bold, marginTop: 2 },
  offerDescription: { color: 'rgba(28,28,28,0.62)', fontSize: 11, lineHeight: 15, marginTop: 1 },

  heroCompact: { minHeight: 150 },
  heroForegroundCompact: { paddingBottom: 10 },
  topBarCompact: { paddingHorizontal: 14 },
  identityCompact: { gap: 6 },
  greetingCompact: { fontSize: 11, lineHeight: 15 },
  profileHeaderRowCompact: { gap: 6 },
  customerAvatarCompact: { width: 40, height: 40, borderRadius: 20 },
  customerNameCompact: { fontSize: 15, lineHeight: 19 },
  topActionsCompact: { gap: 4 },
  notificationButtonCompact: { width: 34, height: 34 },
  financialHealthCardCompact: { marginHorizontal: 12, marginTop: -22, marginBottom: 12, padding: 12, gap: 8 },
  healthTitleCompact: { fontSize: 14, lineHeight: 18 },
  healthScoreCompact: { fontSize: 12, lineHeight: 15 },
  totalBalanceValueCompact: { fontSize: 20, lineHeight: 24 },
  healthMetricsCompact: { gap: 6 },
  healthMetricLabelCompact: { fontSize: 8, lineHeight: 11, letterSpacing: 0.25 },
  healthMetricValueCompact: { fontSize: 17, lineHeight: 21 },
  contentCompact: { paddingHorizontal: 12 },
  feeNoticeCompact: { minHeight: 38, gap: 9 },
  feeNoticeSubtextCompact: { fontSize: 10, lineHeight: 13 },
  accountRowCompact: { minHeight: 50, paddingHorizontal: 9, gap: 7 },
  accountMarkCompact: { width: 30, height: 30, borderRadius: 7 },
  accountNameCompact: { fontSize: 13, lineHeight: 16 },
  accountDetailCompact: { fontSize: 10, lineHeight: 13 },
  accountNoteCompact: { fontSize: 10, lineHeight: 12 },
  accountAmountCompact: { fontSize: 12, maxWidth: 78, flexShrink: 0 },
});
