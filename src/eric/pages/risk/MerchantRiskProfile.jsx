import { useMemo, useState } from 'react';
import { ListPage } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { ChangeStatusModal } from '@/components/fi911/RecordModals';
import { LinkCell, RiskTriangle, StatusBadge, TaggedFlag, menuColumn } from '@/components/fi911/cells';
import { MERCHANT_STATUSES, RISK_MERCHANT_ROWS, filterMerchants, merchantTabs } from '@/eric/data/risk';
import { useToast } from '@/context/ToastContext';
import brand from '@/eric/brand.config';

/** Merchant Risk Profile — the same book as Risk Merchants, but action-enabled:
 *  status changes and removals happen here, so the read-only monitoring list
 *  stays safe to hand to someone who should not be editing it. */

const ADVANCED_FIELDS = [
  { name: 'merchant', label: 'Managed Merchants' },
  { name: 'processor', label: 'Processor', type: 'select', options: brand.processors.map((p) => ({ value: p, label: p })) },
  { name: 'contact', label: 'Contact Name' },
  { name: 'mcc', label: 'MCC' },
  { name: 'risk', label: 'Risk Profile', type: 'select', options: brand.riskTiers.map((t) => ({ value: t.id, label: t.label })) },
  { name: 'status', label: 'Status', type: 'select', options: MERCHANT_STATUSES.map((s) => ({ value: s, label: s })) },
];

export function MerchantRiskProfile() {
  const toast = useToast();
  const [rows, setRows] = useState(RISK_MERCHANT_ROWS);
  const [tab, setTab] = useState('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});
  const [statusRow, setStatusRow] = useState(null);

  const tabs = useMemo(() => merchantTabs(rows), [rows]);
  const visible = useMemo(
    () => applyFilters(filterMerchants(rows, tab), ADVANCED_FIELDS, applied),
    [rows, tab, applied],
  );

  const columns = [
    { key: 'status', header: 'Status', fw: 9, sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
    { key: 'boarded', header: 'Boarding Date', fw: 9, sortable: true },
    { key: 'merchant', header: 'Managed Merchants', fw: 16, sortable: true, cell: (r) => <LinkCell onClick={() => setStatusRow(r)}>{r.merchant}</LinkCell> },
    { key: 'processor', header: 'Processor', fw: 10, sortable: true },
    { key: 'contact', header: 'Contact Name', fw: 11, sortable: true },
    { key: 'phone', header: 'Phone', fw: 11 },
    { key: 'email', header: 'Email', fw: 18 },
    { key: 'mcc', header: 'MCC', fw: 6, sortable: true },
    { key: 'risk', header: 'Risk Profile', fw: 8, align: 'center', sortable: true, cell: (r) => <RiskTriangle tier={r.risk} />, text: (r) => r.risk },
    { key: 'tagged', header: 'Tagged', fw: 6, align: 'center', cell: (r) => <TaggedFlag on={r.tagged} />, text: (r) => (r.tagged ? 'tagged' : '') },
    menuColumn((row) => [
      { label: 'Change Status', icon: 'refresh', onSelect: () => setStatusRow(row) },
      { label: 'Delete', icon: 'trash', tone: 'danger', onSelect: () => { setRows((rs) => rs.filter((r) => r.id !== row.id)); toast.notify(`${row.merchant} removed.`); } },
    ]),
  ];

  return (
    <>
      <ListPage
        title="Merchant Risk Profile"
        description="Monitor and manage merchant risk profiles with detailed risk assessments and status tracking"
        tabs={tabs}
        tab={tab}
        onTabChange={setTab}
        scope={[
          { label: 'Managed list', value: 'action-enabled risk profile maintenance' },
          { label: 'Start Date', value: '2026/08/15' },
          { label: 'End Date', value: '2026/08/20' },
        ]}
        columns={columns}
        rows={visible}
        searchPlaceholder="Search records"
        exportName="merchant-risk-profile"
        onAdvanced={() => setAdvancedOpen((v) => !v)}
        advancedOpen={advancedOpen}
        advanced={<AdvancedSearchPanel fields={ADVANCED_FIELDS} values={criteria} onChange={setCriteria} onSearch={() => { setApplied(criteria); setAdvancedOpen(false); }} onClear={() => { setCriteria({}); setApplied({}); }} />}
        empty="No merchants match these criteria."
      />

      <ChangeStatusModal
        open={Boolean(statusRow)}
        onClose={() => setStatusRow(null)}
        current={statusRow?.status}
        statuses={MERCHANT_STATUSES}
        subject={statusRow ? { label: 'Merchant Name', value: statusRow.merchant } : undefined}
        commentLabel="Comments (Optional)"
        onSubmit={({ status }) => setRows((rs) => rs.map((r) => (r.id === statusRow.id ? { ...r, status } : r)))}
      />
    </>
  );
}

export default MerchantRiskProfile;
