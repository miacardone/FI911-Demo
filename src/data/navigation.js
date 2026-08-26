/**
 * NAVIGATION — one source of truth for the rail, the routes, the breadcrumb
 * trail and Permissions.
 *
 * The Expedia build of this console carried three perspectives (merchant /
 * acquirer / issuer) and prefixed every route with its perspective. Fi911 is
 * a single operator platform, so routes are flat section paths and the
 * perspective indirection is gone.
 *
 * `area` is the Permissions grouping. `crumb` is the breadcrumb segment shown
 * in the black strip under the topbar — note it is NOT always the same as
 * `label`: the screenshots show "risk-management" and "customer-services" as
 * the middle crumb while the rail reads "Risk Management" and
 * "Customer Services". Keeping both here is what stops a page from
 * hand-rolling its own trail and drifting.
 */

export const LOGIN_ROUTE = '/login';

export const routes = {
  dashboard: '/dashboard',

  /* Participants */
  invitations: '/merchants/proposals',
  invitationDetail: (id = ':id') => `/merchants/proposals/${id}`,
  applications: '/merchants/contracts',
  applicationDetail: (id = ':id') => `/merchants/contracts/${id}`,
  underwriting: '/merchants/underwriting',
  underwritingDetail: (id = ':id') => `/merchants/underwriting/${id}`,
  liveParticipants: '/merchants/live',
  liveParticipantDetail: (id = ':id') => `/merchants/live/${id}`,
  participantMerchants: (id = ':id') => `/merchants/live/${id}/locations`,

  /* Customer Services */
  ert: '/customer-services/tickets',

  /* Reports */
  merchantGlobal: '/reports/merchant-global',
  productivityReport: '/reports/productivity',

  /* Residuals */
  generalLedger: '/residuals/payout-splits',
  feeAdjustments: '/residuals/payout-adjustments',
  agentPayoutSummary: '/residuals/agent-payout-summary',
  payoutDetails: '/residuals/payout-details',
  participantStatus: '/residuals/merchant-status',
  incomeExpense: '/residuals/income-expense',
  portfolioPayoutDetails: '/residuals/portfolio-payout-details',

  /* Disputes */
  disputes: '/disputes',
  disputeDetail: (id = ':id') => `/disputes/${id}`,
  chargebacksAlerts: '/disputes/alerts',

  /* Risk Management */
  workQueue: '/risk/work-queue',
  workQueueMerchant: (mid = ':mid') => `/risk/work-queue/${mid}`,
  actionHistory: '/risk/action-history',
  unactionedQueue: '/risk/unactioned-queue',

  /* Transactions */
  achListings: '/transactions/ach-listings',
  authorizations: '/transactions/authorizations',
  settlements: '/transactions/settlements',
  fundingDeposits: '/transactions/funding-deposits',
  qualifications: '/transactions/qualifications',
  merchantReserves: '/transactions/merchant-reserves',

  /* Billing */
  statements: '/billing/statements',

  /* Admin */
  documentCenter: '/document-center',
  setup: '/setup',

  /** Eric's archived console — a frozen earlier product, kept demonstrable. */
  apm: '/apm',
};

/**
 * SETUP is a MODE, not a page.
 *
 * The live product swaps the whole rail when you enter it — configuration is
 * a different job from operating the book, done by different people, and
 * mixing twenty config screens into the operating rail would bury the eight
 * screens anyone uses daily. That separation is worth keeping; what is not
 * worth keeping is the reference's landing page, which is blank.
 *
 * The way back out is an explicit rail item, so you are never stranded.
 */
export const setupRoutes = {
  home: '/setup',
  underwriting: '/setup/underwriting',
  pricingSchedules: '/setup/pricing-schedules',
  pricingScheduleDetail: (id = ':id') => `/setup/pricing-schedules/${id}`,
  agentProfiles: '/setup/agent-profiles',
  portfolios: '/setup/portfolios',
  residualApproval: '/setup/residual-approval',
  adjustments: '/setup/adjustments',
  residualCalculation: '/setup/residual-calculation',
  merchantMapping: '/setup/merchant-mapping',
  rulesSetup: '/setup/rules',
  users: '/setup/users',
  banners: '/setup/banners',
  documents: '/setup/documents',
  tenant: '/setup/tenant',
};

