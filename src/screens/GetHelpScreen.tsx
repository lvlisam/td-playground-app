import React, { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TediScreen, { type TediScreenHandle } from './TediScreen';
import { colors, font, radius, spacing } from '../theme';
import ScreenBackButton from '../components/ScreenBackButton';

type VisitMode = 'In store' | 'Video' | 'Phone';

type AdviceNeed = {
  id: string;
  label: string;
  specialty: string;
};

const adviceNeeds: AdviceNeed[] = [
  { id: 'everyday', label: 'Everyday banking', specialty: 'Everyday banking' },
  { id: 'saving', label: 'Saving & planning', specialty: 'Financial planning' },
  { id: 'home', label: 'Home lending', specialty: 'Home lending' },
  { id: 'business', label: 'Small business', specialty: 'Small business' },
];

const supportChannels: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  action: string;
  visitMode?: VisitMode;
}[] = [
  {
    icon: 'phone-portrait-outline',
    title: 'Digital tools',
    detail: 'Manage accounts and cards, move money, and review your plan in the app.',
    action: 'Explore digital tools',
  },
  {
    icon: 'videocam-outline',
    title: 'Meet virtually',
    detail: 'Schedule a video conversation with an advisor who fits your needs.',
    action: 'Choose a video meeting',
    visitMode: 'Video',
  },
  {
    icon: 'call-outline',
    title: 'Talk by phone',
    detail: 'Pick a time to speak with a specialist about your question or goal.',
    action: 'Schedule a phone call',
    visitMode: 'Phone',
  },
  {
    icon: 'location-outline',
    title: 'Meet in person',
    detail: 'Choose a nearby store and arrange time with an advisor.',
    action: 'Find a store',
    visitMode: 'In store',
  },
];

