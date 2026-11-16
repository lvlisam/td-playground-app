import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from '../theme';

export type Transaction = {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  date: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
};

type Props = { item: Transaction };

export default function TransactionRow({ item }: Props) {
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const isCredit = item.amount > 0;
  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      <View style={[styles.iconWrap, compact && styles.iconWrapCompact, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={20} color={item.iconColor} />
      </View>
      <View style={styles.info}>
        <Text numberOfLines={compact ? 1 : undefined} style={[styles.merchant, compact && styles.merchantCompact]}>{item.merchant}</Text>
        <Text numberOfLines={compact ? 1 : undefined} style={[styles.category, compact && styles.categoryCompact]}>{item.category}</Text>
      </View>
      <View style={[styles.right, compact && styles.rightCompact]}>
        <Text style={[styles.amount, compact && styles.amountCompact, { color: isCredit ? colors.greenDeep : colors.text }]}>
          {isCredit ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
        </Text>
        <Text style={[styles.date, compact && styles.dateCompact]}>{item.date}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: spacing.md,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: { flex: 1 },
  merchant: {
    color: colors.text,
    fontSize: font.size.base,
    fontFamily: font.headline.medium,
  },
  category: {
    color: colors.textSecondary,
    fontSize: font.size.sm,
    marginTop: 2,
  },
  right: { alignItems: 'flex-end' },
  amount: {
    fontSize: font.size.base,
    fontWeight: font.weight.semibold,
  },
  date: {
    color: colors.textTertiary,
    fontSize: font.size.xs,
    marginTop: 2,
  },
  rowCompact: { gap: 8, paddingVertical: 10 },
  iconWrapCompact: { width: 36, height: 36 },
  merchantCompact: { fontSize: 13 },
  categoryCompact: { fontSize: 12 },
  rightCompact: { minWidth: 68 },
  amountCompact: { fontSize: 13 },
  dateCompact: { fontSize: 11 },
});
