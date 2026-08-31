import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import BrandProvider from '@/brand/BrandProvider';
import AuthProvider from '@/context/AuthContext';
import ToastProvider from '@/context/ToastContext';
import PreferencesProvider from '@/context/PreferencesContext';
import AppLayout from '@/components/layout/AppLayout';
import RequireAuth from '@/components/layout/RequireAuth';
import { LOGIN_ROUTE, routes } from '@/data/navigation';
import apmRoutes from '@/apm/routes';

import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';

// Participants — the onboarding funnel, one page per stage plus its detail form.
import Invitations from '@/pages/participants/Invitations';
import InvitationDetail from '@/pages/participants/InvitationDetail';
import Applications from '@/pages/participants/Applications';
import ApplicationDetail from '@/pages/participants/ApplicationDetail';
import Underwriting from '@/pages/participants/Underwriting';
import UnderwritingDetail from '@/pages/participants/UnderwritingDetail';
import LiveParticipants from '@/pages/participants/LiveParticipants';
import LiveParticipantDetail from '@/pages/participants/LiveParticipantDetail';
import ParticipantMerchants from '@/pages/participants/ParticipantMerchants';

// Customer Services
import Ert from '@/pages/customer-services/Ert';

// Reports
import MerchantGlobal from '@/pages/reports/MerchantGlobal';
import ProductivityReport from '@/pages/reports/ProductivityReport';

// Residuals
import GeneralLedger from '@/pages/residuals/GeneralLedger';
import FeeAdjustments from '@/pages/residuals/FeeAdjustments';
import AgentPayoutSummary from '@/pages/residuals/AgentPayoutSummary';
import PayoutDetails from '@/pages/residuals/PayoutDetails';
import ParticipantStatus from '@/pages/residuals/ParticipantStatus';
import IncomeExpense from '@/pages/residuals/IncomeExpense';
import PortfolioPayoutDetails from '@/pages/residuals/PortfolioPayoutDetails';

// Disputes
import Disputes from '@/pages/disputes/Disputes';
import DisputeDetail from '@/pages/disputes/DisputeDetail';
import ChargebacksAlerts from '@/pages/disputes/ChargebacksAlerts';

// Risk Management
import Rules from '@/pages/risk/Rules';
import WorkQueue from '@/pages/risk/WorkQueue';
import WorkQueueMerchant from '@/pages/risk/WorkQueueMerchant';
import ActionHistory from '@/pages/risk/ActionHistory';
import UnactionedQueue from '@/pages/risk/UnactionedQueue';

// Transactions
import AchListings from '@/pages/transactions/AchListings';
import Authorizations from '@/pages/transactions/Authorizations';
import Settlements from '@/pages/transactions/Settlements';
import FundingDeposits from '@/pages/transactions/FundingDeposits';
import Qualifications from '@/pages/transactions/Qualifications';
import MerchantReserves from '@/pages/transactions/MerchantReserves';

// Billing
import Statements from '@/pages/billing/Statements';

// Admin
import DocumentCenter from '@/pages/documents/DocumentCenter';
import SetupHome from '@/pages/setup/SetupHome';
import PricingSchedules from '@/pages/setup/PricingSchedules';
import PricingScheduleDetail from '@/pages/setup/PricingScheduleDetail';
import AgentProfiles from '@/pages/setup/AgentProfiles';
import PortfolioSetup from '@/pages/setup/PortfolioSetup';
import ResidualApproval from '@/pages/setup/ResidualApproval';
import AdjustmentSetup from '@/pages/setup/AdjustmentSetup';
import ResidualCalculation from '@/pages/setup/ResidualCalculation';
import FeePrograms from '@/pages/setup/FeePrograms';
import MerchantMapping from '@/pages/setup/MerchantMapping';
import UnderwritingSetup from '@/pages/setup/UnderwritingSetup';
import UsersAccess from '@/pages/setup/UsersAccess';
import BannerAds from '@/pages/setup/BannerAds';
import DocumentLibrary from '@/pages/setup/DocumentLibrary';
import TenantConfiguration from '@/pages/setup/TenantConfiguration';

/**
 * One flat authenticated route tree under AppLayout.
 *
 * The Expedia build nested everything under `/:perspective/*` because a
 * merchant, an acquirer and an issuer each saw a different lens on the same
 * case book. Fi911 has a single operator perspective, so the perspective
 * segment is gone and section paths are literal — which is also what makes
 * the breadcrumb derivable from the URL alone (see data/navigation.js).
 */
export function App() {
  return (
    <BrandProvider>
      <PreferencesProvider>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              <Route path={LOGIN_ROUTE} element={<Login />} />
              <Route path="/" element={<Navigate to={routes.dashboard} replace />} />

              <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
                <Route path="dashboard" element={<Dashboard />} />

                <Route path="merchants">
                  <Route index element={<Navigate to={routes.invitations} replace />} />
                  <Route path="proposals" element={<Invitations />} />
                  <Route path="proposals/:id" element={<InvitationDetail />} />
                  <Route path="contracts" element={<Applications />} />
                  <Route path="contracts/:id" element={<ApplicationDetail />} />
                  <Route path="underwriting" element={<Underwriting />} />
                  <Route path="underwriting/:id" element={<UnderwritingDetail />} />
                  <Route path="live" element={<LiveParticipants />} />
                  <Route path="live/:id" element={<LiveParticipantDetail />} />
                  <Route path="live/:id/locations" element={<ParticipantMerchants />} />
                </Route>

                <Route path="customer-services">
                  <Route index element={<Navigate to={routes.ert} replace />} />
                  <Route path="tickets" element={<Ert />} />
                </Route>

                <Route path="residuals">
                  <Route index element={<Navigate to={routes.generalLedger} replace />} />
                  <Route path="payout-splits" element={<GeneralLedger />} />
                  <Route path="payout-adjustments" element={<FeeAdjustments />} />
                  <Route path="agent-payout-summary" element={<AgentPayoutSummary />} />
                  <Route path="payout-details" element={<PayoutDetails />} />
                  <Route path="merchant-status" element={<ParticipantStatus />} />
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

                <Route path="risk">
                  <Route index element={<Navigate to={routes.workQueue} replace />} />
                  <Route path="work-queue" element={<WorkQueue />} />
                  <Route path="work-queue/:mid" element={<WorkQueueMerchant />} />
                  <Route path="action-history" element={<ActionHistory />} />
                  <Route path="unactioned-queue" element={<UnactionedQueue />} />
                </Route>

                <Route path="transactions">
                  <Route index element={<Navigate to={routes.achListings} replace />} />
                  <Route path="ach-listings" element={<AchListings />} />
                  <Route path="authorizations" element={<Authorizations />} />
                  <Route path="settlements" element={<Settlements />} />
                  <Route path="funding-deposits" element={<FundingDeposits />} />
                  <Route path="qualifications" element={<Qualifications />} />
                  <Route path="merchant-reserves" element={<MerchantReserves />} />
                </Route>

                <Route path="billing">
                  <Route index element={<Navigate to={routes.statements} replace />} />
                  <Route path="statements" element={<Statements />} />
                </Route>

                {/* Alternative payment methods — a second rail. See src/apm/routes.jsx. */}
                {apmRoutes}

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
                  <Route path="fee-programs" element={<FeePrograms />} />
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

                <Route path="*" element={<Navigate to={routes.dashboard} replace />} />
              </Route>

              <Route path="*" element={<Navigate to={routes.dashboard} replace />} />
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
      </PreferencesProvider>
    </BrandProvider>
  );
}

export default App;
