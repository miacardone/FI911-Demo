import { TransactionPage } from '@/components/fi911/TransactionPage';
import { card, count, money, text, twoLine } from './_cols';
import { AUTH_DETAILS, AUTH_SUMMARY } from '@/data/transactions';

/** Authorizations — approved value against refunded value, netted. */

const summaryColumns = [
  text('merchant', 'Merchant', 14),
  text('partner', 'Partner', 11),
  text('authDate', 'Auth Date', 9),
  card(),
  text('terminalId', 'Terminal ID', 11),
  count('authCount', 'Auth (#)', 6),
  money('authValue', 'Auth (£)', 9),
  count('refundCount', 'Refund (#)', 7),
  money('refundValue', 'Refund (£)', 9),
  count('netCount', 'Net (#)', 6),
  money('netValue', 'Net (£)', 9),
  text('processor', 'Processor', 8),
];

const detailColumns = [
  text('institutionId', 'Institution ...', 7),
  text('isoId', 'ISO ID', 8),
  text('agentId', 'Agent ID', 8),
  twoLine('merchant', 'Merchant', (r) => r.merchant, (r) => `MID: ${r.mid}`, 15),
  text('groupName', 'Group Name', 11),
  text('region', 'Region / Channel-Depart...', 13),
  text('type', 'Type', 7),
  text('cardLast4', 'Card Las...', 7),
  text('authCode', 'Auth Code', 8),
  text('terminalId', 'Terminal ID', 10),
  text('transactionId', 'Transaction ID', 12),
  text('transactionType', 'Transaction Type', 11),
  card(),
  money('authAmount', 'Auth Amou...', 9),
  text('cardholder', 'Cardholder Name', 12),
  text('authDateTime', 'Auth Date Time', 10),
  text('processor', 'Processor', 8),
];

export function Authorizations() {
  return (
    <TransactionPage
      title="Authorizations"
      description="View and manage transaction authorizations"
      summaryColumns={summaryColumns}
      summaryRows={AUTH_SUMMARY}
      detailColumns={detailColumns}
      detailRows={AUTH_DETAILS}
      summaryTotals={['authCount', 'authValue', 'refundCount', 'refundValue', 'netCount', 'netValue']}
      exportName="authorizations"
    />
  );
}

export default Authorizations;
