import { useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { Money, Muted, TwoLine, moneyText } from '@/components/fi911/cells';
import { INCOME_EXPENSE } from '@/apm/data/residuals';

/** Income / Expense — the line items beneath a residual month.
 *  A PassThru row has no buy rate (the cost is the income), so the BuyRate
 *  cell shows a dash rather than a misleading 0.000000. */

const money = (key, header, fw = 8) => ({
  key, header, fw, align: 'right', sortable: true,
  sortValue: (r) => r[key], text: (r) => moneyText(r[key]),
  cell: (r) => <Money value={r[key]} />,
});

const columns = [
  { key: 'residualMonth', header: 'Residual Month', fw: 10, sortable: true },
  { key: 'payoutMonth', header: 'Payout Month', fw: 10, sortable: true },
  {
    key: 'agent', header: 'Agent', fw: 11, sortable: true,
    cell: (r) => <TwoLine primary={r.agent} secondary={r.agentScope} />,
    text: (r) => `${r.agent} ${r.agentScope}`,
  },
  {
    key: 'participant', header: 'Participants', fw: 14, sortable: true,
    cell: (r) => <TwoLine primary={r.participant} secondary={r.participantMid} />,
    text: (r) => `${r.participant} ${r.participantMid}`,
  },
  {
    key: 'partner', header: 'Partner', fw: 12, sortable: true,
    cell: (r) => <TwoLine primary={r.partner} secondary={r.partnerCode} />,
    text: (r) => `${r.partner} ${r.partnerCode}`,
  },
  {
    key: 'itemName', header: 'Item Name', fw: 18, sortable: true,
    cell: (r) => <TwoLine primary={r.itemName} secondary={r.itemSub} />,
    text: (r) => `${r.itemName} ${r.itemSub}`,
  },
  money('volume', 'Volume', 10),
  { key: 'count', header: 'Count', fw: 6, align: 'right', sortable: true },
  money('income', 'Income'),
  { key: 'buyRate', header: 'BuyRate', fw: 8, align: 'right', sortable: true, cell: (r) => (r.buyRate ? r.buyRate : <Muted>-</Muted>) },
  { key: 'rateType', header: 'RateType', fw: 8, sortable: true },
  money('expense', 'Expense'),
];

export function IncomeExpense() {
  const [tab, setTab] = useState('all');
  const mine = INCOME_EXPENSE.filter((r) => r.agentScope.includes('PSP'));

  return (
    <ListPage
      title="Income / Expense"
      description="View detailed income and expense line items"
      tabs={[{ value: 'all', label: 'Income / Expense Details' }, { value: 'mine', label: 'My Income / Expense' }]}
      tab={tab}
      onTabChange={setTab}
    >
      <ListTable
        key={tab}
        columns={columns}
        rows={tab === 'all' ? INCOME_EXPENSE : mine}
        searchPlaceholder="Search income/expense"
        exportName="income-expense"
        empty="No line items for this period."
      />
    </ListPage>
  );
}

export default IncomeExpense;
