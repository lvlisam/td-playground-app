import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Switch, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';

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
  return (
    <View style={toggleStyles.row}>
      <View style={[toggleStyles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <View style={toggleStyles.info}>
        <Text style={toggleStyles.label}>{label}</Text>
        {description && <Text style={toggleStyles.desc}>{description}</Text>}
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
});

type NavRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  label: string;
  value?: string;
};

function NavRow({ icon, iconColor, iconBg, label, value }: NavRowProps) {
  return (
    <TouchableOpacity style={navStyles.row}>
      <View style={[navStyles.iconWrap, { backgroundColor: iconBg }]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={navStyles.label}>{label}</Text>
      <View style={navStyles.right}>
        {value && <Text style={navStyles.value}>{value}</Text>}
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
});

export default function CardsScreen() {
  const insets = useSafeAreaInsets();
  const [frozen, setFrozen] = useState(false);
  const [contactless, setContactless] = useState(true);
  const [onlinePayments, setOnlinePayments] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(true);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <Text style={styles.title}>Cards</Text>
          <TouchableOpacity style={styles.addBtn}>
            <Ionicons name="add" size={20} color={colors.green} />
            <Text style={styles.addBtnText}>Add Card</Text>
          </TouchableOpacity>
        </View>

        {/* Virtual Card */}
        <View style={styles.cardContainer}>
          <LinearGradient
            colors={['#003D1F', '#005C2E', '#00C853']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1.2, y: 1 }}
            style={[styles.card, frozen && styles.cardFrozen]}
          >
            {/* Card header */}
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardBankName}>TD Future</Text>
                <Text style={styles.cardType}>Everyday Chequing</Text>
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
            <Text style={styles.cardNumber}>••••  ••••  ••••  4821</Text>

            {/* Card Footer */}
            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.cardFooterLabel}>CARDHOLDER</Text>
                <Text style={styles.cardFooterValue}>LISA MUMFORD</Text>
              </View>
              <View>
                <Text style={styles.cardFooterLabel}>EXPIRES</Text>
                <Text style={styles.cardFooterValue}>09/29</Text>
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
                <View style={styles.cardActionIcon}>
                  <Ionicons name={a.icon} size={18} color={colors.green} />
                </View>
                <Text style={styles.cardActionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Card Controls */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Controls</Text>
          <View style={styles.card2}>
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
              icon="wifi-outline"
              iconColor={colors.green}
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Limits</Text>
          <View style={styles.card2}>
            <NavRow icon="bar-chart-outline" iconColor={colors.purple} iconBg={colors.purpleDim} label="Daily Spend Limit" value="$5,000" />
            <View style={styles.divider} />
            <NavRow icon="cash-outline" iconColor={colors.orange} iconBg={colors.orangeDim} label="ATM Withdrawal Limit" value="$1,000" />
            <View style={styles.divider} />
            <NavRow icon="globe-outline" iconColor={colors.blue} iconBg={colors.blueDim} label="International Payments" value="On" />
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.card2}>
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
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.card2}>
            <ToggleRow
              icon="finger-print-outline"
              iconColor={colors.green}
              iconBg={colors.greenDim}
              label="Face ID / Touch ID"
              value={biometric}
              onToggle={() => setBiometric(v => !v)}
            />
            <View style={styles.divider} />
            <NavRow icon="key-outline" iconColor={colors.red} iconBg={colors.redDim} label="Change PIN" />
            <View style={styles.divider} />
            <NavRow icon="shield-checkmark-outline" iconColor={colors.green} iconBg={colors.greenDim} label="Two-Factor Authentication" value="On" />
            <View style={styles.divider} />
            <NavRow icon="document-text-outline" iconColor={colors.textSecondary} iconBg={colors.surfaceHigh} label="Privacy Policy" />
          </View>
        </View>

        {/* Danger zone */}
        <View style={[styles.section, { marginBottom: 0 }]}>
          <TouchableOpacity style={styles.reportBtn}>
            <Ionicons name="alert-circle-outline" size={18} color={colors.red} />
            <Text style={styles.reportBtnText}>Report Lost or Stolen Card</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
  },
  title: { color: colors.text, fontSize: font.size.xl, fontWeight: font.weight.bold },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { color: colors.green, fontSize: font.size.sm, fontWeight: font.weight.medium },

  cardContainer: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
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
  cardBankName: { color: '#fff', fontSize: font.size.md, fontWeight: font.weight.bold, letterSpacing: 1 },
  cardType: { color: 'rgba(255,255,255,0.6)', fontSize: font.size.xs, marginTop: 2 },
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
  cardFooterValue: { color: '#fff', fontSize: font.size.xs, fontWeight: font.weight.semibold, marginTop: 2 },
  visaLogo: { marginLeft: 'auto' as any },
  visaText: { color: 'rgba(255,255,255,0.9)', fontSize: font.size.xl, fontWeight: font.weight.heavy, fontStyle: 'italic', letterSpacing: -1 },
  frozenOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,100,255,0.15)',
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

  section: { paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  sectionTitle: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.semibold, marginBottom: spacing.sm },
  card2: {
    backgroundColor: colors.surface, borderRadius: radius.lg,
    paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  divider: { height: 1, backgroundColor: colors.borderFaint },

  reportBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, padding: spacing.md,
    backgroundColor: colors.redDim, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.red + '40',
  },
  reportBtnText: { color: colors.red, fontSize: font.size.base, fontWeight: font.weight.semibold },
});
