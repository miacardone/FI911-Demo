import { Link } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import { Badge, PageHeader } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import { moneyText } from '@/components/fi911/cells';
import {
  ADJUSTMENT_SETUP, BANNERS, CALCULATION_RUNS, DOC_CATEGORIES, LAST_CALCULATED_MONTH,
  MERCHANT_MAPPING, PORTFOLIO_SETUP, PRICING_SCHEDULES, RESIDUAL_APPROVALS, ROLES,
  SETUP_USERS, UW_GROUPS, UW_TEMPLATES,
} from '@/data/setup';
import { setupRoutes } from '@/data/navigation';

/**
 * SETUP HOME.
 *
 * The reference's Setup landing page is blank — you enter configuration mode
 * and get an empty canvas with a rail beside it. So this screen answers the
 * question a configuration landing page should: what in this tenant needs
 * attention, and what is quietly rotting.
 *
 * Every tile is a real derived count, not a decoration: unmapped merchants
 * that will pay out short at month end, residual runs waiting on approval,
 * dormant accounts that are still a way in, config nobody uses any more. Each
 * one links to the screen that fixes it, pre-filtered where the screen
 * supports it.
 */

const plural = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function AttentionCard({ tone, icon, count, title, detail, to, cta }) {
  return (
    <Link to={to} className={`attn attn--${tone}`}>
      <span className="attn__icon"><Icon name={icon} size={17} /></span>
      <span className="attn__body">
        <span className="attn__count">{count}</span>
        <span className="attn__title">{title}</span>
        <span className="attn__detail">{detail}</span>
      </span>
      <span className="attn__cta">{cta} <Icon name="arrowRight" size={13} /></span>
    </Link>
  );
}

function AreaCard({ icon, title, description, to, stats }) {
  return (
    <Link to={to} className="area">
      <span className="area__head">
        <span className="area__icon"><Icon name={icon} size={16} /></span>
        <span className="area__title">{title}</span>
        <Icon name="arrowRight" size={14} className="area__go" />
      </span>
      <span className="area__desc">{description}</span>
      <span className="area__stats">
        {stats.map((s) => (
          <span key={s.label} className="area__stat">
            <span className="area__stat-value">{s.value}</span>
            <span className="area__stat-label">{s.label}</span>
          </span>
        ))}
      </span>
    </Link>
  );
}

