/**
 * ERT — Emergency Response Team notifications.
 *
 * Tickets and alerts routed between operations desks, the risk engine and
 * participants.
 *
 * NOTE ON THE TABS. Unlike the participant funnel, the ERT tabs are NOT a
 * partition — they overlap. A ticket can be In Progress *and* Over Due *and*
 * Assigned, so the counts deliberately sum to more than the total. Each tab is
 * an independent predicate (see `ERT_TABS`) rather than a bucket lookup, which
 * is the honest model for "show me everything overdue" sitting beside "show me
 * everything new".
 */

import { toStamp, today } from '@/utils/format';

const TODAY = '2026/08/20';

/** Rows are written out — the descriptions carry the operational narrative. */
export const ERT_NOTIFICATIONS = [
  { id: '1000047', status: 'Closed', created: '2026/08/07', due: '2026/08/11', sender: 'Internal Operations', recipient: 'Barclays', recipientCode: '20-26-78', priority: 'low', assignee: 'Barclays Operations', type: 'Message', description: 'NOTICE: Late Claim Reimbursement Fee applied to the July settlement cycle.', closed: '2026/08/11' },
  { id: '1000046', status: 'New', created: '2026/08/14', due: '2026/08/17', sender: 'System', recipient: 'Operations', recipientCode: 'Level 2', priority: 'high', assignee: '', type: 'Internal Alert', description: 'Onboarding error received for participant record — bank detail validation failed.', closed: '' },
  { id: '1000045', status: 'In Progress', created: '2026/08/13', due: '2026/08/17', sender: 'System', recipient: 'Operations', recipientCode: 'Level 1', priority: 'medium', assignee: 'Agent U147890', type: 'Risk Alert', description: 'Participant 10-02-54 has 4 unreceived Claim responses past the response window.', closed: '' },
  { id: '1000044', status: 'In Progress', created: '2026/08/12', due: '2026/08/19', sender: 'Risk Engine', recipient: 'Fraud Operations', recipientCode: 'Risk Tier 1', priority: 'high', assignee: 'Agent K401773', type: 'Risk Alert', description: 'Velocity rule tripped on a single card across six merchants inside one hour.', closed: '' },
  { id: '1000043', status: 'Pending', created: '2026/08/11', due: '2026/08/20', sender: 'Customer Services', recipient: 'Relationship Team', recipientCode: 'CS-07', priority: 'medium', assignee: 'Agent M223511', type: 'Message', description: 'Participant asked for a written summary of the reserve release schedule.', closed: '' },
  { id: '1000042', status: 'Closed', created: '2026/08/10', due: '2026/08/14', sender: 'Internal Operations', recipient: 'Lloyds Bank', recipientCode: '30-96-35', priority: 'low', assignee: 'Agent T008411', type: 'Message', description: 'Monthly statement delivery confirmed for all merchants in the portfolio.', closed: '2026/08/13' },
  { id: '1000041', status: 'Assigned', created: '2026/08/09', due: '2026/08/12', sender: 'System', recipient: 'Operations', recipientCode: 'Level 2', priority: 'high', assignee: 'Agent G044821', type: 'Internal Alert', description: 'Settlement file arrived with a record count mismatch against the control total.', closed: '' },
  { id: '1000040', status: 'In Progress', created: '2026/08/08', due: '2026/08/18', sender: 'Reconciliation Engine', recipient: 'Operations', recipientCode: 'Level 1', priority: 'medium', assignee: 'Agent R338101', type: 'Internal Alert', description: 'Two funding deposits could not be matched to a settlement batch.', closed: '' },
  { id: '1000039', status: 'Closed', created: '2026/08/06', due: '2026/08/10', sender: 'Risk Engine', recipient: 'Fraud Operations', recipientCode: 'Risk Tier 2', priority: 'high', assignee: 'Agent K401773', type: 'Risk Alert', description: 'Chargeback ratio crossed the contractual ceiling for a high-volume merchant.', closed: '2026/08/09' },
  { id: '1000038', status: 'In Progress', created: '2026/08/05', due: '2026/08/07', sender: 'System', recipient: 'Operations', recipientCode: 'Level 2', priority: 'high', assignee: 'Agent G044821', type: 'Internal Alert', description: 'Overdue Reimbursement for Participant 40-11-99 has passed its funding date.', closed: '' },
  { id: '1000037', status: 'Assigned', created: '2026/08/04', due: '2026/08/20', sender: 'Customer Services', recipient: 'Settlement Desk', recipientCode: 'Ops Queue', priority: 'medium', assignee: 'Agent T008411', type: 'Message', description: 'Merchant queried an interchange qualification downgrade on a large batch.', closed: '' },
  { id: '1000036', status: 'Closed', created: '2026/08/03', due: '2026/08/06', sender: 'Internal Operations', recipient: 'HSBC', recipientCode: '40-12-76', priority: 'low', assignee: 'Agent M223511', type: 'Message', description: 'Confirmed receipt of the updated beneficial owner documentation.', closed: '2026/08/05' },
  { id: '1000035', status: 'Assigned', created: '2026/08/02', due: '2026/08/06', sender: 'System', recipient: 'Supervisor', recipientCode: 'Level 3', priority: 'high', assignee: 'Agent R190663', type: 'Internal Alert', description: 'Underwriting queue exceeded its service level for the second day running.', closed: '' },
  { id: '1000034', status: 'Closed', created: '2026/07/31', due: '2026/08/05', sender: 'System', recipient: 'Supervisor', recipientCode: 'Level 3', priority: 'high', assignee: 'Agent R190663', type: 'Risk Alert', description: 'Underwriting task for Participant 20-23-11 was reassigned after no action.', closed: '2026/08/04' },
  { id: '1000033', status: 'Pending', created: '2026/07/28', due: '2026/07/31', sender: 'Customer Services', recipient: 'Settlement Desk', recipientCode: 'Ops Queue', priority: 'high', assignee: 'Agent T008411', type: 'Message', description: 'Merchant dispute payout delay requires coordinated follow-up.', closed: '' },
  { id: '1000032', status: 'Closed', created: '2026/07/20', due: '2026/07/23', sender: 'Reconciliation Engine', recipient: 'Operations', recipientCode: 'Level 1', priority: 'high', assignee: 'Agent R338101', type: 'Internal Alert', description: 'Recovery batch could not match two prior settlement files.', closed: '2026/07/22' },
  { id: '1000031', status: 'In Progress', created: '2026/07/13', due: '2026/07/15', sender: 'Risk Engine', recipient: 'Fraud Operations', recipientCode: 'Risk Tier 2', priority: 'high', assignee: 'Agent K401773', type: 'Risk Alert', description: 'Exposure threshold breached following concentrated refund activity.', closed: '' },
  { id: '1000030', status: 'Closed', created: '2026/07/03', due: '2026/07/07', sender: 'Customer Services', recipient: 'Relationship Team', recipientCode: 'CS-07', priority: 'low', assignee: 'Agent M223511', type: 'Message', description: 'Customer requested confirmation on reimbursement timeline.', closed: '2026/07/06' },
  { id: '1000029', status: 'Closed', created: '2026/07/01', due: '2026/07/04', sender: 'Internal Operations', recipient: 'Santander UK', recipientCode: '72-00-00', priority: 'low', assignee: 'Agent M223511', type: 'Message', description: 'Annual fee schedule review completed and countersigned.', closed: '2026/07/03' },
  { id: '1000028', status: 'Closed', created: '2026/06/28', due: '2026/07/02', sender: 'System', recipient: 'Operations', recipientCode: 'Level 1', priority: 'medium', assignee: 'Agent U147890', type: 'Internal Alert', description: 'Nightly participant sync completed with three deferred records.', closed: '2026/07/01' },
  { id: '1000027', status: 'Closed', created: '2026/06/25', due: '2026/06/29', sender: 'Risk Engine', recipient: 'Fraud Operations', recipientCode: 'Risk Tier 3', priority: 'medium', assignee: 'Agent K401773', type: 'Risk Alert', description: 'Device fingerprint reuse detected across two unrelated merchant accounts.', closed: '2026/06/28' },
  { id: '1000026', status: 'Closed', created: '2026/06/20', due: '2026/06/24', sender: 'Customer Services', recipient: 'Relationship Team', recipientCode: 'CS-04', priority: 'low', assignee: 'Agent T008411', type: 'Message', description: 'Quarterly service review scheduled with the participant relationship lead.', closed: '2026/06/23' },
];

