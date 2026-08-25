import { useMemo, useState } from 'react';
import { ListPage } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { Money, StatusBadge, TwoLine, moneyText, moneyTotal } from '@/components/fi911/cells';
import {
  GLOBAL_STATUS_OPTIONS, INDUSTRY_TYPES, MERCHANT_GLOBAL, OWNERSHIP_TYPES,
} from '@/apm/data/reports';
import { ISO_PORTFOLIOS, PARTNERS, REGIONS } from '@/apm/data/reference';
import brand from '@/apm/brand.config';

/**
 * Merchant — Global.
 *
 * One row per merchant across the entire book, regardless of which stage of
 * the funnel it sits in. This is the "find me that merchant" screen: the
 * other lists are all scoped to a stage, so none of them can answer a
 * question that starts with a name and nothing else.
 *
 * The live product renders this table empty. Ours is populated and filterable,
 * because an empty report demonstrates nothing.
 */

const ADVANCED_FIELDS = [
  { name: 'dbaName', label: 'DBA Name' },
  { name: 'legalName', label: 'Legal Name' },
  { name: 'mid', label: 'MID' },
  { name: 'partner', label: 'Partner', type: 'select', options: PARTNERS.map((p) => ({ value: p.name, label: p.name })) },
  { name: 'groupEntity', label: 'Group / Business Entity', type: 'select', options: ISO_PORTFOLIOS.map((g) => ({ value: g, label: g })) },
  { name: 'region', label: 'Region / Channel-Department', type: 'select', options: REGIONS.map((r) => ({ value: r, label: r })) },
  { name: 'processor', label: 'Processor', type: 'select', options: brand.processors.map((p) => ({ value: p, label: p })) },
  { name: 'agent', label: 'Agent' },
  { name: 'assignedTo', label: 'Assigned To' },
  { name: 'ownershipType', label: 'Ownership Type', type: 'select', options: OWNERSHIP_TYPES.map((o) => ({ value: o, label: o })) },
  { name: 'industry', label: 'Industry', type: 'select', options: INDUSTRY_TYPES.map((o) => ({ value: o, label: o })) },
  { name: 'status', label: 'Status', type: 'select', options: GLOBAL_STATUS_OPTIONS.map((s) => ({ value: s, label: s })) },
];

export function MerchantGlobal() {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});

  const rows = useMemo(() => applyFilters(MERCHANT_GLOBAL, ADVANCED_FIELDS, applied), [applied]);

  const columns = [
    {
      key: 'dbaName', header: 'DBA Name', fw: 16, sortable: true,
      cell: (r) => <TwoLine primary={r.dbaName} secondary={`MID: ${r.mid}`} />,
      text: (r) => `${r.dbaName} ${r.mid}`,
    },
    { key: 'legalName', header: 'Legal Name', fw: 14, sortable: true },
    { key: 'partner', header: 'Partner', fw: 13, sortable: true },
    { key: 'groupEntity', header: 'Group / Business Entity', fw: 12, sortable: true },
    { key: 'region', header: 'Region / Channel-Department', fw: 13, sortable: true },
    { key: 'processor', header: 'Processor', fw: 9, sortable: true },
    { key: 'agent', header: 'Agent', fw: 11, sortable: true },
    { key: 'assignedTo', header: 'Assigned to', fw: 11, sortable: true },
    { key: 'ownershipType', header: 'Ownership Type', fw: 9, sortable: true },
    { key: 'industry', header: 'Industry', fw: 11, sortable: true },
    {
      key: 'monthlyVolume', header: 'Monthly Volume', fw: 10, align: 'right', sortable: true,
      sortValue: (r) => r.monthlyVolume, text: (r) => moneyText(r.monthlyVolume),
      cell: (r) => <Money value={r.monthlyVolume} />, totalCell: moneyTotal,
    },
    { key: 'created', header: 'Creation Date', fw: 9, sortable: true },
    { key: 'status', header: 'Status', fw: 11, sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <ListPage
      title="Merchant - Global"
      description="Every merchant across the book, whatever stage it sits at"
      scope={[
        { label: 'Scope', value: 'All stages' },
        { label: 'Merchants', value: `${MERCHANT_GLOBAL.length}` },
      ]}
      columns={columns}
      rows={rows}
      searchPlaceholder="Search records"
      exportName="merchant-global"
      totals={['monthlyVolume']}
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
      empty="No merchants match these criteria."
    />
  );
}

export default MerchantGlobal;
