import { TransactionPage } from '@/components/fi911/TransactionPage';
import { count, money, text, twoLine } from './_cols';
import { SETTLEMENT_DETAILS, SETTLEMENT_SUMMARY } from '@/apm/data/transactions';

/** Settlements — what actually settled per terminal, and the transactions
 *  behind each settle date. */

const summaryColumns = [
  text('institutionId', 'Institution ID', 8),
  text('isoId', 'ISO ID', 12),
  text('agentId', 'Agent ID', 12),
  twoLine('merchant', 'Merchant', (r) => r.merchant, (r) => `MID: ${r.mid}`, 16),
  text('bankName', 'Bank Name', 10),
  { key: 'settleDate', header: 'Settle Date', fw: 9, sortable: true, cell: (r) => <span className="cell-link">{r.settleDate}</span> },
  text('terminalId', 'Terminal ID', 11),
  count('salesCount', 'Sales (#)', 7),
  money('salesValue', 'Sales (£)', 10),
  count('refundCount', 'Refund (#)', 7),
  money('refundValue', 'Refund (£)', 9),
  count('netCount', 'Net (#)', 6),
  money('netValue', 'Net (£)', 10),
  text('processor', 'Processor', 8),
];

const detailColumns = [
  text('isoId', 'ISO ID', 11),
  text('merchant', 'Merchant / MID', 20),
  text('transactionType', 'Transaction Type', 10),
  {
    key: 'accountNumber', header: 'Account Number / Sort Code', fw: 12, sortable: true,
    cell: (r) => (
      <span className="cell-2l">
        <span className="cell-2l__main">{r.accountNumber}</span>
        <span className="cell-2l__sub">{r.sortCode}</span>
      </span>
    ),
    text: (r) => `${r.accountNumber} ${r.sortCode}`,
  },
  text('terminalId', 'Terminal ID', 10),
  text('currency', 'Currency', 7),
  { key: 'transactionId', header: 'Transaction ID', fw: 12, sortable: true, cell: (r) => <span className="cell-link">{r.transactionId}</span> },
  text('authCode', 'Auth Code', 8),
  text('authDate', 'Auth Date', 9),
  text('settleDate', 'Settle Date', 9),
  money('salesAmount', 'Sales Amount', 9),
  text('type', 'Type', 7),
];

export function Settlements() {
  return (
    <TransactionPage
      title="Settlements"
      description="Settlement transaction records and processing details"
      summaryColumns={summaryColumns}
      summaryRows={SETTLEMENT_SUMMARY}
      detailColumns={detailColumns}
      detailRows={SETTLEMENT_DETAILS}
      summaryTotals={['salesCount', 'salesValue', 'refundCount', 'refundValue', 'netCount', 'netValue']}
      detailNote="Showing all available detail records. Click a Settle Date in Summary to apply its scoped settlement group."
      exportName="settlements"
    />
  );
}

export default Settlements;
