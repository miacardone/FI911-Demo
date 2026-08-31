import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPage } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { AttachmentsModal, ChangeStatusModal, NotesModal } from '@/components/fi911/RecordModals';
import { IntakeBadge, LinkCell, MccCell, Money, Muted, StatusBadge, TypeBadge, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import {
  APPLICATIONS, APPLICATION_STATUS, attachmentsFor, filterStage, notesFor, stageTabs, statusOptionsFor,
} from '@/data/participants';
import { routes } from '@/data/navigation';
import brand from '@/brand/brand.config';

/** Participant Applications — stage 2. Adds the Type badge and the notes
 *  thread; the funnel's shape is otherwise identical to Invitations. */

const ADVANCED_FIELDS = [
  { name: 'merchant', label: 'Merchant Name' },
  { name: 'type', label: 'Type', type: 'select', options: brand.participantTypes.map((t) => ({ value: t.label, label: t.label })) },
  { name: 'agent', label: 'Agent Name' },
  { name: 'assignedTo', label: 'Assigned To' },
  { name: 'contact', label: 'Contact Name' },
  { name: 'email', label: 'Email' },
  { name: 'status', label: 'Status', type: 'select', options: statusOptionsFor(APPLICATION_STATUS).map((s) => ({ value: s, label: s })) },
  { name: 'created', label: 'Creation Date', type: 'date' },
  { name: 'statusChanged', label: 'Status Change Date', type: 'date' },
];

export function Applications() {
  const navigate = useNavigate();
  const [rows, setRows] = useState(APPLICATIONS);
  const [tab, setTab] = useState('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});
  const [modal, setModal] = useState(null);

  const tabs = useMemo(() => stageTabs(rows, APPLICATION_STATUS), [rows]);
  const visible = useMemo(
    () => applyFilters(filterStage(rows, tab, APPLICATION_STATUS), ADVANCED_FIELDS, applied),
    [rows, tab, applied],
  );

  const columns = [
    { key: 'merchant', header: 'Merchant Name', fw: 15, sortable: true, cell: (r) => <LinkCell to={routes.applicationDetail(r.id)}>{r.merchant}</LinkCell> },
      { key: 'mcc', header: 'MCC', fw: 6, align: 'center', sortable: true, cell: (r) => <MccCell code={r.mcc} label={r.mccLabel} />, text: (r) => `${r.mcc} ${r.mccLabel}` },
    { key: 'merchantType', header: 'Merchant Type', fw: 9, align: 'center', sortable: true, cell: (r) => <TypeBadge value={r.merchantType} /> },
    { key: 'processor', header: 'Processor', fw: 9, align: 'center', sortable: true },
    { key: 'monthlyVolume', header: 'Monthly Volume', fw: 10, align: 'right', sortable: true, cell: (r) => <Money value={r.monthlyVolume} />, text: (r) => moneyText(r.monthlyVolume), totalCell: moneyTotal },
    { key: 'agent', header: 'Agent Name', fw: 11, sortable: true,
      cell: (r) => (r.agent ? r.agent : <Muted>Direct signup</Muted>) },
    {
      key: 'intake', header: 'Source', fw: 9, align: 'center', sortable: true,
      cell: (r) => <IntakeBadge value={r.intake} verified={r.volumeVerified} />,
      text: (r) => r.intakeLabel,
      description: 'How this merchant reached the book — boarded by the bank or a partner, or signed up itself',
    },
    { hiddenByDefault: true, key: 'assignedTo', header: 'Assigned To', fw: 11, sortable: true, cell: (r) => (r.assignedTo ? r.assignedTo : <Muted>-</Muted>) },
    { hiddenByDefault: true, key: 'contact', header: 'Contact Name', fw: 11, sortable: true },
    { hiddenByDefault: true, key: 'phone', header: 'Phone', fw: 10 },
    { hiddenByDefault: true, key: 'email', header: 'Email', fw: 16 },
    { hiddenByDefault: true, key: 'created', header: 'Creation Date', fw: 9, sortable: true },
    { key: 'statusChanged', header: 'Status Change Date', fw: 9, sortable: true },
    { key: 'status', header: 'Status', fw: 10, sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
    menuColumn((row) => [
      { label: 'View', icon: 'eye', onSelect: () => navigate(routes.applicationDetail(row.id)) },
      { label: 'Change Status', icon: 'refresh', onSelect: () => setModal({ kind: 'status', row }) },
      { label: 'Attachments', icon: 'paperclip', onSelect: () => setModal({ kind: 'attachments', row }) },
      { label: 'Notes', icon: 'message', onSelect: () => setModal({ kind: 'notes', row }) },
    ]),
];

  return (
    <>
      <ListPage
        title="Merchant Applications"
        description="Manage and track merchant application submissions and contract status"
        tabs={tabs}
        tab={tab}
        onTabChange={setTab}
        scope={[
          { label: 'Search By', value: 'Status Change Date' },
          { label: 'Start Date', value: '2026/07/21' },
          { label: 'End Date', value: '2026/08/20' },
        ]}
        columns={columns}
        rows={visible}
        searchPlaceholder="Search merchant applications"
        exportName="merchant-applications"
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
        empty="No applications match these criteria."
      />

      <ChangeStatusModal
        open={modal?.kind === 'status'}
        onClose={() => setModal(null)}
        current={modal?.row?.status}
        statuses={statusOptionsFor(APPLICATION_STATUS)}
        onSubmit={({ status }) => setRows((rs) => rs.map((r) => (r.id === modal.row.id ? { ...r, status } : r)))}
      />
      <AttachmentsModal open={modal?.kind === 'attachments'} onClose={() => setModal(null)} attachments={modal?.row ? attachmentsFor(modal.row.id) : []} />
      <NotesModal open={modal?.kind === 'notes'} onClose={() => setModal(null)} notes={modal?.row ? notesFor(modal.row.id) : []} />
    </>
  );
}

export default Applications;
