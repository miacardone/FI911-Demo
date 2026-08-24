/**
 * OPERATOR SUMMARY — dashboard data.
 *
 * The range toggle (MTD / QTD / YTD / L12M) is real: each range returns its
 * own series at its own granularity, because a month-to-date chart plotted on
 * twelve monthly buckets is a straight line and tells you nothing. MTD and QTD
 * are daily, YTD is fortnightly, L12M is monthly.
 *
 * Seeded from rng.js so the shapes are stable across reloads — a dashboard
 * whose trend line redraws differently on every refresh undermines the very
 * thing it is claiming to show.
 */

import { createDraw } from '@/data/rng';
import { TOP_ROUTING_NUMBERS } from '@/data/reference';
import { REASON_CATEGORIES } from '@/brand/brand.config';

export const LAST_CALCULATED = '2026/08/20';

export const RANGES = [
  { id: 'mtd', label: 'MTD' },
  { id: 'qtd', label: 'QTD' },
  { id: 'ytd', label: 'YTD' },
  { id: 'l12m', label: 'L12M' },
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** Point labels for a range, matching the reference's axis formats. */
function labelsFor(range) {
  switch (range) {
    case 'mtd':
      return Array.from({ length: 20 }, (_, i) => `2026/08/${String(i + 1).padStart(2, '0')}`);
    case 'qtd':
      return Array.from({ length: 16 }, (_, i) => {
        const day = 1 + i * 5;
        const month = 7 + Math.floor(day / 32);
        return `2026/${String(month).padStart(2, '0')}/${String(((day - 1) % 31) + 1).padStart(2, '0')}`;
      });
    case 'l12m':
      return Array.from({ length: 12 }, (_, i) => {
        const m = ((8 + i) % 12) + 1;
        const y = 8 + i > 12 ? 2026 : 2025;
        return `${y}/${String(m).padStart(2, '0')}/01`;
      });
    case 'ytd':
    default:
      return Array.from({ length: 16 }, (_, i) => {
        const day = 23 + i * 15;
        const month = 1 + Math.floor(day / 31);
        return `2026/${String(Math.min(month, 8)).padStart(2, '0')}/${String(((day - 1) % 28) + 1).padStart(2, '0')}`;
      });
  }
}

/* ------------------------------------------------------------------ *
 * Active PSPs
 * ------------------------------------------------------------------ */

export const ACTIVE_PSPS = 2005;

export function activePspSeries(range = 'ytd') {
  const d = createDraw(1901 + range.length);
  const labels = labelsFor(range);
  const start = ACTIVE_PSPS - labels.length * 12;

  let value = start;
  return labels.map((label, i) => {
    /* A gentle dip mid-series then a climb — the reference's shape. */
    const phase = i / labels.length;
    const drift = phase < 0.45 ? d.float(-14, 8) : d.float(2, 30);
    value = Math.max(1200, Math.round(value + drift));
    return { period: label, value };
  });
}

/* ------------------------------------------------------------------ *
 * PSP Onboarding funnel
 * ------------------------------------------------------------------ */

export const ONBOARDING_STAGES = [
  { period: 'Proposals', New: 72, 'In Progress': 88, Pending: 18, Open: 6 },
  { period: 'Contracts', New: 14, 'In Progress': 12, Pending: 22, Open: 34 },
  { period: 'Underwriting', New: 213, 'In Progress': 131, Pending: 4, Open: 2 },
  { period: 'Live Merchants', New: 165, 'In Progress': 74, Pending: 22, Open: 26 },
];

export const FUNNEL_SERIES = [
  { key: 'New', label: 'New', color: 'var(--c-series-0)' },
  { key: 'In Progress', label: 'In Progress', color: 'var(--c-series-1)' },
  { key: 'Pending', label: 'Pending', color: 'var(--c-series-2)' },
  { key: 'Open', label: 'Open', color: 'var(--c-series-3)' },
];

/**
 * The status donuts under the funnel.
 *
 * DERIVED from the funnel bars rather than declared beside them. They used to
 * be hand-written percentages that summed to 100, which meant two things: the
 * donut could disagree with the bar directly above it, and a slice could only
 * ever say "20%" — of what, it never said. Reading the counts off the funnel
 * fixes both: the numbers on the slices are merchants, and they add up to the
 * bar.
 */
export const STATUS_DONUTS = ONBOARDING_STAGES.map((stage) => ({
  id: stage.period.toLowerCase().replace(/[^a-z]+/g, '-'),
  title: `${stage.period} Status`,
  data: FUNNEL_SERIES
    .map((s2) => ({ label: s2.label, value: stage[s2.key] ?? 0 }))
    .filter((d) => d.value > 0),
}));

/* ------------------------------------------------------------------ *
 * Transaction summary
 * ------------------------------------------------------------------ */

export const DAILY_TRANSACTION_AMOUNT = 105_137_073.60;
export const TRANSACTIONS_PROCESSED = 1480;
export const OUTSTANDING_REIMBURSABLE = 50_505.77;

const sparkDays = ['2026/08/15', '2026/08/16', '2026/08/17', '2026/08/18', '2026/08/19', '2026/08/20'];
const sparkMonths = ['2026/04/01', '2026/05/01', '2026/06/01', '2026/07/01', '2026/08/01'];

const spark = (seed, labels, base, spread) => {
  const d = createDraw(seed);
  return labels.map((period) => ({ period, value: Math.round(base + d.float(-spread, spread)) }));
};

export const DAILY_AMOUNT_SPARK = spark(2201, sparkDays, 104_000_000, 6_000_000);
export const PROCESSED_SPARK = spark(2202, sparkDays, 1450, 120);
export const REIMBURSABLE_SPARK = spark(2203, sparkMonths, 50_000, 7_000);

/** Transactions YTD & YOY — three years side by side, by month. */
export const YOY_SERIES = [
  { key: 'y2024', label: '2024', color: 'var(--c-series-2)' },
  { key: 'y2025', label: '2025', color: 'var(--c-series-1)' },
  { key: 'y2026', label: '2026', color: 'var(--c-series-0)' },
];

export const YOY_DATA = (() => {
  const d = createDraw(2301);
  return MONTHS.map((m, i) => {
    /* 2026 runs to August then stops — the year is not over. */
    const y2026 = i <= 7 ? Math.round(118_000_000 + i * 9_000_000 + d.float(-12_000_000, 12_000_000)) : 0;
    return {
      period: m,
      y2024: Math.round(70_000_000 + i * 3_200_000 + d.float(-9_000_000, 9_000_000)),
      y2025: Math.round(82_000_000 + i * 3_400_000 + d.float(-11_000_000, 11_000_000)),
      y2026,
    };
  });
})();

/* Transaction COUNTS per routing number, not shares. A donut already draws
   the share; printing it as the value too says the same thing twice and never
   answers "how many". */
export const TOP_ROUTING_SPLIT = [
  { label: TOP_ROUTING_NUMBERS[1], value: 41_284 },
  { label: TOP_ROUTING_NUMBERS[0], value: 29_190 },
  { label: TOP_ROUTING_NUMBERS[3], value: 3_872 },
  { label: TOP_ROUTING_NUMBERS[2], value: 3_019 },
  { label: TOP_ROUTING_NUMBERS[4], value: 77 },
];

/* ------------------------------------------------------------------ *
 * Dispute claims
 * ------------------------------------------------------------------ */

export const CLAIM_KPIS = [
  { id: 'active', title: 'Dispute Claims - Total Active', value: 502_159.06, count: 2186, spark: spark(2401, sparkDays, 500_000, 20_000) },
  { id: 'total', title: 'Dispute Claims - Total', value: 572_159.06, spark: spark(2402, sparkMonths, 570_000, 26_000) },
  { id: 'settled', title: 'Dispute Claims - Total Settled', value: 72_159.06, spark: spark(2403, sparkMonths, 66_000, 9_000) },
  { id: 'new', title: 'Dispute Claims - New', value: 72_159.06, count: 2186, spark: spark(2404, sparkDays, 71_000, 8_000) },
  { id: 'review', title: 'Dispute Claims - In Review', value: 72_159.06, count: 2186, spark: spark(2405, sparkDays, 72_000, 5_000) },
  { id: 'rejected', title: 'Dispute Claims - Total Rejected', value: 72_159.06, spark: spark(2406, sparkMonths, 70_000, 11_000) },
];

/* Claim counts by reason, not shares — same reasoning as the routing split. */
export const REASON_SPLIT = [
  { label: REASON_CATEGORIES[0].label, value: 1006 },
  { label: REASON_CATEGORIES[3].label, value: 590 },
  { label: REASON_CATEGORIES[1].label, value: 393 },
  { label: REASON_CATEGORIES[2].label, value: 197 },
];

export const DISPUTE_FUNDING_SERIES = [
  { key: 'sending', label: 'Sending', color: 'var(--c-series-0)' },
  { key: 'receiving', label: 'Receiving', color: 'var(--c-series-1)' },
];

export const DISPUTE_FUNDING = [
  { period: 'Mar 26', sending: 34_000_000, receiving: 19_000_000 },
  { period: 'Apr 26', sending: 40_000_000, receiving: 22_000_000 },
  { period: 'May 26', sending: 51_000_000, receiving: 33_000_000 },
  { period: 'Jun 26', sending: 126_000_000, receiving: 57_000_000 },
  { period: 'Jul 26', sending: 77_000_000, receiving: 45_000_000 },
  { period: 'Aug 26', sending: 66_000_000, receiving: 37_000_000 },
];

/* ------------------------------------------------------------------ *
 * Financial split and claims
 * ------------------------------------------------------------------ */

export const SPLIT_SERIES = [
  { key: 'grossTotal', label: 'Gross Total', color: 'var(--c-series-0)' },
  { key: 'payoutToOthers', label: 'Payout to Others', color: 'var(--c-series-1)' },
  { key: 'grossPayout', label: 'Gross Payout', color: 'var(--c-series-2)' },
];

export function financialSplitSeries(range = 'ytd') {
  const d = createDraw(2501 + range.length);
  return labelsFor(range).map((period, i) => ({
    period,
    grossTotal: Math.round(9200 + Math.sin(i / 2.4) * 900 + d.float(-260, 620)),
    payoutToOthers: Math.round(520 + d.float(-60, 90)),
    grossPayout: Math.round(2700 + Math.sin(i / 3.1) * 190 + d.float(-90, 140)),
  }));
}

export const CLAIM_TURNOVER = [
  { label: 'NWB [56-00-03]', value: 25_600 },
  { label: 'PNC Bank [11-16-26]', value: 2_100 },
  { label: 'BOS [12-11-03]', value: 780 },
  { label: 'TD Bank [40-47-87]', value: 690 },
  { label: 'Truist Bank [72-00-00]', value: 640 },
  { label: 'Citibank [20-26-78]', value: 600 },
  { label: 'Wells Fargo Bank [30-96-35]', value: 560 },
  { label: 'BNY [76-02-25]', value: 520 },
  { label: 'U.S. Bank [40-12-76]', value: 480 },
  { label: 'SBL [60-83-71]', value: 440 },
];

export const ERT_SERIES = [
  { key: 'internalAlert', label: 'Internal Alert', color: 'var(--c-series-0)' },
  { key: 'riskAlert', label: 'Risk Alert', color: 'var(--c-series-2)' },
  { key: 'message', label: 'Message', color: 'var(--c-series-1)' },
];

export const ERT_ACTIVE = 10;

export const ERT_TREND = (() => {
  const labels = ['Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26', 'Apr 26', 'May 26', 'Jun 26', 'Jul 26', 'Aug 26'];
  const internal = [4, 5, 6.5, 8, 9.5, 11, 10, 9, 9.5, 10.5, 11, 11];
  const risk = [2, 3, 4.5, 6, 7.5, 8, 7.5, 6, 6.5, 7.5, 9, 7];
  const message = [2, 2.5, 3.5, 4.5, 6, 7, 6.5, 5.5, 6, 7, 8.5, 9];

  return labels.map((period, i) => ({
    period,
    internalAlert: internal[i],
    riskAlert: risk[i],
    message: message[i],
  }));
})();