/* ------------------------------------------------------------------ *
 * Tabs — overlapping predicates, not a partition
 * ------------------------------------------------------------------ */

const isOpen = (r) => r.status !== 'Closed';

export const ERT_TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'overdue', label: 'Over Due', tone: 'danger', match: (r) => isOpen(r) && r.due < TODAY },
  { value: 'due_today', label: 'Due Today', match: (r) => isOpen(r) && r.due === TODAY },
  { value: 'assigned', label: 'Assigned', match: (r) => Boolean(r.assignee) && isOpen(r) },
  { value: 'new', label: 'New', match: (r) => r.status === 'New' },
  { value: 'in_progress', label: 'In Progress', match: (r) => r.status === 'In Progress' },
  { value: 'pending', label: 'Pending', match: (r) => r.status === 'Pending' },
  { value: 'closed', label: 'Closed', match: (r) => r.status === 'Closed' },
];

export function ertTabs(rows) {
  return ERT_TABS.map((t) => ({ ...t, count: rows.filter(t.match).length }));
}

export function filterErt(rows, tab) {
  const spec = ERT_TABS.find((t) => t.value === tab) ?? ERT_TABS[0];
  return rows.filter(spec.match);
}

export const ERT_STATUSES = ['New', 'Assigned', 'In Progress', 'Pending', 'Closed'];

/** Next notification id, so a created ticket lands at the top of the list. */
export const nextErtId = (rows) =>
  String(Math.max(...rows.map((r) => Number(r.id))) + 1);

export const ertToday = () => toStamp(today());
