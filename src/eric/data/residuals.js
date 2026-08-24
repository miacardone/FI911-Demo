/**
 * RESIDUALS — the money-out side of the platform.
 *
 * Eight screens that follow one chain: the general ledger splits gross income,
 * fee adjustments correct it, the agent payout summary rolls it up per agent,
 * payout details and portfolio payout details break it back down per
 * participant and per merchant, and income/expense shows the line items
 * underneath.
 *
 * The small screens are written out; the large ones (Trending Report at 264
 * rows, Portfolio Payout Details at 100) are seeded from rng.js so they
 * paginate realistically without 264 hand-written literals. The seed is fixed,
 * so the numbers are the same on every reload — a demo where the figures move
 * between refreshes reads as broken.
 */

import { createDraw } from '@/eric/data/rng';
import { MERCHANTS, PARTNERS, PORTFOLIOS, midFor } from '@/eric/data/reference';
import { RESIDUAL_AGENTS } from '@/eric/data/people';
import brand from '@/eric/brand.config';

const MONTH = '2026/08/01';
const PREV_MONTH = '2026/07/01';

/* ------------------------------------------------------------------ *
 * 1. General Ledger — splits
 * ------------------------------------------------------------------ */

const SPLIT_SEED = 4021;

export const SPLITS = (() => {
  const d = createDraw(SPLIT_SEED);
  const rows = [];
  const shapes = [
    [43, 60739.43, 9.79], [9, 1696.46, 2.96], [4, 2000.45, 0.93], [1, 72.68, 0.19],
    [0, 0, 0.18], [7, 5790.40, 0.84], [4, 682.26, 0.29], [4, 1692.07, 0.41],
    [1013, 110033.50, 5.99], [173, 40624.63, 3.57], [22, 8509.12, 1.61], [0, 0, 0.22],
    [0, 0, 0.22], [37, 4001.10, 0.99], [0, 0, 0.22],
  ];

  shapes.forEach(([transactions, volume, payout], i) => {
    const internal = i === 11;
    rows.push({
      id: `gl-${i}`,
      reserveMonth: MONTH,
      payoutMonth: MONTH,
      participant: internal ? 'Internal settlement' : 'Barclays Merchant Services',
      type: 'PSP',
      splitTo: 'ACI admin',
      splitFrom: internal ? 'Internal settlement' : 'Barclays Merchant Services',
      splits: 1,
      transactions,
      volume,
      payout,
      mine: d.bool(0.4),
    });
  });

  return rows;
})();

export const mySplits = () => SPLITS.filter((r) => r.mine);

/* ------------------------------------------------------------------ *
 * 2. Fee Adjustments
 * ------------------------------------------------------------------ */

export const FEE_ADJUSTMENTS = [
  { id: 'fa-1', month: MONTH, participant: 'Barclays Merchant Services BMS01', type: 'PSP', agent: '1st Grafton', profileId: 'A3213-1', item: 'Residual payout adjustment', description: 'Quarterly true-up credit', amount: 18.75, mine: true },
  { id: 'fa-2', month: MONTH, participant: 'Barclays Merchant Services BMS01', type: 'PSP', agent: '1st Grafton', profileId: 'A3213-1', item: 'Residual fee correction', description: 'Network fee correction', amount: -6.50, mine: false },
  { id: 'fa-3', month: MONTH, participant: 'Barclays Merchant Services BMS01', type: 'PSP', agent: '1st Grafton', profileId: 'A3213-1', item: 'Residual payout adjustment', description: 'Manual reserve release', amount: 42.00, mine: true },
  { id: 'fa-4', month: MONTH, participant: 'Barclays Merchant Services BMS01', type: 'PSP', agent: '1st Grafton', profileId: 'A3213-1', item: 'Residual payout adjustment', description: 'Pricing support adjustment', amount: 12.25, mine: false },
];

export const myAdjustments = () => FEE_ADJUSTMENTS.filter((r) => r.mine);

