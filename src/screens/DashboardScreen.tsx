import React, { useState } from 'react';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import {
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
import ConnectedDataSection from '../components/ConnectedDataSection';
import AccountDetails from '../components/AccountDetails';
import TediInsightsCard, { type TediCategoryTotal } from '../components/TediInsightsCard';
import FamilyMoneyHub from '../components/FamilyMoneyHub';
import { useAccounts } from '../accounts';
import type { Account } from '../accounts';
import { upcomingBillPayments } from '../financeData';
import { dashboardProfileOptions, useDashboardProfile } from '../personas';
import type { DashboardProfileId } from '../personas';

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
    accountId: 'checking', logo: { mark: 'GW', background: colors.greenDim, foreground: colors.greenDeep },
  },
  {
    id: 'transit',
    merchant: 'City Transit',
    category: 'Transportation · TD Debit',
    time: 'Today, 8:15 AM',
    amount: '−$2.90',
    accountId: 'checking', logo: { mark: 'CT', background: colors.blueDim, foreground: colors.teal },
  },
  {
    id: 'payroll',
    merchant: 'Payroll deposit',
    category: 'Income · Checking',
    time: 'Yesterday, 9:05 AM',
    amount: '+$2,450.00',
    accountId: 'checking', logo: { mark: 'PAY', background: colors.greenDim, foreground: colors.greenDeep },
  },
] as const;

export type DashboardAccount = Omit<Account, 'id'> & { id: string };
type DashboardTransaction = {
  accountId: string;
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

export function getSavingsThisMonth(view: DashboardProfileId) {
  return view === 'business' ? 1200 : view === 'family' ? 450 : view === 'james' ? 310 : view === 'olivia' ? 50 : view === 'noah' ? 35 : 240;
}

function formatMonthlySavings(value: number) {
  const formattedAmount = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.abs(value));
  return `${value < 0 ? '−' : '+'}${formattedAmount}`;
}

