/**
 * WHITE-LABEL CONTROL FILE — Fi911 tenant
 * =======================================
 * Everything tenant-specific lives here: palette, wordmark, logo path,
 * currency, locale, timezone, vocabulary, entities, processors, statuses
 * and feature flags.
 *
 * THE RULE: no component may hard-code a color, a brand name, or any
 * tenant-specific value. Colors reach the DOM as CSS custom properties written
 * by BrandProvider; nouns reach the JSX through `terms`; the logo reaches the
 * DOM as a *path*, never an import.
 *
 * Carried over from the Expedia build of this console. That build was a
 * dispute console with three perspectives; Fi911 is a full operator platform —
 * participant lifecycle, residuals, risk, transactions and billing — so the
 * perspective indirection is gone and the nav is a single operator tree.
 *
 * CHROME NOTE: Fi911 inverts Expedia's chrome. Expedia ran a dark navy rail
 * against a white topbar; Fi911 runs a WHITE rail against a blue topbar, with
 * a black breadcrumb strip beneath it. Those three surfaces are the
 * `railSurface` / `topbar` / `crumbbar` slots below — they are brand-identity
 * colors like any other, so components still never name them.
 */

/* ------------------------------------------------------------------ *
 * Dispute reason categories — scheme constants, not tenant vocabulary.
 * ------------------------------------------------------------------ *
 * Fi911's dispute book is UK bank-to-bank (Faster Payments / APP claims)
 * rather than card-scheme chargebacks, so the categories are the FCA-aligned
 * consumer set the Disputes donut rolls up by.
 */

export const REASON_CATEGORIES = [
  { id: 'not_received', label: 'Goods/Services Not Received', category: 'consumer' },
  { id: 'not_described', label: 'Goods/Services Not As Described', category: 'consumer' },
  { id: 'misrepresentation', label: 'Misrepresentation', category: 'fraud' },
  { id: 'refund_not_provided', label: 'Refund Not Provided', category: 'consumer' },
  { id: 'not_provided', label: 'Services Not Provided', category: 'consumer' },
];

/** Dispute cycles, in escalation order. Drives the Cycle column on Disputes. */
export const DISPUTE_CYCLES = [
  { id: 'retrieval', label: 'Retrieval', short: 'Retr' },
  { id: 'first_cb', label: '1st Chargeback', short: '1st CB' },
  { id: 'representment', label: 'Representment', short: 'Rep' },
  { id: 'pre_arb', label: 'Pre-Arbitration', short: 'Pre-Arb' },
  { id: 'arbitration', label: 'Arbitration', short: 'Arb' },
];

/* ------------------------------------------------------------------ *
 * Tenant: Fi911
 * ------------------------------------------------------------------ */

