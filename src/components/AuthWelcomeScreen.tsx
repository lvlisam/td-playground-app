import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from '../theme';

type AuthWelcomeScreenProps = {
  onSignIn: () => void;
  onSignUp: () => void;
  onClose: () => void;
};

const onboardingItems = [
  { icon: 'grid-outline' as const, title: 'Explore your money view', detail: 'Get familiar with the app dashboard and helpful insights.' },
  { icon: 'person-circle-outline' as const, title: 'Make it your own', detail: 'Create an app profile to keep your experience together.' },
  { icon: 'shield-checkmark-outline' as const, title: 'Stay in control', detail: 'Use a secure email and password for this app account.' },
];

export default function AuthWelcomeScreen({ onSignIn, onSignUp, onClose }: AuthWelcomeScreenProps) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.brandLockup}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>TD</Text>
          </View>
          <Text style={styles.brandLabel}>MOBILE BANKING</Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Close login and sign-up"
          onPress={onClose}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={21} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Ionicons name="leaf-outline" size={25} color={colors.greenDeep} />
        </View>
        <Text accessibilityRole="header" style={styles.title}>Welcome to your TD app</Text>
        <Text style={styles.subtitle}>A simpler way to explore your money and make the experience your own.</Text>
      </View>

      <View style={styles.onboardingList}>
        {onboardingItems.map((item) => (
          <View key={item.title} style={styles.onboardingItem}>
            <View style={styles.itemIcon}>
              <Ionicons name={item.icon} size={19} color={colors.greenDeep} />
            </View>
            <View style={styles.itemCopy}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemDetail}>{item.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        <TouchableOpacity accessibilityRole="button" onPress={onSignIn} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Sign in</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={onSignUp} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Create an app account</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.privacyNote}>
        <Ionicons name="information-circle-outline" size={18} color={colors.greenDeep} />
        <Text style={styles.privacyText}>
          This demo app account is separate from TD banking credentials. Do not use your EasyWeb or TD app password here.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: spacing.xl, gap: spacing.lg, backgroundColor: colors.bg },
  header: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  brandMark: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.green },
  brandMarkText: { color: colors.text, fontSize: font.size.md, fontFamily: font.headline.bold },
  brandLabel: { color: colors.textSecondary, fontSize: font.size.xs, fontFamily: font.body.bold, letterSpacing: 0.8 },
  closeButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.surface },
  hero: { padding: spacing.xl, gap: spacing.md, borderRadius: radius.xl, backgroundColor: colors.green },
  heroIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.surface },
  title: { color: colors.text, fontSize: font.size.xxl, lineHeight: 36, fontFamily: font.headline.bold },
  subtitle: { color: colors.text, fontSize: font.size.base, lineHeight: 23 },
  onboardingList: { gap: spacing.md },
  onboardingItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  itemIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  itemCopy: { flex: 1, gap: 3 },
  itemTitle: { color: colors.text, fontSize: font.size.sm, fontFamily: font.headline.semibold },
  itemDetail: { color: colors.textSecondary, fontSize: font.size.xs, lineHeight: 17 },
  actions: { gap: spacing.sm },
  primaryButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderRadius: radius.md, backgroundColor: colors.green },
  primaryButtonText: { color: colors.text, fontSize: font.size.base, fontFamily: font.body.bold },
  secondaryButton: { minHeight: 50, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  secondaryButtonText: { color: colors.text, fontSize: font.size.sm, fontFamily: font.body.bold },
  privacyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.greenDim },
  privacyText: { flex: 1, color: colors.textSecondary, fontSize: font.size.xs, lineHeight: 17 },
});
