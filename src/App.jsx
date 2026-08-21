import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import BrandProvider from '@/brand/BrandProvider';
import AuthProvider from '@/context/AuthContext';
import ToastProvider from '@/context/ToastContext';
import PreferencesProvider from '@/context/PreferencesContext';
import AppLayout from '@/components/layout/AppLayout';
import RequireAuth from '@/components/layout/RequireAuth';
import { LOGIN_ROUTE, routes } from '@/data/navigation';

import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';

// Participants — the onboarding funnel, one page per stage plus its detail form.
import Invitations from '@/pages/participants/Invitations';
import InvitationDetail from '@/pages/participants/InvitationDetail';
import Applications from '@/pages/participants/Applications';
import ApplicationDetail from '@/pages/participants/ApplicationDetail';
import Underwriting from '@/pages/participants/Underwriting';
import UnderwritingDetail from '@/pages/participants/UnderwritingDetail';
import Onboarding from '@/pages/participants/Onboarding';
import OnboardingDetail from '@/pages/participants/OnboardingDetail';
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
import TrendingReport from '@/pages/residuals/TrendingReport';
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
import RiskDashboard from '@/pages/risk/RiskDashboard';
import RiskMerchants from '@/pages/risk/RiskMerchants';
import AlertAction from '@/pages/risk/AlertAction';
import MerchantRiskProfile from '@/pages/risk/MerchantRiskProfile';
import HeldVolume from '@/pages/risk/HeldVolume';
import Rules from '@/pages/risk/Rules';
import WorkQueue from '@/pages/risk/WorkQueue';
import WorkQueueMerchant from '@/pages/risk/WorkQueueMerchant';
import ActionHistory from '@/pages/risk/ActionHistory';
import UnactionedQueue from '@/pages/risk/UnactionedQueue';

// Transactions
import AccountHolder from '@/pages/transactions/AccountHolder';
import Gateway from '@/pages/transactions/Gateway';
import AchListings from '@/pages/transactions/AchListings';
import Authorizations from '@/pages/transactions/Authorizations';
import Settlements from '@/pages/transactions/Settlements';
import FundingCategory from '@/pages/transactions/FundingCategory';
import FundingDeposits from '@/pages/transactions/FundingDeposits';
import Qualifications from '@/pages/transactions/Qualifications';
import MerchantReserves from '@/pages/transactions/MerchantReserves';

// Billing
import Statements from '@/pages/billing/Statements';

// Admin
import DocumentCenter from '@/pages/documents/DocumentCenter';
import Setup from '@/pages/setup/Setup';

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
                <Route path="setup" element={<Setup />} />

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
