/**
 * SETUP — tenant configuration data.
 *
 * Everything behind the configuration rail. Taken from the live product's
 * Setup mode, with three things done differently throughout:
 *
 *  · Nothing is empty. Several reference screens (Residual Approval, the
 *    keyword list) render "No records found", which demonstrates the shape of
 *    a table and nothing else.
 *  · Config rows carry their USAGE. The reference lists a pricing schedule
 *    and a portfolio side by side with no indication that one is attached to
 *    140 merchants and the other to none — which is the only thing that makes
 *    "can I change this?" answerable.
 *  · Where the reference stores two dates, the span between them is computed.
 */

import { createDraw } from '@/data/rng';
import { ISO_PORTFOLIOS, MERCHANTS, PARTNERS, REGIONS, midFor } from '@/data/reference';
import { AGENTS, ASSIGNEES, CURRENT_USER, RESIDUAL_AGENTS, emailFor } from '@/data/people';
import brand from '@/brand/brand.config';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dateOf = (d, y0 = 2023, y1 = 2026) => `${String(d.int(1, 12)).padStart(2, '0')}/${String(d.int(1, 28)).padStart(2, '0')}/${d.int(y0, y1)}`;
const monthOf = (d, y0 = 2015, y1 = 2026) => `${d.pick(MONTHS)}-${d.int(y0, y1)}`;

/* ------------------------------------------------------------------ *
 * Merchants > Underwriting Setup
 * ------------------------------------------------------------------ */

export const TEMPLATE_LEVELS = ['Processor', 'Partner', 'Portfolio'];
export const RISK_CATEGORIES = ['Low', 'Medium', 'High'];

export const UW_TEMPLATES = (() => {
  const d = createDraw(6201);
  const names = [
    'Fiserv — Low Risk Merchant', 'Fiserv — Medium Risk Merchant', 'Fiserv — High Risk Merchant',
    'TSYS — Low Risk Merchant', 'TSYS — Medium Risk Merchant', 'TSYS — High Risk Merchant',
    'Recreation & Leisure', 'Second-hand Goods', 'Subscription Billing', 'Travel & Ticketing',
    'Auto Decline — Prohibited MCC', 'New Merchant 90-day Watch',
  ];

  return names.map((name, i) => {
    const category = /High/.test(name) ? 'High' : /Medium/.test(name) ? 'Medium' : /Low/.test(name) ? 'Low' : d.pick(RISK_CATEGORIES);
    return {
      id: `uwt-${i}`,
      name,
      level: d.pick(TEMPLATE_LEVELS),
      appliesTo: /Fiserv/.test(name) ? 'Fiserv' : /TSYS/.test(name) ? 'TSYS' : d.pick(brand.processors),
      category,
      isDefault: /Risk Merchant$/.test(name),
      /* Usage is what tells you whether a template is safe to edit. The
         reference shows the count; it does not tell you when it last actually
         decided anything, which is what makes a template dead or live. */
      linkedMerchants: d.int(0, 22),
      lastApplied: d.bool(0.8) ? dateOf(d, 2025, 2026) : '',
      rules: d.int(3, 18),
      created: dateOf(d, 2021, 2025),
      createdBy: d.pick([CURRENT_USER.name, ...ASSIGNEES.slice(0, 4)]),
      status: d.weighted([['Active', 8], ['Inactive', 2]]),
    };
  });
})();

export const PARAMETER_TYPES = ['MCC', 'GAuthenticate', 'Ownership Type', 'Country', 'Annual Volume'];

