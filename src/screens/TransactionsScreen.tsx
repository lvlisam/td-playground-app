import React, { useState } from 'react';
import {
  View, Text, SectionList, TextInput, ScrollView,
  TouchableOpacity, StyleSheet, StatusBar, Platform, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';
import TransactionRow, { Transaction } from '../components/TransactionRow';

const ALL_TRANSACTIONS: { title: string; data: Transaction[] }[] = [
  {
    title: 'Today, May 22',
    data: [
      { id: 't1', merchant: 'Apple Store', category: 'Electronics', amount: -129.00, date: '10:42 AM', icon: 'logo-apple', iconColor: colors.text, iconBg: colors.surfaceHigh },
      { id: 't2', merchant: 'Tim Hortons', category: 'Food & Drink', amount: -6.75, date: '8:14 AM', icon: 'cafe-outline', iconColor: colors.orange, iconBg: colors.orangeDim },
    ],
  },
  {
    title: 'Yesterday, May 21',
    data: [
      { id: 't3', merchant: 'Payroll Deposit', category: 'Income', amount: 3200.00, date: '6:00 AM', icon: 'briefcase-outline', iconColor: colors.green, iconBg: colors.greenDim },
      { id: 't4', merchant: 'Netflix', category: 'Entertainment', amount: -19.99, date: '12:00 AM', icon: 'play-circle-outline', iconColor: colors.red, iconBg: colors.redDim },
    ],
  },
  {
    title: 'May 20',
    data: [
      { id: 't5', merchant: 'Whole Foods', category: 'Groceries', amount: -87.43, date: '5:31 PM', icon: 'basket-outline', iconColor: colors.orange, iconBg: colors.orangeDim },
      { id: 't6', merchant: 'Uber', category: 'Transport', amount: -14.20, date: '2:10 PM', icon: 'car-outline', iconColor: colors.blue, iconBg: colors.blueDim },
      { id: 't7', merchant: 'Amazon', category: 'Shopping', amount: -64.99, date: '10:05 AM', icon: 'bag-outline', iconColor: colors.teal, iconBg: colors.tealDim },
    ],
  },
  {
    title: 'May 19',
    data: [
      { id: 't8', merchant: 'LCBO', category: 'Alcohol', amount: -38.50, date: '7:15 PM', icon: 'wine-outline', iconColor: colors.purple, iconBg: colors.purpleDim },
      { id: 't9', merchant: 'Gym Membership', category: 'Health', amount: -49.99, date: '9:00 AM', icon: 'fitness-outline', iconColor: colors.green, iconBg: colors.greenDim },
      { id: 't10', merchant: 'E-Transfer Received', category: 'Income', amount: 250.00, date: '8:22 AM', icon: 'swap-horizontal-outline', iconColor: colors.green, iconBg: colors.greenDim },
    ],
  },
];

const FILTERS = ['All', 'Income', 'Expenses', 'Transfers'];

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const previewTopInset = Platform.OS === 'web' ? (width < 650 ? 24 : 48) : insets.top;
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredData = ALL_TRANSACTIONS.map((section) => ({
    ...section,
    data: section.data.filter((t) => {
      const matchesSearch = t.merchant.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === 'All' ||
        (activeFilter === 'Income' && t.amount > 0) ||
        (activeFilter === 'Expenses' && t.amount < 0 && t.category !== 'Transfers') ||
        (activeFilter === 'Transfers' && t.category === 'Transfers');
      return matchesSearch && matchesFilter;
    }),
  })).filter((s) => s.data.length > 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[styles.header, compact && styles.headerCompact, { paddingTop: previewTopInset + spacing.sm }]}>
        <Text style={[styles.title, compact && styles.titleCompact]}>Plan</Text>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="options-outline" size={20} color={colors.green} />
          <Text style={styles.filterBtnText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, compact && styles.searchWrapCompact]}>
        <Ionicons name="search-outline" size={18} color={colors.textTertiary} style={styles.searchIcon} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search transactions..."
          placeholderTextColor={colors.textTertiary}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.chipsRow, compact && styles.chipsRowCompact]}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setActiveFilter(f)}
            style={[styles.chip, compact && styles.chipCompact, activeFilter === f && styles.chipActive]}
          >
            <Text style={[styles.chipText, compact && styles.chipTextCompact, activeFilter === f && styles.chipTextActive]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Transaction List */}
      <SectionList
        sections={filteredData}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.transactionListContent, compact && styles.transactionListContentCompact, { paddingBottom: insets.bottom + 100 }]}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionDate}>{section.title}</Text>
            <Text style={styles.sectionTotal}>
              {section.data.reduce((s, t) => s + t.amount, 0) >= 0 ? '+' : ''}
              ${Math.abs(section.data.reduce((s, t) => s + t.amount, 0)).toFixed(2)}
            </Text>
          </View>
        )}
        renderItem={({ item, index, section }) => (
          <>
              <View style={[styles.cardWrap, compact && styles.cardWrapCompact]}>
              <TransactionRow item={item} />
            </View>
            {index < section.data.length - 1 && <View style={styles.divider} />}
          </>
        )}
        ItemSeparatorComponent={() => null}
        SectionSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="search-outline" size={40} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />
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
  title: { color: colors.text, fontSize: font.size.xl, fontWeight: font.weight.bold },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  filterBtnText: { color: colors.green, fontSize: font.size.sm, fontWeight: font.weight.medium },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderWidth: 1, borderColor: colors.border,
    marginBottom: spacing.md,
  },
  searchIcon: { marginRight: spacing.sm },
  searchInput: { flex: 1, color: colors.text, fontSize: font.size.base },

  chipsRow: {
    flexDirection: 'row', gap: spacing.sm,
    paddingHorizontal: spacing.md, marginBottom: spacing.md,
  },
  chip: {
    paddingHorizontal: spacing.md, paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.greenDim, borderColor: colors.green },
  chipText: { color: colors.textSecondary, fontSize: font.size.sm, fontWeight: font.weight.medium },
  chipTextActive: { color: colors.green },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    backgroundColor: colors.bg,
  },
  sectionDate: { color: colors.textSecondary, fontSize: font.size.sm, fontWeight: font.weight.semibold },
  sectionTotal: { color: colors.textTertiary, fontSize: font.size.sm },

  cardWrap: { backgroundColor: colors.surface, paddingHorizontal: spacing.md },
  divider: { height: 1, backgroundColor: colors.borderFaint, marginHorizontal: spacing.md },

  empty: { alignItems: 'center', marginTop: spacing.xxl, gap: spacing.md },
  emptyText: { color: colors.textTertiary, fontSize: font.size.base },
  headerCompact: { paddingHorizontal: 16, paddingBottom: 12 },
  titleCompact: { fontSize: 22 },
  searchWrapCompact: { marginHorizontal: 16, paddingHorizontal: 12, paddingVertical: 9, marginBottom: 12 },
  chipsRowCompact: { gap: 4, paddingHorizontal: 16, marginBottom: 12 },
  chipCompact: { paddingHorizontal: 8, paddingVertical: 7 },
  chipTextCompact: { fontSize: 12 },
  transactionListContent: { paddingHorizontal: spacing.md },
  transactionListContentCompact: { paddingHorizontal: 16 },
  cardWrapCompact: { paddingHorizontal: 8 },
});
