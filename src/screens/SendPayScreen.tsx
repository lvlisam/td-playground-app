import React, { useState } from 'react';
import {
  Alert, View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, TextInput, Platform, useWindowDimensions, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, font, radius, spacing } from '../theme';
import TransferOverview, { type TransferAction } from '../components/TransferOverview';

const TABS = ['Send', 'Request', 'Pay Bill', 'Move'];

const PAYEES = [
  { id: 'electric', name: 'City Electric', initials: 'CE', color: colors.orange, recent: '$84.20' },
  { id: 'internet', name: 'Northstar Internet', initials: 'NI', color: colors.blue, recent: '$72.00' },
  { id: 'water', name: 'City Water', initials: 'CW', color: colors.teal, recent: '$46.80' },
  { id: 'mobile', name: 'Mobile plan', initials: 'MP', color: colors.purple, recent: '$58.00' },
];

const CONTACTS = [
  { id: '1', name: 'Sarah M.', initials: 'SM', color: colors.purple, recent: '$120.00' },
  { id: '2', name: 'Jake P.', initials: 'JP', color: colors.blue, recent: '$45.50' },
  { id: '3', name: 'Mum', initials: 'M', color: colors.greenDeep, recent: '$200.00' },
  { id: '4', name: 'Tom R.', initials: 'TR', color: colors.orange, recent: '$75.00' },
];