function getPaydayCountdown(today = new Date()) {
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const dayOfMonth = today.getDate();
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const monthEndDay = monthEnd.getDate();
  let nextPayday: Date;
  let previousPayday: Date;

  if (dayOfMonth < 15) {
    nextPayday = new Date(today.getFullYear(), today.getMonth(), 15);
    previousPayday = new Date(today.getFullYear(), today.getMonth(), 0);
  } else if (dayOfMonth === 15) {
    nextPayday = todayStart;
    previousPayday = new Date(today.getFullYear(), today.getMonth(), 0);
  } else if (dayOfMonth < monthEndDay) {
    nextPayday = monthEnd;
    previousPayday = new Date(today.getFullYear(), today.getMonth(), 15);
  } else {
    nextPayday = todayStart;
    previousPayday = new Date(today.getFullYear(), today.getMonth(), 15);
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysUntilPayday = Math.max(0, Math.ceil((nextPayday.getTime() - todayStart.getTime()) / millisecondsPerDay));
  const cycleDays = Math.max(1, Math.round((nextPayday.getTime() - previousPayday.getTime()) / millisecondsPerDay));
  const progress = Math.min(100, Math.max(0, ((cycleDays - daysUntilPayday) / cycleDays) * 100));

  return { daysUntilPayday, progress };
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
  { accountId: 'business-checking', id: 'payout', merchant: 'Card sales payout', category: 'Sales · Checking', time: 'Today, 8:42 AM', amount: '+$3,842.50', logo: { mark: 'CS', background: colors.greenDim, foreground: colors.greenDeep } },
  { id: 'supplies', merchant: 'Office supplies', category: 'Supplies · Business card', accountId: 'business-card', time: 'Yesterday, 2:10 PM', amount: '−$246.18', logo: { mark: 'OS', background: colors.orangeDim, foreground: colors.orange } },
  { id: 'software', merchant: 'Business software', category: 'Software · Business card', accountId: 'business-card', time: 'Nov 18, 10:15 AM', amount: '−$59.99', logo: { mark: 'BS', background: colors.purpleDim, foreground: colors.purple } },
];

const familyAccounts: DashboardAccount[] = [
  { id: 'family-checking', name: 'Shared household', productLabel: 'Family checking', detail: '•••• 2846', amount: '$12,480.30', amountLabel: 'Available balance', note: 'Shared household spending', swatch: colors.green, plan: null },
  { id: 'family-savings', name: 'Family goals', productLabel: 'Family savings', detail: '•••• 7451 · 4.25% APY', amount: '$41,500.00', amountLabel: 'Current balance', note: 'Home and travel goals', swatch: colors.green, plan: null },
  { id: 'family-card', name: 'Household rewards', productLabel: 'Family credit card', detail: '$9,850.00 available', amount: '−$628.45', amountLabel: 'Current balance', note: 'Shared purchases', swatch: colors.text, plan: null },
  { id: 'family-husband-checking', name: 'James’s checking', productLabel: 'Personal checking', detail: '•••• 6318', amount: '$5,240.15', amountLabel: 'Available balance', note: 'Personal spending', swatch: colors.green, plan: null },
  { id: 'family-child-one-savings', name: 'Olivia’s savings', productLabel: 'Youth savings', detail: '•••• 3920 · 4.25% APY', amount: '$1,250.00', amountLabel: 'Current balance', note: 'Education savings', swatch: colors.green, plan: null },
  { id: 'family-child-two-savings', name: 'Noah’s savings', productLabel: 'Youth savings', detail: '•••• 7143 · 4.25% APY', amount: '$980.00', amountLabel: 'Current balance', note: 'Education savings', swatch: colors.green, plan: null },
];

const familyTransactions: DashboardTransaction[] = [
  { accountId: 'family-checking', id: 'family-groceries', merchant: 'Greenway Market', category: 'Groceries · Shared checking', time: 'Today, 10:42 AM', amount: '−$126.40', logo: { mark: 'GW', background: colors.greenDim, foreground: colors.greenDeep } },
  { accountId: 'family-checking', id: 'family-utilities', merchant: 'City utilities', category: 'Home · Household account', time: 'Yesterday, 4:20 PM', amount: '−$184.00', logo: { mark: 'CU', background: colors.yellowDim, foreground: colors.text } },
  { accountId: 'family-savings', id: 'family-transfer', merchant: 'Monthly contribution', category: 'Savings · Family goals', time: 'Nov 18, 9:00 AM', amount: '+$450.00', logo: { mark: 'FG', background: colors.greenDim, foreground: colors.greenDeep } },
];

const jamesAccounts: DashboardAccount[] = [
  { id: 'james-checking', name: 'TD Convenience Checking', productLabel: 'Personal checking', detail: '•••• 6318', amount: '$5,240.15', amountLabel: 'Available balance', note: 'Everyday spending', swatch: colors.green, plan: null },
  { id: 'james-savings', name: 'TD Growth Savings', productLabel: 'Personal savings', detail: '•••• 2054 · 3.75% APY', amount: '$18,600.00', amountLabel: 'Current balance', note: 'Emergency fund', swatch: colors.green, plan: null },
  { id: 'james-card', name: 'TD Cash Credit Card', productLabel: 'Personal credit card', detail: '$7,500.00 available', amount: '−$925.50', amountLabel: 'Current balance', note: 'Cash back rewards', swatch: colors.text, plan: null },
];

const oliviaAccounts: DashboardAccount[] = [
  { id: 'olivia-checking', name: 'TD Youth Checking', productLabel: 'Youth checking', detail: '•••• 3920', amount: '$284.75', amountLabel: 'Available balance', note: 'Allowance and spending', swatch: colors.green, plan: null },
  { id: 'olivia-savings', name: 'TD Youth Savings', productLabel: 'Youth savings', detail: '•••• 6341 · 4.25% APY', amount: '$1,250.00', amountLabel: 'Current balance', note: 'Education savings', swatch: colors.green, plan: null },
];

const noahAccounts: DashboardAccount[] = [
  { id: 'noah-checking', name: 'TD Youth Checking', productLabel: 'Youth checking', detail: '•••• 7143', amount: '$168.20', amountLabel: 'Available balance', note: 'Allowance and spending', swatch: colors.green, plan: null },
  { id: 'noah-savings', name: 'TD Youth Savings', productLabel: 'Youth savings', detail: '•••• 9480 · 4.25% APY', amount: '$980.00', amountLabel: 'Current balance', note: 'Allowance and spending', swatch: colors.green, plan: null },
];

export function getDashboardAccounts(view: DashboardProfileId, accounts: Account[]): DashboardAccount[] {
  if (view === 'business') return businessAccounts;
  if (view === 'family') return familyAccounts;
  if (view === 'james') return jamesAccounts;
  if (view === 'olivia') return oliviaAccounts;
  if (view === 'noah') return noahAccounts;
  return accounts;
}

const jamesTransactions: DashboardTransaction[] = [
  { accountId: 'james-checking', id: 'james-payroll', merchant: 'Payroll deposit', category: 'Income · Checking', time: 'Today, 8:42 AM', amount: '+$2,860.00', logo: { mark: 'PAY', background: colors.greenDim, foreground: colors.greenDeep } },
  { accountId: 'james-checking', id: 'james-coffee', merchant: 'Northside Coffee', category: 'Dining · TD Debit', time: 'Today, 7:58 AM', amount: '−$6.75', logo: { mark: 'NC', background: colors.orangeDim, foreground: colors.orange } },
  { accountId: 'james-checking', id: 'james-card-payment', merchant: 'Card payment', category: 'Credit · Checking', time: 'Yesterday, 3:10 PM', amount: '−$125.00', logo: { mark: 'TD', background: colors.blueDim, foreground: colors.teal } },
];

const oliviaTransactions: DashboardTransaction[] = [
  { accountId: 'olivia-checking', id: 'olivia-bookstore', merchant: 'Campus Bookstore', category: 'School · Youth Checking', time: 'Today, 11:20 AM', amount: '−$18.50', logo: { mark: 'CB', background: colors.purpleDim, foreground: colors.purple } },
  { accountId: 'olivia-checking', id: 'olivia-allowance', merchant: 'Weekly allowance', category: 'Transfer · Youth Checking', time: 'Today, 8:00 AM', amount: '+$25.00', logo: { mark: 'AL', background: colors.greenDim, foreground: colors.greenDeep } },
  { accountId: 'olivia-savings', id: 'olivia-savings', merchant: 'Savings transfer', category: 'Savings · Youth Savings', time: 'Yesterday, 4:15 PM', amount: '−$10.00', logo: { mark: 'SV', background: colors.blueDim, foreground: colors.teal } },
];

const noahTransactions: DashboardTransaction[] = [
  { accountId: 'noah-checking', id: 'noah-sports', merchant: 'Sports club', category: 'Activities · Youth Checking', time: 'Today, 9:30 AM', amount: '−$12.00', logo: { mark: 'SC', background: colors.orangeDim, foreground: colors.orange } },
  { accountId: 'noah-checking', id: 'noah-allowance', merchant: 'Weekly allowance', category: 'Transfer · Youth Checking', time: 'Today, 8:00 AM', amount: '+$20.00', logo: { mark: 'AL', background: colors.greenDim, foreground: colors.greenDeep } },
  { accountId: 'noah-savings', id: 'noah-savings', merchant: 'Savings transfer', category: 'Savings · Youth Savings', time: 'Yesterday, 4:15 PM', amount: '−$5.00', logo: { mark: 'SV', background: colors.blueDim, foreground: colors.teal } },
];

export function getTransactionsForProfile(view: DashboardProfileId): readonly DashboardTransaction[] {
  return view === 'business'
    ? businessTransactions
    : view === 'family'
      ? familyTransactions
      : view === 'james'
        ? jamesTransactions
        : view === 'olivia'
          ? oliviaTransactions
          : view === 'noah'
            ? noahTransactions
            : recentTransactions;
}

function getTediCategoryTotals(view: DashboardProfileId): TediCategoryTotal[] {
  const totals = new Map<string, number>();
  getTransactionsForProfile(view).forEach((transaction) => {
    if (transaction.amount.startsWith('+')) return;
    const category = transaction.category.split(' · ')[0];
    if (category === 'Savings') return;
    const safeCategory = category === 'Credit' ? 'Credit payment' : category;
    const amount = parseDashboardAmount(transaction.amount);
    if (amount > 0) totals.set(safeCategory, (totals.get(safeCategory) ?? 0) + amount);
  });
  return Array.from(totals, ([category, amount]) => ({
    category,
    amount: Math.round(amount * 100) / 100,
  }));
}

type DashboardRecommendation = {
  eyebrow: string;
  title: string;
  description: string;
  destination: 'Benefits' | 'Insights' | 'Card Manager';
};

function getDashboardRecommendation(
  profileId: DashboardProfileId,
  categoryTotals: TediCategoryTotal[],
): DashboardRecommendation {
  const topCategory = [...categoryTotals].sort((a, b) => b.amount - a.amount)[0]?.category;
  const categoryContext = topCategory
    ? `The recent sample includes ${topCategory.toLowerCase()} activity.`
    : 'This profile has only a small recent activity sample.';

  if (profileId === 'business') {
    return {
      eyebrow: 'FOR YOUR BUSINESS',
      title: 'Explore business banking tools',
      description: `${categoryContext} Review small-business account and benefit tools for a clearer view of operating expenses.`,
      destination: 'Benefits',
    };
  }

  if (profileId === 'family') {
    return {
      eyebrow: 'FOR YOUR HOUSEHOLD',
      title: 'Bring family goals into focus',
      description: `${categoryContext} Review shared savings goals alongside your household plan.`,
      destination: 'Insights',
    };
  }

  if (profileId === 'olivia' || profileId === 'noah') {
    return {
      eyebrow: 'AGE-APPROPRIATE IDEA',
      title: 'Build a youth savings goal',
      description: `${categoryContext} Explore a simple savings goal that fits this youth profile.`,
      destination: 'Insights',
    };
  }

  if (topCategory === 'Credit payment') {
    return {
      eyebrow: 'BASED ON RECENT ACTIVITY',
      title: 'Review your card controls',
      description: `${categoryContext} Card controls can help you review alerts and manage everyday card use.`,
      destination: 'Card Manager',
    };
  }

  if (topCategory === 'Home') {
    return {
      eyebrow: 'BASED ON RECENT ACTIVITY',
      title: 'Explore a savings goal',
      description: `${categoryContext} A savings goal can help you organize money for a future home-related expense.`,
      destination: 'Insights',
    };
  }

  return {
    eyebrow: 'BASED ON RECENT ACTIVITY',
    title: 'Explore TD benefits and rewards',
    description: `${categoryContext} Review available benefits and rewards that may fit this profile.`,
    destination: 'Benefits',
  };
}

function AccountRow({ account, last, compact }: { account: DashboardAccount; last: boolean; compact: boolean }) {
  const [open, setOpen] = useState(false);
  const {activeProfileId} = useDashboardProfile();
  const accessibilityLabel = `${account.name}, ${account.amount}. ${account.detail}${account.note ? `. ${account.note}` : ''}`;
  const rowStyle = [styles.accountRow, compact && styles.accountRowCompact, !last && styles.accountDivider];

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
      <Ionicons name="chevron-forward" size={15} color={colors.textSecondary} />
    </>
  );

  return (<>
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityHint="Opens account details" onPress={() => setOpen(true)} style={rowStyle}>{content}</TouchableOpacity>
    {open && <AccountDetails account={account} activity={activeProfileId === 'ava' ? [] : getTransactionsForProfile(activeProfileId)} onClose={()=>setOpen(false)}/>}
  </>
  );
}

