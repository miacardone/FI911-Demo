import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { CardBrand, Money, Muted, TwoLine, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import { AlertBadges, useAlertLegend } from '@/components/fi911/AlertCodes';
import { Badge, Kpi } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import { UNACTIONED, UNACTIONED_SLA_DAYS, UNACTIONED_TABS, unactionedSummary } from '@/apm/data/riskQueue';
import { routes } from '@/apm/data/navigation';
import { useToast } from '@/context/ToastContext';
import { useRecords } from '@/hooks/useRecords';
import brand from '@/apm/brand.config';

/**
 * RISK > UNACTIONED QUEUE.
 *
 * Transactions that raised an alert and were never decided.
 *
 * The reference prints an Alert Date and a Transaction Date and stops, which
 * makes the screen a list of things rather than a backlog. The whole point of
 * this queue is AGE, so the age is computed, the SLA breach is explicit, and
 * the oldest item leads. The impact strip says how much money is sitting
 * undecided — the number that decides whether anyone needs to work late.
 */

const ADVANCED_FIELDS = [
  { name: 'transactionId', label: 'Transaction ID' },
  { name: 'mid', label: 'MID' },
  { name: 'merchant', label: 'Merchant Name' },
  { name: 'processor', label: 'Processor', type: 'select', options: brand.processors.map((p) => ({ value: p, label: p })) },
  { name: 'alertDate', label: 'Alert Date', type: 'date' },
  { name: 'transactionDate', label: 'Transaction Date', type: 'date' },
];

function Age({ days, breached }) {
  const tone = breached ? 'danger' : days === UNACTIONED_SLA_DAYS ? 'warning' : 'neutral';
  return (
    <Tooltip label={
      breached ? `${days - UNACTIONED_SLA_DAYS} day${days - UNACTIONED_SLA_DAYS === 1 ? '' : 's'} past the ${UNACTIONED_SLA_DAYS}-day review window`
        : tone === 'warning' ? 'Last day inside the review window'
          : `${UNACTIONED_SLA_DAYS - days} day${UNACTIONED_SLA_DAYS - days === 1 ? '' : 's'} left to decide`
    }>
      <span className={`age age--${tone}`}>{days}d</span>
    </Tooltip>
  );
}

export function UnactionedQueue() {
  const navigate = useNavigate();
  const toast = useToast();
  const legend = useAlertLegend();
  const [tab, setTab] = useState('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});

  /* Held in state so Release and Decline can actually settle a row — read
     straight off the const they could only ever announce themselves. */
  const store = useRecords(UNACTIONED, { key: 'id' });

  const rows = useMemo(
    () => applyFilters(
      store.rows.filter((UNACTIONED_TABS.find((t) => t.value === tab) ?? UNACTIONED_TABS[0]).match),
      ADVANCED_FIELDS,
      applied,
    ),
    [tab, applied, store.rows],
  );

  const tabs = UNACTIONED_TABS.map((t) => ({ ...t, count: store.rows.filter(t.match).length }));
  const s = unactionedSummary(store.rows);

  const columns = [
    menuColumn((r) => [
      {
        label: 'Release transaction',
        icon: 'check',
        onSelect: () => {
          store.update(r, { actionStatus: 'Released', daysUnactioned: 0, breached: false });
          toast.notify(`${r.transactionId} released.`);
        },
      },
      {
        label: 'Decline transaction',
        icon: 'ban',
        tone: 'danger',
        onSelect: () => {
          store.update(r, { actionStatus: 'Declined', daysUnactioned: 0, breached: false });
          toast.notify(`${r.transactionId} declined.`);
        },
      },
      { label: 'Open merchant queue', icon: 'table', onSelect: () => navigate(routes.workQueue) },
    ]),
    {
      key: 'daysUnactioned', header: 'Age', fw: 5, align: 'center', sortable: true,
      cell: (r) => <Age days={r.daysUnactioned} breached={r.breached} />,
      text: (r) => `${r.daysUnactioned}d`,
      description: `Days since the alert fired. The review window is ${UNACTIONED_SLA_DAYS} days.`,
    },
    { key: 'transactionId', header: 'Transaction ID', fw: 12, sortable: true },
    {
      key: 'merchant', header: 'Merchant', fw: 16, sortable: true,
      cell: (r) => <TwoLine primary={r.merchant} secondary={`MID: ${r.mid}`} />,
      text: (r) => `${r.merchant} ${r.mid}`,
    },
    { key: 'amount', header: 'Amount', fw: 8, align: 'right', sortable: true, cell: (r) => <Money value={r.amount} />, text: (r) => moneyText(r.amount), totalCell: moneyTotal },
    { key: 'batchAlerts', header: 'Batch Alert', fw: 10, align: 'center', cell: (r) => <AlertBadges codes={r.batchAlerts} max={2} empty={<Muted>—</Muted>} />, text: (r) => r.batchAlerts.join(' ') },
    { key: 'transAlerts', header: 'Trans Alert', fw: 10, align: 'center', cell: (r) => <AlertBadges codes={r.transAlerts} max={2} empty={<Muted>—</Muted>} />, text: (r) => r.transAlerts.join(' ') },
    { key: 'entryMode', header: 'POS Entry Mode', fw: 9, align: 'center', sortable: true },
    { key: 'transactionType', header: 'Transaction Type', fw: 8, align: 'center', sortable: true },
    { key: 'cardNumber', header: 'Card Number', fw: 11, align: 'center' },
    { key: 'scheme', header: 'Card Type', fw: 8, align: 'center', sortable: true, cell: (r) => <CardBrand scheme={r.scheme} />, text: (r) => r.scheme },
    { key: 'alertDate', header: 'Alert Date', fw: 8, align: 'center', sortable: true },
    { key: 'transactionDate', header: 'Transaction Date', fw: 9, align: 'center', sortable: true },
    { key: 'processor', header: 'Processor', fw: 8, align: 'center', sortable: true },
  ];

  return (
    <ListPage
      title="Unactioned Queue"
      description="Alerts raised and never decided — oldest first"
      tabs={tabs}
      tab={tab}
      onTabChange={setTab}
      headerActions={s.breached > 0 ? <Badge tone="danger" dot>{s.breached} past SLA</Badge> : <Badge tone="success" dot>Nothing past SLA</Badge>}
    >
      <div className="queue-kpis">
        <Kpi label="Undecided value" value={moneyText(s.exposure)} meta={`${s.total} transactions awaiting a decision`} invert />
        <Kpi label="Past SLA" value={s.breached} meta={`Older than ${UNACTIONED_SLA_DAYS} days`} invert />
        <Kpi label="Value past SLA" value={moneyText(s.breachedExposure)} meta="Held beyond the review window" invert />
        <Kpi label="Oldest item" value={`${s.oldest} days`} meta="Longest an alert has sat unactioned" invert />
      </div>

      {legend.panel}

      <ListTable
        key={tab}
        columns={columns}
        rows={rows}
        searchPlaceholder="Search MID or merchant name"
        exportName="unactioned-queue"
        totals={['amount']}
        note="Ordered by age. Anything red is past the review window."
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
        rightExtra={legend.button}
        empty="Nothing outstanding in this view."
      />
    </ListPage>
  );
}

export default UnactionedQueue;
