import Icon from '@/components/ui/Icon';
import { Tooltip } from '@/components/ui/Overlay';

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

/**
 * The stepper.
 *
 * Was a row of bordered cards, each carrying a progress ring, a title, a
 * fraction and a state word. Seven of those side by side read as a wall of
 * boxes rather than as progress, and they repeated in three ways what one
 * mark can say: a step is done, current, or not yet.
 *
 * Now a single rail with a marker per step — filled and ticked when complete,
 * ringed when current, hollow when untouched. The fraction moves to a tooltip,
 * where it is available without competing with the label.
 */
function StepMark({ index, state, active }) {
  if (state === 'complete') {
    return (
      <span className={`stepbar__mark stepbar__mark--done ${active ? 'is-active' : ''}`.trim()}>
        <Icon name="check" size={13} />
      </span>
    );
  }
  return (
    <span className={`stepbar__mark stepbar__mark--${state} ${active ? 'is-active' : ''}`.trim()}>
      {index + 1}
    </span>
  );
}

export function StepProgress({ steps, values, current, onSelect, onJumpToField }) {
  return (
    <div className="stepbar" role="tablist" aria-label="Agreement sections">
      <div className="stepbar__rail" aria-hidden />
      {steps.map((step, i) => {
        const { total, done, state, missing } = stepStatus(step, values);
        const active = i === current;
        const hint = total > 0
          ? `${step.label} — ${done} of ${total} required fields complete`
          : step.label;

        return (
          <Tooltip key={step.label} label={hint}>
            <button
              type="button"
              role="tab"
              aria-selected={active}
              aria-label={hint}
              className={`stepbar__step stepbar__step--${state} ${active ? 'is-active' : ''}`.trim()}
              onClick={() => onSelect(i)}
              onDoubleClick={() => (missing.length && onJumpToField ? onJumpToField(missing[0]) : null)}
            >
              <StepMark index={i} state={state} active={active} />
              <span className="stepbar__label">{step.label}</span>
            </button>
          </Tooltip>
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
