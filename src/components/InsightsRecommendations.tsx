import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Account } from '../accounts';
import type { DashboardProfile } from '../personas';
import { colors, font, radius, spacing } from '../theme';

export type RecommendationFocus = 'savings' | 'spending' | 'rewards';

type Recommendation = {
  focus: RecommendationFocus;
  category: string;
  title: string;
  description: string;
  rationale: string;
  icon: keyof typeof Ionicons.glyphMap;
  actionLabel: string;
};

const focusOptions: { id: RecommendationFocus; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'savings', label: 'Grow savings', icon: 'leaf-outline' },
  { id: 'spending', label: 'Manage spending', icon: 'wallet-outline' },
  { id: 'rewards', label: 'Review rewards', icon: 'sparkles-outline' },
];

function formatCurrency(amount: number) {
  return `$${amount.toLocaleString('en-US')}`;
}

function buildRecommendations(accounts: Account[]): Recommendation[] {
  const savings = accounts.find((account) => account.id === 'savings');
  const savingsPlan = savings?.plan?.kind === 'savings-goal' ? savings.plan : null;
  const spending = accounts.find((account) => account.id === 'checking');
  const spendingPlan = spending?.plan?.kind === 'spending' ? spending.plan : null;
  const card = accounts.find((account) => account.id === 'card');

  return [
    {
      focus: 'savings',
      category: 'SAVINGS',
      title: 'Savings account options',
      description: 'Explore ways to keep a dedicated goal separate from everyday spending.',
      rationale: savingsPlan && savings
        ? `${savings.name} has a ${formatCurrency(savingsPlan.targetAmount)} goal, with ${formatCurrency(savingsPlan.savedAmount)} saved so far.`
        : 'A dedicated savings option can make it easier to track money set aside for a goal.',
      icon: 'leaf-outline',
      actionLabel: 'Review savings account',
    },
    {
      focus: 'spending',
      category: 'EVERYDAY BANKING',
      title: 'Everyday banking options',
      description: 'Review account features that can support regular spending and bill payments.',
      rationale: spendingPlan && spending
        ? `${spending.name} has used ${formatCurrency(spendingPlan.spent)} of its ${formatCurrency(spendingPlan.monthlyBudget)} monthly plan.`
        : 'An everyday account can help keep routine transactions in one place.',
      icon: 'wallet-outline',
      actionLabel: 'Review everyday account',
    },
    {
      focus: 'rewards',
      category: 'CREDIT CARDS',
      title: 'Rewards card options',
      description: 'Compare rewards features with the purchases and benefits that matter to you.',
      rationale: card?.note
        ? `${card.name} currently lists ${card.note}. Consider whether its rewards and features fit your priorities.`
        : 'Review your card features and rewards to see whether they match your priorities.',
      icon: 'sparkles-outline',
      actionLabel: 'Review card details',
    },
  ];
}

function ProgressStep({ number, label, complete }: { number: number; label: string; complete: boolean }) {
  return (
    <View style={styles.progressStep}>
      <View style={[styles.stepNumber, complete && styles.stepNumberComplete]}>
        {complete ? <Ionicons name="checkmark" size={12} color={colors.white} /> : <Text style={styles.stepNumberText}>{number}</Text>}
      </View>
      <Text style={[styles.stepLabel, complete && styles.stepLabelComplete]}>{label}</Text>
    </View>
  );
}

