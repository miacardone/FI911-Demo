import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Surface';
import Modal from '@/components/ui/Modal';
import { SelectField, TextField } from '@/components/ui/Form';
import { ListPage } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { AttachmentsModal, ChangeStatusModal, NotesModal } from '@/components/fi911/RecordModals';
import { LinkCell, StatusBadge, Muted, menuColumn } from '@/components/fi911/cells';
import { FieldGrid, Section } from '@/components/fi911/DetailPage';
import {
  INVITATIONS, INVITATION_STATUS, attachmentsFor, filterStage, notesFor, stageTabs, statusOptionsFor,
} from '@/apm/data/participants';
import { AGENTS, ASSIGNEES } from '@/apm/data/people';
import { routes } from '@/apm/data/navigation';
import { useToast } from '@/context/ToastContext';
import brand from '@/apm/brand.config';

/**
 * Participant Invitations — stage 1 of the funnel.
 *
 * The Advanced Search panel here is the console's widest: the reference
 * carries 24 dispute-shaped criteria on the invitation list. They are declared
 * as data rather than markup so the same list can drive both the panel and the
 * matcher in Filters.js — a field that has no `match` falls back to a
 * substring test on the row key of the same name, and criteria that describe
 * a dispute rather than an invitation simply never match anything, which is
 * the honest behaviour for a filter with nothing to filter on.
 */

const ADVANCED_FIELDS = [
  { name: 'caseNumber', label: 'Case Number' },
  { name: 'cardScheme', label: 'Card Scheme', type: 'select', options: brand.schemes.map((s) => ({ value: s.id, label: s.label })) },
  { name: 'participant', label: 'Merchant Name' },
  { name: 'transactionDate', label: 'Transaction Date Range', type: 'date' },
  { name: 'postDate', label: 'Post Date Range', type: 'date' },
  { name: 'txnAmountMin', label: 'Transaction Amount Min', type: 'number' },
  { name: 'txnAmountMax', label: 'Transaction Amount Max', type: 'number' },
  { name: 'txnCurrency', label: 'Transaction Currency', type: 'select', options: [{ value: 'GBP', label: 'GBP' }, { value: 'EUR', label: 'EUR' }, { value: 'USD', label: 'USD' }] },
  { name: 'reasonCodes', label: 'Reason Codes', type: 'select', options: [{ value: 'not_received', label: 'Goods/Services Not Received' }, { value: 'misrepresentation', label: 'Misrepresentation' }] },
  { name: 'caseAmountMin', label: 'Case Amount Min', type: 'number' },
  { name: 'caseAmountMax', label: 'Case Amount Max', type: 'number' },
  { name: 'caseCurrency', label: 'Case Currency', type: 'select', options: [{ value: 'GBP', label: 'GBP' }] },
  { name: 'caseAssigned', label: 'Case Assigned' },
  { name: 'reviewer', label: 'Reviewer' },
  { name: 'disputeCycle', label: 'Dispute Cycle', type: 'select', options: [{ value: 'retrieval', label: 'Retrieval' }, { value: 'first_cb', label: '1st Chargeback' }] },
  { name: 'specialityQueue', label: 'Speciality Queue', type: 'select', options: [{ value: 'high_value', label: 'High Value' }] },
  { name: 'docStatus', label: 'Doc Status', type: 'select', options: [{ value: 'received', label: 'Received' }, { value: 'missing', label: 'Missing' }] },
  { name: 'outcome', label: 'Outcome', type: 'select', options: [{ value: 'won', label: 'Won' }, { value: 'lost', label: 'Lost' }] },
  { name: 'dueDate', label: 'Due Date Range', type: 'date' },
  { name: 'arn', label: 'ARN' },
  { name: 'created', label: 'Created Date Range', type: 'date' },
  { name: 'status', label: 'Case Status', type: 'select', options: statusOptionsFor(INVITATION_STATUS).map((s) => ({ value: s, label: s })) },
  { name: 'assignedTo', label: 'Assigned To' },
  { name: 'financialTxnCreated', label: 'Financial Transaction Created', type: 'select', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }] },
];

/* ---------- Create Invitation ---------- */

function CreateInvitationModal({ open, onClose, onCreate }) {
  const blank = {
    agent: '', agentContact: '', agentEmail: '', assignedTo: '',
    type: '', legalName: '', participant: '', website: '',
    contact: '', phone: '', serviceNumber: '', email: '',
  };
  const [form, setForm] = useState(blank);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const valid = form.agent.trim() && form.participant.trim() && form.contact.trim() && form.email.trim();

  const submit = () => {
    onCreate(form);
    setForm(blank);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create New Invitation"
      size="lg"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!valid} onClick={submit}>Create Invitation</Button>
        </>
      )}
    >
      <div className="stack">
        <Section title="Agent Information" collapsible={false}>
          <FieldGrid>
            <TextField label="Agent Name" required value={form.agent} placeholder="Enter agent name" onChange={set('agent')} />
            <TextField label="Agent Contact Name" value={form.agentContact} placeholder="Enter contact name" onChange={set('agentContact')} />
            <div className="fi-fields__full">
              <TextField label="Agent Contact Email Address" value={form.agentEmail} placeholder="Enter email address" onChange={set('agentEmail')} />
            </div>
          </FieldGrid>
        </Section>

        <Section title="Assignment" collapsible={false}>
          <TextField label="Assign To" value={form.assignedTo} placeholder="Enter assignee name" onChange={set('assignedTo')} />
        </Section>

        <Section title="Business Information" collapsible={false}>
          <FieldGrid>
            <SelectField
              label="Type"
              value={form.type}
              onChange={set('type')}
              placeholder="Select type"
              options={brand.participantTypes.map((t) => ({ value: t.label, label: t.label }))}
            />
            <TextField label="Legal Name" value={form.legalName} placeholder="Enter legal name" onChange={set('legalName')} />
            <TextField label="Participant Name" required value={form.participant} placeholder="Enter participant name" onChange={set('participant')} />
            <TextField label="Website" value={form.website} placeholder="Enter website" onChange={set('website')} />
            <TextField label="Contact Name" required value={form.contact} placeholder="Enter contact name" onChange={set('contact')} />
            <TextField label="Contact Phone" value={form.phone} placeholder="Enter phone number" onChange={set('phone')} />
            <TextField label="Customer Service Number" value={form.serviceNumber} placeholder="Enter customer service number" onChange={set('serviceNumber')} />
            <TextField label="Contact Email" required value={form.email} placeholder="Enter email address" onChange={set('email')} />
          </FieldGrid>
        </Section>
      </div>
    </Modal>
  );
}

