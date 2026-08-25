/**
 * APM NAVIGATION.
 *
 * Alternative payment methods have their own rail, every route under /apm so
 * the two consoles cannot collide. Deliberately a separate file from the
 * acquiring navigation: this IA is not a subset of that one, and merging them
 * would mean a single rail carrying two products' worth of vocabulary.
 */

export const LOGIN_ROUTE = '/login';

export const routes = {
  dashboard: '/apm/dashboard',

  /* Participants */
  invitations: '/apm/participants/invitations',
  invitationDetail: (id = ':id') => `/apm/participants/invitations/${id}`,
  applications: '/apm/participants/applications',
  applicationDetail: (id = ':id') => `/apm/participants/applications/${id}`,
  underwriting: '/apm/participants/underwriting',
  underwritingDetail: (id = ':id') => `/apm/participants/underwriting/${id}`,
  onboarding: '/apm/participants/onboarding',
  onboardingDetail: (id = ':id') => `/apm/participants/onboarding/${id}`,
  liveParticipants: '/apm/participants/live',
  liveParticipantDetail: (id = ':id') => `/apm/participants/live/${id}`,
  participantMerchants: (id = ':id') => `/apm/participants/live/${id}/merchants`,

  /* Customer Services */
  ert: '/apm/customer-services/ert',

  /* Reports */
  merchantGlobal: '/apm/reports/merchant-global',
  productivityReport: '/apm/reports/productivity',

  /* Residuals */
  generalLedger: '/apm/residuals/general-ledger',
  feeAdjustments: '/apm/residuals/fee-adjustments',
  trendingReport: '/apm/residuals/trending-report',
  agentPayoutSummary: '/apm/residuals/agent-payout-summary',
  payoutDetails: '/apm/residuals/payout-details',
  participantStatus: '/apm/residuals/participant-status',
  incomeExpense: '/apm/residuals/income-expense',
  portfolioPayoutDetails: '/apm/residuals/portfolio-payout-details',

  /* Disputes */
  disputes: '/apm/disputes',
  disputeDetail: (id = ':id') => `/apm/disputes/${id}`,
  chargebacksAlerts: '/apm/disputes/alerts',

  /* Risk Management */
  riskDashboard: '/apm/risk-management/dashboard',
  riskMerchants: '/apm/risk-management/merchants',
  alertAction: '/apm/risk-management/alert-action',
  merchantRiskProfile: '/apm/risk-management/merchant-risk-profile',
  heldVolume: '/apm/risk-management/held-volume',
  rules: '/apm/risk-management/rules',
  workQueue: '/apm/risk-management/work-queue',
  workQueueMerchant: (mid = ':mid') => `/apm/risk-management/work-queue/${mid}`,
  actionHistory: '/apm/risk-management/action-history',
  unactionedQueue: '/apm/risk-management/unactioned-queue',

  /* Transactions */
  accountHolder: '/apm/transactions/account-holder',
  gateway: '/apm/transactions/gateway',
  achListings: '/apm/transactions/ach-listings',
  authorizations: '/apm/transactions/authorizations',
  settlements: '/apm/transactions/settlements',
  fundingCategory: '/apm/transactions/funding-category',
  fundingDeposits: '/apm/transactions/funding-deposits',
  qualifications: '/apm/transactions/qualifications',
  merchantReserves: '/apm/transactions/merchant-reserves',

  /* Billing */
  statements: '/apm/billing/statements',

  /* Admin */
  documentCenter: '/apm/document-center',
  setup: '/apm/setup',
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
  home: '/apm/setup',
  underwriting: '/apm/setup/underwriting',
  pricingSchedules: '/apm/setup/pricing-schedules',
  pricingScheduleDetail: (id = ':id') => `/apm/setup/pricing-schedules/${id}`,
  agentProfiles: '/apm/setup/agent-profiles',
  portfolios: '/apm/setup/portfolios',
  residualApproval: '/apm/setup/residual-approval',
  adjustments: '/apm/setup/adjustments',
  residualCalculation: '/apm/setup/residual-calculation',
  merchantMapping: '/apm/setup/merchant-mapping',
  rulesSetup: '/apm/setup/rules',
  users: '/apm/setup/users',
  banners: '/apm/setup/banners',
  documents: '/apm/setup/documents',
  tenant: '/apm/setup/tenant',
};