export const UW_GROUPS = (() => {
  const d = createDraw(6202);
  const names = [
    'Fiserv — MCC Low', 'Fiserv — MCC High', 'Fiserv Pass Code', 'Fiserv No-information G-Code',
    'TSYS — MCC Low', 'TSYS — MCC Medium', 'TSYS — MCC High', 'GVerify Pass', 'GVerify Declined',
    'Recreation Low Risk Group', 'Restricted Countries', 'High Annual Volume',
  ];

  return names.map((name, i) => ({
    id: `uwg-${i}`,
    name,
    processor: /Fiserv/.test(name) ? 'Fiserv' : /TSYS/.test(name) ? 'TSYS' : d.pick(brand.processors),
    parameterType: /MCC/.test(name) ? 'MCC' : /Verify|Code/.test(name) ? 'GAuthenticate' : d.pick(PARAMETER_TYPES),
    /* Members is the number the reference omits entirely — a parameter group
       with nothing in it silently matches nothing. */
    members: d.int(0, 64),
    usedByTemplates: d.int(0, 6),
    updated: dateOf(d, 2024, 2026),
    status: d.weighted([['Active', 9], ['Inactive', 1]]),
  }));
})();

export const UW_KEYWORDS = (() => {
  const d = createDraw(6203);
  const entries = [
    ['Second-hand items medium risk', ['pawn', 'used goods', 'resale', 'consignment']],
    ['Recreation template', ['gym', 'leisure', 'sports club', 'membership']],
    ['Auto decline applications', ['crypto', 'firearms', 'adult', 'gambling']],
    ['Travel high risk', ['charter', 'tour operator', 'timeshare']],
    ['Nutraceutical watch', ['supplement', 'weight loss', 'wellness trial']],
  ];

  return entries.map(([name, terms], i) => ({
    id: `uwk-${i}`,
    name,
    terms,
    termCount: terms.length,
    /* The point of a keyword rule is what it caught. The reference lists the
       rule name and its status and stops. */
    matchesLast30: d.int(0, 34),
    action: /decline/i.test(name) ? 'Auto decline' : 'Flag for review',
    updated: dateOf(d, 2025, 2026),
    status: 'Active',
  }));
})();

/* ------------------------------------------------------------------ *
 * Residuals > Pricing Schedules
 * ------------------------------------------------------------------ */

export const PRICING_TYPES = ['Standard', 'Interchange Plus', 'Tiered', 'Flat Rate'];
export const SPLIT_TYPES = ['Program', 'Item'];
export const RATE_TYPES = ['PassThru', 'Fixed', 'Percentage', 'Fixed + Percentage'];
export const ITEM_TYPES = ['Both', 'Credit', 'Debit'];

export const PRICING_CATEGORIES = [
  { id: 'auth', label: 'Auth & Capture', count: 93 },
  { id: 'exceptions', label: 'Exceptions', count: 8 },
  { id: 'debit', label: 'Debit & EBT', count: 56 },
  { id: 'brands', label: 'Card Brands', count: 31 },
  { id: 'ic', label: 'IC & Discounts', count: 9 },
  { id: 'misc', label: 'Miscellaneous', count: 76 },
];

const ITEM_STEMS = {
  auth: ['All Other Debit Card - Authorization', 'Debit Card VirtualNet SSL - Reversal', 'Debit Card Wireless - Purchase', 'Discover VirtualNet SSL - Default', 'Errors Dial Pay - Dropped Call', 'Visa VirtualNet SSL - Return', 'Mastercard Host Capture - Sale', 'Amex Direct - Authorization'],
  exceptions: ['Chargeback Received', 'Retrieval Request', 'Representment Filed', 'Pre-Arbitration'],
  debit: ['PIN Debit - Purchase', 'PIN Debit - Return', 'EBT Cash Benefit', 'EBT Food Stamp', 'Signature Debit - Sale'],
  brands: ['Visa Assessment', 'Mastercard Assessment', 'Amex Network Fee', 'Discover Network Fee', 'Visa FANF'],
  ic: ['Interchange Pass-Through', 'Volume Discount Tier 1', 'Volume Discount Tier 2', 'Loyalty Rebate'],
  misc: ['Monthly Statement Fee', 'PCI Compliance Fee', 'Gateway Access Fee', 'Batch Header Fee', 'Terminal Rental'],
};

