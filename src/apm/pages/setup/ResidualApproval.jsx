import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { Money, StatusBadge, TwoLine, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import { Badge, Button, Kpi } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import { useNavigate } from 'react-router-dom';
import { APPROVAL_STATUSES, LAST_CALCULATED_MONTH, RESIDUAL_APPROVALS } from '@/apm/data/setup';
import { setupRoutes } from '@/apm/data/navigation';
import { useToast } from '@/context/ToastContext';

/**
 * Setup > Residuals > Residual Approval.
 *
 * Sign off what the month's calculation produced, before it pays.
 *
 * The reference makes you choose a status and press Apply before it shows
 * anything, and in the screenshots it then shows "No records found" — an
 * approval screen that starts empty is an approval screen nobody uses.
 *
 * The addition that makes this reviewable is `deltaPct`: the reference prints
 * this month's payout and last month's side by side and leaves the approver to
 * subtract, per portfolio, in their head. Sorting by the size of the movement
 * puts the payout that jumped 40% at the top, which is the only one that
 * genuinely needs a human.
 */

const TABS = [
  { value: 'pending', label: 'Awaiting approval', match: (r) => r.approval === 'Pending Approval' },
  { value: 'moved', label: 'Moved 25%+', match: (r) => Math.abs(r.deltaPct) >= 25 },
  { value: 'approved', label: 'Approved', match: (r) => r.approval === 'Approved' },
  { value: 'hold', label: 'On hold', match: (r) => r.approval === 'On Hold' },
  { value: 'all', label: 'All', match: () => true },
];

function Delta({ value }) {
  const tone = Math.abs(value) >= 25 ? 'danger' : Math.abs(value) >= 10 ? 'warning' : 'neutral';
  const up = value >= 0;
  return (
    <Tooltip label={`${up ? 'Up' : 'Down'} ${Math.abs(value).toFixed(1)}% on last month's payout`}>
      <span className={`delta delta--${tone}`}>
        <Icon name={up ? 'arrowUp' : 'arrowDown'} size={11} />
        {Math.abs(value).toFixed(1)}%
      </span>
    </Tooltip>
  );
}

export function ResidualApproval() {
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('pending');
  const [rows, setRows] = useState(RESIDUAL_APPROVALS);

  const visible = useMemo(
    () => rows.filter((TABS.find((t) => t.value === tab) ?? TABS[0]).match),
    [rows, tab],
  );
  const tabs = TABS.map((t) => ({ ...t, count: rows.filter(t.match).length }));

  const setApproval = (id, approval, label) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, approval } : r)));
    toast.notify(label);
  };

  const pending = rows.filter((r) => r.approval === 'Pending Approval');
  const pendingValue = pending.reduce((s, r) => s + r.payout, 0);
  const moved = rows.filter((r) => Math.abs(r.deltaPct) >= 25);

  const columns = [
    menuColumn((r) => [
      r.approval !== 'Approved' && { label: 'Approve payout', icon: 'check', onSelect: () => setApproval(r.id, 'Approved', `${r.portfolio} approved for payment.`) },
      r.approval !== 'On Hold' && { label: 'Place on hold', icon: 'pause', onSelect: () => setApproval(r.id, 'On Hold', `${r.portfolio} held — it will not pay this cycle.`) },
      { label: 'View calculation', icon: 'table', onSelect: () => navigate(setupRoutes.residualCalculation) },
    ]),
    { key: 'portfolio', header: 'Portfolio', fw: 26, sortable: true, cell: (r) => <TwoLine primary={r.portfolio} secondary={r.processor} />, text: (r) => `${r.portfolio} ${r.processor}` },
    { key: 'merchants', header: '# Merchants', fw: 7, align: 'center', sortable: true },
    { key: 'txn', header: 'Txn', fw: 7, align: 'right', sortable: true },
    { key: 'volume', header: 'Volume', fw: 12, align: 'right', sortable: true, cell: (r) => <Money value={r.volume} />, text: (r) => moneyText(r.volume), totalCell: moneyTotal },
    { key: 'payout', header: 'Payout', fw: 11, align: 'right', sortable: true, cell: (r) => <strong><Money value={r.payout} /></strong>, text: (r) => moneyText(r.payout), totalCell: moneyTotal },
    { key: 'prevPayout', header: 'Payout (Prev Month)', fw: 11, align: 'right', sortable: true, cell: (r) => <Money value={r.prevPayout} />, text: (r) => moneyText(r.prevPayout), totalCell: moneyTotal },
    {
      key: 'deltaPct', header: 'Movement', fw: 8, align: 'center', sortable: true,
      cell: (r) => <Delta value={r.deltaPct} />, text: (r) => `${r.deltaPct}%`,
      description: 'Change on last month’s payout. The reference prints both figures and leaves the subtraction to you.',
    },
    { key: 'residualMonth', header: 'Residual Month', fw: 8, align: 'center', sortable: true },
    { key: 'payoutMonth', header: 'Payout Month', fw: 8, align: 'center', sortable: true },
    { key: 'approval', header: 'Approval', fw: 10, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.approval} /> },
    { key: 'status', header: 'Status', fw: 9, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <ListPage
      title="Residual Approval"
      description={`Sign off what the ${LAST_CALCULATED_MONTH} calculation produced, before it pays`}
      tabs={tabs}
      tab={tab}
      onTabChange={setTab}
      headerActions={(
        <Button
          variant="primary"
          size="sm"
          icon="check"
          disabled={!pending.length}
          onClick={() => {
            setRows((rs) => rs.map((r) => (r.approval === 'Pending Approval' ? { ...r, approval: 'Approved' } : r)));
            toast.notify(`${pending.length} portfolio${pending.length === 1 ? '' : 's'} approved — ${moneyText(pendingValue)} released.`);
          }}
        >
          Approve all pending
        </Button>
      )}
    >
      <div className="queue-kpis">
        <Kpi label="Awaiting approval" value={pending.length} meta={`${moneyText(pendingValue)} held for ${LAST_CALCULATED_MONTH}`} invert />
        <Kpi label="Moved 25% or more" value={moved.length} meta="Portfolios worth a second look" invert />
        <Kpi label="Total payout" value={moneyText(rows.reduce((s, r) => s + r.payout, 0))} meta="Across every portfolio this cycle" />
        <Kpi label="Last closed month" value={LAST_CALCULATED_MONTH} meta="Calculation complete" />
      </div>

      <ListTable
        key={tab}
        columns={columns}
        rows={visible}
        searchPlaceholder="Search portfolio"
        exportName="residual-approval"
        totals={['merchants', 'txn', 'volume', 'payout', 'prevPayout']}
        note="Ordered by how far the payout moved on last month — the biggest swings need a human."
        empty="Nothing in this view."
      />
    </ListPage>
  );
}

export default ResidualApproval;
