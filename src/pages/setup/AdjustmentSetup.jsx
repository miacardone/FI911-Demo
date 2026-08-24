import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { Money, Muted, StatusBadge, TwoLine, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import { Badge, Button, Kpi } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import { ADJUSTMENT_SETUP } from '@/data/setup';
import { useToast } from '@/context/ToastContext';

/**
 * Setup > Residuals > Adjustment Setup.
 *
 * One-off and recurring corrections applied on top of a calculated residual —
 * holdbacks, equipment leases, rebates, buyouts.
 *
 * The reference renders the value as a plain string ("-$100.00", "$15.00") in
 * a right-aligned column, which makes a credit and a debit look identical at a
 * glance. Since the whole point is reconciliation, credits and debits are
 * colored and totalled separately here, and a recurring adjustment is marked
 * as such — the reference stores a start and end month and leaves you to
 * notice that Dec-2029 means "forever".
 */

const TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'debits', label: 'Debits', match: (r) => r.value < 0 },
  { value: 'credits', label: 'Credits', match: (r) => r.value > 0 },
  { value: 'recurring', label: 'Recurring', match: (r) => r.recurring },
  { value: 'inactive', label: 'Inactive', match: (r) => r.status === 'Inactive' },
];

function Signed({ value }) {
  const debit = value < 0;
  return (
    <span className={`signed ${debit ? 'signed--debit' : 'signed--credit'}`}>
      {debit ? '−' : '+'}{moneyText(Math.abs(value))}
    </span>
  );
}

export function AdjustmentSetup() {
  const toast = useToast();
  const [tab, setTab] = useState('all');

  const rows = useMemo(
    () => ADJUSTMENT_SETUP.filter((TABS.find((t) => t.value === tab) ?? TABS[0]).match),
    [tab],
  );
  const tabs = TABS.map((t) => ({ ...t, count: ADJUSTMENT_SETUP.filter(t.match).length }));

  const debits = ADJUSTMENT_SETUP.filter((r) => r.value < 0 && r.status === 'Active');
  const credits = ADJUSTMENT_SETUP.filter((r) => r.value > 0 && r.status === 'Active');
  const sum = (list) => Math.round(list.reduce((s, r) => s + Math.abs(r.value), 0) * 100) / 100;

  const columns = [
    menuColumn((r) => [
      { label: 'Edit adjustment', icon: 'edit', onSelect: () => toast.notify(`Editing "${r.name}".`) },
      { label: 'End this month', icon: 'clock', onSelect: () => toast.notify(`"${r.name}" will not apply after this cycle.`) },
      { label: 'Change status', icon: 'power', onSelect: () => toast.notify(`"${r.name}" status changed.`) },
    ]),
    {
      key: 'name', header: 'Adjustment', fw: 20, sortable: true,
      cell: (r) => <TwoLine primary={r.name} secondary={r.description} />,
      text: (r) => `${r.name} ${r.description}`,
    },
    {
      key: 'value', header: 'Value', fw: 9, align: 'right', sortable: true,
      cell: (r) => <Signed value={r.value} />, text: (r) => moneyText(r.value), totalCell: moneyTotal,
      description: 'Negative values are debits against the agent’s payout, positive are credits',
    },
    {
      key: 'recurring', header: 'Frequency', fw: 8, align: 'center', sortable: true,
      cell: (r) => (r.recurring
        ? <Tooltip label={`Applies every month until ${r.endMonth}`}><Badge tone="primary">Monthly</Badge></Tooltip>
        : <Badge tone="neutral">One-off</Badge>),
      text: (r) => (r.recurring ? 'Monthly' : 'One-off'),
    },
    { key: 'agent', header: 'Agent', fw: 13, sortable: true, cell: (r) => <TwoLine primary={r.agent} secondary={`Rep ${r.repCode}`} />, text: (r) => `${r.agent} ${r.repCode}` },
    { key: 'merchant', header: 'Merchant', fw: 15, sortable: true, cell: (r) => (r.merchant ? <TwoLine primary={r.merchant} secondary={`MID: ${r.mid}`} /> : <Muted>All merchants</Muted>), text: (r) => `${r.merchant} ${r.mid}` },
    { key: 'processor', header: 'Processor', fw: 9, align: 'center', sortable: true },
    { key: 'startMonth', header: 'Start', fw: 7, align: 'center', sortable: true },
    { key: 'endMonth', header: 'End', fw: 7, align: 'center', sortable: true },
    { key: 'status', header: 'Status', fw: 7, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <ListPage
      title="Adjustment Setup"
      description="Corrections applied on top of a calculated residual"
      tabs={tabs}
      tab={tab}
      onTabChange={setTab}
      headerActions={(
        <>
          <Button variant="secondary" size="sm" icon="upload" onClick={() => toast.notify('Import adjustments as CSV.')}>Import</Button>
          <Button variant="primary" size="sm" icon="plus" onClick={() => toast.notify('New adjustment.')}>Create</Button>
        </>
      )}
    >
      <div className="queue-kpis">
        <Kpi label="Active debits" value={moneyText(sum(debits))} meta={`${debits.length} deductions against payouts`} invert />
        <Kpi label="Active credits" value={moneyText(sum(credits))} meta={`${credits.length} additions to payouts`} />
        <Kpi label="Net effect" value={moneyText(sum(credits) - sum(debits))} meta="Applied to this cycle" />
        <Kpi label="Recurring" value={ADJUSTMENT_SETUP.filter((r) => r.recurring && r.status === 'Active').length} meta="Repeat every month until their end date" />
      </div>

      <ListTable
        key={tab}
        columns={columns}
        rows={rows}
        searchPlaceholder="Search adjustment, agent or merchant"
        exportName="adjustment-setup"
        totals={['value']}
        empty="No adjustments in this view."
      />
    </ListPage>
  );
}

export default AdjustmentSetup;