/** The item-rate grid behind one schedule. */
export function pricingItems(scheduleId, categoryId) {
  const d = createDraw(6300 + categoryId.length * 17 + (scheduleId?.length ?? 0));
  const stems = ITEM_STEMS[categoryId] ?? ITEM_STEMS.misc;
  const total = PRICING_CATEGORIES.find((c) => c.id === categoryId)?.count ?? 12;

  return Array.from({ length: Math.min(total, 24) }, (_, i) => {
    const stem = stems[i % stems.length];
    const processor = d.pick(['TSYS', 'Fiserv']);
    return {
      id: `pi-${categoryId}-${i}`,
      name: `${String(i + 1).padStart(2, '0')}-${categoryId === 'auth' ? 'Auth' : 'Item'}-${processor} Acq ${stem}`,
      itemType: d.pick(ITEM_TYPES),
      rateType: d.pick(RATE_TYPES),
      rate: Math.round(d.float(0.01, 3.5) * 100) / 100,
      profitPct: d.pick([50, 60, 65, 70, 80]),
      lossPct: d.pick([20, 30, 40, 50]),
    };
  });
}

export const PRICING_SCHEDULES = (() => {
  const d = createDraw(6204);
  const names = [
    'Standard Acquiring — Int 70', 'Enterprise ISO — Int 80', 'Direct Bank — Int 65 LTS',
    'High-Risk Oversight — Int 85', 'Partner Referral — Int 60', 'Legacy Portfolio — Int 70 LTS',
    'Register Resources — 9772 Int 70 LTS', 'Advantage Payments — Int 70', 'Smart Merchant — Int 70',
    'Cyber Drawer — Int 85', 'Peel Payments — Int 80 LTS', 'Versatile Merchant — Int 70 LTS',
  ];

  return names.map((name, i) => {
    const linked = d.int(0, 42);
    return {
      id: `ps-${i}`,
      name,
      processor: d.pick(brand.processors),
      pricingType: d.pick(PRICING_TYPES),
      splitType: d.pick(SPLIT_TYPES),
      startMonth: monthOf(d),
      usersLinked: linked,
      /* A schedule with a profit split of zero and nobody linked is dead
         config. Surfacing both together is what lets an admin clean up. */
      profitPct: linked ? d.pick([50, 60, 65, 70, 80, 85]) : 0,
      lossPct: linked ? d.pick([20, 30, 40, 50, 85]) : 0,
      itemCount: PRICING_CATEGORIES.reduce((s2, c) => s2 + c.count, 0),
      created: dateOf(d, 2019, 2024),
      updated: dateOf(d, 2024, 2026),
      updatedBy: d.pick([CURRENT_USER.name, 'Rachna Gaur', 'Clive Kanyepi', ...ASSIGNEES.slice(0, 3)]),
      status: d.weighted([['Active', 9], ['Inactive', 1]]),
      description: '',
    };
  });
})();

export const pricingSchedule = (id) => PRICING_SCHEDULES.find((p) => p.id === id) ?? PRICING_SCHEDULES[0];

/* ------------------------------------------------------------------ *
 * Residuals > Agent Profiles
 * ------------------------------------------------------------------ */

export const PAYOUT_PROFILES = (() => {
  const d = createDraw(6205);

  return RESIDUAL_AGENTS.flatMap((agent, i) => (
    Array.from({ length: d.int(1, 2) }, (_, k) => ({
      id: `pp-${i}-${k}`,
      agent: typeof agent === 'string' ? agent : agent.name,
      repCode: `A${4000 + i * 3 + k}-${k + 1}`,
      pricingSchedule: d.pick(PRICING_SCHEDULES).name,
      partner: d.bool(0.5) ? d.pick(PARTNERS).name : '',
      processor: d.pick(brand.processors),
      vendorId: d.bool(0.4) ? d.digits(6) : '',
      splitPct: d.pick([30, 40, 50, 60, 70]),
      merchants: d.int(0, 38),
      startDate: dateOf(d, 2011, 2024),
      created: dateOf(d, 2015, 2024),
      updated: dateOf(d, 2024, 2026),
      status: d.weighted([['Active', 9], ['Inactive', 1]]),
    }))
  ));
})();

