import { useMemo } from 'react';
import { Drawer, Tooltip } from '@/components/ui/Overlay';
import { Badge } from '@/components/ui/Surface';
import Icon from '@/components/ui/Icon';
import { Money, Muted, StatusBadge, SummaryRow, moneyText } from '@/components/fi911/cells';
import { approvalRate, partnerMerchants } from '@/data/partners';

/**
 * One partner's book, and what it is worth.
 *
 * The funnel counts come from the real merchant lists rather than a stored
 * number, so what this drawer says a partner has in underwriting is what the
 * Underwriting screen would show if you filtered it to them. A partner
 * dashboard that quietly disagrees with the funnel is worse than none.
 */

const STAGES = ['Proposal', 'Contract', 'Underwriting', 'Live'];

export function PartnerDrawer({ partner, onClose }) {
  const book = useMemo(() => (partner ? partnerMerchants(partner) : []), [partner]);

  if (!partner) return null;

  const byStage = STAGES.map((s) => ({ stage: s, rows: book.filter((r) => r.stage === s) }));
  const bankAbsorbs = partner.chargebackLoss - partner.lossCarried;
  const rate = approvalRate(partner);

  return (
    <Drawer open onClose={onClose} title={partner.name} width={480}>
      <div className="stack">
        <div className="ticket__head">
          <StatusBadge value={partner.status} />
          <Badge tone={partner.tier === 'strategic' ? 'primary' : partner.tier === 'growth' ? 'success' : 'neutral'}>
            {partner.tierLabel}
          </Badge>
          <span className="subtle small">{partner.code}</span>
        </div>

        <div className="case__stats">
          <span className="case__stat">
            <span className="case__label">Monthly volume</span>
            <strong className="case__figure"><Money value={partner.monthlyVolume} /></strong>
          </span>
          <span className="case__stat">
            <span className="case__label">Live merchants</span>
            <strong className="case__figure">{partner.merchants.toLocaleString()}</strong>
          </span>
          <span className="case__stat">
            <span className="case__label">Approval rate</span>
            <strong className={`case__figure ${rate < 70 ? 'warn' : ''}`.trim()}>{rate}%</strong>
            <span className="case__sub">{partner.approvedLast90} in, {partner.declinedLast90} declined · 90d</span>
          </span>
          <span className="case__stat">
            <span className="case__label">Chargeback ratio</span>
            <strong className={`case__figure ${partner.cbRatio >= 1 ? 'money--neg' : ''}`.trim()}>{partner.cbRatio}%</strong>
          </span>
        </div>

        {/* The commercial picture, built up a line at a time so the net is
            arrived at rather than asserted. */}
        <div className="case__block">
          <span className="case__block-title">What this relationship is worth</span>
          <table className="fi-mini-table splittable">
            <tbody>
              <tr>
                <td>Revenue on their book</td>
                <td className="splittable__num"><Money value={partner.grossRevenue} /></td>
              </tr>
              <tr>
                <td>Residual owed to them <span className="splittable__pct">{partner.revenueShare}% share</span></td>
                <td className="splittable__num money--neg">−{moneyText(partner.residualOwed)}</td>
              </tr>
              <tr>
                <td>
                  Chargeback loss the bank absorbs
                  <span className="splittable__pct">
                    {partner.lossShare ? `partner carries ${partner.lossShare}%` : 'partner carries none'}
                  </span>
                </td>
                <td className="splittable__num money--neg">−{moneyText(bankAbsorbs)}</td>
              </tr>
              <tr className="splittable__total">
                <td><strong>Net to the bank</strong></td>
                <td className="splittable__num">
                  <strong className={partner.netToBank < 0 ? 'money--neg' : undefined}>{moneyText(partner.netToBank)}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {partner.netToBank < 0 && (
          <p className="fi-warn">
            <Icon name="alert" size={14} />
            This partner&rsquo;s book costs more than it earns. The residual and the loss they do not
            carry together exceed the revenue their merchants generate.
          </p>
        )}

        {partner.lossShare === 0 && (
          <p className="fi-warn">
            <Icon name="alert" size={14} />
            {partner.name} absorbs none of the chargeback loss from the merchants it introduced.
            Worth raising at renewal.
          </p>
        )}

        {/* Their funnel, counted off the real merchant lists. */}
        <div className="case__block">
          <span className="case__block-title">Their pipeline</span>
          <div className="pfunnel">
            {byStage.map(({ stage, rows }) => (
              <Tooltip key={stage} label={rows.length ? rows.map((r) => r.merchant).slice(0, 6).join(', ') : `Nothing at ${stage.toLowerCase()}`}>
                <span className={`pfunnel__stage ${rows.length ? '' : 'is-empty'}`.trim()}>
                  <strong>{rows.length}</strong>
                  <span>{stage}</span>
                </span>
              </Tooltip>
            ))}
          </div>
          {book.length === 0 && <Muted>No merchants from this partner are in the funnel right now.</Muted>}
        </div>

        <div className="case__block">
          <span className="case__block-title">Relationship</span>
          <div className="fi-summary fi-summary--single">
            <SummaryRow label="Owner">{partner.relationshipOwner}</SummaryRow>
            <SummaryRow label="Partner Since">{partner.since}</SummaryRow>
            <SummaryRow label="Tier">{partner.tierLabel}</SummaryRow>
            <SummaryRow label="Revenue Share">{partner.revenueShare}%</SummaryRow>
            <SummaryRow label="Loss Share">
              {partner.lossShare ? `${partner.lossShare}%` : <Badge tone="danger">None</Badge>}
            </SummaryRow>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default PartnerDrawer;
