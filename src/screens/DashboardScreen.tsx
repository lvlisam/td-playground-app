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
    icon: 'cart-outline',
  },
  {
    id: 'transit',
    merchant: 'City Transit',
    category: 'Transportation · TD Debit',
    time: 'Today, 8:15 AM',
    amount: '−$2.90',
    icon: 'bus-outline',
  },
  {
    id: 'payroll',
    merchant: 'Payroll deposit',
    category: 'Income · Checking',
    time: 'Yesterday, 9:05 AM',
    amount: '+$2,450.00',
    icon: 'arrow-down-outline',
  },
] as const;

type AccountView = 'family' | 'business';
type DashboardAccount = Omit<Account, 'id'> & { id: string };
type DashboardTransaction = {
  id: string;
  merchant: string;
  category: string;
  time: string;
  amount: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

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
  { id: 'payout', merchant: 'Card sales payout', category: 'Sales · Checking', time: 'Today, 8:42 AM', amount: '+$3,842.50', icon: 'arrow-down-outline' },
  { id: 'supplies', merchant: 'Office supplies', category: 'Supplies · Business card', time: 'Yesterday, 2:10 PM', amount: '−$246.18', icon: 'bag-handle-outline' },
  { id: 'software', merchant: 'Business software', category: 'Software · Business card', time: 'Nov 18, 10:15 AM', amount: '−$59.99', icon: 'briefcase-outline' },
];