export const PORTFOLIO_PROFILES = (() => {
  const d = createDraw(6206);
  const names = [
    '3550 — Stewardship Technology Inc, Int 80', '6550 — Advantage Payment Solutions LLC, Int 70',
    '7406 — PF_VA Stewardship Technology Inc, PF_Int 100', '9505 — Versatile Merchant Solutions LLC, Int 70 LTS',
    '9506 — ESM LLC, Int 70 LTS', '9521 — Icon Consulting Group LLC, Int 65 LTS',
    '9537 — Peel Payments LLC, Int 80 LTS', '9594 — Cyber Drawer LLC, Int 85',
    '9684 — Smart Merchant LLC, Int 70', '9691 — Icon Consulting Group LLC NonLTS, Int 70',
  ];

  return names.map((name, i) => ({
    id: `pf-${i}`,
    name,
    processor: d.pick(brand.processors),
    merchants: d.int(0, 34),
    monthlyResidual: d.money(0, 48000),
    startDate: monthOf(d, 2015, 2020),
    created: dateOf(d, 2019, 2022),
    modified: dateOf(d, 2022, 2026),
    modifiedBy: d.pick([CURRENT_USER.name, 'ArteGO Admin', ...ASSIGNEES.slice(0, 3)]),
    status: d.weighted([['Active', 9], ['Inactive', 1]]),
  }));
})();

/* ------------------------------------------------------------------ *
 * Residuals > Portfolio Setup
 * ------------------------------------------------------------------ */

export const PORTFOLIO_SETUP = PORTFOLIO_PROFILES.map((p, i) => ({
  ...p,
  id: `pso-${i}`,
  /* Unmapped merchants are the reason this screen exists: a portfolio that
     is missing merchants pays out short and nobody notices until the month
     closes. The reference does not carry the number. */
  unmapped: (i * 7) % 5,
}));

/* ------------------------------------------------------------------ *
 * Residuals > Residual Approval
 * ------------------------------------------------------------------ */

export const APPROVAL_STATUSES = ['Pending Approval', 'Approved', 'Rejected', 'On Hold'];

export const RESIDUAL_APPROVALS = (() => {
  const d = createDraw(6207);

  return PORTFOLIO_PROFILES.map((p, i) => {
    const payout = d.money(240, 52000);
    const prev = Math.round(payout * d.float(0.72, 1.34) * 100) / 100;
    return {
      id: `ra-${i}`,
      portfolio: p.name,
      processor: p.processor,
      merchants: p.merchants,
      txn: d.int(120, 48000),
      volume: d.money(28000, 4200000),
      payout,
      prevPayout: prev,
      /* Month-on-month movement is the approval signal. A payout that jumped
         40% is the one to look at; the reference prints both figures and
         leaves the subtraction to the approver. */
      deltaPct: prev ? Math.round(((payout - prev) / prev) * 1000) / 10 : 0,
      residualMonth: 'Jul-2026',
      payoutMonth: 'Aug-2026',
      approval: d.weighted([['Pending Approval', 5], ['Approved', 4], ['On Hold', 1]]),
      status: d.weighted([['Calculated', 8], ['Recalculating', 2]]),
    };
  }).sort((a, b) => Math.abs(b.deltaPct) - Math.abs(a.deltaPct));
})();

export const LAST_CALCULATED_MONTH = 'Jul-2026';

/* ------------------------------------------------------------------ *
 * Residuals > Adjustment Setup
 * ------------------------------------------------------------------ */

