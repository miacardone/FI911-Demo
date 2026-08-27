import { TransactionPage } from '@/components/fi911/TransactionPage';
import { count, money, text, twoLine } from './_cols';
import { FUNDING_CATEGORY_DETAILS, FUNDING_CATEGORY_SUMMARY } from '@/apm/data/transactions';

/** Funding Category — what each funding line was for. Fee categories carry
 *  negative amounts, which is why the Funding (£) column runs red on some
 *  rows and not others. */

const summaryColumns = [
  twoLine('merchant', 'Merchant', (r) => r.merchant, (r) => `MID: ${r.mid}`, 18),
  twoLine('partner', 'Partner', (r) => r.partner, (r) => r.partnerCode, 14),
  text('fundingCategory', 'Funding Category', 14),
  { key: 'processDate', header: 'Process Date', fw: 9, sortable: true, cell: (r) => <span className="cell-link">{r.processDate}</span> },
  count('fundingCount', 'Funding (#)', 8),
  money('fundingValue', 'Funding (£)', 10),
  text('processor', 'Processor', 8),
];

const detailColumns = [
  twoLine('merchant', 'Merchant', (r) => r.merchant, (r) => `MID: ${r.mid}`, 18),
  twoLine('partner', 'Partner', (r) => r.partner, (r) => r.partnerCode, 14),
  text('fundingCategory', 'Funding Category', 13),
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
  money('amount', 'Amount', 9),
  text('processDate', 'Process Date', 9),
  text('type', 'Type', 7),
];

export function FundingCategory() {
  return (
    <TransactionPage
      title="Funding Category"
      description="View and manage funding category transactions"
      summaryColumns={summaryColumns}
      summaryRows={FUNDING_CATEGORY_SUMMARY}
      detailColumns={detailColumns}
      detailRows={FUNDING_CATEGORY_DETAILS}
      detailNote="Showing all available detail records. Click a Process Date in Summary to apply its scoped funding group."
      exportName="funding-category"
    />
  );
}

export default FundingCategory;
