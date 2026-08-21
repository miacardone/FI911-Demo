import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { Money, TwoLine, moneyText } from '@/components/fi911/cells';
import { FEE_ADJUSTMENTS, myAdjustments } from '@/data/residuals';

/** Fee Adjustments — manual corrections against a residual month. A negative
 *  amount is a clawback and renders red-in-parentheses like every other
 *  negative in the console. */

const columns = [
  { key: 'month', header: 'Month', fw: 9, sortable: true },
  { key: 'participant', header: 'Participant Name', fw: 18, sortable: true },
  { key: 'type', header: 'Type', fw: 6, sortable: true },
  {
    key: 'agent', header: 'Agent Name', fw: 13, sortable: true,
    cell: (r) => <TwoLine primary={r.agent} secondary={`Profile Id : ${r.profileId}`} />,
    text: (r) => `${r.agent} ${r.profileId}`,
  },
  {
    key: 'item', header: 'Adjustment Item', fw: 20, sortable: true,
    cell: (r) => <TwoLine primary={r.item} secondary={`Description: ${r.description}`} />,
    text: (r) => `${r.item} ${r.description}`,
  },
  {
    key: 'amount', header: 'Amount', fw: 8, align: 'right', sortable: true,
    sortValue: (r) => r.amount, text: (r) => moneyText(r.amount),
    cell: (r) => <Money value={r.amount} />,
  },
];

export function FeeAdjustments() {
  const [tab, setTab] = useState('all');
  const mine = useMemo(() => myAdjustments(), []);

  return (
    <ListPage
      title="Fee Adjustments"
      description="View and manage residual fee adjustments"
      tabs={[{ value: 'all', label: 'Adjustments' }, { value: 'mine', label: 'My Adjustments' }]}
      tab={tab}
      onTabChange={setTab}
    >
      <ListTable
        key={tab}
        columns={columns}
        rows={tab === 'all' ? FEE_ADJUSTMENTS : mine}
        searchPlaceholder="Search adjustments"
        exportName="fee-adjustments"
        empty="No adjustments for this period."
      />
    </ListPage>
  );
}

export default FeeAdjustments;
