import { Drawer, Tooltip } from '@/components/ui/Overlay';
import { Badge } from '@/components/ui/Surface';
import Icon from '@/components/ui/Icon';
import { Money, Muted, StatusBadge, SummaryRow } from '@/components/fi911/cells';
import { feeBasis, feeRevenue, splitLines } from '@/data/fees';
import { moneyText } from '@/components/fi911/cells';

/**
 * One fee, followed all the way down: what it earns, who it pays, and who
 * absorbs the loss from the same merchants.
 *
 * The two halves are deliberately the same shape and stacked, so the eye
 * compares them row by row. That is what makes an asymmetric deal obvious —
 * the partner line is long on top and empty underneath.
 */
export function FeeSplitPanel({ fee, onClose }) {
  if (!fee) return null;

  const revenue = feeRevenue(fee);
  const lines = splitLines(fee, revenue, fee.monthlyLoss);
  const basis = feeBasis(fee.basis);
  const net = lines.map((l) => ({ ...l, net: l.revenue - l.loss }));

  const target = fee.scope === 'all' ? 'Every merchant'
    : fee.scope === 'portfolio' ? fee.portfolio
      : fee.scope === 'partner' ? fee.partner
        : fee.segment;

  return (
    <Drawer open onClose={onClose} title={fee.name} width={460}>
      <div className="stack">
        <div className="ticket__head">
          <StatusBadge value={fee.status} />
          <Badge tone="neutral">{basis.label}</Badge>
          {fee.noticeDays === 0 && <Badge tone="danger" dot>No notice</Badge>}
        </div>

        <div className="case__stats">
          <span className="case__stat">
            <span className="case__label">Charge</span>
            <strong className="case__figure">{fee.basis === 'percent' ? `${fee.amount}%` : moneyText(fee.amount)}</strong>
            <span className="case__sub">{basis.unit}</span>
          </span>
          <span className="case__stat">
            <span className="case__label">Reaches</span>
            <strong className="case__figure">{fee.merchants.toLocaleString()}</strong>
            <span className="case__sub">{target}</span>
          </span>
          <span className="case__stat">
            <span className="case__label">Monthly revenue</span>
            <strong className="case__figure"><Money value={revenue} /></strong>
          </span>
          <span className="case__stat">
            <span className="case__label">Monthly loss</span>
            <strong className="case__figure"><Money value={fee.monthlyLoss} /></strong>
          </span>
        </div>

        <div className="case__block">
          <span className="case__block-title">Where the money goes</span>
          <table className="fi-mini-table splittable">
            <thead>
              <tr><th>Party</th><th>Revenue</th><th>Loss</th><th>Net</th></tr>
            </thead>
            <tbody>
              {net.map((l) => (
                <tr key={l.party}>
                  <td>
                    <span className="cell-2l">
                      <span className="cell-2l__main">{l.party}</span>
                      <span className="cell-2l__sub">{l.who}</span>
                    </span>
                  </td>
                  <td className="splittable__num">
                    <Money value={l.revenue} />
                    <span className="splittable__pct">{l.revenueShare}%</span>
                  </td>
                  <td className="splittable__num">
                    {l.loss ? <Money value={l.loss} /> : <Muted>—</Muted>}
                    <span className="splittable__pct">{l.lossShare}%</span>
                  </td>
                  <td className="splittable__num">
                    <strong className={l.net < 0 ? 'money--neg' : undefined}>{moneyText(l.net)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {fee.partnerShare > 0 && fee.partnerLoss === 0 && (
          <p className="fi-warn">
            <Icon name="alert" size={14} />
            {fee.partner || 'This partner'} earns {fee.partnerShare}% of the fee and absorbs none of the
            chargeback loss from the merchants it introduced. Worth raising at renewal.
          </p>
        )}

        <div className="case__block">
          <span className="case__block-title">Where it shows up</span>
          <div className="fi-summary fi-summary--single">
            <SummaryRow label="Residuals">
              The partner and agent shares appear on next month&rsquo;s payout statement
            </SummaryRow>
            <SummaryRow label="Risk">
              Loss shares are charged back through fee adjustments in the same cycle
            </SummaryRow>
            <SummaryRow label="Merchant">
              Billed on the statement dated after {fee.effectiveDate || 'the effective date'}
            </SummaryRow>
            <SummaryRow label="Notice">
              {fee.noticeDays ? `${fee.noticeDays} days` : <Badge tone="danger">None given</Badge>}
            </SummaryRow>
            <SummaryRow label="Introduced By">{fee.introducedBy}</SummaryRow>
          </div>
        </div>
      </div>
    </Drawer>
  );
}

export default FeeSplitPanel;