export const ADJUSTMENT_SETUP = (() => {
  const d = createDraw(6208);
  const kinds = [
    ['Back Office Fee', -100], ['Residual Holdback', -625], ['Monthly Adjustment', 15],
    ['Terminal Invoice', -67.04], ['ATM Residual', 427.25], ['Processor Reimbursement', 500],
    ['Loan Repayment', -750], ['Equipment Lease', -231], ['Marketing Rebate', 87.59],
    ['Portfolio Buyout', -1500], ['Referral Bonus', 250], ['Statement Fee Credit', -18.5],
  ];

  return Array.from({ length: 26 }, (_, i) => {
    const [name, base] = kinds[i % kinds.length];
    const start = monthOf(d, 2016, 2026);
    const recurring = d.bool(0.6);
    return {
      id: `adj-${i}`,
      processor: d.pick(brand.processors),
      agent: d.pick(AGENTS),
      repCode: `A${4000 + i}`,
      merchant: d.bool(0.5) ? d.pick(MERCHANTS) : '',
      mid: d.bool(0.5) ? midFor(MERCHANTS[i % MERCHANTS.length], 14) : '',
      name,
      description: `${name} — ${recurring ? 'recurring monthly' : 'one-off'}`,
      startMonth: start,
      endMonth: recurring ? monthOf(d, 2027, 2030) : start,
      value: Math.round((base + d.float(-40, 40)) * 100) / 100,
      recurring,
      /* Signed totals matter here — a grid of adjustments where credits and
         debits look identical cannot be reconciled at a glance. */
      status: d.weighted([['Active', 9], ['Inactive', 1]]),
    };
  });
})();

/* ------------------------------------------------------------------ *
 * Residuals > Residual Calculation
 * ------------------------------------------------------------------ */

export const CALCULATION_TYPES = ['Full', 'Incremental', 'Single Portfolio'];

export const CALCULATION_RUNS = (() => {
  const d = createDraw(6209);

  return Array.from({ length: 14 }, (_, i) => {
    const status = i === 0 ? 'In Progress' : d.weighted([['Completed', 8], ['Failed', 1], ['Cancelled', 1]]);
    const month = `${MONTHS[(7 - Math.floor(i / 2) + 12) % 12]}-2026`;
    return {
      id: `cr-${i}`,
      processor: d.pick([...brand.processors, 'Fiserv CANADA']),
      residualMonth: month,
      type: d.pick(CALCULATION_TYPES),
      startedAt: `${dateOf(d, 2026, 2026)} 0${d.int(1, 6)}:${String(d.int(0, 59)).padStart(2, '0')}`,
      endedAt: status === 'In Progress' ? '' : `${dateOf(d, 2026, 2026)} 0${d.int(1, 6)}:${String(d.int(0, 59)).padStart(2, '0')}`,
      durationMinutes: status === 'In Progress' ? null : d.int(4, 96),
      merchants: status === 'In Progress' ? 0 : d.int(120, 4800),
      payout: status === 'Completed' ? d.money(18000, 940000) : 0,
      initiatedBy: d.pick([CURRENT_USER.name, 'Chandra Akula', 'Rachna Gaur', ...ASSIGNEES.slice(0, 3)]),
      progress: status === 'In Progress' ? 14 : 100,
      status,
    };
  });
})();

/* ------------------------------------------------------------------ *
 * Residuals > Merchant Mapping
 * ------------------------------------------------------------------ */

export const MERCHANT_MAPPING = (() => {
  const d = createDraw(6210);

  return MERCHANTS.map((merchant, i) => {
    const mapped = d.bool(0.55);
    const portfolio = mapped ? d.pick(PORTFOLIO_PROFILES).name : '';
    /* The reference marks system suggestions with a red "••" and no
       explanation. A suggestion is only actionable with a REASON and a
       confidence, so both are stored. */
    const suggestion = mapped ? null : {
      portfolio: d.pick(PORTFOLIO_PROFILES).name,
      confidence: d.int(62, 97),
      basis: d.pick(['Matching rep code', 'Same partner and processor', 'MCC and volume band match', 'Previously mapped, then unlinked']),
    };

    return {
      id: `mm-${i}`,
      processor: d.pick(brand.processors),
      merchant,
      mid: midFor(merchant, 14),
      repCode: d.bool(0.7) ? `A${4000 + i}` : '',
      portfolio,
      suggestion,
      created: dateOf(d, 2026, 2026),
      openedDate: dateOf(d, 2023, 2026),
      effectiveStart: mapped ? dateOf(d, 2024, 2026) : '',
      updated: mapped ? dateOf(d, 2026, 2026) : '',
      merchantStatus: d.weighted([['Active', 9], ['Closed', 1]]),
      monthlyVolume: d.money(1200, 320000),
    };
  });
})();

