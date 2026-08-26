import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/Icon';
import { Button } from '@/components/ui/Surface';
import { SelectField } from '@/components/ui/Form';
import { ListPage } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { AttachmentsModal, ChangeStatusModal, NotesModal } from '@/components/fi911/RecordModals';
import { AssignModal } from '@/components/fi911/AssignModal';
import { LinkCell, Muted, StatusBadge, TypeBadge, menuColumn } from '@/components/fi911/cells';
import {
  ONBOARDING, ONBOARDING_STATUS, attachmentsFor, filterStage, notesFor, stageTabs, statusOptionsFor,
} from '@/apm/data/participants';
import { routes } from '@/apm/data/navigation';
import { useToast } from '@/context/ToastContext';
import brand from '@/apm/brand.config';

/** Participant Onboarding — stage 4. The extra row action here is "Assign
 *  Participant", which is the handoff from the underwriting decision to the
 *  operator who will actually take the participant live. */

const ADVANCED_FIELDS = [
  { name: 'participant', label: 'Participant Name' },
  { name: 'type', label: 'Type', type: 'select', options: brand.participantTypes.map((t) => ({ value: t.label, label: t.label })) },
  { name: 'agent', label: 'Agent' },
  { name: 'assignedTo', label: 'Assigned To' },
  { name: 'contact', label: 'Contact' },
  { name: 'email', label: 'Email' },
  { name: 'status', label: 'Status', type: 'select', options: statusOptionsFor(ONBOARDING_STATUS).map((s) => ({ value: s, label: s })) },
  { name: 'created', label: 'Creation Date', type: 'date' },
];


export function Onboarding() {
  const toast = useToast();
  const navigate = useNavigate();
  const [rows, setRows] = useState(ONBOARDING);
  const [tab, setTab] = useState('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});
  const [modal, setModal] = useState(null);

  const tabs = useMemo(() => stageTabs(rows, ONBOARDING_STATUS), [rows]);
  const visible = useMemo(
    () => applyFilters(filterStage(rows, tab, ONBOARDING_STATUS), ADVANCED_FIELDS, applied),
    [rows, tab, applied],
  );

  const columns = [
    { key: 'participant', header: 'Participant Name', fw: 15, sortable: true, cell: (r) => <LinkCell to={routes.onboardingDetail(r.id)}>{r.participant}</LinkCell> },
    { key: 'type', header: 'Type', fw: 6, sortable: true, cell: (r) => <TypeBadge value={r.type} /> },
    { key: 'agent', header: 'Agent', fw: 11, sortable: true },
    { key: 'assignedTo', header: 'Assigned To', fw: 11, sortable: true, cell: (r) => (r.assignedTo ? r.assignedTo : <Muted>-</Muted>) },
    { key: 'contact', header: 'Contact', fw: 11, sortable: true },
    { key: 'phone', header: 'Phone', fw: 10 },
    { key: 'email', header: 'Email', fw: 16 },
    { key: 'created', header: 'Creation Date', fw: 9, sortable: true },
    { key: 'statusChanged', header: 'Status Change', fw: 9, sortable: true },
    { key: 'status', header: 'Status', fw: 11, sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
    menuColumn((row) => [
      { label: 'View', icon: 'eye', onSelect: () => navigate(routes.onboardingDetail(row.id)) },
      { label: 'Change Status', icon: 'refresh', onSelect: () => setModal({ kind: 'status', row }) },
      { label: 'Assign Participant', icon: 'userCheck', onSelect: () => setModal({ kind: 'assign', row }) },
      { label: 'Attachments', icon: 'paperclip', onSelect: () => setModal({ kind: 'attachments', row }) },
      { label: 'Notes', icon: 'message', onSelect: () => setModal({ kind: 'notes', row }) },
    ]),
  ];

  return (
    <>
      <ListPage
        title="Participant Onboarding"
        description="Track and manage participant onboarding processes with status monitoring and progress tracking"
        tabs={tabs}
        tab={tab}
        onTabChange={setTab}
        scope={[
          { label: 'Search By', value: 'Creation Date' },
          { label: 'Start Date', value: '2026/07/21' },
          { label: 'End Date', value: '2026/08/20' },
        ]}
        columns={columns}
        rows={visible}
        searchPlaceholder="Search participant onboarding"
        exportName="participant-onboarding"
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
        empty="No onboarding records match these criteria."
      />

      <ChangeStatusModal
        open={modal?.kind === 'status'}
        onClose={() => setModal(null)}
        current={modal?.row?.status}
        statuses={statusOptionsFor(ONBOARDING_STATUS)}
        onSubmit={({ status }) => setRows((rs) => rs.map((r) => (r.id === modal.row.id ? { ...r, status } : r)))}
      />
      <AssignModal
        open={modal?.kind === 'assign'}
        onClose={() => setModal(null)}
        title="Assign Participant"
        subtitle={modal?.row ? `Choose who takes ${modal.row.participant} through onboarding` : undefined}
        current={modal?.row?.assignedTo}
        rows={rows}
        countOpen={(r) => r.assignedTo}
        onAssign={(who) => {
          setRows((rs) => rs.map((r) => (r.id === modal.row.id ? { ...r, assignedTo: who, status: 'Assigned' } : r)));
          toast.notify(`${modal.row.participant} assigned to ${who}.`);
        }}
      />
      <AttachmentsModal open={modal?.kind === 'attachments'} onClose={() => setModal(null)} attachments={modal?.row ? attachmentsFor(modal.row.id) : []} />
      <NotesModal open={modal?.kind === 'notes'} onClose={() => setModal(null)} notes={modal?.row ? notesFor(modal.row.id) : []} />
    </>
  );
}

export default Onboarding;
