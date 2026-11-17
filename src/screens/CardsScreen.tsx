import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch, StatusBar, Platform, useWindowDimensions, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';
import AccountNicknameEditor from '../components/AccountNicknameEditor';
import ScreenBackButton from '../components/ScreenBackButton';
import { useAccounts } from '../accounts';

type ToggleRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  description?: string;
  value: boolean;
  onToggle: () => void;
};

function ToggleRow({ icon, iconColor, iconBg, label, description, value, onToggle }: ToggleRowProps) {
  const { width } = useWindowDimensions();
  const compact = width < 360;
  return (
    <View style={[toggleStyles.row, compact && toggleStyles.rowCompact]}>
      <View style={[toggleStyles.iconWrap, compact && toggleStyles.iconWrapCompact, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={toggleStyles.info}>
        <Text style={[toggleStyles.label, compact && toggleStyles.labelCompact]}>{label}</Text>
        {description && <Text style={[toggleStyles.desc, compact && toggleStyles.descCompact]}>{description}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.surfaceElevated, true: colors.green }}
        thumbColor={value ? '#fff' : colors.textTertiary}
      />
    </View>
  );
}

const toggleStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: spacing.md,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  info: { flex: 1 },
  label: { color: colors.text, fontSize: font.size.base, fontWeight: font.weight.medium },
  desc: { color: colors.textSecondary, fontSize: font.size.xs, marginTop: 2 },
  rowCompact: { gap: 12, paddingVertical: 10 },
  iconWrapCompact: { width: 32, height: 32 },
  labelCompact: { fontSize: 14 },
  descCompact: { fontSize: 12, lineHeight: 16 },
});

type NavRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  value?: string;
  onPress?: () => void;
};

