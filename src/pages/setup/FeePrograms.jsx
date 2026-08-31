import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { Badge, Button, Kpi } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import { Money, Muted, StatusBadge, TwoLine, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import { FeeWizard } from '@/components/fi911/FeeWizard';
import { FeeSplitPanel } from '@/components/fi911/FeeSplitPanel';
import {
  FEE_PROGRAMS, FEE_TABS, feeBasis, feeRevenue,
} from '@/data/fees';
import { useRecords } from '@/hooks/useRecords';
import { useToast } from '@/context/ToastContext';

/**
 * Setup > Residuals > Fee Programs.
 *
 * What a bank charges, who it lands on, and how the money and the loss divide
 * between the bank, the partner and the agent.
 *
 * The console had pricing schedules — rate cards attached to portfolios — but
 * nothing modelling a FEE as its own thing with a scope, a start date and a
 * notice period. That is the object a bank actually reasons about when it
 * introduces a charge, and it is the one an operator gets asked about when a
 * merchant rings up wanting to know what the new line on their statement is.
 */

function BasisCell({ fee }) {
  const b = feeBasis(fee.basis);
  const amount = fee.basis === 'percent' ? `${fee.amount}%` : moneyText(fee.amount);
  return (
    <Tooltip label={b.help}>
      <span className="fee-basis">
        <strong>{amount}</strong>
        <span className="fee-basis__unit">{b.unit}</span>
      </span>
    </Tooltip>
  );
}

/** Where the fee lands, in the words the scope was chosen with. */
function ScopeCell({ fee }) {
  const target = fee.scope === 'all' ? 'Every merchant'
    : fee.scope === 'portfolio' ? fee.portfolio
      : fee.scope === 'partner' ? fee.partner
        : fee.segment;
  const label = fee.scope === 'all' ? 'All' : fee.scope === 'portfolio' ? 'Portfolio' : fee.scope === 'partner' ? 'Partner' : 'Segment';
  return <TwoLine primary={target} secondary={`${label} · ${fee.merchants.toLocaleString()} merchants`} />;
}

/**
 * Revenue share against loss share, in one cell.
 *
 * Two bars rather than two numbers: the asymmetry is the point, and it is far
 * easier to see that a partner's revenue bar is long while its loss bar is
 * empty than to compare "30%" and "0%" in adjacent columns.
 */
function SplitCell({ fee }) {
  return (
    <Tooltip
      label={`Revenue — bank ${fee.bankShare}%, partner ${fee.partnerShare}%, agent ${fee.agentShare}%. `
        + `Loss — bank ${fee.bankLoss}%, partner ${fee.partnerLoss}%, agent ${fee.agentLoss}%.`}
      wide
    >
      <span className="splitbars">
        <span className="splitbars__row">
          <span className="splitbars__tag">Rev</span>
          <span className="splitbars__track">
            <span className="splitbars__seg splitbars__seg--bank" style={{ width: `${fee.bankShare}%` }} />
            <span className="splitbars__seg splitbars__seg--partner" style={{ width: `${fee.partnerShare}%` }} />
            <span className="splitbars__seg splitbars__seg--agent" style={{ width: `${fee.agentShare}%` }} />
          </span>
        </span>
        <span className="splitbars__row">
          <span className="splitbars__tag">Loss</span>
          <span className="splitbars__track">
            <span className="splitbars__seg splitbars__seg--bank" style={{ width: `${fee.bankLoss}%` }} />
            <span className="splitbars__seg splitbars__seg--partner" style={{ width: `${fee.partnerLoss}%` }} />
            <span className="splitbars__seg splitbars__seg--agent" style={{ width: `${fee.agentLoss}%` }} />
          </span>
        </span>
      </span>
    </Tooltip>
  );
}

export function FeePrograms() {
  const toast = useToast();
  const store = useRecords(FEE_PROGRAMS, { key: 'id' });
  const all = store.rows;

  const [tab, setTab] = useState('all');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [inspecting, setInspecting] = useState(null);

  const rows = useMemo(
    () => all.filter((FEE_TABS.find((t) => t.value === tab) ?? FEE_TABS[0]).match),
    [all, tab],
  );

  const live = all.filter((f) => f.status === 'Live');
  const monthlyRevenue = live.reduce((s, f) => s + feeRevenue(f), 0);
  const bankKeeps = live.reduce((s, f) => s + feeRevenue(f) * (f.bankShare / 100), 0);
  const partnerLoad = live.reduce((s, f) => s + f.monthlyLoss * (f.partnerLoss / 100), 0);
  const totalLoss = live.reduce((s, f) => s + f.monthlyLoss, 0);

  /* A partner earning a revenue share while carrying none of the loss is the
     asymmetry this screen exists to make visible, so it gets counted. */
  const asymmetric = all.filter((f) => f.partnerShare > 0 && f.partnerLoss === 0);

  const columns = [
    menuColumn((f) => [
      { label: 'View split', icon: 'eye', onSelect: () => setInspecting(f) },
      f.status === 'Draft' && {
        label: 'Schedule',
        icon: 'calendar',
        onSelect: () => { store.update(f, { status: 'Scheduled' }); toast.notify(`"${f.name}" scheduled.`); },
      },
      f.status === 'Scheduled' && {
        label: 'Publish now',
        icon: 'check',
        onSelect: () => { store.update(f, { status: 'Live' }); toast.notify(`"${f.name}" is live.`); },
      },
      f.status === 'Live' && {
        label: 'Retire fee',
        icon: 'ban',
        tone: 'danger',
        onSelect: () => { store.update(f, { status: 'Retired' }); toast.notify(`"${f.name}" retired — it will not bill next cycle.`); },
      },
    ].filter(Boolean)),
    {
      key: 'name', header: 'Fee', fw: 20, sortable: true,
      cell: (f) => <TwoLine primary={f.name} secondary={feeBasis(f.basis).label} />,
      text: (f) => `${f.name} ${feeBasis(f.basis).label}`,
    },
    { key: 'amount', header: 'Charge', fw: 10, align: 'center', sortable: true, cell: (f) => <BasisCell fee={f} />, text: (f) => String(f.amount) },
    { key: 'scope', header: 'Applies To', fw: 16, sortable: true, cell: (f) => <ScopeCell fee={f} />, text: (f) => `${f.portfolio} ${f.partner} ${f.segment}` },
    {
      key: 'revenue', header: 'Monthly Revenue', fw: 11, align: 'right', sortable: true,
      cell: (f) => <Money value={feeRevenue(f)} />,
      sortValue: (f) => feeRevenue(f), text: (f) => moneyText(feeRevenue(f)), totalCell: moneyTotal,
      description: 'Projected from the charge and how many merchants it reaches',
    },
    {
      key: 'split', header: 'Revenue / Loss Split', fw: 12, align: 'center',
      cell: (f) => <SplitCell fee={f} />,
      text: (f) => `${f.bankShare}/${f.partnerShare}/${f.agentShare}`,
      description: 'Blue is the bank, amber the partner, grey the agent. Top bar is revenue, bottom is who absorbs chargeback loss.',
    },
    {
      key: 'monthlyLoss', header: 'Loss Exposure', fw: 10, align: 'right', sortable: true,
      cell: (f) => <Money value={f.monthlyLoss} />, text: (f) => moneyText(f.monthlyLoss), totalCell: moneyTotal,
      description: 'Monthly chargeback loss attributable to the merchants this fee covers',
    },
    {
      key: 'effectiveDate', header: 'Effective', fw: 9, align: 'center', sortable: true,
      cell: (f) => (f.effectiveDate ? f.effectiveDate : <Muted>Not set</Muted>),
    },
    {
      key: 'noticeDays', header: 'Notice', fw: 7, align: 'center', sortable: true,
      cell: (f) => (f.noticeDays
        ? `${f.noticeDays}d`
        : <Tooltip label="No notice period — most card agreements oblige the acquirer to give merchants time to leave before a new fee applies"><Badge tone="danger">None</Badge></Tooltip>),
      text: (f) => `${f.noticeDays}`,
      description: 'How much warning merchants get before the fee starts billing',
    },
    { key: 'status', header: 'Status', fw: 8, align: 'center', sortable: true, cell: (f) => <StatusBadge value={f.status} /> },
  ];

  return (
    <ListPage
      title="Fee Programs"
      description="What the bank charges, who it lands on, and how the revenue and the loss divide"
      headerActions={<Button variant="primary" size="sm" icon="plus" onClick={() => setWizardOpen(true)}>Introduce a fee</Button>}
      viewTabs={FEE_TABS.map((t) => ({ ...t, count: all.filter(t.match).length }))}
      viewTab={tab}
      onViewTabChange={setTab}
      viewTabsLabel="Fee status"
    >
      <div className="queue-kpis">
        <Kpi label="Live fee revenue" value={moneyText(monthlyRevenue)} meta={`${live.length} fees billing this cycle`} />
        <Kpi label="Bank keeps" value={moneyText(bankKeeps)} meta={`${Math.round((bankKeeps / (monthlyRevenue || 1)) * 100)}% of fee revenue`} />
        <Kpi label="Partner loss carried" value={moneyText(partnerLoad)} meta={`of ${moneyText(totalLoss)} total chargeback loss`} invert />
        <Kpi
          label="Revenue without risk"
          value={asymmetric.length}
          meta="Fees where a partner earns but carries no loss"
          invert
          tooltip="A partner taking a revenue share while absorbing none of the chargeback loss is being paid to introduce risk it does not carry. Worth knowing before renewal."
        />
      </div>

      {/* An explicit ListTable, because passing `children` to ListPage replaces
          the table it would otherwise render from `columns`/`rows`. */}
      <ListTable
        key={tab}
        columns={columns}
        rows={rows}
        searchPlaceholder="Search fee name or target"
        exportName="fee-programs"
        totals={['revenue', 'monthlyLoss']}
        onRowClick={(f) => setInspecting(f)}
        empty="No fees in this view."
      />

      <FeeWizard
            open={wizardOpen}
            onClose={() => setWizardOpen(false)}
        onPublish={(fee) => {
          store.create(fee);
          toast.notify(fee.status === 'Live'
            ? `"${fee.name}" is live from ${fee.effectiveDate}.`
            : `"${fee.name}" saved as ${fee.status.toLowerCase()}.`);
        }}
      />
      <FeeSplitPanel fee={inspecting} onClose={() => setInspecting(null)} />
    </ListPage>
  );
}

export default FeePrograms;
