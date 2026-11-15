import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';

type TediDestination = 'Home' | 'Plan' | 'Pay & Transfer' | 'Benefits';

type TediAction = {
  label: string;
  destination: TediDestination;
};

type TediChatMessage = {
  id: number;
  role: 'assistant' | 'user';
  text: string;
  action?: TediAction;
};

const quickPrompts = ['Show my spending', 'Move money', 'Explore benefits', 'Manage my card'];

function getTediReply(message: string): Omit<TediChatMessage, 'id' | 'role'> {
  const input = message.toLowerCase();

  if (/spend|transaction|budget|saving|account/.test(input)) {
    return {
      text: 'Your spending insights and recent activity are in Plan.',
      action: { label: 'Open Plan', destination: 'Plan' },
    };
  }

  if (/send|transfer|pay|bill|money|zelle/.test(input)) {
    return {
      text: 'You can send money with Zelle, pay bills, or transfer between your accounts in Move money.',
      action: { label: 'Open Move money', destination: 'Pay & Transfer' },
    };
  }

  if (/benefit|reward|offer/.test(input)) {
    return {
      text: 'Your rewards and personalized offers are waiting in Benefits.',
      action: { label: 'Open Benefits', destination: 'Benefits' },
    };
  }

  if (/card|freeze|pin/.test(input)) {
    return {
      text: 'You can manage your credit card from its account on Home.',
      action: { label: 'Go to Home', destination: 'Home' },
    };
  }

  return {
    text: 'I can help you find spending insights, transfers, benefits, or card controls. Which would you like to explore?',
  };
}

export default function TediScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const topInset = Platform.OS === 'web' ? 24 : insets.top;
  const scrollRef = useRef<ScrollView>(null);
  const nextMessageId = useRef(1);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<TediChatMessage[]>([
    {
      id: 0,
      role: 'assistant',
      text: 'Good afternoon, Ava. I can help you find spending insights, send money, explore benefits, or manage your card.',
    },
  ]);

  const sendMessage = (value = draft) => {
    const text = value.trim();
    if (!text) return;

    const reply = getTediReply(text);
    const userMessage: TediChatMessage = { id: nextMessageId.current++, role: 'user', text };
    const assistantMessage: TediChatMessage = { id: nextMessageId.current++, role: 'assistant', ...reply };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setDraft('');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <StatusBar barStyle="dark-content" />
      <View
        style={[
          styles.chatLayout,
          compact && styles.chatLayoutCompact,
          { paddingTop: topInset + spacing.lg, paddingBottom: insets.bottom + 78 },
        ]}
      >
        <View style={styles.header}>
          <View style={[styles.assistantIcon, compact && styles.assistantIconCompact]}>
            <Ionicons name="sparkles-outline" size={compact ? 22 : 26} color={colors.greenDeep} />
          </View>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>YOUR TD ASSISTANT</Text>
            <Text style={[styles.title, compact && styles.titleCompact]}>Tedi</Text>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageRow,
                message.role === 'user' ? styles.userMessageRow : styles.assistantMessageRow,
              ]}
            >
              {message.role === 'assistant' && (
                <View style={styles.messageAvatar}>
                  <Ionicons name="sparkles" size={15} color={colors.greenDeep} />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.role === 'user' ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text style={message.role === 'user' ? styles.userMessageText : styles.assistantMessageText}>
                  {message.text}
                </Text>
                {message.action && (
                  <TouchableOpacity
                    accessibilityRole="button"
                    onPress={() => navigation.navigate(message.action!.destination)}
                    style={styles.actionLink}
                  >
                    <Text style={styles.actionLinkText}>{message.action.label}</Text>
                    <Ionicons name="arrow-forward" size={15} color={colors.greenDeep} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          {messages.length === 1 && (
            <View style={styles.suggestionList}>
              {quickPrompts.map((prompt) => (
                <TouchableOpacity
                  key={prompt}
                  accessibilityRole="button"
                  onPress={() => sendMessage(prompt)}
                  style={styles.suggestionChip}
                >
                  <Text style={styles.suggestionText}>{prompt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            accessibilityLabel="Message Tedi"
            multiline
            maxLength={320}
            onChangeText={setDraft}
            placeholder="Ask Tedi a question"
            placeholderTextColor={colors.textTertiary}
            style={styles.messageInput}
            value={draft}
          />
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Send message"
            disabled={!draft.trim()}
            onPress={() => sendMessage()}
            style={[styles.sendButton, !draft.trim() && styles.sendButtonDisabled]}
          >
            <Ionicons name="arrow-up" size={21} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  chatLayout: { flex: 1, paddingHorizontal: spacing.lg, gap: spacing.md },
  chatLayoutCompact: { paddingHorizontal: 16, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  assistantIcon: { width: 54, height: 54, borderRadius: radius.xl, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  assistantIconCompact: { width: 46, height: 46, borderRadius: radius.lg },
  headerCopy: { flex: 1 },
  eyebrow: { color: colors.textSecondary, fontSize: 11, fontWeight: font.weight.bold, letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 30, lineHeight: 36, fontFamily: font.headline.bold },
  titleCompact: { fontSize: 27, lineHeight: 33 },
  messages: { flex: 1, minHeight: 0 },
  messagesContent: { flexGrow: 1, justifyContent: 'flex-start', gap: 12, paddingBottom: 4 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '94%' },
  assistantMessageRow: { alignSelf: 'flex-start' },
  userMessageRow: { alignSelf: 'flex-end' },
  messageAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.greenDim, alignItems: 'center', justifyContent: 'center' },
  messageBubble: { maxWidth: '88%', paddingHorizontal: 14, paddingVertical: 12, borderRadius: radius.xl },
  assistantBubble: { backgroundColor: colors.surface, borderBottomLeftRadius: 5 },
  userBubble: { backgroundColor: colors.greenDeep, borderBottomRightRadius: 5 },
  assistantMessageText: { color: colors.text, fontSize: 14, lineHeight: 21 },
  userMessageText: { color: colors.white, fontSize: 14, lineHeight: 21 },
  actionLink: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  actionLinkText: { color: colors.greenDeep, fontSize: 14, fontWeight: font.weight.bold },
  suggestionList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginLeft: 36 },
  suggestionChip: { borderRadius: radius.full, backgroundColor: colors.greenDim, paddingHorizontal: 12, paddingVertical: 9 },
  suggestionText: { color: colors.greenDeep, fontSize: 13, lineHeight: 18, fontWeight: font.weight.semibold },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  messageInput: { flex: 1, minHeight: 50, maxHeight: 94, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 13, color: colors.text, fontSize: 15, lineHeight: 20 },
  sendButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.greenDeep, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.45 },
});