/**
 * The rail tree. A node with `children` renders as a collapsible group; the
 * group itself is never a route, only its children are.
 */
export const nav = [
  {
    label: 'Dashboard',
    path: routes.dashboard,
    icon: 'dashboard',
    permission: 'Dashboard',
    area: 'Overview',
    crumb: 'Dashboard',
  },
  {
    label: 'Merchants',
    path: '/merchants',
    icon: 'users',
    crumb: 'Merchants',
    children: [
      { label: 'Proposals', path: routes.invitations, permission: 'Proposals', area: 'Merchants', crumb: 'Proposals' },
      { label: 'Contracts', path: routes.applications, permission: 'Contracts', area: 'Merchants', crumb: 'Contracts' },
      { label: 'Underwriting', path: routes.underwriting, permission: 'Underwriting', area: 'Merchants', crumb: 'Underwriting' },
      { label: 'Live Merchants', path: routes.liveParticipants, permission: 'Live Merchants', area: 'Merchants', crumb: 'Live Merchants' },
    ],
  },
  {
    label: 'Customer Services',
    path: '/customer-services',
    icon: 'calendar',
    crumb: 'customer-services',
    children: [
      { label: 'Tickets', path: routes.ert, permission: 'Tickets', area: 'Customer Services', crumb: 'Tickets' },
    ],
  },
  {
    label: 'Residuals',
    path: '/residuals',
    icon: 'dollar',
    crumb: 'Residuals',
    children: [
      /* Ordered by the residual HIERARCHY, top level first: the whole
         portfolio, then the agent, then the merchant line items the agent's
         number is built from, then how each payout splits and what was
         adjusted. Reading down the list walks one level down the tree. */
      { label: 'Portfolio Payout Details', path: routes.portfolioPayoutDetails, permission: 'Portfolio Payout Details', area: 'Residuals', crumb: 'Portfolio Payout Details' },
      { label: 'Agent Payout Summary', path: routes.agentPayoutSummary, permission: 'Agent Payout Summary', area: 'Residuals', crumb: 'Agent Payout Summary' },
      { label: 'Payout Details', path: routes.payoutDetails, permission: 'Payout Details', area: 'Residuals', crumb: 'Payout Details' },
      { label: 'Payout Splits', path: routes.generalLedger, permission: 'Payout Splits', area: 'Residuals', crumb: 'Payout Splits' },
      { label: 'Payout Adjustments', path: routes.feeAdjustments, permission: 'Payout Adjustments', area: 'Residuals', crumb: 'Payout Adjustments' },
      { label: 'Merchant Status', path: routes.participantStatus, permission: 'Merchant Status', area: 'Residuals', crumb: 'Merchant Status' },
      { label: 'Income / Expense', path: routes.incomeExpense, permission: 'Income / Expense', area: 'Residuals', crumb: 'Income / Expense' },
    ],
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: 'chart',
    crumb: 'Reports',
    children: [
      { label: 'Merchant - Global', path: routes.merchantGlobal, permission: 'Merchant Global', area: 'Reports', crumb: 'Merchant - Global' },
      { label: 'Productivity Report', path: routes.productivityReport, permission: 'Productivity Report', area: 'Reports', crumb: 'Productivity Report' },
    ],
  },
  {
    label: 'Disputes',
    path: '/disputes',
    icon: 'alert',
    crumb: 'Disputes',
    children: [
      { label: 'Chargebacks', path: routes.disputes, permission: 'Chargebacks', area: 'Disputes', crumb: 'Chargebacks', end: true },
      { label: 'Chargebacks & Alerts', path: routes.chargebacksAlerts, permission: 'Chargebacks & Alerts', area: 'Disputes', crumb: 'Chargebacks & Alerts' },
    ],
  },
  {
    label: 'Risk',
    path: '/risk',
    icon: 'shield',
    crumb: 'risk',
    children: [
      /* What there is to work, what was missed, what was decided. */
      { label: 'Work Queue', path: routes.workQueue, permission: 'Work Queue', area: 'Risk', crumb: 'Work Queue' },
      { label: 'Unactioned Queue', path: routes.unactionedQueue, permission: 'Unactioned Queue', area: 'Risk', crumb: 'Unactioned Queue' },
      { label: 'Action History', path: routes.actionHistory, permission: 'Action History', area: 'Risk', crumb: 'Action History' },
    ],
  },
  {
    label: 'Transactions',
    path: '/transactions',
    icon: 'calendar',
    crumb: 'Transactions',
    children: [
      /* The order money actually moves in: authorized, settled, qualified at
         a rate, funded, paid out over ACH, less anything held in reserve. */
      { label: 'Authorizations', path: routes.authorizations, permission: 'Authorizations', area: 'Transactions', crumb: 'Authorizations' },
      { label: 'Settlements', path: routes.settlements, permission: 'Settlements', area: 'Transactions', crumb: 'Settlements' },
      { label: 'Qualifications', path: routes.qualifications, permission: 'Qualifications', area: 'Transactions', crumb: 'Qualifications' },
      { label: 'Funding Deposits', path: routes.fundingDeposits, permission: 'Funding Deposits', area: 'Transactions', crumb: 'Funding Deposits' },
      { label: 'ACH Listings', path: routes.achListings, permission: 'ACH Listings', area: 'Transactions', crumb: 'ACH Listings' },
      { label: 'Merchant Reserves', path: routes.merchantReserves, permission: 'Merchant Reserves', area: 'Transactions', crumb: 'Merchant Reserves' },
    ],
  },
  {
    label: 'Billing',
    path: '/billing',
    icon: 'briefcase',
    crumb: 'Billing',
    children: [
      { label: 'Statements', path: routes.statements, permission: 'Statements', area: 'Billing', crumb: 'Statements' },
    ],
  },
  {
    label: 'Document Center',
    path: routes.documentCenter,
    icon: 'folder',
    permission: 'Document Center',
    area: 'Administration',
    crumb: 'Document Center',
  },
  {
    label: 'Setup',
    path: routes.setup,
    icon: 'wrench',
    permission: 'Setup',
    area: 'Administration',
    crumb: 'Setup',
  },
  {
    label: 'APM',
    path: routes.apm,
    icon: 'route',
    permission: 'APM',
    area: 'Alternative Payment Methods',
    crumb: 'APM',
  },
];

