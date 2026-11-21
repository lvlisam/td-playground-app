import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, font } from '../theme';
import type { DashboardAccount } from '../screens/DashboardScreen';

type Activity = { id: string; accountId: string; merchant: string; time: string; amount: string };
const money = (value: number) => value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export default function AccountDetails({account, activity, onClose}: {account: DashboardAccount; activity: readonly Activity[]; onClose: () => void}) {
  const plan = account.plan;
  const rows = activity.filter(t => t.accountId === account.id);
  const fields: [string,string][] = account.detail.split(' · ').map(value => [value.includes('••••') ? 'Account number' : value.includes('APY') ? 'Interest rate' : 'Credit availability',value]);
  if(account.note) fields.push([account.id.endsWith('card') ? 'Rewards or notes' : 'Account note',account.note]);
  if(plan?.kind === 'spending') fields.push(['Monthly budget',money(plan.monthlyBudget)],['Spent this month',money(plan.spent)],['Budget remaining',money(plan.monthlyBudget-plan.spent)]);
  if(plan?.kind === 'savings-goal') fields.push(['Savings target',money(plan.targetAmount)],['Saved toward goal',money(plan.savedAmount)],['Monthly contribution',money(plan.monthlyContribution)],['Target date',plan.targetDate]);
  return <Modal transparent visible animationType="fade" onRequestClose={onClose}><View style={s.overlay}><View role="dialog" aria-modal accessibilityLabel={`${account.name} account details`} accessibilityViewIsModal style={s.panel}>
    <View style={s.bar}><Text style={s.eyebrow}>ACCOUNT DETAILS</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Close account details" onPress={onClose} style={s.close}><Text style={s.bold}>Close</Text></TouchableOpacity></View>
    <ScrollView contentContainerStyle={s.content}><Text accessibilityRole="header" style={s.title}>{account.name}</Text><Text style={s.muted}>{account.productLabel}</Text>
      <View style={s.balance}><Text style={s.muted}>{account.amountLabel}</Text><Text style={s.amount}>{account.amount}</Text></View>
      {fields.map(([label,value])=><View key={label} style={s.row}><Text style={s.muted}>{label}</Text><Text style={s.bold}>{value}</Text></View>)}
      <Text accessibilityRole="header" style={s.heading}>Recent activity</Text>{rows.length ? rows.map(t=><View key={t.id} style={s.row}><View style={{flex:1}}><Text style={s.bold}>{t.merchant}</Text><Text style={s.muted}>{t.time}</Text></View><Text style={s.bold}>{t.amount}</Text></View>) : <Text style={s.muted}>No recent activity shown for this account.</Text>}
    </ScrollView></View></View></Modal>;
}
const s = StyleSheet.create({overlay:{flex:1,backgroundColor:'rgba(0,0,0,.40)',alignItems:'center',justifyContent:'center',padding:16},panel:{width:'100%',maxWidth:490,maxHeight:'88%',backgroundColor:colors.surface,borderRadius:18,overflow:'hidden'},bar:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:22,paddingTop:10},eyebrow:{fontFamily:font.body.bold,fontSize:11,letterSpacing:1.3,color:colors.greenDeep},close:{minHeight:44,justifyContent:'center',paddingHorizontal:8},content:{padding:22,paddingTop:6},title:{fontFamily:font.headline.bold,fontSize:26,color:colors.text},muted:{fontFamily:font.body.regular,fontSize:13,color:colors.textSecondary},balance:{backgroundColor:colors.greenDim,borderRadius:12,padding:16,marginVertical:16},amount:{fontFamily:font.headline.bold,fontSize:32,color:colors.text},row:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',justifyContent:'space-between',gap:8,paddingVertical:10,borderBottomWidth:1,borderBottomColor:colors.border},bold:{fontFamily:font.body.medium,fontSize:14,color:colors.text},heading:{fontFamily:font.headline.bold,color:colors.text,fontSize:18,marginTop:18,marginBottom:6}});
