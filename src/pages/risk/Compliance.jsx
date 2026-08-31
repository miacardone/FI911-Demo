import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { Badge, Kpi } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import { Money, Muted, TwoLine, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import { BreachDrawer } from '@/components/fi911/BreachDrawer';
import {
  BREACHES, BREACH_STAGES, BREACH_TABS, breachRule, breachStage, breachSummary,
} from '@/data/compliance';
import { useRecords } from '@/hooks/useRecords';
import { useToast } from '@/context/ToastContext';

/**
 * Risk > Compliance.
 *
 * Merchants that have fallen out of compliance, and — the part that matters —
 * what happens to each of them if nobody acts.
 *
 * A status of "Non-compliant" tells an operator something is wrong. It does
 * not tell them what happens on Friday, which is the only question worth
 * asking, because the consequences here are automatic: reserves rise,
 * settlement holds, and eventually the merchant is offboarded whether or not
 * anyone remembered to look.
 */

/** The clock. Overdue is the state that changes what happens next. */
function Countdown({ breach }) {
  const days = breach.daysRemaining;

  if (breach.stage === 'resolved') {
    return <Tooltip label={`Resolved ${breach.resolvedOn}`}><Badge tone="success">Closed</Badge></Tooltip>;
  }
  if (days < 0) {
    return (
      <Tooltip label={`Window closed ${Math.abs(days)} days ago on ${breach.deadline}. The consequence applies automatically.`}>
        <Badge tone="danger" dot>{Math.abs(days)}d overdue</Badge>
      </Tooltip>
    );
  }
  return (
    <Tooltip label={`Merchant has until ${breach.deadline} to remediate`}>
      <span className={days <= 7 ? 'warn' : undefined}>{days}d left</span>
    </Tooltip>
  );
}

/** Where in its life this breach sits, and who is holding it. */
function StageCell({ breach }) {
  const s = breachStage(breach.stage);
  const tone = breach.stage === 'resolved' ? 'success'
    : breach.stage === 'enforced' ? 'danger'
      : breach.stage === 'escalated' ? 'danger'
        : breach.stage === 'remediating' ? 'warning' : 'neutral';
  return (
    <Tooltip label={`${s.help} Held by: ${s.owner}.`} wide>
      <Badge tone={tone}>{s.label}</Badge>
    </Tooltip>
  );
}

export function Compliance() {
  const toast = useToast();
  const store = useRecords(BREACHES, { key: 'id' });
  const all = store.rows;
  const [tab, setTab] = useState('open');
  const [inspecting, setInspecting] = useState(null);

  const rows = useMemo(
    () => all.filter((BREACH_TABS.find((t) => t.value === tab) ?? BREACH_TABS[0]).match),
    [all, tab],
  );

  const s = breachSummary(all);

  /* Moving a breach forward is the operator's actual job here, so the row menu
     advances the stage rather than describing it. */
  const advance = (b, to, message) => {
    store.update(b, { stage: to, stageLabel: breachStage(to).label, owner: breachStage(to).owner });
    toast.notify(message);
  };

  const columns = [
    menuColumn((b) => [
      { label: 'View breach', icon: 'eye', onSelect: () => setInspecting(b) },
      b.stage === 'detected' && {
        label: 'Notify merchant',
        icon: 'mail',
        onSelect: () => advance(b, 'notified', `${b.merchant} notified — ${breachRule(b.ruleId).windowDays} day window has started.`),
      },
      ['notified', 'remediating', 'escalated'].includes(b.stage) && {
        label: 'Mark resolved',
        icon: 'check',
        onSelect: () => advance(b, 'resolved', `${b.merchant} is back in good standing.`),
      },
      ['escalated'].includes(b.stage) && {
        label: 'Apply consequence',
        icon: 'ban',
        tone: 'danger',
        onSelect: () => advance(b, 'enforced', `${breachRule(b.ruleId).consequence} — applied to ${b.merchant}.`),
      },
    ].filter(Boolean)),
    {
      key: 'merchant', header: 'Merchant', fw: 17, sortable: true,
      cell: (b) => <TwoLine primary={b.merchant} secondary={`MID: ${b.mid}`} />,
      text: (b) => `${b.merchant} ${b.mid}`,
    },
    {
      key: 'rule', header: 'What Tripped', fw: 16, sortable: true,
      cell: (b) => <TwoLine primary={b.rule} secondary={b.category} />,
      text: (b) => `${b.rule} ${b.category}`,
      description: 'The rule that concluded this merchant is out of compliance',
    },
    { key: 'detected', header: 'Detected', fw: 9, align: 'center', sortable: true },
    { key: 'deadline', header: 'Deadline', fw: 9, align: 'center', sortable: true },
    {
      key: 'daysRemaining', header: 'Clock', fw: 9, align: 'center', sortable: true,
      cell: (b) => <Countdown breach={b} />, text: (b) => `${b.daysRemaining}`,
      description: 'Time left in the remediation window. Past zero, the consequence applies on its own.',
    },
    {
      key: 'stage', header: 'Stage', fw: 10, align: 'center', sortable: true,
      cell: (b) => <StageCell breach={b} />, text: (b) => b.stageLabel,
      description: 'Where the breach sits in its life, and which team is holding it',
    },
    {
      key: 'owner', header: 'Held By', fw: 8, align: 'center', sortable: true,
      cell: (b) => (b.owner === '—' ? <Muted>—</Muted> : b.owner),
      description: 'The common failure is a breach sitting in a queue nobody owns',
    },
    {
      key: 'consequence', header: 'If Unresolved', fw: 15,
      cell: (b) => <span className="subtle small">{breachRule(b.ruleId).consequence}</span>,
      text: (b) => breachRule(b.ruleId).consequence,
      description: 'What happens automatically when the window closes',
    },
    {
      key: 'heldAmount', header: 'Funds Held', fw: 10, align: 'right', sortable: true,
      cell: (b) => (b.heldAmount ? <Money value={b.heldAmount} /> : <Muted>—</Muted>),
      text: (b) => moneyText(b.heldAmount), totalCell: moneyTotal,
    },
    { key: 'assignedTo', header: 'Assigned To', fw: 11, sortable: true, cell: (b) => (b.assignedTo ? b.assignedTo : <Muted>Unassigned</Muted>) },
  ];

  return (
    <ListPage
      title="Compliance"
      description="Merchants out of compliance, and what happens to each if nobody acts"
      viewTabs={BREACH_TABS.map((t) => ({ ...t, count: all.filter(t.match).length }))}
      viewTab={tab}
      onViewTabChange={setTab}
      viewTabsLabel="Breach view"
    >
      <div className="queue-kpis">
        <Kpi label="Open breaches" value={s.open} meta={`${s.dueThisWeek} due within 7 days`} />
        <Kpi label="Past deadline" value={s.overdue} meta="Consequence applies automatically" invert />
        <Kpi label="Funds held" value={moneyText(s.held)} meta="Withheld pending remediation" invert />
        <Kpi label="Rules in force" value={BREACH_STAGES.length ? 6 : 0} meta="Each with its own window and consequence" />
      </div>

      <ListTable
        key={tab}
        columns={columns}
        rows={rows}
        searchPlaceholder="Search merchant or MID"
        exportName="compliance-breaches"
        totals={['heldAmount']}
        onRowClick={(b) => setInspecting(b)}
        note="A breach past its deadline enforces on its own — nobody has to press anything."
        empty="No breaches in this view."
      />

      <BreachDrawer
        breach={inspecting}
        onClose={() => setInspecting(null)}
        onAdvance={advance}
      />
    </ListPage>
  );
}

export default Compliance;
