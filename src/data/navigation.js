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
  invitations: '/participants/invitations',
  invitationDetail: (id = ':id') => `/participants/invitations/${id}`,
  applications: '/participants/applications',
  applicationDetail: (id = ':id') => `/participants/applications/${id}`,
  underwriting: '/participants/underwriting',
  underwritingDetail: (id = ':id') => `/participants/underwriting/${id}`,
  onboarding: '/participants/onboarding',
  onboardingDetail: (id = ':id') => `/participants/onboarding/${id}`,
  liveParticipants: '/participants/live',
  liveParticipantDetail: (id = ':id') => `/participants/live/${id}`,
  participantMerchants: (id = ':id') => `/participants/live/${id}/merchants`,

  /* Customer Services */
  ert: '/customer-services/ert',

  /* Residuals */
  generalLedger: '/residuals/general-ledger',
  feeAdjustments: '/residuals/fee-adjustments',
  trendingReport: '/residuals/trending-report',
  agentPayoutSummary: '/residuals/agent-payout-summary',
  payoutDetails: '/residuals/payout-details',
  participantStatus: '/residuals/participant-status',
  incomeExpense: '/residuals/income-expense',
  portfolioPayoutDetails: '/residuals/portfolio-payout-details',

  /* Disputes */
  disputes: '/disputes',
  disputeDetail: (id = ':id') => `/disputes/${id}`,

  /* Risk Management */
  riskDashboard: '/risk-management/dashboard',
  riskMerchants: '/risk-management/merchants',
  alertAction: '/risk-management/alert-action',
  merchantRiskProfile: '/risk-management/merchant-risk-profile',
  heldVolume: '/risk-management/held-volume',
  rules: '/risk-management/rules',

  /* Transactions */
  accountHolder: '/transactions/account-holder',
  gateway: '/transactions/gateway',
  achListings: '/transactions/ach-listings',
  authorizations: '/transactions/authorizations',
  settlements: '/transactions/settlements',
  fundingCategory: '/transactions/funding-category',
  fundingDeposits: '/transactions/funding-deposits',
  qualifications: '/transactions/qualifications',
  merchantReserves: '/transactions/merchant-reserves',

  /* Billing */
  statements: '/billing/statements',
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
    label: 'Participants',
    path: '/participants',
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
    path: '/customer-services',
    icon: 'calendar',
    crumb: 'customer-services',
    children: [
      { label: 'ERT', path: routes.ert, permission: 'ERT', area: 'Customer Services', crumb: 'ERT' },
    ],
  },
  {
    label: 'Residuals',
    path: '/residuals',
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
    label: 'Disputes',
    path: '/disputes',
    icon: 'alert',
    crumb: 'Disputes',
    children: [
      { label: 'Disputes', path: routes.disputes, permission: 'Disputes', area: 'Disputes', crumb: 'Disputes', end: true },
    ],
  },
  {
    label: 'Risk Management',
    path: '/risk-management',
    icon: 'shield',
    crumb: 'risk-management',
    children: [
      { label: 'Dashboard', path: routes.riskDashboard, permission: 'Risk Dashboard', area: 'Risk Management', crumb: 'Dashboard' },
      { label: 'Merchants', path: routes.riskMerchants, permission: 'Risk Merchants', area: 'Risk Management', crumb: 'Merchants' },
      { label: 'Alert Action', path: routes.alertAction, permission: 'Alert Action', area: 'Risk Management', crumb: 'Alert Action' },
      { label: 'Merchant Risk Profile', path: routes.merchantRiskProfile, permission: 'Merchant Risk Profile', area: 'Risk Management', crumb: 'Merchant Risk Profile' },
      { label: 'Held Volume', path: routes.heldVolume, permission: 'Held Volume', area: 'Risk Management', crumb: 'Held Volume' },
      { label: 'Rules', path: routes.rules, permission: 'Rules', area: 'Risk Management', crumb: 'Rules' },
    ],
  },
  {
    label: 'Transactions',
    path: '/transactions',
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
    path: '/billing',
    icon: 'briefcase',
    crumb: 'Billing',
    children: [
      { label: 'Statements', path: routes.statements, permission: 'Statements', area: 'Billing', crumb: 'Statements' },
    ],
  },
];

/** Flattened leaf list — used by Permissions and by the breadcrumb resolver. */
export const navLeaves = nav.flatMap((item) =>
  item.children ? item.children.map((c) => ({ ...c, parent: item })) : [{ ...item, parent: null }],
);

export const PERMISSION_AREAS = [...new Set(navLeaves.map((l) => l.area))];

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
  const trail = [{ label: 'Home', path: routes.dashboard }];

  const leaf = navLeaves
    .filter((l) => pathname === l.path || pathname.startsWith(`${l.path}/`))
    .sort((a, b) => b.path.length - a.path.length)[0];

  if (!leaf) return trail;

  if (leaf.parent) trail.push({ label: leaf.parent.crumb, path: null });
  trail.push({ label: leaf.crumb, path: detailLabel ? leaf.path : null });
  if (detailLabel) trail.push({ label: detailLabel, path: null });

  return trail;
}

export default nav;
