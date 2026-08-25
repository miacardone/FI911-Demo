import { Navigate, Route } from 'react-router-dom';
import { routes } from '@/apm/data/navigation';

import Login from '@/apm/pages/Login';
import Dashboard from '@/apm/pages/Dashboard';
import Invitations from '@/apm/pages/participants/Invitations';
import InvitationDetail from '@/apm/pages/participants/InvitationDetail';
import Applications from '@/apm/pages/participants/Applications';
import ApplicationDetail from '@/apm/pages/participants/ApplicationDetail';
import Underwriting from '@/apm/pages/participants/Underwriting';
import UnderwritingDetail from '@/apm/pages/participants/UnderwritingDetail';
import Onboarding from '@/apm/pages/participants/Onboarding';
import OnboardingDetail from '@/apm/pages/participants/OnboardingDetail';
import LiveParticipants from '@/apm/pages/participants/LiveParticipants';
import LiveParticipantDetail from '@/apm/pages/participants/LiveParticipantDetail';
import ParticipantMerchants from '@/apm/pages/participants/ParticipantMerchants';
import Ert from '@/apm/pages/customer-services/Ert';
import MerchantGlobal from '@/apm/pages/reports/MerchantGlobal';
import ProductivityReport from '@/apm/pages/reports/ProductivityReport';
import GeneralLedger from '@/apm/pages/residuals/GeneralLedger';
import FeeAdjustments from '@/apm/pages/residuals/FeeAdjustments';
import TrendingReport from '@/apm/pages/residuals/TrendingReport';
import AgentPayoutSummary from '@/apm/pages/residuals/AgentPayoutSummary';
import PayoutDetails from '@/apm/pages/residuals/PayoutDetails';
import ParticipantStatus from '@/apm/pages/residuals/ParticipantStatus';
import IncomeExpense from '@/apm/pages/residuals/IncomeExpense';
import PortfolioPayoutDetails from '@/apm/pages/residuals/PortfolioPayoutDetails';
import Disputes from '@/apm/pages/disputes/Disputes';
import DisputeDetail from '@/apm/pages/disputes/DisputeDetail';
import ChargebacksAlerts from '@/apm/pages/disputes/ChargebacksAlerts';
import RiskDashboard from '@/apm/pages/risk/RiskDashboard';
import RiskMerchants from '@/apm/pages/risk/RiskMerchants';
import AlertAction from '@/apm/pages/risk/AlertAction';
import MerchantRiskProfile from '@/apm/pages/risk/MerchantRiskProfile';
import HeldVolume from '@/apm/pages/risk/HeldVolume';
import Rules from '@/apm/pages/risk/Rules';
import WorkQueue from '@/apm/pages/risk/WorkQueue';
import WorkQueueMerchant from '@/apm/pages/risk/WorkQueueMerchant';
import ActionHistory from '@/apm/pages/risk/ActionHistory';
import UnactionedQueue from '@/apm/pages/risk/UnactionedQueue';
import AccountHolder from '@/apm/pages/transactions/AccountHolder';
import Gateway from '@/apm/pages/transactions/Gateway';
import AchListings from '@/apm/pages/transactions/AchListings';
import Authorizations from '@/apm/pages/transactions/Authorizations';
import Settlements from '@/apm/pages/transactions/Settlements';
import FundingCategory from '@/apm/pages/transactions/FundingCategory';
import FundingDeposits from '@/apm/pages/transactions/FundingDeposits';
import Qualifications from '@/apm/pages/transactions/Qualifications';
import MerchantReserves from '@/apm/pages/transactions/MerchantReserves';
import Statements from '@/apm/pages/billing/Statements';
import DocumentCenter from '@/apm/pages/documents/DocumentCenter';
import SetupHome from '@/apm/pages/setup/SetupHome';
import PricingSchedules from '@/apm/pages/setup/PricingSchedules';
import PricingScheduleDetail from '@/apm/pages/setup/PricingScheduleDetail';
import AgentProfiles from '@/apm/pages/setup/AgentProfiles';
import PortfolioSetup from '@/apm/pages/setup/PortfolioSetup';
import ResidualApproval from '@/apm/pages/setup/ResidualApproval';
import AdjustmentSetup from '@/apm/pages/setup/AdjustmentSetup';
import ResidualCalculation from '@/apm/pages/setup/ResidualCalculation';
import MerchantMapping from '@/apm/pages/setup/MerchantMapping';
import UnderwritingSetup from '@/apm/pages/setup/UnderwritingSetup';
import UsersAccess from '@/apm/pages/setup/UsersAccess';
import BannerAds from '@/apm/pages/setup/BannerAds';
import DocumentLibrary from '@/apm/pages/setup/DocumentLibrary';
import TenantConfiguration from '@/apm/pages/setup/TenantConfiguration';

/**
 * APM — ALTERNATIVE PAYMENT METHODS.
 *
 * A second product beside the card-acquiring console: bank-to-bank payments in
 * GBP, with its own participant funnel (PSPs and banks rather than merchants),
 * APP-claim disputes rather than card chargebacks, and its own risk screens.
 *
 * It renders inside the same shell — same rail, topbar and breadcrumbs — but
 * reads exclusively from src/apm, so nothing here moves when the acquiring
 * console's data model changes. Two payment rails with genuinely different
 * vocabulary should not share a data layer; a "participant" here is not a
 * "merchant" there, and collapsing them would make both wrong.
 *
 * Exported as a <Route> subtree so App.jsx nests the lot under /apm without
 * restating seventy paths.
 */
export const apmRoutes = (
  <Route path="apm">
    <Route index element={<Navigate to="/apm/dashboard" replace />} />
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

    <Route path="*" element={<Navigate to="/apm/dashboard" replace />} />
  </Route>
);

export default apmRoutes;