/** The configuration rail, shown while the pathname is inside /setup. */
export const setupNav = [
  {
    label: 'Back to console',
    path: routes.dashboard,
    icon: 'arrowLeft',
    exit: true,
    crumb: 'Dashboard',
  },
  {
    label: 'Home',
    path: setupRoutes.home,
    icon: 'dashboard',
    permission: 'Setup Home',
    area: 'Setup',
    crumb: 'Home',
    end: true,
  },
  {
    label: 'Merchants',
    path: '/setup/merchants',
    icon: 'users',
    crumb: 'Merchants',
    children: [
      { label: 'Underwriting Setup', path: setupRoutes.underwriting, permission: 'Underwriting Setup', area: 'Setup', crumb: 'Underwriting Setup' },
    ],
  },
  {
    label: 'Residuals',
    path: '/setup/residuals',
    icon: 'dollar',
    crumb: 'Residuals',
    children: [
      { label: 'Pricing Schedules', path: setupRoutes.pricingSchedules, permission: 'Pricing Schedules', area: 'Setup', crumb: 'Pricing Schedules' },
      { label: 'Agent Profiles', path: setupRoutes.agentProfiles, permission: 'Agent Profiles', area: 'Setup', crumb: 'Agent Profiles' },
      { label: 'Portfolio Setup', path: setupRoutes.portfolios, permission: 'Portfolio Setup', area: 'Setup', crumb: 'Portfolio Setup' },
      { label: 'Residual Approval', path: setupRoutes.residualApproval, permission: 'Residual Approval', area: 'Setup', crumb: 'Residual Approval' },
      { label: 'Adjustment Setup', path: setupRoutes.adjustments, permission: 'Adjustment Setup', area: 'Setup', crumb: 'Adjustment Setup' },
      { label: 'Residual Calculation', path: setupRoutes.residualCalculation, permission: 'Residual Calculation', area: 'Setup', crumb: 'Residual Calculation' },
      { label: 'Merchant Mapping', path: setupRoutes.merchantMapping, permission: 'Merchant Mapping', area: 'Setup', crumb: 'Merchant Mapping' },
    ],
  },
  {
    label: 'Risk',
    path: '/setup/risk',
    icon: 'shield',
    crumb: 'Risk',
    children: [
      { label: 'Rules Setup', path: setupRoutes.rulesSetup, permission: 'Rules Setup', area: 'Setup', crumb: 'Rules Setup' },
    ],
  },
  {
    label: 'Admin',
    path: '/setup/admin',
    icon: 'wrench',
    crumb: 'Admin',
    children: [
      { label: 'Users & Access Control', path: setupRoutes.users, permission: 'Users & Access Control', area: 'Setup', crumb: 'Users & Access Control' },
      { label: 'Banner Ads', path: setupRoutes.banners, permission: 'Banner Ads', area: 'Setup', crumb: 'Banner Ads' },
      { label: 'Document Library', path: setupRoutes.documents, permission: 'Document Library', area: 'Setup', crumb: 'Document Library' },
      { label: 'Tenant Configuration', path: setupRoutes.tenant, permission: 'Tenant Configuration', area: 'Setup', crumb: 'Tenant Configuration' },
    ],
  },
];

