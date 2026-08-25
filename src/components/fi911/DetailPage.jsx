import { Fragment, createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import { Badge, Button } from '@/components/ui/Surface';
import { CheckboxRow, RadioRow, SelectField, TextAreaField, TextField, ToggleField } from '@/components/ui/Form';
import { useToast } from '@/context/ToastContext';
import StepProgress, { overallProgress } from '@/components/fi911/StepProgress';

/**
 * THE DETAIL PAGE SHELL.
 *
 * The participant funnel has five detail screens (Invitation, Application,
 * Underwriting, Onboarding, Live) and they are all the same object: a header
 * with a back arrow, title, sub-line and an action cluster; a stack of
 * collapsible sections holding a two-column field grid; and a sticky footer
 * with Discard Changes / Save Changes.
 *
 * The footer is sticky rather than living at the very bottom of a 2,000px
 * form on purpose. In the reference you have to scroll to the end of the
 * Pricing table to reach Save, which means editing one field near the top is
 * a scroll-to-commit. Keeping it docked is the one deliberate departure from
 * the screenshots, and it costs nothing visually because it only appears once
 * the form is dirty.
 */

/* ---------- Section ---------- */

/**
 * Broadcast channel for Expand all / Collapse all.
 *
 * A counter rather than a boolean: sections keep their own open state so you
 * can still open one section inside a collapsed form, and a bare boolean would
 * fight that every time the parent re-rendered. Bumping the counter is an
 * event ("everyone go to this state now"), not a value to stay in sync with.
 */
const SectionBroadcast = createContext(null);

export function SectionStack({ children, allOpen = true }) {
  const [signal, setSignal] = useState({ n: 0, open: allOpen });
  const value = { signal, setAll: (open) => setSignal((s) => ({ n: s.n + 1, open })) };
  return <SectionBroadcast.Provider value={value}>{children}</SectionBroadcast.Provider>;
}

export function useSectionControls() {
  return useContext(SectionBroadcast);
}

export function Section({ title, children, collapsible = true, defaultOpen = true, underline = false, actions, columns = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const broadcast = useContext(SectionBroadcast);
  const signal = broadcast?.signal;

  useEffect(() => {
    if (signal && signal.n > 0) setOpen(signal.open);
  }, [signal]);

  return (
    <section className={`fi-section ${columns ? 'fi-section--columns' : ''}`.trim()}>
      <header className="fi-section__head">
        {collapsible ? (
          <button type="button" className="fi-section__toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
            <span className={`fi-section__title ${underline ? 'is-underlined' : ''}`.trim()}>{title}</span>
            <Icon name="chevronDown" size={16} className={`fi-section__chevron ${open ? 'is-open' : ''}`.trim()} />
          </button>
        ) : (
          <span className={`fi-section__title ${underline ? 'is-underlined' : ''}`.trim()}>{title}</span>
        )}
        {actions && <div className="fi-section__actions">{actions}</div>}
      </header>
      {open && <div className="fi-section__body">{children}</div>}
    </section>
  );
}

/** Two-column field grid — the default layout inside every section. */
/**
 * `columns` is the NARROW-screen count; wide screens get one more, because a
 * two-column form on a 1440px display wastes half its width and pays for it in
 * height. A page that genuinely needs a fixed count passes `wide` explicitly.
 */
export function FieldGrid({ children, columns = 2, wide }) {
  return (
    <div
      className="fi-fields"
      style={{ '--fi-field-cols': columns, '--fi-field-cols-wide': wide ?? Math.min(columns + 1, 4) }}
    >
      {children}
    </div>
  );
}

/** A field that should span the whole grid row (Business Description, Address). */
export function FullRow({ children }) {
  return <div className="fi-fields__full">{children}</div>;
}

/**
 * Binds a field to a form-state object so a detail page reads as a list of
 * fields rather than a list of onChange handlers.
 */
export function useForm(initial) {
  const [values, setValues] = useState(initial ?? {});
  const [dirty, setDirty] = useState(false);

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setDirty(true);
  };

  const reset = (next) => {
    setValues(next ?? initial ?? {});
    setDirty(false);
  };

  /** Spread onto a TextField/SelectField/TextAreaField. */
  const field = (name, label, extra = {}) => ({
    label,
    value: values[name] ?? '',
    onChange: (e) => set(name, e.target.value),
    ...extra,
  });

  const toggle = (name, label, extra = {}) => ({
    label,
    checked: Boolean(values[name]),
    onChange: (v) => set(name, typeof v === 'boolean' ? v : v?.target?.checked),
    ...extra,
  });

  return { values, set, reset, dirty, setDirty, field, toggle };
}

/* ---------- Checkbox / toggle groups ---------- *
 * "Nature of Business" is a wall of these: a question, then a two-column list
 * of options. Rendering them from a list keeps the two columns balanced and
 * stops the markup from being 40 hand-written CheckboxRows. */

export function CheckGroup({ label, options, values = [], onChange }) {
  const toggle = (opt) => {
    const next = values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt];
    onChange?.(next);
  };

  return (
    <div className="fi-checkgroup">
      {label && <span className="fi-checkgroup__label">{label}</span>}
      <div className="fi-checkgroup__grid">
        {options.map((opt) => (
          <CheckboxRow key={opt} label={opt} checked={values.includes(opt)} onChange={() => toggle(opt)} />
        ))}
      </div>
    </div>
  );
}

