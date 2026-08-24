import { TransactionPage } from '@/components/fi911/TransactionPage';
import { money, status, text } from './_cols';
import { FUNDING_DEPOSITS } from '@/data/transactions';

/** Funding Deposits — the net paid to each merchant after chargebacks and
 *  refunds are taken out. No Details tab: a deposit IS the summary. */

const columns = [
  text('merchant', 'Merchant', 16),
  text('fundingDate', 'Funding ...', 9),
  text('currency', 'Currency', 7),
  money('settleBankcards', 'Settle Bankcards', 10),
  money('settleNonBankcards', 'Settle Non Bankcards', 11),
  money('chargebacks', 'Chargebacks', 9),
  money('refunds', 'Refunds', 9),
  money('netDeposit', 'Net Deposit Amount', 11),
  status('fundingStatus', 'Funding Status', 9),
  text('processor', 'Processor', 8),
];

const CUSTOM_FIELDS = [
  { name: 'merchant', label: 'Merchant Name / MID' },
  { name: 'groupName', label: 'Group Name', type: 'select', options: [{ value: 'All', label: 'All' }] },
  { name: 'region', label: 'Region / Channel-Department' },
  { name: 'type', label: 'Type', type: 'select', options: [{ value: 'PSP', label: 'PSP' }, { value: 'Merchant', label: 'Merchant' }] },
  { name: 'chargebacks', label: 'Chargeback', type: 'number' },
  { name: 'refunds', label: 'Refund', type: 'number' },
  { name: 'fundingStatus', label: 'Status', type: 'select', options: [{ value: 'Success', label: 'Success' }] },
  { name: 'netDeposit', label: 'Net Deposit Amount', type: 'number' },
  { name: 'startDate', label: 'Start Date', type: 'date', required: true },
  { name: 'endDate', label: 'End Date', type: 'date', required: true },
];

export function FundingDeposits() {
  return (
    <TransactionPage
      title="Funding Deposits"
      description="View and manage funding deposit transactions"
      summaryColumns={columns}
      summaryRows={FUNDING_DEPOSITS}
      summaryTotals={['settleBankcards', 'chargebacks', 'refunds', 'netDeposit']}
      customFields={CUSTOM_FIELDS}
      advancedFields={CUSTOM_FIELDS}
      exportName="funding-deposits"
    />
  );
}

export default FundingDeposits;
