import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPage } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { AttachmentsModal, ChangeStatusModal, NotesModal } from '@/components/fi911/RecordModals';
import { LinkCell, Muted, StatusBadge, TypeBadge, menuColumn } from '@/components/fi911/cells';
import {
  APPLICATIONS, APPLICATION_STATUS, attachmentsFor, filterStage, notesFor, stageTabs, statusOptionsFor,
} from '@/apm/data/participants';
import { routes } from '@/apm/data/navigation';
import brand from '@/apm/brand.config';

/** Participant Applications — stage 2. Adds the Type badge and the notes
 *  thread; the funnel's shape is otherwise identical to Invitations. */

const ADVANCED_FIELDS = [
  { name: 'participant', label: 'Participant Name' },
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
    { key: 'participant', header: 'Participant Name', fw: 15, sortable: true, cell: (r) => <LinkCell to={routes.applicationDetail(r.id)}>{r.participant}</LinkCell> },
    { key: 'type', header: 'Type', fw: 6, sortable: true, cell: (r) => <TypeBadge value={r.type} /> },
    { key: 'agent', header: 'Agent Name', fw: 11, sortable: true },
    { key: 'assignedTo', header: 'Assigned To', fw: 11, sortable: true, cell: (r) => (r.assignedTo ? r.assignedTo : <Muted>-</Muted>) },
    { key: 'contact', header: 'Contact Name', fw: 11, sortable: true },
    { key: 'phone', header: 'Phone', fw: 10 },
    { key: 'email', header: 'Email', fw: 16 },
    { key: 'created', header: 'Creation Date', fw: 9, sortable: true },
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
        title="Participant Applications"
        description="Manage and track participant application submissions and contract status"
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
        searchPlaceholder="Search participant applications"
        exportName="participant-applications"
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