export function RadioGroup({ label, name, options, value, onChange }) {
  return (
    <div className="fi-checkgroup">
      {label && <span className="fi-checkgroup__label">{label}</span>}
      <div className="fi-checkgroup__stack">
        {options.map((opt) => (
          <RadioRow key={opt} name={name} label={opt} value={opt} checked={value === opt} onChange={() => onChange?.(opt)} />
        ))}
      </div>
    </div>
  );
}

/** A full-width question with the switch pushed to the right margin. */
export function ToggleRow({ label, checked, onChange, indent = false }) {
  return (
    <div className={`fi-toggle-row ${indent ? 'is-indent' : ''}`.trim()}>
      <ToggleField label={label} checked={checked} onChange={onChange} />
    </div>
  );
}

/* ---------- Repeating blocks ---------- *
 * Bank Accounts, Individuals, Terminals, Owners, Equipment and Fees are all
 * "a titled card, repeated, with Add and (sometimes) Delete". */

export function RepeatBlock({ title, onRemove, children }) {
  return (
    <div className="fi-repeat">
      <header className="fi-repeat__head">
        <span className="fi-repeat__title">{title}</span>
        {onRemove && (
          <button type="button" className="fi-repeat__remove" onClick={onRemove} aria-label={`Remove ${title}`}>
            <Icon name="trash" size={15} />
          </button>
        )}
      </header>
      {children}
    </div>
  );
}

export function AddButton({ children, onClick }) {
  return <Button variant="secondary" size="sm" icon="plus" onClick={onClick}>{children}</Button>;
}

/* ---------- Wizard ---------- *
 * The long agreement forms are 8–12 sections and ~3,000px of scroll. Splitting
 * them into steps is what makes them usable — but the reference shows only a
 * numbered strip, which leaves no obvious way forward. Real Previous / Next
 * controls carry you through; the strip stays clickable so you can still jump
 * straight to Pricing without walking the whole form.
 *
 * The steps are NAVIGATION, not a submission flow: the record already exists,
 * so nothing gates on completing the previous step. */

export function WizardSteps({ steps, current, onSelect }) {
  return (
    <nav className="fi-steps" aria-label="Form sections">
      {steps.map((step, i) => (
        <Fragment key={step.label}>
          <button
            type="button"
            className={`fi-step ${i === current ? 'is-active' : i < current ? 'is-done' : ''}`.trim()}
            onClick={() => onSelect(i)}
            aria-current={i === current ? 'step' : undefined}
          >
            <span className="fi-step__dot">{i < current ? <Icon name="check" size={12} strokeWidth={3} /> : i + 1}</span>
            <span className="fi-step__label">{step.label}</span>
          </button>
          {i < steps.length - 1 && <span className="fi-step__line" />}
        </Fragment>
      ))}
    </nav>
  );
}

export function WizardNav({ steps, current, onChange }) {
  const atStart = current === 0;
  const atEnd = current === steps.length - 1;

  return (
    <div className="fi-wizard-nav">
      <Button variant="secondary" icon="arrowLeft" disabled={atStart} onClick={() => onChange(current - 1)}>
        Previous
      </Button>
      <span className="fi-wizard-nav__pos">
        Step <strong>{current + 1}</strong> of <strong>{steps.length}</strong>
        <span className="fi-wizard-nav__name">{steps[current]?.label}</span>
      </span>
      <Button variant="primary" iconAfter="arrowRight" disabled={atEnd} onClick={() => onChange(current + 1)}>
        Next
      </Button>
    </div>
  );
}

/* ---------- Page shell ---------- */

function ExpandAllButton() {
  const ctrl = useSectionControls();
  const [expanded, setExpanded] = useState(true);
  if (!ctrl) return null;

  return (
    <Button
      variant="secondary"
      size="sm"
      icon={expanded ? 'chevronsUpDown' : 'chevronsUpDown'}
      onClick={() => { ctrl.setAll(!expanded); setExpanded((v) => !v); }}
    >
      {expanded ? 'Collapse all' : 'Expand all'}
    </Button>
  );
}