export default function GetHelpScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const topInset = Platform.OS === 'web' ? 24 : insets.top;
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [selectedNeedId, setSelectedNeedId] = useState(adviceNeeds[1].id);
  const [tediDraft, setTediDraft] = useState('');
  const tediRef = useRef<TediScreenHandle>(null);
  const selectedNeed = adviceNeeds.find((need) => need.id === selectedNeedId) ?? adviceNeeds[0];

  const sendTediMessage = () => {
    const message = tediDraft.trim();
    if (!message || !tediRef.current) return;
    tediRef.current.sendMessage(message);
    setTediDraft('');
  };

  const openChannel = (visitMode?: VisitMode) => {
    if (!visitMode) {
      navigation.navigate('Account servicing');
      return;
    }
    navigation.navigate('Support & booking', {
      visitMode,
      specialty: selectedNeed.specialty,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, compact && styles.contentCompact, { paddingTop: topInset + spacing.md, paddingBottom: insets.bottom + 132 }]}
      >
        <View style={styles.header}>
          <ScreenBackButton />
          <Text style={styles.eyebrow}>HERE WHEN YOU NEED US</Text>
          <Text accessibilityRole="header" style={[styles.title, compact && styles.titleCompact]}>Get help</Text>
        </View>

        <TediScreen ref={tediRef} embedded hideComposer />

        <View style={styles.adviceCard}>
          <View style={styles.adviceSection}>
            <Text style={styles.sectionEyebrow}>PERSONALIZED SUPPORT</Text>
            <Text accessibilityRole="header" style={styles.sectionTitle}>What would you like help with?</Text>
            <Text style={styles.bodyCopy}>Choose a focus and we’ll recommend the right advisor when you connect.</Text>
            <View style={styles.needChips}>
              {adviceNeeds.map((need) => {
                const selected = selectedNeed.id === need.id;
                return (
                  <TouchableOpacity
                    key={need.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    onPress={() => setSelectedNeedId(need.id)}
                    style={[styles.needChip, selected && styles.needChipSelected]}
                  >
                    <Text style={[styles.needChipText, selected && styles.needChipTextSelected]}>{need.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.recommendation}>
              <Ionicons name="sparkles-outline" size={16} color={colors.greenDeep} />
              <Text style={styles.recommendationText}>Recommended advisor: {selectedNeed.specialty}</Text>
            </View>
          </View>
        </View>

        <View style={styles.channelsSection}>
          <View style={styles.channelHeading}>
            <View style={styles.channelHeadingCopy}>
              <Text style={styles.sectionEyebrow}>CHOOSE HOW TO CONNECT</Text>
              <Text accessibilityRole="header" style={styles.sectionTitle}>Ways TD can help</Text>
            </View>
            <Ionicons name="arrow-down-outline" size={18} color={colors.greenDeep} />
          </View>
          <View style={styles.channelList}>
            {supportChannels.map((channel) => (
              <View key={channel.title} style={styles.channelCard}>
                <View style={styles.channelIcon}>
                  <Ionicons name={channel.icon} size={19} color={colors.greenDeep} />
                </View>
                <View style={styles.channelCopy}>
                  <Text style={styles.channelTitle}>{channel.title}</Text>
                  <Text style={styles.channelDetail}>{channel.detail}</Text>
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityHint={channel.visitMode ? `Opens scheduling with ${channel.visitMode.toLowerCase()} and ${selectedNeed.specialty} selected` : 'Opens digital account servicing tools'}
                    onPress={() => openChannel(channel.visitMode)}
                    style={styles.channelAction}
                  >
                    <Text style={styles.channelActionText}>{channel.action}</Text>
                    <Ionicons name="arrow-forward" size={15} color={colors.greenDeep} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
          <Text style={styles.disclaimer}>Store availability and scheduling details are illustrative. No appointment or support request is submitted here.</Text>
        </View>
      </ScrollView>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
        style={styles.stickyComposer}
      >
        <TextInput
          accessibilityLabel="Ask Tedi a question"
          maxLength={320}
          multiline
          onChangeText={setTediDraft}
          placeholder="Ask Tedi a question"
          placeholderTextColor={colors.textTertiary}
          style={styles.stickyInput}
          value={tediDraft}
        />
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Send question to Tedi"
          disabled={!tediDraft.trim()}
          onPress={sendTediMessage}
          style={[styles.stickySendButton, !tediDraft.trim() && styles.stickySendButtonDisabled]}
        >
          <Ionicons name="arrow-up" size={20} color={colors.white} />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  stickyComposer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
  stickyInput: {
    flex: 1,
    minHeight: 46,
    maxHeight: 82,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  stickySendButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.greenDeep,
  },
  stickySendButtonDisabled: { opacity: 0.45 },
  content: { paddingHorizontal: spacing.md, gap: spacing.md },
  contentCompact: { paddingHorizontal: 14, gap: 12 },
  header: { gap: 5 },
  eyebrow: { color: colors.greenDeep, fontSize: 10, lineHeight: 14, fontWeight: font.weight.bold, letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 27, lineHeight: 33, fontFamily: font.headline.bold },
  titleCompact: { fontSize: 24, lineHeight: 30 },
  bodyCopy: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  adviceCard: { padding: spacing.md, borderRadius: radius.xl, backgroundColor: colors.surface },
  adviceSection: { gap: 8 },
  sectionEyebrow: { color: colors.greenDeep, fontSize: 9, lineHeight: 13, fontFamily: font.body.bold, letterSpacing: 0.8 },
  sectionTitle: { color: colors.text, fontSize: 18, lineHeight: 24, fontFamily: font.headline.semibold },
  needChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 3 },
  needChip: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 11, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, backgroundColor: colors.surface },
  needChipSelected: { borderColor: colors.greenDeep, backgroundColor: colors.greenDim },
  needChipText: { color: colors.textSecondary, fontSize: 11, lineHeight: 15, fontFamily: font.body.medium },
  needChipTextSelected: { color: colors.greenDeep, fontFamily: font.body.bold },
  recommendation: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 3 },
  recommendationText: { flex: 1, color: colors.greenDeep, fontSize: 11, lineHeight: 16, fontFamily: font.body.bold },
  channelsSection: { gap: 10 },
  channelHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  channelHeadingCopy: { gap: 2 },
  channelList: { gap: 8 },
  channelCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, backgroundColor: colors.surface },
  channelIcon: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  channelCopy: { flex: 1, minWidth: 0, gap: 3 },
  channelTitle: { color: colors.text, fontSize: 14, lineHeight: 19, fontFamily: font.headline.semibold },
  channelDetail: { color: colors.textSecondary, fontSize: 11, lineHeight: 16 },
  channelAction: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 5, minHeight: 34, marginTop: 1 },
  channelActionText: { color: colors.greenDeep, fontSize: 11, lineHeight: 15, fontFamily: font.body.bold },
  disclaimer: { color: colors.textTertiary, fontSize: 10, lineHeight: 15 },
});
