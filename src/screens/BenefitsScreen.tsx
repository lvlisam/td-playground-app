import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, Platform, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';

const benefits = [
  { icon: 'airplane-outline' as const, title: 'Travel with confidence', detail: 'Save on your next trip with TD Rewards', value: '2,400 pts' },
  { icon: 'leaf-outline' as const, title: 'Grow your savings', detail: 'Earn a little more on every dollar', value: '4.60% APY' },
  { icon: 'cafe-outline' as const, title: 'A treat on us', detail: 'Enjoy a local coffee this week', value: 'New' },
];

export default function BenefitsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const topInset = Platform.OS === 'web' ? 24 : insets.top;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: topInset + spacing.md, paddingBottom: insets.bottom + 92 }]}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>MADE FOR MAYA</Text>
            <Text style={[styles.title, compact && styles.titleCompact]}>Benefits</Text>
          </View>
          <View style={styles.pointsBadge}>
            <Ionicons name="sparkles-outline" size={15} color={colors.green} />
            <Text style={styles.pointsText}>18,420 pts</Text>
          </View>
        </View>

        <View style={styles.feature}>
          <View style={styles.featureIcon}><Ionicons name="gift-outline" size={24} color={colors.green} /></View>
          <Text style={styles.featureEyebrow}>YOUR TD PERKS</Text>
          <Text style={styles.featureTitle}>Good things come with your banking.</Text>
          <Text style={styles.featureDescription}>Explore rewards and offers picked for you.</Text>
          <TouchableOpacity accessibilityRole="button" style={styles.featureButton}>
            <Text style={styles.featureButtonText}>Explore rewards</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Picked for you</Text>
          <TouchableOpacity accessibilityRole="button"><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
        </View>
        <View style={styles.list}>
          {benefits.map((benefit, index) => (
            <TouchableOpacity key={benefit.title} accessibilityRole="button" style={[styles.row, index < benefits.length - 1 && styles.divider]}>
              <View style={styles.rowIcon}><Ionicons name={benefit.icon} size={20} color={colors.green} /></View>
              <View style={styles.rowCopy}>
                <Text numberOfLines={1} style={styles.rowTitle}>{benefit.title}</Text>
                <Text numberOfLines={2} style={styles.rowDetail}>{benefit.detail}</Text>
              </View>
              <View style={styles.rowEnd}>
                <Text style={styles.rowValue}>{benefit.value}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  eyebrow: { color: colors.green, fontSize: 11, fontWeight: font.weight.bold, letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: font.size.xxl, fontFamily: font.headline.bold, marginTop: 3 },
  titleCompact: { fontSize: 28 },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.greenDim },
  pointsText: { color: colors.text, fontSize: 11, fontWeight: font.weight.semibold },
  feature: { backgroundColor: colors.surface, borderRadius: radius.xl, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl },
  featureIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim, marginBottom: spacing.md },
  featureEyebrow: { color: colors.green, fontSize: 11, fontWeight: font.weight.bold, letterSpacing: 0.8 },
  featureTitle: { color: colors.text, fontSize: 22, lineHeight: 28, fontFamily: font.headline.bold, marginTop: spacing.xs },
  featureDescription: { color: colors.textSecondary, fontSize: font.size.sm, lineHeight: 20, marginTop: spacing.xs },
  featureButton: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.green, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 10, marginTop: spacing.lg },
  featureButtonText: { color: colors.text, fontSize: font.size.sm, fontWeight: font.weight.bold },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  sectionTitle: { color: colors.text, fontSize: font.size.lg, fontFamily: font.headline.bold },
  seeAll: { color: colors.green, fontSize: font.size.sm, fontWeight: font.weight.semibold },
  list: { backgroundColor: colors.surface, borderRadius: radius.lg, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  row: { minHeight: 74, flexDirection: 'row', alignItems: 'center', gap: 10 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  rowCopy: { flex: 1, minWidth: 0 },
  rowTitle: { color: colors.text, fontSize: 13, fontFamily: font.headline.semibold },
  rowDetail: { color: colors.textSecondary, fontSize: 11, lineHeight: 15, marginTop: 2 },
  rowEnd: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rowValue: { color: colors.textSecondary, fontSize: 10, fontWeight: font.weight.semibold },
});
