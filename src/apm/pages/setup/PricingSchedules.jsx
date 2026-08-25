import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPage } from '@/components/fi911/ListPage';
import { LinkCell, Money, Muted, StatusBadge, TwoLine, menuColumn, moneyText } from '@/components/fi911/cells';
import { Badge, Button } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import { PRICING_SCHEDULES, PRICING_TYPES } from '@/apm/data/setup';
import { setupRoutes } from '@/apm/data/navigation';
import { useToast } from '@/context/ToastContext';
import brand from '@/apm/brand.config';

/**
 * Setup > Residuals > Pricing Schedules.
 *
 * The reference lists 615 schedules with Users Linked, Profit % and Loss %
 * side by side and no way to tell a live schedule from an abandoned one — most
 * of that list is zero-linked, zero-split rows nobody dares delete because
 * nothing says whether they are in use.
 *
 * Here "Unused" is a first-class view, and a zero-linked schedule says so in
 * the row rather than making you read three numeric columns to work it out.
 */

const TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'live', label: 'In use', match: (r) => r.usersLinked > 0 && r.status === 'Active' },
  { value: 'unused', label: 'Unused', match: (r) => r.usersLinked === 0 },
  { value: 'inactive', label: 'Inactive', match: (r) => r.status === 'Inactive' },
];

export function PricingSchedules() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [rows, setRows] = useState(PRICING_SCHEDULES);

  const visible = useMemo(
    () => rows.filter((TABS.find((t) => t.value === tab) ?? TABS[0]).match),
    [rows, tab],
  );
  const tabs = TABS.map((t) => ({ ...t, count: rows.filter(t.match).length }));

  const columns = [
    menuColumn((r) => [
      { label: 'Edit rates', icon: 'edit', onSelect: () => navigate(setupRoutes.pricingScheduleDetail(r.id)) },
      { label: 'Clone schedule', icon: 'copy', onSelect: () => toast.notify(`"${r.name}" cloned — the copy is inactive until you link an agent.`) },
      {
        label: r.status === 'Active' ? 'Deactivate' : 'Activate',
        icon: 'power',
        tone: r.status === 'Active' ? 'danger' : undefined,
        onSelect: () => {
          setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: x.status === 'Active' ? 'Inactive' : 'Active' } : x)));
          toast.notify(`"${r.name}" ${r.status === 'Active' ? 'deactivated' : 'activated'}.`);
        },
      },
    ]),
    {
      key: 'name', header: 'Pricing Schedule', fw: 20, sortable: true,
      cell: (r) => (
        <TwoLine
          primary={<LinkCell to={setupRoutes.pricingScheduleDetail(r.id)}>{r.name}</LinkCell>}
          secondary={`${r.processor} · ${r.pricingType} · split by ${r.splitType}`}
        />
      ),
      text: (r) => `${r.name} ${r.processor} ${r.pricingType}`,
    },
    {
      key: 'usersLinked', header: 'Agents Linked', fw: 8, align: 'center', sortable: true,
      cell: (r) => (r.usersLinked
        ? <strong>{r.usersLinked}</strong>
        : <Tooltip label="Nothing is using this schedule — safe to archive"><Badge tone="neutral">Unused</Badge></Tooltip>),
      text: (r) => (r.usersLinked ? String(r.usersLinked) : 'Unused'),
      description: 'How many agent payout profiles reference this schedule — a schedule at zero is dead configuration',
    },
    { key: 'startMonth', header: 'Start Month', fw: 8, align: 'center', sortable: true },
    {
      key: 'profitPct', header: 'Profit %', fw: 6, align: 'right', sortable: true,
      cell: (r) => (r.profitPct ? `${r.profitPct}%` : <Muted>—</Muted>),
    },
    {
      key: 'lossPct', header: 'Loss %', fw: 6, align: 'right', sortable: true,
      cell: (r) => (r.lossPct ? `${r.lossPct}%` : <Muted>—</Muted>),
    },
    { key: 'itemCount', header: 'Items', fw: 6, align: 'right', sortable: true, description: 'Priced line items across all six rate categories' },
    { key: 'created', header: 'Created', fw: 8, align: 'center', sortable: true },
    { key: 'updated', header: 'Last Updated', fw: 8, align: 'center', sortable: true },
    { key: 'updatedBy', header: 'Updated By', fw: 11, sortable: true },
    { key: 'status', header: 'Status', fw: 7, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <ListPage
      title="Pricing Schedules"
      description="Item rates, splits and the profit/loss share behind every residual payout"
      tabs={tabs}
      tab={tab}
      onTabChange={setTab}
      headerActions={(
        <>
          <Button variant="secondary" size="sm" icon="upload" onClick={() => toast.notify('Import a rate card as CSV.')}>Import</Button>
          <Button variant="primary" size="sm" icon="plus" onClick={() => toast.notify('New pricing schedule.')}>Create</Button>
        </>
      )}
      columns={columns}
      rows={visible}
      searchPlaceholder="Search schedule name or processor"
      exportName="pricing-schedules"
      onRowClick={(r) => navigate(setupRoutes.pricingScheduleDetail(r.id))}
      empty="No schedules in this view."
    />
  );
}

export default PricingSchedules;
