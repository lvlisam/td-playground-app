import React, { useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, font, radius, spacing } from '../theme';
import { upcomingBillPayments } from '../financeData';
import type { TransferAction } from './TransferOverview';

type TediAction = Extract<TransferAction, 'send' | 'move' | 'bills'>;
type ChatMessage = {
  id: number;
  role: 'assistant' | 'user';
  text: string;
  action?: TediAction;
};
const quickPrompts = ['What’s due soon?', 'Help me move money'];
const actionLabels: Record<TediAction, string> = {
  send: 'Review send options',
  move: 'Review a transfer',
  bills: 'Review a bill payment',
};

function getDemoFallbackReply(message: string): Pick<ChatMessage, 'text' | 'action'> {
  const normalized = message.toLowerCase();
  const nextBill = upcomingBillPayments[0];

  if (/bill|due|upcoming/.test(normalized)) {
    return {
      text: `I couldn’t reach the AI service, but the sample bill list shows ${nextBill.merchant} (${nextBill.amount}) ${nextBill.timing.toLowerCase()}. Want to review a demo payment?`,
      action: 'bills',
    };
  }
  if (/move|transfer|saving|savings/.test(normalized)) {
    return {
      text: 'I couldn’t reach the AI service. The demo activity includes a sample $250 transfer to savings today. You can open the transfer form and review it yourself.',
      action: 'move',
    };
  }
  if (/send|request|pay/.test(normalized)) {
    return {
      text: 'I couldn’t reach the AI service, but I can open the demo send form for you to review. No money will move.',
      action: 'send',
    };
  }
  return {
    text: `I couldn’t reach the AI service just now. The soonest sample bill is ${nextBill.merchant}, ${nextBill.timing.toLowerCase()}. You can ask me about bills, sending money, or transfers.`,
  };
}

