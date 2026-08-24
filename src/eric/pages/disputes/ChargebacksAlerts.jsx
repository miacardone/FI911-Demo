import { useMemo, useState } from 'react';
import Icon from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Surface';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { CardBrand, LinkCell, Money, Muted, TwoLine, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import {
  ALERTS, ALERT_OUTCOME_META, ALERT_SOURCE_OPTIONS, alertImpact, alertOutcome,
} from '@/eric/data/reports';
import { routes } from '@/eric/data/navigation';
import { useToast } from '@/context/ToastContext';
import { formatCurrency, formatPercent } from '@/utils/format';
import brand from '@/eric/brand.config';

/**
 * Chargebacks & Alerts.
 *
 * Pre-dispute alerts (Ethoca / Verifi) sit next to the chargebacks they could
 * have prevented. The point of the screen is the money NOT lost, so the page
 * leads with prevented-versus-missed rather than a bare list — a list of
 * alerts with no outcome tells you nothing about whether the channel is worth
 * paying for.
 *
 * Rows are ordered by deadline, because an alert is only useful before it
 * expires; a row already past its window is dead weight at the top of a
 * date-sorted list.
 */

const ADVANCED_FIELDS = [
  { name: 'alertId', label: 'Alert ID' },
  { name: 'merchant', label: 'Merchant' },
  { name: 'mid', label: 'MID' },
  { name: 'source', label: 'Source', type: 'select', options: ALERT_SOURCE_OPTIONS.map((s) => ({ value: s, label: s })) },
  { name: 'reason', label: 'Reason' },
  { name: 'outcome', label: 'Outcome', type: 'select', options: ALERT_OUTCOME_META.map((o) => ({ value: o.id, label: o.label })) },
  { name: 'actionedBy', label: 'Actioned By' },
  { name: 'processor', label: 'Processor', type: 'select', options: brand.processors.map((p) => ({ value: p, label: p })) },
  { name: 'received', label: 'Received', type: 'date' },
];

const TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'pending', label: 'Awaiting Action', tone: 'danger', match: (r) => r.outcome === 'pending' },
  { value: 'saved', label: 'Prevented', match: (r) => r.outcome === 'refunded' || r.outcome === 'prevented' },
  { value: 'missed', label: 'Became Chargeback', match: (r) => r.outcome === 'too_late' },
  { value: 'declined', label: 'Declined', match: (r) => r.outcome === 'declined' },
];

function Impact({ stats }) {
  const tiles = [
    { label: 'Loss prevented', value: formatCurrency(stats.prevented), meta: `${stats.preventedCount} alerts actioned in time`, tone: 'success' },
    { label: 'Became chargebacks', value: formatCurrency(stats.missed), meta: `${stats.missedCount} alerts missed their window`, tone: 'danger' },
    { label: 'Still open', value: formatCurrency(stats.pending), meta: `${stats.pendingCount} awaiting action`, tone: 'warning' },
    { label: 'Prevention rate', value: formatPercent(stats.rate, 1), meta: 'Of alerts that reached an outcome', tone: 'neutral' },
  ];

  return (
    <div className="dash-grid dash-grid--4 alert-impact">
      {tiles.map((t) => (
        <section key={t.label} className={`impact-tile impact-tile--${t.tone}`}>
          <span className="impact-tile__label">{t.label}</span>
          <span className="impact-tile__value">{t.value}</span>
          <span className="impact-tile__meta">{t.meta}</span>
        </section>
      ))}
    </div>
  );
}