/** Which rail a pathname belongs to. One test, used by the layout and here. */
export const isSetupPath = (pathname) => pathname === setupRoutes.home || pathname.startsWith(`${setupRoutes.home}/`);

/**
 * APM is a THIRD mode, beside the acquiring console and Setup.
 *
 * Alternative payment methods are a different product on a different rail:
 * bank-to-bank rather than card schemes, participants rather than merchants,
 * APP claims rather than chargebacks. It shares this app's shell and
 * components but none of its data or vocabulary, which is why it gets its own
 * rail rather than a section in this one.
 */
export const isApmPath = (pathname) => pathname === '/apm' || pathname.startsWith('/apm/');

export const navTreeFor = (pathname, apmTree) => {
  if (isApmPath(pathname)) return apmTree ?? [];
  return isSetupPath(pathname) ? setupNav : nav;
};

const leavesOf = (tree) => tree.flatMap((item) => (
  item.children ? item.children.map((c) => ({ ...c, parent: item })) : [{ ...item, parent: null }]
));

/** Flattened leaf list — used by Permissions and by the breadcrumb resolver. */
export const navLeaves = leavesOf(nav);
export const setupNavLeaves = leavesOf(setupNav).filter((l) => !l.exit);

export const ALL_LEAVES = [...navLeaves, ...setupNavLeaves];

export const PERMISSION_AREAS = [...new Set(ALL_LEAVES.map((l) => l.area))];

/**
 * Resolve the breadcrumb trail for a pathname.
 *
 * Always starts at Home. A leaf match contributes its parent crumb (when the
 * leaf sits inside a group) then its own. A detail route appends the record
 * label the caller passes in, so "Home > Participants > Invitations >
 * Alderton Medical Supply LLC" comes out of one call rather than three
 * bespoke header props.
 */
export function crumbsFor(pathname, detailLabel) {
  const setup = isSetupPath(pathname);

  /* Inside Setup the trail roots at Setup, not at the operating dashboard —
     the two are different places and a trail that pretends otherwise gives a
     link that leaves the mode you are in. */
  const trail = setup
    ? [{ label: 'Setup', path: setupRoutes.home }]
    : [{ label: 'Home', path: routes.dashboard }];

  const leaf = (setup ? setupNavLeaves : navLeaves)
    .filter((l) => pathname === l.path || pathname.startsWith(`${l.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];

  if (!leaf) return trail;

  if (leaf.parent) trail.push({ label: leaf.parent.crumb, path: null });
  trail.push({ label: leaf.crumb, path: detailLabel ? leaf.path : null });
  if (detailLabel) trail.push({ label: detailLabel, path: null });

  return trail;
}

export default nav;
