import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '@/components/ui/Modal';
import Icon from '@/components/ui/Icon';
import { Button } from '@/components/ui/Surface';
import { ListPage } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { AttachmentsModal, NotesModal } from '@/components/fi911/RecordModals';
import { LinkCell, Muted, StatusBadge, TrendValue, TypeBadge, menuColumn } from '@/components/fi911/cells';
import {
  LIVE_PARTICIPANTS, LIVE_STATUS, attachmentsFor, filterStage, notesFor, stageTabs, statementsFor,
} from '@/data/participants';
import { routes } from '@/data/navigation';
import { useToast } from '@/context/ToastContext';
import brand from '@/brand/brand.config';

/**
 * Live Participants — stage 5, and the console's hub.
 *
 * Its row menu is the widest in the product because a live participant is the
 * join point between every other module: its transactions, statements,
 * residuals, tickets, agreement and merchant book all hang off this row. Those
 * entries navigate to the real destination pages rather than opening stubs, so
 * the menu doubles as the demo's cross-module tour.
 */

const ADVANCED_FIELDS = [
  { name: 'merchant', label: 'Merchant Name' },
  { name: 'type', label: 'Type', type: 'select', options: brand.participantTypes.map((t) => ({ value: t.label, label: t.label })) },
  { name: 'agent', label: 'Agent Name' },
  { name: 'assignedTo', label: 'Assigned To' },
  { name: 'contact', label: 'Contact Name' },
  { name: 'email', label: 'Email' },
  { name: 'status', label: 'Status', type: 'select', options: Object.keys(LIVE_STATUS).map((s) => ({ value: s, label: s })) },
  { name: 'created', label: 'Creation Date', type: 'date' },
];

function StatementDetailsModal({ open, onClose, row }) {
  const toast = useToast();
  const rows = row ? statementsFor(row) : [];

  return (
    <Modal open={open} onClose={onClose} title="Statement Details" size="md">
      <table className="fi-mini-table">
        <thead>
          <tr><th>Participant Name</th><th>Billing Month</th><th className="fi-mini-table__actions">Download</th></tr>
        </thead>
        <tbody>
          {rows.map((s) => (
            <tr key={s.month}>
              <td>{s.participant}</td>
              <td>{s.month}</td>
              <td className="fi-mini-table__actions">
                <button
                  type="button"
                  className="row-menu__btn"
                  aria-label={`Download ${s.month} statement`}
                  onClick={() => toast.notify('Statement download started.')}
                >
                  <Icon name="download" size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}

export function LiveParticipants() {
  const navigate = useNavigate();
  const toast = useToast();
  const [rows] = useState(LIVE_PARTICIPANTS);
  const [tab, setTab] = useState('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});
  const [modal, setModal] = useState(null);

  const tabs = useMemo(() => stageTabs(rows, LIVE_STATUS), [rows]);
  const visible = useMemo(
    () => applyFilters(filterStage(rows, tab, LIVE_STATUS), ADVANCED_FIELDS, applied),
    [rows, tab, applied],
  );

  const columns = [
    { key: 'merchant', header: 'Merchant Name', fw: 14, sortable: true, cell: (r) => <LinkCell to={routes.liveParticipantDetail(r.id)}>{r.participant}</LinkCell> },
    { key: 'type', header: 'Type', fw: 5, sortable: true, cell: (r) => <TypeBadge value={r.type} /> },
    {
      key: 'highest',
      header: 'Highest Transaction',
      fw: 11,
      sortable: true,
      sortValue: (r) => r.highest,
      cell: (r) => <TrendValue value={r.highest} direction={r.trend} />,
    },
    { key: 'agent', header: 'Agent Name', fw: 11, sortable: true },
    { key: 'assignedTo', header: 'Assigned To', fw: 10, sortable: true, cell: (r) => (r.assignedTo ? r.assignedTo : <Muted>-</Muted>) },
    { key: 'contact', header: 'Contact Name', fw: 10, sortable: true },
    { key: 'phone', header: 'Phone', fw: 9 },
    { key: 'email', header: 'Email', fw: 15 },
    { key: 'created', header: 'Creation Date', fw: 9, sortable: true },
    { key: 'statusChanged', header: 'Status Change Date', fw: 10, sortable: true },
    { key: 'status', header: 'Status', fw: 9, sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
    menuColumn((row) => [
      { label: 'View', icon: 'eye', onSelect: () => navigate(routes.liveParticipantDetail(row.id)) },
      { label: 'Attachments', icon: 'paperclip', onSelect: () => setModal({ kind: 'attachments', row }) },
      { label: 'Notes', icon: 'message', onSelect: () => setModal({ kind: 'notes', row }) },
      { label: 'Transactions', icon: 'calendar', onSelect: () => navigate(routes.settlements) },
      { label: 'Statements', icon: 'file', onSelect: () => setModal({ kind: 'statements', row }) },
      { label: 'Residuals', icon: 'pound', onSelect: () => navigate(routes.portfolioPayoutDetails) },
      { label: 'Ticketing', icon: 'inbox', onSelect: () => navigate(routes.ert) },
      { label: 'Merchant Agreement', icon: 'checklist', onSelect: () => navigate(routes.liveParticipantDetail(row.id)) },
      { label: 'Merchant Merchants', icon: 'users', onSelect: () => navigate(routes.participantMerchants(row.id)) },
    ]),
  ];

  return (
    <>
      <ListPage
        title="Live Merchants"
        description="Manage and track live merchant status and onboarding progress"
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
        searchPlaceholder="Search live merchants"
        exportName="live-merchants"
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
        leftExtra={<Button variant="primary" size="sm" icon="upload" onClick={() => toast.notify('Import — choose a merchant file to upload.')}>Import</Button>}
        empty="No live merchants match these criteria."
      />

      <AttachmentsModal open={modal?.kind === 'attachments'} onClose={() => setModal(null)} attachments={modal?.row ? attachmentsFor(modal.row.id) : []} />
      <NotesModal open={modal?.kind === 'notes'} onClose={() => setModal(null)} notes={modal?.row ? notesFor(modal.row.id) : []} />
      <StatementDetailsModal open={modal?.kind === 'statements'} onClose={() => setModal(null)} row={modal?.row} />
    </>
  );
}

export default LiveParticipants;
