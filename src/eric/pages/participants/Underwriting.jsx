import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListPage } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { AttachmentsModal, ChangeStatusModal, NotesModal } from '@/components/fi911/RecordModals';
import { LinkCell, Muted, RiskBadge, StatusBadge, TypeBadge, menuColumn } from '@/components/fi911/cells';
import {
  UNDERWRITING, UNDERWRITING_STATUS, attachmentsFor, filterStage, notesFor, stageTabs, statusOptionsFor,
} from '@/eric/data/participants';
import { routes } from '@/eric/data/navigation';
import brand from '@/eric/brand.config';

/** Participant Underwriting — stage 3. The Risk Profile column is what makes
 *  this stage different: it is the first point in the funnel where the
 *  participant carries an assessed tier rather than just a status. */

const ADVANCED_FIELDS = [
  { name: 'participant', label: 'Participant Name' },
  { name: 'type', label: 'Type', type: 'select', options: brand.participantTypes.map((t) => ({ value: t.label, label: t.label })) },
  { name: 'agent', label: 'Agent' },
  { name: 'assignedTo', label: 'Assigned To' },
  { name: 'risk', label: 'Risk Profile', type: 'select', options: brand.riskTiers.map((t) => ({ value: t.id, label: t.label })) },
  { name: 'contact', label: 'Contact' },
  { name: 'email', label: 'Email' },
  { name: 'status', label: 'Status', type: 'select', options: statusOptionsFor(UNDERWRITING_STATUS).map((s) => ({ value: s, label: s })) },
  { name: 'created', label: 'Creation Date', type: 'date' },
  { name: 'statusChanged', label: 'Status Change', type: 'date' },
];

export function Underwriting() {
  const navigate = useNavigate();
  const [rows, setRows] = useState(UNDERWRITING);
  const [tab, setTab] = useState('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});
  const [modal, setModal] = useState(null);

  const tabs = useMemo(() => stageTabs(rows, UNDERWRITING_STATUS), [rows]);
  const visible = useMemo(
    () => applyFilters(filterStage(rows, tab, UNDERWRITING_STATUS), ADVANCED_FIELDS, applied),
    [rows, tab, applied],
  );

  const columns = [
    { key: 'participant', header: 'Participant Name', fw: 15, sortable: true, cell: (r) => <LinkCell to={routes.underwritingDetail(r.id)}>{r.participant}</LinkCell> },
    { key: 'type', header: 'Type', fw: 6, sortable: true, cell: (r) => <TypeBadge value={r.type} /> },
    { key: 'agent', header: 'Agent', fw: 11, sortable: true },
    { key: 'assignedTo', header: 'Assigned To', fw: 11, sortable: true, cell: (r) => (r.assignedTo ? r.assignedTo : <Muted>-</Muted>) },
    { key: 'risk', header: 'Risk Prof...', fw: 8, sortable: true, cell: (r) => <RiskBadge tier={r.risk} />, text: (r) => r.risk },
    { key: 'contact', header: 'Contact', fw: 10, sortable: true },
    { key: 'phone', header: 'Phone', fw: 9 },
    { key: 'email', header: 'Email', fw: 15 },
    { key: 'created', header: 'Creation Date', fw: 9, sortable: true },
    { key: 'statusChanged', header: 'Status Change', fw: 9, sortable: true },
    { key: 'status', header: 'Status', fw: 10, sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
    menuColumn((row) => [
      { label: 'View', icon: 'eye', onSelect: () => navigate(routes.underwritingDetail(row.id)) },
      { label: 'Change Status', icon: 'refresh', onSelect: () => setModal({ kind: 'status', row }) },
      { label: 'Attachments', icon: 'paperclip', onSelect: () => setModal({ kind: 'attachments', row }) },
      { label: 'Notes', icon: 'message', onSelect: () => setModal({ kind: 'notes', row }) },
    ]),
  ];

  return (
    <>
      <ListPage
        title="Participant Underwriting"
        description="Monitor and manage participant underwriting processes with risk profile assessment and status tracking"
        tabs={tabs}
        tab={tab}
        onTabChange={setTab}
        columns={columns}
        rows={visible}
        searchPlaceholder="Search participant underwriting"
        exportName="participant-underwriting"
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
        empty="No underwriting records match these criteria."
      />

      <ChangeStatusModal
        open={modal?.kind === 'status'}
        onClose={() => setModal(null)}
        current={modal?.row?.status}
        statuses={statusOptionsFor(UNDERWRITING_STATUS)}
        onSubmit={({ status }) => setRows((rs) => rs.map((r) => (r.id === modal.row.id ? { ...r, status } : r)))}
      />
      <AttachmentsModal open={modal?.kind === 'attachments'} onClose={() => setModal(null)} attachments={modal?.row ? attachmentsFor(modal.row.id) : []} />
      <NotesModal open={modal?.kind === 'notes'} onClose={() => setModal(null)} notes={modal?.row ? notesFor(modal.row.id) : []} />
    </>
  );
}

export default Underwriting;
