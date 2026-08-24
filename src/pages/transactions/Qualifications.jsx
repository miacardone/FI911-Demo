import { TransactionPage } from '@/components/fi911/TransactionPage';
import { money, percent, secondary, text } from './_cols';
import { QUALIFICATION_ROWS } from '@/data/transactions';

/** Qualifications — the interchange band each transaction qualified into, and
 *  what that cost. Interchange is an expense so it renders negative. */

const columns = [
  text('merchant', 'Merchant', 14),
  text('partner', 'Partner', 13),
  { key: 'transactionId', header: 'Transaction ID', fw: 12, sortable: true, cell: (r) => <span className="cell-link">{r.transactionId}</span> },
  secondary(text('trn', 'TRN', 14)),
  secondary(text('bankName', 'Bank Name', 10)),
  {
    hiddenByDefault: true,
    key: 'accountNumber', header: 'Account Number / Routing Number', fw: 12, sortable: true,
    cell: (r) => (
      <span className="cell-2l">
        <span className="cell-2l__main">{r.accountNumber}</span>
        <span className="cell-2l__sub">{r.routingNumber}</span>
      </span>
    ),
    text: (r) => `${r.accountNumber} ${r.routingNumber}`,
  },
  text('qualification', 'Qualification', 12),
  percent('feePercent', 'Fee Percen...', 9),
  secondary(money('baseFee', 'Base Fee', 8)),
  money('amount', 'Amount', 8),
  money('interchange', 'Interchange', 9),
  money('netAmount', 'Net Amount', 9),
  secondary(text('authDate', 'Auth Date', 9)),
  text('settleDate', 'Settle Date', 9),
  text('transactionDate', 'Transaction Date', 10),
  text('processor', 'Processor', 8),
];

const CUSTOM_FIELDS = [
  { name: 'merchant', label: 'Merchant Name / MID' },
  { name: 'groupName', label: 'Group Name', type: 'select', options: [{ value: 'All', label: 'All' }] },
  { name: 'region', label: 'Region / Channel-Department' },
  { name: 'type', label: 'Type', type: 'select', options: [{ value: 'PSP', label: 'PSP' }] },
  { name: 'bankName', label: 'Bank Name', type: 'select', options: [{ value: 'All', label: 'All' }] },
  { name: 'transactionId', label: 'Transaction ID' },
  { name: 'qualification', label: 'Qualification' },
  { name: 'startDate', label: 'Start Date', type: 'date', required: true },
  { name: 'endDate', label: 'End Date', type: 'date', required: true },
];

export function Qualifications() {
  return (
    <TransactionPage
      title="Qualifications"
      description="View and manage transaction qualifications and interchange fees"
      detailColumns={columns}
      detailRows={QUALIFICATION_ROWS}
      customFields={CUSTOM_FIELDS}
      advancedFields={CUSTOM_FIELDS}
      exportName="qualifications"
    />
  );
}

export default Qualifications;