/* ---------- Page ---------- */

export function Invitations() {
  const navigate = useNavigate();
  const toast = useToast();

  const [rows, setRows] = useState(INVITATIONS);
  const [tab, setTab] = useState('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});
  const [creating, setCreating] = useState(false);
  const [modal, setModal] = useState(null); // { kind, row }

  const tabs = useMemo(() => stageTabs(rows, INVITATION_STATUS), [rows]);
  const visible = useMemo(
    () => applyFilters(filterStage(rows, tab, INVITATION_STATUS), ADVANCED_FIELDS, applied),
    [rows, tab, applied],
  );

  const closeModal = () => setModal(null);

  const removeRow = (row) => {
    setRows((rs) => rs.filter((r) => r.id !== row.id));
    toast.notify(`${row.participant} removed.`);
  };

  const changeStatus = (row) => ({ status }) => {
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, status } : r)));
  };

  const columns = [
    {
      key: 'participant',
      header: 'Participant Name',
      fw: 16,
      sortable: true,
      cell: (r) => <LinkCell to={routes.invitationDetail(r.id)}>{r.participant}</LinkCell>,
    },
    { key: 'agent', header: 'Agent', fw: 11, sortable: true },
    {
      key: 'assignedTo',
      header: 'Assigned To',
      fw: 11,
      sortable: true,
      cell: (r) => (r.assignedTo ? r.assignedTo : <Muted>-</Muted>),
    },
    { key: 'contact', header: 'Contact', fw: 11, sortable: true },
    { key: 'phone', header: 'Phone', fw: 10 },
    { key: 'email', header: 'Email', fw: 18 },
    { key: 'created', header: 'Creation Date', fw: 9, sortable: true },
    { key: 'statusChanged', header: 'Status Change', fw: 9, sortable: true },
    {
      key: 'status',
      header: 'Status',
      fw: 9,
      sortable: true,
      cell: (r) => <StatusBadge value={r.status} />,
    },
    menuColumn((row) => [
      { label: 'View', icon: 'eye', onSelect: () => navigate(routes.invitationDetail(row.id)) },
      { label: 'Change Status', icon: 'refresh', onSelect: () => setModal({ kind: 'status', row }) },
      { label: 'Attachments', icon: 'paperclip', onSelect: () => setModal({ kind: 'attachments', row }) },
      { label: 'Notes', icon: 'message', onSelect: () => setModal({ kind: 'notes', row }) },
      { label: 'Delete', icon: 'trash', tone: 'danger', onSelect: () => removeRow(row) },
    ]),
  ];

  return (
    <>
      <ListPage
        title="Participant Invitations"
        description="Manage and track participant invitation submissions and status"
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
        rowKey={(r) => r.id}
        searchPlaceholder="Search participant invitations"
        exportName="participant-invitations"
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
        leftExtra={<Button variant="primary" size="sm" icon="plus" onClick={() => setCreating(true)}>Create Invitation</Button>}
        empty="No invitations match these criteria."
      />

      <CreateInvitationModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={(form) => {
          const id = `inv-${Date.now()}`;
          setRows((rs) => [{
            id,
            participant: form.participant,
            agent: form.agent,
            assignedTo: form.assignedTo,
            contact: form.contact,
            phone: form.phone,
            email: form.email,
            created: '2026/08/20',
            statusChanged: '2026/08/20',
            status: 'New Lead',
          }, ...rs]);
          toast.notify(`Invitation created for ${form.participant}.`);
        }}
      />

      <ChangeStatusModal
        open={modal?.kind === 'status'}
        onClose={closeModal}
        current={modal?.row?.status}
        statuses={statusOptionsFor(INVITATION_STATUS)}
        onSubmit={modal?.row ? changeStatus(modal.row) : undefined}
      />

      <AttachmentsModal
        open={modal?.kind === 'attachments'}
        onClose={closeModal}
        attachments={modal?.row ? attachmentsFor(modal.row.id) : []}
      />

      <NotesModal
        open={modal?.kind === 'notes'}
        onClose={closeModal}
        notes={modal?.row ? notesFor(modal.row.id) : []}
      />
    </>
  );
}

export default Invitations;
