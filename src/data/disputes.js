/**
 * DISPUTES.
 *
 * Two views of one book, which is why they live in one module:
 *
 *   · SUMMARY  — one row per MERCHANT, with chargeback counts and values
 *                expressed as ratios against total throughput. This is the
 *                risk view: a merchant with 18 transactions and 4 chargebacks
 *                (22%) matters more than one with 3,122 and 3 (0.1%).
 *   · DETAILS  — one row per chargeback case, at transaction level.
 *
 * The summary is NOT derived from the details: the reference shows 112 summary
 * rows against 110 detail rows, because the summary counts every dispute
 * raised in the period while the detail list is scoped to claims still on the
 * book. Deriving one from the other would quietly change both numbers.
 */

import { createDraw } from '@/data/rng';
import { INSTITUTIONS, MERCHANTS, midFor, routingNumberFor } from '@/data/reference';
import brand, { DISPUTE_CYCLES, REASON_CATEGORIES, reasonCodeFor } from '@/brand/brand.config';

/* ------------------------------------------------------------------ *
 * Summary
 * ------------------------------------------------------------------ */

const SUMMARY_SHAPES = [
  { merchant: 'Peach State Auto Spa', transactions: 3122, disputes: 3, txnValue: 811_635.22, disputeValue: 16_342.34, type: 'Retail' },
  { merchant: 'CloudCart Solutions', transactions: 780, disputes: 1, txnValue: 276_064.40, disputeValue: 2_810.00, type: 'E-Commerce' },
  { merchant: 'Liberty Bell Tutoring', transactions: 428, disputes: 1, txnValue: 107_086.00, disputeValue: 123.00, type: 'Services' },
  { merchant: 'Tropical Flavors Bistro', transactions: 364, disputes: 8, txnValue: 87_154.20, disputeValue: 667.54, type: 'Retail' },
  { merchant: 'Stone Mountain BBQ', transactions: 92, disputes: 1, txnValue: 16_841.93, disputeValue: 59.99, type: 'Retail' },
  { merchant: 'Bluegrass Direct Sales', transactions: 80, disputes: 3, txnValue: 22_707.00, disputeValue: 287.00, type: 'MOTO' },
  { merchant: 'Deep Dish Delights', transactions: 40, disputes: 2, txnValue: 6_240.00, disputeValue: 70.00, type: 'Retail' },
  { merchant: 'Sunshine Pool & Spa', transactions: 28, disputes: 1, txnValue: 32_640.00, disputeValue: 4_000.00, type: 'Services' },
  { merchant: 'Lakeside Event Rentals', transactions: 20, disputes: 2, txnValue: 33_300.48, disputeValue: 60.00, type: 'Services' },
  { merchant: 'Evergreen Digital Agency', transactions: 18, disputes: 4, txnValue: 23_112.19, disputeValue: 251.39, type: 'E-Commerce' },
  { merchant: 'Cascade Mountain Sports', transactions: 2140, disputes: 6, txnValue: 442_108.10, disputeValue: 9_902.15, type: 'Retail' },
  { merchant: 'Brooklyn Web Studios', transactions: 512, disputes: 2, txnValue: 188_043.55, disputeValue: 480.20, type: 'E-Commerce' },
];

const pct = (a, b) => (b === 0 ? 0 : Math.round((a / b) * 10000) / 100);

export const DISPUTE_SUMMARY = SUMMARY_SHAPES.map((s, i) => ({
  id: `ds-${i}`,
  merchant: s.merchant,
  mid: midFor(s.merchant, 14),
  routingNumber: '',
  pspType: s.type,
  transactions: s.transactions,
  disputes: s.disputes,
  countRatio: pct(s.disputes, s.transactions),
  txnValue: s.txnValue,
  disputeValue: s.disputeValue,
  amountRatio: pct(s.disputeValue, s.txnValue),
  type: s.type,
}));

/* ------------------------------------------------------------------ *
 * Claim-level details
 * ------------------------------------------------------------------ */

const STATUSES = ['New', 'Completed', 'Expired', 'Do Not Represent'];
const OUTCOMES = ['', 'Won', 'Lost', 'Represented'];

