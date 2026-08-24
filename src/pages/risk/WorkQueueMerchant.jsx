import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ListTable } from '@/components/fi911/ListPage';
import { Badge, Button, Kpi, PageHeader } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import { LinkCell, Money, Muted, StatusBadge, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import { AlertBadges, useAlertLegend } from '@/components/fi911/AlertCodes';
import { useDetailCrumb } from '@/components/layout/AppLayout';
import { queueTransactions, workQueueRow } from '@/data/riskQueue';
import { routes } from '@/data/navigation';
import { useToast } from '@/context/ToastContext';

/**
 * The transactions behind one work-queue merchant.
 *
 * Reached from Work Queue > row menu > View transactions. The reference opens
 * a bare grid with a Hold Merchant button floating above it; the merchant it
 * belongs to is a line of gray text and nothing tells you why the row was
 * flagged beyond the same unexplained codes.
 *
 * Here the merchant's exposure leads the page, the decision buttons act on the
 * selected rows rather than the whole merchant, and every transaction carries
 * a chargeback probability derived from the alerts sitting next to it — so the
 * ordering the operator works down is the ordering that matters.
 */

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

export function WorkQueueMerchant() {
  const { mid } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const legend = useAlertLegend();
  const [held, setHeld] = useState(false);

  const decoded = decodeURIComponent(mid ?? '');
  const merchant = workQueueRow(decoded);
  const rows = useMemo(() => queueTransactions(decoded), [decoded]);

  useDetailCrumb(merchant.merchant);

  const flagged = rows.filter((r) => r.flaggedStatus === 'Flagged');
  const exposure = flagged.reduce((s, r) => s + r.amount, 0);
  const highRisk = rows.filter((r) => r.chargebackProbability >= 60).length;

  const columns = [
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

  return (
    <>
      <PageHeader
        title={merchant.merchant}
        description={`MID ${merchant.mid} · ${merchant.partner} · flagged ${merchant.transactionDate}`}
        meta={held ? <Badge tone="danger" dot>On hold</Badge> : <Badge tone="warning" dot>Under review</Badge>}
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

      <div className="fi-panel">
        {legend.panel}
        <ListTable
          columns={columns}
          rows={rows}
          searchPlaceholder="Search transaction ID or card"
          exportName={`work-queue-${merchant.mid}`}
          totals={['amount']}
          note="Ordered by chargeback probability — work down from the top."
          rightExtra={legend.button}
          empty="No flagged transactions for this merchant."
        />
      </div>
    </>
  );
}

export default WorkQueueMerchant;
