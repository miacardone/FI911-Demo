import { useMemo, useState } from 'react';
import { ListPage } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { LinkCell, RiskTriangle, StatusBadge, TaggedFlag, menuColumn } from '@/components/fi911/cells';
import { MERCHANT_STATUSES, RISK_MERCHANT_ROWS, filterMerchants, merchantTabs } from '@/apm/data/risk';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/apm/data/navigation';
import { useToast } from '@/context/ToastContext';
import brand from '@/apm/brand.config';

/** Risk Merchants — the monitored merchant book and its drill-down entry. */

const ADVANCED_FIELDS = [
  { name: 'merchant', label: 'Operational Merchants' },
  { name: 'processor', label: 'Processor', type: 'select', options: brand.processors.map((p) => ({ value: p, label: p })) },
  { name: 'contact', label: 'Contact Name' },
  { name: 'email', label: 'Email' },
  { name: 'mcc', label: 'MCC' },
  { name: 'risk', label: 'Risk Profile', type: 'select', options: brand.riskTiers.map((t) => ({ value: t.id, label: t.label })) },
  { name: 'status', label: 'Status', type: 'select', options: MERCHANT_STATUSES.map((s) => ({ value: s, label: s })) },
  { name: 'boarded', label: 'Boarding Date', type: 'date' },
];

export function RiskMerchants() {
  const navigate = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});

  const tabs = useMemo(() => merchantTabs(RISK_MERCHANT_ROWS), []);
  const rows = useMemo(
    () => applyFilters(filterMerchants(RISK_MERCHANT_ROWS, tab), ADVANCED_FIELDS, applied),
    [tab, applied],
  );

  const columns = [
    { key: 'status', header: 'Status', fw: 9, sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
    { key: 'boarded', header: 'Boarding Date', fw: 9, sortable: true },
    { key: 'merchant', header: 'Operational Merchants', fw: 16, sortable: true, cell: (r) => <LinkCell onClick={() => navigate(routes.merchantRiskProfile)}>{r.merchant}</LinkCell> },
    { key: 'processor', header: 'Processor', fw: 10, sortable: true },
    { key: 'contact', header: 'Contact Name', fw: 11, sortable: true },
    { key: 'phone', header: 'Phone', fw: 11 },
    { key: 'email', header: 'Email', fw: 18 },
    { key: 'mcc', header: 'MCC', fw: 6, sortable: true },
    { key: 'risk', header: 'Risk Profile', fw: 8, align: 'center', sortable: true, cell: (r) => <RiskTriangle tier={r.risk} />, text: (r) => r.risk },
    { key: 'tagged', header: 'Tagged', fw: 6, align: 'center', cell: (r) => <TaggedFlag on={r.tagged} />, text: (r) => (r.tagged ? 'tagged' : '') },
  ];

  return (
    <ListPage
      title="Merchants"
      description="Monitor and manage merchant risk profiles and compliance status"
      tabs={tabs}
      tab={tab}
      onTabChange={setTab}
      scope={[
        { label: 'Operational list', value: 'merchant monitoring and drill-down entry' },
        { label: 'Start Date', value: '2026/08/03' },
        { label: 'End Date', value: '2026/08/20' },
      ]}
      columns={columns}
      rows={rows}
      searchPlaceholder="Search merchants, processors, contacts."
      exportName="risk-merchants"
      onAdvanced={() => setAdvancedOpen((v) => !v)}
      advancedOpen={advancedOpen}
      advanced={<AdvancedSearchPanel fields={ADVANCED_FIELDS} values={criteria} onChange={setCriteria} onSearch={() => { setApplied(criteria); setAdvancedOpen(false); }} onClear={() => { setCriteria({}); setApplied({}); }} />}
      empty="No merchants match these criteria."
    />
  );
}

export default RiskMerchants;