function AccountRow({ account, last, compact }: { account: DashboardAccount; last: boolean; compact: boolean }) {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const accessibilityLabel = `${account.name}, ${account.amount}. ${account.detail}${account.note ? `. ${account.note}` : ''}`;
  const rowStyle = [styles.accountRow, compact && styles.accountRowCompact, !last && styles.accountDivider];
  const isBusinessAccount = account.id.startsWith('business-');
  const isCreditAccount = account.id === 'card';
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
      {!isBusinessAccount ? <Ionicons name="chevron-forward" size={15} color={colors.textSecondary} /> : null}
    </>
  );

  if (isBusinessAccount) {
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
      <View style={[styles.transactionIcon, isCredit && styles.transactionIconCredit]} accessible={false}>
        <Ionicons name={transaction.icon} size={17} color={isCredit ? colors.greenDeep : colors.textSecondary} />
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
  const transactions = view === 'business' ? businessTransactions : recentTransactions;

  return (
    <View style={[styles.recentTransactionsCard, compact && styles.recentTransactionsCardCompact]}>
      <View style={styles.recentTransactionsHeading}>
        <Text accessibilityRole="header" style={styles.recentTransactionsTitle}>
          {view === 'business' ? 'Recent business activity' : 'Recent transactions'}
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
  const visibleAccounts: DashboardAccount[] = isBusiness ? businessAccounts : accounts;
  const creditAccount = visibleAccounts.find((account) => account.id === (isBusiness ? 'business-card' : 'card'));
  const score = isBusiness ? 76 : 82;

  return (
    <View style={[styles.financialHealthCard, compact && styles.financialHealthCardCompact]}>
      <View style={styles.healthHeader}>
        <View style={styles.healthIdentity}>
          <Text style={[styles.healthTitle, compact && styles.healthTitleCompact]}>
            {isBusiness ? 'Business overview' : 'Financial health'}
          </Text>
        </View>
        <View style={styles.healthScoreGroup}>
          <Text accessibilityLabel={`${isBusiness ? 'Business' : 'Financial health'} score ${score} out of 100`} style={[styles.healthScore, compact && styles.healthScoreCompact]}>
            {score}<Text style={styles.healthScoreScale}> / 100</Text>
          </Text>
        </View>
      </View>
      <View style={styles.totalBalanceRow}>
        <View>
          <Text style={styles.totalBalanceLabel}>{isBusiness ? 'TOTAL BUSINESS DEPOSITS' : 'TOTAL DEPOSIT BALANCE'}</Text>
          <Text style={[styles.totalBalanceValue, compact && styles.totalBalanceValueCompact]}>
            {isBusiness ? '$49,484.22' : '$60,062.17'}
          </Text>
          <Text style={styles.totalBalanceDetail}>{isBusiness ? 'Business checking + savings' : 'Checking + savings'}</Text>
        </View>
        <View style={styles.totalBalanceIcon}>
          <Ionicons name={isBusiness ? 'briefcase-outline' : 'wallet-outline'} size={20} color={colors.greenDeep} />
        </View>
      </View>
      <View accessibilityLabel={`${isBusiness ? 'Business' : 'Financial health'} score: ${score} percent`} style={styles.healthMeterTrack}>
        <View style={[styles.healthMeterFill, { width: `${score}%` }]} />
      </View>

      <View style={[styles.healthMetrics, compact && styles.healthMetricsCompact]}>
        <View style={styles.healthMetricTile}>
          <Text style={styles.healthMetricLabel}>{isBusiness ? 'CASH AVAILABLE' : 'LEFT TO SPEND'}</Text>
          <Text numberOfLines={1} style={[styles.healthMetricValue, compact && styles.healthMetricValueCompact]}>
            {isBusiness ? '$17,384.22' : '$6,842.17'}
          </Text>
          <Text style={styles.healthMetricDetail}>{isBusiness ? 'Business checking' : 'Checking · before upcoming bills'}</Text>
        </View>
        <View style={styles.healthMetricTile}>
          <Text style={styles.healthMetricLabel}>SAVED IN NOV</Text>
          <Text style={[styles.healthMetricValue, compact && styles.healthMetricValueCompact]}>{isBusiness ? '+$1,200' : '+$240'}</Text>
          <Text style={styles.healthMetricDetail}>{isBusiness ? 'Added to business savings' : '+$60 vs. October (+$180)'}</Text>
        </View>
      </View>
      {creditAccount ? (
        <View style={styles.creditBalanceRow}>
          <View style={styles.creditBalanceIcon}>
            <Ionicons name="card-outline" size={18} color={colors.greenDeep} />
          </View>
          <View style={styles.creditBalanceCopy}>
            <Text style={styles.creditBalanceLabel}>{isBusiness ? 'Business card balance' : 'Credit balance'}</Text>
            <Text style={styles.creditBalanceDetail}>{creditAccount.detail}</Text>
          </View>
          <Text style={styles.creditBalanceValue}>{creditAccount.amount}</Text>
        </View>
      ) : null}

      <View style={styles.healthDivider} />
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`${isBusiness ? 'Business accounts' : 'Your accounts'}, ${visibleAccounts.length} linked`}
        accessibilityHint={accountsExpanded ? 'Hides your linked accounts' : 'Shows your linked accounts'}
        accessibilityState={{ expanded: accountsExpanded }}
        onPress={() => setAccountsExpanded((expanded) => !expanded)}
        style={styles.accountSectionHeader}
      >
        <View style={styles.accountSectionCopy}>
          <Text style={styles.accountSectionTitle}>{isBusiness ? 'Business accounts' : 'Your accounts'}</Text>
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
      <View style={styles.healthDivider} />
      <View style={[styles.feeNotice, compact && styles.feeNoticeCompact]}>
        <Ionicons name="checkmark-circle" size={compact ? 18 : 20} color={colors.greenDeep} />
        <View style={styles.feeNoticeCopy}>
          <Text style={styles.feeNoticeText}>{isBusiness ? 'Business monthly fee waived' : 'Fee waived this month'}</Text>
          <Text style={[styles.feeNoticeSubtext, compact && styles.feeNoticeSubtextCompact]}>
            {isBusiness ? 'Your balance meets the monthly waiver requirement' : 'Direct deposit covers your $5 monthly fee'}
          </Text>
        </View>
      </View>
    </View>
  );
}

