import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { Section, FieldGrid } from '@/components/fi911/DetailPage';
import { SelectField } from '@/components/ui/Form';
import { Money, Muted, StatusBadge, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import { Badge, Button, Kpi } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import { CALCULATION_RUNS, CALCULATION_TYPES, LAST_CALCULATED_MONTH } from '@/eric/data/setup';
import { setupRoutes } from '@/eric/data/navigation';
import { useToast } from '@/context/ToastContext';
import brand from '@/eric/brand.config';

/**
 * Setup > Residuals > Residual Calculation.
 *
 * Run the month, watch it land.
 *
 * The reference shows a bare percentage bar labelled "Calculation Progress…"
 * with no stage names and no estimate — a 14% that could mean four minutes or
 * forty. Here the run reports which STAGE it is in, so the number means
 * something, and the summary tab records how long each past run took, which is
 * what makes an estimate possible at all.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const opts = (list) => list.map((v) => ({ value: String(v), label: String(v) }));

const STAGES = [
  { at: 0, label: 'Loading settlement and interchange files' },
  { at: 20, label: 'Matching merchants to portfolios' },
  { at: 40, label: 'Applying pricing schedules' },
  { at: 60, label: 'Calculating agent splits' },
  { at: 80, label: 'Applying adjustments' },
  { at: 95, label: 'Writing payout records' },
];

const stageFor = (pct) => [...STAGES].reverse().find((s) => pct >= s.at) ?? STAGES[0];

function RunPanel() {
  const toast = useToast();
  const navigate = useNavigate();

  const live = CALCULATION_RUNS.find((r) => r.status === 'In Progress');
  const [progress, setProgress] = useState(live?.progress ?? 0);
  const [running, setRunning] = useState(Boolean(live));
  const [form, setForm] = useState({ processor: '', month: 'Aug', year: '2026', type: 'Full' });

  /* The bar actually moves. A progress indicator that never advances teaches
     the operator to ignore it. */
  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(id); return 100; }
        return Math.min(100, p + 2);
      });
    }, 700);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    if (progress >= 100 && running) {
      setRunning(false);
      toast.notify('Calculation complete — payouts are ready for approval.');
    }
  }, [progress, running, toast]);

  const stage = stageFor(progress);
  const avgMinutes = Math.round(
    CALCULATION_RUNS.filter((r) => r.durationMinutes).reduce((s, r) => s + r.durationMinutes, 0)
    / CALCULATION_RUNS.filter((r) => r.durationMinutes).length,
  );
  const remaining = Math.max(1, Math.round(avgMinutes * ((100 - progress) / 100)));

  return (
    <div className="fi-detail__body">
      {(running || progress > 0) && (
        <Section title="Current run" collapsible={false}>
          <div className="calc">
            <div className="calc__head">
              <span className="calc__meta">
                <strong>{live?.processor ?? (form.processor || 'All processors')}</strong>
                <span>·</span>
                <span>{form.month}-{form.year}</span>
                <span>·</span>
                <span>{form.type}</span>
              </span>
              {running
                ? <Badge tone="primary" dot>Running</Badge>
                : <Badge tone="success" dot>Complete</Badge>}
            </div>

            <div className="calc__bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <span className="calc__fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="calc__status">
              {/* The stage is what makes the percentage legible — the reference
                  shows the number alone. */}
              <span className="calc__stage">
                <Icon name={running ? 'refresh' : 'check'} size={13} className={running ? 'is-spinning' : ''} />
                {progress >= 100 ? 'Finished' : stage.label}
              </span>
              <span className="calc__pct">{progress}%</span>
              {running && (
                <Tooltip label={`Past runs of this size averaged ${avgMinutes} minutes`}>
                  <span className="calc__eta">~{remaining} min remaining</span>
                </Tooltip>
              )}
            </div>

            <div className="calc__stages">
              {STAGES.map((s) => (
                <span key={s.at} className={`calc__step ${progress > s.at ? 'is-done' : ''} ${stage.at === s.at && progress < 100 ? 'is-current' : ''}`.trim()}>
                  {s.label}
                </span>
              ))}
            </div>

            {progress >= 100 && (
              <Button variant="primary" size="sm" icon="arrowRight" onClick={() => navigate(setupRoutes.residualApproval)}>
                Review payouts for approval
              </Button>
            )}
          </div>
        </Section>
      )}

      <Section title="Start a calculation" collapsible={false}>
        <FieldGrid columns={4}>
          <SelectField
            label="Processor" required value={form.processor}
            onChange={(e) => setForm((f) => ({ ...f, processor: e.target.value }))}
            options={opts(brand.processors)} placeholder="All processors"
          />
          <SelectField
            label="Month" required value={form.month}
            onChange={(e) => setForm((f) => ({ ...f, month: e.target.value }))}
            options={opts(MONTHS)}
          />
          <SelectField
            label="Year" required value={form.year}
            onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
            options={opts([2024, 2025, 2026])}
          />
          <SelectField
            label="Calculation Type" value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            options={opts(CALCULATION_TYPES)}
          />
        </FieldGrid>

        <p className="fi-note">
          Last closed month is <strong>{LAST_CALCULATED_MONTH}</strong>. A Full run recalculates every
          portfolio; Incremental only reprocesses merchants whose settlement data changed since the
          last run.
        </p>

        <div className="fi-actions">
          <Button variant="secondary" size="sm" onClick={() => setForm({ processor: '', month: 'Aug', year: '2026', type: 'Full' })}>Clear</Button>
          <Button
            variant="primary"
            size="sm"
            icon="play"
            disabled={running}
            onClick={() => { setProgress(0); setRunning(true); toast.notify(`Calculating ${form.month}-${form.year}…`); }}
          >
            {running ? 'Running…' : 'Run calculation'}
          </Button>
        </div>
      </Section>
    </div>
  );
}