/* ------------------------------------------------------------------ *
 * 3. Trending Report
 * ------------------------------------------------------------------ *
 * Each agent contributes three rows — Payout, Volume and Count — because the
 * report trends one parameter per row. That triple is why the row count is a
 * multiple of three.
 */

const TREND_AGENTS = [
  { name: 'Bank of Scotland 12-11-03', merchants: 130, payout: 3973.07, volume: 1645570.03, count: 13747 },
  { name: 'First Direct 40-47-87', merchants: 104, payout: 3697.83, volume: 1143430.55, count: 10267 },
  { name: 'Santander UK 72-00-00', merchants: 2, payout: 0, volume: 345950.22, count: 3418 },
  { name: 'Lloyds Bank 30-96-35', merchants: 27, payout: 443.86, volume: 216750.85, count: 5580 },
  { name: 'Cornerstone Cornerstone', merchants: 119, payout: 5925.88, volume: 2617877.89, count: 12297 },
  { name: 'Cornerstone Cornerstone', merchants: 6, payout: 3.61, volume: 19638.96, count: 28 },
  { name: 'Halifax 11-16-26', merchants: 88, payout: 2841.19, volume: 987654.10, count: 8842 },
  { name: 'HSBC 40-12-76', merchants: 64, payout: 1930.44, volume: 742199.75, count: 6431 },
  { name: 'Barclays 20-26-78', merchants: 152, payout: 6712.90, volume: 3011884.62, count: 15903 },
  { name: 'National Westminster 56-00-03', merchants: 97, payout: 3155.02, volume: 1288740.31, count: 9776 },
  { name: 'Starling Bank 60-83-71', merchants: 41, payout: 812.55, volume: 402118.44, count: 4120 },
  { name: 'Bank of New York Mellon 76-02-25', merchants: 18, payout: 285.10, volume: 155992.08, count: 1602 },
  { name: 'Metro Bank 23-05-80', merchants: 33, payout: 604.77, volume: 281443.19, count: 3287 },
  { name: 'Monzo Business 04-00-03', merchants: 76, payout: 2210.63, volume: 869332.55, count: 7440 },
  { name: 'Revolut Business 04-29-09', merchants: 59, payout: 1488.31, volume: 613077.90, count: 5911 },
  { name: 'Clydesdale Bank 82-62-26', merchants: 24, payout: 391.02, volume: 187644.73, count: 2244 },
  { name: 'Nationwide 07-00-93', merchants: 12, payout: 144.88, volume: 79210.66, count: 968 },
  { name: 'TSB Bank 77-91-22', merchants: 47, payout: 1002.44, volume: 468920.11, count: 4703 },
  { name: 'Virgin Money 05-01-15', merchants: 29, payout: 522.19, volume: 240188.37, count: 2810 },
  { name: 'Tide Payments 04-06-20', merchants: 51, payout: 1173.66, volume: 522904.28, count: 5188 },
  { name: 'ClearBank 04-11-22', merchants: 15, payout: 231.40, volume: 122570.19, count: 1355 },
  { name: 'Barclays Bank UK 36-26-74', merchants: 108, payout: 4188.72, volume: 1904330.55, count: 11208 },
];

export const TRENDING = TREND_AGENTS.flatMap((a, i) => (
  [['Payout', a.payout], ['Volume', a.volume], ['Count', a.count]].map(([parameter, value], j) => ({
    id: `tr-${i}-${j}`,
    agent: a.name,
    processor: 'PSP',
    parameter,
    period: 'Payout Month',
    fromMonth: PREV_MONTH,
    merchants: a.merchants,
    value,
    toMonth: MONTH,
    isMoney: parameter !== 'Count',
  }))
));

/* ------------------------------------------------------------------ *
 * 4. Agent Payout Summary
 * ------------------------------------------------------------------ */

