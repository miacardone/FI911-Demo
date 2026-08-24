import { useMemo, useState } from 'react';
import { ListPage } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { LinkCell, Money, TwoLine, moneyText } from '@/components/fi911/cells';
import { STATEMENTS } from '@/data/billing';
import { useToast } from '@/context/ToastContext';
import brand from '@/brand/brand.config';

/**
 * Billing Statements.
 *
 * The three money columns are links rather than plain figures: in the
 * reference each one drills into the workings behind it (the settlement
 * batch, the reserve ledger, the adjustment list). They are rendered as links
 * here for the same reason, and route to a toast rather than a dead click.
 */

const ADVANCED_FIELDS = [
  { name: 'merchant', label: 'Merchant Name' },
  { name: 'merchant', label: 'Merchant' },
  { name: 'mid', label: 'MID' },
  { name: 'processor', label: 'Processor', type: 'select', options: brand.processors.map((p) => ({ value: p, label: p })) },
  { name: 'month', label: 'Month', type: 'date' },
  { name: 'currency', label: 'Currency', type: 'select', options: [{ value: 'USD', label: 'USD' }] },
];

export function Statements() {
  const toast = useToast();
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});

  const visible = useMemo(() => applyFilters(STATEMENTS, ADVANCED_FIELDS, applied), [applied]);

  const drill = (label, row) => () => toast.notify(`${label} breakdown for ${row.merchant}.`);

  const columns = [
    {
      key: 'merchant',
      header: 'Merchant Name',
      fw: 22,
      sortable: true,
      cell: (r) => <TwoLine primary={r.participant} secondary={`${r.merchant} • MID:${r.mid}`} />,
      text: (r) => `${r.merchant} ${r.merchant} ${r.mid}`,
    },
    { key: 'processor', header: 'Processor', fw: 10, sortable: true },
    { key: 'month', header: 'Month', fw: 9, sortable: true },
    { key: 'currency', header: 'Currency', fw: 7, sortable: true },
    {
      key: 'settlement',
      header: 'Settlement Amount',
      fw: 12,
      align: 'right',
      sortable: true,
      sortValue: (r) => r.settlement,
      text: (r) => moneyText(r.settlement),
      cell: (r) => <LinkCell onClick={drill('Settlement', r)}><Money value={r.settlement} /></LinkCell>,
    },
    {
      key: 'reserve',
      header: 'Reserve Balance',
      fw: 11,
      align: 'right',
      sortable: true,
      sortValue: (r) => r.reserve,
      text: (r) => moneyText(r.reserve),
      cell: (r) => <LinkCell onClick={drill('Reserve', r)}><Money value={r.reserve} /></LinkCell>,
    },
    {
      key: 'adjustments',
      header: 'Adjustments',
      fw: 10,
      align: 'right',
      sortable: true,
      sortValue: (r) => r.adjustments,
      text: (r) => moneyText(r.adjustments),
      cell: (r) => <LinkCell onClick={drill('Adjustment', r)}><Money value={r.adjustments} /></LinkCell>,
    },
  ];

  return (
    <ListPage
      title="Billing Statements"
      description="View and manage merchant billing statements and settlement reports"
      scope={[{ label: 'Billing period', value: '2026/08/20 - 2026/08/20' }]}
      columns={columns}
      rows={visible}
      searchPlaceholder="Search records"
      exportName="billing-statements"
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
      empty="No statements match these criteria."
    />
  );
}

export default Statements;
