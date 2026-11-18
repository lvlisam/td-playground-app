import React, { useImperativeHandle, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';

type TediDestination = 'Home' | 'Insights' | 'Pay & Transfer' | 'Benefits' | 'Card Manager' | 'Support & booking';

type TediAction = {
  label: string;
  destination: TediDestination;
};

type TediChatMessage = {
  id: number;
  role: 'assistant' | 'user';
  text: string;
  action?: TediAction;
  confirmationPrompt?: string;
  confirmationKind?: 'transfer' | 'freeze';
};

const quickPrompts = ['Show my spending', 'Move money', 'Talk to a person', 'Book a store visit', 'Explore benefits', 'Manage my card'];

function getTediReply(message: string): Omit<TediChatMessage, 'id' | 'role'> {
  const input = message.toLowerCase();

  if (/human|person|specialist|support|banker|store|appointment|meeting/.test(input)) {
    return {
      text: 'I can help you connect with a specialist, review sample store wait times, and prepare for your conversation.',
      action: { label: 'Open support & booking', destination: 'Support & booking' },
    };
  }

  if (/freeze|lock card/.test(input)) {
    return {
      text: 'I can prepare a card-freeze request for review. It will not affect a real card.',
      action: { label: 'Open card controls', destination: 'Card Manager' },
      confirmationPrompt: 'Review a card-freeze request? It will not affect a real card.',
      confirmationKind: 'freeze',
    };
  }

  if (/send money|transfer|move money|send to/.test(input)) {
    return {
      text: 'I can prepare a transfer for review. No funds will move.',
      action: { label: 'Open Move money', destination: 'Pay & Transfer' },
      confirmationPrompt: 'Review transfer details? No funds will move.',
      confirmationKind: 'transfer',
    };
  }

  if (/spend|transaction|budget|saving|account/.test(input)) {
    return {
text: 'Your account insights and month-over-month activity are here.',
    action: { label: 'Open Insights', destination: 'Insights' },
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

  if (/suggest|recommend|save more/.test(input)) {
    return {
      text: 'A small weekly transfer could help build your getaway fund. I can prepare the details for your review.',
      confirmationPrompt: 'Review a $25 weekly savings transfer? No funds will move.',
      confirmationKind: 'transfer',
      action: { label: 'Open savings insights', destination: 'Insights' },
    };
  }

  if (/card|pin/.test(input)) {
    return {
      text: 'Review card controls, limits, and one-time card options.',
      action: { label: 'Open card controls', destination: 'Card Manager' },
    };
  }

  return {
    text: 'I can help you find spending insights, transfers, benefits, or card controls. Which would you like to explore?',
  };
}

export type TediScreenHandle = { sendMessage: (message: string) => void };
type TediScreenProps = { embedded?: boolean; hideComposer?: boolean; footer?: React.ReactNode };

const TediScreen = React.forwardRef<TediScreenHandle, TediScreenProps>(function TediScreen(
  { embedded = false, hideComposer = false, footer },
  ref,
) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const topInset = embedded ? 0 : Platform.OS === 'web' ? 24 : insets.top;
  const scrollRef = useRef<ScrollView>(null);
  const nextMessageId = useRef(1);
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<TediChatMessage[]>(() => embedded ? [] : [
    {
      id: 0,
      role: 'assistant',
      text: 'Good afternoon, Ava. I can help you find spending insights, send money, explore benefits, or manage your card.',
    },
  ]);
  const isEmptyEmbedded = embedded && messages.length === 0;
  const shouldScrollToEnd = useRef(false);

  const sendMessage = (value = draft) => {
    const text = value.trim();
    if (!text) return;

    const reply = getTediReply(text);
    const userMessage: TediChatMessage = { id: nextMessageId.current++, role: 'user', text };
    const assistantMessage: TediChatMessage = { id: nextMessageId.current++, role: 'assistant', ...reply };

    shouldScrollToEnd.current = true;
    setMessages((current) => [...current, userMessage, assistantMessage]);
    setDraft('');
  };

  useImperativeHandle(ref, () => ({ sendMessage }));

  const resolveConfirmation = (message: TediChatMessage, confirmed: boolean) => {
    const confirmationMessage: TediChatMessage = {
      id: nextMessageId.current++,
      role: 'assistant',
      text: confirmed
        ? (message.confirmationKind === 'freeze'
          ? 'Card-freeze request reviewed. No real card was changed.'
          : 'Transfer details reviewed. No money was moved.')
        : 'Request canceled. Nothing was changed.',
      action: confirmed && message.confirmationKind === 'freeze'
        ? { label: 'Review card controls', destination: 'Card Manager' }
        : undefined,
    };
    shouldScrollToEnd.current = true;
    setMessages((current) => [
      ...current.map((item) => item.id === message.id ? { ...item, confirmationPrompt: undefined } : item),
      confirmationMessage,
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, embedded && styles.embeddedContainer, isEmptyEmbedded && styles.embeddedEmptyContainer, embedded && !isEmptyEmbedded && styles.embeddedFixedContainer]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={insets.top}
    >
      <StatusBar barStyle="dark-content" />
      <View
        style={[
          styles.chatLayout,
          compact && styles.chatLayoutCompact,
          embedded && styles.embeddedChatLayout,
          isEmptyEmbedded && styles.embeddedEmptyChatLayout,
          { paddingTop: isEmptyEmbedded ? 0 : embedded ? spacing.md : topInset + spacing.lg, paddingBottom: isEmptyEmbedded ? 0 : embedded ? spacing.md : insets.bottom + 112 },
        ]}
      >
        {!embedded ? (
          <View style={styles.header}>
            <View style={[styles.assistantIcon, compact && styles.assistantIconCompact]}>
              <Ionicons name="sparkles-outline" size={compact ? 22 : 26} color={colors.greenDeep} />
            </View>
            <View style={styles.headerCopy}>
              <Text style={styles.eyebrow}>YOUR TD ASSISTANT</Text>
              <Text style={[styles.title, compact && styles.titleCompact]}>Tedi</Text>
            </View>
          </View>
        ) : null}

        <ScrollView
          ref={scrollRef}
          style={[styles.messages, isEmptyEmbedded && styles.emptyEmbeddedMessages]}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            if (shouldScrollToEnd.current) {
              shouldScrollToEnd.current = false;
              scrollRef.current?.scrollToEnd({ animated: true });
            }
          }}
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
                {message.confirmationPrompt && (
                  <View style={styles.confirmationPanel}>
                    <Text style={styles.confirmationPrompt}>{message.confirmationPrompt}</Text>
                    <View style={styles.confirmationActions}>
                      <TouchableOpacity accessibilityRole="button" onPress={() => resolveConfirmation(message, false)} style={styles.confirmationCancel}>
                        <Text style={styles.confirmationCancelText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity accessibilityRole="button" onPress={() => resolveConfirmation(message, true)} style={styles.confirmationConfirm}>
                        <Text style={styles.confirmationConfirmText}>Confirm details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
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

        {!hideComposer && (
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
        )}
      </View>
      {embedded && footer ? <View style={[styles.embeddedFooter, isEmptyEmbedded && styles.embeddedEmptyFooter]}>{footer}</View> : null}
    </KeyboardAvoidingView>
  );
});

export default TediScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  embeddedContainer: { flex: 0, flexGrow: 0, flexShrink: 0, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, backgroundColor: colors.surface },
  embeddedEmptyContainer: { height: 0, borderWidth: 0 },
  embeddedFixedContainer: { height: 560, minHeight: 560 },
  embeddedFooter: { paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, backgroundColor: colors.surface },
  embeddedEmptyFooter: { borderTopWidth: 0 },
  chatLayout: { flex: 1, paddingHorizontal: spacing.lg, gap: spacing.md },
  embeddedChatLayout: { paddingHorizontal: spacing.md, gap: spacing.sm },
  embeddedEmptyChatLayout: { flex: 0 },
  chatLayoutCompact: { paddingHorizontal: 16, gap: 12 },
  emptyEmbeddedMessages: { flex: 0, height: 0 },
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
  confirmationPanel: { marginTop: 10, padding: 10, borderRadius: radius.md, backgroundColor: colors.surfaceHigh, gap: 8 },
  confirmationPrompt: { color: colors.text, fontSize: 12, lineHeight: 17, fontWeight: font.weight.semibold },
  confirmationActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8 },
  confirmationCancel: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 10 },
  confirmationCancelText: { color: colors.textSecondary, fontSize: 11, fontWeight: font.weight.semibold },
  confirmationConfirm: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 10, borderRadius: radius.sm, backgroundColor: colors.greenDeep },
  confirmationConfirmText: { color: colors.white, fontSize: 11, fontWeight: font.weight.bold },
  suggestionList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginLeft: 36 },
  suggestionChip: { borderRadius: radius.full, backgroundColor: colors.greenDim, paddingHorizontal: 12, paddingVertical: 9 },
  suggestionText: { color: colors.greenDeep, fontSize: 13, lineHeight: 18, fontWeight: font.weight.semibold },
  composer: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  messageInput: { flex: 1, minHeight: 50, maxHeight: 94, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, backgroundColor: colors.surface, paddingHorizontal: 14, paddingVertical: 13, color: colors.text, fontSize: 15, lineHeight: 20 },
  sendButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.greenDeep, alignItems: 'center', justifyContent: 'center' },
  sendButtonDisabled: { opacity: 0.45 },
});
