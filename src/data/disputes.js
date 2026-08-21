/**
 * DISPUTES.
 *
 * Two views of one book, which is why they live in one module:
 *
 *   · SUMMARY  — one row per participant, with dispute counts and values
 *                expressed as ratios against total throughput. This is the
 *                risk view: a participant with 18 transactions and 4 disputes
 *                (22%) matters more than one with 3,122 and 3 (0.1%).
 *   · DETAILS  — one row per claim, at account level.
 *
 * The summary is NOT derived from the details: the reference shows 112 summary
 * rows against 110 detail rows, because the summary counts every dispute
 * raised in the period while the detail list is scoped to claims still on the
 * book. Deriving one from the other would quietly change both numbers.
 */

import { createDraw } from '@/data/rng';
import { INSTITUTIONS, MERCHANTS, sortCodeFor } from '@/data/reference';
import { DISPUTE_CYCLES, REASON_CATEGORIES } from '@/brand/brand.config';

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */

const SUMMARY_SHAPES = [
  { id: 'lloyds', transactions: 3122, disputes: 3, txnValue: 81163551.22, disputeValue: 16342.34, type: 'Bank' },
  { id: 'barclays', transactions: 780, disputes: 1, txnValue: 2760644.40, disputeValue: 2810.00, type: 'Bank' },
  { id: 'first_direct', transactions: 428, disputes: 1, txnValue: 1070862.00, disputeValue: 123.00, type: 'PSP' },
  { id: 'bony', transactions: 364, disputes: 8, txnValue: 871542.00, disputeValue: 667.54, type: 'Bank' },
  { id: 'bos', transactions: 92, disputes: 1, txnValue: 16841.93, disputeValue: 59.99, type: 'Bank' },
  { id: 'monzo', transactions: 80, disputes: 3, txnValue: 227070.00, disputeValue: 287.00, type: 'PSP' },
  { id: 'hsbc', transactions: 40, disputes: 2, txnValue: 62400.00, disputeValue: 70.00, type: 'Bank' },
  { id: 'halifax', transactions: 28, disputes: 1, txnValue: 326400.00, disputeValue: 4000.00, type: 'Bank' },
  { id: 'santander', transactions: 20, disputes: 2, txnValue: 33300.48, disputeValue: 60.00, type: 'Bank' },
  { id: 'revolut', transactions: 18, disputes: 4, txnValue: 23112.19, disputeValue: 251.39, type: 'PSP' },
  { id: 'natwest', transactions: 2140, disputes: 6, txnValue: 44210880.10, disputeValue: 9902.15, type: 'Bank' },
  { id: 'starling', transactions: 512, disputes: 2, txnValue: 1880431.55, disputeValue: 480.20, type: 'PSP' },
];

const pct = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 10000) / 100);

export const DISPUTE_SUMMARY = SUMMARY_SHAPES.map((s, i) => {
  const inst = INSTITUTIONS.find((x) => x.id === s.id);
  return {
    id: `ds-${i}`,
    participant: inst?.short === 'BNY' ? 'Bank of New York Mellon' : (inst?.name ?? s.id),
    sortCode: inst?.sortCode ?? sortCodeFor(s.id),
    pspType: 'Sending PSP',
    transactions: s.transactions,
    disputes: s.disputes,
    countRatio: pct(s.disputes, s.transactions),
    txnValue: s.txnValue,
    disputeValue: s.disputeValue,
    amountRatio: pct(s.disputeValue, s.txnValue),
    type: s.type,
  };
});

/* ------------------------------------------------------------------ *
 * Claim-level details
 * ------------------------------------------------------------------ */

const STATUSES = ['New', 'Completed', 'Expired', 'Do Not Represent'];
const OUTCOMES = ['', 'Won', 'Lost', 'Represented'];

const DETAIL_PARTICIPANTS = [
  'Lloyds Bank', 'Barclays', 'Holmfirth Wool & Craft Ltd', 'Skipton Farm & Saddlery Supplies',
  'Hawes Creamery & Dairy Ltd', 'Revolut', 'GRANDVIEW-MAR001', 'RTCLASVEGASTR002',
  'ILLINOISSECRE139', 'MOTORVEHICLED001', ...MERCHANTS.slice(0, 12),
];

export const DISPUTE_DETAILS = (() => {
  const d = createDraw(2604);
  const banks = INSTITUTIONS.slice(0, 12);

  return Array.from({ length: 110 }, (_, i) => {
    const bank = d.pick(banks);
    const reason = d.pick(REASON_CATEGORIES);
    const cycle = d.pick(DISPUTE_CYCLES);
    const status = d.weighted([['New', 4], ['Completed', 4], ['Expired', 1], ['Do Not Represent', 1]]);
    const amount = d.money(20, 2900);

    return {
      id: `dd-${i}`,
      caseNumber: String(686617660 - i),
      participant: d.pick(DETAIL_PARTICIPANTS),
      bankName: bank.name,
      sortCode: sortCodeFor(`${bank.id}-${i}`),
      accountNumber: d.digits(10),
      trn: d.digits(20),
      reasonCategory: reason.label,
      postDate: `2026/${String(d.int(1, 12)).padStart(2, '0')}/${String(d.int(1, 28)).padStart(2, '0')}`,
      typeReference: `PRN74${d.digits(8)}`,
      gatewayMatch: d.bool(0.25),
      disputeAmount: -amount,
      status,
      cycle: cycle.label,
      dueDate: `2026/${String(d.int(1, 12)).padStart(2, '0')}/${String(d.int(1, 28)).padStart(2, '0')}`,
      type: d.pick(['PSP', 'Bank']),
      outcome: status === 'Completed' ? d.pick(OUTCOMES.slice(1)) : '',
      pspType: 'Receiving PSP',

      /* Detail-page fields */
      processor: d.pick(['Fiserv', 'TSYS', 'Chase Paymentech', 'Worldpay']),
      transactionId: d.digits(22),
      transactionAmount: -amount,
      transactionDate: `2026/01/${String(d.int(1, 28)).padStart(2, '0')}`,
      approvalNumber: `${d.digits(5)}D`,
      retrievalDate: `2026/02/${String(d.int(1, 28)).padStart(2, '0')}`,
      completedDate: `2026/03/${String(d.int(1, 28)).padStart(2, '0')}`,
      currency: 'GBP',
    };
  });
})();

export const findDispute = (caseNumber) =>
  DISPUTE_DETAILS.find((r) => r.caseNumber === caseNumber || r.id === caseNumber) ?? DISPUTE_DETAILS[0];

export const DISPUTE_STATUSES = STATUSES;
export const DISPUTE_REASONS = REASON_CATEGORIES.map((r) => r.label);
export const DISPUTE_CYCLE_LABELS = DISPUTE_CYCLES.map((c) => c.label);
