import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, font, radius, spacing } from '../theme';

type Props = {
  label: string;
  positive?: boolean;
};

export default function GreenPill({ label, positive = true }: Props) {
  return (
    <View style={[styles.pill, { backgroundColor: positive ? colors.greenDim : colors.redDim }]}>
      <Text style={[styles.label, { color: positive ? colors.greenDeep : colors.red }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  label: {
    fontSize: font.size.xs,
    fontWeight: font.weight.semibold,
    letterSpacing: 0.3,
  },
});
