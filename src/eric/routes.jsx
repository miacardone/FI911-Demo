import { Navigate, Route } from 'react-router-dom';
import { routes } from '@/eric/data/navigation';

import Login from '@/eric/pages/Login';
import Dashboard from '@/eric/pages/Dashboard';
import Invitations from '@/eric/pages/participants/Invitations';
import InvitationDetail from '@/eric/pages/participants/InvitationDetail';
import Applications from '@/eric/pages/participants/Applications';
import ApplicationDetail from '@/eric/pages/participants/ApplicationDetail';
import Underwriting from '@/eric/pages/participants/Underwriting';
import UnderwritingDetail from '@/eric/pages/participants/UnderwritingDetail';
import Onboarding from '@/eric/pages/participants/Onboarding';
import OnboardingDetail from '@/eric/pages/participants/OnboardingDetail';
import LiveParticipants from '@/eric/pages/participants/LiveParticipants';
import LiveParticipantDetail from '@/eric/pages/participants/LiveParticipantDetail';
import ParticipantMerchants from '@/eric/pages/participants/ParticipantMerchants';
import Ert from '@/eric/pages/customer-services/Ert';
import MerchantGlobal from '@/eric/pages/reports/MerchantGlobal';
import ProductivityReport from '@/eric/pages/reports/ProductivityReport';
import GeneralLedger from '@/eric/pages/residuals/GeneralLedger';
import FeeAdjustments from '@/eric/pages/residuals/FeeAdjustments';
import TrendingReport from '@/eric/pages/residuals/TrendingReport';
import AgentPayoutSummary from '@/eric/pages/residuals/AgentPayoutSummary';
import PayoutDetails from '@/eric/pages/residuals/PayoutDetails';
import ParticipantStatus from '@/eric/pages/residuals/ParticipantStatus';
import IncomeExpense from '@/eric/pages/residuals/IncomeExpense';
import PortfolioPayoutDetails from '@/eric/pages/residuals/PortfolioPayoutDetails';
import Disputes from '@/eric/pages/disputes/Disputes';
import DisputeDetail from '@/eric/pages/disputes/DisputeDetail';
import ChargebacksAlerts from '@/eric/pages/disputes/ChargebacksAlerts';
import RiskDashboard from '@/eric/pages/risk/RiskDashboard';
import RiskMerchants from '@/eric/pages/risk/RiskMerchants';
import AlertAction from '@/eric/pages/risk/AlertAction';
import MerchantRiskProfile from '@/eric/pages/risk/MerchantRiskProfile';
import HeldVolume from '@/eric/pages/risk/HeldVolume';
import Rules from '@/eric/pages/risk/Rules';
import WorkQueue from '@/eric/pages/risk/WorkQueue';
import WorkQueueMerchant from '@/eric/pages/risk/WorkQueueMerchant';
import ActionHistory from '@/eric/pages/risk/ActionHistory';
import UnactionedQueue from '@/eric/pages/risk/UnactionedQueue';
import AccountHolder from '@/eric/pages/transactions/AccountHolder';
import Gateway from '@/eric/pages/transactions/Gateway';
import AchListings from '@/eric/pages/transactions/AchListings';
import Authorizations from '@/eric/pages/transactions/Authorizations';
import Settlements from '@/eric/pages/transactions/Settlements';
import FundingCategory from '@/eric/pages/transactions/FundingCategory';
import FundingDeposits from '@/eric/pages/transactions/FundingDeposits';
import Qualifications from '@/eric/pages/transactions/Qualifications';
import MerchantReserves from '@/eric/pages/transactions/MerchantReserves';
import Statements from '@/eric/pages/billing/Statements';
import DocumentCenter from '@/eric/pages/documents/DocumentCenter';
import SetupHome from '@/eric/pages/setup/SetupHome';
import PricingSchedules from '@/eric/pages/setup/PricingSchedules';
import PricingScheduleDetail from '@/eric/pages/setup/PricingScheduleDetail';
import AgentProfiles from '@/eric/pages/setup/AgentProfiles';
import PortfolioSetup from '@/eric/pages/setup/PortfolioSetup';
import ResidualApproval from '@/eric/pages/setup/ResidualApproval';
import AdjustmentSetup from '@/eric/pages/setup/AdjustmentSetup';
import ResidualCalculation from '@/eric/pages/setup/ResidualCalculation';
import MerchantMapping from '@/eric/pages/setup/MerchantMapping';
import UnderwritingSetup from '@/eric/pages/setup/UnderwritingSetup';
import UsersAccess from '@/eric/pages/setup/UsersAccess';
import BannerAds from '@/eric/pages/setup/BannerAds';
import DocumentLibrary from '@/eric/pages/setup/DocumentLibrary';
import TenantConfiguration from '@/eric/pages/setup/TenantConfiguration';

/**
 * ERIC'S CONSOLE — frozen 2026/08/24.
 *
 * The whole of an earlier product, kept demonstrable rather than deleted: a
 * UK bank-to-bank participant console in GBP, with the five-stage participant
 * funnel, APP-claim disputes and the six risk screens the live console no
 * longer carries.
 *
 * It renders inside the same shell — same rail, topbar and breadcrumbs — but
 * reads exclusively from src/eric, so nothing here moves when the live
 * console's data model changes. That isolation is the point: an archive that
 * drifts with the thing it archives preserves nothing.
 *
 * Exported as a <Route> subtree so App.jsx nests the lot under /eric without
 * restating seventy paths.
 */
