import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { LinkCell, Money, Muted, StatusBadge, TwoLine, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import { Badge, Button } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import { useNavigate } from 'react-router-dom';
import { PAYOUT_PROFILES, PORTFOLIO_PROFILES, PRICING_SCHEDULES } from '@/apm/data/setup';
import { routes } from '@/apm/data/navigation';
import { ImportButton } from '@/components/fi911/ImportButton';
import { useToast } from '@/context/ToastContext';
import { useRecords } from '@/hooks/useRecords';
import { RecordFormModal } from '@/components/fi911/RecordFormModal';
import brand from '@/apm/brand.config';

/**
 * Setup > Residuals > Agent Profiles.
 *
 * Two tabs, as in the reference: who gets paid (payout profiles) and out of
 * what (portfolio profiles).
 *
 * The reference lists 375 payout profiles with a Rep Code, a Pricing Schedule
 * name and a status — but not the split percentage or the merchant count, so
 * the two things that determine what an agent is actually owed are missing
 * from the screen that configures it. Both are here, and a profile pointing
 * at a schedule with nothing linked is called out rather than left to be
 * discovered at month end.
 */

const PAYOUT_TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'active', label: 'Active', match: (r) => r.status === 'Active' },
  { value: 'nomerchants', label: 'No merchants', match: (r) => r.merchants === 0 },
  { value: 'inactive', label: 'Inactive', match: (r) => r.status === 'Inactive' },
];

