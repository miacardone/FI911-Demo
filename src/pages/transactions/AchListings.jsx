import { TransactionPage } from '@/components/fi911/TransactionPage';
import { count, money, status, text } from './_cols';
import { ACH_DETAILS, ACH_SUMMARY } from '@/data/transactions';

/** ACH Listings — bank-rail credits and debits, and their returns. */

const summaryColumns = [
  text('institutionId', 'Institutio...', 7),
  text('isoId', 'ISO ID', 9),
  text('agentId', 'Agent ID', 9),
  text('merchant', 'Merchant', 13),
  text('partner', 'Partner', 11),
  { key: 'authDate', header: 'Auth Date', fw: 9, sortable: true, cell: (r) => <span className="cell-link">{r.authDate}</span> },
  status('finalStatus', 'Final Sta...', 9),
  count('creditCount', 'Credits ...', 7),
  money('creditValue', 'Credits ...', 9),
  count('debitCount', 'Debits (#)', 7),
  money('debitValue', 'Debits (£)', 8),
  count('creditReturnCount', 'Credit R...', 7),
  money('creditReturnValue', 'Credit R...', 8),
  count('debitReturnCount', 'Debit Re...', 7),
  money('debitReturnValue', 'Debit Re...', 8),
  count('transactions', 'Transac...', 7),
  money('net', 'Net (£)', 8),
  text('processor', 'Processor', 8),
];

const detailColumns = [
  text('participant', 'Participant Name', 14),
  text('partner', 'Partner', 10),
  text('terminalId', 'Terminal ID', 11),
  { key: 'transactionId', header: 'Transaction ID', fw: 13, sortable: true, cell: (r) => <span className="cell-link">{r.transactionId}</span> },
  text('account', 'Account ...', 8),
  text('transactionType', 'Transaction ...', 9),
  status('status', 'Status', 9),
  money('amount', 'Amount', 8),
  text('accountHolder', 'Account Holder Na...', 13),
  text('authDate', 'Auth Date', 9),
  text('completionDate', 'Completion Date', 10),
  text('type', 'Type', 6),
];

export function AchListings() {
  return (
    <TransactionPage
      title="ACH Listings"
      description="View and manage ACH transaction listings"
      summaryColumns={summaryColumns}
      summaryRows={ACH_SUMMARY}
      detailColumns={detailColumns}
      detailRows={ACH_DETAILS}
      summaryTotals={['creditCount', 'creditValue', 'debitCount', 'debitValue', 'transactions', 'net']}
      detailNote="Showing all available detail records. Click an Auth Date in Summary to apply its scoped merchant group."
      exportName="ach-listings"
    />
  );
}

export default AchListings;
