/**
 * REPORTS, DOCUMENTS and ALERTS.
 *
 * Three datasets taken from the live product's Reports / Document Center /
 * Chargebacks & Alerts screens.
 *
 * The productivity report is the interesting one: the live version is a flat
 * list of status changes, which tells you WHAT happened but not how long
 * anything took. Recording the previous status and the dwell time turns the
 * same rows into an answer to "where is the funnel slow" — see `dwellDays`.
 */

import { createDraw } from '@/eric/data/rng';
import { INSTITUTIONS, ISO_PORTFOLIOS, MERCHANTS, PARTNERS, REGIONS, midFor } from '@/eric/data/reference';
import { AGENTS, ASSIGNEES, CURRENT_USER } from '@/eric/data/people';
import brand from '@/eric/brand.config';

/* ------------------------------------------------------------------ *
 * Merchant — Global
 * ------------------------------------------------------------------ *
 * A single searchable row per merchant across the whole book. The live
 * version renders an empty table; this one is populated, because a report
 * screen that shows nothing demonstrates nothing.
 */

const OWNERSHIP = ['LLC', 'Corporation', 'Sole Trader', 'Proprietary', 'Non-Profit', 'Partnership'];
const INDUSTRIES = ['Restaurants', 'Retail', 'Home based', 'MOTO / E-Commerce', 'Internet/Gateway', 'Other'];
const GLOBAL_STATUSES = ['OnBoarded', 'New Contract', 'Manual Review Required', 'Approved', 'Dead Lead', 'Closed'];

export const MERCHANT_GLOBAL = (() => {
  const d = createDraw(7401);

  return MERCHANTS.map((dbaName, i) => {
    const partner = d.pick(PARTNERS);
    return {
      id: `mg-${i}`,
      dbaName,
      mid: midFor(dbaName, 13),
      partner: partner.name,
      groupEntity: d.pick(ISO_PORTFOLIOS),
      region: d.pick(REGIONS),
      processor: d.pick(brand.processors),
      legalName: `${dbaName.replace(/ (Ltd|Co|Group|Services)$/, '')} Limited`,
      agent: d.pick(AGENTS),
      assignedTo: d.bool(0.75) ? d.pick(ASSIGNEES) : '',
      ownershipType: d.pick(OWNERSHIP),
      industry: d.pick(INDUSTRIES),
      monthlyVolume: d.money(1200, 480000),
      created: `2026/0${d.int(1, 8)}/${String(d.int(1, 28)).padStart(2, '0')}`,
      status: d.weighted([['OnBoarded', 5], ['New Contract', 3], ['Manual Review Required', 2], ['Approved', 3], ['Dead Lead', 1], ['Closed', 1]]),
    };
  });
})();

export const GLOBAL_STATUS_OPTIONS = GLOBAL_STATUSES;
export const OWNERSHIP_TYPES = OWNERSHIP;
export const INDUSTRY_TYPES = INDUSTRIES;

/* ------------------------------------------------------------------ *
 * Productivity Report
 * ------------------------------------------------------------------ *
 * Who moved what, when, and how long it sat first.
 */

const FLOW = [
  'New Lead', 'WIP Lead', 'New Contract', 'Submitted to Underwriting',
  'Manual Review Required', 'Approved', 'OnBoarded',
];

const CHANGERS = [CURRENT_USER.name, 'Donald Kossmann', 'Sarika Grover', 'Clive Kanyepi', 'Girja Fi911', ...ASSIGNEES.slice(0, 4)];
const SOURCES = ['Portal', 'API', 'Bulk Import', 'Agent'];

export const PRODUCTIVITY = (() => {
  const d = createDraw(7402);
  const rows = [];

  MERCHANTS.slice(0, 30).forEach((dbaName, i) => {
    /* Each merchant walks a few steps of the funnel; every step is a row. */
    const steps = d.int(2, 5);
    let day = d.int(1, 12);

    for (let s = 0; s < steps; s += 1) {
      const from = s === 0 ? '' : FLOW[s - 1];
      const to = FLOW[s];
      const dwell = d.int(0, 9);
      day += dwell;

      rows.push({
        id: `pr-${i}-${s}`,
        dbaName,
        mid: d.bool(0.7) ? midFor(dbaName, 13) : '',
        businessType: d.bool(0.8) ? d.pick(OWNERSHIP) : '',
        processor: d.bool(0.85) ? d.pick(brand.processors) : '',
        agent: d.pick(AGENTS),
        monthlyVolume: d.bool(0.6) ? d.money(0, 240000) : 0,
        openDate: `2026/08/${String(Math.min(day, 28)).padStart(2, '0')}`,
        openTime: `${String(d.int(9, 17)).padStart(2, '0')}:${String(d.int(0, 59)).padStart(2, '0')}:${String(d.int(0, 59)).padStart(2, '0')}`,
        closeDate: s === steps - 1 ? '' : `2026/08/${String(Math.min(day + dwell, 28)).padStart(2, '0')}`,
        changedBy: d.pick(CHANGERS),
        source: d.pick(SOURCES),
        fromStatus: from,
        status: to,
        dwellDays: dwell,
      });
    }
  });

  return rows.reverse();
})();

export const PRODUCTIVITY_STATUSES = FLOW;
export const PRODUCTIVITY_SOURCES = SOURCES;

/** Average dwell per stage — the question a flat list cannot answer. */
export function dwellByStage(rows = PRODUCTIVITY) {
  const acc = {};
  rows.forEach((r) => {
    if (!acc[r.status]) acc[r.status] = { stage: r.status, total: 0, count: 0 };
    acc[r.status].total += r.dwellDays;
    acc[r.status].count += 1;
  });
  return FLOW
    .filter((f) => acc[f])
    .map((f) => ({
      label: f,
      value: Math.round((acc[f].total / acc[f].count) * 10) / 10,
      count: acc[f].count,
    }));
}