export default function TediMoveMoneyChat({ onSelectAction }: { onSelectAction: (action: TransferAction) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: 'assistant',
      text: 'Hi, I’m Tedi. I can help you look at upcoming bills or find the right way to move money. What are you hoping to do?',
    },
  ]);
  const [draft, setDraft] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [nextId, setNextId] = useState(1);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = async (value = draft) => {
    const text = value.trim();
    if (!text || isSending) return;

    const userMessage: ChatMessage = { id: nextId, role: 'user', text };
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setNextId((current) => current + 1);
    setDraft('');
    setIsSending(true);

    try {
      const response = await fetch('/api/tedi-money-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: conversation.slice(-12).map(({ role, text: messageText }) => ({ role, text: messageText })) }),
      });
      if (!response.ok) throw new Error('Tedi is unavailable');
      const result = await response.json() as { reply?: unknown; action?: unknown };
      if (typeof result.reply !== 'string' || !result.reply.trim()) throw new Error('Tedi returned an empty reply');

      const action = result.action === 'send' || result.action === 'move' || result.action === 'bills'
        ? result.action
        : undefined;
      setMessages((current) => [...current, {
        id: nextId + 1,
        role: 'assistant',
        text: result.reply as string,
        action,
      }]);
      setNextId((current) => current + 1);
    } catch {
      const fallback = getDemoFallbackReply(text);
      setMessages((current) => [...current, {
        id: nextId + 1,
        role: 'assistant',
        ...fallback,
      }]);
      setNextId((current) => current + 1);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.identityRow}>
        <View style={styles.assistantIcon} accessible={false}>
          <Ionicons name="sparkles-outline" size={19} color={colors.greenDeep} />
        </View>
        <View style={styles.identityCopy}>
          <Text style={styles.eyebrow}>YOUR TD ASSISTANT</Text>
          <Text style={styles.name}>Tedi</Text>
        </View>
        <View style={styles.demoTag}><Text style={styles.demoTagText}>DEMO</Text></View>
      </View>
      <Text style={styles.question}>What do you need to do today?</Text>

      <ScrollView
        ref={scrollRef}
        accessibilityLabel="Tedi conversation"
        nestedScrollEnabled
        style={styles.conversation}
        contentContainerStyle={styles.messages}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <View key={message.id} style={[styles.messageRow, message.role === 'user' && styles.userMessageRow]}>
            <View style={[styles.bubble, message.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
              <Text style={message.role === 'user' ? styles.userMessageText : styles.assistantMessageText}>{message.text}</Text>
              {message.action ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={() => onSelectAction(message.action!)}
                  style={styles.actionButton}
                >
                  <Text style={styles.actionButtonText}>{actionLabels[message.action]}</Text>
                  <Ionicons name="arrow-forward" size={14} color={colors.greenDeep} />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ))}
        {isSending ? (
          <View style={styles.loadingRow} accessibilityLiveRegion="polite">
            <ActivityIndicator size="small" color={colors.greenDeep} />
            <Text style={styles.loadingText}>Tedi is thinking…</Text>
          </View>
        ) : null}
      </ScrollView>

      {messages.length === 1 ? (
        <View style={styles.quickPrompts}>
          {quickPrompts.map((prompt) => (
            <TouchableOpacity key={prompt} accessibilityRole="button" disabled={isSending} onPress={() => sendMessage(prompt)} style={styles.promptChip}>
              <Text style={styles.promptText}>{prompt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : null}

      <View style={styles.composer}>
        <TextInput
          accessibilityLabel="Message Tedi about money movement"
          editable={!isSending}
          maxLength={320}
          multiline
          onChangeText={setDraft}
          placeholder="Ask Tedi what you need"
          placeholderTextColor={colors.textTertiary}
          style={styles.input}
          value={draft}
        />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Send message to Tedi"
          disabled={!draft.trim() || isSending}
          onPress={() => sendMessage()}
          style={[styles.sendButton, (!draft.trim() || isSending) && styles.sendButtonDisabled]}
        >
          {isSending
            ? <ActivityIndicator size="small" color={colors.white} />
            : <Ionicons name="arrow-up" size={19} color={colors.white} />}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.sm, borderRadius: radius.xl, backgroundColor: colors.green, gap: spacing.xs },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  assistantIcon: { width: 38, height: 38, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  identityCopy: { flex: 1, gap: 1 },
  eyebrow: { color: colors.greenDeep, fontSize: 9, lineHeight: 12, letterSpacing: 0.7, fontFamily: font.body.bold },
  name: { color: colors.text, fontSize: 16, lineHeight: 20, fontFamily: font.headline.bold },
  demoTag: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: radius.full, backgroundColor: 'rgba(255,255,255,0.62)' },
  demoTagText: { color: colors.greenDeep, fontSize: 8, lineHeight: 11, letterSpacing: 0.5, fontFamily: font.body.bold },
  question: { color: colors.text, fontSize: 20, lineHeight: 25, fontFamily: font.headline.bold },
  conversation: { maxHeight: 176, minHeight: 76, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: spacing.sm },
  messages: { flexGrow: 1, gap: spacing.sm },
  messageRow: { alignSelf: 'flex-start', maxWidth: '92%' },
  userMessageRow: { alignSelf: 'flex-end' },
  bubble: { paddingHorizontal: 11, paddingVertical: 9, borderRadius: radius.lg, gap: 7 },
  assistantBubble: { backgroundColor: colors.surfaceMid, borderBottomLeftRadius: radius.sm },
  userBubble: { backgroundColor: colors.greenDeep, borderBottomRightRadius: radius.sm },
  assistantMessageText: { color: colors.text, fontSize: 12, lineHeight: 17 },
  userMessageText: { color: colors.white, fontSize: 12, lineHeight: 17 },
  actionButton: { minHeight: 34, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.xs, paddingHorizontal: 9, borderRadius: radius.sm, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  actionButtonText: { color: colors.greenDeep, fontSize: 10, fontFamily: font.body.bold },
  loadingRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingVertical: 3 },
  loadingText: { color: colors.textSecondary, fontSize: 11 },
  quickPrompts: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  promptChip: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 9, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  promptText: { color: colors.greenDeep, fontSize: 10, lineHeight: 14, fontFamily: font.body.bold },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs },
  input: { flex: 1, minHeight: 44, maxHeight: 76, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: 11, paddingVertical: 9, color: colors.text, fontSize: 12, lineHeight: 17 },
  sendButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDeep },
  sendButtonDisabled: { opacity: 0.48 },
});
