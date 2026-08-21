import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import { Badge, Button } from '@/components/ui/Surface';
import { CheckboxRow, RadioRow, SelectField, TextAreaField, TextField, ToggleField } from '@/components/ui/Form';
import { useToast } from '@/context/ToastContext';

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

export function Section({ title, children, collapsible = true, defaultOpen = true, underline = false, actions }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="fi-section">
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
export function FieldGrid({ children, columns = 2 }) {
  return <div className="fi-fields" style={{ '--fi-field-cols': columns }}>{children}</div>;
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

/* ---------- Page shell ---------- */

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
}) {
  const navigate = useNavigate();
  const toast = useToast();

  const save = () => {
    onSave?.();
    toast.notify('Changes saved.');
  };

  return (
    <div className="fi-detail">
      <header className="fi-detail__head">
        <button type="button" className="fi-detail__back" onClick={() => (onBack ? onBack() : navigate(-1))} aria-label="Back">
          <Icon name="arrowLeft" size={18} />
        </button>

        <div className="fi-detail__titles">
          {badge && <Badge tone={badge.tone ?? 'success'}>{badge.label}</Badge>}
          <h1 className="fi-detail__title">{title}</h1>
          {subtitle && <p className="fi-detail__sub">{subtitle}</p>}
        </div>

        <div className="fi-detail__actions">
          {actions}
          {headerIcons.map((it) => (
            <button key={it.label} type="button" className="fi-detail__icon" onClick={it.onSelect} aria-label={it.label} title={it.label}>
              <Icon name={it.icon} size={17} />
            </button>
          ))}
        </div>
      </header>

      <div className="fi-detail__body">{children}</div>

      {dirty && (
        <footer className="fi-detail__foot">
          <Button variant="secondary" onClick={onDiscard}>Discard Changes</Button>
          <Button variant="primary" onClick={save}>Save Changes</Button>
        </footer>
      )}
    </div>
  );
}

/* Re-exported so a detail page imports fields from one place. */
export { SelectField, TextAreaField, TextField, ToggleField, CheckboxRow, RadioRow };

export default DetailPage;
