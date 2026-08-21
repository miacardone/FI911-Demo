import { useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { LinkCell, Money, TwoLine, moneyText } from '@/components/fi911/cells';
import { PAYOUT_SCOPE, PORTFOLIO_PAYOUTS } from '@/data/residuals';
import { formatNumber } from '@/utils/format';
import { useToast } from '@/context/ToastContext';

/** Portfolio Payout Details — payout traced to the individual participant
 *  within a portfolio. Each participant appears once per agent profile that
 *  earns from it, which is why names repeat down the list. */

const money = (key, header, fw = 9) => ({
  key, header, fw, align: 'right', sortable: true,
  sortValue: (r) => r[key], text: (r) => moneyText(r[key]),
  cell: (r) => <Money value={r[key]} />,
});

export function PortfolioPayoutDetails() {
  const [tab, setTab] = useState('portfolio');
  const toast = useToast();

  const columns = [
    { key: 'residualMonth', header: 'Residual Month', fw: 9, sortable: true },
    { hiddenByDefault: true, key: 'payoutMonth', header: 'Payout Month', fw: 9, sortable: true },
    {
      key: 'participant', header: 'Participant Name', fw: 14, sortable: true,
      cell: (r) => (
        <TwoLine
          primary={r.participant}
          secondary={<LinkCell onClick={() => toast.notify(`MID ${r.mid}`)}>{r.mid}</LinkCell>}
        />
      ),
      text: (r) => `${r.participant} ${r.mid}`,
    },
    { key: 'partner', header: 'Partner', fw: 11, sortable: true },
    { key: 'agent', header: 'Agent', fw: 13, sortable: true },
    { key: 'portfolio', header: 'Portfolio', fw: 14, sortable: true },
    { key: 'transactions', header: 'Transactions', fw: 8, align: 'right', sortable: true, cell: (r) => formatNumber(r.transactions) },
    money('volume', 'Volume', 10),
    money('income', 'Income'),
    money('expense', 'Expense'),
    money('grossProfit', 'Gross Profit'),
    { ...money('payoutToOthers', 'Payout to Others', 10), hiddenByDefault: true },
    money('grossPayout', 'Gross Payout', 10),
    money('adjustments', 'Adjustments'),
    money('payout', 'Payout', 8),
  ];

  const mine = PORTFOLIO_PAYOUTS.filter((r) => r.agent.startsWith('PayUK'));

  return (
    <ListPage
      title="Portfolio Payout Details"
      description="View detailed portfolio payout information and personal income breakdown"
      tabs={[{ value: 'portfolio', label: 'Portfolio Payout Details' }, { value: 'mine', label: 'My Income' }]}
      tab={tab}
      onTabChange={setTab}
      scope={PAYOUT_SCOPE}
    >
      <ListTable
        key={tab}
        columns={columns}
        rows={tab === 'portfolio' ? PORTFOLIO_PAYOUTS : mine}
        searchPlaceholder="Search records"
        exportName="portfolio-payout-details"
        empty="No payouts for this period."
      />
    </ListPage>
  );
}

export default PortfolioPayoutDetails;