export const ericRoutes = (
  <Route path="eric">
    <Route index element={<Navigate to="/eric/dashboard" replace />} />
    <Route path="dashboard" element={<Dashboard />} />

    <Route path="participants">
    <Route index element={<Navigate to={routes.invitations} replace />} />
    <Route path="invitations" element={<Invitations />} />
    <Route path="invitations/:id" element={<InvitationDetail />} />
    <Route path="applications" element={<Applications />} />
    <Route path="applications/:id" element={<ApplicationDetail />} />
    <Route path="underwriting" element={<Underwriting />} />
    <Route path="underwriting/:id" element={<UnderwritingDetail />} />
    <Route path="onboarding" element={<Onboarding />} />
    <Route path="onboarding/:id" element={<OnboardingDetail />} />
    <Route path="live" element={<LiveParticipants />} />
    <Route path="live/:id" element={<LiveParticipantDetail />} />
    <Route path="live/:id/merchants" element={<ParticipantMerchants />} />
    </Route>

    <Route path="customer-services">
    <Route index element={<Navigate to={routes.ert} replace />} />
    <Route path="ert" element={<Ert />} />
    </Route>

    <Route path="residuals">
    <Route index element={<Navigate to={routes.generalLedger} replace />} />
    <Route path="general-ledger" element={<GeneralLedger />} />
    <Route path="fee-adjustments" element={<FeeAdjustments />} />
    <Route path="trending-report" element={<TrendingReport />} />
    <Route path="agent-payout-summary" element={<AgentPayoutSummary />} />
    <Route path="payout-details" element={<PayoutDetails />} />
    <Route path="participant-status" element={<ParticipantStatus />} />
    <Route path="income-expense" element={<IncomeExpense />} />
    <Route path="portfolio-payout-details" element={<PortfolioPayoutDetails />} />
    </Route>

    <Route path="reports">
    <Route index element={<Navigate to={routes.merchantGlobal} replace />} />
    <Route path="merchant-global" element={<MerchantGlobal />} />
    <Route path="productivity" element={<ProductivityReport />} />
    </Route>

    <Route path="disputes">
    <Route index element={<Disputes />} />
    <Route path="alerts" element={<ChargebacksAlerts />} />
    <Route path=":id" element={<DisputeDetail />} />
    </Route>

    <Route path="risk-management">
    <Route index element={<Navigate to={routes.riskDashboard} replace />} />
    <Route path="dashboard" element={<RiskDashboard />} />
    <Route path="merchants" element={<RiskMerchants />} />
    <Route path="alert-action" element={<AlertAction />} />
    <Route path="merchant-risk-profile" element={<MerchantRiskProfile />} />
    <Route path="held-volume" element={<HeldVolume />} />
    <Route path="rules" element={<Rules />} />
    <Route path="work-queue" element={<WorkQueue />} />
    <Route path="work-queue/:mid" element={<WorkQueueMerchant />} />
    <Route path="action-history" element={<ActionHistory />} />
    <Route path="unactioned-queue" element={<UnactionedQueue />} />
    </Route>

    <Route path="transactions">
    <Route index element={<Navigate to={routes.accountHolder} replace />} />
    <Route path="account-holder" element={<AccountHolder />} />
    <Route path="gateway" element={<Gateway />} />
    <Route path="ach-listings" element={<AchListings />} />
    <Route path="authorizations" element={<Authorizations />} />
    <Route path="settlements" element={<Settlements />} />
    <Route path="funding-category" element={<FundingCategory />} />
    <Route path="funding-deposits" element={<FundingDeposits />} />
    <Route path="qualifications" element={<Qualifications />} />
    <Route path="merchant-reserves" element={<MerchantReserves />} />
    </Route>

    <Route path="billing">
    <Route index element={<Navigate to={routes.statements} replace />} />
    <Route path="statements" element={<Statements />} />
    </Route>

    <Route path="document-center" element={<DocumentCenter />} />
    <Route path="setup">
    <Route index element={<SetupHome />} />
    <Route path="pricing-schedules" element={<PricingSchedules />} />
    <Route path="pricing-schedules/:id" element={<PricingScheduleDetail />} />
    <Route path="agent-profiles" element={<AgentProfiles />} />
    <Route path="portfolios" element={<PortfolioSetup />} />
    <Route path="residual-approval" element={<ResidualApproval />} />
    <Route path="adjustments" element={<AdjustmentSetup />} />
    <Route path="residual-calculation" element={<ResidualCalculation />} />
    <Route path="merchant-mapping" element={<MerchantMapping />} />
    <Route path="underwriting" element={<UnderwritingSetup />} />
    {/* Rules Setup is the same screen as Risk > Rules. Config and
    operation are different rails, not different code. */}
    <Route path="rules" element={<Rules />} />
    <Route path="users" element={<UsersAccess />} />
    <Route path="banners" element={<BannerAds />} />
    <Route path="documents" element={<DocumentLibrary />} />
    <Route path="tenant" element={<TenantConfiguration />} />
    </Route>

    <Route path="*" element={<Navigate to="/eric/dashboard" replace />} />
  </Route>
);

export default ericRoutes;
