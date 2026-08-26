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
 * CHROME NOTE: deep navy rail, blue topbar, dark breadcrumb strip. Those three
 * surfaces are the `navRail` / `topbar` / `crumbbar` slots below — they are
 * brand-identity colors like any other, so components still never name them.
 */

/* ------------------------------------------------------------------ *
 * Chargeback reason codes — scheme constants, not tenant vocabulary.
 * ------------------------------------------------------------------ *
 * This is a card-acquiring book, so the reasons are the card-scheme codes an
 * acquirer actually receives. They are grouped into the four families the
 * schemes themselves report on — fraud, authorization, processing error and
 * consumer dispute — because that grouping is what tells a risk desk whether
 * the problem is the merchant's fraud screening or its fulfilment.
 *
 * Visa and Mastercard number the same dispute differently (Visa 13.1 is
 * Mastercard 4855), so both are carried and the row shows whichever scheme
 * the transaction was on.
 */

export const REASON_CATEGORIES = [
  { id: 'fraud_cnp', label: 'Fraud — Card Not Present', category: 'fraud', visa: '10.4', mastercard: '4837', amex: 'F29' },
  { id: 'fraud_cp', label: 'Fraud — Card Present', category: 'fraud', visa: '10.1', mastercard: '4870', amex: 'F24' },
  { id: 'no_auth', label: 'No Authorization', category: 'authorization', visa: '11.2', mastercard: '4808', amex: 'A02' },
  { id: 'late_presentment', label: 'Late Presentment', category: 'processing', visa: '12.1', mastercard: '4834', amex: 'P03' },
  { id: 'duplicate', label: 'Duplicate Processing', category: 'processing', visa: '12.6', mastercard: '4834', amex: 'P08' },
  { id: 'incorrect_amount', label: 'Incorrect Transaction Amount', category: 'processing', visa: '12.5', mastercard: '4831', amex: 'P05' },
  { id: 'not_received', label: 'Merchandise / Services Not Received', category: 'consumer', visa: '13.1', mastercard: '4855', amex: 'C08' },
  { id: 'cancelled_recurring', label: 'Canceled Recurring Transaction', category: 'consumer', visa: '13.2', mastercard: '4841', amex: 'C28' },
  { id: 'not_as_described', label: 'Not As Described or Defective', category: 'consumer', visa: '13.3', mastercard: '4853', amex: 'C31' },
  { id: 'credit_not_processed', label: 'Credit Not Processed', category: 'consumer', visa: '13.6', mastercard: '4860', amex: 'C02' },
];

/** The four families the schemes report on. Drives the reason donut. */
export const REASON_FAMILIES = [
  { id: 'fraud', label: 'Fraud' },
  { id: 'authorization', label: 'Authorization' },
  { id: 'processing', label: 'Processing Error' },
  { id: 'consumer', label: 'Consumer Dispute' },
];

