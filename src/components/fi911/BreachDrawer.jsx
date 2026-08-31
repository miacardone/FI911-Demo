import { Drawer, Tooltip } from '@/components/ui/Overlay';
import { Badge, Button } from '@/components/ui/Surface';
import Icon from '@/components/ui/Icon';
import { Money, Muted, SummaryRow, moneyText } from '@/components/fi911/cells';
import { BREACH_STAGES, breachRule, breachStage } from '@/data/compliance';

/**
 * One breach, as a life rather than a status.
 *
 * The timeline is the point. An operator opening this needs to know three
 * things in order: what concluded the merchant is out of compliance, how long
 * they have, and what happens on its own if that runs out. The last one is
 * why the consequence is stated in the future tense and given its own block —
 * it is not a description of the current state, it is what the platform will
 * do without being asked.
 */
export function BreachDrawer({ breach, onClose, onAdvance }) {
  if (!breach) return null;

  const rule = breachRule(breach.ruleId);
  const days = breach.daysRemaining;
  const overdue = breach.stage !== 'resolved' && days < 0;
  const currentIdx = BREACH_STAGES.findIndex((s) => s.id === breach.stage);

  return (
    <Drawer open onClose={onClose} title={breach.merchant} width={470}>
      <div className="stack">
        <div className="ticket__head">
          <Badge tone={breach.stage === 'resolved' ? 'success' : overdue ? 'danger' : 'warning'} dot>
            {breach.stageLabel}
          </Badge>
          <Badge tone="neutral">{breach.category}</Badge>
          <span className="subtle small">MID {breach.mid}</span>
        </div>

        {/* What tripped, in the rule's own words. */}
        <div className="case__block">
          <span className="case__block-title">{rule.label}</span>
          <p className="ticket__body">{rule.help}</p>
        </div>

        <div className="case__stats">
          <span className="case__stat">
            <span className="case__label">Detected</span>
            <strong>{breach.detected}</strong>
            <span className="case__sub">{rule.detectedBy}</span>
          </span>
          <span className="case__stat">
            <span className="case__label">Deadline</span>
            <strong className={overdue ? 'money--neg' : undefined}>{breach.deadline}</strong>
            <span className="case__sub">{rule.windowDays} day window</span>
          </span>
          <span className="case__stat">
            <span className="case__label">Clock</span>
            <strong className={overdue ? 'money--neg' : days <= 7 ? 'warn' : undefined}>
              {breach.stage === 'resolved' ? 'Closed' : overdue ? `${Math.abs(days)}d overdue` : `${days}d left`}
            </strong>
          </span>
          <span className="case__stat">
            <span className="case__label">Held by</span>
            <strong>{breach.owner === '—' ? <Muted>—</Muted> : breach.owner}</strong>
            <span className="case__sub">{breach.assignedTo || 'Unassigned'}</span>
          </span>
        </div>

        {/* The life of the breach. Each step names who holds it, because a
            breach parked in a queue nobody owns is the usual failure. */}
        <div className="case__block">
          <span className="case__block-title">Where this goes</span>
          <ol className="lifecycle">
            {BREACH_STAGES.filter((s) => s.id !== 'resolved' || breach.stage === 'resolved').map((s, i) => {
              const state = breach.stage === 'resolved'
                ? (s.id === 'resolved' ? 'is-current' : 'is-done')
                : i < currentIdx ? 'is-done' : i === currentIdx ? 'is-current' : '';
              return (
                <Tooltip key={s.id} label={s.help}>
                  <li className={`lifecycle__step ${state}`.trim()}>
                    <span className="lifecycle__dot">
                      {state === 'is-done' ? <Icon name="check" size={11} /> : i + 1}
                    </span>
                    <span className="lifecycle__body">
                      <span className="lifecycle__label">{s.label}</span>
                      <span className="lifecycle__owner">{s.owner}</span>
                    </span>
                  </li>
                </Tooltip>
              );
            })}
          </ol>
        </div>

        {/* Stated in the future tense on purpose: this is not the current
            state, it is what the platform does without being asked. */}
        <div className={`consequence ${overdue ? 'is-live' : ''}`.trim()}>
          <span className="case__label">{overdue ? 'Consequence in force' : 'If unresolved'}</span>
          <strong>{rule.consequence}</strong>
          {overdue
            ? <span className="consequence__note">The window closed {Math.abs(days)} days ago.</span>
            : <span className="consequence__note">Applies automatically on {breach.deadline}.</span>}
        </div>

        {(breach.heldAmount > 0 || breach.reservePct > 0) && (
          <div className="case__block">
            <span className="case__block-title">Already applied</span>
            <div className="fi-summary fi-summary--single">
              {breach.heldAmount > 0 && (
                <SummaryRow label="Funds Held"><Money value={breach.heldAmount} /></SummaryRow>
              )}
              {breach.reservePct > 0 && (
                <SummaryRow label="Reserve Raised To">{breach.reservePct}%</SummaryRow>
              )}
            </div>
          </div>
        )}

        <div className="case__block">
          <span className="case__block-title">Record</span>
          <div className="fi-summary fi-summary--single">
            <SummaryRow label="Merchant Notified">{breach.notifiedOn || <Muted>Not yet</Muted>}</SummaryRow>
            <SummaryRow label="Processor">{breach.processor}</SummaryRow>
            <SummaryRow label="Resolved">{breach.resolvedOn || <Muted>Open</Muted>}</SummaryRow>
          </div>
        </div>

        {breach.stage !== 'resolved' && (
          <div className="fi-modal__bar">
            {breach.stage === 'detected' && (
              <Button
                variant="primary" size="sm" icon="mail"
                onClick={() => { onAdvance?.(breach, 'notified', `${breach.merchant} notified — ${rule.windowDays} day window has started.`); onClose(); }}
              >
                Notify merchant
              </Button>
            )}
            <Button
              variant="secondary" size="sm" icon="check"
              onClick={() => { onAdvance?.(breach, 'resolved', `${breach.merchant} is back in good standing.`); onClose(); }}
            >
              Mark resolved
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default BreachDrawer;
