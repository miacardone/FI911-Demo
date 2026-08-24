import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Kpi } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, CustomFilterPanel, applyFilters } from '@/components/fi911/Filters';
import { CardBrand, GatewayMatch, LinkCell, Money, Muted, TwoLine, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import { StatusBadge, TypeBadge } from '@/components/fi911/cells';
import {
  CHARGEBACK_RATIOS, DISPUTE_CYCLE_LABELS, DISPUTE_DETAILS, DISPUTE_REASONS, DISPUTE_STATUSES,
  DISPUTE_SUMMARY, RATIO_TABS, SCHEME_PROGRAMMES,
} from '@/eric/data/disputes';
import { routes } from '@/eric/data/navigation';
import { formatNumber, formatPercent } from '@/utils/format';

/**
 * Disputes — Summary, Details and a saveable Custom Filter.
 *
 * The ratio columns are the reason the summary exists, so they are formatted
 * as percentages to two decimals rather than raw fractions: 22.22% reads as a
 * problem, 0.2222 does not.
 */

const SUMMARY_FIELDS = [
  { name: 'participant', label: 'Participant Name' },
  { name: 'type', label: 'Type', type: 'select', options: [{ value: 'Bank', label: 'Bank' }, { value: 'PSP', label: 'PSP' }] },
  { name: 'pspType', label: 'PSP Type' },
];

const DETAIL_FIELDS = [
  { name: 'caseNumber', label: 'Case Number' },
  { name: 'participant', label: 'Participant Name' },
  { name: 'bankName', label: 'Bank Name' },
  { name: 'sortCode', label: 'Sort Code' },
  { name: 'accountNumber', label: 'Account Number' },
  { name: 'trn', label: 'TRN' },
  { name: 'reasonCategory', label: 'Reason Category', type: 'select', options: DISPUTE_REASONS.map((r) => ({ value: r, label: r })) },
  { name: 'status', label: 'Status', type: 'select', options: DISPUTE_STATUSES.map((s) => ({ value: s, label: s })) },
  { name: 'cycle', label: 'Cycle', type: 'select', options: DISPUTE_CYCLE_LABELS.map((c) => ({ value: c, label: c })) },
  { name: 'postDate', label: 'Post Date', type: 'date' },
  { name: 'dueDate', label: 'Due Date', type: 'date' },
  { name: 'type', label: 'Type', type: 'select', options: [{ value: 'PSP', label: 'PSP' }, { value: 'Bank', label: 'Bank' }] },
];

/* A ratio is only meaningful against the threshold it is measured for, so the
   cell carries the limit rather than leaving it to be remembered. */
function RatioCell({ row, value }) {
  const p = SCHEME_PROGRAMMES[row.scheme];
  const tone = row.tier === 'excessive' ? 'danger' : row.tier === 'standard' ? 'danger' : row.tier === 'approaching' ? 'warning' : 'neutral';
  return (
    <Tooltip label={`${p.name} threshold is ${p.standard.count}% with at least ${p.standard.minCount} chargebacks — this merchant is at ${value.toFixed(2)}% on ${formatNumber(row.chargebacks)}`}>
      <span className={`ratio ratio--${tone}`}>{value.toFixed(2)}%</span>
    </Tooltip>
  );
}

function ProgrammeBadge({ row }) {
  const tone = row.tier === 'excessive' ? 'danger' : row.tier === 'standard' ? 'danger' : row.tier === 'approaching' ? 'warning' : 'success';
  return <Badge tone={tone} dot={row.tier !== 'ok'}>{row.label}</Badge>;
}

export function Disputes() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('summary');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});
  const [ratioTab, setRatioTab] = useState('all');
  const [custom, setCustom] = useState({});
  const [customApplied, setCustomApplied] = useState({});

  const summaryRows = useMemo(() => applyFilters(DISPUTE_SUMMARY, SUMMARY_FIELDS, applied), [applied]);
  const detailRows = useMemo(() => applyFilters(DISPUTE_DETAILS, DETAIL_FIELDS, applied), [applied]);
  const customRows = useMemo(() => applyFilters(DISPUTE_DETAILS, DETAIL_FIELDS, customApplied), [customApplied]);

  const summaryColumns = [
    {
      key: 'participant', header: 'Participant Name', fw: 16, sortable: true,
      cell: (r) => <TwoLine primary={<LinkCell onClick={() => setTab('details')}>{r.participant}</LinkCell>} secondary={`[${r.sortCode}]`} />,
      text: (r) => `${r.participant} ${r.sortCode}`,
    },
    { key: 'pspType', header: 'PSP Type', fw: 9, cell: () => <Badge tone="primary">Sending PSP</Badge> },
    { key: 'transactions', header: 'Transaction (#)', fw: 9, align: 'right', sortable: true, cell: (r) => <LinkCell onClick={() => setTab('details')}>{formatNumber(r.transactions)}</LinkCell> },
    { key: 'disputes', header: 'Dispute (#)', fw: 8, align: 'right', sortable: true },
    { key: 'countRatio', header: 'Count Ratio', fw: 8, align: 'right', sortable: true, cell: (r) => formatPercent(r.countRatio, 2) },
    { key: 'txnValue', header: 'Transaction (£)', fw: 12, align: 'right', sortable: true, sortValue: (r) => r.txnValue, text: (r) => moneyText(r.txnValue), cell: (r) => <Money value={r.txnValue} /> },
    { key: 'disputeValue', header: 'Dispute (£)', fw: 10, align: 'right', sortable: true, sortValue: (r) => r.disputeValue, text: (r) => moneyText(r.disputeValue), cell: (r) => <Money value={r.disputeValue} /> },
    { key: 'amountRatio', header: 'Amount Ratio', fw: 9, align: 'right', sortable: true, cell: (r) => formatPercent(r.amountRatio, 2) },
    { key: 'type', header: 'Type', fw: 7, sortable: true },
  ];

  const detailColumns = [
    { key: 'caseNumber', header: 'Case Numb...', fw: 10, sortable: true, cell: (r) => <LinkCell to={routes.disputeDetail(r.caseNumber)}>{r.caseNumber}</LinkCell> },
    { key: 'participant', header: 'Participant Name', fw: 14, sortable: true },
    { key: 'bankName', header: 'Bank Name', fw: 12, sortable: true },
    { key: 'sortCode', header: 'Sort Code', fw: 8, sortable: true },
    { key: 'accountNumber', header: 'Account Num...', fw: 10 },
    { key: 'trn', header: 'TRN', fw: 14 },
    { key: 'reasonCategory', header: 'Reason Category', fw: 14, sortable: true },
    { key: 'postDate', header: 'Post Date', fw: 9, sortable: true },
    { key: 'typeReference', header: 'Type Reference Nu...', fw: 11 },
    { key: 'gatewayMatch', header: 'Gateway Mat...', fw: 8, align: 'center', cell: (r) => <GatewayMatch matched={r.gatewayMatch} />, text: (r) => (r.gatewayMatch ? 'matched' : 'no match') },
    { key: 'disputeAmount', header: 'Dispute A...', fw: 9, align: 'right', sortable: true, sortValue: (r) => r.disputeAmount, text: (r) => moneyText(r.disputeAmount), cell: (r) => <Money value={r.disputeAmount} /> },
    { key: 'status', header: 'Status', fw: 9, sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
    { key: 'cycle', header: 'Cycle', fw: 11, sortable: true },
    { key: 'dueDate', header: 'Due Date', fw: 9, sortable: true },
    { key: 'type', header: 'Type', fw: 6, sortable: true },
    { key: 'outcome', header: 'Outcome', fw: 8, sortable: true, cell: (r) => (r.outcome ? r.outcome : <Muted>—</Muted>) },
    { key: 'pspType', header: 'PSP Type', fw: 9 },
    menuColumn((row) => [{ label: 'View', icon: 'eye', onSelect: () => navigate(routes.disputeDetail(row.caseNumber)) }]),
  ];

  const ratioRows = useMemo(
    () => CHARGEBACK_RATIOS.filter((RATIO_TABS.find((t) => t.value === ratioTab) ?? RATIO_TABS[0]).match),
    [ratioTab],
  );

  const ratioColumns = [
    {
      key: 'tier', header: 'Programme', fw: 11, align: 'center', sortable: true,
      cell: (r) => <ProgrammeBadge row={r} />, text: (r) => r.label,
      description: 'Whether this merchant/scheme pair has crossed a card-scheme monitoring threshold',
    },
    {
      key: 'merchant', header: 'Merchant', fw: 17, sortable: true,
      cell: (r) => <TwoLine primary={r.merchant} secondary={`MID: ${r.mid}`} />,
      text: (r) => `${r.merchant} ${r.mid}`,
    },
    {
      key: 'scheme', header: 'Card Type', fw: 8, align: 'center', sortable: true,
      cell: (r) => <CardBrand scheme={r.scheme} />, text: (r) => r.scheme,
      description: 'Thresholds are set per scheme, so the ratio is measured per scheme',
    },
    { key: 'transactions', header: 'Transaction (#)', fw: 9, align: 'right', sortable: true, cell: (r) => formatNumber(r.transactions) },
    { key: 'chargebacks', header: 'Chargeback (#)', fw: 9, align: 'right', sortable: true, cell: (r) => formatNumber(r.chargebacks) },
    {
      key: 'countRatio', header: 'Count Ratio', fw: 9, align: 'center', sortable: true,
      cell: (r) => <RatioCell row={r} value={r.countRatio} />, text: (r) => `${r.countRatio}%`,
      description: 'Chargeback count as a share of transaction count — the figure the schemes actually measure',
    },
    { key: 'txnValue', header: 'Transaction (£)', fw: 12, align: 'right', sortable: true, sortValue: (r) => r.txnValue, text: (r) => moneyText(r.txnValue), cell: (r) => <Money value={r.txnValue} />, totalCell: moneyTotal },
    { key: 'cbValue', header: 'Chargeback (£)', fw: 11, align: 'right', sortable: true, sortValue: (r) => r.cbValue, text: (r) => moneyText(r.cbValue), cell: (r) => <Money value={r.cbValue} />, totalCell: moneyTotal },
    { key: 'amountRatio', header: 'Amount Ratio', fw: 9, align: 'center', sortable: true, cell: (r) => <span className="ratio ratio--neutral">{r.amountRatio.toFixed(2)}%</span>, text: (r) => `${r.amountRatio}%` },
    { key: 'processor', header: 'Processor', fw: 9, align: 'center', sortable: true },
  ];

  const tabs = [
    { value: 'summary', label: 'Summary', count: DISPUTE_SUMMARY.length },
    { value: 'details', label: 'Details', count: DISPUTE_DETAILS.length },
    { value: 'ratios', label: 'Chargeback Ratios', count: CHARGEBACK_RATIOS.length },
    { value: 'custom', label: 'Custom Filter' },
  ];

  return (
    <ListPage
      title="Disputes"
      description="Monitor and analyze dispute data across PSPs, banks, and merchants"
      tabs={tabs}
      tab={tab}
      onTabChange={setTab}
    >
      {tab === 'ratios' ? (
        <>
          <div className="queue-kpis">
            <Kpi
              label="In a programme"
              value={CHARGEBACK_RATIOS.filter((r) => r.tier === 'excessive' || r.tier === 'standard').length}
              meta="Merchant/scheme pairs over a scheme threshold"
              invert
            />
            <Kpi
              label="Excessive tier"
              value={CHARGEBACK_RATIOS.filter((r) => r.tier === 'excessive').length}
              meta="Fines and remediation plans apply"
              invert
            />
            <Kpi
              label="Approaching"
              value={CHARGEBACK_RATIOS.filter((r) => r.tier === 'approaching').length}
              meta="Within 25% of a threshold"
              invert
            />
            <Kpi
              label="Chargeback value"
              value={moneyText(CHARGEBACK_RATIOS.reduce((s2, r) => s2 + r.cbValue, 0))}
              meta="Across every scheme in the book"
              invert
            />
          </div>

          <ListTable
            key={ratioTab}
            columns={ratioColumns}
            rows={ratioRows}
            searchPlaceholder="Search MID or merchant name"
            exportName="chargeback-ratios"
            totals={['transactions', 'chargebacks', 'txnValue', 'cbValue']}
            note="Measured per card scheme, because the thresholds are set per scheme. Worst breaches first."
            leftExtra={(
              <div className="wq-tabs" role="tablist" aria-label="Programme tier">
                {RATIO_TABS.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    role="tab"
                    aria-selected={ratioTab === t.value}
                    className={`wq-tab ${ratioTab === t.value ? 'is-active' : ''}`.trim()}
                    onClick={() => setRatioTab(t.value)}
                  >
                    {t.label}<span className="wq-tab__count">{CHARGEBACK_RATIOS.filter(t.match).length}</span>
                  </button>
                ))}
              </div>
            )}
            empty="No merchant/scheme pairs in this tier."
          />
        </>
      ) : tab === 'custom' ? (
        <>
          <CustomFilterPanel
            fields={DETAIL_FIELDS}
            values={custom}
            onChange={setCustom}
            onApply={() => setCustomApplied(custom)}
            onClear={() => { setCustom({}); setCustomApplied({}); }}
          />
          <ListTable
            columns={detailColumns}
            rows={customRows}
            searchPlaceholder="Search filtered disputes"
            exportName="disputes-custom"
            empty="No disputes match this filter."
          />
        </>
      ) : (
        <ListTable
          key={tab}
          columns={tab === 'summary' ? summaryColumns : detailColumns}
          rows={tab === 'summary' ? summaryRows : detailRows}
          searchPlaceholder={tab === 'summary' ? 'Search disputes' : 'Search claim details'}
          exportName={tab === 'summary' ? 'disputes-summary' : 'disputes-details'}
          note={tab === 'details' ? 'Showing all claim-level disputes across PSP, Bank, and Merchant participants.' : undefined}
          onAdvanced={() => setAdvancedOpen((v) => !v)}
          advancedOpen={advancedOpen}
          advanced={(
            <AdvancedSearchPanel
              fields={tab === 'summary' ? SUMMARY_FIELDS : DETAIL_FIELDS}
              values={criteria}
              onChange={setCriteria}
              onSearch={() => { setApplied(criteria); setAdvancedOpen(false); }}
              onClear={() => { setCriteria({}); setApplied({}); }}
            />
          )}
          empty="No disputes match these criteria."
        />
      )}
    </ListPage>
  );
}

export default Disputes;