export function DetailPage({
  title,
  subtitle,
  badge,
  onBack,
  actions,
  headerIcons = [],
  dirty,
  onSave,
  onDiscard,
  children,
  /** `[{ label, render, fields?, required? }]` — turns the page into a wizard.
   *  Declaring `fields`/`required` also enables per-section completion. */
  steps,
  /** The form's live values, so completion is measured rather than stored. */
  values,
  summary,
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const [step, setStep] = useState(0);
  /* The record summary is reference: useful when you arrive, in the way once
     you are working a step. It was 220px of permanently-on chrome above a
     632px viewport, so it starts collapsed on a wizard and open on a plain
     detail page, where there is nothing else competing for the height. */
  const [summaryOpen, setSummaryOpen] = useState(!steps);

  const goToStep = (i) => {
    setStep(i);
    /* Land at the top of the new step rather than mid-form. */
    document.querySelector('.shell__content')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* Focus the first unfilled field of the current step. Fields are matched by
     their label text because the form primitives generate their own ids —
     tagging every input with a data attribute just for this would be a lot of
     plumbing for one affordance. */
  const jumpToField = (key) => {
    const label = String(key)
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (c) => c.toUpperCase())
      .trim()
      .toLowerCase();

    const nodes = Array.from(document.querySelectorAll('.fi-detail__body .field'));
    const hit = nodes.find((n) => n.querySelector('.field__label')?.textContent?.toLowerCase().startsWith(label.slice(0, 12)));
    const input = hit?.querySelector('input, select, textarea');
    if (input) {
      input.scrollIntoView({ block: 'center', behavior: 'smooth' });
      input.focus({ preventScroll: true });
    }
  };

  const progress = steps && values ? overallProgress(steps, values) : null;

  const save = () => {
    onSave?.();
    toast.notify('Changes saved.');
  };

  return (
    <SectionStack>
    <div className="fi-detail">
      <header className="fi-detail__head">
        <button type="button" className="fi-detail__back" onClick={() => (onBack ? onBack() : navigate(-1))} aria-label="Back">
          <Icon name="arrowLeft" size={18} />
        </button>

        <div className="fi-detail__titles">
          {badge && <Badge tone={badge.tone ?? 'success'}>{badge.label}</Badge>}
          <h1 className="fi-detail__title">{title}</h1>
          {subtitle && <p className="fi-detail__sub">{subtitle}</p>}
          {progress && progress.total > 0 && (
            <p className="fi-detail__progress">
              <strong>{progress.done}</strong> of <strong>{progress.total}</strong> required fields complete
            </p>
          )}
        </div>

        <div className="fi-detail__actions">
          {!steps && <ExpandAllButton />}
          {actions}
          {headerIcons.map((it) => (
            <button key={it.label} type="button" className="fi-detail__icon" onClick={it.onSelect} aria-label={it.label} title={it.label}>
              <Icon name={it.icon} size={17} />
            </button>
          ))}
        </div>
      </header>

      {summary && (
        <div className={`fi-detail__summary ${summaryOpen ? 'is-open' : ''}`.trim()}>
          <button
            type="button"
            className="fi-detail__summary-toggle"
            onClick={() => setSummaryOpen((v) => !v)}
            aria-expanded={summaryOpen}
          >
            <Icon name="chevron" size={14} className={summaryOpen ? 'is-open' : ''} />
            {summaryOpen ? 'Hide record details' : 'Show record details'}
          </button>
          {summaryOpen && summary}
        </div>
      )}

      {steps ? (
        <>
          {values
            ? (
              <StepProgress
                steps={steps}
                values={values}
                current={step}
                onSelect={goToStep}
                onJumpToField={jumpToField}
              />
            )
            : <WizardSteps steps={steps} current={step} onSelect={goToStep} />}
          <div className="fi-detail__body">{steps[step]?.render()}</div>
          <WizardNav steps={steps} current={step} onChange={goToStep} />
        </>
      ) : (
        <div className="fi-detail__body">{children}</div>
      )}

      {dirty && (
        <footer className="fi-detail__foot">
          <Button variant="secondary" onClick={onDiscard}>Discard Changes</Button>
          <Button variant="primary" onClick={save}>Save Changes</Button>
        </footer>
      )}
    </div>
    </SectionStack>
  );
}

/* Re-exported so a detail page imports fields from one place. */
export { SelectField, TextAreaField, TextField, ToggleField, CheckboxRow, RadioRow };

export default DetailPage;
