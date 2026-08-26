/**
 * RISK QUEUES — Work Queue, Action History, Unactioned Queue.
 *
 * Taken from the live product's Risk section. Three observations shaped what
 * is stored here rather than what the reference stores:
 *
 *  · The reference prints alert codes as bare three-letter badges (AAT, ABT,
 *    AMV … "more") and hides their meanings in one shared legend tooltip. The
 *    meanings are attached to the codes themselves here, so a badge can carry
 *    its own explanation and the legend becomes a convenience, not a
 *    requirement.
 *  · The Work Queue is a QUEUE, but the reference gives no ordering signal —
 *    every row looks equally urgent. A composite `triageScore` is stored so
 *    the list can lead with the merchant that actually needs opening first.
 *  · The Unactioned Queue exists because something was alerted and nobody
 *    acted. That only means anything with an AGE, so `daysUnactioned` is
 *    recorded and drives the breach warning.
 */

import { createDraw } from '@/data/rng';
import { MERCHANTS, PARTNERS, RISK_MERCHANTS, midFor, routingNumberFor } from '@/data/reference';
import { ASSIGNEES, CONTACTS, CURRENT_USER, emailFor } from '@/data/people';
import brand from '@/brand/brand.config';

/* ------------------------------------------------------------------ *
 * Alert codes
 * ------------------------------------------------------------------ *
 * `scope` says whether the rule fires on a whole settlement batch or on one
 * transaction — the reference has separate "Batch Alert" and "Trans Alert"
 * columns but no way to tell which codes belong in which, so the same code
 * can appear under either heading and look like a bug.
 */

export const ALERT_CODES = [
  { code: 'AAT', label: 'Average Amount Trending', scope: 'batch', severity: 'medium' },
  { code: 'ABT', label: 'Average Batch Trending', scope: 'batch', severity: 'medium' },
  { code: 'ABV', label: 'Excessive Average Batch Volume', scope: 'batch', severity: 'high' },
  { code: 'AMV', label: 'Exceeds Average Monthly Volume', scope: 'batch', severity: 'high' },
  { code: 'APV', label: 'Exceeds Actual Daily Processing Volume', scope: 'batch', severity: 'high' },
  { code: 'DAT', label: 'Exceeds Daily Average Ticket', scope: 'batch', severity: 'medium' },
  { code: 'DDM', label: 'Daily Deposit Over Maximum', scope: 'batch', severity: 'high' },
  { code: 'DPV', label: 'Daily Processing Volume Over By %', scope: 'batch', severity: 'medium' },
  { code: 'EWB', label: 'Exceeds Weekly Batches', scope: 'batch', severity: 'low' },
  { code: 'NGB', label: 'Negative Batch', scope: 'batch', severity: 'high' },
  { code: 'PSV', label: 'Prior Settlement Variance', scope: 'batch', severity: 'low' },

  { code: 'DBN', label: 'Duplicate BIN', scope: 'trans', severity: 'medium' },
  { code: 'DPC', label: 'Duplicate Card', scope: 'trans', severity: 'high' },
  { code: 'EDF', label: 'Even Dollar Floor', scope: 'trans', severity: 'low' },
  { code: 'EHT', label: 'Exceeds High Ticket', scope: 'trans', severity: 'high' },
  { code: 'ETH', label: 'Exceeds Ticket Threshold', scope: 'trans', severity: 'medium' },
  { code: 'FCB', label: 'Foreign Card BIN', scope: 'trans', severity: 'medium' },
  { code: 'SAM', label: 'Same Amount', scope: 'trans', severity: 'low' },
  { code: 'BDR', label: 'Below Decline Ratio', scope: 'trans', severity: 'low' },
];

const BY_CODE = Object.fromEntries(ALERT_CODES.map((a) => [a.code, a]));

export const alertCode = (code) => BY_CODE[code] ?? { code, label: code, scope: 'trans', severity: 'low' };

export const BATCH_CODES = ALERT_CODES.filter((a) => a.scope === 'batch').map((a) => a.code);
export const TRANS_CODES = ALERT_CODES.filter((a) => a.scope === 'trans').map((a) => a.code);

const SEVERITY_WEIGHT = { high: 3, medium: 2, low: 1 };

/** How loud a set of codes is, in one number. Drives triage ordering. */
export const alertWeight = (codes = []) =>
  codes.reduce((s, c) => s + (SEVERITY_WEIGHT[alertCode(c).severity] ?? 1), 0);

