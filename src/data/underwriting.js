/**
 * UNDERWRITING DECISIONING — score card and third-party verification.
 *
 * The wizard collects what the applicant says about themselves. These two
 * datasets are how an underwriter decides whether to believe it:
 *
 *  · The SCORE CARD is a weighted model. Every factor carries a weight and a
 *    banded score, and the total maps onto a recommendation. Storing the
 *    weights and bands — rather than a single pre-baked "score: 72" — means
 *    the page can show WHY a file scored what it did, which is the only
 *    version of a scorecard an underwriter can argue with.
 *
 *  · THIRD-PARTY CHECKS are the external services an underwriter initiates:
 *    bank account verification and identity through GIACT, a consumer credit
 *    pull on the principal, sanctions screening, the card schemes' terminated
 *    merchant file, and business registration. Each carries its own status,
 *    reference and result, because in practice they come back at different
 *    times and one failing does not stop the others.
 *
 * Both are derived from the merchant name, so a given file scores the same
 * on every visit — an underwriting decision that changed on refresh would
 * be worse than useless in a demo.
 */

import { createDraw } from '@/data/rng';

/* ------------------------------------------------------------------ *
 * Score card
 * ------------------------------------------------------------------ */

/**
 * The model. `weight` is the factor's share of the total; `bands` map a raw
 * value onto a 0-100 factor score, worst first, so the first band whose
 * `upTo` the value clears is the one that applies.
 */
export const SCORECARD_MODEL = [
  {
    key: 'principalCredit',
    label: 'Principal credit score',
    weight: 20,
    category: 'Principal',
    hint: 'FICO on the majority beneficial owner. The strongest single predictor of early attrition.',
    format: (v) => String(v),
    bands: [
      { upTo: 579, score: 10, label: 'Poor' },
      { upTo: 669, score: 45, label: 'Fair' },
      { upTo: 739, score: 75, label: 'Good' },
      { upTo: 799, score: 92, label: 'Very good' },
      { upTo: Infinity, score: 100, label: 'Exceptional' },
    ],
  },
  {
    key: 'timeInBusiness',
    label: 'Time in business',
    weight: 15,
    category: 'Business',
    hint: 'Years trading. Businesses under two years old carry most of the first-year loss.',
    format: (v) => (v === 1 ? '1 year' : `${v} years`),
    bands: [
      { upTo: 0, score: 5, label: 'Startup' },
      { upTo: 1, score: 30, label: 'Under 2 years' },
      { upTo: 3, score: 60, label: '2-3 years' },
      { upTo: 7, score: 85, label: '4-7 years' },
      { upTo: Infinity, score: 100, label: 'Established' },
    ],
  },
  {
    key: 'mccRisk',
    label: 'MCC risk band',
    weight: 15,
    category: 'Business',
    hint: 'Where the merchant category sits on the acquirer risk matrix. 1 is lowest.',
    format: (v) => `Band ${v}`,
    invert: true,
    bands: [
      { upTo: 1, score: 100, label: 'Low risk' },
      { upTo: 2, score: 80, label: 'Standard' },
      { upTo: 3, score: 55, label: 'Elevated' },
      { upTo: 4, score: 25, label: 'High risk' },
      { upTo: Infinity, score: 5, label: 'Restricted' },
    ],
  },
  {
    key: 'priorChargebackRatio',
    label: 'Prior chargeback ratio',
    weight: 15,
    category: 'Processing history',
    hint: 'From statements supplied with the application. Scheme monitoring begins near 1%.',
    format: (v) => `${v.toFixed(2)}%`,
    invert: true,
    bands: [
      { upTo: 0.15, score: 100, label: 'Clean' },
      { upTo: 0.5, score: 82, label: 'Normal' },
      { upTo: 0.9, score: 55, label: 'Watch' },
      { upTo: 1.5, score: 22, label: 'Above threshold' },
      { upTo: Infinity, score: 0, label: 'In a monitoring program' },
    ],
  },
  {
    key: 'processingHistoryMonths',
    label: 'Card processing history',
    weight: 10,
    category: 'Processing history',
    hint: 'Months of verifiable statements. No history means no chargeback ratio to score.',
    format: (v) => (v === 0 ? 'None supplied' : `${v} months`),
    bands: [
      { upTo: 0, score: 15, label: 'None' },
      { upTo: 5, score: 45, label: 'Under 6 months' },
      { upTo: 11, score: 70, label: '6-11 months' },
      { upTo: 23, score: 90, label: '1-2 years' },
      { upTo: Infinity, score: 100, label: 'Over 2 years' },
    ],
  },
  {
    key: 'deliveryDays',
    label: 'Delivery timeframe',
    weight: 10,
    category: 'Exposure',
    hint: 'Days between charge and fulfilment. Long delivery is unearned revenue the acquirer is liable for.',
    format: (v) => (v === 0 ? 'Immediate' : `${v} days`),
    invert: true,
    bands: [
      { upTo: 0, score: 100, label: 'Immediate' },
      { upTo: 7, score: 88, label: 'Within a week' },
      { upTo: 30, score: 60, label: 'Within a month' },
      { upTo: 90, score: 28, label: 'Up to 90 days' },
      { upTo: Infinity, score: 5, label: 'Over 90 days' },
    ],
  },
  {
    key: 'averageTicketVariance',
    label: 'Average ticket vs MCC norm',
    weight: 8,
    category: 'Exposure',
    hint: 'How far the requested average ticket sits above the category median.',
    format: (v) => `${v > 0 ? '+' : ''}${v}%`,
    invert: true,
    bands: [
      { upTo: 15, score: 100, label: 'In line' },
      { upTo: 50, score: 78, label: 'Slightly high' },
      { upTo: 120, score: 45, label: 'Well above norm' },
      { upTo: Infinity, score: 12, label: 'Outlier' },
    ],
  },
  {
    key: 'bankStability',
    label: 'Bank account stability',
    weight: 7,
    category: 'Principal',
    hint: 'Months the settlement account has been open, plus NSF activity on the supplied statements.',
    format: (v) => `${v} months open`,
    bands: [
      { upTo: 3, score: 20, label: 'Newly opened' },
      { upTo: 12, score: 55, label: 'Under a year' },
      { upTo: 36, score: 85, label: '1-3 years' },
      { upTo: Infinity, score: 100, label: 'Long standing' },
    ],
  },
];

