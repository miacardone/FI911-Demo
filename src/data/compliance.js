/**
 * COMPLIANCE — a merchant falling out of compliance, and what happens next.
 *
 * "Out of compliance" is not a status someone types in. It is what a rule
 * concludes, on a date, from a fact that changed: a KYC document passed its
 * expiry, a chargeback ratio crossed a scheme threshold, a PCI attestation
 * lapsed, a licence was never renewed.
 *
 * What makes it worth modelling as its own object rather than a flag on the
 * merchant is that a breach has a LIFE:
 *
 *   detected → merchant notified → remediation window → escalation → consequence
 *
 * and at every point in that life somebody is on the hook for the next move.
 * A console that shows only "Non-compliant" tells an operator that something
 * is wrong but not what happens on Friday if nobody does anything — which is
 * the only question that actually matters, because the consequences here are
 * automatic: reserves rise, settlement holds, and eventually the merchant is
 * offboarded whether or not anyone remembered.
 *
 * `daysRemaining` is derived from the deadline rather than stored, so it can
 * never disagree with the date beside it.
 */

import { createDraw } from '@/data/rng';
import { RISK_MERCHANTS, midFor } from '@/data/reference';
import { ASSIGNEES } from '@/data/people';
import brand from '@/brand/brand.config';

/**
 * What can trip a merchant out of compliance.
 *
 * Each rule carries its own remediation window and its own consequence,
 * because they are genuinely different obligations. An expired KYC document
 * is a paperwork problem with a generous window; a breached scheme threshold
 * is a card-network matter with a fixed clock the bank does not control.
 */
export const BREACH_RULES = [
  {
    id: 'kyc_expired',
    label: 'KYC document expired',
    category: 'Documentation',
    windowDays: 30,
    detectedBy: 'Document retention sweep',
    consequence: 'Settlement held until refreshed',
    help: 'An identity or ownership document on file has passed its expiry date. The merchant is no longer evidenced to the standard onboarding required.',
  },
  {
    id: 'pci_lapsed',
    label: 'PCI attestation lapsed',
    category: 'Documentation',
    windowDays: 45,
    detectedBy: 'Annual attestation check',
    consequence: 'Non-compliance fee applied monthly',
    help: 'The annual PCI DSS self-assessment has not been renewed. Card schemes levy this back to the acquirer, which is why it bills through rather than simply flagging.',
  },
  {
    id: 'cb_ratio',
    label: 'Chargeback ratio breached',
    category: 'Scheme monitoring',
    windowDays: 60,
    detectedBy: 'Monthly scheme ratio calculation',
    consequence: 'Entered into scheme monitoring program',
    help: 'The merchant crossed the card scheme threshold, near 1% by count or value. The clock on this one belongs to the scheme, not the bank.',
  },
  {
    id: 'volume_breach',
    label: 'Volume beyond approved limit',
    category: 'Underwriting',
    windowDays: 14,
    detectedBy: 'Daily settlement comparison',
    consequence: 'Reserve raised until re-underwritten',
    help: 'Settled volume exceeded what underwriting approved. Either the merchant grew and nobody re-underwrote them, or the traffic is not what was described.',
  },
  {
    id: 'licence',
    label: 'Trading licence unverified',
    category: 'Documentation',
    windowDays: 30,
    detectedBy: 'Regulated-MCC licence check',
    consequence: 'Settlement held until verified',
    help: 'A merchant in a regulated category has no current licence on file. Processing for an unlicensed merchant in these categories exposes the acquirer directly.',
  },
  {
    id: 'bank_unverified',
    label: 'Settlement account unverified',
    category: 'Onboarding',
    windowDays: 21,
    detectedBy: 'Self-service onboarding check',
    consequence: 'Payouts suspended',
    help: 'A self-service signup never completed bank verification. Funds cannot safely be paid to an account nobody has confirmed belongs to them.',
  },
];

export const breachRule = (id) => BREACH_RULES.find((r) => r.id === id) ?? BREACH_RULES[0];

/**
 * The stages a breach moves through. Each names who holds it, because the
 * common failure is a breach sitting in a queue nobody owns.
 */