export const fi911Brand = {
  id: 'fi911',
  name: 'Fi911',
  productName: 'Operator Console',
  legalName: 'Fi911 Ltd.',
  shortName: 'FI911',
  tagline: 'Participant onboarding, residuals, risk and disputes in one operator console.',
  supportEmail: 'ops@fi911.example',
  emailDomain: 'ukpaymentsops.co.uk',

  /** Paths only — never imported into a component. Served from /public.
   *  The lockup already spells out "Fi911", so no text renders beside it. */
  logo: '/tenant-wordmark-blue.svg',
  logoInverse: '/tenant-wordmark-white.svg',
  logoAspectRatio: 340 / 96,

  wordmark: { text: '', accent: '', weight: 700 },

  /* --- Palette ---------------------------------------------------------- *
   * Fi911's identity is a single royal blue over neutral greys. Semantic
   * (success/warning/danger/info) and scheme colors are shared constants
   * across every tenant this console has shipped; only the brand-identity
   * slots change.
   *
   * `topbar` is the blue application bar, `crumbbar` the black breadcrumb
   * strip under it, `railSurface` the white navigation rail. Keeping all
   * three here is what lets the same Sidebar/AppLayout render either tenant's
   * chrome without a conditional. */
  colors: {
    primary: '#1F6FEB',
    primaryDeep: '#1553BE',
    primaryTint: '#E3EDFD',
    primaryWash: '#F4F8FE',

    /* Chrome */
    topbar: '#3568C8',
    topbarInk: '#FFFFFF',
    topbarChip: '#4E7DD2',
    crumbbar: '#050505',
    crumbbarInk: '#9AA3AE',
    crumbbarInkActive: '#FFFFFF',

    /* The sign-in split panel. It needs its own dark slot because the rail
       it used to borrow from is white in this tenant — white-on-white. */
    loginPanel: '#101C30',
    loginPanelInk: '#A9B6C8',

    /* Navigation rail — white, unlike the Expedia tenant's navy */
    navRail: '#FFFFFF',
    navRailDeep: '#F4F7FB',
    navActive: '#1F6FEB',
    navInk: '#39434F',
    navInkMuted: '#7A8494',

    ink: '#111821',
    inkMuted: '#4E5A68',
    inkSubtle: '#84909E',
    canvas: '#F5F7FA',
    surface: '#FFFFFF',
    surfaceSunken: '#F8FAFC',
    line: '#E2E7EE',
    lineStrong: '#C7D0DB',

    success: '#0F7B4F',
    successTint: '#E4F4EC',
    warning: '#9A5B00',
    warningTint: '#FBF0DD',
    danger: '#B3261E',
    dangerTint: '#FBE9E7',
    info: '#3F51B5',
    infoTint: '#ECEEFB',

    schemeVisa: '#1A1F71',
    schemeMastercard: '#C8102E',
    schemeAmex: '#016FD0',
    schemeDiscover: '#E9730C',
  },

  /* --- Chart ramp ------------------------------------------------------- *
   * ONE HUE PLUS TINTS plus a neutral: the dashboards pair a saturated blue
   * against mid grey (see "PSP Onboarding Summary" and "Transactions YTD &
   * YOY", where the comparison series is deliberately grey so the current
   * year reads first). Separation comes from lightness, so the ramp survives
   * color-vision deficiency and grayscale printing. Assign in fixed order,
   * never cycle — a sixth category folds into "Other" and takes chartContrast. */
  chartSeries: ['#1F6FEB', '#8A94A6', '#1F8A93', '#16305C', '#B8C2CF'],
  chartContrast: '#C42B21',
  chartNeutral: '#8A94A6',

  /* Risk tiers read high→low as red→blue→teal on the Risk dashboard donut. */
  riskTiers: [
    { id: 'high', label: 'High Risk', tone: 'danger', color: '#C42B21' },
    { id: 'medium', label: 'Medium Risk', tone: 'warning', color: '#3D7EA8' },
    { id: 'low', label: 'Low Risk', tone: 'success', color: '#1F8A93' },
  ],

  /* --- Money, locale, markets ------------------------------------------- */
  currency: 'GBP',
  locale: 'en-GB',
  timezone: 'Europe/London',
  markets: ['GB'],

  /** The console is demoed against a fixed "today" so every seeded date,
   *  range chip and "Last calculated on" label lines up with the screenshots. */
  today: '2026-08-20',

  /* --- Vocabulary -------------------------------------------------------- */
  terms: {
    participant: 'participant',
    participants: 'participants',
    merchant: 'merchant',
    merchants: 'merchants',
    agent: 'agent',
    agents: 'agents',
    psp: 'PSP',
    psps: 'PSPs',
    dispute: 'dispute',
    disputes: 'disputes',
    claim: 'claim',
    claims: 'claims',
    chargeback: 'chargeback',
    residual: 'residual',
    residuals: 'residuals',
    payout: 'payout',
    analyst: 'Operator',
    analysts: 'Operators',
    queue: 'queue',
  },

  /** Record numbering, editable from System preferences. */
  numbering: { prefix: 'FI', separator: '-', digits: 6, nextSequence: 686617660 },

  /* --- Participant types --------------------------------------------------- *
   * Fi911 onboards two kinds of participant, and the Type column badges them
   * differently everywhere they appear. */
  participantTypes: [
    { id: 'psp', label: 'PSP', tone: 'info' },
    { id: 'bank', label: 'Bank', tone: 'success' },
  ],

  /* --- Processors ---------------------------------------------------------- */
  processors: ['TSYS', 'Fiserv', 'Chase Paymentech', 'Worldpay', 'Global Payments', 'First Data', 'Elavon'],

  /* --- Card schemes -------------------------------------------------------- */
  schemes: [
    { id: 'visa', label: 'Visa', short: 'VI', colorKey: 'schemeVisa', binPrefix: '4' },
    { id: 'mastercard', label: 'Mastercard', short: 'MC', colorKey: 'schemeMastercard', binPrefix: '5' },
    { id: 'amex', label: 'Amex', short: 'AX', colorKey: 'schemeAmex', binPrefix: '3' },
    { id: 'discover', label: 'Discover', short: 'DI', colorKey: 'schemeDiscover', binPrefix: '6' },
    { id: 'maestro', label: 'Maestro', short: 'MA', colorKey: 'schemeMastercard', binPrefix: '5' },
    { id: 'unionpay', label: 'UnionPay', short: 'UP', colorKey: 'schemeVisa', binPrefix: '62' },
  ],

  /* --- ERT (Emergency Response Team) --------------------------------------- */
  ertTypes: [
    { id: 'internal_alert', label: 'Internal Alert' },
    { id: 'risk_alert', label: 'Risk Alert' },
    { id: 'message', label: 'Message' },
  ],

  ertDepartments: ['Operations', 'Risk Management', 'Customer Services', 'Settlement Desk', 'Relationship Team', 'Fraud Operations'],

  ertTopics: ['Reimbursement', 'Onboarding', 'Claim', 'Settlement', 'Underwriting', 'Exposure', 'Reconciliation'],

  ertSubTopics: ['Late Fee', 'Error', 'Unreceived', 'Overdue', 'Incomplete', 'Delay Escalation', 'Threshold Breach', 'Callback Request'],

  /* --- MCCs ---------------------------------------------------------------- */
  mccs: [
    { code: '5045', label: 'Computers and Peripheral Equipment' },
    { code: '5411', label: 'Grocery Stores' },
    { code: '5541', label: 'Service Stations' },
    { code: '5734', label: 'Computer Software Stores' },
    { code: '5812', label: 'Eating Places and Restaurants' },
    { code: '5912', label: 'Drug Stores and Pharmacies' },
    { code: '5967', label: 'Direct Marketing — Inbound Telemarketing' },
    { code: '5994', label: 'News Dealers and Newsstands' },
    { code: '5999', label: 'Miscellaneous Retail' },
    { code: '6099', label: 'Financial Institutions — Cash Disbursement' },
    { code: '7011', label: 'Lodging — Hotels and Motels' },
    { code: '7399', label: 'Business Services' },
  ],

  /* --- Business + pricing reference data ----------------------------------- */
  businessTypes: ['Proprietary', 'Corporation', 'LLC', 'Partnership', 'Government', 'Non-Profit'],
  ownerTitles: ['CEO', 'CFO', 'COO', 'Director', 'Partner', 'Owner'],
  idTypes: ['Passport', 'Driving License', 'National ID', 'Residence Permit'],
  accountUses: ['Direct Credit Authority', 'Direct Debit Authority', 'Both', 'Fee Account Only'],
  pricingTypes: ['Interchange Plus', 'Tiered', 'Blended', 'Flat Rate'],
  terminalMakes: ['Ingenico', 'Verifone', 'PAX', 'Castles', 'Clover'],
  terminalTypes: ['Countertop', 'Mobile', 'Portable', 'Unattended', 'Virtual'],

  /* --- Feature flags ------------------------------------------------------- */
  features: {
    advancedSearch: true,
    customFilter: true,
    historicalRecords: true,
    savedReports: true,
    exportToExcel: true,
    columnPicker: true,
    autosize: true,
    feedback: true,
    attachments: true,
    notes: true,
    ticketing: true,
  },

  demoCredentials: { username: 'Fi911Demo', password: 'Changeme123' },
};

/* ------------------------------------------------------------------ *
 * Single-tenant export — no registry, no env-var switch. See the file
 * header for how to reintroduce a second tenant if one is ever needed.
 * ------------------------------------------------------------------ */

export const brand = fi911Brand;

export const findScheme = (id, b = brand) => b.schemes.find((s) => s.id === id) ?? null;
export const findMcc = (code, b = brand) => b.mccs.find((m) => m.code === String(code)) ?? null;
export const mccLabel = (code, b = brand) => findMcc(code, b)?.label ?? String(code);
export const findRiskTier = (id, b = brand) => b.riskTiers.find((t) => t.id === id) ?? null;
export const findParticipantType = (id, b = brand) =>
  b.participantTypes.find((t) => t.id === id || t.label === id) ?? null;
export const categoryLabel = (id) => REASON_CATEGORIES.find((c) => c.id === id)?.label ?? id;
export const findCycle = (id, b = brand) => DISPUTE_CYCLES.find((c) => c.id === id) ?? null;

export default brand;