/* Where the total lands. Ordered worst first. */
export const SCORE_BANDS = [
  { upTo: 44, decision: 'Decline', tone: 'danger', guidance: 'Outside appetite. Decline unless a senior underwriter overrides with documented reasoning.' },
  { upTo: 59, decision: 'Refer — senior review', tone: 'danger', guidance: 'Refer to a senior underwriter. Approvable only with a reserve and a reduced volume cap.' },
  { upTo: 74, decision: 'Approve with conditions', tone: 'warning', guidance: 'Within appetite subject to a rolling reserve and a monthly cap at or below the requested volume.' },
  { upTo: 100, decision: 'Approve', tone: 'success', guidance: 'Within appetite. Standard terms, no reserve required.' },
];

const bandFor = (bands, value) => bands.find((b) => value <= b.upTo) ?? bands[bands.length - 1];

export const scoreBandFor = (total) => SCORE_BANDS.find((b) => total <= b.upTo) ?? SCORE_BANDS[SCORE_BANDS.length - 1];

/**
 * Score one file. Returns the factors with their bands resolved and points
 * earned, plus the weighted total and the resulting recommendation.
 */
export function scorecardFor(record) {
  const seed = String(record?.merchant ?? '').split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 11);
  const d = createDraw(seed);

  const raw = {
    principalCredit: d.int(540, 820),
    timeInBusiness: d.weighted([[0, 2], [1, 3], [3, 4], [6, 3], [12, 2]]),
    mccRisk: d.weighted([[1, 3], [2, 4], [3, 3], [4, 2], [5, 1]]),
    priorChargebackRatio: Math.round(d.float(0.02, 1.9) * 100) / 100,
    processingHistoryMonths: d.weighted([[0, 2], [4, 2], [9, 3], [18, 3], [40, 2]]),
    deliveryDays: d.weighted([[0, 4], [3, 3], [21, 2], [60, 2], [120, 1]]),
    averageTicketVariance: d.int(-20, 180),
    bankStability: d.int(2, 96),
  };

  const factors = SCORECARD_MODEL.map((f) => {
    const value = raw[f.key];
    const band = bandFor(f.bands, value);
    return {
      ...f,
      value,
      display: f.format(value),
      band: band.label,
      score: band.score,
      /* Points earned out of this factor's weight — what actually moves the
         total, and the number an underwriter argues about. */
      points: Math.round((band.score / 100) * f.weight * 10) / 10,
    };
  });

  const total = Math.round(factors.reduce((s, f) => s + f.points, 0));
  const result = scoreBandFor(total);

  return {
    factors,
    total,
    ...result,
    /* The two factors costing the file the most, so the summary can lead
       with them rather than making the underwriter scan the table. */
    weakest: [...factors]
      .sort((a, b) => (a.weight - a.points) - (b.weight - b.points))
      .reverse()
      .slice(0, 2),
    scoredOn: '2026/08/20',
    model: 'Acquiring Standard v4.2',
  };
}

