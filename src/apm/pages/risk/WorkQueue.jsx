import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import {
  LinkCell, Money, Muted, NotApplicable, RiskTriangle, StatusBadge, TwoLine, menuColumn, moneyText, moneyTotal,
} from '@/components/fi911/cells';
import { AlertBadges, useAlertLegend } from '@/components/fi911/AlertCodes';
import { Badge, Button, Kpi } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import { AssignModal } from '@/components/fi911/AssignModal';
import {
  BATCH_FILES, BATCH_FILE_TABS, WORK_QUEUE, WORK_QUEUE_TABS, assignmentOptions,
} from '@/apm/data/riskQueue';
import { MERCHANT_STATUSES } from '@/apm/data/risk';
import { routes } from '@/apm/data/navigation';
import { useToast } from '@/context/ToastContext';
import { useRecords } from '@/hooks/useRecords';
import { downloadCsv } from '@/utils/export';
import brand from '@/apm/brand.config';

/**
 * RISK > WORK QUEUE.
 *
 * The queue of merchants whose settlement activity tripped a rule overnight.
 *
 * The reference presents this as a flat grid in no particular order, with
 * twenty-odd numeric columns and no indication of which row matters. Three
 * things are different here:
 *
 *   · Rows arrive TRIAGED — alert severity, money exposed and the merchant's
 *     existing chargeback ratio combine into one score, and the queue leads
 *     with the worst. A queue whose order carries no information is a list.
 *   · Alert codes explain themselves on hover and are coloured by severity,
 *     so the shape of a row is readable before any code is read.
 *   · The Batch File Processing tab is populated. The reference renders it
 *     empty, which cannot answer the one question it exists for — did last
 *     night's file land.
 */

const TIER_LABEL = Object.fromEntries(brand.riskTiers.map((t) => [t.id, t.label]));

const ADVANCED_FIELDS = [
  { name: 'mid', label: 'MID' },
  { name: 'merchant', label: 'Merchant Name' },
  { name: 'partner', label: 'Partner Name' },
  { name: 'mcc', label: 'MCC' },
  { name: 'merchantStatus', label: 'Merchant Status', type: 'select', options: MERCHANT_STATUSES.map((s) => ({ value: s, label: s })) },
  { name: 'processor', label: 'Processor', type: 'select', options: brand.processors.map((p) => ({ value: p, label: p })) },
  { name: 'transactionDate', label: 'Transaction Date', type: 'date' },
];

const ratioTone = (v) => (v >= 15 ? 'danger' : v >= 10 ? 'warning' : 'neutral');

/** Card-scheme monitoring programmes start around 0.9% count / 1% value. */
function Ratio({ value }) {
  const tone = ratioTone(value);
  return (
    <Tooltip label={
      tone === 'danger' ? 'Well above scheme monitoring thresholds'
        : tone === 'warning' ? 'Approaching scheme monitoring thresholds'
          : 'Within normal range'
    }>
      <span className={`ratio ratio--${tone}`}>{value.toFixed(2)}%</span>
    </Tooltip>
  );
}