export const MAPPING_TABS = [
  { value: 'unmapped', label: 'Unmapped', match: (r) => !r.portfolio },
  { value: 'suggested', label: 'Has suggestion', match: (r) => Boolean(r.suggestion) },
  { value: 'mapped', label: 'Mapped', match: (r) => Boolean(r.portfolio) },
  { value: 'all', label: 'All', match: () => true },
];

/* ------------------------------------------------------------------ *
 * Admin > Users & Access Control
 * ------------------------------------------------------------------ */

export const PROFILE_TYPES = ['Company Admin', 'Partner Admin', 'Sales Agent', 'ISO', 'Bank', 'Internal Superadmin'];
export const LANDING_PAGES = ['Dashboard', 'Work Queue', 'Disputes', 'Merchant - Global', 'Setup Home'];

export const ROLES = (() => {
  const d = createDraw(6211);
  const names = [
    'Admin', 'Admin User', 'Agent', 'Agents', 'ISO and Agent', 'Automation Role',
    'Risk Analyst', 'Underwriter', 'Residuals Manager', 'Read Only', 'Support Desk',
  ];

  return names.map((name, i) => ({
    id: `role-${i}`,
    name,
    profileType: d.pick(PROFILE_TYPES),
    homeLanding: d.pick(LANDING_PAGES),
    setupLanding: d.bool(0.4) ? 'Setup Home' : '',
    /* A role nobody holds is a permission surface with no owner. The
       reference does not show the count, so dead roles accumulate. */
    userCount: d.int(0, 24),
    permissions: d.int(6, 42),
    description: `${name} role`,
    created: dateOf(d, 2019, 2024),
    updated: dateOf(d, 2024, 2026),
    status: d.weighted([['Active', 9], ['Inactive', 1]]),
  }));
})();

export const USER_GROUPS = (() => {
  const d = createDraw(6212);
  const entries = [
    ['North America Sales Group', 'Group / Business Entity'],
    ['North America Sales Region', 'Region / Channel-Department'],
    ['North Canada Group', 'Group / Business Entity'],
    ['Nordic Region', 'Region / Channel-Department'],
    ['Pohanka Group', 'Region / Channel-Department'],
    ['UK & Ireland Desk', 'Region / Channel-Department'],
    ['High-Risk Underwriting', 'Group / Business Entity'],
    ['Residuals Operations', 'Group / Business Entity'],
  ];

  return entries.map(([name, type], i) => ({
    id: `grp-${i}`,
    name,
    type,
    users: d.int(0, 14),
    merchants: d.int(0, 26),
    region: d.pick(REGIONS),
    createdBy: d.pick([CURRENT_USER.name, 'Nisha Admin', 'Krishna Admin', ...ASSIGNEES.slice(0, 3)]),
    created: dateOf(d, 2024, 2025),
    updatedBy: d.pick([CURRENT_USER.name, 'Clive Kanyepi', ...ASSIGNEES.slice(0, 3)]),
    updated: dateOf(d, 2025, 2026),
    status: 'Active',
  }));
})();

