/**
 * FEE PROGRAMS — how a bank introduces a new fee, and who ends up with it.
 *
 * A fee is not one number. Introducing one is a sequence of decisions that a
 * pricing screen full of rate cards cannot express:
 *
 *   · what it charges on — a flat monthly fee behaves nothing like a per-item
 *     fee on a merchant doing 90,000 transactions a month;
 *   · who it lands on — every merchant, one portfolio, one partner's book, or
 *     a segment such as high-risk MCCs;
 *   · when it starts, and how much notice the merchant is owed before it does;
 *   · how the money splits between the bank, the partner who introduced the
 *     merchant, and the agent who services them;
 *   · and — the half everyone forgets — how the LOSS splits when that same
 *     merchant charges back.
 *
 * The last two are stored separately on purpose. A partner taking 60% of the
 * revenue and 0% of the loss is a completely different commercial deal from
 * one taking 60% of both, and a console that only models the revenue split
 * cannot tell you which one you signed.
 */

import { createDraw } from '@/data/rng';
import { PARTNERS } from '@/data/reference';
import { AGENTS } from '@/data/people';
import brand from '@/brand/brand.config';

/* What the fee is charged on. The basis decides how revenue scales, which is
   why the projection needs it rather than just an amount. */
export const FEE_BASES = [
  { id: 'monthly', label: 'Fixed monthly', unit: 'per merchant per month', help: 'A flat charge every merchant pays each month regardless of activity.' },
  { id: 'per_txn', label: 'Per transaction', unit: 'per transaction', help: 'Charged on every transaction. Scales with volume, so a busy merchant pays far more than a quiet one.' },
  { id: 'percent', label: 'Percentage of volume', unit: '% of settled volume', help: 'A share of everything settled. The only basis that grows with ticket size.' },
  { id: 'per_cb', label: 'Per chargeback', unit: 'per chargeback', help: 'Charged when a dispute is raised. Doubles as a behavioural incentive.' },
];

export const feeBasis = (id) => FEE_BASES.find((b) => b.id === id) ?? FEE_BASES[0];

/* Who the fee lands on. */
export const FEE_SCOPES = [
  { id: 'all', label: 'Every merchant' },
  { id: 'portfolio', label: 'One portfolio' },
  { id: 'partner', label: "One partner's book" },
  { id: 'segment', label: 'A merchant segment' },
];

export const FEE_SEGMENTS = ['High-risk MCCs', 'Self-service signups', 'Card-not-present only', 'Above $250k monthly volume', 'Merchants in a monitoring program'];

export const FEE_STATUSES = ['Draft', 'Scheduled', 'Live', 'Retired'];

/**
 * Notice periods. A fee that starts tomorrow is a complaint; most card
 * agreements oblige the acquirer to give the merchant time to leave.
 */
export const NOTICE_PERIODS = [0, 14, 30, 60, 90];

/**
 * Projected monthly revenue for a fee.
 *
 * Derived rather than stored, so changing the amount or the reach in the
 * wizard moves the number in front of you. That is the whole point of
 * previewing a fee before publishing it.
 */
export function projectRevenue({ basis, amount, merchants, avgTxnsPerMerchant = 780, avgVolumePerMerchant = 96_000, avgChargebacksPerMerchant = 4 }) {
  const n = Number(merchants) || 0;
  const a = Number(amount) || 0;
  switch (basis) {
    case 'per_txn': return Math.round(n * avgTxnsPerMerchant * a * 100) / 100;
    case 'percent': return Math.round(n * avgVolumePerMerchant * (a / 100) * 100) / 100;
    case 'per_cb': return Math.round(n * avgChargebacksPerMerchant * a * 100) / 100;
    case 'monthly':
    default: return Math.round(n * a * 100) / 100;
  }
}

/** Split a projected amount three ways. Shares are percentages of the whole. */
export const splitOf = (total, share) => Math.round(total * (share / 100) * 100) / 100;

/**
 * The residual and risk consequence of a split, side by side.
 *
 * `revenue` is what each party earns from the fee each month. `loss` is what
 * each party absorbs when the merchants it covers charge back. Presenting them
 * together is the only way to see that a partner on 60/0 is being paid to
 * introduce risk it does not carry.
 */
export function splitLines(fee, monthlyRevenue, monthlyLoss) {
  return [
    { party: 'Acquiring bank', who: brand.legalName, revenueShare: fee.bankShare, lossShare: fee.bankLoss, revenue: splitOf(monthlyRevenue, fee.bankShare), loss: splitOf(monthlyLoss, fee.bankLoss) },
    { party: 'Partner', who: fee.partner || 'Not partner-scoped', revenueShare: fee.partnerShare, lossShare: fee.partnerLoss, revenue: splitOf(monthlyRevenue, fee.partnerShare), loss: splitOf(monthlyLoss, fee.partnerLoss) },
    { party: 'Agent', who: fee.agent || 'House account', revenueShare: fee.agentShare, lossShare: fee.agentLoss, revenue: splitOf(monthlyRevenue, fee.agentShare), loss: splitOf(monthlyLoss, fee.agentLoss) },
  ];
}

