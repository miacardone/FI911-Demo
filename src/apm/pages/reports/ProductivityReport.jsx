import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Surface';
import { BarRows } from '@/components/charts/Charts';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { Money, Muted, StatusBadge, TwoLine, moneyText } from '@/components/fi911/cells';
import {
  PRODUCTIVITY, PRODUCTIVITY_SOURCES, PRODUCTIVITY_STATUSES, dwellByStage,
} from '@/apm/data/reports';
import brand from '@/apm/brand.config';

/**
 * Productivity Report — who moved what, and how long it sat first.
 *
 * The live product lists status changes. That answers "what happened" but not
 * "where are we slow", which is the question a productivity report exists to
 * answer. Each row therefore records the status it moved FROM and the days it
 * dwelled there, and the page opens with average dwell per stage — so the
 * bottleneck is visible before you read a single row.
 */

const ADVANCED_FIELDS = [
  { name: 'dbaName', label: 'DBA Name' },
  { name: 'mid', label: 'MID' },
  { name: 'businessType', label: 'Business Type' },
  { name: 'processor', label: 'Processor', type: 'select', options: brand.processors.map((p) => ({ value: p, label: p })) },
  { name: 'agent', label: 'Agent' },
  { name: 'changedBy', label: 'Status Changed By' },
  { name: 'source', label: 'Source', type: 'select', options: PRODUCTIVITY_SOURCES.map((s) => ({ value: s, label: s })) },
  { name: 'status', label: 'Status', type: 'select', options: PRODUCTIVITY_STATUSES.map((s) => ({ value: s, label: s })) },
  { name: 'openDate', label: 'Open Date', type: 'date' },
];

export function ProductivityReport() {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});

  const rows = useMemo(() => applyFilters(PRODUCTIVITY, ADVANCED_FIELDS, applied), [applied]);
  const dwell = useMemo(() => dwellByStage(rows), [rows]);

  const slowest = dwell.length ? dwell.reduce((a, b) => (b.value > a.value ? b : a)) : null;

  const columns = [
    {
      key: 'dbaName', header: 'DBA Name', fw: 16, sortable: true,
      cell: (r) => <TwoLine primary={r.dbaName} secondary={r.mid ? `MID: ${r.mid}` : ''} />,
      text: (r) => `${r.dbaName} ${r.mid}`,
    },
    { key: 'businessType', header: 'Business Type', fw: 9, sortable: true, cell: (r) => (r.businessType ? r.businessType : <Muted>—</Muted>) },
    { key: 'processor', header: 'Processor', fw: 9, sortable: true, cell: (r) => (r.processor ? r.processor : <Muted>—</Muted>) },
    { key: 'agent', header: 'Agent', fw: 11, sortable: true },
    {
      key: 'monthlyVolume', header: 'Monthly Volume', fw: 10, align: 'right', sortable: true,
      sortValue: (r) => r.monthlyVolume, text: (r) => moneyText(r.monthlyVolume),
      cell: (r) => <Money value={r.monthlyVolume} muteZero />,
    },
    {
      key: 'openDate', header: 'Open Date', fw: 10, sortable: true,
      cell: (r) => <TwoLine primary={r.openDate} secondary={r.openTime} />,
      text: (r) => `${r.openDate} ${r.openTime}`,
    },
    { key: 'closeDate', header: 'Close Date', fw: 9, sortable: true, cell: (r) => (r.closeDate ? r.closeDate : <Muted>—</Muted>) },
    { key: 'changedBy', header: 'Status Changed By', fw: 12, sortable: true },
    { key: 'source', header: 'Source', fw: 8, sortable: true },
    {
      key: 'fromStatus', header: 'Moved From', fw: 11, sortable: true,
      cell: (r) => (r.fromStatus ? <StatusBadge value={r.fromStatus} /> : <Muted>Created</Muted>),
      text: (r) => r.fromStatus || 'Created',
    },
    { key: 'status', header: 'Status', fw: 12, sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
    {
      key: 'dwellDays', header: 'Days in Prior Stage', fw: 8, align: 'right', sortable: true,
      description: 'How long the merchant sat in the previous status before this change',
      cell: (r) => <span className={r.dwellDays >= 7 ? 'money--neg' : undefined}>{r.dwellDays}d</span>,
    },
  ];

  return (
    <ListPage
      title="Productivity Report"
      description="Status changes across the funnel, with the time spent at each stage"
      scope={[
        { label: 'Status changes', value: `${rows.length}` },
        slowest && { label: 'Slowest stage', value: `${slowest.label} — ${slowest.value}d avg` },
      ].filter(Boolean)}
    >
      <Card title="Average days spent in each stage" description="Derived from the rows currently in scope">
        <BarRows
          rows={dwell.map((d) => ({
            label: d.label,
            value: d.value,
            meta: `${d.count} change${d.count === 1 ? '' : 's'}`,
            color: d.value >= 6 ? 'var(--c-series-contrast)' : 'var(--c-series-0)',
          }))}
          formatValue={(v) => `${v}d`}
        />
      </Card>

      <div className="fi-panel" style={{ marginTop: 'var(--s-3)' }}>
        <ListTable
          columns={columns}
          rows={rows}
          searchPlaceholder="Search records"
          exportName="productivity-report"
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
          empty="No status changes match these criteria."
        />
      </div>
    </ListPage>
  );
}

export default ProductivityReport;