/** The scheme's own code for a reason, given the card it arrived on. */
export const reasonCodeFor = (reason, scheme) =>
  (scheme === 'mastercard' ? reason.mastercard : scheme === 'amex' ? reason.amex : reason.visa);

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
  legalName: 'Fi911 Inc.',
  shortName: 'FI911',
  tagline: 'Participant onboarding, residuals, risk and disputes in one operator console.',
  supportEmail: 'ops@fi911.example',
  emailDomain: 'uspaymentsops.com',

  /** Paths only — never imported into a component. Served from /public.
   *  The lockup already spells out "Fi911", so no text renders beside it.
   *
   *  The inverse is not a CSS filter over the same file: the wordmark's dark
   *  navy has to become white while the teal stays teal, and no single filter
   *  does both. It is a real second asset, cut from the same source. */
  logo: '/fi911-logo.png',
  /** Badge only — the collapsed rail has no room for the wordmark. */
  logoMark: '/fi911-mark.png',
  logoInverse: '/fi911-logo-white.png',
  logoMarkInverse: '/fi911-mark-white.png',
  logoAspectRatio: 409 / 106,
  logoMarkAspectRatio: 112 / 106,

  wordmark: { text: '', accent: '', weight: 700 },

  /* --- Palette ---------------------------------------------------------- *
   * Fi911's brand colours, straight off the identity sheet:
   *
   *   Secondary Blue   #00AAB4   the teal that leads — used here as PRIMARY
   *   Secondary Yellow #FFC300   the accent
   *   Dark             #14191E   chrome and rail
   *   Gray One         #3C4146   secondary chrome and body ink
   *
   * The teal carries actions and selection; the yellow is reserved for
   * emphasis and chart series, never for a status, because amber already
   * means "warning" in every badge in this console.
   *
   * CHROME NOTE: matched to the live Fi911 product. The rail is a soft
   * charcoal — brand Dark #14191E is nearly black and reads as a hard edge
   * next to a light canvas — and the topbar is LIGHT, not dark, so the app
   * has one dark anchor (the rail) rather than two competing ones. The active
   * nav item is a solid teal block, which is how the real product marks
   * position. */
  colors: {
    primary: '#1D6FE0',
    primaryDeep: '#1552B3',
    primaryTint: '#D6E5FA',
    primaryWash: '#EFF5FE',

    /* Accent — emphasis only, never a status. Amber against navy, since a
       second blue would not read as emphasis next to the primary. */
    accent: '#E0A32E',
    accentDeep: '#9A6B10',
    accentTint: '#FBEFD6',

    /* Chrome — light topbar over the navy rail */
    topbar: '#FFFFFF',
    topbarInk: '#1A2435',
    topbarChip: '#F1F4F9',
    topbarField: '#F1F4F9',
    crumbbar: '#F1F4F9',
    crumbbarInk: '#6B7A91',
    crumbbarInkActive: '#1A2435',

    /* The sign-in split panel stays dark — it is a marketing surface. */
    loginPanel: '#0B2545',
    loginPanelInk: '#9FB2CA',

    /* Navigation rail — deep navy */
    navRail: '#0B2545',
    navRailDeep: '#071B33',
    navActive: '#1D6FE0',
    navInk: '#C7D4E4',
    navInkMuted: '#8296B0',

    ink: '#1A2435',
    inkMuted: '#4A5A72',
    inkSubtle: '#7A8AA3',
    canvas: '#F4F6F9',
    surface: '#FFFFFF',
    surfaceSunken: '#F7F9FC',
    line: '#E3E8EF',
    lineStrong: '#C6D0DE',

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
   * Brand teal leads, brand gray is the comparison series, brand yellow is
   * third. The dashboards deliberately pair a saturated series against a gray
   * one (see "PSP Onboarding Summary" and "Transactions YTD & YOY", where the
   * prior year is gray so the current year reads first). Separation comes from
   * lightness as well as hue, so the ramp survives color-vision deficiency
   * and greyscale printing. Assign in fixed order, never cycle — a sixth
   * category folds into "Other" and takes chartContrast. */
  chartSeries: ['#1D6FE0', '#0B2545', '#E0A32E', '#5EA0F0', '#8296B0'],
  chartContrast: '#C42B21',
  chartNeutral: '#8B939B',

  /* Risk tiers read high→low as red→blue→teal on the Risk dashboard donut. */
  riskTiers: [
    { id: 'high', label: 'High Risk', tone: 'danger', color: '#C42B21' },
    { id: 'medium', label: 'Medium Risk', tone: 'warning', color: '#FFC300' },
    { id: 'low', label: 'Low Risk', tone: 'success', color: '#00AAB4' },
  ],

  /* --- Money, locale, markets ------------------------------------------- */
  currency: 'USD',
  locale: 'en-US',
  timezone: 'America/New_York',
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
  /* What kind of merchant this is. Card-not-present and high-risk MCCs price
     and underwrite differently from a card-present retailer, which is why the
     type sits next to the name on every grid. */
  participantTypes: [
    { id: 'retail', label: 'Retail', tone: 'success' },
    { id: 'ecommerce', label: 'E-Commerce', tone: 'info' },
    { id: 'moto', label: 'MOTO', tone: 'warning' },
    { id: 'services', label: 'Services', tone: 'neutral' },
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

  /* --- ERT (Error Risk Threat) --------------------------------------- */
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
  idTypes: ['Passport', 'Driver’s License', 'State ID', 'Permanent Resident Card'],
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
