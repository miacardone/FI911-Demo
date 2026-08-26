import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { LinkCell, Money, Muted, StatusBadge, TwoLine, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import { Badge, Button } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import { PAYOUT_PROFILES, PORTFOLIO_PROFILES } from '@/data/setup';
import { useToast } from '@/context/ToastContext';

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

function PayoutTab() {
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const rows = useMemo(
    () => PAYOUT_PROFILES.filter((PAYOUT_TABS.find((t) => t.value === tab) ?? PAYOUT_TABS[0]).match),
    [tab],
  );

  const columns = [
    menuColumn((r) => [
      { label: 'Edit profile', icon: 'edit', onSelect: () => toast.notify(`Editing ${r.agent} (${r.repCode}).`) },
      { label: 'View payouts', icon: 'dollar', onSelect: () => toast.notify(`Payout history for ${r.repCode}.`) },
      { label: 'Change status', icon: 'power', onSelect: () => toast.notify(`${r.repCode} status changed.`) },
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
      leftExtra={(
        <div className="wq-tabs" role="tablist" aria-label="Payout profile view">
          {PAYOUT_TABS.map((t) => (
            <button
              key={t.value} type="button" role="tab" aria-selected={tab === t.value}
              className={`wq-tab ${tab === t.value ? 'is-active' : ''}`.trim()}
              onClick={() => setTab(t.value)}
            >
              {t.label}<span className="wq-tab__count">{PAYOUT_PROFILES.filter(t.match).length}</span>
            </button>
          ))}
        </div>
      )}
      empty="No payout profiles in this view."
    />
  );
}

function PortfolioTab() {
  const toast = useToast();

  const columns = [
    menuColumn((r) => [
      { label: 'Edit portfolio', icon: 'edit', onSelect: () => toast.notify(`Editing ${r.name}.`) },
      { label: 'View merchants', icon: 'users', onSelect: () => toast.notify(`${r.merchants} merchants in ${r.name}.`) },
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
      rows={PORTFOLIO_PROFILES}
      searchPlaceholder="Search portfolio name"
      exportName="portfolio-profiles"
      totals={['merchants', 'monthlyResidual']}
      empty="No portfolio profiles."
    />
  );
}

export function AgentProfiles() {
  const toast = useToast();
  const [tab, setTab] = useState('payout');

  return (
    <ListPage
      title="Agent Profiles"
      description="Who gets paid, out of which portfolio, at what split"
      tabs={[
        { value: 'payout', label: 'Payout Profiles', count: PAYOUT_PROFILES.length },
        { value: 'portfolio', label: 'Portfolio Profiles', count: PORTFOLIO_PROFILES.length },
      ]}
      tab={tab}
      onTabChange={setTab}
      headerActions={(
        <>
          <Button variant="secondary" size="sm" icon="upload" onClick={() => toast.notify('Import profiles as CSV.')}>Import</Button>
          <Button variant="primary" size="sm" icon="plus" onClick={() => toast.notify('New profile.')}>New</Button>
        </>
      )}
    >
      {tab === 'payout' ? <PayoutTab /> : <PortfolioTab />}
    </ListPage>
  );
}

export default AgentProfiles;