/**
 * The rail tree. A node with `children` renders as a collapsible group; the
 * group itself is never a route, only its children are.
 */
export const nav = [
  {
    label: 'Back to console',
    path: '/dashboard',
    icon: 'arrowLeft',
    exit: true,
    crumb: 'Dashboard',
  },
  {
    label: 'Dashboard',
    path: routes.dashboard,
    icon: 'dashboard',
    permission: 'Dashboard',
    area: 'Overview',
    crumb: 'Dashboard',
  },
  {
    label: 'Participants',
    path: '/apm/participants',
    icon: 'users',
    crumb: 'Participants',
    children: [
      { label: 'Invitations', path: routes.invitations, permission: 'Invitations', area: 'Participants', crumb: 'Invitations' },
      { label: 'Applications', path: routes.applications, permission: 'Applications', area: 'Participants', crumb: 'Applications' },
      { label: 'Underwriting', path: routes.underwriting, permission: 'Underwriting', area: 'Participants', crumb: 'Underwriting' },
      { label: 'Onboarding', path: routes.onboarding, permission: 'Onboarding', area: 'Participants', crumb: 'Onboarding' },
      { label: 'Live Participants', path: routes.liveParticipants, permission: 'Live Participants', area: 'Participants', crumb: 'Live Participants' },
    ],
  },
  {
    label: 'Customer Services',
    path: '/apm/customer-services',
    icon: 'calendar',
    crumb: 'customer-services',
    children: [
      { label: 'ERT', path: routes.ert, permission: 'ERT', area: 'Customer Services', crumb: 'ERT' },
    ],
  },
  {
    label: 'Residuals',
    path: '/apm/residuals',
    icon: 'pound',
    crumb: 'Residuals',
    children: [
      { label: 'General Ledger', path: routes.generalLedger, permission: 'General Ledger', area: 'Residuals', crumb: 'General Ledger' },
      { label: 'Fee Adjustments', path: routes.feeAdjustments, permission: 'Fee Adjustments', area: 'Residuals', crumb: 'Fee Adjustments' },
      { label: 'Trending Report', path: routes.trendingReport, permission: 'Trending Report', area: 'Residuals', crumb: 'Trending Report' },
      { label: 'Agent Payout Summary', path: routes.agentPayoutSummary, permission: 'Agent Payout Summary', area: 'Residuals', crumb: 'Agent Payout Summary' },
      { label: 'Payout Details', path: routes.payoutDetails, permission: 'Payout Details', area: 'Residuals', crumb: 'Payout Details' },
      { label: 'Participant Status', path: routes.participantStatus, permission: 'Participant Status', area: 'Residuals', crumb: 'Participant Status' },
      { label: 'Income / Expense', path: routes.incomeExpense, permission: 'Income / Expense', area: 'Residuals', crumb: 'Income / Expense' },
      { label: 'Portfolio Payout Details', path: routes.portfolioPayoutDetails, permission: 'Portfolio Payout Details', area: 'Residuals', crumb: 'Portfolio Payout Details' },
    ],
  },
  {
    label: 'Reports',
    path: '/apm/reports',
    icon: 'chart',
    crumb: 'Reports',
    children: [
      { label: 'Merchant - Global', path: routes.merchantGlobal, permission: 'Merchant Global', area: 'Reports', crumb: 'Merchant - Global' },
      { label: 'Productivity Report', path: routes.productivityReport, permission: 'Productivity Report', area: 'Reports', crumb: 'Productivity Report' },
    ],
  },
  {
    label: 'Disputes',
    path: '/apm/disputes',
    icon: 'alert',
    crumb: 'Disputes',
    children: [
      { label: 'Disputes', path: routes.disputes, permission: 'Disputes', area: 'Disputes', crumb: 'Disputes', end: true },
      { label: 'Chargebacks & Alerts', path: routes.chargebacksAlerts, permission: 'Chargebacks & Alerts', area: 'Disputes', crumb: 'Chargebacks & Alerts' },
    ],
  },
  {
    label: 'Risk Management',
    path: '/apm/risk-management',
    icon: 'shield',
    crumb: 'risk-management',
    children: [
      { label: 'Dashboard', path: routes.riskDashboard, permission: 'Risk Dashboard', area: 'Risk Management', crumb: 'Dashboard' },
      { label: 'Work Queue', path: routes.workQueue, permission: 'Work Queue', area: 'Risk Management', crumb: 'Work Queue' },
      { label: 'Action History', path: routes.actionHistory, permission: 'Action History', area: 'Risk Management', crumb: 'Action History' },
      { label: 'Unactioned Queue', path: routes.unactionedQueue, permission: 'Unactioned Queue', area: 'Risk Management', crumb: 'Unactioned Queue' },
      { label: 'Merchants', path: routes.riskMerchants, permission: 'Risk Merchants', area: 'Risk Management', crumb: 'Merchants' },
      { label: 'Alert Action', path: routes.alertAction, permission: 'Alert Action', area: 'Risk Management', crumb: 'Alert Action' },
      { label: 'Merchant Risk Profile', path: routes.merchantRiskProfile, permission: 'Merchant Risk Profile', area: 'Risk Management', crumb: 'Merchant Risk Profile' },
      { label: 'Held Volume', path: routes.heldVolume, permission: 'Held Volume', area: 'Risk Management', crumb: 'Held Volume' },
      { label: 'Rules', path: routes.rules, permission: 'Rules', area: 'Risk Management', crumb: 'Rules' },
    ],
  },
  {
    label: 'Transactions',
    path: '/apm/transactions',
    icon: 'calendar',
    crumb: 'Transactions',
    children: [
      { label: 'Account Holder', path: routes.accountHolder, permission: 'Account Holder', area: 'Transactions', crumb: 'Account Holder' },
      { label: 'Gateway', path: routes.gateway, permission: 'Gateway', area: 'Transactions', crumb: 'Gateway' },
      { label: 'ACH Listings', path: routes.achListings, permission: 'ACH Listings', area: 'Transactions', crumb: 'ACH Listings' },
      { label: 'Authorizations', path: routes.authorizations, permission: 'Authorizations', area: 'Transactions', crumb: 'Authorizations' },
      { label: 'Settlements', path: routes.settlements, permission: 'Settlements', area: 'Transactions', crumb: 'Settlements' },
      { label: 'Funding Category', path: routes.fundingCategory, permission: 'Funding Category', area: 'Transactions', crumb: 'Funding Category' },
      { label: 'Funding Deposits', path: routes.fundingDeposits, permission: 'Funding Deposits', area: 'Transactions', crumb: 'Funding Deposits' },
      { label: 'Qualifications', path: routes.qualifications, permission: 'Qualifications', area: 'Transactions', crumb: 'Qualifications' },
      { label: 'Merchant Reserves', path: routes.merchantReserves, permission: 'Merchant Reserves', area: 'Transactions', crumb: 'Merchant Reserves' },
    ],
  },
  {
    label: 'Billing',
    path: '/apm/billing',
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
    path: '/apm/setup/merchants',
    icon: 'users',
    crumb: 'Merchants',
    children: [
      { label: 'Underwriting Setup', path: setupRoutes.underwriting, permission: 'Underwriting Setup', area: 'Setup', crumb: 'Underwriting Setup' },
    ],
  },
  {
    label: 'Residuals',
    path: '/apm/setup/residuals',
    icon: 'pound',
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
    path: '/apm/setup/risk',
    icon: 'shield',
    crumb: 'Risk',
    children: [
      { label: 'Rules Setup', path: setupRoutes.rulesSetup, permission: 'Rules Setup', area: 'Setup', crumb: 'Rules Setup' },
    ],
  },
  {
    label: 'Admin',
    path: '/apm/setup/admin',
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
export const navTreeFor = (pathname) => (isSetupPath(pathname) ? setupNav : nav);

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
 * Alderton Medical Supplies Ltd" comes out of one call rather than three
 * bespoke header props.
 */
export function crumbsFor(pathname, detailLabel) {
  const setup = isSetupPath(pathname);

  /* Inside Setup the trail roots at Setup, not at the operating dashboard —
     the two are different places and a trail that pretends otherwise gives a
     link that leaves the mode you are in. */
  /* Roots at APM, not Home — a trail linking back to the acquiring console's
     dashboard would quietly drop you out of this rail. */
  const trail = setup
    ? [{ label: 'Setup', path: setupRoutes.home }]
    : [{ label: 'APM', path: routes.dashboard }];

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