const accountCardGradients: Record<Account['id'], [string, string]> = {
  checking: ['#35C600', '#238B14'],
  savings: ['#1B7550', '#15543D'],
  card: ['#36443D', '#1A2721'],
};

function AccountShowcaseCard({ account, compact, isFront, stackIndex, stackOffset, onBringForward }: {
  account: Account;
  compact: boolean;
  isFront: boolean;
  stackIndex: number;
  stackOffset: number;
  onBringForward: (accountId: Account['id']) => void;
}) {
  const isCreditAccount = account.id === 'card';
  const iconName = isCreditAccount ? 'card-outline' : account.id === 'savings' ? 'leaf-outline' : 'wallet-outline';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`${account.name}, ${account.amountLabel.toLowerCase()} ${account.amount}, ${account.detail}`}
      accessibilityHint="Opens account details"
      accessibilityState={{ selected: isFront }}
      onPress={() => onBringForward(account.id)}
      style={[styles.accountShowcaseTouchable, { top: stackIndex * stackOffset, zIndex: stackIndex }]}
    >
      <LinearGradient
        colors={accountCardGradients[account.id]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.accountShowcaseCard, compact && styles.accountShowcaseCardCompact]}
      >
        <View style={styles.accountShowcaseTop}>
          <View style={styles.accountShowcaseIdentity}>
            <View style={styles.accountShowcaseBrand}>
              <Text style={styles.accountShowcaseBrandText}>TD</Text>
            </View>
            <View style={styles.accountShowcaseCopy}>
              <Text numberOfLines={1} style={styles.accountShowcaseProduct}>{account.productLabel.toUpperCase()}</Text>
              <Text numberOfLines={1} style={styles.accountShowcaseName}>{account.name}</Text>
            </View>
          </View>
          <Ionicons name={iconName} size={20} color="rgba(255,255,255,0.88)" />
        </View>
        <Text numberOfLines={1} adjustsFontSizeToFit style={styles.accountShowcaseAmount}>{account.amount}</Text>
        <View style={styles.accountShowcaseFooter}>
          <Text style={styles.accountShowcaseAmountLabel}>{account.amountLabel}</Text>
          <Text numberOfLines={1} style={styles.accountShowcaseDetail}>{account.detail}</Text>
        </View>
        {account.note ? <Text style={styles.accountShowcaseNote}>{account.note}</Text> : null}
      </LinearGradient>
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