function SummaryTab() {
  const toast = useToast();

  const columns = [
    menuColumn((r) => [
      { label: 'View payouts', icon: 'table', onSelect: () => toast.notify(`${r.merchants} merchants in the ${r.residualMonth} run.`) },
      r.status === 'Failed' && { label: 'Re-run', icon: 'refresh', onSelect: () => toast.notify(`${r.residualMonth} queued for re-calculation.`) },
    ]),
    { key: 'processor', header: 'Processor', fw: 12, sortable: true },
    { key: 'residualMonth', header: 'Residual Month', fw: 9, align: 'center', sortable: true },
    { key: 'type', header: 'Type', fw: 9, align: 'center', sortable: true },
    { key: 'startedAt', header: 'Started', fw: 12, align: 'center', sortable: true },
    { key: 'endedAt', header: 'Ended', fw: 12, align: 'center', sortable: true, cell: (r) => (r.endedAt ? r.endedAt : <Muted>running…</Muted>) },
    {
      key: 'durationMinutes', header: 'Duration', fw: 7, align: 'right', sortable: true,
      cell: (r) => (r.durationMinutes == null ? <Muted>—</Muted> : `${r.durationMinutes} min`),
      description: 'How long the run took — recorded so the next run can be estimated',
    },
    { key: 'merchants', header: '# Merchants', fw: 8, align: 'right', sortable: true },
    {
      key: 'payout', header: 'Payout', fw: 11, align: 'right', sortable: true,
      cell: (r) => (r.payout ? <Money value={r.payout} /> : <Muted>—</Muted>),
      text: (r) => moneyText(r.payout), totalCell: moneyTotal,
    },
    { key: 'initiatedBy', header: 'Initiated By', fw: 12, sortable: true },
    { key: 'status', header: 'Status', fw: 9, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  const completed = CALCULATION_RUNS.filter((r) => r.status === 'Completed');
  const avg = Math.round(completed.reduce((s, r) => s + (r.durationMinutes ?? 0), 0) / (completed.length || 1));

  return (
    <>
      <div className="queue-kpis">
        <Kpi label="Runs recorded" value={CALCULATION_RUNS.length} meta="Across every processor" />
        <Kpi label="Average duration" value={`${avg} min`} meta="Completed runs only" />
        <Kpi label="Failed" value={CALCULATION_RUNS.filter((r) => r.status === 'Failed').length} meta="Needs a re-run" invert />
        <Kpi label="Total paid" value={moneyText(completed.reduce((s, r) => s + r.payout, 0))} meta="Across completed runs" />
      </div>

      <ListTable
        columns={columns}
        rows={CALCULATION_RUNS}
        searchPlaceholder="Search processor or month"
        exportName="calculation-summary"
        totals={['merchants', 'payout']}
        empty="No calculation runs recorded."
      />
    </>
  );
}

export function ResidualCalculation() {
  const [tab, setTab] = useState('run');

  return (
    <ListPage
      title="Residual Calculation"
      description="Run the month, watch it land, hand it to approval"
      tabs={[
        { value: 'run', label: 'Residual Calculation' },
        { value: 'summary', label: 'Calculation Summary', count: CALCULATION_RUNS.length },
      ]}
      tab={tab}
      onTabChange={setTab}
    >
      {tab === 'run' ? <RunPanel /> : <SummaryTab />}
    </ListPage>
  );
}

export default ResidualCalculation;
