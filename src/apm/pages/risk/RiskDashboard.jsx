import Icon from '@/components/ui/Icon';
import { Badge, Card, PageHeader } from '@/components/ui/Surface';
import { BarChart, BarRows, Donut } from '@/components/charts/Charts';
import {
  FLAGGED_TREND, PARSED_FILES, PARSE_STATS, RISK_DISTRIBUTION, RISK_KPIS,
  TOP_FLAGGED_VOLUME, TOP_VULNERABILITY,
} from '@/apm/data/risk';
import { formatCompactCurrency, formatNumber } from '@/utils/format';

/**
 * Risk Operations dashboard.
 *
 * Four bands, each answering a different question: how is the portfolio doing
 * (snapshot), which way is it moving (trends), who is causing it (exposure),
 * and is the data even landing (ingestion).
 *
 * Ingestion Activity is last but it is the one that invalidates the rest — if
 * the KYC extract failed, the "KYC Pending Reviews" tile above is stale. It
 * earns its place on the page for that reason rather than as a filler panel.
 */

const RANGE = '2026/07/21 - 2026/08/20';

function DateChip({ range = RANGE }) {
  return (
    <span className="date-chip">
      <Icon name="calendarRange" size={13} /> {range}
    </span>
  );
}

function KpiCard({ kpi }) {
  return (
    <section className="risk-kpi">
      <header className="risk-kpi__head">
        <h3 className="risk-kpi__label">{kpi.label}</h3>
        <span className={`risk-kpi__icon risk-kpi__icon--${kpi.tone}`}><Icon name={kpi.icon} size={16} /></span>
      </header>
      <p className="risk-kpi__value">{kpi.value}</p>
      <p className="risk-kpi__hint">{kpi.hint}</p>
    </section>
  );
}

export function RiskDashboard() {
  return (
    <>
      <PageHeader
        title="Risk Operations Snapshot"
        description="Daily posture indicators for merchant exposure, review backlog, and live alert pressure."
      />

      <div className="risk-kpis">
        {RISK_KPIS.map((k) => <KpiCard key={k.id} kpi={k} />)}
      </div>

      <section className="dash-band">
        <h2 className="dash-band__title">Monitoring Trends</h2>
        <p className="dash-band__desc">Distribution of active risk severity and flagged case volume over the selected review window.</p>
        <div className="dash-grid dash-grid--2">
          <Card title="Risk Distribution" action={<DateChip />}>
            <div className="risk-dist">
              <div className="risk-dist__legend">
                {RISK_DISTRIBUTION.map((d) => (
                  <div key={d.id} className="risk-dist__item">
                    <span className="risk-dist__label">{d.label}</span>
                    <span className="risk-dist__value">
                      <span className="risk-dist__dot" style={{ background: d.color }} /> {d.value}%
                    </span>
                  </div>
                ))}
              </div>
              <Donut
                data={RISK_DISTRIBUTION.map((d) => ({ label: d.label, value: d.value, color: d.color }))}
                size={190}
                thickness={44}
                legend={false}
                formatValue={(v) => `${v}%`}
              />
            </div>
          </Card>

          <Card title="Total Flagged Cases" action={<DateChip />}>
            <p className="dash-figure">{FLAGGED_TREND[FLAGGED_TREND.length - 1].value}</p>
            <p className="dash-figure__hint">Most recent period in the selected review window</p>
            <BarChart
              data={FLAGGED_TREND}
              xKey="label"
              series={[{ key: 'value', label: 'Flagged cases', color: 'var(--c-series-0)' }]}
              height={220}
              legend={false}
            />
          </Card>
        </div>
      </section>

      <section className="dash-band">
        <h2 className="dash-band__title">Merchant Exposure</h2>
        <p className="dash-band__desc">Highest-volume merchants under review and the accounts carrying the sharpest vulnerability scores.</p>
        <div className="dash-grid dash-grid--2">
          <Card title="Top Flagged High-Volume Merchants" action={<DateChip />}>
            <BarRows
              rows={TOP_FLAGGED_VOLUME.map((r) => ({ ...r, color: 'var(--c-series-3)' }))}
              formatValue={(v) => formatCompactCurrency(v)}
            />
          </Card>

          <Card title="Top Vulnerability Merchants" action={<DateChip />}>
            <BarRows
              rows={TOP_VULNERABILITY.map((r) => ({ ...r, color: 'var(--c-series-2)' }))}
              formatValue={(v) => formatNumber(v)}
            />
          </Card>
        </div>
      </section>

      <section className="dash-band">
        <h2 className="dash-band__title">Ingestion Activity</h2>
        <p className="dash-band__desc">Recent risk file processing with outcome status, throughput, and record volume.</p>
        <Card title="File Parsed Records">
          <div className="parse-layout">
            <div className="parse-stats">
              {PARSE_STATS.map((s) => (
                <div key={s.label} className="parse-stat">
                  <span className="parse-stat__label">{s.label}</span>
                  <span className="parse-stat__value">{formatNumber(s.value)}</span>
                </div>
              ))}
            </div>

            <table className="fi-mini-table parse-files">
              <thead>
                <tr><th>File</th><th>Status</th><th>Parsed On</th><th style={{ textAlign: 'right' }}>Records</th></tr>
              </thead>
              <tbody>
                {PARSED_FILES.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <span className="row row--tight row--nowrap">
                        <Icon name="file" size={15} className="subtle" />
                        <span className="cell-2l">
                          <span className="cell-2l__main">{f.name}</span>
                          <span className="cell-2l__sub">{f.size}</span>
                        </span>
                      </span>
                    </td>
                    <td>
                      <Badge tone={f.status === 'Success' ? 'success' : 'danger'} dot>{f.status}</Badge>
                    </td>
                    <td>
                      <span className="row row--tight row--nowrap subtle">
                        <Icon name="clock" size={13} /> {f.parsed}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>{formatNumber(f.records)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </>
  );
}

export default RiskDashboard;
