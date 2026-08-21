import { TransactionPage } from '@/components/fi911/TransactionPage';
import { status, text } from './_cols';
import { MERCHANT_RESERVES } from '@/data/transactions';
import brand from '@/brand/brand.config';

/** Merchant Reserves — how much of each merchant's settlement is being held
 *  back, and whether the withheld money has been paid out yet. Reserve Status
 *  and Pay Status are separate because a released reserve can still be
 *  awaiting payment. */

const columns = [
  text('institutionId', 'Institution ID', 8),
  text('isoId', 'ISO ID', 10),
  text('merchant', 'Merchant', 16),
  text('partner', 'Partner', 14),
  { key: 'rate', header: 'Reserve R...', fw: 8, align: 'right', sortable: true, cell: (r) => `${r.rate.toFixed(1)}%` },
  status('reserveStatus', 'Reserve St...', 9),
  status('payStatus', 'Pay Status', 9),
  text('contractDate', 'Contract D...', 9),
  text('processDate', 'Process Date', 9),
  text('processor', 'Processor', 9),
];

const CUSTOM_FIELDS = [
  { name: 'merchant', label: 'Merchant / MID', placeholder: 'Merchant, partner, or MID' },
  { name: 'reserveStatus', label: 'Reserve Status', type: 'select', options: ['Held', 'Released', 'Partial'].map((s) => ({ value: s, label: s })) },
  { name: 'payStatus', label: 'Pay Status', type: 'select', options: ['Pending', 'Paid', 'Processing', 'On Hold'].map((s) => ({ value: s, label: s })) },
  { name: 'processor', label: 'Processor', type: 'select', options: brand.processors.map((p) => ({ value: p, label: p })) },
];

const HISTORICAL = [
  { name: 'merchant', label: 'Merchant / MID', placeholder: 'Merchant, partner, or MID' },
  { name: 'startDate', label: 'Start Date', type: 'date' },
  { name: 'endDate', label: 'End Date', type: 'date' },
];

export function MerchantReserves() {
  return (
    <TransactionPage
      title="Merchant Reserves"
      description="Manage merchant reserve accounts and payment statuses"
      detailColumns={columns}
      detailRows={MERCHANT_RESERVES}
      customFields={CUSTOM_FIELDS}
      advancedFields={CUSTOM_FIELDS}
      historicalFields={HISTORICAL}
      historicalNote={`${MERCHANT_RESERVES.length} archived-style reserve rows match the current range.`}
      exportName="merchant-reserves"
    />
  );
}

export default MerchantReserves;
