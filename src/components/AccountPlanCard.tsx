import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Account } from '../accounts';
import { colors, font, radius, spacing } from '../theme';

function money(amount: number) {
  return `$${amount.toLocaleString('en-US')}`;
}

export default function AccountPlanCard({ account }: { account: Account }) {
  const plan = account.plan;
  if (!plan) return null;

  const isSavingsGoal = plan.kind === 'savings-goal';
  const percentage = isSavingsGoal
    ? Math.min(100, Math.round((plan.savedAmount / plan.targetAmount) * 100))
    : Math.min(100, Math.round((plan.spent / plan.monthlyBudget) * 100));

  return (
    <View style={styles.card}>
      <View style={styles.heading}>
        <View style={[styles.icon, { backgroundColor: isSavingsGoal ? colors.greenDim : colors.blueDim }]}>
          <Ionicons name={isSavingsGoal ? 'airplane-outline' : 'wallet-outline'} size={18} color={isSavingsGoal ? colors.greenDeep : colors.teal} />
        </View>
        <View style={styles.headingCopy}>
          <Text numberOfLines={1} style={styles.accountName}>{account.name}</Text>
          <Text style={styles.planType}>{isSavingsGoal ? 'Savings goal' : 'Monthly spending plan'}</Text>
        </View>
        <Text style={styles.progressLabel}>{percentage}%</Text>
      </View>

      <View accessible accessibilityLabel={isSavingsGoal ? `Savings goal ${percentage} percent funded` : `Spending plan ${percentage} percent used`} style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: isSavingsGoal ? colors.greenDeep : colors.teal }]} />
      </View>

      {isSavingsGoal ? (
        <>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Saved toward goal</Text>
            <Text style={styles.metricValue}>{money(plan.savedAmount)} / {money(plan.targetAmount)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Monthly contribution</Text>
            <Text style={styles.metricValue}>{money(plan.monthlyContribution)}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Target date</Text>
            <Text style={styles.metricValue}>{plan.targetDate}</Text>
          </View>
        </>
      ) : (
        <>
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Spent this month</Text>
            <Text style={styles.metricValue}>{money(plan.spent)} / {money(plan.monthlyBudget)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Remaining in plan</Text>
            <Text style={styles.metricValue}>{money(plan.remaining)}</Text>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: spacing.sm },
  heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  headingCopy: { flex: 1, minWidth: 0, gap: 2 },
  accountName: { color: colors.text, fontSize: font.size.sm, lineHeight: 19, fontFamily: font.headline.semibold },
  planType: { color: colors.textSecondary, fontSize: font.size.xs, lineHeight: 16 },
  progressLabel: { color: colors.greenDeep, fontSize: font.size.sm, fontFamily: font.headline.semibold },
  progressTrack: { height: 8, overflow: 'hidden', borderRadius: radius.full, backgroundColor: colors.surfaceHigh },
  progressFill: { height: '100%', borderRadius: radius.full },
  metricRow: { minHeight: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  metricLabel: { flex: 1, color: colors.textSecondary, fontSize: font.size.xs },
  metricValue: { color: colors.text, fontSize: font.size.xs, fontFamily: font.body.medium, textAlign: 'right' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderFaint },
});