/* ------------------------------------------------------------------ *
 * Document Center
 * ------------------------------------------------------------------ */

const DOC_TYPES = [
  { id: 'mpa', label: 'Merchant Application', icon: 'file' },
  { id: 'kyc', label: 'KYC Pack', icon: 'shieldCheck' },
  { id: 'bank', label: 'Bank Statement', icon: 'pound' },
  { id: 'tax', label: 'Tax Certificate', icon: 'checklist' },
  { id: 'contract', label: 'Signed Contract', icon: 'edit' },
  { id: 'evidence', label: 'Dispute Evidence', icon: 'alert' },
  { id: 'statement', label: 'Billing Statement', icon: 'spreadsheet' },
];

const EXTENSIONS = { mpa: 'pdf', kyc: 'zip', bank: 'pdf', tax: 'jpg', contract: 'pdf', evidence: 'pdf', statement: 'xlsx' };

export const DOCUMENTS = (() => {
  const d = createDraw(7403);

  return Array.from({ length: 48 }, (_, i) => {
    const type = d.pick(DOC_TYPES);
    const owner = d.pick(INSTITUTIONS);
    const size = d.float(0.2, 9.4);

    return {
      id: `doc-${i}`,
      name: `${type.id}_${owner.id}_${2026}${String(d.int(1, 12)).padStart(2, '0')}.${EXTENSIONS[type.id]}`,
      typeId: type.id,
      type: type.label,
      icon: type.icon,
      participant: owner.name,
      sortCode: owner.sortCode,
      uploadedBy: d.pick([CURRENT_USER.name, ...ASSIGNEES.slice(0, 5)]),
      uploaded: `2026/0${d.int(4, 8)}/${String(d.int(1, 28)).padStart(2, '0')}`,
      sizeMb: Math.round(size * 10) / 10,
      /* Retention drives the expiry warning — a document library that never
         tells you what is about to age out is just a folder. */
      retentionYears: d.pick([1, 3, 5, 7]),
      confidential: d.bool(0.3),
    };
  });
})();

export const DOCUMENT_TYPES = DOC_TYPES;

/* ------------------------------------------------------------------ *
 * Chargebacks & Alerts
 * ------------------------------------------------------------------ *
 * Pre-dispute alerts (Ethoca / Verifi style) sitting alongside the
 * chargebacks they can still prevent. The value of the screen is the
 * OUTCOME column: an alert refunded in time never became a chargeback.
 */

const ALERT_SOURCES = ['Ethoca', 'Verifi CDRN', 'Verifi RDR', 'Issuer Direct'];
const ALERT_OUTCOMES = [
  { id: 'refunded', label: 'Refunded in time', tone: 'success' },
  { id: 'prevented', label: 'Chargeback prevented', tone: 'success' },
  { id: 'too_late', label: 'Too late — became chargeback', tone: 'danger' },
  { id: 'pending', label: 'Awaiting action', tone: 'warning' },
  { id: 'declined', label: 'Declined to refund', tone: 'muted' },
];

export const ALERTS = (() => {
  const d = createDraw(7404);

  return Array.from({ length: 42 }, (_, i) => {
    const outcome = d.weighted([['refunded', 4], ['prevented', 3], ['too_late', 2], ['pending', 3], ['declined', 1]]);
    const merchant = d.pick(MERCHANTS);
    const amount = d.money(18, 940);
    const received = d.int(1, 20);

    return {
      id: `al-${i}`,
      alertId: `ALT-${740000 + i}`,
      caseNumber: outcome === 'too_late' ? String(686617500 + i) : '',
      merchant,
      mid: midFor(merchant, 13),
      source: d.pick(ALERT_SOURCES),
      cardLast4: d.digits(4),
      scheme: d.pick(['visa', 'mastercard', 'amex', 'discover']),
      amount,
      reason: d.pick(['Fraud', 'Cancelled Recurring', 'Goods Not Received', 'Duplicate Processing', 'Credit Not Processed']),
      received: `2026/08/${String(received).padStart(2, '0')}`,
      /* Alerts expire — usually 24–72h to act. */
      deadline: `2026/08/${String(Math.min(received + d.int(1, 3), 28)).padStart(2, '0')}`,
      outcome,
      actionedBy: outcome === 'pending' ? '' : d.pick(ASSIGNEES),
      processor: d.pick(brand.processors),
    };
  });
})();

export const ALERT_OUTCOME_META = ALERT_OUTCOMES;
export const ALERT_SOURCE_OPTIONS = ALERT_SOURCES;

export const alertOutcome = (id) => ALERT_OUTCOMES.find((o) => o.id === id) ?? ALERT_OUTCOMES[3];

/** Headline: how much loss the alert channel actually prevented. */
export function alertImpact(rows = ALERTS) {
  const saved = rows.filter((r) => r.outcome === 'refunded' || r.outcome === 'prevented');
  const missed = rows.filter((r) => r.outcome === 'too_late');
  const pending = rows.filter((r) => r.outcome === 'pending');

  const sum = (list) => Math.round(list.reduce((s, r) => s + r.amount, 0) * 100) / 100;

  return {
    prevented: sum(saved),
    preventedCount: saved.length,
    missed: sum(missed),
    missedCount: missed.length,
    pending: sum(pending),
    pendingCount: pending.length,
    rate: rows.length ? Math.round((saved.length / (saved.length + missed.length || 1)) * 1000) / 10 : 0,
  };
}
