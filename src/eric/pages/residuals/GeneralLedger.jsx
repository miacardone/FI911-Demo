import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { Money, TwoLine, moneyText } from '@/components/fi911/cells';
import { SPLITS, mySplits } from '@/eric/data/residuals';
import { formatNumber } from '@/utils/format';

/** General Ledger — how gross income is split, and which of those splits are
 *  the signed-in operator's own. "My Splits" is the same shape filtered to
 *  the current user, so both tabs share one column set. */

const columns = [
  { key: 'reserveMonth', header: 'Reserve Funded Month', fw: 12, sortable: true },
  { key: 'payoutMonth', header: 'Payout Month', fw: 10, sortable: true },
  { key: 'participant', header: 'Participant', fw: 16, sortable: true },
  { key: 'type', header: 'Type', fw: 6, sortable: true },
  { key: 'splitTo', header: 'Split To', fw: 10, sortable: true },
  { key: 'splitFrom', header: 'Split From', fw: 16, sortable: true },
  { key: 'splits', header: 'Splits', fw: 6, align: 'right', sortable: true },
  { key: 'transactions', header: 'Transactions', fw: 9, align: 'right', sortable: true, cell: (r) => formatNumber(r.transactions) },
  { key: 'volume', header: 'Volume', fw: 10, align: 'right', sortable: true, sortValue: (r) => r.volume, text: (r) => moneyText(r.volume), cell: (r) => <Money value={r.volume} /> },
  { key: 'payout', header: 'Payout', fw: 8, align: 'right', sortable: true, sortValue: (r) => r.payout, text: (r) => moneyText(r.payout), cell: (r) => <Money value={r.payout} /> },
];

export function GeneralLedger() {
  const [tab, setTab] = useState('splits');
  const mine = useMemo(() => mySplits(), []);

  const tabs = [
    { value: 'splits', label: 'Splits Detail' },
    { value: 'mine', label: 'My Splits' },
  ];

  return (
    <ListPage
      title="General Ledger"
      description="View split details and manage your splits"
      tabs={tabs}
      tab={tab}
      onTabChange={setTab}
    >
      <ListTable
        key={tab}
        columns={columns}
        rows={tab === 'splits' ? SPLITS : mine}
        searchPlaceholder="Search splits"
        exportName={tab === 'splits' ? 'splits-detail' : 'my-splits'}
        empty="No splits for this period."
      />
    </ListPage>
  );
}

export default GeneralLedger;
