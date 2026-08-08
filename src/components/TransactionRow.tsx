import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
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
  const isCredit = item.amount > 0;
  return (
    <View style={styles.row}>
      <View style={[styles.iconWrap, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon} size={20} color={item.iconColor} />
      </View>
      <View style={styles.info}>
        <Text style={styles.merchant}>{item.merchant}</Text>
        <Text style={styles.category}>{item.category}</Text>
      </View>
      <View style={styles.right}>
        <Text style={[styles.amount, { color: isCredit ? colors.green : colors.text }]}>
          {isCredit ? '+' : ''}${Math.abs(item.amount).toFixed(2)}
        </Text>
        <Text style={styles.date}>{item.date}</Text>
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
    fontWeight: font.weight.medium,
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
});
