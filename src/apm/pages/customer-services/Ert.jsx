import { useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Badge, Button } from '@/components/ui/Surface';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Form';
import { ListPage } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { LinkCell, Muted, PriorityArrow, StatusBadge, SummaryRow, TwoLine, menuColumn } from '@/components/fi911/cells';
import { ERT_NOTIFICATIONS, ERT_STATUSES, ertTabs, filterErt, nextErtId } from '@/apm/data/ert';
import { ChangeStatusModal } from '@/components/fi911/RecordModals';
import { useToast } from '@/context/ToastContext';
import brand from '@/apm/brand.config';

/**
 * ERT Notifications.
 *
 * The Create Ticket modal enforces a 500-character description because the
 * downstream alert payload is capped there; showing the remaining count as you
 * type is cheaper than truncating on save and losing the operator's words.
 */

const DESCRIPTION_LIMIT = 500;

/**
 * View a ticket.
 *
 * The row menu's View used to fire a toast carrying the raw row id, which is
 * indistinguishable from nothing happening. A ticket has a correspondent, a
 * deadline and a body — reading it is the most common thing anyone does on
 * this screen, so it opens the record rather than announcing its own id.
 */
function ViewTicketModal({ ticket, onClose, onChangeStatus }) {
  if (!ticket) return null;

  const overdue = !ticket.closed && ticket.due < brand.today;

  return (
    <Modal
      open
      onClose={onClose}
      title={`Notification ${ticket.id}`}
      size="md"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="primary" icon="refresh" onClick={() => { onClose(); onChangeStatus(ticket); }}>
            Change status
          </Button>
        </>
      )}
    >
      <div className="stack">
        <div className="ticket__head">
          <StatusBadge value={ticket.status} />
          <PriorityArrow value={ticket.priority} />
          {overdue && <Badge tone="danger" dot>Overdue</Badge>}
        </div>

        <div className="fi-summary">
          <SummaryRow label="Type">{ticket.type}</SummaryRow>
          <SummaryRow label="Sender">{ticket.sender}</SummaryRow>
          <SummaryRow label="Recipient">{ticket.recipient} ({ticket.recipientCode})</SummaryRow>
          <SummaryRow label="Assignee">{ticket.assignee || <Muted>Unassigned</Muted>}</SummaryRow>
          <SummaryRow label="Created">{ticket.created}</SummaryRow>
          <SummaryRow label="Due">{ticket.due}</SummaryRow>
          <SummaryRow label="Closed">{ticket.closed || <Muted>Still open</Muted>}</SummaryRow>
        </div>

        <div>
          <span className="t-section-label">Description</span>
          <p className="ticket__body">{ticket.description || <Muted>No description was supplied.</Muted>}</p>
        </div>
      </div>
    </Modal>
  );
}

const ADVANCED_FIELDS = [
  { name: 'id', label: 'Notification ID' },
  { name: 'status', label: 'Status', type: 'select', options: ERT_STATUSES.map((s) => ({ value: s, label: s })) },
  { name: 'sender', label: 'Sender' },
  { name: 'recipient', label: 'Recipient' },
  { name: 'assignee', label: 'Assignee' },
  { name: 'type', label: 'Type', type: 'select', options: brand.ertTypes.map((t) => ({ value: t.label, label: t.label })) },
  { name: 'priority', label: 'Priority', type: 'select', options: [{ value: 'high', label: 'High' }, { value: 'medium', label: 'Medium' }, { value: 'low', label: 'Low' }] },
  { name: 'created', label: 'Creation Date', type: 'date' },
  { name: 'due', label: 'Due Date', type: 'date' },
];

function CreateTicketModal({ open, onClose, onCreate }) {
  const blank = { participant: '', department: '', topic: '', subTopic: '', title: '', description: '' };
  const [form, setForm] = useState(blank);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const remaining = DESCRIPTION_LIMIT - form.description.length;
  const valid = form.participant.trim() && form.department && form.topic && form.subTopic && form.title.trim();

  const submit = () => { onCreate(form); setForm(blank); onClose(); };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create Ticket"
      size="md"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!valid} onClick={submit}>Create</Button>
        </>
      )}
    >
      <div className="stack">
        <TextField label="Participant Name" required value={form.participant} placeholder="Enter participant name" onChange={set('participant')} />
        <SelectField label="Department" required value={form.department} onChange={set('department')} placeholder="Select" options={brand.ertDepartments.map((d) => ({ value: d, label: d }))} />
        <SelectField label="Topic" required value={form.topic} onChange={set('topic')} placeholder="Select" options={brand.ertTopics.map((d) => ({ value: d, label: d }))} />
        <SelectField label="Sub Topic" required value={form.subTopic} onChange={set('subTopic')} placeholder="Select" options={brand.ertSubTopics.map((d) => ({ value: d, label: d }))} />
        <TextField label="Title" required value={form.title} placeholder="Enter title" onChange={set('title')} />
        <TextAreaField
          label="Description"
          rows={4}
          value={form.description}
          maxLength={DESCRIPTION_LIMIT}
          placeholder="Enter description..."
          onChange={set('description')}
        />
        <p className="micro subtle" style={{ textAlign: 'right' }}>Remaining characters: {remaining}</p>
      </div>
    </Modal>
  );
}

