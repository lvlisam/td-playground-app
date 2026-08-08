import React, { useRef } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';
import TransactionRow, { Transaction } from '../components/TransactionRow';
import GreenPill from '../components/GreenPill';

const { width } = Dimensions.get('window');

const QUICK_ACTIONS = [
  { icon: 'arrow-up-outline' as const, label: 'Send' },
  { icon: 'arrow-down-outline' as const, label: 'Receive' },
  { icon: 'receipt-outline' as const, label: 'Pay Bill' },
  { icon: 'ellipsis-horizontal' as const, label: 'More' },
];

const ACCOUNTS = [
  { id: '1', name: 'Everyday Chequing', number: '••4821', balance: 12_480.55 },
  { id: '2', name: 'TD Savings', number: '••9034', balance: 38_200.00 },
  { id: '3', name: 'TFSA', number: '••2210', balance: 74_150.80 },
];

const RECENT: Transaction[] = [
  {
    id: '1', merchant: 'Apple Store', category: 'Electronics',
    amount: -129.00, date: 'Today', icon: 'logo-apple',
    iconColor: colors.text, iconBg: colors.surfaceHigh,
  },
  {
    id: '2', merchant: 'Payroll Deposit', category: 'Income',
    amount: 3200.00, date: 'Yesterday', icon: 'briefcase-outline',
    iconColor: colors.green, iconBg: colors.greenDim,
  },
  {
    id: '3', merchant: 'Netflix', category: 'Entertainment',
    amount: -19.99, date: 'May 19', icon: 'play-circle-outline',
    iconColor: colors.red, iconBg: colors.redDim,
  },
  {
    id: '4', merchant: 'Whole Foods', category: 'Groceries',
    amount: -87.43, date: 'May 18', icon: 'basket-outline',
    iconColor: colors.orange, iconBg: colors.orangeDim,
  },
];

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <View>
            <Text style={styles.greeting}>Good morning,</Text>
            <Text style={styles.name}>Lisa</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="search-outline" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <View style={styles.notifDot} />
              <Ionicons name="notifications-outline" size={22} color={colors.text} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.avatar}>
              <Text style={styles.avatarText}>L</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Net Worth Banner */}
        <View style={styles.netWorthBanner}>
          <Text style={styles.netWorthLabel}>Total Net Worth</Text>
          <View style={styles.netWorthRow}>
            <Text style={styles.netWorthValue}>$124,831.35</Text>
            <GreenPill label="+2.4% this month" />
          </View>
        </View>

        {/* Account Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardsScroll}
          decelerationRate="fast"
          snapToInterval={width * 0.78 + spacing.md}
          snapToAlignment="start"
        >
          {ACCOUNTS.map((acct, i) => (
            <LinearGradient
              key={acct.id}
              colors={
                i === 0
                  ? ['#003D1F', '#00C853']
                  : i === 1
                  ? ['#1A1A2E', '#16213E']
                  : ['#1E1E1E', '#2A2A2A']
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.accountCard}
            >
              <View style={styles.cardTop}>
                <View>
                  <Text style={styles.cardName}>{acct.name}</Text>
                  <Text style={styles.cardNumber}>{acct.number}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.5)" />
              </View>
              <Text style={styles.cardBalance}>${acct.balance.toLocaleString('en-CA', { minimumFractionDigits: 2 })}</Text>
              {i === 0 && (
                <View style={styles.cardChip}>
                  <Ionicons name="shield-checkmark" size={12} color={colors.green} />
                  <Text style={styles.cardChipText}>CDIC Protected</Text>
                </View>
              )}
            </LinearGradient>
          ))}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            {QUICK_ACTIONS.map((a) => (
              <TouchableOpacity key={a.label} style={styles.quickAction}>
                <View style={styles.quickIconWrap}>
                  <Ionicons name={a.icon} size={22} color={colors.green} />
                </View>
                <Text style={styles.quickLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Spending Snapshot */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>May Spending</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.spendCard}>
            <View style={styles.spendRow}>
              {[
                { label: 'Spent', value: '$2,140', sub: 'of $3,000' },
                { label: 'Income', value: '$6,400', sub: '+12% vs Apr' },
                { label: 'Saved', value: '$860', sub: 'this month' },
              ].map((s) => (
                <View key={s.label} style={styles.spendItem}>
                  <Text style={styles.spendLabel}>{s.label}</Text>
                  <Text style={styles.spendValue}>{s.value}</Text>
                  <Text style={styles.spendSub}>{s.sub}</Text>
                </View>
              ))}
            </View>
            {/* Progress bar */}
            <View style={styles.progressBg}>
              <LinearGradient
                colors={[colors.green, colors.greenBright]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: '71%' }]}
              />
            </View>
            <Text style={styles.progressLabel}>71% of monthly budget used</Text>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.transCard}>
            {RECENT.map((item, i) => (
              <React.Fragment key={item.id}>
                <TransactionRow item={item} />
                {i < RECENT.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* TD Insight */}
        <View style={[styles.section, { marginBottom: 0 }]}>
          <LinearGradient
            colors={['rgba(0,200,83,0.15)', 'rgba(0,200,83,0.05)']}
            style={styles.insightCard}
          >
            <Ionicons name="bulb-outline" size={20} color={colors.green} />
            <View style={{ flex: 1, marginLeft: spacing.md }}>
              <Text style={styles.insightTitle}>TD Insight</Text>
              <Text style={styles.insightBody}>
                You spent 18% less on dining this month. Keep it up — you're on track to hit your savings goal.
              </Text>
            </View>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  greeting: { color: colors.textSecondary, fontSize: font.size.sm },
  name: { color: colors.text, fontSize: font.size.xl, fontWeight: font.weight.bold },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: { padding: spacing.xs, position: 'relative' },
  notifDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.green,
    position: 'absolute', top: 4, right: 4, zIndex: 1,
  },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: colors.green,
    alignItems: 'center', justifyContent: 'center',
    marginLeft: 4,
  },
  avatarText: { color: '#000', fontWeight: font.weight.bold, fontSize: font.size.md },

  netWorthBanner: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  netWorthLabel: { color: colors.textSecondary, fontSize: font.size.sm, marginBottom: 4 },
  netWorthRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  netWorthValue: { color: colors.text, fontSize: font.size.xxl, fontWeight: font.weight.heavy },

  cardsScroll: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingRight: spacing.xl },
  accountCard: {
    width: width * 0.78,
    borderRadius: radius.xl,
    padding: spacing.lg,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardName: { color: 'rgba(255,255,255,0.9)', fontSize: font.size.sm, fontWeight: font.weight.medium },
  cardNumber: { color: 'rgba(255,255,255,0.5)', fontSize: font.size.xs, marginTop: 2 },
  cardBalance: { color: '#fff', fontSize: font.size.xxl, fontWeight: font.weight.heavy, letterSpacing: -0.5 },
  cardChip: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  cardChipText: { color: colors.green, fontSize: font.size.xs, fontWeight: font.weight.medium },

  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.semibold },
  seeAll: { color: colors.green, fontSize: font.size.sm, fontWeight: font.weight.medium },

  quickActions: { flexDirection: 'row', justifyContent: 'space-between' },
  quickAction: { alignItems: 'center', gap: spacing.xs },
  quickIconWrap: {
    width: 60, height: 60, borderRadius: radius.lg,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  quickLabel: { color: colors.textSecondary, fontSize: font.size.xs, fontWeight: font.weight.medium },

  spendCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  spendRow: { flexDirection: 'row', marginBottom: spacing.md },
  spendItem: { flex: 1, alignItems: 'center' },
  spendLabel: { color: colors.textSecondary, fontSize: font.size.xs, marginBottom: 4 },
  spendValue: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.bold },
  spendSub: { color: colors.textTertiary, fontSize: font.size.xs, marginTop: 2 },
  progressBg: {
    height: 4, backgroundColor: colors.surfaceElevated,
    borderRadius: radius.full, overflow: 'hidden', marginBottom: 8,
  },
  progressFill: { height: '100%', borderRadius: radius.full },
  progressLabel: { color: colors.textTertiary, fontSize: font.size.xs },

  transCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    borderWidth: 1, borderColor: colors.border,
  },
  divider: { height: 1, backgroundColor: colors.borderFaint },

  insightCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.greenGlow,
  },
  insightTitle: { color: colors.green, fontSize: font.size.sm, fontWeight: font.weight.semibold, marginBottom: 4 },
  insightBody: { color: colors.textSecondary, fontSize: font.size.sm, lineHeight: 20 },
});
