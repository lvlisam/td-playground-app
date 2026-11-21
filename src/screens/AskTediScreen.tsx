import React from 'react';
import { ScrollView, View, Text } from 'react-native';
import { useNavigation, type NavigationProp, type ParamListBase } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TediMoveMoneyChat from '../components/TediMoveMoneyChat';
import ScreenBackButton from '../components/ScreenBackButton';
import { useDashboardProfile } from '../personas';
import { colors, font, spacing } from '../theme';

export default function AskTediScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { activeProfileId } = useDashboardProfile();
  const insets = useSafeAreaInsets();
  return <ScrollView keyboardShouldPersistTaps="handled" style={{backgroundColor:colors.bg}} contentContainerStyle={{padding:spacing.md,paddingTop:Math.max(48,insets.top),gap:spacing.md}}>
    <View style={{flexDirection:'row',alignItems:'center',gap:spacing.sm}}><ScreenBackButton/><Text accessibilityRole="header" style={{fontFamily:font.headline.semibold,fontSize:font.size.lg,color:colors.text}}>Tedi</Text></View>
    <TediMoveMoneyChat key={activeProfileId} onSelectAction={action=>navigation.navigate('Pay & Transfer',{action})}/>
  </ScrollView>;
}
