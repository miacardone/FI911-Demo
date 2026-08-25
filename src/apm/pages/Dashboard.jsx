import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import { Card, PageHeader } from '@/components/ui/Surface';
import ChartCard from '@/components/charts/ChartCard';
import { AreaChart, BarChart, BarRows, Donut, LineChart } from '@/components/charts/Charts';
import {
  ACTIVE_PSPS, CLAIM_KPIS, CLAIM_TURNOVER, DAILY_AMOUNT_SPARK, DAILY_TRANSACTION_AMOUNT,
  DISPUTE_FUNDING, DISPUTE_FUNDING_SERIES, ERT_ACTIVE, ERT_SERIES, ERT_TREND, FUNNEL_SERIES,
  LAST_CALCULATED, ONBOARDING_STAGES, OUTSTANDING_REIMBURSABLE, PROCESSED_SPARK, RANGES,
  REASON_SPLIT, REIMBURSABLE_SPARK, SPLIT_SERIES, STATUS_DONUTS, TOP_SORT_CODE_SPLIT,
  TRANSACTIONS_PROCESSED, YOY_DATA, YOY_SERIES, activePspSeries, financialSplitSeries,
} from '@/apm/data/dashboard';
import { routes } from '@/apm/data/navigation';
import { formatCompactCurrency, formatCurrency, formatNumber } from '@/utils/format';

/**
 * Operator Summary — the landing dashboard.
 *
 * Four bands: the participant funnel, throughput, the dispute book, and the
 * money split. Each band opens with a title and one line of orientation,
 * because a wall of twelve charts with no narration is a screenshot, not a
 * dashboard.
 *
 * The range toggle is wired rather than decorative: switching MTD/QTD/YTD/L12M
 * re-reads the series at the matching granularity (see data/dashboard.js).
 * The list icon on a card is a placeholder for the table view of the same
 * figures, which the reference offers on the charts that carry one.
 */