export const SETUP_USERS = (() => {
  const d = createDraw(6213);
  const names = [
    'Aaron Pitcher', 'Abacus IT', 'Akshay Comp Admin', 'Al Valente', 'Ahil Kantilis',
    'Anna Bogiatzis', 'Ashley Watkins', 'Chris Grafton', 'Dana Jeter', 'Elena Ruiz',
    'Frank Osei', 'Grace Mbeki', 'Harold Finch', 'Ines Duarte', 'Jonah Klein',
    'Karen Whitfield', 'Liam O’Doherty', 'Mira Shah', 'Noor Haddad', 'Owen Barlow',
    ...ASSIGNEES,
  ];

  return [...new Set(names)].map((name, i) => {
    const role = d.pick(ROLES);
    const lastSeen = d.int(0, 210);
    return {
      id: `usr-${i}`,
      name,
      email: emailFor(name, brand.emailDomain),
      username: emailFor(name, brand.emailDomain).toUpperCase(),
      partner: d.bool(0.45) ? d.pick(PARTNERS).name : '',
      phone: `+1 (${d.digits(3)}) ${d.digits(3)}-${d.digits(4)}`,
      role: role.name,
      profileType: role.profileType,
      group: d.bool(0.6) ? d.pick(USER_GROUPS).name : '',
      startDate: dateOf(d, 2015, 2025),
      /* Dormancy is the access-review question. The reference lists status
         only, which cannot distinguish an active account from an abandoned
         one that is still a way in. */
      lastActiveDays: lastSeen,
      dormant: lastSeen > 90,
      linkedProfiles: d.int(0, 12),
      reportingUsers: d.int(0, 4),
      mfa: d.bool(0.75),
      status: d.weighted([['Active', 9], ['Locked', 1]]),
    };
  });
})();

export const USER_TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'dormant', label: 'Dormant 90d+', match: (r) => r.dormant && r.status === 'Active' },
  { value: 'nomfa', label: 'No MFA', match: (r) => !r.mfa },
  { value: 'locked', label: 'Locked', match: (r) => r.status === 'Locked' },
];

/* ------------------------------------------------------------------ *
 * Admin > Banner Ads
 * ------------------------------------------------------------------ */

export const BANNER_KINDS = [
  { id: 'thumbnail', label: 'Thumbnails' },
  { id: 'flyout', label: 'Flyouts' },
];

export const BANNERS = (() => {
  const d = createDraw(6214);
  const titles = [
    'Chargeback prevention webinar', 'New: per-scheme ratio reporting', 'Scheduled maintenance — Sunday 02:00',
    'Refer a merchant, earn residual', 'Updated PCI attestation deadline', 'Q3 interchange changes',
    'Fi911 Connect conference', 'Underwriting turnaround improvements',
  ];

  return titles.map((title, i) => ({
    id: `ban-${i}`,
    title,
    kind: i % 3 === 0 ? 'flyout' : 'thumbnail',
    /* Deterministic gradient stand-ins — a real tenant uploads artwork, and
       the reference's broken-image placeholders tell you nothing about what
       the banner is or who sees it. */
    hue: d.int(0, 359),
    roles: d.sample(ROLES.map((r) => r.name), d.int(1, 4)),
    startDate: dateOf(d, 2026, 2026),
    endDate: dateOf(d, 2026, 2026),
    impressions: d.int(0, 4200),
    clicks: d.int(0, 380),
    status: d.weighted([['Active', 7], ['Scheduled', 2], ['Expired', 1]]),
  })).map((b) => ({ ...b, ctr: b.impressions ? Math.round((b.clicks / b.impressions) * 1000) / 10 : 0 }));
})();

/* ------------------------------------------------------------------ *
 * Admin > Document Library — categories
 * ------------------------------------------------------------------ */

export const DOC_CATEGORIES = (() => {
  const d = createDraw(6215);
  const names = ['Merchant Agreements', 'Underwriting Evidence', 'Sales Collateral', 'Compliance & Policy', 'Dispute Evidence', 'Billing Statements'];

  return names.map((name, i) => ({
    id: `dc-${i}`,
    name,
    profilesAssigned: d.int(1, 5),
    documentsLinked: d.int(0, 22),
    retentionYears: d.pick([1, 3, 5, 7]),
    confidential: d.bool(0.4),
    created: dateOf(d, 2021, 2025),
    status: d.weighted([['Active', 9], ['Inactive', 1]]),
  }));
})();

export default PRICING_SCHEDULES;
