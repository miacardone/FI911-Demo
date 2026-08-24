import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Surface';
import { ListPage } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { StatusBadge, TypeBadge, menuColumn } from '@/components/fi911/cells';
import { useDetailCrumb } from '@/components/layout/AppLayout';
import { LIVE_PARTICIPANTS, participantMerchants } from '@/eric/data/participants';
import { routes } from '@/eric/data/navigation';
import { useToast } from '@/context/ToastContext';

/** The merchant book beneath one live participant, reached from that row's
 *  "Participant Merchants" action. */

const ADVANCED_FIELDS = [
  { name: 'name', label: 'Participant Name' },
  { name: 'agent', label: 'Agent Name' },
  { name: 'contact', label: 'Contact Name' },
  { name: 'mid', label: 'MID' },
  { name: 'email', label: 'Email' },
  { name: 'status', label: 'Status', type: 'select', options: ['Onboarded', 'Active', 'Closed'].map((s) => ({ value: s, label: s })) },
];

export function ParticipantMerchants() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const participant = LIVE_PARTICIPANTS.find((r) => r.id === id) ?? LIVE_PARTICIPANTS[0];

  useDetailCrumb(participant.participant);

  const rows = useMemo(() => participantMerchants(participant), [participant]);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});

  const visible = useMemo(() => applyFilters(rows, ADVANCED_FIELDS, applied), [rows, applied]);

  const columns = [
    { key: 'name', header: 'Participant Name', fw: 14, sortable: true },
    { key: 'type', header: 'Type', fw: 7, cell: (r) => <TypeBadge value={r.type} /> },
    { key: 'agent', header: 'Agent Name', fw: 11, sortable: true },
    { key: 'contact', header: 'Contact Name', fw: 11, sortable: true },
    { key: 'mid', header: 'MID', fw: 11 },
    { key: 'email', header: 'Email', fw: 16 },
    { key: 'changed', header: 'Status Change Date', fw: 10, sortable: true },
    { key: 'created', header: 'Creation Date', fw: 9, sortable: true },
    { key: 'status', header: 'Status', fw: 9, sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
    menuColumn(() => [
      { label: 'View', icon: 'eye', onSelect: () => toast.notify('Merchant detail is out of scope for this demo.') },
    ]),
  ];

  return (
    <ListPage
      title={participant.participant}
      description="Participating Merchants"
      columns={columns}
      rows={visible}
      searchPlaceholder="Search merchants"
      exportName="participant-merchants"
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
      leftExtra={(
        <>
          <Button variant="primary" size="sm" icon="upload" onClick={() => toast.notify('Import — choose a merchant file to upload.')}>Import</Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(routes.liveParticipants)}>Back to participants</Button>
        </>
      )}
      empty="No merchants for this participant."
    />
  );
}

export default ParticipantMerchants;