function DashboardAccountSwitcher({ view, onChange, compact }: {
  view: AccountView;
  onChange: (view: AccountView) => void;
  compact: boolean;
}) {
  return (
    <View style={[styles.accountViewSwitcher, compact && styles.accountViewSwitcherCompact]}>
      <Text style={styles.accountViewSwitcherLabel}>ACCOUNT VIEW</Text>
      <View accessibilityRole="tablist" style={styles.accountViewSegments}>
        <TouchableOpacity
          accessibilityRole="tab"
          accessibilityLabel="Ava and family accounts"
          accessibilityState={{ selected: view === 'family' }}
          onPress={() => onChange('family')}
          style={[styles.accountViewSegment, view === 'family' && styles.accountViewSegmentActive]}
        >
          <Ionicons name="people-outline" size={15} color={view === 'family' ? colors.greenDeep : colors.white} />
          <Text style={[styles.accountViewSegmentText, view === 'family' && styles.accountViewSegmentTextActive, compact && styles.accountViewSegmentTextCompact]}>
            Ava + family
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityRole="tab"
          accessibilityLabel="Ava's small business accounts"
          accessibilityState={{ selected: view === 'business' }}
          onPress={() => onChange('business')}
          style={[styles.accountViewSegment, view === 'business' && styles.accountViewSegmentActive]}
        >
          <Ionicons name="briefcase-outline" size={15} color={view === 'business' ? colors.greenDeep : colors.white} />
          <Text style={[styles.accountViewSegmentText, view === 'business' && styles.accountViewSegmentTextActive, compact && styles.accountViewSegmentTextCompact]}>
            Small business
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const [accountView, setAccountView] = useState<AccountView>('family');
  const previewTopInset = Platform.OS === 'web' ? (width < 650 ? 24 : 48) : insets.top;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 78 }}
      >
        <View style={[styles.hero, compact && styles.heroCompact]}>
          <Image
            source={require('../../assets/td-family-hero.png')}
            resizeMode="cover"
            style={[StyleSheet.absoluteFill, styles.heroImage]}
            accessible={false}
          />
          <LinearGradient
            colors={['rgba(35,139,20,0.78)', 'rgba(35,139,20,0.42)', 'rgba(35,139,20,0.12)', 'rgba(246,247,244,0.94)']}
            locations={[0, 0.44, 0.72, 1]}
            style={[StyleSheet.absoluteFill, styles.heroGradient]}
          />
          <View style={[styles.heroForeground, compact && styles.heroForegroundCompact, { paddingTop: previewTopInset + (compact ? 2 : 8) }]}>
            <View style={[styles.topBar, compact && styles.topBarCompact]}>
              <View style={[styles.identity, compact && styles.identityCompact]}>
              <View>
                <Text style={[styles.greeting, compact && styles.greetingCompact]}>Good afternoon,</Text>
                <View style={styles.customerProfileButton}>
                  <Image
                    source={require('../../assets/maya-avatar.png')}
                    style={[styles.customerAvatar, compact && styles.customerAvatarCompact]}
                    resizeMode="cover"
                    accessible={false}
                  />
                  <Text accessibilityRole="text" accessibilityLabel="Signed in as Ava" style={[styles.customerName, compact && styles.customerNameCompact]}>Ava</Text>
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
              <TouchableOpacity accessibilityRole="button" accessibilityLabel="Notifications, 3 unread" style={[styles.notificationButton, compact && styles.notificationButtonCompact]}>
                <Ionicons name="notifications-outline" size={compact ? 18 : 22} color={colors.white} />
                <View style={styles.notificationCount}><Text style={styles.notificationCountText}>3</Text></View>
              </TouchableOpacity>
            </View>
          </View>
          <DashboardAccountSwitcher view={accountView} onChange={setAccountView} compact={compact} />
          </View>
        </View>

        <FinancialHealthCard compact={compact} view={accountView} />
        {accountView === 'family' ? <CreditAndBillsSection compact={compact} /> : null}
        <RecentTransactionsSection compact={compact} view={accountView} />

        <View style={[styles.content, compact && styles.contentCompact]}>
          <View style={styles.offersHeading}>
            <View style={styles.offersTitleGroup}>
              <View style={styles.smallTdLogo}><Text style={styles.smallTdLogoText}>TD</Text></View>
              <Text style={styles.offersTitle}>{accountView === 'business' ? 'TD for your business' : 'TD for you'}</Text>
            </View>
            <Text style={styles.offerCount}>3 offers · swipe</Text>
          </View>
          <TouchableOpacity accessibilityRole="button" style={styles.offerCard}>
            <View style={styles.offerIcon}><Ionicons name="leaf-outline" size={22} color={palette.green} /></View>
            <View style={styles.offerCopy}>
              <Text style={styles.offerEyebrow}>{accountView === 'business' ? 'BUSINESS BANKING' : 'MADE FOR AVA'}</Text>
              <Text style={styles.offerTitle}>{accountView === 'business' ? 'More time for your business' : 'A little more room to grow'}</Text>
              <Text style={styles.offerDescription}>
                {accountView === 'business' ? 'Explore tools to streamline your everyday banking.' : 'Explore ways to make your savings go further.'}
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
  customerProfileButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  relationshipBadge: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.34)' },
  relationshipBadgeCompact: { paddingHorizontal: 6 },
  relationshipText: { color: colors.white, fontSize: 10, lineHeight: 13, fontWeight: '700', letterSpacing: 0.2 },
  relationshipTextCompact: { fontSize: 9, lineHeight: 12 },
  customerAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.white, overflow: 'hidden' },
  customerName: { color: colors.white, fontSize: 17, fontFamily: font.headline.bold, lineHeight: 22 },
  accountViewSwitcher: { marginHorizontal: 18, marginTop: 14, padding: 5, borderRadius: 15, backgroundColor: 'rgba(4,57,29,0.28)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)', gap: 4 },
  accountViewSwitcherCompact: { marginHorizontal: 14, marginTop: 10, padding: 4, gap: 3 },
  accountViewSwitcherLabel: { marginHorizontal: 6, color: 'rgba(255,255,255,0.76)', fontSize: 9, lineHeight: 12, fontWeight: '700', letterSpacing: 0.6 },
  accountViewSegments: { flexDirection: 'row', gap: 4 },
  accountViewSegment: { flex: 1, minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 4, borderRadius: 10 },
  accountViewSegmentActive: { backgroundColor: colors.white },
  accountViewSegmentText: { color: colors.white, fontSize: 11, lineHeight: 14, fontFamily: font.headline.semibold },
  accountViewSegmentTextActive: { color: colors.greenDeep },
  accountViewSegmentTextCompact: { fontSize: 10 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notificationButton: { width: 46, height: 46, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.13)', alignItems: 'center', justifyContent: 'center' },
  notificationCount: { position: 'absolute', right: -1, top: -3, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.red, borderWidth: 1.5, borderColor: palette.greenDeep, alignItems: 'center', justifyContent: 'center' },
  notificationCountText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  financialHealthCard: { marginHorizontal: 16, marginTop: -26, marginBottom: 14, padding: 14, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint, gap: 10, shadowColor: colors.greenDeep, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  healthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  healthIdentity: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  healthTitle: { color: palette.ink, fontSize: 15, lineHeight: 20, fontWeight: '700' },
  healthScoreGroup: { alignItems: 'flex-end' },
  healthScore: { color: colors.greenDeep, fontSize: 24, lineHeight: 28, fontFamily: font.headline.bold },
  healthScoreScale: { color: colors.textSecondary, fontSize: 12, fontFamily: font.body.regular },
  totalBalanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, backgroundColor: colors.surfaceMid },
  totalBalanceLabel: { color: colors.textSecondary, fontSize: 9, lineHeight: 13, fontWeight: '700', letterSpacing: 0.5 },
  totalBalanceValue: { color: palette.ink, fontSize: 21, lineHeight: 26, fontFamily: font.headline.bold },
  totalBalanceDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  totalBalanceIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  healthMeterTrack: { height: 7, borderRadius: 4, backgroundColor: colors.surfaceHigh, overflow: 'hidden' },
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
  transactionIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surfaceMid, alignItems: 'center', justifyContent: 'center' },
  transactionIconCredit: { backgroundColor: colors.greenDim },
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
  customerAvatarCompact: { width: 40, height: 40, borderRadius: 20 },
  customerNameCompact: { fontSize: 15, lineHeight: 19 },
  topActionsCompact: { gap: 4 },
  notificationButtonCompact: { width: 34, height: 34 },
  financialHealthCardCompact: { marginHorizontal: 12, marginTop: -22, marginBottom: 12, padding: 12, gap: 8 },
  healthTitleCompact: { fontSize: 14, lineHeight: 18 },
  healthScoreCompact: { fontSize: 22, lineHeight: 26 },
  totalBalanceValueCompact: { fontSize: 20, lineHeight: 24 },
  healthMetricsCompact: { gap: 6 },
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
