import { useMemo, useState } from 'react';
import { ListPage } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { LinkCell, Money, Muted, StatusBadge, moneyText } from '@/components/fi911/cells';
import { HELD_VOLUME, filterHeld, heldTabs } from '@/data/risk';
import { formatNumber } from '@/utils/format';
import { useToast } from '@/context/ToastContext';
import brand from '@/brand/brand.config';

/** Held Volume — transactions withheld by a rule, and who cleared them.
 *  A blank "Actioned By" is meaningful: nobody has picked the alert up yet. */

const ADVANCED_FIELDS = [
  { name: 'merchant', label: 'Merchant' },
  { name: 'processor', label: 'Processor', type: 'select', options: brand.processors.map((p) => ({ value: p, label: p })) },
  { name: 'mcc', label: 'MCC' },
  { name: 'rule', label: 'Rule' },
  { name: 'actionedBy', label: 'Actioned By' },
  { name: 'status', label: 'Alert Status', type: 'select', options: ['Cleared', 'Pending', 'Under Review'].map((s) => ({ value: s, label: s })) },
  { name: 'alertDate', label: 'Alert Date', type: 'date' },
];

export function HeldVolume() {
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});

  const tabs = useMemo(() => heldTabs(HELD_VOLUME), []);
  const rows = useMemo(() => applyFilters(filterHeld(HELD_VOLUME, tab), ADVANCED_FIELDS, applied), [tab, applied]);

  const columns = [
    { key: 'status', header: 'Alert Status', fw: 9, sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
    { key: 'alertDate', header: 'Alert Date', fw: 9, sortable: true },
    { key: 'merchant', header: 'Merchant', fw: 14, sortable: true, cell: (r) => <LinkCell onClick={() => toast.notify(`${r.merchant} held volume`)}>{r.merchant}</LinkCell> },
    { key: 'processor', header: 'Processor', fw: 10, sortable: true },
    { key: 'mcc', header: 'MCC', fw: 6, sortable: true },
    { key: 'boarded', header: 'Boarded Date', fw: 9, sortable: true },
    { key: 'rule', header: 'Rule', fw: 18, sortable: true },
    { key: 'transactions', header: 'Held Transactions (#)', fw: 10, align: 'right', sortable: true, cell: (r) => formatNumber(r.transactions) },
    { key: 'amount', header: 'Held Amount (£)', fw: 11, align: 'right', sortable: true, sortValue: (r) => r.amount, text: (r) => moneyText(r.amount), cell: (r) => <Money value={r.amount} /> },
    { key: 'actionedBy', header: 'Actioned By', fw: 12, sortable: true, cell: (r) => (r.actionedBy ? r.actionedBy : <Muted>—</Muted>) },
  ];

  return (
    <ListPage
      title="Held Volume"
      description="Monitor and manage held transaction volumes with detailed alert status tracking and rule violations"
      tabs={tabs}
      tab={tab}
      onTabChange={setTab}
      scope={[
        { label: 'Search By', value: 'Alert Date' },
        { label: 'Start Date', value: '2026/08/11' },
        { label: 'End Date', value: '2026/08/20' },
      ]}
      columns={columns}
      rows={rows}
      searchPlaceholder="Search records"
      exportName="held-volume"
      onAdvanced={() => setAdvancedOpen((v) => !v)}
      advancedOpen={advancedOpen}
      advanced={<AdvancedSearchPanel fields={ADVANCED_FIELDS} values={criteria} onChange={setCriteria} onSearch={() => { setApplied(criteria); setAdvancedOpen(false); }} onClear={() => { setCriteria({}); setApplied({}); }} />}
      empty="No held volume matches these criteria."
    />
  );
}

export default HeldVolume;