function RangeToggle({ value, onChange }) {
  return (
    <div className="range-toggle" role="group" aria-label="Date range">
      {RANGES.map((r) => (
        <button
          key={r.id}
          type="button"
          className={`range-toggle__btn ${value === r.id ? 'is-active' : ''}`.trim()}
          onClick={() => onChange(r.id)}
          aria-pressed={value === r.id}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}

/* The list icon that used to live here is now owned by ChartCard, which
   actually swaps the chart for its figures. */
function CardTools({ range, onRange }) {
  if (!range) return null;
  return <RangeToggle value={range} onChange={onRange} />;
}

const gbp = (v) => formatCurrency(v);
const num = (v) => formatNumber(v);
const pct = (v) => `${v}%`;

/** A figure with a sparkline underneath — the Transaction / Claim tiles. */
function SparkTile({ title, value, count, spark, meta, formatter = formatCurrency }) {
  return (
    <Card title={title}>
      <div className="spark-tile__head">
        <span className="spark-tile__value">{formatter(value)}</span>
        {count != null && <span className="spark-tile__count">Count: {formatNumber(count)}</span>}
        {meta && <span className="spark-tile__meta">{meta}</span>}
      </div>
      <AreaChart data={spark} height={110} formatValue={formatter} />
    </Card>
  );
}

export function Dashboard() {
  const [pspRange, setPspRange] = useState('ytd');
  const [funnelRange, setFunnelRange] = useState('ytd');
  const [splitRange, setSplitRange] = useState('ytd');

  const pspSeries = useMemo(() => activePspSeries(pspRange), [pspRange]);
  const splitSeries = useMemo(() => financialSplitSeries(splitRange), [splitRange]);

  return (
    <>
      <PageHeader
        title="Operator Summary"
        description="Active PSP growth, onboarding volume, and current status mix."
      />

      {/* ---------- Band 1: the participant funnel ---------- */}
      <section className="dash-band">
        <div className="dash-grid dash-grid--2">
          <ChartCard
            title="Active PSPs"
            action={<CardTools range={pspRange} onRange={setPspRange} />}
            table={{ columns: [{ key: 'period', label: 'Date' }, { key: 'value', label: 'Active PSPs', format: num }], rows: pspSeries }}
          >
            <div className="spark-tile__head">
              <span className="dash-figure">{formatNumber(ACTIVE_PSPS)}</span>
              <span className="spark-tile__meta">(Last calculated on {LAST_CALCULATED})</span>
            </div>
            <AreaChart data={pspSeries} height={190} formatValue={formatNumber} />
          </ChartCard>

          <ChartCard
            title="PSP Onboarding Summary"
            action={<CardTools range={funnelRange} onRange={setFunnelRange} />}
            table={{
              columns: [{ key: 'period', label: 'Stage' }, ...FUNNEL_SERIES.map((x) => ({ key: x.key, label: x.label, format: num }))],
              rows: ONBOARDING_STAGES,
            }}
          >
            <BarChart data={ONBOARDING_STAGES} series={FUNNEL_SERIES} height={250} grouped formatValue={formatNumber} />
          </ChartCard>
        </div>

        <div className="dash-grid dash-grid--5" style={{ marginTop: 'var(--s-4)' }}>
          {STATUS_DONUTS.map((d) => (
            <Card key={d.id} title={d.title}>
              <Donut data={d.data} size={150} thickness={38} arcLabels formatValue={(v) => `${v}%`} />
            </Card>
          ))}
        </div>
      </section>

      {/* ---------- Band 2: throughput ---------- */}
      <section className="dash-band">
        <h2 className="dash-band__title">Transaction Summary</h2>
        <p className="dash-band__desc">Daily throughput and the year-to-date distribution behind it.</p>

        <div className="dash-grid dash-grid--3">
          <SparkTile title="Daily Transaction Amount" value={DAILY_TRANSACTION_AMOUNT} spark={DAILY_AMOUNT_SPARK} formatter={formatCurrency} />
          <SparkTile title="Transactions Processed" value={TRANSACTIONS_PROCESSED} spark={PROCESSED_SPARK} formatter={(v) => `Count: ${formatNumber(v)}`} />
          <SparkTile
            title="Outstanding Reimbursable Funds"
            value={OUTSTANDING_REIMBURSABLE}
            spark={REIMBURSABLE_SPARK}
            meta={`(Last calculated on ${LAST_CALCULATED})`}
          />
        </div>

        <div className="dash-grid dash-grid--2" style={{ marginTop: 'var(--s-4)' }}>
          <ChartCard
            title="Transactions YTD & YOY"
            table={{
              columns: [{ key: 'period', label: 'Months' }, ...YOY_SERIES.map((x) => ({ key: x.key, label: x.label, format: gbp }))],
              rows: YOY_DATA,
              height: 280,
            }}
          >
            <BarChart data={YOY_DATA} series={YOY_SERIES} height={280} grouped formatValue={formatCompactCurrency} />
          </ChartCard>
          <ChartCard
            title="Transactions by Top Five Sort Codes"
            table={{ columns: [{ key: 'label', label: 'Sort Code' }, { key: 'value', label: 'Share', format: pct }], rows: TOP_SORT_CODE_SPLIT }}
          >
            <Donut data={TOP_SORT_CODE_SPLIT} size={230} thickness={58} arcLabels formatValue={(v) => `${v}%`} />
          </ChartCard>
        </div>
      </section>

      {/* ---------- Band 3: the dispute book ---------- */}
      <section className="dash-band">
        <h2 className="dash-band__title">Dispute Claims Summary</h2>
        <p className="dash-band__desc">Current dispute totals, review states, and underlying reason/funding mix.</p>

        <div className="dash-grid dash-grid--3">
          {CLAIM_KPIS.map((k) => (
            <SparkTile key={k.id} title={k.title} value={k.value} count={k.count} spark={k.spark} />
          ))}
        </div>

        <div className="dash-grid dash-grid--2" style={{ marginTop: 'var(--s-4)' }}>
          <ChartCard
            title="Dispute Claims by Reason Category"
            table={{ columns: [{ key: 'label', label: 'Reason' }, { key: 'value', label: 'Share', format: pct }], rows: REASON_SPLIT }}
          >
            <Donut data={REASON_SPLIT} size={220} thickness={56} arcLabels formatValue={(v) => `${v}%`} />
          </ChartCard>
          <ChartCard
            title="Dispute Funding by Sending and Receiving PSP"
            action={<span className="date-chip">Last 6 Months</span>}
            table={{
              columns: [{ key: 'period', label: 'Month' }, ...DISPUTE_FUNDING_SERIES.map((x) => ({ key: x.key, label: x.label, format: gbp }))],
              rows: DISPUTE_FUNDING,
            }}
          >
            <BarChart data={DISPUTE_FUNDING} series={DISPUTE_FUNDING_SERIES} height={260} grouped formatValue={formatCompactCurrency} />
          </ChartCard>
        </div>
      </section>

      {/* ---------- Band 4: money split ---------- */}
      <section className="dash-band">
        <h2 className="dash-band__title">Financial Split and Claims</h2>
        <p className="dash-band__desc">Settlement split, PSP turnover, and ERT escalation visibility.</p>

        <div className="dash-grid dash-grid--2">
          <ChartCard
            title="Financial Split Summary"
            action={<CardTools range={splitRange} onRange={setSplitRange} />}
            table={{
              columns: [{ key: 'period', label: 'Date' }, ...SPLIT_SERIES.map((x) => ({ key: x.key, label: x.label, format: gbp }))],
              rows: splitSeries,
            }}
          >
            <LineChart data={splitSeries} series={SPLIT_SERIES} height={250} formatValue={formatNumber} />
          </ChartCard>

          <ChartCard
            title="Claim Turnover - PSP"
            action={<span className="date-chip">Last calculated on {LAST_CALCULATED}</span>}
            table={{ columns: [{ key: 'label', label: 'PSP' }, { key: 'value', label: 'Turnover', format: gbp }], rows: CLAIM_TURNOVER }}
          >
            <BarRows rows={CLAIM_TURNOVER.map((r) => ({ ...r, color: 'var(--c-series-0)' }))} formatValue={formatCompactCurrency} />
          </ChartCard>
        </div>

        <div style={{ marginTop: 'var(--s-4)' }}>
          <ChartCard
            title="ERT Notifications by Type"
            description="Created notifications by type, last 12 months"
            action={<Link to={routes.ert} className="cell-link">{ERT_ACTIVE} Active</Link>}
            table={{
              columns: [{ key: 'period', label: 'Month' }, ...ERT_SERIES.map((x) => ({ key: x.key, label: x.label, format: num }))],
              rows: ERT_TREND,
              height: 300,
            }}
          >
            <p className="dash-figure__hint">Created notifications by type, last 12 months</p>
            <LineChart data={ERT_TREND} series={ERT_SERIES} height={260} formatValue={formatNumber} />
          </ChartCard>
        </div>
      </section>
    </>
  );
}

export default Dashboard;