/* `shares` pins a split where the commercial point matters more than variety.
   Left to the draw, the asymmetric cases — a partner earning a revenue share
   while absorbing none of the chargeback loss — simply never came up, and the
   screen's whole reason for separating the two splits was invisible. Two of
   these are pinned asymmetric on purpose. */
const FEE_SEEDS = [
  { name: 'Monthly Account Maintenance', basis: 'monthly', amount: 9.95, scope: 'all', status: 'Live' },
  { name: 'PCI Non-Compliance Fee', basis: 'monthly', amount: 24.95, scope: 'segment', segment: 'Merchants in a monitoring program', status: 'Live' },
  { name: 'Chargeback Handling Fee', basis: 'per_cb', amount: 25.00, scope: 'all', status: 'Live' },
  {
    name: 'Interchange Differential', basis: 'percent', amount: 0.15, scope: 'portfolio', status: 'Live',
    /* The classic referral deal: the partner is paid to introduce volume and
       carries none of what that volume costs when it goes wrong. */
    shares: { bankShare: 60, partnerShare: 35, agentShare: 5, bankLoss: 100, partnerLoss: 0, agentLoss: 0 },
  },
  {
    name: 'Gateway Access Fee', basis: 'monthly', amount: 14.50, scope: 'partner', status: 'Live',
    shares: { bankShare: 50, partnerShare: 40, agentShare: 10, bankLoss: 90, partnerLoss: 0, agentLoss: 10 },
  },
  { name: 'High-Risk Oversight Surcharge', basis: 'percent', amount: 0.35, scope: 'segment', segment: 'High-risk MCCs', status: 'Scheduled' },
  { name: 'Self-Service Onboarding Fee', basis: 'monthly', amount: 4.95, scope: 'segment', segment: 'Self-service signups', status: 'Scheduled' },
  { name: 'Per-Item Authorization Fee', basis: 'per_txn', amount: 0.035, scope: 'all', status: 'Live' },
  { name: 'Early Termination Recovery', basis: 'monthly', amount: 41.25, scope: 'portfolio', status: 'Draft' },
  { name: 'Legacy Statement Fee', basis: 'monthly', amount: 5.00, scope: 'all', status: 'Retired' },
];

export const FEE_PROGRAMS = (() => {
  const d = createDraw(8801);

  return FEE_SEEDS.map((seed, i) => {
    const partner = d.pick(PARTNERS);
    const merchants = seed.scope === 'all' ? d.int(1_600, 2_100)
      : seed.scope === 'portfolio' ? d.int(180, 640)
        : seed.scope === 'partner' ? d.int(90, 420)
          : d.int(40, 260);

    /* Revenue splits are negotiated; loss splits far less often move with
       them, which is exactly the asymmetry worth showing. */
    const drawnBank = d.pick([40, 50, 55, 60, 70]);
    const drawnPartner = seed.scope === 'partner' || d.bool(0.6) ? d.pick([20, 25, 30, 35]) : 0;
    const drawnBankLoss = d.pick([60, 75, 85, 100]);
    const drawnPartnerLoss = drawnPartner ? d.pick([0, 10, 15, 25]) : 0;

    const {
      bankShare = drawnBank,
      partnerShare = drawnPartner,
      agentShare = Math.max(0, 100 - drawnBank - drawnPartner),
      bankLoss = drawnBankLoss,
      partnerLoss = drawnPartnerLoss,
      agentLoss = Math.max(0, 100 - drawnBankLoss - drawnPartnerLoss),
    } = seed.shares ?? {};

    const { shares, ...rest } = seed;

    return {
      id: `fee-${i}`,
      ...rest,
      segment: seed.segment ?? '',
      portfolio: seed.scope === 'portfolio' ? d.pick(['Stewardship Technology Inc', 'Advantage Payment Solutions', 'Versatile Merchant Solutions']) : '',
      partner: seed.scope === 'partner' ? partner.name : (partnerShare ? partner.name : ''),
      agent: agentShare ? d.pick(AGENTS) : '',
      merchants,
      effectiveDate: seed.status === 'Draft' ? '' : `2026/${String(d.int(1, 12)).padStart(2, '0')}/01`,
      noticeDays: d.pick(NOTICE_PERIODS),
      bankShare, partnerShare, agentShare,
      bankLoss, partnerLoss, agentLoss,
      /* Monthly chargeback loss attributable to the merchants this fee covers.
         Needed to make the loss split a number rather than a percentage. */
      monthlyLoss: d.money(400, 26_000),
      introducedBy: d.pick(AGENTS),
      created: `2026/0${d.int(1, 8)}/${String(d.int(1, 28)).padStart(2, '0')}`,
    };
  });
})();

export const FEE_TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'live', label: 'Live', match: (f) => f.status === 'Live' },
  { value: 'scheduled', label: 'Scheduled', match: (f) => f.status === 'Scheduled' },
  { value: 'draft', label: 'Draft', match: (f) => f.status === 'Draft' },
  { value: 'retired', label: 'Retired', match: (f) => f.status === 'Retired' },
];

/** Revenue a fee actually produces each month, from its own basis and reach. */
export const feeRevenue = (f) => projectRevenue({ basis: f.basis, amount: f.amount, merchants: f.merchants });

export default FEE_PROGRAMS;
