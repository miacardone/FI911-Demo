import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ListTable } from '@/components/fi911/ListPage';
import { Badge, Button, Card, Kpi, PageHeader, Tabs } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import { LineChart } from '@/components/charts/Charts';
import {
  LinkCell, Money, Muted, RiskBadge, StatusBadge, SummaryRow,
  menuColumn, moneyText, moneyTotal,
} from '@/components/fi911/cells';
import { AlertBadges, useAlertLegend } from '@/components/fi911/AlertCodes';
import { useDetailCrumb } from '@/components/layout/AppLayout';
import { merchantBatches, merchantProfile, queueTransactions, variance } from '@/data/riskQueue';
import { routes } from '@/data/navigation';
import { useToast } from '@/context/ToastContext';

/**
 * One work-queue merchant, in three views.
 *
 * The reference opens a bare transaction grid with a Hold Merchant button
 * floating above it — the merchant it belongs to is a line of gray text, and
 * nothing on screen says whether this merchant is behaving outside what
 * underwriting approved. That is the first thing an analyst needs to know and
 * the last thing the grid can tell them.
 *
 * So the record leads with a PROFILE that sets the approved figures against
 * the observed ones, and the grids sit behind it:
 *
 *   Profile       — who this merchant is, and where they exceed their limits
 *   Transactions  — the flagged transactions, worst chargeback odds first
 *   Batches       — this merchant's settlement batches and what they tripped
 *
 * The view is a URL parameter, not local state, so the Work Queue row menu can
 * land directly on the grid the analyst asked for and the browser Back button
 * behaves.
 */

const VIEWS = ['profile', 'transactions', 'batches'];

const CHARGEBACK_SERIES = [{ key: 'value', label: 'Chargeback ratio', color: 'var(--c-series-0)' }];

function Probability({ value }) {
  const tone = value >= 60 ? 'danger' : value >= 30 ? 'warning' : 'neutral';
  return (
    <Tooltip label="Modeled likelihood this transaction becomes a chargeback, from the severity of the rules it tripped">
      <span className={`prob prob--${tone}`}>
        <span className="prob__bar"><span className="prob__fill" style={{ width: `${Math.min(value, 100)}%` }} /></span>
        <span className="prob__value">{value.toFixed(1)}%</span>
      </span>
    </Tooltip>
  );
}

/**
 * Approved vs observed. The variance carries the judgement — an analyst
 * should not have to divide two currency figures to see a merchant running
 * 40% past its cap.
 */
function Limit({ label, approved, observed, format = moneyText, hint }) {
  const delta = variance(observed, approved);
  const tone = delta > 25 ? 'danger' : delta > 0 ? 'warning' : 'success';

  return (
    <div className="limit">
      <span className="limit__label">{label}</span>
      <div className="limit__figures">
        <span className="limit__observed">{format(observed)}</span>
        <Tooltip label={hint ?? `Approved at underwriting: ${format(approved)}`}>
          <span className="limit__approved">of {format(approved)}</span>
        </Tooltip>
      </div>
      <div className="limit__meter">
        <span
          className={`limit__fill limit__fill--${tone}`}
          style={{ width: `${Math.min((observed / approved) * 100, 100)}%` }}
        />
      </div>
      <Badge tone={tone === 'success' ? 'success' : tone}>
        {delta > 0 ? `${delta}% over` : `${Math.abs(delta)}% under`}
      </Badge>
    </div>
  );
}