const DETAIL_PARTICIPANTS = [
  'Wells Fargo Bank', 'Citibank', 'Hudson Wool & Craft LLC', 'Sedona Farm & Saddlery Supply',
  'Hartland Creamery & Dairy LLC', 'Capital One', 'GRANDVIEW-MAR001', 'RTCLASVEGASTR002',
  'ILLINOISSECRE139', 'MOTORVEHICLED001', ...MERCHANTS.slice(0, 12),
];

export const DISPUTE_DETAILS = (() => {
  const d = createDraw(2604);
  const book = MERCHANTS.slice(0, 24);

  return Array.from({ length: 110 }, (_, i) => {
    const merchant = d.pick(book);
    const reason = d.pick(REASON_CATEGORIES);
    const cycle = d.pick(DISPUTE_CYCLES);
    const scheme = d.weighted([['visa', 5], ['mastercard', 4], ['amex', 2], ['discover', 1]]);
    const status = d.weighted([['New', 4], ['Completed', 4], ['Expired', 1], ['Do Not Represent', 1]]);
    const amount = d.money(20, 2900);
    const postDay = d.int(1, 28);

    return {
      id: `dd-${i}`,
      caseNumber: String(686617660 - i),
      /* `participant` is the field name the grids already bind to; the value
         is a merchant, which is what this book is actually about. */
      merchant: merchant,
      mid: midFor(merchant, 14),
      dbaName: merchant,
      scheme,
      cardNumber: `${'X'.repeat(12)}${d.digits(4)}`,
      cardLast4: d.digits(4),
      /* The Acquirer Reference Number is how a chargeback is matched back to
         its original presentment — the join key an acquirer actually works
         from, which is why it leads the detail grid. */
      arn: `74${d.digits(21)}`,
      reasonCategory: reason.label,
      reasonFamily: reason.category,
      reasonCode: reasonCodeFor(reason, scheme),
      postDate: `2026/${String(d.int(1, 12)).padStart(2, '0')}/${String(postDay).padStart(2, '0')}`,
      typeReference: `PRN74${d.digits(8)}`,
      gatewayMatch: d.bool(0.25),
      disputeAmount: -amount,
      status,
      cycle: cycle.label,
      dueDate: `2026/${String(d.int(1, 12)).padStart(2, '0')}/${String(d.int(1, 28)).padStart(2, '0')}`,
      type: d.pick(brand.participantTypes).label,
      outcome: status === 'Completed' ? d.pick(OUTCOMES.slice(1)) : '',
      pspType: d.pick(brand.participantTypes).label,

      /* Detail-page fields */
      processor: d.pick(brand.processors),
      transactionId: d.digits(22),
      transactionAmount: -amount,
      transactionDate: `2026/01/${String(d.int(1, 28)).padStart(2, '0')}`,
      approvalNumber: `${d.digits(5)}D`,
      retrievalDate: `2026/02/${String(d.int(1, 28)).padStart(2, '0')}`,
      completedDate: `2026/03/${String(d.int(1, 28)).padStart(2, '0')}`,
      currency: 'USD',
      /* Kept so the account-level columns still resolve; an acquirer holds the
         merchant's settlement account, not the cardholder's. */
      bankName: '',
      routingNumber: '',
      accountNumber: '',
      trn: '',
    };
  });
})();

export const findDispute = (caseNumber) =>
  DISPUTE_DETAILS.find((r) => r.caseNumber === caseNumber || r.id === caseNumber) ?? DISPUTE_DETAILS[0];

export const DISPUTE_STATUSES = STATUSES;
export const DISPUTE_REASONS = REASON_CATEGORIES.map((r) => r.label);
export const DISPUTE_CYCLE_LABELS = DISPUTE_CYCLES.map((c) => c.label);

/* ------------------------------------------------------------------ *
 * Chargeback ratios — per merchant, per card scheme
 * ------------------------------------------------------------------ *
 * The participant summary above answers "which bank has a dispute problem".
 * This answers a different question: which MERCHANT, on which SCHEME, is
 * heading into a card-scheme monitoring program.
 *
 * The grain matters because the thresholds are per scheme, not per merchant.
 * A merchant can sit comfortably under 1% overall while its Mastercard volume
 * is well through Excessive Chargeback Merchant territory — and the blended
 * number hides exactly that. The reference prints the ratios raw and leaves
 * the operator to remember what each scheme's limit is; the limits are stored
 * here so the row can say whether it has breached one.
 */