function NavRow({ icon, iconColor, iconBg, label, value, onPress }: NavRowProps) {
  const { width } = useWindowDimensions();
  const compact = width < 360;
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={[navStyles.row, compact && navStyles.rowCompact]}>
      <View style={[navStyles.iconWrap, compact && navStyles.iconWrapCompact, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={[navStyles.label, compact && navStyles.labelCompact]}>{label}</Text>
      <View style={navStyles.right}>
        {value && <Text style={[navStyles.value, compact && navStyles.valueCompact]}>{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
}

const navStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: spacing.md,
  },
  iconWrap: {
    width: 36, height: 36, borderRadius: radius.md,
    alignItems: 'center', justifyContent: 'center',
  },
  label: { flex: 1, color: colors.text, fontSize: font.size.base, fontWeight: font.weight.medium },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  value: { color: colors.textSecondary, fontSize: font.size.sm },
  rowCompact: { gap: 12, paddingVertical: 10 },
  iconWrapCompact: { width: 32, height: 32 },
  labelCompact: { fontSize: 14 },
  valueCompact: { fontSize: 12 },
});

export default function CardsScreen() {
  const { accounts, renameAccount } = useAccounts();
  const cardAccount = accounts.find((account) => account.id === 'card')!;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const previewTopInset = Platform.OS === 'web' ? (width < 650 ? 24 : 48) : insets.top;
  const [frozen, setFrozen] = useState(false);
  const [contactless, setContactless] = useState(true);
  const [onlinePayments, setOnlinePayments] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(true);
  const [streetSafe, setStreetSafe] = useState(false);
  const [singleUseCardCreated, setSingleUseCardCreated] = useState(false);
  const [dailyLimit, setDailyLimit] = useState('5000');
  const [atmLimit, setAtmLimit] = useState('1000');
  const [editingLimit, setEditingLimit] = useState<'daily' | 'atm' | null>(null);
  const [limitDraft, setLimitDraft] = useState('');
  const [limitError, setLimitError] = useState('');
  const [demoMessage, setDemoMessage] = useState('');

  const openLimitEditor = (limit: 'daily' | 'atm') => {
    setEditingLimit(limit);
    setLimitDraft(limit === 'daily' ? dailyLimit : atmLimit);
    setLimitError('');
  };

  const saveLimit = () => {
    const value = Number(limitDraft);
    if (!Number.isFinite(value) || value <= 0 || value > 100000) {
      setLimitError('Enter a limit between $1 and $100,000.');
      return;
    }
    if (editingLimit === 'daily') setDailyLimit(String(value));
    if (editingLimit === 'atm') setAtmLimit(String(value));
    setDemoMessage('Demo card setting updated. No real card was changed.');
    setEditingLimit(null);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 140 }}
      >
        {/* Header */}
        <View style={[styles.header, compact && styles.headerCompact, { paddingTop: previewTopInset + spacing.sm }]}>
          <ScreenBackButton />
          <Text style={styles.title}>Card manager</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={20} color={colors.greenDeep} />
            <Text style={styles.addBtnText}>Add Card</Text>
          </TouchableOpacity>
        </View>

        {/* Virtual Card */}
        <View style={[styles.cardContainer, compact && styles.cardContainerCompact]}>
          <LinearGradient
            colors={[colors.text, colors.greenDeep, colors.green]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.2, y: 1 }}
            style={[styles.card, compact && styles.cardCompact, frozen && styles.cardFrozen]}
          >
            {/* Card header */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardBankName}>TD Future</Text>
                <AccountNicknameEditor accountId="card" name={cardAccount.name} onSave={renameAccount} dark />
              </View>
              <View style={styles.cardWifi}>
                {frozen ? (
                  <Ionicons name="snow-outline" size={22} color="rgba(255,255,255,0.7)" />
                ) : (
                  <Ionicons name="wifi-outline" size={22} color="rgba(255,255,255,0.7)" />
                )}
              </View>
            </View>

            {/* Chip */}
            <View style={styles.chip}>
              <View style={styles.chipLine} />
              <View style={styles.chipLine2} />
            </View>

            {/* Card Number */}
            <Text numberOfLines={1} style={[styles.cardNumber, compact && styles.cardNumberCompact]}>••••  ••••  ••••  4821</Text>

            {/* Card Footer */}
            <View style={[styles.cardFooter, compact && styles.cardFooterCompact]}>
              <View>
                <Text style={[styles.cardFooterLabel, compact && styles.cardFooterLabelCompact]}>CARDHOLDER</Text>
                <Text style={[styles.cardFooterValue, compact && styles.cardFooterValueCompact]}>LISA MUMFORD</Text>
              </View>
              <View>
                <Text style={[styles.cardFooterLabel, compact && styles.cardFooterLabelCompact]}>EXPIRES</Text>
                <Text style={[styles.cardFooterValue, compact && styles.cardFooterValueCompact]}>09/29</Text>
              </View>
              <View style={styles.visaLogo}>
                <Text style={styles.visaText}>VISA</Text>
              </View>
            </View>

            {frozen && (
              <View style={styles.frozenOverlay}>
                <Ionicons name="snow" size={32} color="rgba(255,255,255,0.4)" />
                <Text style={styles.frozenText}>Card Frozen</Text>
              </View>
            )}
          </LinearGradient>

          {/* Card actions */}
          <View style={styles.cardActions}>
            {[
              { icon: 'eye-outline' as const, label: 'Details' },
              { icon: 'copy-outline' as const, label: 'Copy #' },
              { icon: 'card-outline' as const, label: 'Apple Pay' },
              { icon: 'ellipsis-horizontal' as const, label: 'More' },
            ].map((a) => (
              <TouchableOpacity key={a.label} style={styles.cardAction}>
                <View style={[styles.cardActionIcon, compact && styles.cardActionIconCompact]}>
                  <Ionicons name={a.icon} size={18} color={colors.greenDeep} />
                </View>
                <Text style={[styles.cardActionLabel, compact && styles.cardActionLabelCompact]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, compact && styles.sectionCompact]}>
          <Text style={styles.sectionTitle}>Single-use card</Text>
          <View style={styles.card2}>
            <View style={styles.singleUseRow}>
              <View style={styles.singleUseIcon}>
                <Ionicons name="flash-outline" size={19} color={colors.greenDeep} />
              </View>
              <View style={styles.singleUseCopy}>
                <Text style={styles.singleUseTitle}>{singleUseCardCreated ? 'Demo card ready' : 'Safer one-time online purchases'}</Text>
                <Text style={styles.singleUseDescription}>{singleUseCardCreated ? '•••• 9142 · expires after one purchase' : 'Create a virtual card number for one purchase.'}</Text>
              </View>
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={singleUseCardCreated ? 'Create another single-use demo card' : 'Create single-use demo card'}
              onPress={() => {
                setSingleUseCardCreated(true);
                setDemoMessage('Demo single-use card created. It cannot be used for real purchases.');
              }}
              style={styles.singleUseButton}
            >
              <Text style={styles.singleUseButtonText}>{singleUseCardCreated ? 'Create another' : 'Create demo card'}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.white} />
            </TouchableOpacity>
            {demoMessage ? <Text accessibilityRole="text" style={styles.demoNotice}>{demoMessage}</Text> : null}
          </View>
        </View>

        {/* Card Controls */}
        <View style={[styles.section, compact && styles.sectionCompact]}>
          <Text style={styles.sectionTitle}>Card Controls</Text>
          <View style={[styles.card2, compact && styles.card2Compact]}>
            <ToggleRow
              icon="snow-outline"
              iconColor={frozen ? colors.blue : colors.textSecondary}
              iconBg={frozen ? colors.blueDim : colors.surfaceHigh}
              label="Freeze Card"
              description={frozen ? 'Card is frozen — no transactions allowed' : 'Temporarily lock your card'}
              value={frozen}
              onToggle={() => setFrozen(v => !v)}
            />
            <View style={styles.divider} />
            <ToggleRow
              icon="walk-outline"
              iconColor={streetSafe ? colors.greenDeep : colors.textSecondary}
              iconBg={streetSafe ? colors.greenDim : colors.surfaceHigh}
              label="Street Safe"
              description={streetSafe ? 'On-the-go spending is capped in this demo' : 'Apply a lower-risk card profile while out'}
              value={streetSafe}
              onToggle={() => setStreetSafe((value) => !value)}
            />
            <View style={styles.divider} />
            <ToggleRow
              icon="wifi-outline"
              iconColor={colors.greenDeep}
              iconBg={colors.greenDim}
              label="Contactless Payments"
              description="Tap to pay at terminals"
              value={contactless}
              onToggle={() => setContactless(v => !v)}
            />
            <View style={styles.divider} />
            <ToggleRow
              icon="globe-outline"
              iconColor={colors.teal}
              iconBg={colors.tealDim}
              label="Online Payments"
              description="Use card for e-commerce"
              value={onlinePayments}
              onToggle={() => setOnlinePayments(v => !v)}
            />
          </View>
        </View>

        {/* Limits */}
        <View style={[styles.section, compact && styles.sectionCompact]}>
          <Text style={styles.sectionTitle}>Limits</Text>
          <View style={[styles.card2, compact && styles.card2Compact]}>
            <NavRow icon="bar-chart-outline" iconColor={colors.purple} iconBg={colors.purpleDim} label="Daily Spend Limit" value={`$${Number(dailyLimit).toLocaleString()}`} onPress={() => openLimitEditor('daily')} />
            <View style={styles.divider} />
            <NavRow icon="cash-outline" iconColor={colors.orange} iconBg={colors.orangeDim} label="ATM Withdrawal Limit" value={`$${Number(atmLimit).toLocaleString()}`} onPress={() => openLimitEditor('atm')} />
            <View style={styles.divider} />
            <NavRow icon="globe-outline" iconColor={colors.blue} iconBg={colors.blueDim} label="International Payments" value="On" />
          </View>
        </View>

        {/* Notifications */}
        <View style={[styles.section, compact && styles.sectionCompact]}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={[styles.card2, compact && styles.card2Compact]}>
            <ToggleRow
              icon="notifications-outline"
              iconColor={colors.orange}
              iconBg={colors.orangeDim}
              label="Transaction Alerts"
              value={notifications}
              onToggle={() => setNotifications(v => !v)}
            />
          </View>
        </View>

        {/* Security */}
        <View style={[styles.section, compact && styles.sectionCompact]}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={[styles.card2, compact && styles.card2Compact]}>
            <ToggleRow
              icon="finger-print-outline"
              iconColor={colors.greenDeep}
              iconBg={colors.greenDim}
              label="Face ID / Touch ID"
              value={biometric}
              onToggle={() => setBiometric(v => !v)}
            />
            <View style={styles.divider} />
            <NavRow icon="key-outline" iconColor={colors.red} iconBg={colors.redDim} label="Change PIN" />
            <View style={styles.divider} />
            <NavRow icon="shield-checkmark-outline" iconColor={colors.greenDeep} iconBg={colors.greenDim} label="Two-Factor Authentication" value="On" />
            <View style={styles.divider} />
            <NavRow icon="document-text-outline" iconColor={colors.textSecondary} iconBg={colors.surfaceHigh} label="Privacy Policy" />
          </View>
        </View>

        {/* Danger zone */}
          <View style={[styles.section, compact && styles.sectionCompact, { marginBottom: 0 }]}>
          <TouchableOpacity style={styles.reportBtn}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.red} />
            <Text style={[styles.reportBtnText, compact && styles.reportBtnTextCompact]}>Report Lost or Stolen Card</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal transparent animationType="fade" visible={editingLimit !== null} onRequestClose={() => setEditingLimit(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.limitDialog}>
            <Text accessibilityRole="header" style={styles.limitDialogTitle}>{editingLimit === 'daily' ? 'Daily spend limit' : 'ATM withdrawal limit'}</Text>
            <Text style={styles.limitDialogDescription}>Set a demo limit. This does not update a real card.</Text>
            <TextInput
              accessibilityLabel="Card limit amount"
              keyboardType="decimal-pad"
              value={limitDraft}
              onChangeText={(value) => {
                setLimitDraft(value.replace(/[^0-9.]/g, ''));
                setLimitError('');
              }}
              style={styles.limitInput}
              autoFocus
            />
            {limitError ? <Text accessibilityRole="alert" style={styles.limitError}>{limitError}</Text> : null}
            <View style={styles.limitDialogActions}>
              <TouchableOpacity accessibilityRole="button" onPress={() => setEditingLimit(null)} style={styles.limitCancelButton}>
                <Text style={styles.limitCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" onPress={saveLimit} style={styles.limitSaveButton}>
                <Text style={styles.limitSaveText}>Save limit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md, paddingBottom: spacing.md,
  },
  title: { color: colors.text, fontSize: font.size.xl, fontFamily: font.headline.bold },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { color: colors.greenDeep, fontSize: font.size.sm, fontWeight: font.weight.medium },

  cardContainer: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  card: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    height: 200,
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  cardFrozen: { opacity: 0.8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardBankName: { color: colors.white, fontSize: font.size.md, fontFamily: font.headline.bold, letterSpacing: 1 },
  cardWifi: {},
  chip: {
    width: 36, height: 28, borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  chipLine: {
    position: 'absolute', width: 28, height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    top: '40%',
  },
  chipLine2: {
    position: 'absolute', width: 1, height: 20,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  cardNumber: {
    color: 'rgba(255,255,255,0.9)', fontSize: font.size.base,
    letterSpacing: 3, fontWeight: font.weight.medium,
  },
  cardFooter: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.lg },
  cardFooterLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, letterSpacing: 1 },
  cardFooterValue: { color: colors.white, fontSize: font.size.xs, fontWeight: font.weight.semibold, marginTop: 2 },
  visaLogo: { marginLeft: 'auto' as any },
  visaText: { color: 'rgba(255,255,255,0.9)', fontSize: font.size.xl, fontWeight: font.weight.heavy, fontStyle: 'italic', letterSpacing: -1 },
  frozenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.blueDim,
    alignItems: 'center', justifyContent: 'center', gap: spacing.xs,
    borderRadius: radius.xl,
  },
  frozenText: { color: 'rgba(255,255,255,0.6)', fontSize: font.size.sm, fontWeight: font.weight.semibold },

  cardActions: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  cardAction: { alignItems: 'center', gap: 6 },
  cardActionIcon: {
    width: 48, height: 48, borderRadius: radius.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  cardActionLabel: { color: colors.textSecondary, fontSize: font.size.xs, fontWeight: font.weight.medium },

  section: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: font.size.md, fontFamily: font.headline.semibold, marginBottom: spacing.sm },
  card2: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  singleUseRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  singleUseIcon: { width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  singleUseCopy: { flex: 1, minWidth: 0, gap: 3 },
  singleUseTitle: { color: colors.text, fontSize: font.size.sm, fontFamily: font.headline.semibold },
  singleUseDescription: { color: colors.textSecondary, fontSize: font.size.xs, lineHeight: 16 },
  singleUseButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 42, borderRadius: radius.md, backgroundColor: colors.greenDeep, marginBottom: 12 },
  singleUseButtonText: { color: colors.white, fontSize: font.size.sm, fontWeight: font.weight.bold },
  demoNotice: { color: colors.textSecondary, fontSize: 11, lineHeight: 15, paddingBottom: 10 },
  modalBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.42)' },
  limitDialog: { width: '100%', maxWidth: 360, padding: 20, borderRadius: radius.xl, backgroundColor: colors.surface, gap: 12 },
  limitDialogTitle: { color: colors.text, fontSize: 18, fontFamily: font.headline.bold },
  limitDialogDescription: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  limitInput: { minHeight: 48, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: 12, color: colors.text, fontSize: 16 },
  limitError: { color: colors.red, fontSize: 12 },
  limitDialogActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  limitCancelButton: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 14 },
  limitCancelText: { color: colors.textSecondary, fontSize: 14, fontWeight: font.weight.semibold },
  limitSaveButton: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.greenDeep },
  limitSaveText: { color: colors.white, fontSize: 14, fontWeight: font.weight.bold },
  divider: { height: 1, backgroundColor: colors.borderFaint },

  reportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, padding: spacing.md,
    backgroundColor: colors.redDim, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.red + '40',
  },
  reportBtnText: { color: colors.red, fontSize: font.size.base, fontWeight: font.weight.semibold },
  headerCompact: { paddingHorizontal: 16, paddingBottom: 12 },
  cardContainerCompact: { paddingHorizontal: 16, marginBottom: 16 },
  cardCompact: { height: 184, padding: 16 },
  cardNumberCompact: { fontSize: 13, letterSpacing: 1.5 },
  cardFooterCompact: { gap: 8 },
  sectionCompact: { paddingHorizontal: 16, marginBottom: 16 },
  card2Compact: { paddingHorizontal: 12 },
  reportBtnTextCompact: { fontSize: 14, flexShrink: 1, textAlign: 'center' },
  cardFooterLabelCompact: { fontSize: 8 },
  cardFooterValueCompact: { fontSize: 10 },
  cardActionIconCompact: { width: 44, height: 44 },
  cardActionLabelCompact: { fontSize: 11 },
});