function RecentTransactionsSection({ compact, view }: { compact: boolean; view: DashboardProfileId }) {
  const profile = dashboardProfileOptions.find((option) => option.id === view) ?? dashboardProfileOptions[0];
  const transactions = getTransactionsForProfile(view);
  const heading = view === 'business'
    ? 'Recent business activity'
    : view === 'family'
      ? 'Recent family activity'
      : 'My recent activity';

  return (
    <View style={[styles.recentTransactionsCard, compact && styles.recentTransactionsCardCompact]}>
      <View style={styles.recentTransactionsHeading}>
        <Text accessibilityRole="header" style={styles.recentTransactionsTitle}>{heading}</Text>
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

function FinancialHealthCard({ compact, view }: { compact: boolean; view: DashboardProfileId }) {
  const [accountsExpanded, setAccountsExpanded] = useState(false);
  const { accounts } = useAccounts();
  const profile = dashboardProfileOptions.find((option) => option.id === view) ?? dashboardProfileOptions[0];
  const isBusiness = view === 'business';
  const isFamily = view === 'family';
  const isChildProfile = view === 'olivia' || view === 'noah';
  const { edits } = useAccounts();
  const visibleAccounts = getDashboardAccounts(view, accounts).map(a => ({ ...a, ...edits[a.id] }));
  const creditAccount = visibleAccounts.find((account) => account.id.endsWith('card'));
  const checkingAccount = visibleAccounts.find((account) => account.id.endsWith('checking'));
  const savingsGoal = view === 'jane' ? accounts.find((account) => account.id === 'savings')?.plan : null;
  const creditBalance = Math.abs(parseDashboardAmount(creditAccount?.amount ?? '0'));
  const depositBalance = visibleAccounts
    .filter((account) => !account.id.endsWith('card'))
    .reduce((total, account) => total + parseDashboardAmount(account.amount), 0);
  const plannedGoalContribution = savingsGoal?.kind === 'savings-goal'
    ? savingsGoal.monthlyContribution
    : isFamily
      ? 450
      : view === 'olivia'
        ? 50
        : view === 'noah'
          ? 35
          : 0;
  const upcomingBillsTotal = isBusiness || isFamily || isChildProfile
    ? 0
    : upcomingBillPayments.reduce((total, bill) => total + parseDashboardAmount(bill.amount), 0);
  const netBalance = depositBalance - creditBalance;
  const availableAmount = Math.max(0, parseDashboardAmount(checkingAccount?.amount ?? '0') - creditBalance - plannedGoalContribution - upcomingBillsTotal);
  const scores: Record<DashboardProfileId, number> = { jane: 82, james: 80, ava: 84, olivia: 91, noah: 88, family: 79, business: 76 };
  const score = scores[view];
  const viewLabel = isBusiness ? 'Business' : isFamily ? 'Family' : profile.name;
  const accountLabel = isBusiness ? 'Business accounts' : isFamily ? 'Family accounts' : 'My accounts';
  const cardTitle = isBusiness
    ? 'Business overview'
    : isFamily
      ? 'Family finances'
      : view === 'olivia'
        ? `${profile.name}’s teen banking`
        : view === 'noah'
          ? `${profile.name}’s youth banking`
          : `${profile.name}’s Financial Snapshot`;
  const savingsThisMonth = getSavingsThisMonth(view);

  return (
    <View style={[styles.financialHealthCard, compact && styles.financialHealthCardCompact, view === 'jane' && styles.financialHealthCardAfterAccounts]}>
      {view !== 'jane' ? (
        <View style={styles.totalBalanceRow}>
          <View style={styles.totalBalanceCopy}>
            <Text style={styles.totalBalanceLabel}>{isChildProfile ? 'TOTAL SAVINGS + SPENDING' : 'TOTAL AVAILABLE BALANCE'}</Text>
            <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.totalBalanceValue, compact && styles.totalBalanceValueCompact]}>
              {formatDashboardCurrency(netBalance)}
            </Text>
          </View>
          <View style={styles.totalBalanceIcon}>
            <Ionicons name={isBusiness ? 'briefcase-outline' : isFamily ? 'people-outline' : 'wallet-outline'} size={20} color={colors.greenDeep} />
          </View>
        </View>
      ) : null}
      <View style={[styles.healthMetrics, compact && styles.healthMetricsCompact]}>
        {isBusiness || isFamily || isChildProfile ? (
          <View style={styles.healthMetricTile}>
            <Text numberOfLines={compact ? 2 : 1} style={[styles.healthMetricLabel, compact && styles.healthMetricLabelCompact]}>{isBusiness ? 'CASH AFTER CARD' : isChildProfile ? 'SPENDING ACCOUNT' : 'AFTER GOAL PLAN'}</Text>
            <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.healthMetricValue, compact && styles.healthMetricValueCompact]}>
              {formatDashboardCurrency(availableAmount)}
            </Text>
          </View>
        ) : null}
        {view !== 'jane' ? (
          <View style={styles.healthMetricTile}>
            <Text numberOfLines={compact ? 2 : 1} style={[styles.healthMetricLabel, compact && styles.healthMetricLabelCompact]}>SAVED THIS MONTH</Text>
            <Text numberOfLines={1} adjustsFontSizeToFit style={[styles.healthMetricValue, compact && styles.healthMetricValueCompact]}>{formatMonthlySavings(savingsThisMonth)}</Text>
            {!isFamily ? (
              <>
                {cardTitle !== 'Jane’s Financial Snapshot' ? <Text style={styles.healthMetricDetail}>{cardTitle}</Text> : null}
                <View style={styles.healthMeterRow}>
                  <View
                    accessible
                    accessibilityRole="progressbar"
                    accessibilityLabel={`${viewLabel} financial health`}
                    accessibilityValue={{ min: 0, max: 100, now: score }}
                    style={styles.healthMeterTrack}
                  >
                    <View style={[styles.healthMeterFill, { width: `${score}%` }]} />
                  </View>
                  <Text accessibilityLabel={`${viewLabel} score ${score} out of 100`} style={[styles.healthScore, compact && styles.healthScoreCompact]}>
                    {score}<Text style={styles.healthScoreScale}> / 100</Text>
                  </Text>
                </View>
              </>
            ) : null}
          </View>
        ) : null}
      </View>
      {view !== 'jane' && !isBusiness && !isFamily && !isChildProfile ? (
        <PaydayCountdownMeter compact={compact} amount={availableAmount} />
      ) : null}
      {view !== 'jane' ? (
        <>
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
          </TouchableOpacity>
          {accountsExpanded ? (
            <View style={styles.accountList}>
              {visibleAccounts.map((account, index) => (
                <AccountRow key={account.id} account={account} last={index === visibleAccounts.length - 1} compact={compact} />
              ))}
            </View>
          ) : null}
        </>
      ) : null}
    </View>
  );
}

function AccountCardsSection({ compact, view }: { compact: boolean; view: DashboardProfileId }) {
  const { accounts } = useAccounts();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [frontAccountId, setFrontAccountId] = useState<Account['id']>('checking');
  const frontAccount = accounts.find((account) => account.id === frontAccountId) ?? accounts[0];
  const totalAvailableBalance = accounts.reduce((total, account) => {
    const amount = parseDashboardAmount(account.amount);
    return total + (account.id.endsWith('card') ? -amount : amount);
  }, 0);

  if (view !== 'jane' || !frontAccount) return null;

  const stackedAccounts = [
    ...accounts.filter((account) => account.id !== frontAccount.id),
    frontAccount,
  ];
  const stackOffset = compact ? 36 : 38;
  const cardHeight = compact ? 132 : 140;

  return (
    <View style={[styles.accountShowcaseSection, compact && styles.accountShowcaseSectionCompact]}>
      {detailsOpen && <AccountDetails account={frontAccount} activity={getTransactionsForProfile(view)} onClose={()=>setDetailsOpen(false)}/>}
      <View style={styles.accountShowcaseHeading}>
        <Text accessibilityRole="header" style={styles.accountShowcaseTitle}>My accounts</Text>
        <Text style={styles.accountShowcaseCount}>{accounts.length} accounts</Text>
      </View>
      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel={`Total available balance ${formatDashboardCurrency(totalAvailableBalance)}`}
        style={styles.accountShowcaseBalanceRow}
      >
        <Text style={styles.accountShowcaseBalanceLabel}>Total available balance</Text>
        <Text style={styles.accountShowcaseBalanceAmount}>{formatDashboardCurrency(totalAvailableBalance)}</Text>
      </View>
      <View style={[styles.accountShowcaseList, { height: cardHeight + (stackedAccounts.length - 1) * stackOffset }]}>
        {stackedAccounts.map((account, index) => (
          <AccountShowcaseCard
            key={account.id}
            account={account}
            compact={compact}
            isFront={account.id === frontAccount.id}
            stackIndex={index}
            stackOffset={stackOffset}
            onBringForward={id => { setFrontAccountId(id); setDetailsOpen(true); }}
          />
        ))}
      </View>
    </View>
  );
}

