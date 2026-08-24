import { TransactionPage } from '@/components/fi911/TransactionPage';
import { money, status, text } from './_cols';
import { GATEWAY } from '@/data/transactions';

/** Transaction Gateway — raw gateway traffic across every processor.
 *  No Summary tab: the gateway grain IS the detail. */

const columns = [
  text('participant', 'Participant Name', 18),
  text('partner', 'Partner', 13),
  text('transactionId', 'Transaction ID', 11),
  {
    key: 'accountNumber', header: 'Account Number / Sort Code', fw: 13, sortable: true,
    cell: (r) => (
      <span className="cell-2l">
        <span className="cell-2l__main">{r.accountNumber}</span>
        <span className="cell-2l__sub">{r.sortCode}</span>
      </span>
    ),
    text: (r) => `${r.accountNumber} ${r.sortCode}`,
  },
  text('transactionType', 'Transaction Type', 10),
  text('transactionDate', 'Transaction Date', 10),
  money('amount', 'Transaction Amount', 11),
  text('type', 'Type', 8),
  status('status', 'Status', 8),
];

export function Gateway() {
  return (
    <TransactionPage
      title="Transaction Gateway"
      description="Monitor and analyze payment gateway transactions across all processors"
      scopeLabel="Transaction Date"
      scope={[{ label: 'Start Date', value: '2026/08/20' }, { label: 'End Date', value: '2026/08/20' }]}
      detailColumns={columns}
      detailRows={GATEWAY}
      exportName="transaction-gateway"
    />
  );
}

export default Gateway;