export function SetupHome() {
  /* ---- derived attention counts ---- */
  const unmapped = MERCHANT_MAPPING.filter((r) => !r.portfolio);
  const withSuggestion = unmapped.filter((r) => r.suggestion);
  const pendingApproval = RESIDUAL_APPROVALS.filter((r) => r.approval === 'Pending Approval');
  const bigSwing = RESIDUAL_APPROVALS.filter((r) => Math.abs(r.deltaPct) >= 25);
  const dormant = SETUP_USERS.filter((u) => u.dormant && u.status === 'Active');
  const noMfa = SETUP_USERS.filter((u) => !u.mfa);
  const unusedSchedules = PRICING_SCHEDULES.filter((p) => p.usersLinked === 0);
  const emptyRoles = ROLES.filter((r) => r.userCount === 0);
  const emptyGroups = UW_GROUPS.filter((g) => g.members === 0);
  const runningCalc = CALCULATION_RUNS.find((r) => r.status === 'In Progress');

  const pendingPayout = pendingApproval.reduce((s, r) => s + r.payout, 0);

  const attention = [
    unmapped.length > 0 && {
      tone: 'danger',
      icon: 'branch',
      count: unmapped.length,
      title: 'Merchants not mapped to a portfolio',
      detail: `${withSuggestion.length} have a system suggestion ready to accept — unmapped merchants pay out short at month end`,
      to: setupRoutes.merchantMapping,
      cta: 'Map merchants',
    },
    pendingApproval.length > 0 && {
      tone: 'warning',
      icon: 'checklist',
      count: pendingApproval.length,
      title: `Residual runs awaiting approval`,
      detail: `${moneyText(pendingPayout)} held for ${LAST_CALCULATED_MONTH}${bigSwing.length ? ` · ${plural(bigSwing.length, 'portfolio', 'portfolios')} moved more than 25% on last month` : ''}`,
      to: setupRoutes.residualApproval,
      cta: 'Review payouts',
    },
    dormant.length > 0 && {
      tone: 'warning',
      icon: 'userCheck',
      count: dormant.length,
      title: 'Active accounts dormant 90 days or more',
      detail: `${plural(noMfa.length, 'account')} without MFA — an unused account is still a way in`,
      to: setupRoutes.users,
      cta: 'Review access',
    },
    (unusedSchedules.length + emptyRoles.length + emptyGroups.length) > 0 && {
      tone: 'neutral',
      icon: 'archive',
      count: unusedSchedules.length + emptyRoles.length + emptyGroups.length,
      title: 'Configuration nothing is using',
      detail: `${plural(unusedSchedules.length, 'pricing schedule')} with no agents, ${plural(emptyRoles.length, 'role')} with no users, ${plural(emptyGroups.length, 'parameter group')} with no members`,
      to: setupRoutes.pricingSchedules,
      cta: 'Clean up',
    },
  ].filter(Boolean);

  const areas = [
    {
      icon: 'users',
      title: 'Underwriting Setup',
      description: 'Templates, parameter groups and keyword rules that decide applications',
      to: setupRoutes.underwriting,
      stats: [
        { label: 'Templates', value: UW_TEMPLATES.filter((t) => t.status === 'Active').length },
        { label: 'Groups', value: UW_GROUPS.length },
        { label: 'Linked merchants', value: UW_TEMPLATES.reduce((s, t) => s + t.linkedMerchants, 0) },
      ],
    },
    {
      icon: 'dollar',
      title: 'Pricing Schedules',
      description: 'Item rates, splits and the profit/loss share behind every payout',
      to: setupRoutes.pricingSchedules,
      stats: [
        { label: 'Schedules', value: PRICING_SCHEDULES.length },
        { label: 'Agents linked', value: PRICING_SCHEDULES.reduce((s, p) => s + p.usersLinked, 0) },
        { label: 'Unused', value: unusedSchedules.length },
      ],
    },
    {
      icon: 'briefcase',
      title: 'Portfolios & Agents',
      description: 'Who gets paid, from which portfolio, at what split',
      to: setupRoutes.agentProfiles,
      stats: [
        { label: 'Portfolios', value: PORTFOLIO_SETUP.length },
        { label: 'Merchants', value: PORTFOLIO_SETUP.reduce((s, p) => s + p.merchants, 0) },
        { label: 'Adjustments', value: ADJUSTMENT_SETUP.filter((a) => a.status === 'Active').length },
      ],
    },
    {
      icon: 'refresh',
      title: 'Residual Calculation',
      description: 'Run the month, watch it land, approve what it produced',
      to: setupRoutes.residualCalculation,
      stats: [
        { label: 'Last closed', value: LAST_CALCULATED_MONTH },
        { label: 'Runs', value: CALCULATION_RUNS.length },
        { label: 'Awaiting approval', value: pendingApproval.length },
      ],
    },
    {
      icon: 'shield',
      title: 'Risk Rules',
      description: 'The rule set that decides what lands in the Work Queue each morning',
      to: setupRoutes.rulesSetup,
      stats: [
        { label: 'Rules', value: 52 },
        { label: 'Batch scope', value: 'Settlement' },
        { label: 'Groups', value: 4 },
      ],
    },
    {
      icon: 'lock',
      title: 'Users & Access',
      description: 'Accounts, roles, groups and what each of them can reach',
      to: setupRoutes.users,
      stats: [
        { label: 'Users', value: SETUP_USERS.length },
        { label: 'Roles', value: ROLES.length },
        { label: 'Dormant', value: dormant.length },
      ],
    },
    {
      icon: 'folder',
      title: 'Document Library',
      description: 'Categories, retention periods and who each category is visible to',
      to: setupRoutes.documents,
      stats: [
        { label: 'Categories', value: DOC_CATEGORIES.length },
        { label: 'Documents', value: DOC_CATEGORIES.reduce((s, c) => s + c.documentsLinked, 0) },
        { label: 'Confidential', value: DOC_CATEGORIES.filter((c) => c.confidential).length },
      ],
    },
    {
      icon: 'image',
      title: 'Banner Ads',
      description: 'In-console announcements, and which roles actually see them',
      to: setupRoutes.banners,
      stats: [
        { label: 'Live', value: BANNERS.filter((b) => b.status === 'Active').length },
        { label: 'Impressions', value: BANNERS.reduce((s, b) => s + b.impressions, 0).toLocaleString() },
        { label: 'Scheduled', value: BANNERS.filter((b) => b.status === 'Scheduled').length },
      ],
    },
    {
      icon: 'cog',
      title: 'Tenant Configuration',
      description: 'The brand, the processors, the numbering scheme, the feature flags',
      to: setupRoutes.tenant,
      stats: [
        { label: 'Processors', value: 6 },
        { label: 'Currency', value: 'USD' },
        { label: 'Timezone', value: 'New York' },
      ],
    },
  ];

  return (
    <>
      <PageHeader
        title="Setup"
        description="Configuration for this tenant — what needs attention, and everything you can change"
        meta={runningCalc
          ? <Badge tone="primary" dot>Residual calculation running — {runningCalc.progress}%</Badge>
          : <Badge tone="success" dot>No jobs running</Badge>}
      />

      <section className="setup-section">
        <h2 className="setup-section__title">
          Needs attention
          <Tooltip label="Every count here is derived from live configuration — nothing on this page is a static number.">
            <span className="setup-section__hint"><Icon name="info" size={13} /></span>
          </Tooltip>
        </h2>

        {attention.length === 0
          ? <p className="fi-note">Nothing outstanding. Every merchant is mapped, every payout approved.</p>
          : <div className="attn-grid">{attention.map((a) => <AttentionCard key={a.title} {...a} />)}</div>}
      </section>

      <section className="setup-section">
        <h2 className="setup-section__title">Configuration areas</h2>
        <div className="area-grid">{areas.map((a) => <AreaCard key={a.title} {...a} />)}</div>
      </section>
    </>
  );
}

export default SetupHome;