function SavingsGoalsSection({ compact, view, onOpenPlans }: {
  compact: boolean;
  view: DashboardProfileId;
  onOpenPlans: () => void;
}) {
  const { accounts } = useAccounts();
  const savingsAccount = accounts.find((account) => account.id === 'savings');
  const plan = savingsAccount?.plan;

  if (view !== 'jane' || !savingsAccount || plan?.kind !== 'savings-goal') return null;

  const savedThisMonth = getSavingsThisMonth(view);
  const goalProgress = Math.max(0, Math.min(100, Math.round((plan.savedAmount / plan.targetAmount) * 100)));
  const monthlyProgress = Math.max(0, Math.min(100, Math.round((savedThisMonth / plan.monthlyContribution) * 100)));

  return (
    <View style={[styles.savingsGoalsSection, compact && styles.savingsGoalsSectionCompact]}>
      <View style={styles.savingsGoalsHeading}>
        <View style={styles.savingsGoalsTitleRow}>
          <View style={styles.savingsGoalsHeadingIcon}>
            <Ionicons name="flag-outline" size={17} color={colors.greenDeep} />
          </View>
          <Text style={styles.savingsGoalsTitle}>Savings goals</Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="View savings and account plans"
          onPress={onOpenPlans}
          style={styles.savingsGoalsAction}
        >
          <Text style={styles.savingsGoalsActionText}>View plan</Text>
          <Ionicons name="chevron-forward" size={14} color={colors.greenDeep} />
        </TouchableOpacity>
      </View>

      <View style={[styles.savingsGoalCard, compact && styles.savingsGoalCardCompact]}>
        <View style={styles.savingsGoalHeader}>
          <View style={styles.savingsGoalIcon}>
            <Ionicons name="airplane-outline" size={17} color={colors.greenDeep} />
          </View>
          <View style={styles.savingsGoalCopy}>
            <Text numberOfLines={1} style={styles.savingsGoalName}>{savingsAccount.name}</Text>
            <Text style={styles.savingsGoalDate}>Target {plan.targetDate}</Text>
          </View>
          <Text style={styles.savingsGoalPercent}>{goalProgress}%</Text>
        </View>

        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel={`${savingsAccount.name} overall goal progress`}
          accessibilityValue={{ min: 0, max: 100, now: goalProgress }}
          style={styles.savingsGoalTrack}
        >
          <View style={[styles.savingsGoalFill, { width: `${goalProgress}%` }]} />
        </View>
        <View style={styles.savingsGoalAmounts}>
          <Text style={styles.savingsGoalAmount}>{formatDashboardCurrency(plan.savedAmount)} saved</Text>
          <Text style={styles.savingsGoalAmount}>{formatDashboardCurrency(plan.targetAmount)} goal</Text>
        </View>

        <View style={styles.savingsGoalDivider} />

        <View style={styles.monthlySavingsHeading}>
          <View>
            <Text style={styles.monthlySavingsLabel}>Saved this month</Text>
            <Text style={styles.monthlySavingsAmount}>{formatMonthlySavings(savedThisMonth)}</Text>
          </View>
          <View style={styles.monthlyTargetCopy}>
            <Text style={styles.monthlySavingsLabel}>Monthly contribution</Text>
            <Text style={styles.monthlyTargetAmount}>{formatDashboardCurrency(plan.monthlyContribution)}</Text>
          </View>
        </View>
        <View
          accessible
          accessibilityRole="progressbar"
          accessibilityLabel="Monthly savings contribution progress"
          accessibilityValue={{ min: 0, max: 100, now: monthlyProgress }}
          style={styles.monthlySavingsTrack}
        >
          <View style={[styles.monthlySavingsFill, { width: `${monthlyProgress}%` }]} />
        </View>
        <Text style={styles.monthlySavingsFootnote}>{monthlyProgress}% of your monthly contribution goal</Text>
      </View>
    </View>
  );
}

