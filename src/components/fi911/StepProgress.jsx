import Icon from '@/components/ui/Icon';

/**
 * PER-SECTION COMPLETION for the agreement wizards.
 *
 * The reference product shows a row of cards reading "Business Information
 * 10/10 COMPLETED", "Banking & Individual Information 1/19 IN PROGRESS",
 * "Pricing 0/1 NOT STARTED". That is genuinely useful — a processing
 * agreement is long and you need to know what is still outstanding — but it
 * stops at telling you. Three things are added here:
 *
 *   · The counts are DERIVED from the live form values, not stored. A field
 *     that gets filled updates its section immediately; the reference's
 *     counts only move when the record is saved.
 *   · A progress ring, so the state is readable without parsing "1/19".
 *   · The card is a button that jumps to the step, and an incomplete card
 *     offers "go to first missing field" — the reference makes you hunt.
 *
 * A step declares which form keys it owns via `fields`, and optionally which
 * of those are `required`. Completion is measured against required fields
 * when a step declares them, because a section is not "incomplete" merely
 * because an optional field is blank.
 */

const isFilled = (v) => {
  if (v == null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'boolean') return true;
  return String(v).trim() !== '';
};

/** Completion stats for one step against a form's values. */
export function stepStatus(step, values) {
  const keys = step.required?.length ? step.required : (step.fields ?? []);
  if (!keys.length) return { total: 0, done: 0, state: 'none', missing: [] };

  const missing = keys.filter((k) => !isFilled(values[k]));
  const done = keys.length - missing.length;
  const state = done === 0 ? 'not_started' : done === keys.length ? 'complete' : 'in_progress';
  return { total: keys.length, done, state, missing };
}

const LABEL = {
  complete: 'Completed',
  in_progress: 'In Progress',
  not_started: 'Not Started',
  none: '',
};

function Ring({ done, total, state }) {
  const pct = total ? done / total : 0;
  const r = 13;
  const circumference = 2 * Math.PI * r;

  return (
    <svg width="32" height="32" viewBox="0 0 32 32" className={`step-ring step-ring--${state}`} aria-hidden>
      <circle cx="16" cy="16" r={r} className="step-ring__track" />
      <circle
        cx="16" cy="16" r={r}
        className="step-ring__value"
        strokeDasharray={`${pct * circumference} ${circumference}`}
        transform="rotate(-90 16 16)"
      />
      {state === 'complete'
        ? <path d="M11 16.2l3.2 3.2L21 12.6" className="step-ring__tick" />
        : <text x="16" y="19.5" textAnchor="middle" className="step-ring__text">{done}</text>}
    </svg>
  );
}

export function StepProgress({ steps, values, current, onSelect, onJumpToField }) {
  return (
    <div className="step-cards" role="tablist" aria-label="Agreement sections">
      {steps.map((step, i) => {
        const { total, done, state, missing } = stepStatus(step, values);
        const active = i === current;

        return (
          <button
            key={step.label}
            type="button"
            role="tab"
            aria-selected={active}
            className={`step-card step-card--${state} ${active ? 'is-active' : ''}`.trim()}
            onClick={() => onSelect(i)}
          >
            <Ring done={done} total={total} state={state} />

            <span className="step-card__text">
              <span className="step-card__title">{step.label}</span>
              <span className="step-card__meta">
                {total > 0 && <span className="step-card__count">{done}/{total}</span>}
                <span className="step-card__state">{LABEL[state]}</span>
              </span>
            </span>

            {/* Only offer the jump when there is somewhere to jump to and the
                user is already looking at this step — otherwise selecting the
                step is the more obvious action. */}
            {active && missing.length > 0 && onJumpToField && (
              <span
                className="step-card__jump"
                role="button"
                tabIndex={0}
                title={`Go to first missing field (${missing.length} remaining)`}
                onClick={(e) => { e.stopPropagation(); onJumpToField(missing[0]); }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onJumpToField(missing[0]); } }}
              >
                <Icon name="arrowRight" size={14} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Overall completion across every step — drives the header summary. */
export function overallProgress(steps, values) {
  return steps.reduce((acc, s) => {
    const { total, done } = stepStatus(s, values);
    return { total: acc.total + total, done: acc.done + done };
  }, { total: 0, done: 0 });
}

export default StepProgress;