export const AGENT_PAYOUTS = [
  { id: 'ap-1', agent: 'ACI admin', profileId: 'ACI000001', profiles: 3, participants: 35, transactions: 6571, volume: 607065.45, income: 15687.55, expense: 12518.94, grossProfit: 3168.61, payoutToOthers: 28.41, grossPayout: 2564.25 },
  { id: 'ap-2', agent: 'PayUK', profileId: '', profiles: 1, participants: 7, transactions: 782, volume: 333494.59, income: 7776.06, expense: 7199.65, grossProfit: 576.41, payoutToOthers: 0, grossPayout: 489.92 },
  { id: 'ap-3', agent: '1st Grafton', profileId: 'A3213-1', profiles: 1, participants: 16, transactions: 1329, volume: 237865.85, income: 6280.78, expense: 5715.55, grossProfit: 565.23, payoutToOthers: 0, grossPayout: 282.58 },
  { id: 'ap-4', agent: 'Yvonne Hall', profileId: 'A3092-1', profiles: 1, participants: 8, transactions: 1009, volume: 215856.80, income: 4751.34, expense: 3417.69, grossProfit: 1333.65, payoutToOthers: 0, grossPayout: 333.43 },
  { id: 'ap-5', agent: 'Huntingdon Garner', profileId: 'A3212-2', profiles: 1, participants: 6, transactions: 706, volume: 245326.12, income: 5162.76, expense: 4871.56, grossProfit: 291.20, payoutToOthers: 0, grossPayout: 43.70 },
  { id: 'ap-6', agent: 'Eric Bolen', profileId: 'A4099-107', profiles: 1, participants: 16, transactions: 1339, volume: 239794.03, income: 6280.78, expense: 5715.55, grossProfit: 565.23, payoutToOthers: 0, grossPayout: 28.41 },
  { id: 'ap-7', agent: 'Michael Collester', profileId: 'A3010-2', profiles: 1, participants: 12, transactions: 4389, volume: 175304.63, income: 5095.58, expense: 3665.52, grossProfit: 1430.06, payoutToOthers: 0, grossPayout: 0 },
].map((r) => ({ ...r, residualMonth: MONTH, payoutMonth: MONTH, type: 'PSP' }));

/* ------------------------------------------------------------------ *
 * 5. Payout Details — "My Income" line items
 * ------------------------------------------------------------------ */

const ITEM_NAMES = [
  '06-Chase Acq American Express Purchase',
  '07-Worldpay Acq Discover Purchase',
  '01-TSYS Acq Visa VirtualNet IP - Purchase',
  '05-Interchange Plus Pricing Visa Credit',
  '13-Visa Acquirer Proc Fee Debit',
  '03-TSYS Acq Transmittals',
];

const RATE_TYPES = ['Count', 'Volume', 'PassThru'];

export const MY_INCOME = (() => {
  const d = createDraw(7731);
  return Array.from({ length: 33 }, (_, i) => {
    const merchant = d.pick(MERCHANTS);
    const partner = d.pick(PARTNERS);
    const rateType = d.pick(RATE_TYPES);
    const volume = d.money(2000, 30000);
    const count = d.int(3, 90);
    const income = rateType === 'PassThru' ? d.money(0.1, 1) : d.money(0.3, 700);
    const expense = rateType === 'PassThru' ? income : d.money(0, income);
    const grossProfit = Math.round((income - expense) * 100) / 100;
    const payout = Math.round((grossProfit / 2) * 100) / 100;

    return {
      id: `mi-${i}`,
      residualMonth: MONTH,
      payoutMonth: MONTH,
      agent: 'Donald Kossmann - DK-01',
      merchant,
      mid: midFor(merchant, 14),
      partner: `${partner.name} ${partner.code}`,
      itemName: `${d.pick(ITEM_NAMES)} Auth & Capture`,
      volume,
      count,
      income,
      buyRate: d.float(0, 0.13).toFixed(6),
      rateType,
      expense,
      grossProfit,
      payoutToOthers: payout,
      payout,
    };
  });
})();

/* ------------------------------------------------------------------ *
 * 6. Participant Status
 * ------------------------------------------------------------------ */

