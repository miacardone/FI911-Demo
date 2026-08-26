import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { CardBrand, LinkCell, Money, StatusBadge, moneyText } from '@/components/fi911/cells';
import { ALERT_BATCHES, ALERT_TRANSACTIONS } from '@/apm/data/risk';
import { formatNumber } from '@/utils/format';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/apm/data/navigation';
import { useToast } from '@/context/ToastContext';
import brand from '@/apm/brand.config';

/** Alert Action — two grains of the same alert stream. Batch Summary is what
 *  an analyst triages; Transaction Summary is what they open when a batch
 *  needs explaining. */

const BATCH_FIELDS = [
  { name: 'merchant', label: 'Merchant' },
  { name: 'processor', label: 'Processor', type: 'select', options: brand.processors.map((p) => ({ value: p, label: p })) },
  { name: 'mcc', label: 'MCC' },
  { name: 'batchId', label: 'BatchID' },
  { name: 'midStatus', label: 'MID Status', type: 'select', options: ['Active', 'Suspended', 'Inactive'].map((s) => ({ value: s, label: s })) },
  { name: 'batchDate', label: 'Batch Date', type: 'date' },
];

const TXN_FIELDS = [
  ...BATCH_FIELDS.filter((f) => f.name !== 'batchDate'),
  { name: 'transactionId', label: 'Transaction ID' },
  { name: 'authCode', label: 'Auth Code' },
  { name: 'transactionDate', label: 'Transaction Date', type: 'date' },
];

export function AlertAction() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState('batch');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});

  const batches = useMemo(() => applyFilters(ALERT_BATCHES, BATCH_FIELDS, applied), [applied]);
  const transactions = useMemo(() => applyFilters(ALERT_TRANSACTIONS, TXN_FIELDS, applied), [applied]);

  const batchColumns = [
    { key: 'midStatus', header: 'MID Status', fw: 8, sortable: true, cell: (r) => <StatusBadge value={r.midStatus} /> },
    { key: 'batchDate', header: 'Batch Date', fw: 9, sortable: true },
    { key: 'merchant', header: 'Merchant', fw: 18, sortable: true, cell: (r) => <LinkCell onClick={() => setTab('transaction')}>{r.merchant}</LinkCell> },
    { key: 'processor', header: 'Processor', fw: 11, sortable: true },
    { key: 'mcc', header: 'MCC', fw: 6, sortable: true },
    { key: 'batchId', header: 'BatchID', fw: 8, sortable: true },
    { key: 'lastVolume', header: 'Last Volume', fw: 9, align: 'right', sortable: true, sortValue: (r) => r.lastVolume, text: (r) => moneyText(r.lastVolume), cell: (r) => <Money value={r.lastVolume} /> },
    { key: 'totalTransactions', header: 'Total Transaction(#)', fw: 10, align: 'right', sortable: true },
    { key: 'totalValue', header: 'Total Transaction(£)', fw: 11, align: 'right', sortable: true, sortValue: (r) => r.totalValue, text: (r) => moneyText(r.totalValue), cell: (r) => <Money value={r.totalValue} /> },
    { key: 'flaggedTransactions', header: 'Flagged Transaction(#)', fw: 11, align: 'right', sortable: true },
    { key: 'flaggedValue', header: 'Flagged Transaction(£)', fw: 12, align: 'right', sortable: true, sortValue: (r) => r.flaggedValue, text: (r) => moneyText(r.flaggedValue), cell: (r) => <LinkCell onClick={() => setTab('transaction')}><Money value={r.flaggedValue} /></LinkCell> },
    { key: 'totalRules', header: 'Total Rules', fw: 7, align: 'right', sortable: true },
  ];

  const txnColumns = [
    { key: 'midStatus', header: 'MID Status', fw: 8, sortable: true, cell: (r) => <StatusBadge value={r.midStatus} /> },
    { key: 'transactionDate', header: 'Transacti...', fw: 9, sortable: true },
    { key: 'merchant', header: 'Merchant', fw: 16, sortable: true, cell: (r) => <LinkCell onClick={() => navigate(routes.merchantRiskProfile)}>{r.merchant}</LinkCell> },
    { key: 'processor', header: 'Processor', fw: 10, sortable: true },
    { key: 'mcc', header: 'MCC', fw: 6, sortable: true },
    { key: 'batchId', header: 'BatchID', fw: 8, sortable: true },
    { key: 'transactionId', header: 'Transacti...', fw: 10, sortable: true },
    { key: 'amount', header: 'Amount', fw: 9, align: 'right', sortable: true, sortValue: (r) => r.amount, text: (r) => moneyText(r.amount), cell: (r) => <Money value={r.amount} /> },
    { key: 'cardType', header: 'Card Type', fw: 10, sortable: true, cell: (r) => <CardBrand scheme={r.cardType} />, text: (r) => r.cardType },
    { key: 'authCode', header: 'Auth Code', fw: 8, sortable: true },
    { key: 'response', header: 'Respons...', fw: 7, sortable: true },
    { key: 'riskScore', header: 'Risk Score', fw: 8, align: 'right', sortable: true, cell: (r) => <span className="risk-score">{r.riskScore}</span> },
    { key: 'flagged', header: 'Flagg...', fw: 6, align: 'right', sortable: true, cell: (r) => <span className="flag-count">{r.flagged}</span> },
  ];

  return (
    <ListPage
      title="Alert Action"
      description="Monitor and manage risk alerts for batch and transaction processing"
      tabs={[{ value: 'batch', label: 'Batch Summary' }, { value: 'transaction', label: 'Transaction Summary' }]}
      tab={tab}
      onTabChange={setTab}
      scope={[{ label: 'Start Date', value: '2026/07/21' }, { label: 'End Date', value: '2026/08/20' }]}
    >
      <ListTable
        key={tab}
        columns={tab === 'batch' ? batchColumns : txnColumns}
        rows={tab === 'batch' ? batches : transactions}
        searchPlaceholder="Search records"
        exportName={tab === 'batch' ? 'alert-batch-summary' : 'alert-transaction-summary'}
        onAdvanced={() => setAdvancedOpen((v) => !v)}
        advancedOpen={advancedOpen}
        advanced={<AdvancedSearchPanel fields={tab === 'batch' ? BATCH_FIELDS : TXN_FIELDS} values={criteria} onChange={setCriteria} onSearch={() => { setApplied(criteria); setAdvancedOpen(false); }} onClear={() => { setCriteria({}); setApplied({}); }} />}
        empty="No alerts match these criteria."
      />
    </ListPage>
  );
}

export default AlertAction;