export const BREACH_STAGES = [
  { id: 'detected', label: 'Detected', owner: 'System', help: 'A rule concluded the merchant is out of compliance. Nobody has been told yet.' },
  { id: 'notified', label: 'Merchant notified', owner: 'Operations', help: 'The merchant has been written to and the remediation clock is running.' },
  { id: 'remediating', label: 'Remediating', owner: 'Merchant', help: 'The merchant has acknowledged and is supplying what was asked for.' },
  { id: 'escalated', label: 'Escalated', owner: 'Risk', help: 'The window closed without resolution. Risk decides the consequence.' },
  { id: 'enforced', label: 'Consequence applied', owner: 'Risk', help: 'Reserves raised, settlement held, or the merchant offboarded.' },
  { id: 'resolved', label: 'Resolved', owner: '—', help: 'The merchant satisfied the requirement and is back in good standing.' },
];

export const breachStage = (id) => BREACH_STAGES.find((s) => s.id === id) ?? BREACH_STAGES[0];

const TODAY = new Date(`${brand.today}T00:00:00`);

/** Days between today and a yyyy/mm/dd deadline. Negative means overdue. */
export function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr.replace(/\//g, '-')}T00:00:00`);
  return Math.round((d - TODAY) / 86_400_000);
}

const addDays = (base, n) => {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
};

export const BREACHES = (() => {
  const d = createDraw(9401);

  return RISK_MERCHANTS.slice(0, 16).map((m, i) => {
    const rule = BREACH_RULES[i % BREACH_RULES.length];
    /* Detected somewhere in the last two months, so some windows have closed
       and some have not — which is the whole point of the queue. */
    const detectedDaysAgo = d.int(2, 68);
    const detected = addDays(TODAY, -detectedDaysAgo);
    const deadline = addDays(new Date(`${detected.replace(/\//g, '-')}T00:00:00`), rule.windowDays);
    const remaining = daysUntil(deadline);

    /* Stage follows from the clock rather than being drawn independently — a
       breach cannot be "remediating" three weeks after its window closed. */
    const resolved = d.bool(0.28);
    const stage = resolved ? 'resolved'
      : remaining < -7 ? 'enforced'
        : remaining < 0 ? 'escalated'
          : remaining < rule.windowDays * 0.5 ? 'remediating'
            : detectedDaysAgo > 2 ? 'notified' : 'detected';

    return {
      id: `brc-${i}`,
      merchant: m.name,
      mid: midFor(m.name, 14),
      ruleId: rule.id,
      rule: rule.label,
      category: rule.category,
      detected,
      deadline,
      /* Derived on read so it can never contradict the deadline beside it. */
      get daysRemaining() { return daysUntil(this.deadline); },
      stage,
      stageLabel: breachStage(stage).label,
      owner: breachStage(stage).owner,
      assignedTo: stage === 'resolved' ? '' : d.pick(ASSIGNEES),
      processor: m.processor,
      tier: m.tier,
      /* What is already being withheld because of this breach. */
      heldAmount: ['escalated', 'enforced'].includes(stage) ? d.money(2_400, 96_000) : 0,
      reservePct: stage === 'enforced' ? d.pick([5, 10, 15, 20]) : 0,
      notifiedOn: stage === 'detected' ? '' : addDays(new Date(`${detected.replace(/\//g, '-')}T00:00:00`), 1),
      resolvedOn: stage === 'resolved' ? addDays(new Date(`${detected.replace(/\//g, '-')}T00:00:00`), d.int(3, 40)) : '',
    };
  });
})();

export const BREACH_TABS = [
  { value: 'open', label: 'Open', match: (b) => b.stage !== 'resolved' },
  { value: 'overdue', label: 'Past deadline', match: (b) => b.stage !== 'resolved' && b.daysRemaining < 0 },
  { value: 'enforced', label: 'Enforced', match: (b) => b.stage === 'enforced' },
  { value: 'resolved', label: 'Resolved', match: (b) => b.stage === 'resolved' },
  { value: 'all', label: 'All', match: () => true },
];

/** Totals for the header strip. */
export function breachSummary(rows = BREACHES) {
  const open = rows.filter((b) => b.stage !== 'resolved');
  return {
    open: open.length,
    overdue: open.filter((b) => b.daysRemaining < 0).length,
    held: open.reduce((s, b) => s + b.heldAmount, 0),
    dueThisWeek: open.filter((b) => b.daysRemaining >= 0 && b.daysRemaining <= 7).length,
  };
}

export default BREACHES;
