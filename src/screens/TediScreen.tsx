import React from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';

const shortcuts = [
  { icon: 'analytics-outline' as const, title: 'Understand my spending', detail: 'Review transactions and monthly trends', route: 'Plan' },
  { icon: 'swap-horizontal-outline' as const, title: 'Move money', detail: 'Open transfers and payments', route: 'Pay & Transfer' },
  { icon: 'gift-outline' as const, title: 'Explore my benefits', detail: 'See rewards and personalized offers', route: 'Benefits' },
  { icon: 'card-outline' as const, title: 'Manage my card', detail: 'Open your card settings', route: 'Settings' },
];

export default function TediScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const topInset = Platform.OS === 'web' ? 24 : insets.top;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, compact && styles.contentCompact, { paddingTop: topInset + spacing.lg, paddingBottom: insets.bottom + 96 }]}
      >
        <View style={styles.header}>
          <View style={[styles.assistantIcon, compact && styles.assistantIconCompact]}>
            <Ionicons name="sparkles-outline" size={compact ? 22 : 26} color={colors.greenDeep} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>YOUR TD ASSISTANT</Text>
            <Text style={[styles.title, compact && styles.titleCompact]}>Tedi</Text>
          </View>
        </View>

        <View style={[styles.welcome, compact && styles.welcomeCompact]}>
          <Text style={[styles.welcomeTitle, compact && styles.welcomeTitleCompact]}>Good afternoon, Maya.</Text>
          <Text style={styles.welcomeBody}>I can help you find the right place in your TD app. Choose a shortcut to get started.</Text>
        </View>

        <Text style={[styles.sectionTitle, compact && styles.sectionTitleCompact]}>What would you like to do?</Text>
        <View style={styles.shortcutList}>
          {shortcuts.map((shortcut, index) => (
            <TouchableOpacity
              key={shortcut.route}
              accessibilityRole="button"
              accessibilityLabel={`${shortcut.title}. ${shortcut.detail}`}
              onPress={() => navigation.navigate(shortcut.route)}
              style={[styles.shortcut, index < shortcuts.length - 1 && styles.shortcutDivider, compact && styles.shortcutCompact]}
            >
              <View style={[styles.shortcutIcon, compact && styles.shortcutIconCompact]}>
                <Ionicons name={shortcut.icon} size={compact ? 18 : 20} color={colors.greenDeep} />
              </View>
              <View style={styles.shortcutCopy}>
                <Text style={[styles.shortcutTitle, compact && styles.shortcutTitleCompact]}>{shortcut.title}</Text>
                <Text style={[styles.shortcutDetail, compact && styles.shortcutDetailCompact]}>{shortcut.detail}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  contentCompact: { paddingHorizontal: 16, gap: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  assistantIcon: { width: 54, height: 54, borderRadius: radius.xl, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  assistantIconCompact: { width: 46, height: 46, borderRadius: radius.lg },
  headerCopy: { flex: 1 },
  eyebrow: { color: colors.textSecondary, fontSize: 11, fontWeight: font.weight.bold, letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 30, lineHeight: 36, fontFamily: font.headline.bold },
  titleCompact: { fontSize: 27, lineHeight: 33 },
  welcome: { padding: spacing.lg, borderRadius: radius.xl, backgroundColor: colors.greenDeep, gap: spacing.sm },
  welcomeCompact: { padding: 16 },
  welcomeTitle: { color: colors.white, fontSize: 20, lineHeight: 26, fontFamily: font.headline.semibold },
  welcomeTitleCompact: { fontSize: 18, lineHeight: 23 },
  welcomeBody: { color: 'rgba(255,255,255,0.88)', fontSize: 14, lineHeight: 21 },
  sectionTitle: { color: colors.text, fontSize: 18, lineHeight: 24, fontFamily: font.headline.semibold },
  sectionTitleCompact: { fontSize: 17, lineHeight: 22 },
  shortcutList: { borderRadius: radius.xl, backgroundColor: colors.surface, paddingHorizontal: spacing.md, overflow: 'hidden' },
  shortcut: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  shortcutCompact: { minHeight: 70, gap: 10, paddingVertical: 10 },
  shortcutDivider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  shortcutIcon: { width: 40, height: 40, borderRadius: radius.md, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  shortcutIconCompact: { width: 34, height: 34, borderRadius: 7 },
  shortcutCopy: { flex: 1, minWidth: 0 },
  shortcutTitle: { color: colors.text, fontSize: 15, lineHeight: 20, fontWeight: font.weight.semibold },
  shortcutTitleCompact: { fontSize: 14, lineHeight: 18 },
  shortcutDetail: { color: colors.textSecondary, fontSize: 13, lineHeight: 18, marginTop: 2 },
  shortcutDetailCompact: { fontSize: 12, lineHeight: 16 },
});
