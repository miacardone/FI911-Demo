import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Badge, Button } from '@/components/ui/Surface';
import { SelectField, TextField } from '@/components/ui/Form';
import { Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import { Muted, moneyText } from '@/components/fi911/cells';
import {
  FEE_BASES, FEE_SCOPES, FEE_SEGMENTS, NOTICE_PERIODS, feeBasis, projectRevenue, splitOf,
} from '@/data/fees';
import { PARTNERS } from '@/data/reference';
import { AGENTS, CURRENT_USER } from '@/data/people';
import brand from '@/brand/brand.config';

/**
 * Introducing a fee, as the sequence of decisions it actually is.
 *
 * Four steps, because each one changes what the next is worth answering:
 * what it charges on, who it lands on, how it splits, and when it starts.
 * A single form with eleven fields would let you publish a fee that bills
 * 2,000 merchants tomorrow with no notice and no idea what it earns.
 *
 * The projection recalculates on every keystroke and sits under the step you
 * are on, because the reason to build this as a wizard rather than a form is
 * to let someone see a number move before they commit to it.
 */

const STEPS = ['Basis', 'Reach', 'Split', 'Timing'];

const REACH_DEFAULTS = { all: 1_840, portfolio: 420, partner: 260, segment: 140 };

export function FeeWizard({ open, onClose, onPublish }) {
  const [step, setStep] = useState(0);
  const [v, setV] = useState({});

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setV({
      name: '', basis: 'monthly', amount: '', scope: 'all',
      portfolio: '', partner: '', segment: '', agent: '',
      bankShare: 60, partnerShare: 25, agentShare: 15,
      bankLoss: 85, partnerLoss: 0, agentLoss: 15,
      noticeDays: 30, effectiveDate: '', publish: 'Scheduled',
    });
  }, [open]);

  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));
  const setNum = (k) => (e) => setV((s) => ({ ...s, [k]: Number(e.target.value) || 0 }));

  const merchants = REACH_DEFAULTS[v.scope] ?? 0;
  const revenue = useMemo(
    () => projectRevenue({ basis: v.basis, amount: v.amount, merchants }),
    [v.basis, v.amount, merchants],
  );

  const revenueTotal = (v.bankShare ?? 0) + (v.partnerShare ?? 0) + (v.agentShare ?? 0);
  const lossTotal = (v.bankLoss ?? 0) + (v.partnerLoss ?? 0) + (v.agentLoss ?? 0);
  const splitsValid = revenueTotal === 100 && lossTotal === 100;

  const canAdvance = step === 0 ? Boolean(v.name?.trim()) && Number(v.amount) > 0
    : step === 2 ? splitsValid
      : true;

  const publish = () => {
    const status = v.publish;
    onPublish?.({
      id: `fee-new-${Date.now().toString().slice(-6)}`,
      name: v.name.trim(),
      basis: v.basis,
      amount: Number(v.amount),
      scope: v.scope,
      portfolio: v.scope === 'portfolio' ? v.portfolio : '',
      partner: v.scope === 'partner' ? v.partner : (v.partnerShare > 0 ? v.partner : ''),
      segment: v.scope === 'segment' ? v.segment : '',
      agent: v.agentShare > 0 ? v.agent : '',
      merchants,
      status,
      effectiveDate: status === 'Draft' ? '' : (v.effectiveDate || brand.today.replace(/-/g, '/')),
      noticeDays: Number(v.noticeDays),
      bankShare: v.bankShare, partnerShare: v.partnerShare, agentShare: v.agentShare,
      bankLoss: v.bankLoss, partnerLoss: v.partnerLoss, agentLoss: v.agentLoss,
      monthlyLoss: Math.round(revenue * 0.18),
      introducedBy: CURRENT_USER.name,
      created: brand.today.replace(/-/g, '/'),
    });
    onClose();
  };

  const basis = feeBasis(v.basis);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Introduce a fee"
      size="lg"
      footer={(
        <>
          <Button variant="secondary" onClick={step === 0 ? onClose : () => setStep((s) => s - 1)}>
            {step === 0 ? 'Cancel' : 'Back'}
          </Button>
          {step < STEPS.length - 1
            ? <Button variant="primary" iconAfter="arrowRight" disabled={!canAdvance} onClick={() => setStep((s) => s + 1)}>Next: {STEPS[step + 1]}</Button>
            : <Button variant="primary" icon="check" onClick={publish}>{v.publish === 'Draft' ? 'Save draft' : v.publish === 'Live' ? 'Publish now' : 'Schedule fee'}</Button>}
        </>
      )}
    >
      <div className="stack">
        <div className="feewiz__steps">
          {STEPS.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`feewiz__step ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`.trim()}
              onClick={() => i < step && setStep(i)}
            >
              <span className="feewiz__num">{i < step ? <Icon name="check" size={12} /> : i + 1}</span>
              {label}
            </button>
          ))}
        </div>

        {step === 0 && (
          <div className="fi-fields">
            <div className="fi-fields__full">
              <TextField label="Fee Name" required value={v.name} placeholder="Monthly Account Maintenance" onChange={set('name')} />
            </div>
            <SelectField
              label="Charged On"
              value={v.basis}
              onChange={set('basis')}
              options={FEE_BASES.map((b) => ({ value: b.id, label: b.label }))}
              hint={basis.help}
            />
            <TextField
              label={v.basis === 'percent' ? 'Percentage' : 'Amount'}
              required
              type="number"
              value={v.amount}
              placeholder={v.basis === 'percent' ? '0.15' : '9.95'}
              onChange={set('amount')}
            />
          </div>
        )}

        {step === 1 && (
          <div className="fi-fields">
            <SelectField
              label="Applies To"
              value={v.scope}
              onChange={set('scope')}
              options={FEE_SCOPES.map((s) => ({ value: s.id, label: s.label }))}
            />
            {v.scope === 'portfolio' && (
              <SelectField label="Portfolio" value={v.portfolio} onChange={set('portfolio')} placeholder="Choose a portfolio…"
                options={['Stewardship Technology Inc', 'Advantage Payment Solutions', 'Versatile Merchant Solutions'].map((x) => ({ value: x, label: x }))} />
            )}
            {v.scope === 'partner' && (
              <SelectField label="Partner" value={v.partner} onChange={set('partner')} placeholder="Choose a partner…"
                options={PARTNERS.map((p) => ({ value: p.name, label: p.name }))} />
            )}
            {v.scope === 'segment' && (
              <SelectField label="Segment" value={v.segment} onChange={set('segment')} placeholder="Choose a segment…"
                options={FEE_SEGMENTS.map((x) => ({ value: x, label: x }))} />
            )}
          </div>
        )}

        {step === 2 && (
          <div className="stack">
            <p className="fi-note">
              Revenue and loss are set separately on purpose. A partner on 25% of the revenue and 0% of the
              loss is a different deal from one on 25% of both — and only one of them is being paid to
              introduce risk it does not carry.
            </p>
            <div className="splitgrid">
              <div className="splitgrid__col">
                <span className="t-section-label">Revenue share</span>
                <TextField label={brand.legalName} type="number" value={v.bankShare} onChange={setNum('bankShare')} />
                <TextField label="Partner" type="number" value={v.partnerShare} onChange={setNum('partnerShare')} />
                <TextField label="Agent" type="number" value={v.agentShare} onChange={setNum('agentShare')} />
                <span className={`splitgrid__total ${revenueTotal === 100 ? 'is-ok' : 'is-bad'}`}>
                  {revenueTotal}% {revenueTotal === 100 ? 'allocated' : '— must total 100%'}
                </span>
              </div>
              <div className="splitgrid__col">
                <span className="t-section-label">Chargeback loss share</span>
                <TextField label={brand.legalName} type="number" value={v.bankLoss} onChange={setNum('bankLoss')} />
                <TextField label="Partner" type="number" value={v.partnerLoss} onChange={setNum('partnerLoss')} />
                <TextField label="Agent" type="number" value={v.agentLoss} onChange={setNum('agentLoss')} />
                <span className={`splitgrid__total ${lossTotal === 100 ? 'is-ok' : 'is-bad'}`}>
                  {lossTotal}% {lossTotal === 100 ? 'allocated' : '— must total 100%'}
                </span>
              </div>
            </div>
            {v.partnerShare > 0 && v.partnerLoss === 0 && (
              <p className="fi-warn">
                <Icon name="alert" size={14} />
                This partner earns {v.partnerShare}% of the fee and absorbs none of the chargeback loss.
              </p>
            )}
            {(v.partnerShare > 0 || v.scope === 'partner') && (
              <SelectField label="Partner" value={v.partner} onChange={set('partner')} placeholder="Choose a partner…"
                options={PARTNERS.map((p) => ({ value: p.name, label: p.name }))} />
            )}
            {v.agentShare > 0 && (
              <SelectField label="Agent" value={v.agent} onChange={set('agent')} placeholder="House account"
                options={AGENTS.map((a) => ({ value: a, label: a }))} />
            )}
          </div>
        )}

        {step === 3 && (
          <div className="fi-fields">
            <TextField label="Effective Date" type="date" value={v.effectiveDate} onChange={set('effectiveDate')} />
            <SelectField
              label="Notice Period"
              value={String(v.noticeDays)}
              onChange={setNum('noticeDays')}
              options={NOTICE_PERIODS.map((d) => ({ value: String(d), label: d === 0 ? 'No notice' : `${d} days` }))}
              hint="Most card agreements oblige the acquirer to give merchants time to leave before a new fee applies."
            />
            <SelectField
              label="Publish As"
              value={v.publish}
              onChange={set('publish')}
              options={[
                { value: 'Draft', label: 'Draft — not billing' },
                { value: 'Scheduled', label: 'Scheduled — bills from the effective date' },
                { value: 'Live', label: 'Live — bills next cycle' },
              ]}
            />
            {Number(v.noticeDays) === 0 && v.publish !== 'Draft' && (
              <div className="fi-fields__full">
                <p className="fi-warn">
                  <Icon name="alert" size={14} />
                  No notice period. {merchants.toLocaleString()} merchants would see this on their next statement with no warning.
                </p>
              </div>
            )}
          </div>
        )}

        {/* The projection follows you through every step — the reason to build
            this as a wizard is to watch the number move before committing. */}
        <div className="feewiz__projection">
          <span className="feewiz__proj-item">
            <span className="case__label">Reaches</span>
            <strong>{merchants.toLocaleString()} merchants</strong>
          </span>
          <span className="feewiz__proj-item">
            <span className="case__label">Projected monthly</span>
            <strong>{Number(v.amount) > 0 ? moneyText(revenue) : <Muted>—</Muted>}</strong>
          </span>
          <span className="feewiz__proj-item">
            <span className="case__label">{brand.legalName} keeps</span>
            <strong>{Number(v.amount) > 0 ? moneyText(splitOf(revenue, v.bankShare)) : <Muted>—</Muted>}</strong>
          </span>
          <span className="feewiz__proj-item">
            <span className="case__label">Partner earns</span>
            <strong>{Number(v.amount) > 0 ? moneyText(splitOf(revenue, v.partnerShare)) : <Muted>—</Muted>}</strong>
          </span>
          <Tooltip label="Annualised from the monthly projection. Fee decisions are argued in annual terms.">
            <span className="feewiz__proj-item feewiz__proj-item--year">
              <span className="case__label">Per year</span>
              <strong>{Number(v.amount) > 0 ? moneyText(revenue * 12) : <Muted>—</Muted>}</strong>
            </span>
          </Tooltip>
        </div>
      </div>
    </Modal>
  );
}

export default FeeWizard;
