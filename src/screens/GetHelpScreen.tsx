import React, { useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TediScreen from './TediScreen';
import { colors, font, radius, spacing } from '../theme';

type VisitMode = 'In branch' | 'Video' | 'Phone';

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
    detail: 'Choose a nearby branch and arrange time with an advisor.',
    action: 'Find a branch',
    visitMode: 'In branch',
  },
];

export default function GetHelpScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const topInset = Platform.OS === 'web' ? 24 : insets.top;
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const [selectedNeedId, setSelectedNeedId] = useState(adviceNeeds[1].id);
  const selectedNeed = adviceNeeds.find((need) => need.id === selectedNeedId) ?? adviceNeeds[0];

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
          <Text style={styles.eyebrow}>HERE WHEN YOU NEED US</Text>
          <Text accessibilityRole="header" style={[styles.title, compact && styles.titleCompact]}>Get help</Text>
          <Text style={styles.subtitle}>Find an answer your way, or connect with an advisor who understands what matters to you.</Text>
        </View>

        <View style={styles.tediIntro}>
          <View style={styles.tediIcon}>
            <Ionicons name="sparkles-outline" size={17} color={colors.greenDeep} />
          </View>
          <View style={styles.tediCopy}>
            <Text style={styles.tediTitle}>Start with Tedi</Text>
            <Text style={styles.bodyCopy}>Ask a question, explore your digital banking tools, or find the right next step.</Text>
          </View>
        </View>
        <TediScreen embedded />

        <View style={styles.adviceSection}>
          <Text style={styles.sectionEyebrow}>PERSONALIZED SUPPORT</Text>
          <Text accessibilityRole="header" style={styles.sectionTitle}>What would you like help with?</Text>
          <Text style={styles.bodyCopy}>We’ll use your focus to suggest an advisor specialty when you schedule.</Text>
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
          <Text style={styles.disclaimer}>Scheduling and branch details are illustrative previews. No appointment or support request is sent from this demo.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.md, gap: spacing.md },
  contentCompact: { paddingHorizontal: 14, gap: 12 },
  header: { gap: 5 },
  eyebrow: { color: colors.greenDeep, fontSize: 10, lineHeight: 14, fontWeight: font.weight.bold, letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 27, lineHeight: 33, fontFamily: font.headline.bold },
  titleCompact: { fontSize: 24, lineHeight: 30 },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  tediIntro: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 3 },
  tediIcon: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  tediCopy: { flex: 1, gap: 2 },
  tediTitle: { color: colors.text, fontSize: 16, lineHeight: 21, fontFamily: font.headline.semibold },
  bodyCopy: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  adviceSection: { gap: 8, padding: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radius.xl, backgroundColor: colors.surface },
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