function PaydayCountdownMeter({ compact, amount }: { compact: boolean; amount: number }) {
  const { daysUntilPayday, progress } = getPaydayCountdown();
  const countdownLabel = daysUntilPayday === 0 ? 'Payday today' : `${daysUntilPayday} ${daysUntilPayday === 1 ? 'day' : 'days'}`;

  return (
    <View style={[styles.paydayCard, compact && styles.paydayCardCompact]}>
      <View style={styles.paydayMetricsRow}>
        <View style={[styles.paydayMetric, styles.paydayPrimaryMetric]}>
          <Text numberOfLines={1} style={styles.paydayLabel}>Left before payday</Text>
          <Text numberOfLines={1} adjustsFontSizeToFit style={styles.paydayAmount}>{formatDashboardCurrency(amount)}</Text>
        </View>
        <View style={[styles.paydayMetric, styles.paydayCountdown]}>
          <Text numberOfLines={1} style={styles.paydayLabel}>Next payday</Text>
          <Text accessibilityLabel={`${countdownLabel} until payday`} style={styles.paydayCounter}>{countdownLabel}</Text>
        </View>
      </View>
      <View
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Pay cycle progress"
        accessibilityValue={{ min: 0, max: 100, now: Math.round(progress) }}
        style={styles.paydayTrack}
      >
        <View style={[styles.paydayFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
}

function DashboardProfileMenu({ view, onChange, compact }: {
  view: DashboardProfileId;
  onChange: (view: DashboardProfileId) => void;
  compact: boolean;
}) {
  const menuOptions = dashboardProfileOptions.filter((option) => ['jane', 'family', 'business'].includes(option.id));

  return (
    <View accessibilityRole="menu" accessibilityLabel="Choose a banking profile" style={[styles.profileMenu, compact && styles.profileMenuCompact]}>
      {menuOptions.map((option) => {
        const selected = view === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            accessibilityRole="menuitem"
            accessibilityLabel={`${option.name}${selected ? ', selected' : ''}`}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.id)}
            style={styles.profileMenuOption}
          >
            <View style={[styles.profileMenuIcon, selected && styles.profileMenuIconSelected]}>
              <Ionicons name={option.icon} size={16} color={selected ? colors.greenDeep : colors.textSecondary} />
            </View>
            <View style={styles.profileMenuCopy}>
              <Text style={[styles.profileMenuTitle, selected && styles.profileMenuTitleSelected]}>{option.name}</Text>
              <Text style={styles.profileMenuDetail}>{option.detail}</Text>
            </View>
            {selected ? <Ionicons name="checkmark-circle" size={18} color={colors.greenDeep} /> : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export { getDashboardRecommendation, getTediCategoryTotals, FinancialHealthCard, PaydayCountdownMeter, parseDashboardAmount };

export function ColleagueHomeDetails({ profileId, onOpenPlans, onNavigate }: {
  profileId: DashboardProfileId;
  onOpenPlans: () => void;
  onNavigate: (destination: DashboardRecommendation['destination']) => void;
}) {
  const { accounts } = useAccounts();
  const { edits } = useAccounts();
  const profileAccounts = getDashboardAccounts(profileId, accounts).map(a => ({ ...a, ...edits[a.id] }));
  const checkingBalance = parseDashboardAmount(profileAccounts.find((account) => account.id.endsWith('checking'))?.amount ?? '0');
  const creditBalance = Math.abs(parseDashboardAmount(profileAccounts.find((account) => account.id.endsWith('card'))?.amount ?? '0'));
  const savingsPlan = profileAccounts.find((account) => account.id === 'savings')?.plan;
  const plannedGoalContribution = savingsPlan?.kind === 'savings-goal' ? savingsPlan.monthlyContribution : 0;
  const upcomingBillsTotal = profileId === 'jane'
    ? upcomingBillPayments.reduce((total, bill) => total + parseDashboardAmount(bill.amount), 0)
    : 0;
  const amountBeforePayday = Math.max(0, checkingBalance - creditBalance - plannedGoalContribution - upcomingBillsTotal);
  const categoryTotals = getTediCategoryTotals(profileId);
  const personalizedOffer = getDashboardRecommendation(profileId, categoryTotals);
  const isFamily = profileId === 'family';
  const isChild = profileId === 'olivia' || profileId === 'noah';

  return (
    <View style={styles.colleagueHomeDetails}>
      <View style={styles.colleagueHomeHeading}>
        <View style={styles.colleagueHomeHeadingCopy}>
          <Text style={styles.colleagueHomeEyebrow}>CUSTOMER ACTIVITY</Text>
          <Text style={styles.colleagueHomeTitle}>Everyday overview</Text>
          <Text style={styles.colleagueHomeSubtitle}>Home information and activity for the selected customer.</Text>
        </View>
        <View accessible accessibilityRole="text" accessibilityLabel="3 unread notifications" style={styles.colleagueHomeUnread}>
          <Ionicons name="notifications-outline" size={13} color={colors.greenDeep} />
          <Text style={styles.colleagueHomeUnreadText}>3 unread</Text>
        </View>
      </View>

      {isFamily ? <FamilyMoneyHub profileId={profileId} /> : null}
      {profileId === 'jane' ? (
        <View style={styles.paydaySection}>
          <PaydayCountdownMeter compact={false} amount={amountBeforePayday} />
        </View>
      ) : (
        <FinancialHealthCard compact={false} view={profileId} />
      )}
      {!isFamily && isChild ? <FamilyMoneyHub profileId={profileId} /> : null}

      <RecentTransactionsSection compact={false} view={profileId} />
      <TediInsightsCard profileId={profileId} categoryTotals={categoryTotals} />
      <View style={styles.content}>
        <View style={styles.offersHeading}>
          <View style={styles.offersTitleGroup}>
            <View style={styles.smallTdLogo}><Text style={styles.smallTdLogoText}>TD</Text></View>
            <Text style={styles.offersTitle}>{profileId === 'business' ? 'TD for your business' : profileId === 'family' ? 'TD for your family' : isChild ? 'TD for young people' : profileId === 'jane' ? 'TD for Me' : `TD for ${dashboardProfileOptions.find((profile) => profile.id === profileId)?.name ?? 'you'}`}</Text>
          </View>
          <Text style={styles.offerCount}>1 idea</Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`${personalizedOffer.title}. ${personalizedOffer.description}`}
          accessibilityHint={`Opens ${personalizedOffer.destination}`}
          onPress={() => onNavigate(personalizedOffer.destination)}
          style={styles.offerCard}
        >
          <View style={styles.offerIcon}><Ionicons name="sparkles-outline" size={22} color={palette.green} /></View>
          <View style={styles.offerCopy}>
            <Text style={styles.offerEyebrow}>{personalizedOffer.eyebrow}</Text>
            <Text style={styles.offerTitle}>{personalizedOffer.title}</Text>
            <Text style={styles.offerDescription}>{personalizedOffer.description}</Text>
          </View>
          <Ionicons name="chevron-forward" size={17} color="rgba(28,28,28,0.58)" />
        </TouchableOpacity>
      </View>
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
  const compact = previewDeviceWidth < 420;
  const { accounts: dashboardAccounts } = useAccounts();
  const checkingBalance = parseDashboardAmount(dashboardAccounts.find((account) => account.id.endsWith('checking'))?.amount ?? '0');
  const creditBalance = Math.abs(parseDashboardAmount(dashboardAccounts.find((account) => account.id.endsWith('card'))?.amount ?? '0'));
  const savingsPlan = dashboardAccounts.find((account) => account.id === 'savings')?.plan;
  const plannedGoalContribution = savingsPlan?.kind === 'savings-goal' ? savingsPlan.monthlyContribution : 0;
  const upcomingBillsTotal = upcomingBillPayments.reduce((total, bill) => total + parseDashboardAmount(bill.amount), 0);
  const amountBeforePayday = Math.max(0, checkingBalance - creditBalance - plannedGoalContribution - upcomingBillsTotal);
  const { activeProfileId, activeProfile, selectProfile } = useDashboardProfile();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const previewTopInset = Platform.OS === 'web' ? (width < 650 ? 24 : 48) : insets.top;
  const tediCategoryTotals = getTediCategoryTotals(activeProfileId);
  const personalizedOffer = getDashboardRecommendation(activeProfileId, tediCategoryTotals);
  const profileHoverHandlers = Platform.OS === 'web'
    ? { onMouseEnter: () => setProfileMenuOpen(true), onMouseLeave: () => setProfileMenuOpen(false) }
    : {};

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + (compact ? 88 : 128) }}
      >
        <View style={[styles.hero, compact && styles.heroCompact, profileMenuOpen && styles.heroMenuOpen]}>
          <View style={[styles.heroForeground, compact && styles.heroForegroundCompact, { paddingTop: previewTopInset + (compact ? 2 : 8) }]}>
            <View style={[styles.topBar, compact && styles.topBarCompact]}>
              <View
                {...profileHoverHandlers}
                style={[styles.identity, compact && styles.identityCompact]}
              >
                <View style={styles.profileSwitcherAnchor}>
                  <View>
                    <Text style={[styles.greeting, compact && styles.greetingCompact]}>Good afternoon,</Text>
                    <View style={[styles.profileHeaderRow, compact && styles.profileHeaderRowCompact]}>
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`Open ${activeProfile.name}’s account settings`}
                        accessibilityHint="Opens account settings"
                        onPress={() => navigation.navigate('Account settings')}
                        style={styles.avatarSettingsButton}
                      >
                        <View style={[styles.customerAvatar, compact && styles.customerAvatarCompact]} accessible={false}>
                          <Text style={styles.customerAvatarInitials}>{activeProfile.initials}</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`${activeProfile.name}, ${activeProfile.relationship} view`}
                        accessibilityHint={profileMenuOpen ? 'Choose a banking profile' : 'Opens banking profiles'}
                        accessibilityState={{ expanded: profileMenuOpen }}
                        onPress={() => setProfileMenuOpen((open) => !open)}
                        style={styles.customerProfileButton}
                      >
                        <Text style={[styles.customerName, compact && styles.customerNameCompact]}>{activeProfile.name}</Text>
                        <Ionicons name={profileMenuOpen ? 'chevron-up' : 'chevron-down'} size={15} color={colors.textSecondary} />
                      </TouchableOpacity>
                      <TouchableOpacity
                        accessibilityRole="button"
                        accessibilityLabel={`${activeProfile.badge} relationship tier. View benefits`}
                        accessibilityHint="Opens relationship benefits"
                        hitSlop={8}
                        onPress={() => navigation.navigate('Benefits')}
                        style={[styles.relationshipBadge, compact && styles.relationshipBadgeCompact]}
                      >
                        <Ionicons name="ribbon-outline" size={compact ? 11 : 12} color={colors.greenDeep} />
                        <Text style={[styles.relationshipText, compact && styles.relationshipTextCompact]}>{activeProfile.badge}</Text>
                        <Ionicons name="chevron-forward" size={9} color={colors.greenDeep} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {profileMenuOpen ? (
                    <DashboardProfileMenu
                      view={activeProfileId}
                      onChange={(profileId) => {
                        selectProfile(profileId);
                        setProfileMenuOpen(false);
                      }}
                      compact={compact}
                    />
                  ) : null}
                </View>
              </View>
              <View style={[styles.topActions, compact && styles.topActionsCompact]}>
                <TouchableOpacity accessibilityRole="button" accessibilityLabel="Ask Tedi" onPress={() => navigation.navigate('Ask Tedi')} style={[styles.notificationButton, compact && styles.notificationButtonCompact]}><Ionicons name="sparkles-outline" size={19} color={colors.greenDeep}/></TouchableOpacity>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Notifications, 3 unread"
                  accessibilityHint="Opens recent alerts and account activity"
                  onPress={() => navigation.navigate('Notifications')}
                  style={[styles.notificationButton, compact && styles.notificationButtonCompact]}
                >
                  <Ionicons name="notifications-outline" size={compact ? 18 : 22} color={colors.text} />
                  <View style={styles.notificationCount}><Text style={styles.notificationCountText}>3</Text></View>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {activeProfileId === 'family' ? <FamilyMoneyHub profileId={activeProfileId} /> : null}
        <AccountCardsSection compact={compact} view={activeProfileId} />
        {activeProfileId === 'jane' ? (
          <View style={[styles.paydaySection, compact && styles.paydaySectionCompact]}>
            <PaydayCountdownMeter compact={compact} amount={amountBeforePayday} />
          </View>
        ) : null}
        {activeProfileId !== 'jane' ? <FinancialHealthCard compact={compact} view={activeProfileId} /> : null}
        <SavingsGoalsSection
          compact={compact}
          view={activeProfileId}
          onOpenPlans={() => navigation.navigate('Insights')}
        />
        {activeProfileId !== 'family' ? <FamilyMoneyHub profileId={activeProfileId} /> : null}
        <RecentTransactionsSection compact={compact} view={activeProfileId} />
        <TediInsightsCard
          key={activeProfileId}
          profileId={activeProfileId}
          categoryTotals={tediCategoryTotals}
        />
        <View style={[styles.content, compact && styles.contentCompact]}>
          <View style={styles.offersHeading}>
            <View style={styles.offersTitleGroup}>
              <View style={styles.smallTdLogo}><Text style={styles.smallTdLogoText}>TD</Text></View>
              <Text style={styles.offersTitle}>{activeProfileId === 'business' ? 'TD for your business' : activeProfileId === 'family' ? 'TD for your family' : activeProfileId === 'olivia' || activeProfileId === 'noah' ? 'TD for young people' : activeProfileId === 'jane' ? 'TD for Me' : `TD for ${activeProfile.name}`}</Text>
            </View>
            <Text style={styles.offerCount}>1 idea</Text>
          </View>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel={`${personalizedOffer.title}. ${personalizedOffer.description}`}
            accessibilityHint={`Opens ${personalizedOffer.destination}`}
            onPress={() => navigation.navigate(personalizedOffer.destination)}
            style={styles.offerCard}
          >
            <View style={styles.offerIcon}><Ionicons name="sparkles-outline" size={22} color={palette.green} /></View>
            <View style={styles.offerCopy}>
              <Text style={styles.offerEyebrow}>{personalizedOffer.eyebrow}</Text>
              <Text style={styles.offerTitle}>{personalizedOffer.title}</Text>
              <Text style={styles.offerDescription}>{personalizedOffer.description}</Text>
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
  colleagueHomeDetails: { gap: 4, paddingTop: 2, paddingBottom: 8 },
  colleagueHomeHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, paddingHorizontal: 16, paddingBottom: 8 },
  colleagueHomeHeadingCopy: { flex: 1, gap: 2 },
  colleagueHomeEyebrow: { color: colors.greenDeep, fontSize: 9, lineHeight: 13, fontFamily: font.body.bold, letterSpacing: 0.7 },
  colleagueHomeTitle: { color: palette.ink, fontSize: 16, lineHeight: 21, fontFamily: font.headline.bold },
  colleagueHomeSubtitle: { color: colors.textSecondary, fontSize: 11, lineHeight: 15 },
  colleagueHomeUnread: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 12, backgroundColor: colors.greenDim },
  colleagueHomeUnreadText: { color: colors.greenDeep, fontSize: 10, fontFamily: font.body.bold },
  hero: { minHeight: 136, position: 'relative', overflow: 'visible', zIndex: 0, backgroundColor: palette.background },
  heroMenuOpen: { zIndex: 20, elevation: 20 },
  heroForeground: { zIndex: 2, paddingBottom: 12 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  profileSwitcherAnchor: { position: 'relative' },
  greeting: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  profileHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarSettingsButton: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 24 },
  customerProfileButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 },
  relationshipBadge: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10, backgroundColor: colors.surfaceMid, borderWidth: 1, borderColor: colors.borderFaint },
  relationshipBadgeCompact: { paddingHorizontal: 6 },
  relationshipText: { color: colors.greenDeep, fontSize: 10, lineHeight: 13, fontWeight: '700', letterSpacing: 0.2 },
  relationshipTextCompact: { fontSize: 9, lineHeight: 12 },
  customerAvatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  customerAvatarInitials: { color: colors.greenDeep, fontSize: 13, lineHeight: 17, fontFamily: font.body.bold },
  customerName: { color: palette.ink, fontSize: 17, fontFamily: font.headline.bold, lineHeight: 22 },
  profileMenu: { position: 'absolute', zIndex: 20, top: 68, left: 0, minWidth: 250, padding: 6, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint, shadowColor: colors.text, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.16, shadowRadius: 12, elevation: 12 },
  profileMenuCompact: { minWidth: 225, top: 62 },
  profileMenuOption: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 8, borderRadius: 10 },
  profileMenuIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: colors.surfaceMid, alignItems: 'center', justifyContent: 'center' },
  profileMenuIconSelected: { backgroundColor: colors.greenDim },
  profileMenuCopy: { flex: 1, gap: 2 },
  profileMenuTitle: { color: colors.text, fontSize: 12, lineHeight: 16, fontFamily: font.headline.semibold },
  profileMenuTitleSelected: { color: colors.greenDeep },
  profileMenuDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  topActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  notificationButton: { width: 46, height: 46, borderRadius: 24, backgroundColor: colors.surfaceMid, alignItems: 'center', justifyContent: 'center' },
  notificationCount: { position: 'absolute', right: -1, top: -3, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.red, borderWidth: 1.5, borderColor: palette.background, alignItems: 'center', justifyContent: 'center' },
  notificationCountText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  financialHealthCard: { zIndex: 2, marginHorizontal: 16, marginTop: -26, marginBottom: 14, padding: 14, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint, gap: 10, shadowColor: colors.greenDeep, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  financialHealthCardAfterAccounts: { marginTop: 0 },
  savingsGoalsSection: { marginHorizontal: 16, marginBottom: 14, gap: 9 },
  savingsGoalsSectionCompact: { marginHorizontal: 12, marginBottom: 12, gap: 7 },
  savingsGoalsHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  savingsGoalsTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  savingsGoalsHeadingIcon: { width: 30, height: 30, borderRadius: 10, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  savingsGoalsTitle: { color: colors.text, fontSize: 16, lineHeight: 21, fontFamily: font.headline.bold },
  savingsGoalsAction: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 2, paddingHorizontal: 5 },
  savingsGoalsActionText: { color: colors.greenDeep, fontSize: 11, lineHeight: 16, fontFamily: font.headline.semibold },
  savingsGoalCard: { padding: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint, gap: 9 },
  savingsGoalCardCompact: { padding: 12, gap: 7 },
  savingsGoalHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  savingsGoalIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  savingsGoalCopy: { flex: 1, minWidth: 0, gap: 2 },
  savingsGoalName: { color: colors.text, fontSize: 13, lineHeight: 17, fontFamily: font.headline.semibold },
  savingsGoalDate: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  savingsGoalPercent: { color: colors.greenDeep, fontSize: 14, lineHeight: 18, fontFamily: font.headline.bold },
  savingsGoalTrack: { height: 7, borderRadius: 4, backgroundColor: colors.surfaceHigh, overflow: 'hidden' },
  savingsGoalFill: { height: '100%', borderRadius: 4, backgroundColor: colors.greenDeep },
  savingsGoalAmounts: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  savingsGoalAmount: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  savingsGoalDivider: { height: 1, backgroundColor: colors.borderFaint, marginVertical: 2 },
  monthlySavingsHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  monthlyTargetCopy: { alignItems: 'flex-end' },
  monthlySavingsLabel: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  monthlySavingsAmount: { color: colors.greenDeep, fontSize: 16, lineHeight: 21, fontFamily: font.headline.bold },
  monthlyTargetAmount: { color: colors.text, fontSize: 13, lineHeight: 18, fontFamily: font.headline.semibold },
  monthlySavingsTrack: { height: 5, borderRadius: 3, backgroundColor: colors.surfaceHigh, overflow: 'hidden' },
  monthlySavingsFill: { height: '100%', borderRadius: 3, backgroundColor: colors.green },
  monthlySavingsFootnote: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  healthMeterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  healthScore: { flexShrink: 0, color: colors.greenDeep, fontSize: 13, lineHeight: 16, fontFamily: font.headline.bold },
  paydaySection: { marginHorizontal: 16, marginBottom: 14 },
  paydaySectionCompact: { marginHorizontal: 12, marginBottom: 12 },
  paydayCard: { gap: 8, padding: 12, borderWidth: 1, borderColor: colors.borderFaint, borderRadius: 12, backgroundColor: colors.surface },
  paydayCardCompact: { padding: 10, gap: 7 },
  paydayMetricsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  paydayMetric: { flex: 1, minWidth: 0, gap: 2 },
  paydayPrimaryMetric: { flex: 1.2 },
  paydayCountdown: { flex: 0.8, alignItems: 'flex-end' },
  paydayLabel: { color: colors.textSecondary, fontSize: 10, lineHeight: 14, fontWeight: '700', letterSpacing: 0.2 },
  paydayAmount: { color: palette.ink, fontSize: 19, lineHeight: 24, fontFamily: font.headline.bold },
  paydayCounter: { flexShrink: 0, color: colors.greenDeep, fontSize: 14, lineHeight: 18, fontFamily: font.headline.bold },
  paydayTrack: { height: 7, borderRadius: 4, backgroundColor: colors.surfaceHigh, overflow: 'hidden' },
  paydayFill: { height: '100%', borderRadius: 4, backgroundColor: colors.greenDeep },
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
  accountShowcaseSection: { marginHorizontal: 16, marginBottom: 14, gap: 10 },
  accountShowcaseSectionCompact: { marginHorizontal: 12, marginBottom: 12, gap: 8 },
  accountShowcaseHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 },
  accountShowcaseTitle: { color: palette.ink, fontSize: 16, lineHeight: 21, fontFamily: font.headline.bold },
  accountShowcaseCount: { color: colors.textSecondary, fontSize: 11, lineHeight: 15 },
  accountShowcaseBalanceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: -6 },
  accountShowcaseBalanceLabel: { color: colors.textSecondary, fontSize: 10, lineHeight: 14, fontFamily: font.body.regular },
  accountShowcaseBalanceAmount: { color: palette.ink, fontSize: 14, lineHeight: 18, fontFamily: font.headline.bold },
  accountShowcaseList: { position: 'relative' },
  accountShowcaseTouchable: { position: 'absolute', left: 0, right: 0, borderRadius: 18, overflow: 'hidden', shadowColor: colors.greenDeep, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 9, elevation: 2 },
  accountShowcaseCard: { minHeight: 140, padding: 12, borderRadius: 18, gap: 4 },
  accountShowcaseCardCompact: { minHeight: 132, padding: 11 },
  accountShowcaseTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 2 },
  accountShowcaseIdentity: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 9 },
  accountShowcaseBrand: { width: 30, height: 30, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  accountShowcaseBrandText: { color: colors.white, fontSize: 12, fontWeight: '800', letterSpacing: -0.6 },
  accountShowcaseCopy: { flex: 1, minWidth: 0, gap: 1 },
  accountShowcaseProduct: { color: 'rgba(255,255,255,0.76)', fontSize: 9, lineHeight: 12, fontWeight: '700', letterSpacing: 0.7 },
  accountShowcaseName: { color: colors.white, fontSize: 13, lineHeight: 16, fontFamily: font.headline.semibold },
  accountShowcaseAmount: { color: colors.white, fontSize: 27, lineHeight: 32, fontFamily: font.headline.bold },
  accountShowcaseFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 1 },
  accountShowcaseAmountLabel: { color: 'rgba(255,255,255,0.78)', fontSize: 10, lineHeight: 14 },
  accountShowcaseDetail: { flexShrink: 1, color: 'rgba(255,255,255,0.84)', fontSize: 10, lineHeight: 14, textAlign: 'right' },
  accountShowcaseNote: { color: colors.white, fontSize: 10, lineHeight: 14, fontFamily: font.headline.semibold, marginTop: 1 },
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

  heroCompact: { minHeight: 96 },
  heroForegroundCompact: { paddingBottom: 8 },
  topBarCompact: { paddingHorizontal: 14 },
  identityCompact: { gap: 6 },
  greetingCompact: { fontSize: 11, lineHeight: 15 },
  profileHeaderRowCompact: { gap: 6 },
  customerAvatarCompact: { width: 40, height: 40, borderRadius: 20 },
  customerNameCompact: { fontSize: 15, lineHeight: 19 },
  topActionsCompact: { gap: 4 },
  notificationButtonCompact: { width: 44, height: 44 },
  financialHealthCardCompact: { marginHorizontal: 12, marginTop: -22, marginBottom: 12, padding: 12, gap: 8 },
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