const METHODS = [
  { id: 'zelle', label: 'Zelle', icon: 'swap-horizontal' as const, desc: 'Free · Instant' },
  { id: 'wire', label: 'Wire transfer', icon: 'git-branch-outline' as const, desc: '$5.00 · 1–2 business days' },
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
  const [selectedMethod, setSelectedMethod] = useState('zelle');
  const [sourceAccount, setSourceAccount] = useState('Checking');
  const [destinationAccount, setDestinationAccount] = useState('Savings');
  const [note, setNote] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [actionStatus, setActionStatus] = useState('');
  const visibleContacts = activeTab === 'Pay Bill' ? PAYEES : CONTACTS;

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
    if (action === 'help') {
      Alert.alert('Ask Tedi', 'Use the Ask Tedi field at the top to get help choosing the right money movement option.');
      return;
    }
    if (action === 'send' || action === 'wire') {
      setActiveTab('Send');
      setSelectedMethod(action === 'wire' ? 'wire' : 'zelle');
      setShowForm(true);
      return;
    }
    if (action === 'move' || action === 'bills') {
      setActiveTab(action === 'move' ? 'Move' : 'Pay Bill');
      setSelectedContact(null);
      setAmount('');
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
      help: 'Not sure where to start',
    };
    Alert.alert(`${labels[action]} coming soon`, 'Your upcoming and recently paid bills are available here.');
  };

  const displayAmount = amount === '' ? '0.00' : parseFloat(amount).toFixed(amount.includes('.') ? Math.min(2, (amount.split('.')[1] || '').length) : 0);
  const amountValue = parseFloat(amount);
  const canSend = activeTab === 'Move'
    ? amountValue > 0 && amountValue <= 6842.17 && sourceAccount !== destinationAccount
    : Boolean(selectedContact) && amountValue > 0 && (activeTab === 'Request' || amountValue <= 6842.17);
  const confirmAction = () => {
    const actionLabel = activeTab === 'Request' ? 'Request preview' : activeTab === 'Move' ? 'Transfer preview' : activeTab === 'Pay Bill' ? 'Bill payment preview' : 'Send preview';
    setActionStatus(`${actionLabel} confirmed for demo only. No money was moved.`);
    setShowConfirmation(false);
  };

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
          accessibilityLabel="Back to Move money"
          onPress={() => setShowForm(false)}
          style={styles.backLink}
        >
          <Ionicons name="arrow-back" size={18} color={colors.textSecondary} />
          <Text style={styles.backText}>Move money</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{activeTab === 'Move' ? 'Move between accounts' : activeTab === 'Pay Bill' ? 'Pay a bill' : activeTab === 'Request' ? 'Request money' : 'Send money'}</Text>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, compact && styles.tabBarCompact]}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => {
              setActiveTab(tab);
              setSelectedContact(null);
              setActionStatus('');
            }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 160 }}
      >
        {/* Amount Display */}
        <View style={[styles.amountSection, compact && styles.amountSectionCompact]}>
          <Text style={styles.amountLabel}>Amount (USD)</Text>
          <View style={styles.amountRow}>
            <Text style={[styles.dollar, compact && styles.dollarCompact]}>$</Text>
            <Text style={[styles.amountValue, compact && styles.amountValueCompact, amount === '' && styles.amountPlaceholder]}>
              {displayAmount}
            </Text>
          </View>
          {activeTab === 'Move' ? (
            <Text style={styles.amountTo}>from {sourceAccount} to {destinationAccount}</Text>
          ) : selectedContact ? (
            <Text style={styles.amountTo}>
              {activeTab === 'Request' ? 'from' : activeTab === 'Pay Bill' ? 'for' : 'to'} {visibleContacts.find((contact) => contact.id === selectedContact)?.name}
            </Text>
          ) : null}
        </View>

        {activeTab === 'Move' ? (
          <View style={[styles.section, compact && styles.sectionCompact]}>
            <Text style={styles.sectionTitle}>Choose accounts</Text>
            <Text style={styles.accountPickerLabel}>From</Text>
            <View style={styles.accountChoices}>
              {['Checking', 'Savings'].map((account) => (
                <TouchableOpacity key={`from-${account}`} accessibilityRole="button" accessibilityState={{ selected: sourceAccount === account }} onPress={() => setSourceAccount(account)} style={[styles.accountChoice, sourceAccount === account && styles.accountChoiceActive]}>
                  <Text style={[styles.accountChoiceTitle, sourceAccount === account && styles.accountChoiceTitleActive]}>{account}</Text>
                  <Text style={styles.accountChoiceBalance}>{account === 'Checking' ? '$6,842.17 available' : '$53,220.00 available'}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.accountPickerLabel}>To</Text>
            <View style={styles.accountChoices}>
              {['Checking', 'Savings'].map((account) => (
                <TouchableOpacity key={`to-${account}`} accessibilityRole="button" accessibilityState={{ selected: destinationAccount === account }} onPress={() => setDestinationAccount(account)} style={[styles.accountChoice, destinationAccount === account && styles.accountChoiceActive]}>
                  <Text style={[styles.accountChoiceTitle, destinationAccount === account && styles.accountChoiceTitleActive]}>{account}</Text>
                  <Text style={styles.accountChoiceBalance}>{account === 'Checking' ? 'Everyday spending' : 'Family getaway'}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={[styles.section, compact && styles.sectionCompact]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{activeTab === 'Pay Bill' ? 'Choose a payee' : 'Choose a person'}</Text>
              {activeTab !== 'Pay Bill' ? <TouchableOpacity><Text style={styles.seeAll}>All Contacts</Text></TouchableOpacity> : null}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.contactsRow, compact && styles.contactsRowCompact]}>
              {activeTab !== 'Pay Bill' ? (
                <TouchableOpacity style={[styles.addContact, compact && styles.addContactCompact]}>
                  <View style={[styles.addContactCircle, compact && styles.addContactCircleCompact]}><Ionicons name="add" size={24} color={colors.greenDeep} /></View>
                  <Text style={styles.contactName}>New</Text>
                </TouchableOpacity>
              ) : null}
              {visibleContacts.map((contact) => (
                <TouchableOpacity key={contact.id} accessibilityRole="button" accessibilityState={{ selected: selectedContact === contact.id }} onPress={() => setSelectedContact(contact.id === selectedContact ? null : contact.id)} style={[styles.contact, compact && styles.contactCompact]}>
                  <View style={[styles.contactAvatar, compact && styles.contactAvatarCompact, { backgroundColor: contact.color + '33' }, selectedContact === contact.id && styles.contactAvatarActive]}>
                    {selectedContact === contact.id ? <View style={styles.contactCheck}><Ionicons name="checkmark" size={12} color={colors.text} /></View> : null}
                    <Text style={[styles.contactInitials, { color: contact.color }]}>{contact.initials}</Text>
                  </View>
                  <Text style={[styles.contactName, selectedContact === contact.id && { color: colors.text }]}>{contact.name}</Text>
                  <Text style={styles.contactRecent}>{contact.recent}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {activeTab === 'Send' ? (
          <View style={[styles.section, compact && styles.sectionCompact]}>
            <Text style={styles.sectionTitle}>Method</Text>
            <View style={{ gap: spacing.sm, marginTop: spacing.sm }}>
              {METHODS.map((m) => (
                <TouchableOpacity key={m.id} accessibilityRole="radio" accessibilityState={{ checked: selectedMethod === m.id }} onPress={() => setSelectedMethod(m.id)} style={[styles.methodRow, compact && styles.methodRowCompact, selectedMethod === m.id && styles.methodRowActive]}>
                  <View style={[styles.methodIcon, compact && styles.methodIconCompact, selectedMethod === m.id && { backgroundColor: colors.greenDim }]}>
                    <Ionicons name={m.icon} size={20} color={selectedMethod === m.id ? colors.greenDeep : colors.textSecondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.methodLabel}>{m.label}</Text>
                    <Text style={styles.methodDesc}>{m.desc}</Text>
                  </View>
                  <View style={[styles.radio, selectedMethod === m.id && styles.radioActive]}>{selectedMethod === m.id && <View style={styles.radioDot} />}</View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}

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

        <View style={[styles.section, compact && styles.sectionCompact]}>
          {actionStatus ? <Text accessibilityLiveRegion="polite" style={styles.actionStatus}>{actionStatus}</Text> : null}
          {!canSend && amountValue > 6842.17 && activeTab !== 'Request' ? <Text accessibilityRole="alert" style={styles.actionError}>Amount exceeds the available demo balance of $6,842.17.</Text> : null}
          <TouchableOpacity accessibilityRole="button" disabled={!canSend} onPress={() => setShowConfirmation(true)} style={{ opacity: canSend ? 1 : 0.4 }}>
            <LinearGradient colors={[colors.greenDeep, colors.green]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.sendBtn}>
              <Ionicons name="paper-plane-outline" size={20} color={colors.text} />
              <Text style={styles.sendBtnText}>{canSend ? `${activeTab === 'Request' ? 'Request' : activeTab === 'Pay Bill' ? 'Pay' : activeTab === 'Move' ? 'Move' : 'Send'} $${parseFloat(amount).toFixed(2)}` : activeTab === 'Request' ? 'Request' : activeTab === 'Pay Bill' ? 'Pay bill' : activeTab === 'Move' ? 'Move money' : 'Send'}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <Modal transparent animationType="fade" visible={showConfirmation} onRequestClose={() => setShowConfirmation(false)}>
        <View style={styles.confirmationBackdrop}>
          <View style={styles.confirmationDialog}>
            <View style={styles.confirmationIcon}><Ionicons name="shield-checkmark-outline" size={23} color={colors.greenDeep} /></View>
            <Text accessibilityRole="header" style={styles.confirmationTitle}>Review before you continue</Text>
            <Text style={styles.confirmationCopy}>
              {activeTab === 'Move'
                ? `Move $${Number(amount).toFixed(2)} from ${sourceAccount} to ${destinationAccount}?`
                : activeTab === 'Pay Bill'
                  ? `Preview a $${Number(amount).toFixed(2)} payment to ${visibleContacts.find((contact) => contact.id === selectedContact)?.name}?`
                  : activeTab === 'Request'
                    ? `Preview a $${Number(amount).toFixed(2)} request from ${visibleContacts.find((contact) => contact.id === selectedContact)?.name}?`
                    : `Preview sending $${Number(amount).toFixed(2)} to ${visibleContacts.find((contact) => contact.id === selectedContact)?.name}?`}
              {' '}This is a demo; no money will move.
            </Text>
            <View style={styles.confirmationDialogActions}>
              <TouchableOpacity accessibilityRole="button" onPress={() => setShowConfirmation(false)} style={styles.confirmationCancelButton}><Text style={styles.confirmationCancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity accessibilityRole="button" onPress={confirmAction} style={styles.confirmationConfirmButton}><Text style={styles.confirmationConfirmText}>Confirm demo</Text></TouchableOpacity>
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
  accountPickerLabel: { color: colors.textSecondary, fontSize: 11, fontWeight: font.weight.bold, marginBottom: 6 },
  accountChoices: { gap: 8, marginBottom: 10 },
  accountChoice: { minHeight: 56, justifyContent: 'center', paddingHorizontal: 12, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, gap: 3 },
  accountChoiceActive: { borderColor: colors.greenDeep, backgroundColor: colors.greenDim },
  accountChoiceTitle: { color: colors.text, fontSize: 14, fontWeight: font.weight.semibold },
  accountChoiceTitleActive: { color: colors.greenDeep },
  accountChoiceBalance: { color: colors.textSecondary, fontSize: 11 },
  actionStatus: { color: colors.greenDeep, fontSize: 12, lineHeight: 17, textAlign: 'center', marginBottom: 10 },
  actionError: { color: colors.red, fontSize: 12, lineHeight: 16, marginBottom: 8 },
  confirmationBackdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.42)' },
  confirmationDialog: { width: '100%', maxWidth: 360, padding: 20, borderRadius: radius.xl, backgroundColor: colors.surface, gap: 12 },
  confirmationIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  confirmationTitle: { color: colors.text, fontSize: 18, fontFamily: font.headline.bold },
  confirmationCopy: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  confirmationDialogActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8 },
  confirmationCancelButton: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 12 },
  confirmationCancelText: { color: colors.textSecondary, fontSize: 13, fontWeight: font.weight.semibold },
  confirmationConfirmButton: { minHeight: 42, justifyContent: 'center', paddingHorizontal: 16, borderRadius: radius.md, backgroundColor: colors.greenDeep },
  confirmationConfirmText: { color: colors.white, fontSize: 13, fontWeight: font.weight.bold },

  section: { paddingHorizontal: spacing.md, marginBottom: spacing.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { color: colors.text, fontSize: font.size.md, fontFamily: font.headline.semibold, marginBottom: spacing.sm },
  seeAll: { color: colors.greenDeep, fontSize: font.size.sm },

  contactsRow: { gap: spacing.md, paddingRight: spacing.lg },
  contact: { alignItems: 'center', gap: 4, width: 64 },
  contactAvatar: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'transparent',
  },
  contactAvatarActive: { borderColor: colors.greenDeep },
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
    borderWidth: 1, borderColor: colors.greenDeep + '40',
  },

  methodRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    backgroundColor: colors.surface, borderRadius: radius.lg,
    padding: spacing.md, borderWidth: 1, borderColor: colors.border,
  },
  methodRowActive: { borderColor: colors.greenDeep },
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
  radioActive: { borderColor: colors.greenDeep },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.greenDeep },

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