export const SCHEME_PROGRAMMES = {
  visa: { name: 'VDMP', standard: { count: 0.9, minCount: 100 }, excessive: { count: 1.8, minCount: 1000 } },
  mastercard: { name: 'ECM', standard: { count: 1.0, minCount: 100 }, excessive: { count: 1.5, minCount: 300 } },
  amex: { name: 'Monitoring', standard: { count: 1.0, minCount: 50 }, excessive: { count: 2.0, minCount: 200 } },
  discover: { name: 'Monitoring', standard: { count: 1.0, minCount: 50 }, excessive: { count: 2.0, minCount: 200 } },
};

/** Which program tier a row falls into. Count-based, as the schemes are. */
export function programmeTier(row) {
  const p = SCHEME_PROGRAMMES[row.scheme];
  if (!p) return { tier: 'ok', label: 'Within limits', program: '' };
  if (row.chargebacks >= p.excessive.minCount && row.countRatio >= p.excessive.count) {
    return { tier: 'excessive', label: `${p.name} — excessive`, program: p.name };
  }
  if (row.chargebacks >= p.standard.minCount && row.countRatio >= p.standard.count) {
    return { tier: 'standard', label: `${p.name} — standard`, program: p.name };
  }
  if (row.countRatio >= p.standard.count * 0.75) {
    return { tier: 'approaching', label: `Approaching ${p.name}`, program: p.name };
  }
  return { tier: 'ok', label: 'Within limits', program: p.name };
}

export const CHARGEBACK_RATIOS = (() => {
  const d = createDraw(5521);
  const rows = [];

  MERCHANTS.slice(0, 18).forEach((merchant, i) => {
    const mid = midFor(merchant, 13);
    const processor = d.pick(brand.processors);

    /* Not every merchant accepts every scheme — a row of zeroes for a scheme
       the merchant never took is noise, so those are simply absent. */
    const schemes = ['visa', 'mastercard', ...(d.bool(0.55) ? ['amex'] : []), ...(d.bool(0.3) ? ['discover'] : [])];

    schemes.forEach((scheme) => {
      const transactions = d.int(400, 26000);
      /* Weighted so a handful of merchants genuinely breach — a demo where
         nothing ever crosses a threshold cannot show the threshold working. */
      const rate = d.weighted([[d.float(0.05, 0.5), 6], [d.float(0.5, 1.1), 3], [d.float(1.1, 3.4), 1]]);
      const chargebacks = Math.max(1, Math.round((transactions * rate) / 100));
      const avgTicket = d.float(14, 210);
      const txnValue = Math.round(transactions * avgTicket * 100) / 100;
      const cbValue = Math.round(chargebacks * avgTicket * d.float(0.9, 1.6) * 100) / 100;

      const row = {
        id: `cbr-${i}-${scheme}`,
        mid,
        merchant,
        scheme,
        transactions,
        chargebacks,
        countRatio: Math.round((chargebacks / transactions) * 10000) / 100,
        txnValue,
        cbValue,
        amountRatio: Math.round((cbValue / txnValue) * 10000) / 100,
        processor,
      };
      rows.push({ ...row, ...programmeTier(row) });
    });
  });

  /* Worst breaches first — the reference orders by MID, which buries them. */
  const rank = { excessive: 0, standard: 1, approaching: 2, ok: 3 };
  return rows.sort((a, b) => rank[a.tier] - rank[b.tier] || b.countRatio - a.countRatio);
})();

export const RATIO_TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'excessive', label: 'Excessive', match: (r) => r.tier === 'excessive' },
  { value: 'standard', label: 'In program', match: (r) => r.tier === 'standard' },
  { value: 'approaching', label: 'Approaching', match: (r) => r.tier === 'approaching' },
  { value: 'ok', label: 'Within limits', match: (r) => r.tier === 'ok' },
];