export const PARTICIPANT_STATUS = [
  { id: 'ps-1', participant: 'Bank of Scotland', sortCode: '12-11-03', partner: 'Halifax', partnerCode: '11-16-26', portfolio: PORTFOLIOS[0], portfolioType: 'Supplier', open: '', close: '', status: 'Active' },
  { id: 'ps-2', participant: 'Bank of Scotland', sortCode: '12-11-03', partner: 'Halifax', partnerCode: '11-16-26', portfolio: '_QA1', portfolioType: 'PSP', open: '', close: '', status: 'Active' },
  { id: 'ps-3', participant: 'Barclays', sortCode: '20-26-78', partner: 'Lloyds Bank', partnerCode: '30-96-35', portfolio: PORTFOLIOS[1], portfolioType: 'Supplier', open: '', close: '', status: 'Active' },
  { id: 'ps-4', participant: 'Halifax', sortCode: '11-16-26', partner: '', partnerCode: '', portfolio: PORTFOLIOS[1], portfolioType: 'Supplier', open: '', close: '', status: 'Active' },
  { id: 'ps-5', participant: 'Bank of New York Mellon', sortCode: '70-02-25', partner: '', partnerCode: '', portfolio: PORTFOLIOS[0], portfolioType: 'Supplier', open: '2026/08/11', close: '', status: 'Active' },
  { id: 'ps-6', participant: 'Starling Bank Limited', sortCode: '60-83-71', partner: '', partnerCode: '', portfolio: PORTFOLIOS[0], portfolioType: 'Supplier', open: '2026/08/12', close: '', status: 'Active' },
  { id: 'ps-7', participant: 'National Westminster Bank', sortCode: '56-00-03', partner: '', partnerCode: '', portfolio: PORTFOLIOS[3], portfolioType: 'PSP', open: '2026/08/12', close: '', status: 'Active' },
];

/* ------------------------------------------------------------------ *
 * 7. Income / Expense line items
 * ------------------------------------------------------------------ */

export const INCOME_EXPENSE = (() => {
  const d = createDraw(9152);
  const items = [
    { name: '01-TSYS Acq Visa VirtualNet IP - Purchase', partner: PARTNERS[1], volume: 17996.84, count: 3, income: 0.30, buyRate: '0.058', rateType: 'Count', expense: 0.18 },
    { name: '01-TSYS Acq Visa VirtualNet IP - Purchase', partner: PARTNERS[1], volume: 18450.72, count: 3, income: 0.30, buyRate: '0.058', rateType: 'Count', expense: 0.18 },
    { name: '03-TSYS Acq Transmittals', partner: PARTNERS[2], volume: 97841.27, count: 27, income: 2.70, buyRate: '0.0545', rateType: 'Count', expense: 1.62 },
    { name: '03-TSYS Acq Transmittals', partner: PARTNERS[2], volume: 96312.48, count: 27, income: 2.70, buyRate: '0.0545', rateType: 'Count', expense: 1.62 },
    { name: '03-TSYS Transmittals', partner: PARTNERS[3], volume: 4058.91, count: 1, income: 0.10, buyRate: '0.061', rateType: 'Count', expense: 0.06 },
    { name: '03-TSYS Transmittals', partner: PARTNERS[3], volume: 4120.33, count: 1, income: 0.10, buyRate: '0.061', rateType: 'Count', expense: 0.06 },
    { name: '13-Visa Acquirer Proc Fee Debit', partner: PARTNERS[4], volume: 29108.33, count: 14, income: 0.22, buyRate: '', rateType: 'PassThru', expense: 0.22 },
    { name: '13-Visa Acquirer Proc Fee Debit', partner: PARTNERS[4], volume: 28754.90, count: 14, income: 0.22, buyRate: '', rateType: 'PassThru', expense: 0.22 },
    { name: '05-Interchange Plus Pricing Visa Credit', partner: PARTNERS[0], volume: 25892.17, count: 67, income: 647.30, buyRate: '0.025', rateType: 'Volume', expense: 647.30 },
    { name: '06-Chase Acq American Express Purchase', partner: PARTNERS[5], volume: 18765.43, count: 42, income: 8.40, buyRate: '0.120000', rateType: 'Count', expense: 5.04 },
  ];

  return items.map((it, i) => ({
    id: `ie-${i}`,
    residualMonth: MONTH,
    payoutMonth: MONTH,
    agent: 'PayUK',
    agentScope: i % 2 === 0 ? 'House [PSP]' : 'House [Supplier]',
    participant: 'Ashton & Partners Ltd',
    participantMid: '889561051029485',
    partner: it.partner.name,
    partnerCode: it.partner.code,
    itemName: it.name,
    itemSub: 'Auth & Capture',
    volume: it.volume,
    count: it.count,
    income: it.income,
    buyRate: it.buyRate,
    rateType: it.rateType,
    expense: it.expense,
  }));
})();

