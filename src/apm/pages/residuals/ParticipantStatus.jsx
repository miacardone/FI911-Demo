import { ListPage } from '@/components/fi911/ListPage';
import { Muted, StatusBadge, TwoLine } from '@/components/fi911/cells';
import { PARTICIPANT_STATUS } from '@/apm/data/residuals';

/** Participant Status — which portfolio each participant sits in, and whether
 *  that assignment is still open. */

const columns = [
  {
    key: 'participant', header: 'Participant Name', fw: 18, sortable: true,
    cell: (r) => <TwoLine primary={r.participant} secondary={r.sortCode} />,
    text: (r) => `${r.participant} ${r.sortCode}`,
  },
  {
    key: 'partner', header: 'Partner', fw: 16, sortable: true,
    cell: (r) => (r.partner ? <TwoLine primary={r.partner} secondary={`[${r.partnerCode}]`} /> : <Muted>—</Muted>),
    text: (r) => `${r.partner} ${r.partnerCode}`,
  },
  {
    key: 'portfolio', header: 'Portfolio', fw: 22, sortable: true,
    cell: (r) => <TwoLine primary={r.portfolio} secondary={`Type: ${r.portfolioType}`} />,
    text: (r) => `${r.portfolio} ${r.portfolioType}`,
  },
  { key: 'open', header: 'Open Date', fw: 10, sortable: true, cell: (r) => (r.open ? r.open : <Muted>—</Muted>) },
  { key: 'close', header: 'Close Date', fw: 10, sortable: true, cell: (r) => (r.close ? r.close : <Muted>—</Muted>) },
  { key: 'status', header: 'Status', fw: 9, sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
];

export function ParticipantStatus() {
  return (
    <ListPage
      title="Participant Status"
      description="View current participant portfolio assignments and status"
      columns={columns}
      rows={PARTICIPANT_STATUS}
      searchPlaceholder="Search participants"
      exportName="participant-status"
      empty="No participants assigned."
    />
  );
}

export default ParticipantStatus;
