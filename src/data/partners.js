/**
 * PARTNERS — the banks and ISOs that acquire merchants on the bank's behalf.
 *
 * A partner is not a row in a dropdown. It is a business that introduces
 * merchants, earns a share of what they generate, and — depending on how the
 * deal was written — carries some, all or none of what they cost when they go
 * wrong. The console needed somewhere to answer three questions an acquirer
 * asks about every partner it works with:
 *
 *   · what have they brought us, and is it still coming?
 *   · what are we paying them for it?
 *   · what is that book doing to our risk?
 *
 * The third is the one that gets missed. A partner with a large book and a
 * good pipeline can still be the worst relationship on the list once you set
 * the residual you pay them against the chargeback loss you absorb from the
 * merchants they introduced. `netToBank` is stored precisely so that
 * comparison is a column rather than an exercise.
 */

import { createDraw } from '@/data/rng';
import { PARTNERS as PARTNER_NAMES } from '@/data/reference';
import { INVITATIONS, APPLICATIONS, UNDERWRITING, LIVE_PARTICIPANTS } from '@/data/participants';
import { AGENTS } from '@/data/people';

export const PARTNER_TIERS = [
  { id: 'strategic', label: 'Strategic', help: 'Largest books, dedicated support, negotiated pricing.' },
  { id: 'growth', label: 'Growth', help: 'Building volume. Standard pricing with review at renewal.' },
  { id: 'referral', label: 'Referral', help: 'Introduces merchants but does not service them.' },
];

export const PARTNER_STATUSES = ['Active', 'Onboarding', 'Under Review', 'Suspended'];

/**
 * The partner book.
 *
 * `merchants`, `pipeline` and the funnel counts are derived from the real
 * merchant lists where a partner has rows there, so a partner's book on this
 * screen and the merchants on the funnel screens cannot disagree. The rest is
 * drawn, because there are more partners than the funnel carries.
 */
export const PARTNER_BOOK = (() => {
  const d = createDraw(9301);

  return PARTNER_NAMES.slice(0, 12).map((p, i) => {
    const tier = i < 3 ? 'strategic' : i < 8 ? 'growth' : 'referral';

    const liveCount = d.int(28, 340);
    const pipeline = d.int(2, 26);

    const monthlyVolume = d.money(420_000, 14_800_000);
    /* What the bank earns on this partner's book before paying them. */
    const grossRevenue = Math.round(monthlyVolume * (d.float(0.18, 0.42) / 100) * 100) / 100;
    /* The residual the partner is owed on it. */
    const revenueShare = tier === 'strategic' ? d.pick([45, 50, 55]) : tier === 'growth' ? d.pick([30, 35, 40]) : d.pick([15, 20, 25]);
    const residualOwed = Math.round(grossRevenue * (revenueShare / 100) * 100) / 100;

    /* Chargeback loss from this partner's merchants, and how much of it the
       partner actually absorbs. A referral partner typically absorbs none. */
    const chargebackLoss = d.money(600, 74_000);
    const lossShare = tier === 'referral' ? 0 : d.pick([0, 0, 10, 20, 30]);
    const lossCarried = Math.round(chargebackLoss * (lossShare / 100) * 100) / 100;

    /* What the relationship is actually worth to the bank once both sides are
       counted. This can and does go negative. */
    const netToBank = Math.round((grossRevenue - residualOwed - (chargebackLoss - lossCarried)) * 100) / 100;

    const cbRatio = Math.round(d.float(0.08, 2.4) * 100) / 100;

    return {
      id: `ptr-${i}`,
      name: p.name,
      code: p.code,
      tier,
      tierLabel: PARTNER_TIERS.find((t) => t.id === tier).label,
      status: d.weighted([['Active', 8], ['Onboarding', 1], ['Under Review', 1]]),
      relationshipOwner: d.pick(AGENTS),
      since: `20${d.int(14, 24)}/${String(d.int(1, 12)).padStart(2, '0')}/01`,

      merchants: liveCount,
      pipeline,
      monthlyVolume,

      grossRevenue,
      revenueShare,
      residualOwed,

      chargebackLoss,
      lossShare,
      lossCarried,
      netToBank,
      cbRatio,

      /* Merchants introduced but never boarded — a partner sending
         applications that keep failing underwriting is a quality problem, not
         a volume one. */
      declinedLast90: d.int(0, 14),
      approvedLast90: d.int(3, 38),
    };
  });
})();

export const partnerByCode = (code) => PARTNER_BOOK.find((p) => p.code === code) ?? PARTNER_BOOK[0];
export const partnerById = (id) => PARTNER_BOOK.find((p) => p.id === id) ?? PARTNER_BOOK[0];

export const PARTNER_TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'strategic', label: 'Strategic', match: (p) => p.tier === 'strategic' },
  { value: 'growth', label: 'Growth', match: (p) => p.tier === 'growth' },
  { value: 'referral', label: 'Referral', match: (p) => p.tier === 'referral' },
  { value: 'negative', label: 'Costing money', match: (p) => p.netToBank < 0 },
];

/**
 * Approval rate over the last 90 days.
 *
 * A partner's real quality signal: plenty introduce volume, fewer introduce
 * volume that survives underwriting.
 */
export const approvalRate = (p) => {
  const total = p.approvedLast90 + p.declinedLast90;
  return total ? Math.round((p.approvedLast90 / total) * 1000) / 10 : 0;
};

/**
 * The merchants a partner introduced, drawn from the real funnel lists.
 *
 * Assigned deterministically by name so the same merchant always belongs to
 * the same partner, and so a partner's book here matches what the funnel
 * screens show.
 */
export function partnerMerchants(partner) {
  const all = [
    ...INVITATIONS.map((r) => ({ ...r, stage: 'Proposal' })),
    ...APPLICATIONS.map((r) => ({ ...r, stage: 'Contract' })),
    ...UNDERWRITING.map((r) => ({ ...r, stage: 'Underwriting' })),
    ...LIVE_PARTICIPANTS.map((r) => ({ ...r, stage: 'Live' })),
  ];
  const idx = PARTNER_BOOK.findIndex((p) => p.id === partner.id);
  const n = PARTNER_BOOK.length;
  /* A stable hash of the merchant name decides which partner owns it. */
  return all.filter((r) => {
    const h = String(r.merchant).split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
    return h % n === idx;
  });
}

export default PARTNER_BOOK;