/* ------------------------------------------------------------------ *
 * Third-party verification
 * ------------------------------------------------------------------ */

/**
 * The external services an underwriter initiates against a file. `provider`
 * is named because underwriters talk in provider names — a file is "waiting
 * on GIACT", not "waiting on bank account verification".
 */
export const VERIFICATION_SERVICES = [
  {
    key: 'giactVerify',
    provider: 'GIACT',
    product: 'gVERIFY',
    label: 'Bank account verification',
    checks: 'Confirms the settlement account is open, in good standing and owned by the applicant.',
    turnaround: 'Seconds',
  },
  {
    key: 'giactIdentify',
    provider: 'GIACT',
    product: 'gIDENTIFY',
    label: 'Identity verification',
    checks: 'Matches the principal against name, SSN, date of birth and address records.',
    turnaround: 'Seconds',
  },
  {
    key: 'creditPull',
    provider: 'Experian',
    product: 'Business & Principal',
    label: 'Consumer credit pull',
    checks: 'Soft pull on the majority owner and a commercial file on the entity.',
    turnaround: '1-2 minutes',
  },
  {
    key: 'ofac',
    provider: 'LexisNexis',
    product: 'Bridger',
    label: 'Sanctions and PEP screening',
    checks: 'OFAC SDN, consolidated sanctions lists and politically exposed persons.',
    turnaround: 'Seconds',
  },
  {
    key: 'match',
    provider: 'Mastercard',
    product: 'MATCH',
    label: 'Terminated merchant file',
    checks: 'Whether the entity or its principals were terminated by another acquirer.',
    turnaround: 'Seconds',
  },
  {
    key: 'secretaryOfState',
    provider: 'Secretary of State',
    product: 'Entity lookup',
    label: 'Business registration',
    checks: 'Entity standing, formation date and registered agent in the state of incorporation.',
    turnaround: '1-2 minutes',
  },
  {
    key: 'websiteReview',
    provider: 'Internal',
    product: 'Compliance scan',
    label: 'Website compliance review',
    checks: 'Refund policy, terms, contact details, delivery timeframes and card scheme marks.',
    turnaround: 'Manual',
  },
];

const PASS_DETAIL = {
  giactVerify: 'Account open · ownership matched · no negative history',
  giactIdentify: 'Full match on name, SSN and address',
  creditPull: 'No derogatory items in the last 24 months',
  ofac: 'No match on any watch list',
  match: 'Not listed',
  secretaryOfState: 'Active and in good standing',
  websiteReview: 'Refund policy, terms and contact details all present',
};

const FAIL_DETAIL = {
  giactVerify: 'Account found but ownership did not match the applicant',
  giactIdentify: 'Address on file does not match the principal record',
  creditPull: 'Two collections filed in the last 12 months',
  ofac: 'Possible name match — manual adjudication required',
  match: 'Principal listed under reason code 12 (excessive chargebacks)',
  secretaryOfState: 'Entity status shows administratively dissolved',
  websiteReview: 'No refund policy and no delivery timeframe published',
};

/**
 * Which checks have been run on a file, and what came back. Not every service
 * has been initiated — an underwriter working a live file is normally waiting
 * on two of them, which is the state the screen has to render well.
 */
export function verificationsFor(record) {
  const seed = String(record?.merchant ?? '').split('').reduce((h, c) => (h * 37 + c.charCodeAt(0)) >>> 0, 23);
  const d = createDraw(seed);

  return VERIFICATION_SERVICES.map((s) => {
    const status = d.weighted([['Passed', 6], ['Not run', 3], ['Review', 2], ['Failed', 1]]);
    const run = status !== 'Not run';

    return {
      ...s,
      status,
      reference: run ? `${s.provider.slice(0, 3).toUpperCase()}-${d.digits(8)}` : '',
      completedAt: run ? `2026/08/${String(d.int(14, 20)).padStart(2, '0')} ${String(d.int(9, 17)).padStart(2, '0')}:${String(d.int(0, 59)).padStart(2, '0')}` : '',
      detail: status === 'Passed' ? PASS_DETAIL[s.key]
        : status === 'Failed' ? FAIL_DETAIL[s.key]
          : status === 'Review' ? FAIL_DETAIL[s.key]
            : '',
    };
  });
}

export const VERIFICATION_TONE = {
  Passed: 'success',
  Failed: 'danger',
  Review: 'warning',
  Running: 'info',
  'Not run': 'neutral',
};

export default SCORECARD_MODEL;
