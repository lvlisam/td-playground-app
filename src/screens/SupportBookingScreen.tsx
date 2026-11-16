import React, { useState } from 'react';
import { Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, font, radius, spacing } from '../theme';

type VisitMode = 'In branch' | 'Video' | 'Phone';

const branches = [
  { name: 'Downtown', wait: '8 min', address: '120 Broadway' },
  { name: 'Midtown', wait: '14 min', address: '350 Fifth Avenue' },
  { name: 'Queens Center', wait: '21 min', address: '90-15 Queens Blvd' },
];
const specialties = ['Everyday banking', 'Home lending', 'Small business', 'Financial planning'];
const languages = ['English', 'Spanish', 'Mandarin'];
const prepItems = ['Review my accounts', 'Talk through a savings goal', 'Ask about a recent transaction'];

export default function SupportBookingScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const compact = width < 360;
  const topInset = Platform.OS === 'web' ? (width < 650 ? 24 : 48) : insets.top;
  const [supportRequested, setSupportRequested] = useState(false);
  const [visitMode, setVisitMode] = useState<VisitMode>('In branch');
  const [selectedBranch, setSelectedBranch] = useState(branches[0].name);
  const [selectedSpecialty, setSelectedSpecialty] = useState(specialties[0]);
  const [selectedLanguage, setSelectedLanguage] = useState(languages[0]);
  const [checkedPrep, setCheckedPrep] = useState<string[]>([prepItems[0]]);
  const [agenda, setAgenda] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const togglePrep = (item: string) => {
    setCheckedPrep((current) => current.includes(item) ? current.filter((value) => value !== item) : [...current, item]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, compact && styles.contentCompact, { paddingTop: topInset + spacing.md, paddingBottom: insets.bottom + 100 }]}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>HERE WHEN YOU NEED US</Text>
          <Text accessibilityRole="header" style={[styles.title, compact && styles.titleCompact]}>Talk to a person</Text>
          <Text style={styles.subtitle}>Get help now or choose a banker and make time to talk.</Text>
        </View>

        <View style={styles.supportCard}>
          <View style={styles.supportIcon}><Ionicons name="chatbubbles-outline" size={21} color={colors.greenDeep} /></View>
          <View style={styles.supportCopy}>
            <Text style={styles.cardTitle}>Human help, without the wait</Text>
            <Text style={styles.bodyCopy}>Illustrative support response: usually under 2 minutes.</Text>
          </View>
          <View style={styles.availability}><View style={styles.onlineDot} /><Text style={styles.availabilityText}>Available</Text></View>
          <TouchableOpacity accessibilityRole="button" onPress={() => setSupportRequested(true)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{supportRequested ? 'Request received' : 'Request a person'}</Text>
            <Ionicons name={supportRequested ? 'checkmark' : 'arrow-forward'} size={17} color={colors.white} />
          </TouchableOpacity>
          {supportRequested ? <Text accessibilityLiveRegion="polite" style={styles.statusNote}>Demo request received. A real specialist has not been contacted.</Text> : null}
        </View>

        <View style={styles.sectionHeading}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Book time with a banker</Text>
          <Text style={styles.bodyCopy}>Choose how you want to meet and who can best help.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.fieldLabel}>MEETING TYPE</Text>
          <View style={styles.choiceRow}>
            {(['In branch', 'Video', 'Phone'] as const).map((mode) => (
              <TouchableOpacity key={mode} accessibilityRole="button" accessibilityState={{ selected: visitMode === mode }} onPress={() => setVisitMode(mode)} style={[styles.choiceChip, visitMode === mode && styles.choiceChipActive]}>
                <Text style={[styles.choiceText, visitMode === mode && styles.choiceTextActive]}>{mode}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>BANKER SPECIALTY</Text>
          <View style={styles.choiceRowWrap}>
            {specialties.map((specialty) => (
              <TouchableOpacity key={specialty} accessibilityRole="button" accessibilityState={{ selected: selectedSpecialty === specialty }} onPress={() => setSelectedSpecialty(specialty)} style={[styles.choiceChip, selectedSpecialty === specialty && styles.choiceChipActive]}>
                <Text style={[styles.choiceText, selectedSpecialty === specialty && styles.choiceTextActive]}>{specialty}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.fieldLabel}>LANGUAGE</Text>
          <View style={styles.choiceRow}>
            {languages.map((language) => (
              <TouchableOpacity key={language} accessibilityRole="button" accessibilityState={{ selected: selectedLanguage === language }} onPress={() => setSelectedLanguage(language)} style={[styles.choiceChip, selectedLanguage === language && styles.choiceChipActive]}>
                <Text style={[styles.choiceText, selectedLanguage === language && styles.choiceTextActive]}>{language}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {visitMode === 'In branch' ? (
            <>
              <View style={styles.branchHeading}>
                <Text style={styles.fieldLabel}>NEARBY BRANCHES</Text>
                <Text style={styles.waitLegend}>Live wait · sample</Text>
              </View>
              {branches.map((branch) => {
                const selected = selectedBranch === branch.name;
                return (
                  <TouchableOpacity key={branch.name} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => setSelectedBranch(branch.name)} style={[styles.branchRow, selected && styles.branchRowSelected]}>
                    <View style={styles.branchIcon}><Ionicons name="location-outline" size={18} color={colors.greenDeep} /></View>
                    <View style={styles.branchCopy}>
                      <Text style={styles.branchName}>{branch.name}</Text>
                      <Text style={styles.branchAddress}>{branch.address}</Text>
                    </View>
                    <View style={styles.waitTime}><Text style={styles.waitValue}>{branch.wait}</Text><Text style={styles.waitLabel}>wait</Text></View>
                  </TouchableOpacity>
                );
              })}
            </>
          ) : null}
        </View>

        <View style={styles.sectionHeading}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Pre-brief your banker</Text>
          <Text style={styles.bodyCopy}>Share a little context so your conversation can start in the right place.</Text>
        </View>
        <View style={styles.card}>
          {prepItems.map((item) => {
            const checked = checkedPrep.includes(item);
            return (
              <TouchableOpacity key={item} accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={() => togglePrep(item)} style={styles.checkRow}>
                <View style={[styles.checkbox, checked && styles.checkboxChecked]}>{checked ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}</View>
                <Text style={styles.checkText}>{item}</Text>
              </TouchableOpacity>
            );
          })}
          <TextInput
            accessibilityLabel="What would you like to discuss?"
            multiline
            maxLength={240}
            onChangeText={setAgenda}
            placeholder="Anything else you&apos;d like to discuss?"
            placeholderTextColor={colors.textTertiary}
            style={styles.agendaInput}
            value={agenda}
          />
          <TouchableOpacity accessibilityRole="button" onPress={() => setBookingConfirmed(true)} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{bookingConfirmed ? 'Preview saved' : 'Preview booking'}</Text>
            <Ionicons name={bookingConfirmed ? 'checkmark' : 'calendar-outline'} size={17} color={colors.white} />
          </TouchableOpacity>
          {bookingConfirmed ? (
            <View accessibilityLiveRegion="polite" style={styles.confirmation}>
              <Ionicons name="checkmark-circle" size={18} color={colors.greenDeep} />
              <Text style={styles.confirmationText}>Preview only: {visitMode.toLowerCase()} with {selectedLanguage === 'English' ? 'an' : 'a'} {selectedLanguage}-speaking {selectedSpecialty.toLowerCase()}{visitMode === 'In branch' ? ` at ${selectedBranch}` : ''}. No real appointment was booked.</Text>
            </View>
          ) : null}
          <Text style={styles.disclaimer}>Sample branch hours and wait times are illustrative and may not reflect actual availability.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.md, gap: spacing.md },
  contentCompact: { paddingHorizontal: 14, gap: 12 },
  header: { gap: 5, marginBottom: 2 },
  eyebrow: { color: colors.greenDeep, fontSize: 10, lineHeight: 14, fontWeight: font.weight.bold, letterSpacing: 0.8 },
  title: { color: colors.text, fontSize: 27, lineHeight: 33, fontFamily: font.headline.bold },
  titleCompact: { fontSize: 24, lineHeight: 30 },
  subtitle: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  supportCard: { padding: 14, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 10 },
  supportIcon: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.greenDim },
  supportCopy: { gap: 2 },
  cardTitle: { color: colors.text, fontSize: 15, fontFamily: font.headline.semibold },
  bodyCopy: { color: colors.textSecondary, fontSize: 12, lineHeight: 17 },
  availability: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 5, borderRadius: radius.full, backgroundColor: colors.greenDim },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.greenDeep },
  availabilityText: { color: colors.greenDeep, fontSize: 11, fontWeight: font.weight.bold },
  primaryButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: radius.md, backgroundColor: colors.greenDeep, paddingHorizontal: 14 },
  primaryButtonText: { color: colors.white, fontSize: 13, fontWeight: font.weight.bold },
  statusNote: { color: colors.textSecondary, fontSize: 11, lineHeight: 15 },
  sectionHeading: { gap: 3, marginTop: 2 },
  sectionTitle: { color: colors.text, fontSize: 18, lineHeight: 24, fontFamily: font.headline.semibold },
  card: { padding: 14, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 10 },
  fieldLabel: { color: colors.textSecondary, fontSize: 9, lineHeight: 13, fontWeight: font.weight.bold, letterSpacing: 0.7, marginTop: 4 },
  choiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  choiceRowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  choiceChip: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, backgroundColor: colors.surface },
  choiceChipActive: { borderColor: colors.greenDeep, backgroundColor: colors.greenDim },
  choiceText: { color: colors.textSecondary, fontSize: 11, fontWeight: font.weight.medium },
  choiceTextActive: { color: colors.greenDeep, fontWeight: font.weight.bold },
  branchHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  waitLegend: { color: colors.textTertiary, fontSize: 10 },
  branchRow: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 8, borderWidth: 1, borderColor: colors.borderFaint, borderRadius: radius.md },
  branchRowSelected: { borderColor: colors.greenDeep, backgroundColor: colors.greenDim },
  branchIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 11, backgroundColor: colors.surfaceHigh },
  branchCopy: { flex: 1, minWidth: 0 },
  branchName: { color: colors.text, fontSize: 13, fontFamily: font.headline.semibold },
  branchAddress: { color: colors.textSecondary, fontSize: 10, lineHeight: 14 },
  waitTime: { alignItems: 'flex-end' },
  waitValue: { color: colors.greenDeep, fontSize: 13, fontFamily: font.headline.bold },
  waitLabel: { color: colors.textSecondary, fontSize: 9 },
  checkRow: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 9 },
  checkbox: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', borderRadius: 6, borderWidth: 1, borderColor: colors.border },
  checkboxChecked: { borderColor: colors.greenDeep, backgroundColor: colors.greenDeep },
  checkText: { color: colors.text, fontSize: 12, flex: 1 },
  agendaInput: { minHeight: 76, padding: 11, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.surface, color: colors.text, fontSize: 13, textAlignVertical: 'top' },
  confirmation: { flexDirection: 'row', alignItems: 'flex-start', gap: 7, padding: 10, borderRadius: radius.md, backgroundColor: colors.greenDim },
  confirmationText: { flex: 1, color: colors.text, fontSize: 11, lineHeight: 16 },
  disclaimer: { color: colors.textTertiary, fontSize: 10, lineHeight: 14 },
});