export function WorkQueueMerchant() {
  const { mid } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const legend = useAlertLegend();
  const [held, setHeld] = useState(false);
  const [params, setParams] = useSearchParams();

  const decoded = decodeURIComponent(mid ?? '');
  const merchant = useMemo(() => merchantProfile(decoded), [decoded]);
  const rows = useMemo(() => queueTransactions(decoded), [decoded]);
  const batches = useMemo(() => merchantBatches(decoded), [decoded]);

  useDetailCrumb(merchant.merchant);

  const requested = params.get('view');
  const view = VIEWS.includes(requested) ? requested : 'profile';
  const setView = (next) => setParams(next === 'profile' ? {} : { view: next }, { replace: true });

  const flagged = rows.filter((r) => r.flaggedStatus === 'Flagged');
  const exposure = flagged.reduce((s, r) => s + r.amount, 0);
  const highRisk = rows.filter((r) => r.chargebackProbability >= 60).length;
  const heldBatches = batches.filter((b) => b.status === 'Held').length;

  const transactionColumns = [
    menuColumn((r) => [
      { label: 'Release transaction', icon: 'check', onSelect: () => toast.notify(`${r.transactionId} released.`) },
      { label: 'Decline transaction', icon: 'ban', tone: 'danger', onSelect: () => toast.notify(`${r.transactionId} declined.`) },
      { label: 'Open case', icon: 'folder', onSelect: () => navigate(routes.actionHistory) },
    ]),
    { key: 'transactionId', header: 'Transaction ID', fw: 12, sortable: true },
    { key: 'amount', header: 'Amount', fw: 8, align: 'right', sortable: true, cell: (r) => <Money value={r.amount} />, text: (r) => moneyText(r.amount), totalCell: moneyTotal },
    { key: 'chargebackProbability', header: 'Chargeback Probability', fw: 11, align: 'center', sortable: true, cell: (r) => <Probability value={r.chargebackProbability} />, text: (r) => `${r.chargebackProbability}%` },
    { key: 'batchAlerts', header: 'Batch Alert', fw: 12, align: 'center', cell: (r) => <AlertBadges codes={r.batchAlerts} max={2} />, text: (r) => r.batchAlerts.join(' '), description: 'Rules that fired across the whole settlement batch this transaction sat in' },
    { key: 'transAlerts', header: 'Trans Alert', fw: 10, align: 'center', cell: (r) => <AlertBadges codes={r.transAlerts} max={2} empty={<Muted>—</Muted>} />, text: (r) => r.transAlerts.join(' '), description: 'Rules that fired on this transaction alone' },
    { key: 'entryMode', header: 'POS Entry Mode', fw: 9, align: 'center', sortable: true },
    { key: 'transactionType', header: 'Transaction Type', fw: 8, align: 'center', sortable: true },
    { key: 'cardNumber', header: 'Card Number', fw: 12, align: 'center' },
    { key: 'transactionDate', header: 'Transaction Date', fw: 9, align: 'center', sortable: true },
    { key: 'processor', header: 'Processor', fw: 8, align: 'center', sortable: true },
    { key: 'flaggedStatus', header: 'Flagged Status', fw: 9, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.flaggedStatus} /> },
    { key: 'fileSource', header: 'File Source', fw: 8, align: 'center', sortable: true },
    { key: 'caseId', header: 'Case', fw: 8, align: 'center', cell: (r) => (r.caseId ? <LinkCell onClick={() => navigate(routes.actionHistory)}>{r.caseId}</LinkCell> : <Muted>—</Muted>) },
  ];

  const batchColumns = [
    menuColumn((r) => [
      { label: 'View transactions', icon: 'table', onSelect: () => setView('transactions') },
      { label: 'Release batch', icon: 'check', onSelect: () => toast.notify(`${r.batchId} released for settlement.`) },
      { label: 'Hold batch', icon: 'pause', tone: 'danger', onSelect: () => toast.notify(`${r.batchId} held.`) },
    ]),
    { key: 'batchId', header: 'Batch ID', fw: 11, sortable: true },
    { key: 'settlementDate', header: 'Settlement Date', fw: 9, align: 'center', sortable: true },
    { key: 'submittedAt', header: 'Submitted', fw: 6, align: 'center', sortable: true },
    { key: 'txnCount', header: 'Txn', fw: 5, align: 'right', sortable: true },
    {
      key: 'flaggedCount', header: 'Flagged', fw: 6, align: 'right', sortable: true,
      cell: (r) => (r.flaggedCount ? <span className="flag-count">{r.flaggedCount}</span> : <Muted>—</Muted>),
      description: 'Transactions inside this batch that tripped a rule',
    },
    { key: 'grossAmount', header: 'Gross Amount', fw: 10, align: 'right', sortable: true, cell: (r) => <Money value={r.grossAmount} />, text: (r) => moneyText(r.grossAmount), totalCell: moneyTotal },
    { key: 'netAmount', header: 'Net Amount', fw: 10, align: 'right', sortable: true, cell: (r) => <Money value={r.netAmount} />, text: (r) => moneyText(r.netAmount), totalCell: moneyTotal },
    { key: 'batchAlerts', header: 'Batch Alert', fw: 12, align: 'center', cell: (r) => <AlertBadges codes={r.batchAlerts} max={2} empty={<Muted>—</Muted>} />, text: (r) => r.batchAlerts.join(' '), description: 'Rules that fired across this whole batch' },
    { key: 'scopeEvaluation', header: 'Scope', fw: 8, align: 'center', sortable: true },
    { key: 'processor', header: 'Processor', fw: 9, align: 'center', sortable: true },
    { key: 'status', header: 'Status', fw: 8, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <PageHeader
        title={merchant.merchant}
        description={`MID ${merchant.mid} · ${merchant.partner} · flagged ${merchant.transactionDate}`}
        meta={(
          <>
            <RiskBadge tier={merchant.tier} />
            {held ? <Badge tone="danger" dot>On hold</Badge> : <Badge tone="warning" dot>Under review</Badge>}
          </>
        )}
        actions={(
          <>
            <Button variant="secondary" size="sm" icon="arrowLeft" onClick={() => navigate(routes.workQueue)}>
              Back to queue
            </Button>
            <Button
              variant={held ? 'secondary' : 'danger'}
              size="sm"
              icon={held ? 'play' : 'pause'}
              onClick={() => {
                setHeld((h) => !h);
                toast.notify(held ? `${merchant.merchant} released from hold.` : `${merchant.merchant} placed on hold — settlement suspended.`);
              }}
            >
              {held ? 'Release merchant' : 'Hold merchant'}
            </Button>
          </>
        )}
      />

      <div className="queue-kpis">
        <Kpi label="Flagged value" value={moneyText(exposure)} meta={`${flagged.length} of ${rows.length} transactions held`} invert />
        <Kpi label="High probability" value={highRisk} meta="60% or more likely to charge back" invert />
        <Kpi label="Triage score" value={merchant.triageScore} meta="Rank against the rest of the queue" invert />
        <Kpi label="Chargeback ratio" value={`${merchant.mcbAmountRatio.toFixed(2)}%`} meta="By settled value" invert />
      </div>

      <Tabs
        className="tabs--record"
        value={view}
        onChange={setView}
        tabs={[
          { value: 'profile', label: 'Merchant Profile' },
          { value: 'transactions', label: 'Flagged Transactions', badge: flagged.length },
          { value: 'batches', label: 'Batches', badge: heldBatches || undefined },
        ]}
      />

      {view === 'profile' && (
        <div className="profile-grid">
          <Card
            title="Approved limits against current activity"
            description="Underwriting set these ceilings — the bar is what the merchant is actually doing this month."
            className="profile-grid__wide"
          >
            <div className="limits">
              <Limit label="Monthly volume" approved={merchant.approvedMonthly} observed={merchant.monthToDateVolume} hint={`Approved monthly cap: ${moneyText(merchant.approvedMonthly)}. The bar is month-to-date settled volume.`} />
              <Limit label="Average ticket" approved={merchant.approvedAverageTicket} observed={merchant.averageTicket} />
              <Limit label="Highest ticket" approved={merchant.approvedHighTicket} observed={merchant.highestTicket} />
            </div>
          </Card>

          <Card title="Business" description="Legal identity as underwritten.">
            <div className="fi-summary fi-summary--single">
              <SummaryRow label="DBA Name">{merchant.dbaName}</SummaryRow>
              <SummaryRow label="Legal Name">{merchant.legalName}</SummaryRow>
              <SummaryRow label="Entity Type">{merchant.entityType}</SummaryRow>
              <SummaryRow label="Federal Tax ID">{merchant.taxId}</SummaryRow>
              <SummaryRow label="MCC">
                <Tooltip label={merchant.mccLabel}><span>{merchant.mcc}</span></Tooltip>
              </SummaryRow>
              <SummaryRow label="Descriptor">{merchant.descriptor}</SummaryRow>
              <SummaryRow label="Website">{merchant.website}</SummaryRow>
              <SummaryRow label="Merchant Status"><StatusBadge value={merchant.merchantStatus} /></SummaryRow>
            </div>
          </Card>

          <Card title="Contact" description="Who to call before holding funds.">
            <div className="fi-summary fi-summary--single">
              <SummaryRow label="Contact Name">{merchant.contactName}</SummaryRow>
              <SummaryRow label="Phone">{merchant.contactPhone}</SummaryRow>
              <SummaryRow label="Email">{merchant.contactEmail}</SummaryRow>
              <SummaryRow label="Address">{merchant.addressLine}</SummaryRow>
              <SummaryRow label="City / State">{merchant.city}, {merchant.state}</SummaryRow>
              <SummaryRow label="ZIP Code">{merchant.zip}</SummaryRow>
              <SummaryRow label="Partner">{merchant.partner} ({merchant.partnerCode})</SummaryRow>
              <SummaryRow label="Assigned To">{merchant.assignedUser || <Muted>Unassigned</Muted>}</SummaryRow>
            </div>
          </Card>

          <Card title="Processing & settlement" description="Where the money lands.">
            <div className="fi-summary fi-summary--single">
              <SummaryRow label="Acquirer">{merchant.acquirer}</SummaryRow>
              <SummaryRow label="Processor">{merchant.processor}</SummaryRow>
              <SummaryRow label="Routing Number">{merchant.routingNumber}</SummaryRow>
              <SummaryRow label="Account Number">{merchant.accountNumber}</SummaryRow>
              <SummaryRow label="Open Date">{merchant.openDate}</SummaryRow>
              <SummaryRow label="Last Risk Review">{merchant.lastReviewDate}</SummaryRow>
              <SummaryRow label="Total Settlement"><Money value={merchant.totalSettlement} /></SummaryRow>
              <SummaryRow label="Flagged Settlement"><Money value={merchant.flaggedSettlement} /></SummaryRow>
            </div>
          </Card>

          <Card title="Reserve" description="Held against future chargebacks.">
            <div className="fi-summary fi-summary--single">
              <SummaryRow label="Reserve Type">{merchant.reserveType}</SummaryRow>
              <SummaryRow label="Reserve Rate">
                {merchant.reserveType === 'None' ? <Muted>—</Muted> : `${merchant.reservePercent}%`}
              </SummaryRow>
              <SummaryRow label="Amount Held">
                {merchant.reserveHeld ? <Money value={merchant.reserveHeld} /> : <Muted>—</Muted>}
              </SummaryRow>
              <SummaryRow label="Rolling Period">
                {merchant.rollingDays ? `${merchant.rollingDays} days` : <Muted>Not rolling</Muted>}
              </SummaryRow>
            </div>
          </Card>

          <Card
            title="Chargeback ratio, trailing 12 months"
            description="By settled value. Card scheme monitoring programs begin near 1%."
            className="profile-grid__wide"
          >
            <LineChart
              data={merchant.chargebackHistory}
              xKey="label"
              series={CHARGEBACK_SERIES}
              height={180}
              formatValue={(v) => `${v}%`}
              legend={false}
            />
          </Card>

          <Card title="Risk alerts on this merchant" description="Rules tripped across the flagged batches." className="profile-grid__wide">
            {legend.panel}
            <div className="profile-alerts">
              <AlertBadges codes={merchant.riskAlerts} max={merchant.riskAlerts.length} />
              {legend.button}
            </div>
          </Card>
        </div>
      )}

      {view === 'transactions' && (
        <div className="fi-panel">
          {legend.panel}
          <ListTable
            columns={transactionColumns}
            rows={rows}
            searchPlaceholder="Search transaction ID or card"
            exportName={`work-queue-${merchant.mid}-transactions`}
            totals={['amount']}
            note="Ordered by chargeback probability — work down from the top."
            rightExtra={legend.button}
            empty="No flagged transactions for this merchant."
          />
        </div>
      )}

      {view === 'batches' && (
        <div className="fi-panel">
          {legend.panel}
          <ListTable
            columns={batchColumns}
            rows={batches}
            searchPlaceholder="Search batch ID"
            exportName={`work-queue-${merchant.mid}-batches`}
            totals={['grossAmount', 'netAmount']}
            note="Settlement batches submitted by this merchant, most recent first."
            rightExtra={legend.button}
            empty="No batches submitted by this merchant."
          />
        </div>
      )}
    </>
  );
}

export default WorkQueueMerchant;
