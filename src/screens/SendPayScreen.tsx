import React, { useState } from 'react';
import {
  Alert, View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, TextInput, Platform, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, font, radius, spacing } from '../theme';
import TransferOverview, { type TransferAction } from '../components/TransferOverview';

const TABS = ['Send', 'Request', 'Pay Bill'];

const CONTACTS = [
  { id: '1', name: 'Sarah M.', initials: 'SM', color: colors.purple, recent: '$120.00' },
  { id: '2', name: 'Jake P.', initials: 'JP', color: colors.blue, recent: '$45.50' },
  { id: '3', name: 'Mum', initials: 'M', color: colors.green, recent: '$200.00' },
  { id: '4', name: 'Tom R.', initials: 'TR', color: colors.orange, recent: '$75.00' },
];

const METHODS = [
  { id: 'interac', label: 'Interac e-Transfer', icon: 'swap-horizontal' as const, desc: 'Free · Instant' },
  { id: 'etransfer', label: 'Wire Transfer', icon: 'git-branch-outline' as const, desc: '$5.00 · 1–2 business days' },
];

const NUMPAD = ['1','2','3','4','5','6','7','8','9','.','0','⌫'];

export default function SendPayScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const previewTopInset = Platform.OS === 'web' ? (width < 650 ? 24 : 48) : insets.top;
  const [activeTab, setActiveTab] = useState('Send');
  const [amount, setAmount] = useState('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState('interac');
  const [note, setNote] = useState('');
  const [showForm, setShowForm] = useState(false);

  const handleNumpad = (key: string) => {
    if (key === '⌫') {
      setAmount((prev) => prev.slice(0, -1));
    } else if (key === '.' && amount.includes('.')) {
      return;
    } else if (amount.split('.')[1]?.length >= 2) {
      return;
    } else {
      setAmount((prev) => (prev === '' && key === '.' ? '0.' : prev + key));
    }
  };

  const handleOverviewAction = (action: TransferAction) => {
    if (action === 'send' || action === 'wire') {
      setActiveTab('Send');
      setSelectedMethod(action === 'wire' ? 'etransfer' : 'interac');
      setShowForm(true);
      return;
    }

    const labels: Record<TransferAction, string> = {
      send: 'Send & request',
      wire: 'Wire transfer',
      deposit: 'Deposit a check',
      move: 'Move money',
      bills: 'Pay bills',
      exchange: 'Exchange',
    };
    Alert.alert(`${labels[action]} coming soon`, 'Your upcoming and recently paid bills are available here.');
  };

  const displayAmount = amount === '' ? '0.00' : parseFloat(amount).toFixed(amount.includes('.') ? Math.min(2, (amount.split('.')[1] || '').length) : 0);

  const canSend = selectedContact && parseFloat(amount) > 0;

  if (!showForm) {
    return <TransferOverview onSelectAction={handleOverviewAction} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, compact && styles.headerCompact, { paddingTop: previewTopInset + spacing.sm }]}>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Back to Pay and Transfer"
          onPress={() => setShowForm(false)}
          style={styles.backLink}
        >
          <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
          <Text style={styles.backText}>Pay &amp; Transfer</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Send & Pay</Text>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, compact && styles.tabBarCompact]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* Amount Display */}
        <View style={[styles.amountSection, compact && styles.amountSectionCompact]}>
          <Text style={styles.amountLabel}>Amount (CAD)</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.dollar, compact && styles.dollarCompact]}>$</Text>
            <Text style={[styles.amountValue, compact && styles.amountValueCompact, amount === '' && styles.amountPlaceholder]}>
              {displayAmount}
            </Text>
          </View>
          {selectedContact && (
            <Text style={styles.amountTo}>
              to {CONTACTS.find(c => c.id === selectedContact)?.name}
            </Text>
          )}
        </View>

        {/* Contacts */}
        <View style={[styles.section, compact && styles.sectionCompact]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>All Contacts</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.contactsRow, compact && styles.contactsRowCompact]}>
              <TouchableOpacity style={[styles.addContact, compact && styles.addContactCompact]}>
              <View style={[styles.addContactCircle, compact && styles.addContactCircleCompact]}>
                <Ionicons name="add" size={24} color={colors.green} />
              </View>
              <Text style={styles.contactName}>New</Text>
            </TouchableOpacity>
            {CONTACTS.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedContact(c.id === selectedContact ? null : c.id)}
                style={[styles.contact, compact && styles.contactCompact]}
              >
                <View style={[
                  styles.contactAvatar,
                  compact && styles.contactAvatarCompact,
                  { backgroundColor: c.color + '33' },
                  selectedContact === c.id && styles.contactAvatarActive,
                ]}>
                  {selectedContact === c.id && (
                    <View style={styles.contactCheck}>
                      <Ionicons name="checkmark" size={12} color={colors.text} />
                    </View>
                  )}
                  <Text style={[styles.contactInitials, { color: c.color }]}>{c.initials}</Text>
                </View>
                <Text style={[styles.contactName, selectedContact === c.id && { color: colors.text }]}>{c.name}</Text>
                <Text style={styles.contactRecent}>{c.recent}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Transfer Method */}
        <View style={[styles.section, compact && styles.sectionCompact]}>
          <Text style={styles.sectionTitle}>Method</Text>
          <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
            {METHODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => setSelectedMethod(m.id)}
                style={[styles.methodRow, compact && styles.methodRowCompact, selectedMethod === m.id && styles.methodRowActive]}
              >
                <View style={[styles.methodIcon, compact && styles.methodIconCompact, selectedMethod === m.id && { backgroundColor: colors.greenDim }]}>
                  <Ionicons name={m.icon} size={20} color={selectedMethod === m.id ? colors.green : colors.textSecondary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.methodLabel}>{m.label}</Text>
                  <Text style={styles.methodDesc}>{m.desc}</Text>
                </View>
                <View style={[styles.radio, selectedMethod === m.id && styles.radioActive]}>
                  {selectedMethod === m.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Note */}
        <View style={[styles.section, compact && styles.sectionCompact]}>
          <Text style={styles.sectionTitle}>Note (optional)</Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="What's this for?"
            placeholderTextColor={colors.textTertiary}
            style={[styles.noteInput, compact && styles.noteInputCompact]}
          />
        </View>

        {/* Numpad */}
        <View style={[styles.numpad, compact && styles.numpadCompact]}>
          {NUMPAD.map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.numKey, compact && styles.numKeyCompact]}
              onPress={() => handleNumpad(key)}
            >
              {key === '⌫' ? (
                <Ionicons name="backspace-outline" size={22} color={colors.text} />
              ) : (
                <Text style={[styles.numKeyText, compact && styles.numKeyTextCompact]}>{key}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Send Button */}
        <View style={[styles.section, compact && styles.sectionCompact]}>
          <TouchableOpacity disabled={!canSend} style={{ opacity: canSend ? 1 : 0.4 }}>
            <LinearGradient
              colors={[colors.green, colors.greenBright]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.sendBtn}
            >
              <Ionicons name="paper-plane-outline" size={20} color={colors.text} />
              <Text style={styles.sendBtnText}>
                {canSend ? `Send $${parseFloat(amount).toFixed(2)}` : 'Send'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: spacing.md, paddingBottom: spacing.md,
  },
  title: { color: colors.text, fontSize: font.size.xl, fontFamily: font.headline.bold },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm },
  backText: { color: colors.textSecondary, fontSize: font.size.sm, fontFamily: font.headline.medium },

  tabBar: {
    flexDirection: 'row',
    marginHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 4,
    marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.border,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: radius.sm },
  tabActive: { backgroundColor: colors.surfaceElevated },
  tabText: { color: colors.textSecondary, fontSize: font.size.sm, fontWeight: font.weight.medium },
  tabTextActive: { color: colors.text },

  amountSection: { alignItems: 'center', paddingVertical: spacing.xl },
  amountLabel: { color: colors.textSecondary, fontSize: font.size.sm, marginBottom: spacing.sm },
  amountRow: { flexDirection: 'row', alignItems: 'flex-start' },
  dollar: { color: colors.textSecondary, fontSize: font.size.xl, marginTop: 6, marginRight: 4 },
  amountValue: { color: colors.text, fontSize: 56, fontFamily: font.headline.heavy, letterSpacing: -2 },
  amountPlaceholder: { color: colors.textTertiary },
  amountTo: { color: colors.textSecondary, fontSize: font.size.sm, marginTop: spacing.xs },

  section: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { color: colors.text, fontSize: font.size.md, fontFamily: font.headline.semibold, marginBottom: spacing.sm },
  seeAll: { color: colors.green, fontSize: font.size.sm },

  contactsRow: { gap: spacing.md, paddingRight: spacing.lg },
  contact: { alignItems: 'center', gap: 4, width: 64 },
  contactAvatar: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'transparent',
  },
  contactAvatarActive: { borderColor: colors.green },
  contactCheck: {
    position: 'absolute', top: -2, right: -2,
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.green,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 1,
  },
  contactInitials: { fontSize: font.size.md, fontWeight: font.weight.bold },
  contactName: { color: colors.textSecondary, fontSize: font.size.xs, textAlign: 'center' },
  contactRecent: { color: colors.textTertiary, fontSize: 10, textAlign: 'center' },

  addContact: { alignItems: 'center', gap: 4, width: 64 },
  addContactCircle: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.greenDim,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: colors.green + '40',
  },

  methodRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  methodRowActive: { borderColor: colors.green },
  methodIcon: {
    width: 40, height: 40, borderRadius: radius.md,
    backgroundColor: colors.surfaceHigh,
    alignItems: 'center', justifyContent: 'center',
  },
  methodLabel: { color: colors.text, fontSize: font.size.base, fontWeight: font.weight.medium },
  methodDesc: { color: colors.textSecondary, fontSize: font.size.xs, marginTop: 2 },
  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioActive: { borderColor: colors.green },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.green },

  noteInput: {
    backgroundColor: colors.surface, borderRadius: radius.md,
    padding: spacing.md, color: colors.text, fontSize: font.size.base,
    borderWidth: 1, borderColor: colors.border,
  },

  numpad: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: spacing.md, marginBottom: spacing.md,
  },
  numKey: {
    width: '33.33%', paddingVertical: spacing.md,
    alignItems: 'center', justifyContent: 'center',
  },
  numKeyText: { color: colors.text, fontSize: font.size.xl, fontWeight: font.weight.medium },

  sendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, borderRadius: radius.full,
    paddingVertical: spacing.md,
  },
  sendBtnText: { color: colors.text, fontSize: font.size.md, fontWeight: font.weight.bold },
  headerCompact: { paddingHorizontal: 16, paddingBottom: 12 },
  tabBarCompact: { marginHorizontal: 16, padding: 3, marginBottom: 14 },
  amountSectionCompact: { paddingVertical: 20 },
  dollarCompact: { fontSize: 18, marginTop: 4, marginRight: 3 },
  amountValueCompact: { fontSize: 42, letterSpacing: -1.5 },
  sectionCompact: { paddingHorizontal: 16, marginBottom: 16 },
  contactsRowCompact: { gap: 12, paddingRight: 16 },
  methodRowCompact: { gap: 12, padding: 12 },
  methodIconCompact: { width: 36, height: 36 },
  noteInputCompact: { padding: 12 },
  numpadCompact: { paddingHorizontal: 16, marginBottom: 12 },
  numKeyCompact: { paddingVertical: 12 },
  addContactCompact: { width: 60 },
  addContactCircleCompact: { width: 50, height: 50, borderRadius: 25 },
  contactCompact: { width: 60 },
  contactAvatarCompact: { width: 50, height: 50, borderRadius: 25 },
  numKeyTextCompact: { fontSize: 20 },
});
