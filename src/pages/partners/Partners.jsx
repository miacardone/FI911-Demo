import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { Badge, Kpi } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import { Money, Muted, StatusBadge, TwoLine, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import { PartnerDrawer } from '@/components/fi911/PartnerDrawer';
import { PARTNER_BOOK, PARTNER_TABS, approvalRate } from '@/data/partners';
import { useToast } from '@/context/ToastContext';

/**
 * Partners — the businesses that acquire merchants on the bank's behalf.
 *
 * The console could name a partner on a merchant row but had nowhere to
 * answer what that partner is actually worth. The column that makes this
 * screen worth opening is "Net to bank": gross revenue on their book, minus
 * the residual owed to them, minus the chargeback loss they do not carry.
 *
 * It goes negative, and a partner with a large book and a healthy pipeline
 * can still sit at the bottom of the list. That is the conversation this
 * screen exists to start.
 */

/** Revenue earned against loss absorbed, at a glance. */
function NetCell({ partner }) {
  const bad = partner.netToBank < 0;
  return (
    <Tooltip
      label={`${moneyText(partner.grossRevenue)} earned on the book, less ${moneyText(partner.residualOwed)} residual owed, `
        + `less ${moneyText(partner.chargebackLoss - partner.lossCarried)} of chargeback loss the bank absorbs.`}
      wide
    >
      <strong className={bad ? 'money--neg' : undefined}>{moneyText(partner.netToBank)}</strong>
    </Tooltip>
  );
}

/** How much of their own book's loss the partner actually carries. */
function LossShareCell({ partner }) {
  if (!partner.lossShare) {
    return (
      <Tooltip label="This partner absorbs none of the chargeback loss from the merchants it introduced — the bank carries all of it.">
        <Badge tone="danger">None</Badge>
      </Tooltip>
    );
  }
  return (
    <Tooltip label={`Carries ${moneyText(partner.lossCarried)} of ${moneyText(partner.chargebackLoss)} monthly loss`}>
      <span>{partner.lossShare}%</span>
    </Tooltip>
  );
}

export function Partners() {
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [inspecting, setInspecting] = useState(null);

  const rows = useMemo(
    () => PARTNER_BOOK.filter((PARTNER_TABS.find((t) => t.value === tab) ?? PARTNER_TABS[0]).match),
    [tab],
  );

  const totalMerchants = PARTNER_BOOK.reduce((s, p) => s + p.merchants, 0);
  const totalResidual = PARTNER_BOOK.reduce((s, p) => s + p.residualOwed, 0);
  const totalNet = PARTNER_BOOK.reduce((s, p) => s + p.netToBank, 0);
  const costing = PARTNER_BOOK.filter((p) => p.netToBank < 0);

  const columns = [
    menuColumn((p) => [
      { label: 'View book', icon: 'eye', onSelect: () => setInspecting(p) },
      { label: 'Statement', icon: 'file', onSelect: () => toast.notify(`${p.name} residual statement queued.`) },
    ]),
    {
      key: 'name', header: 'Partner', fw: 18, sortable: true,
      cell: (p) => <TwoLine primary={p.name} secondary={`${p.code} · since ${p.since.slice(0, 4)}`} />,
      text: (p) => `${p.name} ${p.code}`,
    },
    {
      key: 'tier', header: 'Tier', fw: 8, align: 'center', sortable: true,
      cell: (p) => <Badge tone={p.tier === 'strategic' ? 'primary' : p.tier === 'growth' ? 'success' : 'neutral'}>{p.tierLabel}</Badge>,
      text: (p) => p.tierLabel,
    },
    {
      key: 'merchants', header: 'Merchants', fw: 8, align: 'right', sortable: true,
      description: 'Live merchants this partner introduced',
    },
    {
      key: 'pipeline', header: 'Pipeline', fw: 7, align: 'right', sortable: true,
      cell: (p) => (p.pipeline ? p.pipeline : <Muted>—</Muted>),
      description: 'Applications still in the funnel — whether the partner is still selling',
    },
    {
      key: 'approval', header: 'Approval Rate', fw: 9, align: 'center', sortable: true,
      cell: (p) => {
        const rate = approvalRate(p);
        return (
          <Tooltip label={`${p.approvedLast90} approved, ${p.declinedLast90} declined in the last 90 days`}>
            <span className={rate < 70 ? 'warn' : undefined}>{rate}%</span>
          </Tooltip>
        );
      },
      sortValue: (p) => approvalRate(p), text: (p) => `${approvalRate(p)}%`,
      description: 'Introducing volume is easy; introducing volume that survives underwriting is the real signal',
    },
    {
      key: 'monthlyVolume', header: 'Monthly Volume', fw: 11, align: 'right', sortable: true,
      cell: (p) => <Money value={p.monthlyVolume} />, text: (p) => moneyText(p.monthlyVolume), totalCell: moneyTotal,
    },
    {
      key: 'residualOwed', header: 'Residual Owed', fw: 10, align: 'right', sortable: true,
      cell: (p) => <Money value={p.residualOwed} />, text: (p) => moneyText(p.residualOwed), totalCell: moneyTotal,
      description: 'What the bank pays this partner each month',
    },
    {
      key: 'lossShare', header: 'Loss Carried', fw: 8, align: 'center', sortable: true,
      cell: (p) => <LossShareCell partner={p} />, text: (p) => `${p.lossShare}%`,
      description: 'How much of the chargeback loss from their own merchants the partner absorbs',
    },
    {
      key: 'cbRatio', header: 'CB Ratio', fw: 7, align: 'center', sortable: true,
      cell: (p) => <span className={p.cbRatio >= 1 ? 'money--neg' : undefined}>{p.cbRatio}%</span>,
      description: 'Chargeback ratio across their book. Scheme monitoring programs begin near 1%.',
    },
    {
      key: 'netToBank', header: 'Net To Bank', fw: 10, align: 'right', sortable: true,
      cell: (p) => <NetCell partner={p} />, text: (p) => moneyText(p.netToBank), totalCell: moneyTotal,
      description: 'Revenue on their book, less what they are paid, less the loss they do not carry',
    },
    { key: 'status', header: 'Status', fw: 8, align: 'center', sortable: true, cell: (p) => <StatusBadge value={p.status} /> },
  ];

  return (
    <ListPage
      title="Partners"
      description="Who acquires merchants for the bank, what they are paid, and what their book costs"
      viewTabs={PARTNER_TABS.map((t) => ({ ...t, count: PARTNER_BOOK.filter(t.match).length }))}
      viewTab={tab}
      onViewTabChange={setTab}
      viewTabsLabel="Partner tier"
    >
      <div className="queue-kpis">
        <Kpi label="Merchants introduced" value={totalMerchants.toLocaleString()} meta={`Across ${PARTNER_BOOK.length} partners`} />
        <Kpi label="Residual owed" value={moneyText(totalResidual)} meta="Paid out this cycle" />
        <Kpi label="Net to bank" value={moneyText(totalNet)} meta="After residuals and uncarried loss" />
        <Kpi
          label="Costing money"
          value={costing.length}
          meta="Partners whose book loses more than it earns"
          invert
          tooltip="Revenue on their merchants, less the residual owed, less the chargeback loss the bank absorbs on their behalf. A large book does not make a good relationship."
        />
      </div>

      <ListTable
        key={tab}
        columns={columns}
        rows={rows}
        searchPlaceholder="Search partner name or code"
        exportName="partners"
        totals={['merchants', 'monthlyVolume', 'residualOwed', 'netToBank']}
        onRowClick={(p) => setInspecting(p)}
        note="Sorted as listed. Net to bank is the column worth reading first."
        empty="No partners in this view."
      />

      <PartnerDrawer partner={inspecting} onClose={() => setInspecting(null)} />
    </ListPage>
  );
}

export default Partners;