function PayoutTab({ store, onEdit }) {
  const toast = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState('all');
  const all = store.rows;
  const rows = useMemo(
    () => all.filter((PAYOUT_TABS.find((t) => t.value === tab) ?? PAYOUT_TABS[0]).match),
    [tab, all],
  );

  const columns = [
    menuColumn((r) => [
      { label: 'Edit profile', icon: 'edit', onSelect: () => onEdit(r) },
      /* The payout history for an agent already has a screen; sending the
         operator there beats describing it in a toast. */
      { label: 'View payouts', icon: 'dollar', onSelect: () => navigate(routes.agentPayoutSummary) },
      {
        label: r.status === 'Active' ? 'Deactivate' : 'Activate',
        icon: 'power',
        tone: r.status === 'Active' ? 'danger' : undefined,
        onSelect: () => toast.notify(`${r.repCode} is now ${store.toggleStatus(r).toLowerCase()}.`),
      },
    ]),
    {
      key: 'agent', header: 'Agent', fw: 15, sortable: true,
      cell: (r) => <TwoLine primary={r.agent} secondary={`Rep ${r.repCode}`} />,
      text: (r) => `${r.agent} ${r.repCode}`,
    },
    { key: 'pricingSchedule', header: 'Pricing Schedule', fw: 20, sortable: true },
    {
      key: 'splitPct', header: 'Split %', fw: 6, align: 'right', sortable: true,
      cell: (r) => `${r.splitPct}%`,
      description: 'The agent’s share of net revenue on this schedule — the number that decides the payout',
    },
    {
      key: 'merchants', header: 'Merchants', fw: 7, align: 'center', sortable: true,
      cell: (r) => (r.merchants
        ? <strong>{r.merchants}</strong>
        : <Tooltip label="No merchants attached — this profile will pay nothing"><Badge tone="warning">None</Badge></Tooltip>),
      text: (r) => String(r.merchants),
    },
    { key: 'partner', header: 'Partner', fw: 13, sortable: true, cell: (r) => (r.partner ? r.partner : <Muted>—</Muted>) },
    { key: 'processor', header: 'Processor', fw: 9, align: 'center', sortable: true },
    { key: 'vendorId', header: 'Vendor ID', fw: 8, align: 'center', cell: (r) => (r.vendorId ? r.vendorId : <Muted>—</Muted>) },
    { key: 'startDate', header: 'Start Date', fw: 8, align: 'center', sortable: true },
    { key: 'created', header: 'Created', fw: 8, align: 'center', sortable: true },
    { key: 'updated', header: 'Last Updated', fw: 8, align: 'center', sortable: true },
    { key: 'status', header: 'Status', fw: 7, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <ListTable
      key={tab}
      columns={columns}
      rows={rows}
      searchPlaceholder="Search agent or rep code"
      exportName="payout-profiles"
      totals={['merchants']}
      viewTabs={PAYOUT_TABS.map((t) => ({ ...t, count: PAYOUT_PROFILES.filter(t.match).length }))}
      viewTab={tab}
      onViewTabChange={setTab}
      viewTabsLabel="Payout profile view"
      empty="No payout profiles in this view."
    />
  );
}

function PortfolioTab({ store, onEdit }) {
  const navigate = useNavigate();

  const columns = [
    menuColumn((r) => [
      { label: 'Edit portfolio', icon: 'edit', onSelect: () => onEdit(r) },
      { label: 'View merchants', icon: 'users', onSelect: () => navigate(routes.portfolioPayoutDetails) },
    ]),
    { key: 'name', header: 'Portfolio Name', fw: 26, sortable: true, cell: (r) => <TwoLine primary={r.name} secondary={r.processor} />, text: (r) => `${r.name} ${r.processor}` },
    {
      key: 'merchants', header: 'Merchants', fw: 7, align: 'center', sortable: true,
      cell: (r) => (r.merchants ? <strong>{r.merchants}</strong> : <Badge tone="warning">None</Badge>),
      text: (r) => String(r.merchants),
    },
    {
      key: 'monthlyResidual', header: 'Monthly Residual', fw: 11, align: 'right', sortable: true,
      cell: (r) => (r.monthlyResidual ? <Money value={r.monthlyResidual} /> : <Muted>—</Muted>),
      text: (r) => moneyText(r.monthlyResidual), totalCell: moneyTotal,
      description: 'What this portfolio paid out last closed month — the reference omits it, which makes an empty portfolio look identical to a productive one',
    },
    { key: 'startDate', header: 'Start Date', fw: 8, align: 'center', sortable: true },
    { key: 'created', header: 'Created On', fw: 8, align: 'center', sortable: true },
    { key: 'modified', header: 'Last Modified', fw: 8, align: 'center', sortable: true },
    { key: 'modifiedBy', header: 'Modified By', fw: 11, sortable: true },
    { key: 'status', header: 'Status', fw: 7, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <ListTable
      columns={columns}
      rows={store.rows}
      searchPlaceholder="Search portfolio name"
      exportName="portfolio-profiles"
      totals={['merchants', 'monthlyResidual']}
      empty="No portfolio profiles."
    />
  );
}

const FIELDS = {
  payout: [
    { name: 'agent', label: 'Agent', required: true },
    { name: 'repCode', label: 'Rep Code', required: true },
    { name: 'pricingSchedule', label: 'Pricing Schedule', type: 'select', options: PRICING_SCHEDULES.map((p) => p.name), required: true },
    { name: 'processor', label: 'Processor', type: 'select', options: brand.processors },
    { name: 'splitPct', label: 'Split %', type: 'number', required: true },
    { name: 'startDate', label: 'Start Date' },
  ],
  portfolio: [
    { name: 'name', label: 'Portfolio Name', required: true },
    { name: 'processor', label: 'Processor', type: 'select', options: brand.processors, required: true },
    { name: 'startDate', label: 'Start Date' },
  ],
};

export function AgentProfiles() {
  const toast = useToast();
  const [tab, setTab] = useState('payout');

  const payout = useRecords(PAYOUT_PROFILES, { key: 'id' });
  const portfolio = useRecords(PORTFOLIO_PROFILES, { key: 'id' });
  const store = tab === 'payout' ? payout : portfolio;

  const [draft, setDraft] = useState(null);
  const editing = draft && Object.keys(draft).length > 0 ? draft : null;

  const submit = (v) => {
    if (editing) { store.update(editing, v); return; }
    store.create({
      id: `new-${tab}-${store.rows.length}`,
      status: 'Active', merchants: 0, monthlyResidual: 0, partner: '', vendorId: '',
      created: brand.today.replace(/-/g, '/'),
      updated: brand.today.replace(/-/g, '/'),
      modified: brand.today.replace(/-/g, '/'),
      ...v,
    });
  };

  return (
    <ListPage
      title="Agent Profiles"
      description="Who gets paid, out of which portfolio, at what split"
      tabs={[
        { value: 'payout', label: 'Payout Profiles', count: payout.rows.length },
        { value: 'portfolio', label: 'Portfolio Profiles', count: portfolio.rows.length },
      ]}
      tab={tab}
      onTabChange={setTab}
      headerActions={(
        <>
          <ImportButton noun="profiles" />
          <Button variant="primary" size="sm" icon="plus" onClick={() => setDraft({})}>New</Button>
        </>
      )}
    >
      {tab === 'payout'
        ? <PayoutTab store={payout} onEdit={setDraft} />
        : <PortfolioTab store={portfolio} onEdit={setDraft} />}

      <RecordFormModal
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={tab === 'payout' ? 'payout profile' : 'portfolio profile'}
        fields={FIELDS[tab]}
        initial={editing}
        onSubmit={submit}
      />
    </ListPage>
  );
}

export default AgentProfiles;
