import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Account, AccountId } from '../accounts';
import { colors, font, radius, spacing } from '../theme';

const previousMonthBalances: Record<AccountId, number> = {
  checking: 6602.17,
  savings: 52980,
  card: -1540,
};

const accountIcons: Record<AccountId, keyof typeof Ionicons.glyphMap> = {
  checking: 'wallet-outline',
  savings: 'leaf-outline',
  card: 'card-outline',
};

function parseBalance(value: string) {
  return Number(value.replace(/−/g, '-').replace(/[^0-9.-]/g, ''));
}

function formatCurrency(value: number) {
  return `${value < 0 ? '−' : ''}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatChange(value: number) {
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function AccountMonthOverMonth({ accounts }: { accounts: Account[] }) {
  const currentNet = accounts.reduce((total, account) => total + parseBalance(account.amount), 0);
  const previousNet = accounts.reduce((total, account) => total + previousMonthBalances[account.id], 0);
  const currentAssets = accounts.reduce((total, account) => total + Math.max(0, parseBalance(account.amount)), 0);
  const previousAssets = accounts.reduce((total, account) => total + Math.max(0, previousMonthBalances[account.id]), 0);
  const currentDebt = accounts.reduce((total, account) => total + Math.max(0, -parseBalance(account.amount)), 0);
  const previousDebt = accounts.reduce((total, account) => total + Math.max(0, -previousMonthBalances[account.id]), 0);
  const netChange = currentNet - previousNet;
  const netChangePercent = previousNet === 0 ? 0 : (netChange / previousNet) * 100;

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.headingIcon}>
          <Ionicons name="analytics-outline" size={19} color={colors.greenDeep} />
        </View>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>MONTH OVER MONTH</Text>
          <Text style={styles.title}>November vs. October</Text>
        </View>
        <Ionicons name="calendar-outline" size={17} color={colors.textSecondary} />
      </View>

      <View style={styles.netBalanceCard}>
        <Text style={styles.metricLabel}>Overall account balance</Text>
        <Text accessibilityLabel={`Overall account balance ${formatCurrency(currentNet)}`} style={styles.netBalance}>{formatCurrency(currentNet)}</Text>
        <View style={styles.changeLine}>
          <View style={styles.changePill}>
            <Ionicons name="trending-up" size={14} color={colors.greenDeep} />
            <Text style={styles.changeText}>{formatChange(netChange)}</Text>
          </View>
          <Text style={styles.changeCaption}>{netChangePercent.toFixed(1)}% vs. October</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryMetric}>
          <Text style={styles.summaryLabel}>Total assets</Text>
          <Text style={styles.summaryValue}>{formatCurrency(currentAssets)}</Text>
          <Text style={styles.summaryChange}>{formatChange(currentAssets - previousAssets)} vs. Oct</Text>
        </View>
        <View style={styles.summaryDivider} />
        <View style={styles.summaryMetric}>
          <Text style={styles.summaryLabel}>Credit balance</Text>
          <Text style={styles.summaryValue}>{formatCurrency(currentDebt)}</Text>
          <Text style={styles.summaryChange}>{currentDebt <= previousDebt ? `Debt down ${formatCurrency(previousDebt - currentDebt)}` : `Debt up ${formatCurrency(currentDebt - previousDebt)}`}</Text>
        </View>
      </View>

      <View style={styles.accountsHeading}>
        <Text style={styles.accountsTitle}>By account</Text>
        <View style={styles.legend}>
          <View style={[styles.legendDot, styles.previousDot]} />
          <Text style={styles.legendText}>Oct</Text>
          <View style={[styles.legendDot, styles.currentDot]} />
          <Text style={styles.legendText}>Nov</Text>
        </View>
      </View>

      <View style={styles.accountList}>
        {accounts.map((account) => {
          const current = parseBalance(account.amount);
          const previous = previousMonthBalances[account.id];
          const change = current - previous;
          const maxBalance = Math.max(Math.abs(current), Math.abs(previous), 1);
          const previousWidth = `${Math.max(2, (Math.abs(previous) / maxBalance) * 100)}%` as `${number}%`;
          const currentWidth = `${Math.max(2, (Math.abs(current) / maxBalance) * 100)}%` as `${number}%`;
          const isDebt = account.id === 'card';

          return (
            <View key={account.id} style={styles.accountRow}>
              <View style={styles.accountTopRow}>
                <View style={styles.accountIcon}>
                  <Ionicons name={accountIcons[account.id]} size={16} color={colors.greenDeep} />
                </View>
                <View style={styles.accountCopy}>
                  <Text numberOfLines={1} style={styles.accountName}>{account.name}</Text>
                  <Text style={styles.accountValues}>Nov {formatCurrency(current)} · Oct {formatCurrency(previous)}</Text>
                </View>
                <Text style={[styles.accountChange, isDebt && change > 0 && styles.accountChangePositive]}>{isDebt ? `${change >= 0 ? 'Debt down' : 'Debt up'} ${formatCurrency(Math.abs(change))}` : formatChange(change)}</Text>
              </View>
              <View accessible={false} style={styles.barPair}>
                <View style={styles.barTrack}><View style={[styles.bar, styles.previousBar, { width: previousWidth }]} /></View>
                <View style={styles.barTrack}><View style={[styles.bar, styles.currentBar, { width: currentWidth }]} /></View>
              </View>
            </View>
          );
        })}
      </View>

      <Text style={styles.disclaimer}>Illustrative account data for this preview, not live banking information.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint, gap: spacing.md },
  heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headingIcon: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  headingCopy: { flex: 1, gap: 1 },
  eyebrow: { color: colors.greenDeep, fontSize: 9, lineHeight: 13, fontFamily: font.body.bold, letterSpacing: 0.7 },
  title: { color: colors.text, fontSize: 15, lineHeight: 20, fontFamily: font.headline.semibold },
  netBalanceCard: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceMid, gap: 4 },
  metricLabel: { color: colors.textSecondary, fontSize: 11, lineHeight: 16 },
  netBalance: { color: colors.text, fontSize: 27, lineHeight: 34, fontFamily: font.headline.bold, letterSpacing: -0.5 },
  changeLine: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: 3 },
  changePill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.full, backgroundColor: colors.greenDim },
  changeText: { color: colors.greenDeep, fontSize: 11, fontFamily: font.body.bold },
  changeCaption: { color: colors.textSecondary, fontSize: 10 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  summaryMetric: { flex: 1, gap: 3 },
  summaryLabel: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  summaryValue: { color: colors.text, fontSize: 15, lineHeight: 20, fontFamily: font.headline.semibold },
  summaryChange: { color: colors.greenDeep, fontSize: 9, lineHeight: 13, fontFamily: font.body.medium },
  summaryDivider: { width: StyleSheet.hairlineWidth, alignSelf: 'stretch', backgroundColor: colors.border },
  accountsHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, paddingTop: 2 },
  accountsTitle: { color: colors.text, fontSize: 13, fontFamily: font.headline.semibold },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: radius.full },
  previousDot: { backgroundColor: colors.surfaceElevated },
  currentDot: { backgroundColor: colors.greenDeep },
  legendText: { color: colors.textSecondary, fontSize: 9, marginRight: 3 },
  accountList: { gap: 11 },
  accountRow: { gap: 6 },
  accountTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accountIcon: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', borderRadius: radius.sm, backgroundColor: colors.greenDim },
  accountCopy: { flex: 1, minWidth: 0, gap: 1 },
  accountName: { color: colors.text, fontSize: 11, lineHeight: 15, fontFamily: font.body.medium },
  accountValues: { color: colors.textSecondary, fontSize: 9, lineHeight: 13 },
  accountChange: { color: colors.text, fontSize: 9, fontFamily: font.body.bold, textAlign: 'right' },
  accountChangePositive: { color: colors.greenDeep },
  barPair: { gap: 3, paddingLeft: 38 },
  barTrack: { height: 4, overflow: 'hidden', borderRadius: radius.full, backgroundColor: colors.surfaceMid },
  bar: { height: '100%', borderRadius: radius.full },
  previousBar: { backgroundColor: colors.surfaceElevated },
  currentBar: { backgroundColor: colors.greenDeep },
  disclaimer: { color: colors.textSecondary, fontSize: 9, lineHeight: 14 },
});
