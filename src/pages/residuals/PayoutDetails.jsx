import { useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { LinkCell, Money, TwoLine, moneyText } from '@/components/fi911/cells';
import { AGENT_PAYOUTS, MY_INCOME, PAYOUT_SCOPE } from '@/data/residuals';
import { formatNumber } from '@/utils/format';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/data/navigation';
import { useToast } from '@/context/ToastContext';

/** Payout Details — the agent roll-up, and "My Income", which is the same
 *  money broken down to the merchant line items that produced it. */

const money = (key, header, fw = 9) => ({
  key, header, fw, align: 'right', sortable: true,
  sortValue: (r) => r[key], text: (r) => moneyText(r[key]),
  cell: (r) => <Money value={r[key]} />,
});

export function PayoutDetails() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('payout');
  const toast = useToast();

  const payoutColumns = [
    { key: 'residualMonth', header: 'Residual Month', fw: 10, sortable: true },
    { key: 'payoutMonth', header: 'Payout Month', fw: 10, sortable: true },
    {
      key: 'agent', header: 'Agent', fw: 13, sortable: true,
      cell: (r) => <TwoLine primary={r.agent} secondary={r.profileId ? `${r.profileId} [PSP]` : '[PSP]'} />,
      text: (r) => `${r.agent} ${r.profileId}`,
    },
    {
      key: 'merchants', header: 'Merchants', fw: 8, align: 'right', sortable: true,
      cell: (r) => <LinkCell onClick={() => navigate(routes.portfolioPayoutDetails)}>{r.merchants}</LinkCell>,
    },
    { key: 'transactions', header: 'Transactions', fw: 9, align: 'right', sortable: true, cell: (r) => formatNumber(r.transactions) },
    money('volume', 'Volume', 10),
    money('income', 'Income'),
    money('expense', 'Expense'),
    money('grossProfit', 'Gross Profit'),
    money('payoutToOthers', 'Payout to Others', 10),
    money('grossPayout', 'Gross Payout', 10),
  ];

  const incomeColumns = [
    { key: 'residualMonth', header: 'Residual ...', fw: 9, sortable: true },
    { key: 'payoutMonth', header: 'Payout M...', fw: 9, sortable: true },
    { key: 'agent', header: 'Agent', fw: 12, sortable: true },
    {
      key: 'merchant', header: 'Merchants', fw: 13, sortable: true,
      cell: (r) => <TwoLine primary={r.merchant} secondary={`MID: ${r.mid}`} />,
      text: (r) => `${r.merchant} ${r.mid}`,
    },
    { key: 'partner', header: 'Partner', fw: 11, sortable: true },
    { key: 'itemName', header: 'Item Name', fw: 16, sortable: true },
    money('volume', 'Volume', 9),
    { key: 'count', header: 'Count', fw: 6, align: 'right', sortable: true },
    money('income', 'Income', 8),
    { key: 'buyRate', header: 'BuyRate', fw: 8, align: 'right', sortable: true },
    { key: 'rateType', header: 'RateType', fw: 8, sortable: true },
    money('expense', 'Expense', 8),
    money('grossProfit', 'Gross Pr...', 8),
    money('payoutToOthers', 'Payout t...', 8),
    money('payout', 'Payout', 8),
  ];

  return (
    <ListPage
      title="Payout Details"
      description="View and manage agent payouts and personal income calculations"
      tabs={[{ value: 'payout', label: 'Payout Details' }, { value: 'income', label: 'My Income' }]}
      tab={tab}
      onTabChange={setTab}
      scope={tab === 'income'
        ? [{ label: 'Search By', value: 'Payout Month' }, { label: 'Agent Name', value: 'Donald Kossmann' }, { label: 'From', value: '2026/08/20' }, { label: 'To', value: '2026/08/20' }]
        : PAYOUT_SCOPE}
    >
      <ListTable
        key={tab}
        columns={tab === 'payout' ? payoutColumns : incomeColumns}
        rows={tab === 'payout' ? AGENT_PAYOUTS : MY_INCOME}
        searchPlaceholder="Search records"
        exportName={tab === 'payout' ? 'payout-details' : 'my-income'}
        empty="No payouts for this period."
      />
    </ListPage>
  );
}

export default PayoutDetails;