export function ChargebacksAlerts() {
  const toast = useToast();
  const [rows, setRows] = useState(ALERTS);
  const [tab, setTab] = useState('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});

  const tabs = useMemo(() => TABS.map((t) => ({ ...t, count: rows.filter(t.match).length })), [rows]);

  const visible = useMemo(() => {
    const spec = TABS.find((t) => t.value === tab) ?? TABS[0];
    /* Soonest deadline first — an alert is only actionable before it expires. */
    return applyFilters(rows.filter(spec.match), ADVANCED_FIELDS, applied)
      .slice()
      .sort((a, b) => a.deadline.localeCompare(b.deadline));
  }, [rows, tab, applied]);

  const stats = useMemo(() => alertImpact(visible), [visible]);

  const resolve = (row, outcome) => {
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, outcome, actionedBy: 'Mia Cardone' } : r)));
    toast.notify(`${row.alertId} marked ${alertOutcome(outcome).label.toLowerCase()}.`);
  };

  const columns = [
    { key: 'alertId', header: 'Alert ID', fw: 9, sortable: true },
    {
      key: 'merchant', header: 'Merchant', fw: 15, sortable: true,
      cell: (r) => <TwoLine primary={r.merchant} secondary={`MID: ${r.mid}`} />,
      text: (r) => `${r.merchant} ${r.mid}`,
    },
    { key: 'source', header: 'Source', fw: 9, sortable: true, description: 'Alert network that raised this warning' },
    { key: 'scheme', header: 'Card', fw: 9, sortable: true, cell: (r) => <CardBrand scheme={r.scheme} />, text: (r) => r.scheme },
    { key: 'cardLast4', header: 'Card Last 4', fw: 7 },
    { key: 'reason', header: 'Reason', fw: 12, sortable: true },
    {
      key: 'amount', header: 'Amount', fw: 9, align: 'right', sortable: true,
      sortValue: (r) => r.amount, text: (r) => moneyText(r.amount), cell: (r) => <Money value={r.amount} />, totalCell: moneyTotal,
    },
    { key: 'received', header: 'Received', fw: 9, sortable: true },
    {
      key: 'deadline', header: 'Action By', fw: 9, sortable: true,
      description: 'Alerts expire — after this date the chargeback can no longer be prevented',
      cell: (r) => (r.outcome === 'pending'
        ? <span className="money--neg" style={{ fontWeight: 700 }}>{r.deadline}</span>
        : r.deadline),
    },
    {
      key: 'outcome', header: 'Outcome', fw: 13, sortable: true,
      cell: (r) => <Badge tone={alertOutcome(r.outcome).tone}>{alertOutcome(r.outcome).label}</Badge>,
      text: (r) => alertOutcome(r.outcome).label,
    },
    {
      key: 'caseNumber', header: 'Chargeback', fw: 10, sortable: true,
      description: 'The chargeback this alert turned into, where it was not prevented',
      cell: (r) => (r.caseNumber
        ? <LinkCell to={routes.disputeDetail(r.caseNumber)}>{r.caseNumber}</LinkCell>
        : <Muted>—</Muted>),
    },
    { key: 'actionedBy', header: 'Actioned By', fw: 11, sortable: true, cell: (r) => (r.actionedBy ? r.actionedBy : <Muted>—</Muted>) },
    menuColumn((row) => [
      row.outcome === 'pending' && { label: 'Refund now', icon: 'check', onSelect: () => resolve(row, 'refunded') },
      row.outcome === 'pending' && { label: 'Decline refund', icon: 'ban', onSelect: () => resolve(row, 'declined') },
      row.caseNumber && { label: 'Open chargeback', icon: 'eye', onSelect: () => toast.notify(`Case ${row.caseNumber}`) },
      { label: 'Notes', icon: 'message', onSelect: () => toast.notify('Notes') },
    ].filter(Boolean)),
  ];

  return (
    <ListPage
      title="Chargebacks & Alerts"
      description="Pre-dispute alerts and the chargebacks they did — or did not — prevent"
      tabs={tabs}
      tab={tab}
      onTabChange={setTab}
    >
      <Impact stats={stats} />

      <div className="fi-panel" style={{ marginTop: 'var(--s-3)' }}>
        <ListTable
          key={tab}
          columns={columns}
          rows={visible}
          searchPlaceholder="Search alerts"
          exportName="chargebacks-alerts"
          totals={['amount']}
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
          empty="No alerts match these criteria."
        />
      </div>
    </ListPage>
  );
}

export default ChargebacksAlerts;
