import { useMemo, useState } from 'react';
import { ListPage } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { Money, moneyText } from '@/components/fi911/cells';
import { TRENDING } from '@/eric/data/residuals';
import { formatNumber } from '@/utils/format';

/** Trending Report — payout, volume and count trended month over month.
 *  Each agent contributes one row per parameter, so Parameter Value is
 *  sometimes money and sometimes a bare count; the cell decides from the row
 *  rather than the column, which is the only way one column can hold both. */

const ADVANCED_FIELDS = [
  { name: 'agent', label: 'Agent Name' },
  { name: 'processor', label: 'Processor' },
  { name: 'parameter', label: 'Trending Parameter', type: 'select', options: ['Payout', 'Volume', 'Count'].map((v) => ({ value: v, label: v })) },
  { name: 'period', label: 'Period', type: 'select', options: [{ value: 'Payout Month', label: 'Payout Month' }, { value: 'Residual Month', label: 'Residual Month' }] },
  { name: 'fromMonth', label: 'From Month', type: 'date' },
  { name: 'toMonth', label: 'To Month', type: 'date' },
];

const columns = [
  { key: 'agent', header: 'Agent Name', fw: 18, sortable: true },
  { key: 'processor', header: 'Processor', fw: 8, sortable: true },
  { key: 'parameter', header: 'Trending Parameter', fw: 11, sortable: true },
  { key: 'period', header: 'Period', fw: 10, sortable: true },
  { key: 'fromMonth', header: 'From Month', fw: 9, sortable: true },
  { key: 'merchants', header: 'Merchants', fw: 8, align: 'right', sortable: true },
  {
    key: 'value', header: 'Parameter Value', fw: 11, align: 'right', sortable: true,
    sortValue: (r) => r.value,
    text: (r) => (r.isMoney ? moneyText(r.value) : formatNumber(r.value)),
    cell: (r) => (r.isMoney ? <Money value={r.value} /> : formatNumber(r.value)),
  },
  { key: 'toMonth', header: 'To Month', fw: 9, sortable: true },
];

export function TrendingReport() {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});
  const rows = useMemo(() => applyFilters(TRENDING, ADVANCED_FIELDS, applied), [applied]);

  return (
    <ListPage
      title="Trending Report"
      description="Analyze trends for payout, volume, and count"
      columns={columns}
      rows={rows}
      searchPlaceholder="Search trending data"
      exportName="trending-report"
      onAdvanced={() => setAdvancedOpen((v) => !v)}
      advancedOpen={advancedOpen}
      advanced={<AdvancedSearchPanel fields={ADVANCED_FIELDS} values={criteria} onChange={setCriteria} onSearch={() => { setApplied(criteria); setAdvancedOpen(false); }} onClear={() => { setCriteria({}); setApplied({}); }} />}
      empty="No trending rows match these criteria."
    />
  );
}

export default TrendingReport;
