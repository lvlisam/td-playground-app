import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from '../theme';

const goalOptions = [
  {
    id: 'family',
    title: 'Growing our family',
    description: 'Prepare for a new chapter',
    icon: 'heart-outline',
    target: 12000,
    months: 24,
  },
  {
    id: 'home',
    title: 'Family home',
    description: 'Save toward a place of your own',
    icon: 'home-outline',
    target: 100000,
    months: 60,
  },
  {
    id: 'education',
    title: 'Education',
    description: 'Plan for learning costs',
    icon: 'school-outline',
    target: 30000,
    months: 120,
  },
  {
    id: 'safety',
    title: 'Family safety net',
    description: 'Build a rainy-day cushion',
    icon: 'shield-checkmark-outline',
    target: 20000,
    months: 36,
  },
] as const;

type GoalOption = (typeof goalOptions)[number];
type RecommendationResponse = { recommendation?: unknown; error?: unknown };

function parseAmount(value: string) {
  const parsed = Number(value.replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString('en-CA')}`;
}

export default function FamilyPlanBuilder() {
  const [selectedGoal, setSelectedGoal] = useState<GoalOption>(goalOptions[1]);
  const [targetAmount, setTargetAmount] = useState(String(goalOptions[1].target));
  const [currentSavings, setCurrentSavings] = useState('53220');
  const [timeHorizon, setTimeHorizon] = useState(String(goalOptions[1].months));
  const [recommendation, setRecommendation] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const target = parseAmount(targetAmount);
  const saved = parseAmount(currentSavings);
  const months = Number.parseInt(timeHorizon, 10);
  const isValid = target > 0 && saved >= 0 && Number.isInteger(months) && months > 0 && months <= 600;
  const monthlyTarget = useMemo(
    () => (isValid ? Math.ceil(Math.max(0, target - saved) / months) : 0),
    [isValid, target, saved, months],
  );

  function selectGoal(goal: GoalOption) {
    setSelectedGoal(goal);
    setTargetAmount(String(goal.target));
    setTimeHorizon(String(goal.months));
    setRecommendation('');
    setError('');
  }

  async function createPlan() {
    if (!isValid) {
      setError('Enter a goal amount, current savings, and a timeline of 1 to 600 months.');
      return;
    }
    if (Platform.OS !== 'web') {
      setError('AI planning is available in the web app.');
      return;
    }

    setIsLoading(true);
    setRecommendation('');
    setError('');

    try {
      const response = await fetch('/api/plan-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal: selectedGoal.title,
          targetAmount: target,
          currentSavings: saved,
          months,
        }),
      });
      const payload = (await response.json()) as RecommendationResponse;

      if (!response.ok) {
        const message = typeof payload.error === 'string' ? payload.error : 'We could not create your plan right now.';
        throw new Error(message);
      }
      if (typeof payload.recommendation !== 'string' || payload.recommendation.trim().length === 0) {
        throw new Error('The planning service returned an empty response. Please try again.');
      }
      setRecommendation(payload.recommendation.trim());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'We could not connect to AI planning. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardHeading}>
        <View style={styles.headingIcon}>
          <Ionicons name="sparkles-outline" size={19} color={colors.greenDeep} />
        </View>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>AI PLAN BUILDER</Text>
          <Text style={styles.cardTitle}>Make a plan for what matters</Text>
        </View>
      </View>
      <Text style={styles.intro}>Choose a family goal, then get practical next steps and a monthly savings pace.</Text>

      <Text style={styles.fieldLabel}>Choose a goal</Text>
      <View style={styles.goalGrid} accessibilityRole="radiogroup" accessibilityLabel="Family planning goals">
        {goalOptions.map((goal) => {
          const selected = selectedGoal.id === goal.id;
          return (
            <TouchableOpacity
              key={goal.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${goal.title}. ${goal.description}`}
              onPress={() => selectGoal(goal)}
              style={[styles.goalOption, selected && styles.goalOptionSelected]}
            >
              <Ionicons name={goal.icon} size={17} color={selected ? colors.greenDeep : colors.textSecondary} />
              <Text numberOfLines={1} style={[styles.goalTitle, selected && styles.goalTitleSelected]}>{goal.title}</Text>
              <Text numberOfLines={2} style={styles.goalDescription}>{goal.description}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.exampleNotice}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.exampleText}>Example numbers from the demo account. Edit them to fit your plan.</Text>
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputField}>
          <Text style={styles.fieldLabel}>Goal amount</Text>
          <View style={styles.inputShell}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              accessibilityLabel="Goal amount in dollars"
              keyboardType="decimal-pad"
              value={targetAmount}
              onChangeText={setTargetAmount}
              style={styles.input}
              placeholder="100000"
              placeholderTextColor={colors.textTertiary}
              maxLength={10}
            />
          </View>
        </View>
        <View style={styles.inputField}>
          <Text style={styles.fieldLabel}>Already saved</Text>
          <View style={styles.inputShell}>
            <Text style={styles.currencyPrefix}>$</Text>
            <TextInput
              accessibilityLabel="Current savings in dollars"
              keyboardType="decimal-pad"
              value={currentSavings}
              onChangeText={setCurrentSavings}
              style={styles.input}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
              maxLength={10}
            />
          </View>
        </View>
      </View>

      <View style={styles.inputField}>
        <Text style={styles.fieldLabel}>Time horizon in months</Text>
        <View style={styles.inputShell}>
          <TextInput
            accessibilityLabel="Time horizon in months"
            keyboardType="number-pad"
            value={timeHorizon}
            onChangeText={setTimeHorizon}
            style={styles.input}
            placeholder="60"
            placeholderTextColor={colors.textTertiary}
            maxLength={3}
          />
          <Text style={styles.inputSuffix}>months</Text>
        </View>
      </View>

      <View style={styles.monthlyPreview}>
        <View>
          <Text style={styles.monthlyLabel}>Suggested monthly pace</Text>
          <Text style={styles.monthlyDetail}>Based on your target and timeline</Text>
        </View>
        <Text style={styles.monthlyAmount}>{formatCurrency(monthlyTarget)}<Text style={styles.monthlySuffix}> / mo</Text></Text>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityState={{ disabled: isLoading || !isValid, busy: isLoading }}
        onPress={createPlan}
        disabled={isLoading || !isValid}
        style={[styles.generateButton, (isLoading || !isValid) && styles.generateButtonDisabled]}
      >
        {isLoading ? <ActivityIndicator color={colors.white} size="small" /> : <Ionicons name="sparkles" size={17} color={colors.white} />}
        <Text style={styles.generateButtonText}>{isLoading ? 'Building your plan…' : 'Get AI recommendations'}</Text>
      </TouchableOpacity>

      <Text style={styles.privacyNote}>Only these goal details are sent to AI. Don&apos;t enter account numbers or personal IDs.</Text>

      {error ? (
        <View style={styles.errorBox} accessibilityRole="alert">
          <Ionicons name="alert-circle-outline" size={17} color={colors.red} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {recommendation ? (
        <View style={styles.recommendationCard} accessibilityLiveRegion="polite">
          <View style={styles.recommendationHeader}>
            <View style={styles.recommendationIcon}>
              <Ionicons name="sparkles" size={17} color={colors.greenDeep} />
            </View>
            <View style={styles.recommendationCopy}>
              <Text style={styles.recommendationEyebrow}>YOUR NEXT STEPS</Text>
              <Text style={styles.recommendationTitle}>{selectedGoal.title}</Text>
            </View>
          </View>
          <Text style={styles.recommendationText}>{recommendation}</Text>
          <Text style={styles.recommendationDisclaimer}>Educational guidance only — not investment, tax, or legal advice.</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderFaint,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headingIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  headingCopy: { flex: 1, minWidth: 0, gap: 2 },
  eyebrow: { color: colors.greenDeep, fontSize: 10, lineHeight: 14, fontWeight: '700', letterSpacing: 0.8 },
  cardTitle: { color: colors.text, fontSize: 17, lineHeight: 22, fontFamily: font.headline.bold },
  intro: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  fieldLabel: { color: colors.text, fontSize: 12, lineHeight: 16, fontWeight: '600', marginBottom: 6 },
  goalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  goalOption: { width: '47%', minHeight: 88, padding: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 4 },
  goalOptionSelected: { borderColor: colors.greenDeep, backgroundColor: colors.greenDim },
  goalTitle: { color: colors.text, fontSize: 12, lineHeight: 16, fontWeight: '600' },
  goalTitleSelected: { color: colors.greenDeep },
  goalDescription: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  exampleNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  exampleText: { flex: 1, color: colors.textSecondary, fontSize: 11, lineHeight: 16 },
  inputRow: { flexDirection: 'row', gap: spacing.sm },
  inputField: { flex: 1, minWidth: 0 },
  inputShell: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  currencyPrefix: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  input: { flex: 1, minWidth: 0, paddingVertical: 9, color: colors.text, fontSize: 14, fontFamily: font.body.medium },
  inputSuffix: { color: colors.textSecondary, fontSize: 11 },
  monthlyPreview: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm, padding: 12, borderRadius: radius.md, backgroundColor: colors.surfaceMid },
  monthlyLabel: { color: colors.text, fontSize: 12, lineHeight: 17, fontWeight: '600' },
  monthlyDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 14, marginTop: 2 },
  monthlyAmount: { color: colors.greenDeep, fontSize: 17, lineHeight: 22, fontFamily: font.headline.bold, flexShrink: 0 },
  monthlySuffix: { color: colors.textSecondary, fontSize: 11, fontFamily: font.body.regular },
  generateButton: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14, borderRadius: radius.md, backgroundColor: colors.greenDeep },
  generateButtonDisabled: { opacity: 0.55 },
  generateButtonText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  privacyNote: { color: colors.textSecondary, fontSize: 10, lineHeight: 15, textAlign: 'center' },
  errorBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 11, borderRadius: radius.md, backgroundColor: colors.redDim },
  errorText: { flex: 1, color: colors.text, fontSize: 12, lineHeight: 17 },
  recommendationCard: { padding: 14, borderRadius: radius.md, backgroundColor: colors.surfaceMid, gap: 10 },
  recommendationHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  recommendationIcon: { width: 32, height: 32, borderRadius: 11, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  recommendationCopy: { flex: 1, minWidth: 0, gap: 1 },
  recommendationEyebrow: { color: colors.greenDeep, fontSize: 9, lineHeight: 13, fontWeight: '700', letterSpacing: 0.7 },
  recommendationTitle: { color: colors.text, fontSize: 14, lineHeight: 19, fontFamily: font.headline.semibold },
  recommendationText: { color: colors.text, fontSize: 13, lineHeight: 20 },
  recommendationDisclaimer: { color: colors.textSecondary, fontSize: 10, lineHeight: 15 },
});
