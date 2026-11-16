import React, { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from '../theme';

export type TediProfileType = 'individual' | 'household' | 'youth' | 'business';
export type TediCategoryTotal = { category: string; amount: number };

type InsightResponse = { recommendation?: unknown; error?: unknown };

export default function TediInsightsCard({
  profileType,
  categoryTotals,
}: {
  profileType: TediProfileType;
  categoryTotals: TediCategoryTotal[];
}) {
  const [recommendation, setRecommendation] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const requestInsight = async () => {
    if (Platform.OS !== 'web') {
      setError('Tedi insights are available in the web preview.');
      return;
    }

    setIsLoading(true);
    setError('');
    setRecommendation('');

    try {
      const response = await fetch('/api/tedi-home-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileType, categoryTotals }),
      });
      const payload = (await response.json()) as InsightResponse;

      if (!response.ok) {
        const message = typeof payload.error === 'string' ? payload.error : 'Tedi could not create an insight right now.';
        throw new Error(message);
      }
      if (typeof payload.recommendation !== 'string' || payload.recommendation.trim().length === 0) {
        throw new Error('Tedi returned an empty response. Please try again.');
      }
      setRecommendation(payload.recommendation.trim());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Tedi could not connect. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.headingRow}>
        <View style={styles.icon} accessible={false}>
          <Ionicons name="sparkles-outline" size={18} color={colors.greenDeep} />
        </View>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>Tedi</Text>
          <Text accessibilityRole="header" style={styles.title}>Insights</Text>
        </View>
      </View>

      <Text style={styles.intro}>Ask Tedi for a helpful idea based on this profile&apos;s recent spending categories.</Text>

      {recommendation ? (
        <View style={styles.recommendation}>
          <Text style={styles.recommendationText}>{recommendation}</Text>
        </View>
      ) : null}
      {error ? <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={isLoading ? 'Tedi is preparing an insight' : recommendation ? 'Refresh Tedi recommendation' : 'Get a Tedi recommendation'}
        accessibilityState={{ disabled: isLoading }}
        disabled={isLoading}
        onPress={requestInsight}
        style={[styles.button, isLoading && styles.buttonDisabled]}
      >
        {isLoading ? <ActivityIndicator size="small" color={colors.white} /> : <Ionicons name="sparkles-outline" size={16} color={colors.white} />}
        <Text style={styles.buttonText}>{isLoading ? 'Tedi is thinking…' : recommendation ? 'Refresh recommendation' : 'Get recommendation'}</Text>
      </TouchableOpacity>

      <Text style={styles.privacyNote}>Only grouped category totals and profile type are sent when you ask. Merchant names, account numbers, and credentials are not included.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginHorizontal: spacing.md, marginTop: spacing.md, padding: spacing.md, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint, gap: spacing.md },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  icon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  headingCopy: { flex: 1, gap: 2 },
  eyebrow: { color: colors.greenDeep, fontSize: 9, lineHeight: 13, fontFamily: font.body.bold, letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 18, lineHeight: 23, fontFamily: font.headline.bold },
  intro: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  recommendation: { padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surfaceMid, borderLeftWidth: 3, borderLeftColor: colors.greenDeep },
  recommendationText: { color: colors.text, fontSize: 13, lineHeight: 20 },
  error: { color: colors.red, fontSize: 12, lineHeight: 17 },
  button: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.md, backgroundColor: colors.greenDeep },
  buttonDisabled: { opacity: 0.72 },
  buttonText: { color: colors.white, fontSize: 13, lineHeight: 18, fontFamily: font.body.bold },
  privacyNote: { color: colors.textSecondary, fontSize: 10, lineHeight: 15 },
});
