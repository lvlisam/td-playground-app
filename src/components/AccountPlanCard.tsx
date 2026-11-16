import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Account, AccountPlan } from '../accounts';
import { colors, font, radius, spacing } from '../theme';

function money(amount: number) {
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function parseAmount(value: string) {
  const parsed = Number(value.replace(/[$,\s]/g, ''));
  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

type PlanDraft = {
  monthlyBudget: string;
  spent: string;
  targetAmount: string;
  savedAmount: string;
  monthlyContribution: string;
  targetDate: string;
};

function PlanEditField({
  label,
  value,
  onChangeText,
  keyboardType = 'decimal-pad',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'decimal-pad' | 'default';
}) {
  return (
    <View style={styles.editField}>
      <Text style={styles.editFieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        style={styles.editInput}
        maxLength={keyboardType === 'default' ? 24 : 12}
      />
    </View>
  );
}

export default function AccountPlanCard({
  account,
  onUpdatePlan,
}: {
  account: Account;
  onUpdatePlan: (plan: AccountPlan) => void;
}) {
  const plan = account.plan;
  const [isEditing, setIsEditing] = useState(false);
  const [editError, setEditError] = useState('');
  const [draft, setDraft] = useState<PlanDraft>({
    monthlyBudget: '',
    spent: '',
    targetAmount: '',
    savedAmount: '',
    monthlyContribution: '',
    targetDate: '',
  });
  if (!plan) return null;

  const isSavingsGoal = plan.kind === 'savings-goal';
  const percentage = isSavingsGoal
    ? Math.min(100, Math.round((plan.savedAmount / plan.targetAmount) * 100))
    : Math.min(100, Math.round((plan.spent / plan.monthlyBudget) * 100));

  function updateDraft(field: keyof PlanDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function startEditing(currentPlan: AccountPlan) {
    setDraft(currentPlan.kind === 'savings-goal'
      ? {
          monthlyBudget: '',
          spent: '',
          targetAmount: String(currentPlan.targetAmount),
          savedAmount: String(currentPlan.savedAmount),
          monthlyContribution: String(currentPlan.monthlyContribution),
          targetDate: currentPlan.targetDate,
        }
      : {
          monthlyBudget: String(currentPlan.monthlyBudget),
          spent: String(currentPlan.spent),
          targetAmount: '',
          savedAmount: '',
          monthlyContribution: '',
          targetDate: '',
        });
    setEditError('');
    setIsEditing(true);
  }

  function saveChanges(currentPlan: AccountPlan) {
    if (currentPlan.kind === 'savings-goal') {
      const targetAmount = parseAmount(draft.targetAmount);
      const savedAmount = parseAmount(draft.savedAmount);
      const monthlyContribution = parseAmount(draft.monthlyContribution);
      if (!Number.isFinite(targetAmount) || !Number.isFinite(savedAmount) || !Number.isFinite(monthlyContribution) || targetAmount <= 0 || savedAmount < 0 || monthlyContribution < 0 || !draft.targetDate.trim()) {
        setEditError('Enter a goal amount above $0, non-negative savings and contribution amounts, and a target date.');
        return;
      }
      onUpdatePlan({
        kind: 'savings-goal',
        targetAmount,
        savedAmount,
        monthlyContribution,
        targetDate: draft.targetDate.trim(),
      });
    } else {
      const monthlyBudget = parseAmount(draft.monthlyBudget);
      const spent = parseAmount(draft.spent);
      if (!Number.isFinite(monthlyBudget) || !Number.isFinite(spent) || monthlyBudget <= 0 || spent < 0 || spent > monthlyBudget) {
        setEditError('Enter a monthly budget above $0 and spending between $0 and your budget.');
        return;
      }
      onUpdatePlan({ kind: 'spending', monthlyBudget, spent, remaining: monthlyBudget - spent });
    }
    setEditError('');
    setIsEditing(false);
  }

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

      <View accessible accessibilityLabel={isSavingsGoal ? `Savings goal ${percentage}% funded` : `Spending plan ${percentage}% used`} style={styles.progressTrack}>
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

      <View style={styles.cardActions}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={`Edit ${isSavingsGoal ? 'savings goal' : 'spending plan'} for ${account.name}`}
          onPress={() => startEditing(plan)}
          style={styles.editButton}
        >
          <Ionicons name="create-outline" size={15} color={colors.greenDeep} />
          <Text style={styles.editButtonText}>Edit plan</Text>
        </TouchableOpacity>
      </View>

      {isEditing ? (
        <View style={styles.editPanel}>
          <Text style={styles.editTitle}>{isSavingsGoal ? 'Edit savings goal' : 'Edit spending plan'}</Text>
          {isSavingsGoal && plan.kind === 'savings-goal' ? (
            <>
              <PlanEditField label="Goal amount" value={draft.targetAmount} onChangeText={(value) => updateDraft('targetAmount', value)} />
              <PlanEditField label="Already saved" value={draft.savedAmount} onChangeText={(value) => updateDraft('savedAmount', value)} />
              <PlanEditField label="Monthly contribution" value={draft.monthlyContribution} onChangeText={(value) => updateDraft('monthlyContribution', value)} />
              <PlanEditField label="Target date" value={draft.targetDate} onChangeText={(value) => updateDraft('targetDate', value)} keyboardType="default" />
            </>
          ) : plan.kind === 'spending' ? (
            <>
              <PlanEditField label="Monthly budget" value={draft.monthlyBudget} onChangeText={(value) => updateDraft('monthlyBudget', value)} />
              <PlanEditField label="Spent this month" value={draft.spent} onChangeText={(value) => updateDraft('spent', value)} />
            </>
          ) : null}
          {editError ? <Text accessibilityRole="alert" style={styles.editError}>{editError}</Text> : null}
          <View style={styles.editActions}>
            <TouchableOpacity accessibilityRole="button" onPress={() => setIsEditing(false)} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" onPress={() => saveChanges(plan)} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Save plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
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
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  editButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, borderRadius: radius.md, backgroundColor: colors.greenDim },
  editButtonText: { color: colors.greenDeep, fontSize: 11, fontWeight: '700' },
  editPanel: { gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceMid },
  editTitle: { color: colors.text, fontSize: 13, lineHeight: 18, fontFamily: font.headline.semibold },
  editField: { gap: 5 },
  editFieldLabel: { color: colors.textSecondary, fontSize: 11, lineHeight: 15, fontWeight: '600' },
  editInput: { minHeight: 40, paddingHorizontal: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text, fontSize: 13 },
  editError: { color: colors.red, fontSize: 11, lineHeight: 16 },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: 2 },
  cancelButton: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  cancelButtonText: { color: colors.textSecondary, fontSize: 11, fontWeight: '600' },
  saveButton: { minHeight: 38, justifyContent: 'center', paddingHorizontal: 14, borderRadius: radius.md, backgroundColor: colors.greenDeep },
  saveButtonText: { color: colors.white, fontSize: 11, fontWeight: '700' },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: colors.borderFaint },
});
