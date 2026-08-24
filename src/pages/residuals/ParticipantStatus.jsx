import { ListPage } from '@/components/fi911/ListPage';
import { Muted, StatusBadge, TwoLine } from '@/components/fi911/cells';
import { PARTICIPANT_STATUS } from '@/data/residuals';

/** Participant Status — which portfolio each participant sits in, and whether
 *  that assignment is still open. */

const columns = [
  {
    key: 'merchant', header: 'Merchant Name', fw: 18, sortable: true,
    cell: (r) => <TwoLine primary={r.participant} secondary={r.routingNumber} />,
    text: (r) => `${r.merchant} ${r.routingNumber}`,
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
      title="Merchant Status"
      description="View current merchant portfolio assignments and status"
      columns={columns}
      rows={PARTICIPANT_STATUS}
      searchPlaceholder="Search merchants"
      exportName="merchant-status"
      empty="No merchants assigned."
    />
  );
}

export default ParticipantStatus;