export function Ert() {
  const toast = useToast();
  const [rows, setRows] = useState(ERT_NOTIFICATIONS);
  const [tab, setTab] = useState('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});
  const [creating, setCreating] = useState(false);
  const [statusRow, setStatusRow] = useState(null);
  const [viewRow, setViewRow] = useState(null);

  const tabs = useMemo(() => ertTabs(rows), [rows]);
  const visible = useMemo(
    () => applyFilters(filterErt(rows, tab), ADVANCED_FIELDS, applied),
    [rows, tab, applied],
  );

  const columns = [
    {
      key: 'id',
      header: 'Notification ID',
      fw: 10,
      sortable: true,
      cell: (r) => (
        <TwoLine
          primary={r.type === 'Message' ? 'Late Claim Reimbursement Fee' : r.type}
          secondary={<LinkCell onClick={() => setViewRow(r)}>{r.id}</LinkCell>}
        />
      ),
      text: (r) => r.id,
    },
    { key: 'status', header: 'Status', fw: 8, sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
    { key: 'created', header: 'Creation Date', fw: 9, sortable: true },
    { key: 'due', header: 'Due Date', fw: 9, sortable: true },
    { key: 'sender', header: 'Sender', fw: 11, sortable: true },
    {
      key: 'recipient',
      header: 'Recipient',
      fw: 12,
      sortable: true,
      cell: (r) => <TwoLine primary={r.recipient} secondary={`Code: ${r.recipientCode}`} />,
      text: (r) => `${r.recipient} ${r.recipientCode}`,
    },
    { key: 'priority', header: 'Priority', fw: 6, align: 'center', sortable: true, cell: (r) => <PriorityArrow value={r.priority} /> },
    { key: 'assignee', header: 'Assignee', fw: 10, sortable: true, cell: (r) => (r.assignee ? r.assignee : <Muted>—</Muted>) },
    { key: 'type', header: 'Type', fw: 9, sortable: true },
    { key: 'description', header: 'Description', fw: 22 },
    { key: 'closed', header: 'Closed Date', fw: 9, sortable: true, cell: (r) => (r.closed ? r.closed : <Muted>—</Muted>) },
    menuColumn((row) => [
      { label: 'View', icon: 'eye', onSelect: () => setViewRow(row) },
      { label: 'Change Status', icon: 'refresh', onSelect: () => setStatusRow(row) },
    ]),
  ];

  return (
    <>
      <ListPage
        title="ERT Notifications"
        description="Manage and track Error Risk Threat notifications and alerts"
        tabs={tabs}
        tab={tab}
        onTabChange={setTab}
        columns={columns}
        rows={visible}
        searchPlaceholder="Search records"
        exportName="ert-notifications"
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
        leftExtra={<Button variant="primary" size="sm" icon="plus" onClick={() => setCreating(true)}>New</Button>}
        empty="No notifications match these criteria."
      />

      <CreateTicketModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreate={(form) => {
          const id = nextErtId(rows);
          setRows((rs) => [{
            id,
            status: 'New',
            created: '2026/08/20',
            due: '2026/08/27',
            sender: 'Customer Services',
            recipient: form.department,
            recipientCode: form.topic,
            priority: 'medium',
            assignee: '',
            type: 'Message',
            description: form.description || form.title,
            closed: '',
          }, ...rs]);
          toast.notify(`Ticket ${id} created.`);
        }}
      />

      <ViewTicketModal
        ticket={viewRow}
        onClose={() => setViewRow(null)}
        onChangeStatus={setStatusRow}
      />

      <ChangeStatusModal
        open={Boolean(statusRow)}
        onClose={() => setStatusRow(null)}
        current={statusRow?.status}
        statuses={ERT_STATUSES}
        subject={statusRow ? { label: 'Notification', value: `${statusRow.id} — ${statusRow.type}` } : undefined}
        onSubmit={({ status }) => setRows((rs) => rs.map((r) => (r.id === statusRow.id ? { ...r, status, closed: status === 'Closed' ? '2026/08/20' : '' } : r)))}
      />
    </>
  );
}

export default Ert;