/* ------------------------------------------------------------------ *
 * 8. Portfolio Payout Details
 * ------------------------------------------------------------------ *
 * Each participant appears twice — once under the owning agent and once under
 * the house profile — which is why the volumes pair up closely but not
 * exactly, and why the row count is even.
 */

export const PORTFOLIO_PAYOUTS = (() => {
  const d = createDraw(5318);
  const participants = [
    'Ashton & Partners Ltd', 'Bluebell Care Services', 'Corbridge Engineering', 'Devonshire Tea Rooms',
    'Eastgate Office Supplies', 'Fairfield Sports Ltd', 'Penarth Marina Ltd', 'Tenby Surf School Ltd',
    'Helmsley Artisan Bakery', 'Phoenix Wine Merchants', 'Quarry Lane Hardware Ltd', 'Summit Electrical Ltd',
    'Dunmore Travel Ltd', 'Riverside Flooring Co', 'Whitmore Building Supplies', 'Hargreaves & Sons Ltd',
    'Thornfield Market Ltd', 'Westgate Print & Design', 'Birchwood Vets Ltd', 'Cranleigh Kitchens Ltd',
    'Gainsborough Print Ltd', 'Bramble Hill Deli', 'Granary Bakehouse Ltd', 'Elmside Gift Shop',
    'Clifton Beauty & Wellness',
  ];

  const rows = [];
  participants.forEach((participant, i) => {
    const transactions = d.int(3, 620);
    const volume = d.money(6000, 210000);
    const income = d.money(100, 4200);
    const expense = Math.round(income * d.float(0.85, 0.96) * 100) / 100;
    const grossProfit = Math.round((income - expense) * 100) / 100;

    ['Huntingdon Garner A3212-2[PSP]', 'PayUK House[PSP]'].forEach((agent, j) => {
      const grossPayout = j === 0
        ? Math.round(grossProfit * 0.01 * 100) / 100
        : Math.round(grossProfit * 0.6 * 100) / 100;

      rows.push({
        id: `pp-${i}-${j}`,
        residualMonth: MONTH,
        payoutMonth: MONTH,
        participant,
        mid: midFor(participant, 15),
        partner: 'Barclays Merchant Services',
        agent,
        portfolio: PORTFOLIOS[2],
        transactions: j === 0 ? transactions : Math.max(1, transactions - d.int(0, 4)),
        volume: j === 0 ? volume : Math.round(volume * d.float(0.985, 0.999) * 100) / 100,
        income,
        expense,
        grossProfit,
        payoutToOthers: 0,
        grossPayout,
        adjustments: 0,
        payout: grossPayout,
      });
    });
  });

  return rows;
})();

/** Scope strip shared by the payout screens. */
export const PAYOUT_SCOPE = [
  { label: 'Search By', value: 'Payout Month' },
  { label: 'From', value: '2026/08/20' },
  { label: 'To', value: '2026/08/20' },
  { label: 'Last calculated data', value: '2026/08/20' },
];

export { MONTH as RESIDUAL_MONTH, brand };