/* ------------------------------------------------------------------ *
 * Work Queue — Flagged
 * ------------------------------------------------------------------ */

const MERCHANT_STATUSES = ['OnBoarded', 'Active', 'Merchant On Hold'];

export const WORK_QUEUE = (() => {
  const d = createDraw(9101);

  const rows = RISK_MERCHANTS.slice(0, 14).map((m, i) => {
    const partner = d.pick(PARTNERS);
    const flagged = d.money(1800, 62000);
    const totalSettlement = flagged + d.money(0, 24000);
    const declined = d.bool(0.35) ? d.money(40, 1400) : 0;
    const approved = d.bool(0.55) ? d.money(120, 9800) : 0;
    const riskCodes = d.sample(BATCH_CODES, d.int(2, 6));
    const cbCodes = d.bool(0.35) ? d.sample(TRANS_CODES, d.int(1, 2)) : [];

    const mcbAmountRatio = Math.round(d.float(0, 34) * 100) / 100;
    const mcbCountRatio = Math.round(d.float(0, 39) * 100) / 100;

    return {
      id: `wq-${i}`,
      mid: midFor(m.name, 14),
      merchant: m.name,
      partnerCode: partner.code,
      partner: partner.name,
      merchantStatus: d.pick(MERCHANT_STATUSES),
      mcc: m.mcc,
      flaggedSettlement: flagged,
      totalSettlement,
      transactionDate: `2026/08/${String(d.int(15, 21)).padStart(2, '0')}`,
      approvedAmount: approved,
      declinedAmount: declined,
      riskAlerts: riskCodes,
      dav: d.bool(0.4) ? d.money(0, 400) : 0,
      dpv: d.bool(0.5) ? d.money(0, 260) : 0,
      totalAuth: d.money(0, 5400),
      declinePercent: Math.round(d.float(0, 6) * 100) / 100,
      mcbAmountRatio,
      mcbCountRatio,
      cbAlerts: cbCodes,
      assignedUser: d.bool(0.55) ? d.pick(ASSIGNEES) : '',
      tier: m.tier,
      processor: m.processor,
      txnCount: d.int(40, 480),
    };
  });

  /* Triage: how loud the alerts are, how much money is exposed, and how bad
     the chargeback ratio already is. The reference offers no ordering at all,
     so an operator opens rows top-to-bottom and finds the worst case last. */
  const maxFlagged = Math.max(...rows.map((r) => r.flaggedSettlement));

  return rows
    .map((r) => ({
      ...r,
      triageScore: Math.round(
        alertWeight(r.riskAlerts) * 4
        + (r.flaggedSettlement / maxFlagged) * 30
        + Math.min(r.mcbAmountRatio, 30)
        + (r.cbAlerts.length ? 8 : 0),
      ),
    }))
    .sort((a, b) => b.triageScore - a.triageScore);
})();

export const WORK_QUEUE_TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'unassigned', label: 'Unassigned', match: (r) => !r.assignedUser },
  { value: 'mine', label: 'Assigned to me', match: (r) => r.assignedUser === CURRENT_USER.name },
  { value: 'severe', label: 'High exposure', match: (r) => r.triageScore >= 45 },
  { value: 'cb', label: 'Chargeback alerts', match: (r) => r.cbAlerts.length > 0 },
];

/** Assignment filter options with live counts — the reference shows "All (7)". */
export function assignmentOptions(rows = WORK_QUEUE) {
  const names = [...new Set(rows.map((r) => r.assignedUser).filter(Boolean))].sort();
  return [
    { value: '', label: `All (${rows.length})` },
    { value: '__none', label: `Unassigned (${rows.filter((r) => !r.assignedUser).length})` },
    ...names.map((n) => ({ value: n, label: `${n} (${rows.filter((r) => r.assignedUser === n).length})` })),
  ];
}

/* ------------------------------------------------------------------ *
 * Work Queue — Batch File Processing
 * ------------------------------------------------------------------ *
 * The reference renders this tab empty. An import log that shows nothing
 * cannot tell you whether last night's settlement file landed, which is the
 * only reason to open it.
 */

const RULE_GROUPS = ['Standard Settlement', 'High Risk MCC', 'New Merchant 90d', 'Card Not Present'];

