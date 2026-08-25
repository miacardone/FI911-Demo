/**
 * STATUS VOCABULARY.
 *
 * Fi911 carries a lot of status columns — participant lifecycle, ERT, alerts,
 * held volume, disputes, settlement, reserves, pay status — and the reference
 * uses different words in each. Enumerating every value in every module would
 * be a long list that goes stale the first time someone adds a status.
 *
 * So tone is resolved by MEANING instead: an explicit map for the values that
 * carry a specific colour, then keyword matching for the rest. A status this
 * file has never seen still renders as a sane neutral badge rather than
 * crashing or rendering untoned.
 */

/** Values whose tone is not guessable from their words. */
const EXPLICIT = {
  /* Participant lifecycle */
  'new lead': 'info',
  'wip lead': 'warning',
  'dead lead': 'danger',
  'dead contract': 'danger',
  'new contract': 'info',
  'esign initiated': 'warning',
  'esign completed': 'success',
  onboarded: 'primary',
  live: 'success',

  /* Review states */
  'in review': 'warning',
  'under review': 'warning',
  pend: 'warning',
  'pend response': 'warning',
  'missing information': 'danger',
  'merchant approval': 'warning',

  /* Alerts / MID */
  active: 'success',
  inactive: 'muted',
  suspended: 'danger',
  cleared: 'success',
  tagged: 'danger',

  /* Disputes */
  'do not represent': 'muted',
  expired: 'danger',
  retrieval: 'info',

  /* Money movement */
  held: 'warning',
  released: 'success',
  partial: 'info',
  paid: 'success',
  processing: 'info',
  'on hold': 'warning',
  success: 'success',
};

/** Keyword → tone, tested in order. First hit wins. */
const KEYWORDS = [
  [/(decline|reject|fail|dead|breach|overdue|violation|suspend|missing)/, 'danger'],
  [/(approve|complete|settle|success|clear|paid|won|release|onboard)/, 'success'],
  [/(pending|pend|progress|review|wip|initiat|hold|await|submit)/, 'warning'],
  [/(new|open|assigned|lead|contract|draft|retrieval)/, 'info'],
  [/(closed|archive|written off|inactive|expired)/, 'muted'],
];

const normalise = (value) => String(value ?? '').trim().toLowerCase().replace(/[_-]+/g, ' ');

export function statusTone(value) {
  const key = normalise(value);
  if (!key) return 'neutral';
  if (EXPLICIT[key]) return EXPLICIT[key];
  const hit = KEYWORDS.find(([re]) => re.test(key));
  return hit ? hit[1] : 'neutral';
}

/** Title-cases an id like `under_review` for display. */
export function statusLabel(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return '—';
  if (/[A-Z]/.test(raw) && raw !== raw.toLowerCase()) return raw; // already display-cased
  return raw.replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ *
 * Participant lifecycle
 * ------------------------------------------------------------------ *
 * The five funnel stages share one tab set — All / Assigned / New /
 * In Progress / Pending / Closed — and each stage's own statuses roll up into
 * one of those buckets. The rollup lives here so a tab count can never
 * disagree with the rows the tab shows.
 */

export const LIFECYCLE_TABS = ['all', 'assigned', 'new', 'in_progress', 'pending', 'closed'];

export const LIFECYCLE_TAB_LABELS = {
  all: 'All',
  assigned: 'Assigned',
  new: 'New',
  in_progress: 'In Progress',
  pending: 'Pending',
  closed: 'Closed',
};

export function lifecycleBucket(status) {
  const key = normalise(status);
  if (/(closed|dead|declined|onboarded|approved|complete)/.test(key)) return 'closed';
  if (/(pend|await|missing|hold)/.test(key)) return 'pending';
  if (/(progress|wip|review|initiat|underwriting|submitted)/.test(key)) return 'in_progress';
  if (/assigned/.test(key)) return 'assigned';
  return 'new';
}

/** Build the tab descriptors (with counts) for a lifecycle list. */
export function lifecycleTabs(rows, statusOf = (r) => r.status) {
  const counts = rows.reduce((acc, r) => {
    const b = lifecycleBucket(statusOf(r));
    acc[b] = (acc[b] ?? 0) + 1;
    return acc;
  }, {});

  return LIFECYCLE_TABS.map((value) => ({
    value,
    label: LIFECYCLE_TAB_LABELS[value],
    count: value === 'all' ? rows.length : (counts[value] ?? 0),
  }));
}

export function filterByLifecycle(rows, tab, statusOf = (r) => r.status) {
  if (tab === 'all') return rows;
  return rows.filter((r) => lifecycleBucket(statusOf(r)) === tab);
}

/* ------------------------------------------------------------------ *
 * Priority — ERT and Rules
 * ------------------------------------------------------------------ */

export const PRIORITIES = [
  { id: 'high', label: 'High', tone: 'danger', direction: 'up' },
  { id: 'medium', label: 'Medium', tone: 'warning', direction: 'up' },
  { id: 'low', label: 'Low', tone: 'success', direction: 'down' },
];

export const priorityMeta = (id) => PRIORITIES.find((p) => p.id === normalise(id)) ?? PRIORITIES[1];

export default statusTone;
