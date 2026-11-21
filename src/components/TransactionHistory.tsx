import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, font } from '../theme';

export type Activity = { id: string; accountId: string; merchant: string; time: string; amount: string };
// The playground's Today, Yesterday and Nov 18 activity belongs to this demo statement period.
const statementEnd = new Date(2026, 10, 21);
const dateLabel = (date: Date) => date.toLocaleDateString('en-US', {month: 'short', day: 'numeric', year: 'numeric'});
const periods = [[1, '1 month'], [3, '3 months'], [12, '1 year'], [24, '2 years']] as const;

function statementDate(time: string) {
  if (time.startsWith('Today')) return statementEnd;
  if (time.startsWith('Yesterday')) return new Date(2026, 10, 20);
  return new Date(`${time.split(',')[0]}, 2026`);
}

export default function TransactionHistory({accountId, activity}: {accountId: string; activity: readonly Activity[]}) {
  const [months, setMonths] = useState<number>(1);
  const [limit, setLimit] = useState(10);
  const from = new Date(2026, 10 - months, 21);
  const recent = activity.filter(row => row.accountId === accountId).map(row => ({...row, date: statementDate(row.time)}));
  const savings = accountId.endsWith('savings');
  const card = accountId.endsWith('card');
  const archive = activity.length ? Array.from({length:24}, (_, i) => ({
    id: `${accountId}-statement-${i}`, date: new Date(2026, 10 - i, 5),
    merchant: savings ? 'Savings contribution' : card ? 'Monthly subscription' : 'Utilities payment',
    amount: savings ? '+$50.00' : card ? '−$14.99' : `−$${(68 + (i * 11) % 24).toFixed(2)}`,
  })) : [];
  const rows = [...recent, ...archive].filter(row => row.date >= from && row.date <= statementEnd).sort((a,b) => +b.date - +a.date);
  return <View style={s.section}>
    <Text accessibilityRole="header" style={s.heading}>Transaction history</Text>
    <Text style={s.caption}>Sample activity · through {dateLabel(statementEnd)}</Text>
    <View style={s.filters}>{periods.map(([value,label]) => <TouchableOpacity key={value} accessibilityRole="button" accessibilityState={{selected: months === value}} onPress={() => {setMonths(value); setLimit(10);}} style={[s.filter, months === value && s.selected]}><Text style={s.label}>{label}</Text></TouchableOpacity>)}</View>
    <Text accessibilityLiveRegion="polite" style={s.caption}>{rows.length} {rows.length === 1 ? 'transaction' : 'transactions'} · since {dateLabel(from)}</Text>
    {rows.slice(0,limit).map(row => <View key={row.id} style={s.row}><View style={s.identity}><Text style={s.label}>{row.merchant}</Text><Text style={s.caption}>{dateLabel(row.date)}</Text></View><Text style={s.label}>{row.amount}</Text></View>)}
    {!rows.length && <Text style={s.caption}>No transactions in this period.</Text>}
    {rows.length > limit && <TouchableOpacity accessibilityRole="button" style={s.more} onPress={() => setLimit(limit + 10)}><Text style={s.label}>Show older transactions</Text></TouchableOpacity>}
  </View>;
}
const s = StyleSheet.create({section:{marginTop:18,gap:6},heading:{fontFamily:font.headline.bold,fontSize:18,color:colors.text},caption:{fontFamily:font.body.regular,fontSize:13,color:colors.textSecondary},filters:{flexDirection:'row',flexWrap:'wrap',gap:6,marginVertical:4},filter:{paddingHorizontal:10,minHeight:42,justifyContent:'center',borderWidth:1,borderColor:colors.border,borderRadius:8},selected:{backgroundColor:colors.greenDim,borderColor:colors.greenDeep},label:{fontFamily:font.body.medium,fontSize:14,color:colors.text},row:{flexDirection:'row',alignItems:'center',gap:8,borderBottomWidth:1,borderBottomColor:colors.border,paddingVertical:10},identity:{flex:1},more:{alignItems:'center',padding:12,backgroundColor:colors.greenDim,borderRadius:8}});