export default function InsightsRecommendations({
  accounts,
  activeProfile,
  onExplore,
}: {
  accounts: Account[];
  activeProfile: DashboardProfile;
  onExplore: (focus: RecommendationFocus) => void;
}) {
  const recommendations = useMemo(() => buildRecommendations(accounts), [accounts]);
  const [selectedFocus, setSelectedFocus] = useState<RecommendationFocus | null>(null);
  const [reviewedFocus, setReviewedFocus] = useState<RecommendationFocus | null>(null);
  const [expandedFocus, setExpandedFocus] = useState<RecommendationFocus | null>(null);
  const [exploredFocus, setExploredFocus] = useState<RecommendationFocus | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.onboardingCard}>
        <View style={styles.onboardingHeading}>
          <View style={styles.onboardingIcon} accessible={false}>
            <Ionicons name="sparkles-outline" size={19} color={colors.greenDeep} />
          </View>
          <View style={styles.onboardingHeadingCopy}>
            <Text style={styles.eyebrow}>GETTING STARTED</Text>
            <Text accessibilityRole="header" style={styles.onboardingTitle}>Make Insights yours</Text>
          </View>
          <Text style={styles.progressCount}>
            {[selectedFocus !== null, reviewedFocus === selectedFocus && selectedFocus !== null, exploredFocus === selectedFocus && selectedFocus !== null].filter(Boolean).length}/3
          </Text>
        </View>
        <Text style={styles.onboardingText}>Choose what matters to you, then review a few ideas based on {activeProfile.name}&apos;s account snapshot.</Text>
        <View style={styles.progressRow} accessibilityLabel="Insights setup progress">
          <ProgressStep number={1} label="Choose a focus" complete={selectedFocus !== null} />
          <View style={styles.progressLine} />
          <ProgressStep number={2} label="Review a match" complete={reviewedFocus === selectedFocus && selectedFocus !== null} />
          <View style={styles.progressLine} />
          <ProgressStep number={3} label="Explore details" complete={exploredFocus === selectedFocus && selectedFocus !== null} />
        </View>
        <Text style={styles.focusPrompt}>What would you like to focus on?</Text>
        <View style={styles.focusOptions}>
          {focusOptions.map((option) => {
            const selected = selectedFocus === option.id;
            return (
              <TouchableOpacity
                key={option.id}
                accessibilityRole="button"
                accessibilityState={{ selected }}
                onPress={() => {
                  setSelectedFocus(option.id);
                  setExpandedFocus(null);
                }}
                style={[styles.focusButton, selected && styles.focusButtonSelected]}
              >
                <Ionicons name={option.icon} size={15} color={selected ? colors.greenDeep : colors.textSecondary} />
                <Text style={[styles.focusButtonText, selected && styles.focusButtonTextSelected]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.recommendationsHeading}>
        <View style={styles.recommendationsHeadingCopy}>
          <Text style={styles.sectionTitle}>Product recommendations</Text>
          <Text style={styles.sectionSubtitle}>A few ideas for {activeProfile.name}, based on the priorities you choose.</Text>
        </View>
        <View style={styles.ideaCount}>
          <Text style={styles.ideaCountText}>{recommendations.length} ideas</Text>
        </View>
      </View>

      {recommendations.map((recommendation) => {
        const selected = selectedFocus === recommendation.focus;
        const expanded = expandedFocus === recommendation.focus;
        return (
          <View key={recommendation.focus} style={[styles.recommendationCard, selected && styles.recommendationCardSelected]}>
            <View style={styles.cardHeading}>
              <View style={[styles.productIcon, selected && styles.productIconSelected]} accessible={false}>
                <Ionicons name={recommendation.icon} size={19} color={colors.greenDeep} />
              </View>
              <View style={styles.cardHeadingCopy}>
                <Text style={styles.category}>{recommendation.category}</Text>
                <Text accessibilityRole="header" style={styles.recommendationTitle}>{recommendation.title}</Text>
              </View>
            </View>
            {selected ? <View style={styles.matchBadge}><Text style={styles.matchBadgeText}>YOUR FOCUS</Text></View> : null}
            <Text style={styles.recommendationDescription}>{recommendation.description}</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityState={{ expanded }}
              onPress={() => {
                setExpandedFocus(expanded ? null : recommendation.focus);
                if (!expanded) setReviewedFocus(recommendation.focus);
              }}
              style={styles.whyButton}
            >
              <Text style={styles.whyButtonText}>{expanded ? 'Hide why this may fit' : 'Why this may fit'}</Text>
              <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={15} color={colors.greenDeep} />
            </TouchableOpacity>
            {expanded ? (
              <View style={styles.rationale}>
                <Text style={styles.rationaleLabel}>A starting point for {activeProfile.name}</Text>
                <Text style={styles.rationaleText}>{recommendation.rationale}</Text>
              </View>
            ) : null}
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => {
                setExploredFocus(recommendation.focus);
                onExplore(recommendation.focus);
              }}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>{recommendation.actionLabel}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
        );
      })}

      <View style={styles.disclaimer}>
        <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
        <Text style={styles.disclaimerText}>These are illustrative ideas based on the sample account data in this preview, not personalized financial advice or current product offers. Check TD for current rates, fees, eligibility, and terms.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  onboardingCard: { marginHorizontal: spacing.md, padding: spacing.md, borderRadius: radius.xl, backgroundColor: colors.greenDim, gap: spacing.md },
  onboardingHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  onboardingIcon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  onboardingHeadingCopy: { flex: 1, gap: 2 },
  eyebrow: { color: colors.greenDeep, fontSize: 9, lineHeight: 13, fontFamily: font.body.bold, letterSpacing: 0.8 },
  onboardingTitle: { color: colors.text, fontSize: 17, lineHeight: 22, fontFamily: font.headline.bold },
  progressCount: { color: colors.greenDeep, fontSize: 12, fontFamily: font.body.bold },
  onboardingText: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  progressStep: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepNumber: { width: 18, height: 18, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  stepNumberComplete: { backgroundColor: colors.greenDeep, borderColor: colors.greenDeep },
  stepNumberText: { color: colors.textSecondary, fontSize: 9, fontFamily: font.body.bold },
  stepLabel: { color: colors.textSecondary, fontSize: 9, lineHeight: 12 },
  stepLabelComplete: { color: colors.greenDeep, fontFamily: font.body.bold },
  progressLine: { flex: 1, minWidth: 3, height: 1, backgroundColor: colors.border },
  focusPrompt: { color: colors.text, fontSize: 12, fontFamily: font.body.bold },
  focusOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  focusButton: { minHeight: 38, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingHorizontal: 10, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  focusButtonSelected: { borderColor: colors.greenDeep, backgroundColor: colors.surface },
  focusButtonText: { color: colors.textSecondary, fontSize: 10, fontFamily: font.body.medium },
  focusButtonTextSelected: { color: colors.greenDeep, fontFamily: font.body.bold },
  recommendationsHeading: { marginHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  recommendationsHeadingCopy: { flex: 1, gap: 2 },
  sectionTitle: { color: colors.text, fontSize: 18, lineHeight: 24, fontFamily: font.headline.bold },
  sectionSubtitle: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  ideaCount: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.full, backgroundColor: colors.surfaceMid },
  ideaCountText: { color: colors.textSecondary, fontSize: 10, fontFamily: font.body.medium },
  recommendationCard: { marginHorizontal: spacing.md, padding: spacing.md, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.borderFaint, backgroundColor: colors.surface, gap: spacing.sm },
  recommendationCardSelected: { borderColor: colors.greenDeep, backgroundColor: colors.greenDim },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  productIcon: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surfaceMid },
  productIconSelected: { backgroundColor: colors.greenDim },
  cardHeadingCopy: { flex: 1, minWidth: 0, gap: 2 },
  category: { color: colors.greenDeep, fontSize: 9, lineHeight: 12, fontFamily: font.body.bold, letterSpacing: 0.7 },
  recommendationTitle: { color: colors.text, fontSize: 15, lineHeight: 20, fontFamily: font.headline.semibold },
  matchBadge: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: radius.full, backgroundColor: colors.greenDim },
  matchBadgeText: { color: colors.greenDeep, fontSize: 8, lineHeight: 11, fontFamily: font.body.bold, letterSpacing: 0.4 },
  recommendationDescription: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  whyButton: { minHeight: 36, flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start' },
  whyButtonText: { color: colors.greenDeep, fontSize: 11, fontFamily: font.body.bold },
  rationale: { padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceMid, gap: 3 },
  rationaleLabel: { color: colors.text, fontSize: 10, fontFamily: font.body.bold },
  rationaleText: { color: colors.textSecondary, fontSize: 11, lineHeight: 16 },
  actionButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.greenDeep },
  actionButtonText: { color: colors.white, fontSize: 12, fontFamily: font.body.bold },
  disclaimer: { marginHorizontal: spacing.md, flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  disclaimerText: { flex: 1, color: colors.textSecondary, fontSize: 10, lineHeight: 15 },
});