function TriageScore({ value }) {
  const tone = value >= 55 ? 'danger' : value >= 40 ? 'warning' : 'neutral';
  return (
    <Tooltip label="Triage score — alert severity, exposed value and existing chargeback ratio combined. The queue is ordered by this.">
      <span className={`triage triage--${tone}`}>{value}</span>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ *
 * Flagged tab
 * ------------------------------------------------------------------ */

function FlaggedTab() {
  const navigate = useNavigate();
  const toast = useToast();
  const legend = useAlertLegend();

  const [assignment, setAssignment] = useState('');
  const [assignTarget, setAssignTarget] = useState(null);
  const [assigned, setAssigned] = useState({});
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});
  const [tab, setTab] = useState('all');

  /* Local assignment overrides sit on top of the seeded data so the Assign
     action visibly changes the row it was invoked from. */
  /* Held in state so Hold merchant can set a status rather than announce one. */
  const store = useRecords(WORK_QUEUE, { key: 'id' });

  const base = useMemo(
    () => store.rows.map((r) => (assigned[r.id] ? { ...r, assignedUser: assigned[r.id] } : r)),
    [assigned, store.rows],
  );

  const rows = useMemo(() => {
    const byTab = base.filter((WORK_QUEUE_TABS.find((t) => t.value === tab) ?? WORK_QUEUE_TABS[0]).match);
    const byAssignment = assignment === '__none'
      ? byTab.filter((r) => !r.assignedUser)
      : assignment ? byTab.filter((r) => r.assignedUser === assignment) : byTab;
    return applyFilters(byAssignment, ADVANCED_FIELDS, applied);
  }, [base, tab, assignment, applied]);

  const tabs = WORK_QUEUE_TABS.map((t) => ({ ...t, count: base.filter(t.match).length }));

  const openTransactions = (r) => navigate(routes.workQueueMerchant(encodeURIComponent(r.mid)));

  const columns = [
    menuColumn((r) => [
      { label: 'Assign to…', icon: 'userCheck', onSelect: () => setAssignTarget(r) },
      { label: 'View transactions', icon: 'table', onSelect: () => openTransactions(r) },
      { label: 'View chargebacks', icon: 'alert', onSelect: () => navigate(routes.chargebacksAlerts) },
      {
        label: r.merchantStatus === 'Merchant On Hold' ? 'Release merchant' : 'Hold merchant',
        icon: r.merchantStatus === 'Merchant On Hold' ? 'play' : 'pause',
        tone: r.merchantStatus === 'Merchant On Hold' ? undefined : 'danger',
        onSelect: () => {
          const next = r.merchantStatus === 'Merchant On Hold' ? 'Active' : 'Merchant On Hold';
          store.update(r, { merchantStatus: next });
          toast.notify(next === 'Active' ? `${r.merchant} released from hold.` : `${r.merchant} placed on hold — settlement suspended.`);
        },
      },
    ]),
    { key: 'triageScore', header: 'Triage', fw: 6, align: 'center', sortable: true, cell: (r) => <TriageScore value={r.triageScore} />, description: 'Queue ordering — alert severity, exposed value and chargeback ratio combined' },
    {
      key: 'merchant', header: 'Merchant', fw: 18, sortable: true,
      cell: (r) => <TwoLine primary={<LinkCell onClick={() => openTransactions(r)}>{r.merchant}</LinkCell>} secondary={`MID: ${r.mid}`} />,
      text: (r) => `${r.merchant} ${r.mid}`,
    },
    { key: 'partner', header: 'Partner', fw: 13, sortable: true, cell: (r) => <TwoLine primary={r.partner} secondary={r.partnerCode} />, text: (r) => `${r.partner} ${r.partnerCode}` },
    { key: 'merchantStatus', header: 'Merchant Status', fw: 10, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.merchantStatus} /> },
    { key: 'tier', header: 'Risk', fw: 5, align: 'center', sortable: true, cell: (r) => <RiskTriangle tier={r.tier} />, text: (r) => TIER_LABEL[r.tier] ?? r.tier },
    { hiddenByDefault: true, key: 'mcc', header: 'MCC', fw: 5, align: 'center', sortable: true },
    { key: 'riskAlerts', header: 'Risk Alerts', fw: 14, align: 'center', cell: (r) => <AlertBadges codes={r.riskAlerts} max={2} />, text: (r) => r.riskAlerts.join(' '), searchable: true, description: 'Batch-level rules this merchant tripped — hover a code for its meaning' },
    { key: 'flaggedSettlement', header: 'Flagged Settlement', fw: 10, align: 'right', sortable: true, cell: (r) => <Money value={r.flaggedSettlement} />, text: (r) => moneyText(r.flaggedSettlement), totalCell: moneyTotal },
    { key: 'totalSettlement', header: 'Total Settlement', fw: 10, align: 'right', sortable: true, cell: (r) => <Money value={r.totalSettlement} />, text: (r) => moneyText(r.totalSettlement), totalCell: moneyTotal },
    { hiddenByDefault: true, key: 'txnCount', header: 'Txn', fw: 5, align: 'right', sortable: true },
    { hiddenByDefault: true, key: 'approvedAmount', header: 'Approved', fw: 8, align: 'right', sortable: true, cell: (r) => (r.approvedAmount ? <Money value={r.approvedAmount} /> : <NotApplicable />), text: (r) => moneyText(r.approvedAmount) },
    { hiddenByDefault: true, key: 'declinedAmount', header: 'Declined', fw: 8, align: 'right', sortable: true, cell: (r) => (r.declinedAmount ? <Money value={r.declinedAmount} /> : <NotApplicable />), text: (r) => moneyText(r.declinedAmount) },
    { hiddenByDefault: true, key: 'declinePercent', header: 'Decline %', fw: 7, align: 'right', sortable: true, cell: (r) => `${r.declinePercent.toFixed(2)}%` },
    { hiddenByDefault: true, key: 'totalAuth', header: 'Total Auth', fw: 9, align: 'right', sortable: true, cell: (r) => <Money value={r.totalAuth} />, text: (r) => moneyText(r.totalAuth) },
    { hiddenByDefault: true, key: 'dav', header: 'DAV', fw: 7, align: 'right', sortable: true, cell: (r) => (r.dav ? <Money value={r.dav} /> : <Muted>—</Muted>), text: (r) => moneyText(r.dav), description: 'Daily Average Volume variance against the approved limit' },
    { hiddenByDefault: true, key: 'dpv', header: 'DPV', fw: 7, align: 'right', sortable: true, cell: (r) => (r.dpv ? <Money value={r.dpv} /> : <Muted>—</Muted>), text: (r) => moneyText(r.dpv), description: 'Daily Processing Volume variance against the approved limit' },
    { key: 'mcbAmountRatio', header: 'CB Ratio (value)', fw: 8, align: 'center', sortable: true, cell: (r) => <Ratio value={r.mcbAmountRatio} />, text: (r) => `${r.mcbAmountRatio}%`, description: 'Chargeback value as a share of settled value — scheme monitoring starts near 1%' },
    { key: 'mcbCountRatio', header: 'CB Ratio (count)', fw: 8, align: 'center', sortable: true, cell: (r) => <Ratio value={r.mcbCountRatio} />, text: (r) => `${r.mcbCountRatio}%`, description: 'Chargeback count as a share of transaction count' },
    { key: 'cbAlerts', header: 'CB Alerts', fw: 9, align: 'center', cell: (r) => <AlertBadges codes={r.cbAlerts} max={2} empty={<Muted>—</Muted>} />, text: (r) => r.cbAlerts.join(' ') },
    { key: 'assignedUser', header: 'Assigned User', fw: 11, sortable: true, cell: (r) => (r.assignedUser ? r.assignedUser : <Badge tone="warning">Unassigned</Badge>), text: (r) => r.assignedUser || 'Unassigned' },
    { hiddenByDefault: true, key: 'transactionDate', header: 'Transaction Date', fw: 9, align: 'center', sortable: true },
  ];

  return (
    <>
      {legend.panel}

      <ListTable
        key={tab}
        columns={columns}
        rows={rows}
        searchPlaceholder="Search MID or merchant name"
        exportName="work-queue"
        totals={['flaggedSettlement', 'totalSettlement', 'txnCount']}
        note={`Ordered by triage score. ${rows.filter((r) => !r.assignedUser).length} of ${rows.length} unassigned.`}
        onAdvanced={() => setAdvancedOpen((v) => !v)}
        advancedOpen={advancedOpen}
        advanced={(
          <AdvancedSearchPanel
            fields={ADVANCED_FIELDS}
            values={criteria}
            onChange={setCriteria}
            onSearch={() => { setApplied(criteria); setAdvancedOpen(false); }}
            onClear={() => { setCriteria({}); setApplied({}); }}
          />
        )}
        viewTabs={tabs}
        viewTab={tab}
        onViewTabChange={setTab}
        viewTabsLabel="Queue view"
        leftExtra={(
          <label className="wq-assign">
            <span className="wq-assign__label">Assignment</span>
            <select className="field__control field__control--sm" value={assignment} onChange={(e) => setAssignment(e.target.value)}>
              {assignmentOptions(base).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
        )}
        rightExtra={legend.button}
        empty="No merchants match this view."
      />

      <AssignModal
        open={Boolean(assignTarget)}
        onClose={() => setAssignTarget(null)}
        title="Assign work item"
        subtitle={assignTarget ? `Choose who investigates ${assignTarget.merchant} (${assignTarget.mid})` : undefined}
        current={assignTarget?.assignedUser}
        rows={base}
        countOpen={(r) => r.assignedUser}
        confirmLabel="Assign to"
        onAssign={(name) => {
          setAssigned((a) => ({ ...a, [assignTarget.id]: name }));
          toast.notify(`${assignTarget.merchant} assigned to ${name}.`);
        }}
      />
    </>
  );
}