export const BATCH_FILES = (() => {
  const d = createDraw(9102);

  return Array.from({ length: 18 }, (_, i) => {
    const day = 21 - Math.floor(i / 3);
    const start = `${String(d.int(1, 5)).padStart(2, '0')}:${String(d.int(0, 59)).padStart(2, '0')}`;
    const minutes = d.int(2, 47);
    const status = d.weighted([['Completed', 7], ['Completed with errors', 2], ['Failed', 1], ['In Progress', 1]]);
    const txnCount = d.int(1200, 96000);

    return {
      id: `bf-${i}`,
      batchId: `BF-${2026080000 + i * 7}`,
      fileName: `${d.pick(brand.processors).toLowerCase().replace(/[^a-z]/g, '')}_settle_2026${String(day).padStart(2, '0')}.csv`,
      startedAt: `2026/08/${String(day).padStart(2, '0')} ${start}`,
      endedAt: status === 'In Progress' ? '' : `2026/08/${String(day).padStart(2, '0')} ${start.slice(0, 3)}${String((Number(start.slice(3)) + minutes) % 60).padStart(2, '0')}`,
      durationMinutes: status === 'In Progress' ? null : minutes,
      txnCount,
      txnVolume: d.money(140000, 6400000),
      scopeEvaluation: d.pick(['Settlement', 'Authorization']),
      ruleGroup: d.pick(RULE_GROUPS),
      importedFiles: d.int(1, 4),
      flaggedCount: d.int(0, 42),
      status,
      processor: d.pick(brand.processors),
    };
  });
})();

export const BATCH_FILE_TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'running', label: 'In Progress', match: (r) => r.status === 'In Progress' },
  { value: 'problem', label: 'Needs attention', match: (r) => r.status === 'Failed' || r.status === 'Completed with errors' },
  { value: 'done', label: 'Completed', match: (r) => r.status === 'Completed' },
];

/* ------------------------------------------------------------------ *
 * Flagged transactions behind one work-queue merchant
 * ------------------------------------------------------------------ */

const POS_MODES = ['Sale', 'Capt', 'Authonly', 'Credit'];
const ENTRY_MODES = ['Chip', 'Swiped', 'Keyed', 'Contactless', 'E-Commerce'];

export function queueTransactions(mid, seed = 9103) {
  const d = createDraw(seed + (Number(String(mid).slice(-4)) || 0));

  return Array.from({ length: d.int(18, 34) }, (_, i) => {
    const batch = d.sample(BATCH_CODES, d.int(1, 4));
    const trans = d.bool(0.55) ? d.sample(TRANS_CODES, d.int(1, 2)) : [];
    const flaggedStatus = d.weighted([['Flagged', 6], ['Declined', 2], ['Released', 2]]);

    return {
      id: `qt-${mid}-${i}`,
      transactionId: `${d.digits(4)}${String.fromCharCode(65 + d.int(0, 25))}${d.digits(6)}`.toUpperCase(),
      amount: d.money(7, 640),
      entryMode: d.pick(ENTRY_MODES),
      transactionType: d.pick(POS_MODES),
      cardNumber: `${'X'.repeat(12)}${d.digits(4)}`,
      batchAlerts: batch,
      transAlerts: trans,
      transactionDate: `2026/08/${String(d.int(18, 21)).padStart(2, '0')}`,
      /* The reference shows a bare "Chargeback Probability" percentage with no
         basis. Deriving it from the alert weight at least makes it consistent
         with the badges sitting next to it. */
      chargebackProbability: Math.min(
        99,
        Math.round((alertWeight(batch) + alertWeight(trans)) * d.float(2.4, 5.8) * 10) / 10,
      ),
      processor: d.pick(brand.processors),
      flaggedStatus,
      fileSource: d.pick(['Settlement', 'Authorization']),
      caseId: flaggedStatus === 'Flagged' ? '' : String(21082900 + i),
    };
  }).sort((a, b) => b.chargebackProbability - a.chargebackProbability);
}

export const workQueueRow = (mid) => WORK_QUEUE.find((r) => r.mid === mid) ?? WORK_QUEUE[0];

/* ------------------------------------------------------------------ *
 * Merchant profile
 * ------------------------------------------------------------------ *
 * An analyst who opens a work-queue row needs to answer one question before
 * touching a transaction: is this merchant behaving outside what underwriting
 * actually approved? So the profile stores the APPROVED figures next to the
 * OBSERVED ones — a monthly cap next to month-to-date volume, an approved
 * average ticket next to the real one — and derives the variance rather than
 * leaving the analyst to divide two numbers in their head.
 */

