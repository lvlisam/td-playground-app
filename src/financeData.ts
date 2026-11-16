export type BillPayment = {
  id: string;
  merchant: string;
  timing: string;
  amount: string;
};

export const upcomingBillPayments: BillPayment[] = [
  { id: 'con-edison-upcoming', merchant: 'Con Edison', timing: 'Due in 3 days', amount: '$118.42' },
  { id: 'verizon-upcoming', merchant: 'Verizon Wireless', timing: 'Due in 6 days', amount: '$85.00' },
  { id: 'parkside-upcoming', merchant: 'Parkside Apartments', timing: 'Due in 9 days', amount: '$2,150.00' },
];

export const paidBillPayments: BillPayment[] = [
  { id: 'con-edison-paid', merchant: 'Con Edison', timing: 'Paid Nov 12', amount: '$118.42' },
  { id: 'verizon-paid', merchant: 'Verizon Wireless', timing: 'Paid Nov 9', amount: '$85.00' },
  { id: 'parkside-paid', merchant: 'Parkside Apartments', timing: 'Paid Nov 1', amount: '$2,150.00' },
];