/* ------------------------------------------------------------------ *
 * Batch File Processing tab
 * ------------------------------------------------------------------ */

function BatchTab({ onViewFlagged }) {
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const store = useRecords(BATCH_FILES, { key: 'id' });

  const rows = useMemo(
    () => store.rows.filter((BATCH_FILE_TABS.find((t) => t.value === tab) ?? BATCH_FILE_TABS[0]).match),
    [tab, store.rows],
  );
  const tabs = BATCH_FILE_TABS.map((t) => ({ ...t, count: store.rows.filter(t.match).length }));

  const columns = [
    menuColumn((r) => [
      r.flaggedCount > 0 && { label: `View ${r.flaggedCount} flagged rows`, icon: 'table', onSelect: onViewFlagged },
      {
        label: 'Download source file',
        icon: 'download',
        onSelect: () => {
          downloadCsv(
            [
              { key: 'batchId', header: 'Batch ID' }, { key: 'fileName', header: 'File Name' },
              { key: 'processor', header: 'Processor' }, { key: 'startedAt', header: 'Started' },
              { key: 'txnCount', header: 'Transactions' }, { key: 'flaggedCount', header: 'Flagged' },
              { key: 'status', header: 'Status' },
            ],
            [r],
            r.fileName.replace(/\.[^.]+$/, ''),
          );
          toast.notify(`${r.fileName} downloaded.`);
        },
      },
      r.status === 'Failed' && {
        label: 'Re-run import',
        icon: 'refresh',
        /* Puts the row back to In Progress and clears its end time, so the
           grid shows the re-import the way it shows any other running one. */
        onSelect: () => {
          store.update(r, { status: 'In Progress', endedAt: '', durationMinutes: null });
          toast.notify(`${r.batchId} queued for re-import.`);
        },
      },
    ]),
    { key: 'batchId', header: 'Batch ID', fw: 10, sortable: true },
    { key: 'fileName', header: 'File Name', fw: 18, sortable: true },
    { key: 'processor', header: 'Processor', fw: 9, sortable: true },
    { key: 'startedAt', header: 'Started', fw: 12, align: 'center', sortable: true },
    { key: 'endedAt', header: 'Ended', fw: 12, align: 'center', sortable: true, cell: (r) => (r.endedAt ? r.endedAt : <Muted>running…</Muted>) },
    {
      key: 'durationMinutes', header: 'Duration', fw: 7, align: 'right', sortable: true,
      cell: (r) => (r.durationMinutes == null ? <Muted>—</Muted> : `${r.durationMinutes} min`),
      description: 'Wall-clock time the import took — the reference stores both timestamps and leaves you to subtract',
    },
    { hiddenByDefault: true, key: 'txnCount', header: 'Txn Count', fw: 8, align: 'right', sortable: true },
    { key: 'txnVolume', header: 'Txn Volume', fw: 11, align: 'right', sortable: true, cell: (r) => <Money value={r.txnVolume} />, text: (r) => moneyText(r.txnVolume), totalCell: moneyTotal },
    {
      key: 'flaggedCount', header: 'Flagged', fw: 7, align: 'center', sortable: true,
      cell: (r) => (r.flaggedCount ? <Badge tone={r.flaggedCount > 20 ? 'danger' : 'warning'}>{r.flaggedCount}</Badge> : <Muted>0</Muted>),
      description: 'Rows in this file that tripped a rule and landed in the Flagged queue',
    },
    { key: 'scopeEvaluation', header: 'Scope Evaluation', fw: 9, align: 'center', sortable: true },
    { key: 'ruleGroup', header: 'Rule Group', fw: 12, sortable: true },
    { key: 'importedFiles', header: 'Files', fw: 5, align: 'right', sortable: true },
    { key: 'status', header: 'Status', fw: 12, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <ListTable
      key={tab}
      columns={columns}
      rows={rows}
      searchPlaceholder="Search batch ID or file name"
      exportName="batch-file-processing"
      totals={['txnCount', 'txnVolume', 'flaggedCount']}
      viewTabs={tabs}
      viewTab={tab}
      onViewTabChange={setTab}
      viewTabsLabel="Batch view"
      empty="No import runs match this view."
    />
  );
}

/* ------------------------------------------------------------------ */

export function WorkQueue() {
  const [tab, setTab] = useState('flagged');

  const unassigned = WORK_QUEUE.filter((r) => !r.assignedUser).length;
  const severe = WORK_QUEUE.filter((r) => r.triageScore >= 45).length;
  const exposure = WORK_QUEUE.reduce((s, r) => s + r.flaggedSettlement, 0);
  const failures = BATCH_FILES.filter((r) => r.status === 'Failed' || r.status === 'Completed with errors').length;

  return (
    <ListPage
      title="Work Queue"
      description="Merchants whose settlement activity tripped a risk rule overnight"
      tabs={[
        { value: 'flagged', label: 'Flagged', count: WORK_QUEUE.length },
        { value: 'batch', label: 'Batch File Processing', count: BATCH_FILES.length },
      ]}
      tab={tab}
      onTabChange={setTab}
    >
      <div className="queue-kpis">
        <Kpi label="Flagged exposure" value={moneyText(exposure)} meta={`${WORK_QUEUE.length} merchants in the queue`} />
        <Kpi label="High exposure" value={severe} meta="Triage score 45 or above" invert />
        <Kpi label="Unassigned" value={unassigned} meta="No owner picked up yet" invert />
        <Kpi label="Import problems" value={failures} meta="Files failed or completed with errors" invert />
      </div>

      {/* "View flagged rows" belongs on the Flagged tab of this same page —
          it is the list those rows came from. */}
      {tab === 'flagged' ? <FlaggedTab /> : <BatchTab onViewFlagged={() => setTab('flagged')} />}
    </ListPage>
  );
}

export default WorkQueue;