const STREETS = ['Ashford Way', 'Kestrel Ridge Rd', 'Beaumont Ave', 'Lockridge St', 'Fairmount Blvd', 'Windsor Park Dr', 'Halstead Ln', 'Verona Ct'];
const CITY_STATE = [
  ['Charlotte', 'NC', '282'], ['Columbus', 'OH', '432'], ['Tempe', 'AZ', '852'],
  ['Plano', 'TX', '750'], ['Naperville', 'IL', '605'], ['Boise', 'ID', '837'],
  ['Alpharetta', 'GA', '300'], ['Bellevue', 'WA', '980'],
];
const ENTITY_TYPES = ['LLC', 'S-Corporation', 'C-Corporation', 'Sole Proprietorship'];
const RESERVE_TYPES = ['Rolling', 'Capped', 'Upfront', 'None'];

export function merchantProfile(mid) {
  const row = workQueueRow(mid);
  const d = createDraw(9105 + (Number(String(row.mid).slice(-5)) || 0));

  const [city, state, zipPrefix] = d.pick(CITY_STATE);
  const contact = d.pick(CONTACTS);
  const mccEntry = brand.mccs.find((m) => m.code === row.mcc) ?? brand.mccs[0];

  /* Approved at underwriting; the observed figures are what the merchant is
     actually doing this month. The gap between them is the whole point. */
  const approvedMonthly = d.money(180_000, 2_400_000);
  const approvedAverageTicket = d.money(45, 520);
  const approvedHighTicket = approvedAverageTicket * d.int(6, 14);
  const monthToDateVolume = Math.round(approvedMonthly * d.float(0.42, 1.38));
  const averageTicket = Math.round(approvedAverageTicket * d.float(0.7, 2.1) * 100) / 100;
  const highestTicket = Math.round(averageTicket * d.int(4, 19) * 100) / 100;

  const reserveType = d.weighted([['Rolling', 5], ['Capped', 2], ['None', 2], ['Upfront', 1]]);

  return {
    ...row,

    /* Identity */
    dbaName: row.merchant,
    legalName: `${row.merchant.replace(/ (LLC|Inc|Co|Ltd)$/, '')} LLC`,
    entityType: d.pick(ENTITY_TYPES),
    taxId: `${d.int(10, 99)}-${d.digits(7)}`,
    descriptor: row.merchant.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12),
    mccLabel: mccEntry.label,
    website: `www.${row.merchant.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,

    /* Where it is and who answers the phone */
    addressLine: `${d.int(100, 9800)} ${d.pick(STREETS)}`,
    city,
    state,
    zip: `${zipPrefix}${d.digits(2)}`,
    contactName: contact,
    contactPhone: `(${d.int(201, 989)}) ${d.int(200, 999)}-${d.digits(4)}`,
    contactEmail: emailFor(contact, `${row.merchant.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`),

    /* Banking and processing */
    routingNumber: routingNumberFor(row.merchant),
    accountNumber: `••••${d.digits(4)}`,
    acquirer: d.pick(brand.processors),
    openDate: `20${d.int(15, 24)}/${String(d.int(1, 12)).padStart(2, '0')}/${String(d.int(1, 28)).padStart(2, '0')}`,
    lastReviewDate: `2026/0${d.int(4, 8)}/${String(d.int(1, 28)).padStart(2, '0')}`,

    /* Approved vs observed — the reason this page exists */
    approvedMonthly,
    monthToDateVolume,
    approvedAverageTicket,
    averageTicket,
    approvedHighTicket,
    highestTicket,

    /* Exposure */
    reserveType,
    reservePercent: reserveType === 'None' ? 0 : Math.round(d.float(2, 12) * 10) / 10,
    reserveHeld: reserveType === 'None' ? 0 : d.money(4_000, 190_000),
    rollingDays: reserveType === 'Rolling' ? d.pick([90, 120, 180]) : null,

    /* Chargeback history — twelve months, most recent last */
    chargebackHistory: Array.from({ length: 12 }, (_, i) => ({
      label: `2025/${String(((i + 8) % 12) + 1).padStart(2, '0')}`,
      value: Math.round(d.float(0.1, Math.max(0.4, row.mcbAmountRatio)) * 100) / 100,
    })),
  };
}

/* The variance an analyst is really asking about: how far past the approved
   ceiling is this merchant running? Returned as a percentage delta so a
   single sign test says whether it is a problem. */
export const variance = (observed, approved) =>
  (approved ? Math.round(((observed - approved) / approved) * 1000) / 10 : 0);

/* Settlement batches belonging to ONE merchant. The page-level Batch File
   Processing tab lists every file the platform ingested; this answers the
   narrower question an analyst asks from a merchant row — which of THIS
   merchant's batches tripped something. */
export function merchantBatches(mid) {
  const row = workQueueRow(mid);
  const d = createDraw(9106 + (Number(String(row.mid).slice(-5)) || 0));

  return Array.from({ length: d.int(6, 11) }, (_, i) => {
    const day = 21 - i;
    const txnCount = d.int(18, 640);
    const flaggedCount = d.bool(0.55) ? d.int(1, Math.max(2, Math.round(txnCount * 0.14))) : 0;
    const grossAmount = d.money(2_400, 148_000);
    const codes = flaggedCount ? d.sample(BATCH_CODES, d.int(1, 3)) : [];

    return {
      id: `mb-${row.mid}-${i}`,
      batchId: `B${2026080000 + i * 13 + (Number(String(row.mid).slice(-3)) || 0)}`,
      settlementDate: `2026/08/${String(day).padStart(2, '0')}`,
      submittedAt: `${String(d.int(1, 6)).padStart(2, '0')}:${String(d.int(0, 59)).padStart(2, '0')}`,
      txnCount,
      flaggedCount,
      grossAmount,
      netAmount: grossAmount - d.money(20, 900),
      batchAlerts: codes,
      scopeEvaluation: d.pick(['Settlement', 'Authorization']),
      processor: row.processor,
      status: flaggedCount ? d.weighted([['Held', 3], ['Released', 4], ['Under Review', 2]]) : 'Settled',
    };
  });
}

/* ------------------------------------------------------------------ *
 * Action History
 * ------------------------------------------------------------------ *
 * Everything an operator has already decided, plus the case that decision
 * belongs to. The reference links "View Comments" and "View Attachments" to
 * nothing; the comments and attachments live on the record here so the drawer
 * can actually show them.
 */

const CASE_STATUSES = ['Resolved', 'Under Review', 'Escalated', 'Closed — No Action'];
const CASE_PRIORITY = [['low', 5], ['medium', 3], ['high', 2]];

const COMMENT_TEXT = [
  'Merchant confirmed the batch was a legitimate seasonal promotion. Released.',
  'Called the listed contact — no answer. Holding pending callback.',
  'Duplicate card pattern matches a known tokenisation retry. No action.',
  'Ticket value well above the approved average. Declined and merchant notified.',
  'Underwriting raised the monthly cap last week; alert is stale.',
  'Funds held pending receipt of the last three bank statements.',
];

export const ACTION_HISTORY = (() => {
  const d = createDraw(9104);

  return Array.from({ length: 46 }, (_, i) => {
    const m = d.pick(RISK_MERCHANTS.slice(0, 14));
    const partner = d.pick(PARTNERS);
    const batch = d.sample(BATCH_CODES, d.int(2, 4));
    const trans = d.bool(0.5) ? d.sample(TRANS_CODES, 1) : [];
    const actionStatus = d.weighted([['Released', 5], ['Declined', 3], ['Held', 2]]);
    const alertDay = d.int(1, 18);
    const actionDay = Math.min(alertDay + d.int(0, 6), 21);
    const amount = d.money(12, 1200);

    return {
      id: `ah-${i}`,
      transactionId: `${d.digits(9)}`,
      mid: midFor(m.name, 14),
      merchant: m.name,
      partner: partner.name,
      transactionDate: `2026/08/${String(alertDay).padStart(2, '0')}`,
      amount,
      entryMode: d.pick(ENTRY_MODES),
      transactionType: d.pick(POS_MODES),
      sourceType: d.pick(['Settlement', 'Authorization']),
      cardNumber: `${'X'.repeat(12)}${d.digits(4)}`,
      scheme: d.pick(['visa', 'mastercard', 'amex', 'discover']),
      batchAlerts: batch,
      transAlerts: trans,
      alertDate: `2026/08/${String(alertDay).padStart(2, '0')}`,
      actionStatus,
      actionDate: `2026/08/${String(actionDay).padStart(2, '0')}`,
      /* Time-to-decision — the number that says whether the risk desk is
         keeping up. The reference stores both dates and computes nothing. */
      responseDays: actionDay - alertDay,
      case: {
        caseId: String(21082900 + i),
        priority: d.weighted(CASE_PRIORITY),
        flaggedAmount: amount,
        totalSettlements: amount + d.money(0, 6400),
        riskScore: d.int(0, 92),
        createdDate: `2026/08/${String(alertDay).padStart(2, '0')}`,
        assignedTo: d.bool(0.7) ? d.pick(ASSIGNEES) : '',
        caseStatus: d.pick(CASE_STATUSES),
        flaggedRules: [...batch, ...trans],
        comments: Array.from({ length: d.int(0, 3) }, (_, c) => ({
          id: `c-${i}-${c}`,
          author: d.pick([CURRENT_USER.name, ...ASSIGNEES.slice(0, 4)]),
          date: `2026/08/${String(Math.min(alertDay + c, 21)).padStart(2, '0')}`,
          text: d.pick(COMMENT_TEXT),
        })),
        attachments: Array.from({ length: d.int(0, 2) }, (_, a) => ({
          id: `at-${i}-${a}`,
          name: d.pick(['bank_statement_jul.pdf', 'merchant_response.eml', 'batch_extract.csv', 'call_notes.pdf']),
          sizeMb: Math.round(d.float(0.1, 4.2) * 10) / 10,
        })),
      },
    };
  });
})();

export const ACTION_TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'declined', label: 'Declined', match: (r) => r.actionStatus === 'Declined' },
  { value: 'released', label: 'Released', match: (r) => r.actionStatus === 'Released' },
  { value: 'held', label: 'Held', match: (r) => r.actionStatus === 'Held' },
  { value: 'open', label: 'Case open', match: (r) => r.case.caseStatus === 'Under Review' || r.case.caseStatus === 'Escalated' },
];

/* ------------------------------------------------------------------ *
 * Unactioned Queue
 * ------------------------------------------------------------------ *
 * Alerted, never decided. The reference lists these with an Alert Date and
 * leaves you to subtract; the age and the SLA breach are stored here because
 * age is the entire point of the screen.
 */

export const UNACTIONED_SLA_DAYS = 5;

export const UNACTIONED = (() => {
  const d = createDraw(9105);
  const today = 21;

  return Array.from({ length: 38 }, (_, i) => {
    const merchant = d.pick([...RISK_MERCHANTS.slice(0, 10).map((m) => m.name), ...MERCHANTS.slice(0, 6)]);
    const alertDay = d.int(3, 20);
    const batch = d.bool(0.75) ? d.sample(BATCH_CODES, d.int(1, 2)) : [];
    const trans = batch.length ? (d.bool(0.3) ? d.sample(TRANS_CODES, 1) : []) : d.sample(TRANS_CODES, 1);
    const age = today - alertDay;

    return {
      id: `uq-${i}`,
      transactionId: `${d.digits(8)}${String.fromCharCode(65 + d.int(0, 25))}${String.fromCharCode(65 + d.int(0, 25))}`,
      mid: midFor(merchant, 14),
      merchant,
      amount: d.money(0, 620),
      entryMode: d.pick(ENTRY_MODES),
      transactionType: d.pick(POS_MODES),
      cardNumber: `${'X'.repeat(11)}${d.digits(4)}`,
      scheme: d.pick(['visa', 'mastercard', 'amex', 'discover']),
      batchAlerts: batch,
      transAlerts: trans,
      alertDate: `2026/08/${String(alertDay).padStart(2, '0')}`,
      transactionDate: `2026/08/${String(Math.max(alertDay - d.int(0, 3), 1)).padStart(2, '0')}`,
      daysUnactioned: age,
      breached: age > UNACTIONED_SLA_DAYS,
      processor: d.pick(brand.processors),
    };
  }).sort((a, b) => b.daysUnactioned - a.daysUnactioned);
})();

export const UNACTIONED_TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'breached', label: 'Past SLA', match: (r) => r.breached },
  { value: 'due', label: 'Due today', match: (r) => r.daysUnactioned === UNACTIONED_SLA_DAYS },
  { value: 'fresh', label: 'Within SLA', match: (r) => r.daysUnactioned < UNACTIONED_SLA_DAYS },
];

/** Headline for the Unactioned Queue — how far behind the desk actually is. */
export function unactionedSummary(rows = UNACTIONED) {
  const breached = rows.filter((r) => r.breached);
  const oldest = rows.reduce((m, r) => Math.max(m, r.daysUnactioned), 0);
  return {
    total: rows.length,
    breached: breached.length,
    exposure: Math.round(rows.reduce((s, r) => s + r.amount, 0) * 100) / 100,
    breachedExposure: Math.round(breached.reduce((s, r) => s + r.amount, 0) * 100) / 100,
    oldest,
  };
}

export default WORK_QUEUE;
