import { TransactionPage } from '@/components/fi911/TransactionPage';
import { card, count, money, response, status, text, twoLine } from './_cols';
import { ACCOUNT_HOLDER_DETAILS, ACCOUNT_HOLDER_SUMMARY } from '@/data/transactions';

/** Account Holder — dispute and authorisation activity per account. */

const summaryColumns = [
  twoLine('accountName', 'Account Info', (r) => r.accountName, (r) => `Acct : ${r.accountNumber}`, 15),
  twoLine('sendingPsp', 'Sending PSP', (r) => r.sendingPsp, (r) => `Code:[${r.sendingCode}]`, 12),
  count('disputeCount', 'Dispute #', 6),
  money('disputeValue', 'Dispute £', 8),
  text('authDate', 'Auth Date', 9),
  text('receivingSortCode', 'Receiving Sort Code', 11),
  count('authCount', 'Auth (#)', 6),
  money('authValue', 'Auth (£)', 8),
  count('adjustmentCount', 'Adjustment (#)', 9),
  money('adjustmentValue', 'Adjustment (£)', 9),
  count('netCount', 'Net (#)', 6),
  money('netValue', 'Net (£)', 8),
  text('type', 'Type', 6),
];

const detailColumns = [
  twoLine('accountName', 'Account Info', (r) => r.accountName, (r) => `Acct : ${r.accountNumber}`, 14),
  text('participant', 'Participant Name', 11),
  count('disputeCount', 'Dispute #', 6),
  money('disputeValue', 'Dispute £', 8),
  text('bankAccount', 'Bank Account', 10),
  text('sortCode', 'Sort Code', 8),
  text('bankName', 'Bank Name', 11),
  text('transactionType', 'Transaction Type', 10),
  response('authResponse', 'Auth Response', 9),
  text('authCode', 'Auth Code', 10),
  text('transactionId', 'Transaction ID', 12),
  money('authAmount', 'Auth Amount', 9),
  text('authDateTime', 'Auth Date Time', 10),
  text('type', 'Type', 6),
];

export function AccountHolder() {
  return (
    <TransactionPage
      title="Account Holder"
      description="Account holder transaction records and processing details"
      summaryColumns={summaryColumns}
      summaryRows={ACCOUNT_HOLDER_SUMMARY}
      detailColumns={detailColumns}
      detailRows={ACCOUNT_HOLDER_DETAILS}
      exportName="account-holder"
    />
  );
}

export default AccountHolder;
