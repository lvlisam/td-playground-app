import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AccountId } from '../accounts';
import { colors, font, radius, spacing } from '../theme';

type AccountNicknameEditorProps = {
  accountId: AccountId;
  name: string;
  onSave: (accountId: AccountId, name: string) => void;
  dark?: boolean;
};

export default function AccountNicknameEditor({ accountId, name, onSave, dark = false }: AccountNicknameEditorProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  const startEditing = () => {
    setDraft(name);
    setEditing(true);
  };

  const save = () => {
    const nextName = draft.trim();
    if (!nextName) return;
    onSave(accountId, nextName);
    setEditing(false);
  };

  if (editing) {
    return (
      <View style={styles.editor}>
        <TextInput
          accessibilityLabel="Account nickname"
          autoCapitalize="words"
          maxLength={32}
          onChangeText={setDraft}
          onSubmitEditing={save}
          returnKeyType="done"
          value={draft}
          selectTextOnFocus
          style={[styles.input, dark && styles.inputDark]}
        />
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Save account name" onPress={save} style={styles.iconButton}>
          <Ionicons name="checkmark" size={18} color={dark ? colors.white : colors.greenDeep} />
        </TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Cancel account name edit" onPress={() => setEditing(false)} style={styles.iconButton}>
          <Ionicons name="close" size={18} color={dark ? colors.white : colors.textSecondary} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.nameRow}>
      <Text numberOfLines={1} style={[styles.name, dark && styles.nameDark]}>{name}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={`Rename ${name}`}
        accessibilityHint="Choose a name that describes what you use this account for"
        onPress={startEditing}
        style={styles.iconButton}
      >
        <Ionicons name="pencil-outline" size={dark ? 14 : 16} color={dark ? colors.white : colors.greenDeep} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, minWidth: 0 },
  name: { flexShrink: 1, color: colors.text, fontSize: font.size.base, lineHeight: 21, fontFamily: font.headline.semibold },
  nameDark: { color: colors.white, fontSize: font.size.xs, lineHeight: 16, fontFamily: font.headline.regular },
  editor: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  input: { minWidth: 0, flex: 1, minHeight: 40, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, color: colors.text, fontSize: font.size.sm },
  inputDark: { backgroundColor: 'rgba(255,255,255,0.14)', borderColor: 'rgba(255,255,255,0.4)', color: colors.white },
  iconButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
});
