import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, font, radius, spacing } from '../theme';

type DataSource = {
  id: string;
  icon: 'card-outline' | 'trending-up-outline' | 'calendar-outline' | 'mail-outline' | 'wallet-outline';
  name: string;
  detail: string;
  access: string;
};

const dataSources: DataSource[] = [
  {
    id: 'banks',
    icon: 'card-outline',
    name: 'Banks with Plaid',
    detail: 'Balances and transaction history · read-only',
    access: 'A future Plaid connection would request read-only access to the accounts you select. It would not authorize payments or transfers.',
  },
  {
    id: 'brokerage',
    icon: 'trending-up-outline',
    name: 'Brokerage accounts',
    detail: 'Investment balances and activity · read-only',
    access: 'A future brokerage connection would request read-only investment information from supported accounts.',
  },
  {
    id: 'calendar',
    icon: 'calendar-outline',
    name: 'Google Calendar',
    detail: 'Upcoming dates and events you choose to share',
    access: 'A future Calendar connection would use only the event information allowed in its consent screen to help identify relevant upcoming dates.',
  },
  {
    id: 'gmail',
    icon: 'mail-outline',
    name: 'Google Gmail',
    detail: 'Opt-in signals for recurring bills and life events',
    access: 'A future Gmail connection would require a separate, explicit consent step. Email content is not accessed in this preview.',
  },
  {
    id: 'payments',
    icon: 'wallet-outline',
    name: 'PayPal or Venmo',
    detail: 'Payment activity where provider access is supported',
    access: 'A future payment-app connection would be read-only and depend on provider availability. No payment-app data is accessed in this preview.',
  },
];

export default function ConnectedDataSection({ profileName }: { profileName: string }) {
  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);

  return (
    <View style={styles.container}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text style={styles.eyebrow}>PROFILE CONNECTIONS</Text>
          <Text style={styles.title}>Connected data</Text>
        </View>
        <View style={styles.previewBadge}>
          <Text style={styles.previewBadgeText}>Preview only</Text>
        </View>
      </View>
      <Text style={styles.intro}>Choose sources that could support more relevant insights for {profileName}.</Text>

      <View style={styles.sourceList}>
        {dataSources.map((source) => (
          <View key={source.id} style={styles.sourceRow}>
            <View style={styles.sourceIcon}>
              <Ionicons name={source.icon} size={18} color={colors.greenDeep} />
            </View>
            <View style={styles.sourceCopy}>
              <Text style={styles.sourceName}>{source.name}</Text>
              <Text style={styles.sourceDetail}>{source.detail}</Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Review ${source.name} details for ${profileName}`}
              accessibilityHint="Explains the future connection and current preview status."
              accessibilityState={{ expanded: selectedSource?.id === source.id }}
              onPress={() => setSelectedSource(selectedSource?.id === source.id ? null : source)}
              style={styles.detailsButton}
            >
              <Text style={styles.detailsButtonText}>Details</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      <View style={styles.disclosure}>
        <Ionicons name="information-circle-outline" size={17} color={colors.textSecondary} />
        <Text style={styles.disclosureText}>
          Live connections are not enabled. No accounts are linked, and no external data is accessed or saved in this preview.
        </Text>
      </View>

      {selectedSource ? (
        <View style={styles.detailPanel}>
          <View style={styles.detailHeadingRow}>
            <View style={styles.detailHeadingCopy}>
              <Text style={styles.dialogEyebrow}>FOR {profileName.toUpperCase()}</Text>
              <Text accessibilityRole="header" style={styles.dialogTitle}>{selectedSource.name}</Text>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={`Close ${selectedSource.name} details`}
              onPress={() => setSelectedSource(null)}
              style={styles.closeIconButton}
            >
              <Ionicons name="close-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.dialogCopy}>{selectedSource.access}</Text>
          <View style={styles.dialogNotice}>
            <Text style={styles.dialogNoticeText}>Connection setup is disabled in this preview. This profile remains unlinked.</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginHorizontal: spacing.md, marginTop: spacing.md, padding: spacing.md, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderFaint, gap: spacing.md },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  headingCopy: { flex: 1, gap: 2 },
  eyebrow: { color: colors.greenDeep, fontSize: 9, lineHeight: 13, fontFamily: font.body.bold, letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 20, lineHeight: 25, fontFamily: font.headline.bold },
  previewBadge: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.full, backgroundColor: colors.orangeDim },
  previewBadgeText: { color: colors.orange, fontSize: 10, lineHeight: 14, fontFamily: font.body.bold },
  intro: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  sourceList: { gap: 2 },
  sourceRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderFaint },
  sourceIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  sourceCopy: { flex: 1, gap: 2 },
  sourceName: { color: colors.text, fontSize: 13, lineHeight: 17, fontFamily: font.body.bold },
  sourceDetail: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  detailsButton: { minHeight: 36, justifyContent: 'center', paddingHorizontal: 10, borderRadius: radius.full, backgroundColor: colors.surfaceMid },
  detailsButtonText: { color: colors.greenDeep, fontSize: 11, lineHeight: 15, fontFamily: font.body.bold },
  disclosure: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceMid },
  disclosureText: { flex: 1, color: colors.textSecondary, fontSize: 11, lineHeight: 16 },
  detailPanel: { padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surfaceMid, gap: spacing.sm },
  detailHeadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  detailHeadingCopy: { flex: 1, gap: 3 },
  closeIconButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.full, backgroundColor: colors.surface },
  dialogEyebrow: { color: colors.greenDeep, fontSize: 9, lineHeight: 13, fontFamily: font.body.bold, letterSpacing: 0.8 },
  dialogTitle: { color: colors.text, fontSize: 21, lineHeight: 26, fontFamily: font.headline.bold },
  dialogCopy: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  dialogNotice: { padding: spacing.sm, borderRadius: radius.md, backgroundColor: colors.surfaceMid },
  dialogNoticeText: { color: colors.textSecondary, fontSize: 11, lineHeight: 16 },
});
