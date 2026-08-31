import { Link } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Surface';
import { Popover, Tooltip } from '@/components/ui/Overlay';
import { statusLabel, statusTone, priorityMeta } from '@/domain/statuses';
import { statusHelp } from '@/domain/columnHelp';
import { formatCurrency } from '@/utils/format';
import brand, { findScheme } from '@/brand/brand.config';

/**
 * SHARED CELL RENDERERS.
 *
 * Every table in this console reuses a handful of cell shapes: a two-line
 * identity cell, money that goes red-in-parentheses when negative, a status
 * badge, a card-scheme chip, a risk triangle. Defining them once means a
 * negative amount looks identical on Funding Category and on Authorizations —
 * in the reference it does not.
 */

/* ---------- Identity ---------- */

/** Primary line plus a muted sub-line. The workhorse of this console:
 *  "Wells Fargo Bank / [121000248]", "Ashton & Partners LLC / MID: 8895…". */
export function TwoLine({ primary, secondary, to }) {
  return (
    <span className="cell-2l">
      {to ? <Link to={to} className="cell-2l__main cell-link">{primary}</Link>
          : <span className="cell-2l__main">{primary}</span>}
      {secondary && <span className="cell-2l__sub">{secondary}</span>}
    </span>
  );
}

export function LinkCell({ to, children, onClick }) {
  if (onClick) {
    return <button type="button" className="cell-link cell-link--btn" onClick={onClick}>{children}</button>;
  }
  return <Link to={to} className="cell-link">{children}</Link>;
}

/* ---------- Money ---------- *
 * A negative is shown in red and parenthesised — accounting convention, and
 * what the reference does on Funding Category, Settlements and Authorizations.
 * The minus sign alone is too easy to miss in a dense grid. */

export function Money({ value, currency = brand.currency, muteZero = false }) {
  const n = Number(value ?? 0);
  if (muteZero && n === 0) return <span className="subtle">{formatCurrency(0, currency)}</span>;
  if (n < 0) {
    return <span className="money money--neg">({formatCurrency(Math.abs(n), currency)})</span>;
  }
  return <span className="money">{formatCurrency(n, currency)}</span>;
}

/** Footer renderer for a summed money column. */
export const moneyTotal = (sum) => <Money value={sum} />;

export const moneyText = (value, currency = brand.currency) => {
  const n = Number(value ?? 0);
  return n < 0 ? `(${formatCurrency(Math.abs(n), currency)})` : formatCurrency(n, currency);
};

/* ---------- Status ---------- */

export function StatusBadge({ value, tone }) {
  if (value == null || value === '') return <span className="subtle">—</span>;

  const badge = <Badge tone={tone ?? statusTone(value)}>{statusLabel(value)}</Badge>;
  /* A status names a state without explaining it. Where we can say what the
     state actually means, the badge says it on hover. */
  const help = statusHelp(value);
  return help ? <Tooltip label={`${statusLabel(value)} — ${help}`}>{badge}</Tooltip> : badge;
}

/**
 * MCC — the four-digit merchant category code.
 *
 * The code alone is unreadable to anyone who has not memorised the list, and
 * the description alone is too wide for a grid. The code shows, the
 * description is on hover — which is also how an underwriter reads it: the
 * number is the identifier, the words are the sanity check.
 */
export function MccCell({ code, label }) {
  if (!code) return <span className="subtle">—</span>;
  return label
    ? <Tooltip label={`MCC ${code} — ${label}`}><span className="mono">{code}</span></Tooltip>
    : <span className="mono">{code}</span>;
}

/** Retail / E-Commerce / MOTO / Services — the merchant Type column. */
const TYPE_HELP = {
  bank: 'A bank participant — holds accounts directly and settles in its own name.',
  psp: 'A payment service provider — settles through a sponsoring bank.',
  merchant: 'A merchant trading under a participant.',
};

export function TypeBadge({ value }) {
  const key = String(value ?? '').toLowerCase();
  const tone = key === 'bank' ? 'success' : key === 'psp' ? 'info' : 'neutral';
  const badge = <Badge tone={tone}>{value}</Badge>;
  return TYPE_HELP[key] ? <Tooltip label={`${value} — ${TYPE_HELP[key]}`}>{badge}</Tooltip> : badge;
}

/* ---------- Risk ---------- *
 * A solid triangle, pointing up for elevated risk and down for low. Color
 * alone would not survive a color-vision deficiency, so direction carries the
 * same information redundantly. */

export function RiskTriangle({ tier }) {
  const key = String(tier ?? '').toLowerCase();
  const meta = key === 'high' ? { icon: 'triangleUp', cls: 'risk--high', label: 'High risk' }
    : key === 'medium' ? { icon: 'triangleUp', cls: 'risk--medium', label: 'Medium risk' }
    : { icon: 'triangleDown', cls: 'risk--low', label: 'Low risk' };

  return (
    <Tooltip label={meta.label}>
      <span className={`risk ${meta.cls}`}>
        <Icon name={meta.icon} size={13} />
      </span>
    </Tooltip>
  );
}

/** Low / Medium / High as a worded badge — Underwriting uses this form. */
export function RiskBadge({ tier }) {
  const key = String(tier ?? '').toLowerCase();
  const tone = key === 'high' ? 'danger' : key === 'medium' ? 'warning' : 'success';
  return <Badge tone={tone}>{statusLabel(tier)}</Badge>;
}

export function TaggedFlag({ on }) {
  if (!on) return null;
  return (
    <Tooltip label="Tagged for review">
      <span className="tagged-flag"><Icon name="flag" size={13} /></span>
    </Tooltip>
  );
}

/* ---------- Priority ---------- *
 * ERT shows priority as a bare colored arrow, no text. */

export function PriorityArrow({ value }) {
  const meta = priorityMeta(value);
  return (
    <Tooltip label={`${meta.label} priority`}>
      <span className={`priority priority--${meta.tone}`}>
        <Icon name={meta.direction === 'up' ? 'arrowUp' : 'arrowDown'} size={14} strokeWidth={2.4} />
      </span>
    </Tooltip>
  );
}

/* ---------- Card scheme ---------- */

export function CardBrand({ scheme }) {
  const meta = findScheme(String(scheme ?? '').toLowerCase());
  const label = meta?.label ?? scheme;
  return (
    <span className="card-brand">
      <span className="card-brand__chip" style={{ background: `var(--c-${(meta?.colorKey ?? 'ink').replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)})` }}>
        {meta?.short ?? '••'}
      </span>
      {label}
    </span>
  );
}

/* ---------- Trend ---------- *
 * Highest Transaction on Live Participants pairs an amount with a direction. */

export function TrendValue({ value, direction = 'up', currency = brand.currency }) {
  const up = direction === 'up';
  return (
    <span className="trend">
      <span className="money">{formatCurrency(value, currency)}</span>
      <Icon name={up ? 'trendUp' : 'trendDown'} size={13} className={up ? 'trend--up' : 'trend--down'} />
    </span>
  );
}

/* ---------- Row menu ---------- *
 * The kebab at the end of an actionable row. Items are
 * `{ label, icon?, tone?, onSelect }`; a `tone: 'danger'` item renders red and
 * is separated, because Delete sitting flush against Notes is a misclick. */

export function RowMenu({ items = [], label = 'Row actions' }) {
  const safe = items.filter(Boolean);
  if (!safe.length) return null;

  return (
    <Popover
      align="right"
      width={188}
      trigger={({ toggle }) => (
        <button type="button" className="row-menu__btn" onClick={(e) => { e.stopPropagation(); toggle(e); }} aria-label={label}>
          <Icon name="dots" size={19} />
        </button>
      )}
    >
      {({ close }) => safe.map((item) => (
        <button
          key={item.label}
          type="button"
          className={`popover__item ${item.tone === 'danger' ? 'popover__item--danger' : ''}`.trim()}
          onClick={(e) => { e.stopPropagation(); close(); item.onSelect?.(); }}
        >
          {item.icon && <Icon name={item.icon} size={14} className="subtle" />}
          {item.label}
        </button>
      ))}
    </Popover>
  );
}

/**
 * The Actions column.
 *
 * PINNED LEFT, immediately after the select checkbox. A row's actions are the
 * first thing you reach for once you have identified the row, and on these
 * grids — some are twenty columns wide — a trailing kebab means scrolling
 * right past everything to act on something you can already see. Pinning also
 * keeps it in the same place on every table regardless of column count.
 */
export const menuColumn = (buildItems) => ({
  key: '__menu',
  header: 'Actions',
  description: 'Row actions available for this record',
  fw: 3,
  width: 68,
  align: 'center',
  searchable: false,
  locked: true,
  pinned: true,
  cell: (row) => <RowMenu items={buildItems(row)} />,
});

/* ---------- Misc ---------- */

export function Muted({ children }) {
  return <span className="subtle">{children ?? '—'}</span>;
}

/** "N/A" in the Parameter 2 column reads as data; italic muted marks it as absent. */
export function NotApplicable() {
  return <span className="na">N/A</span>;
}

export function GatewayMatch({ matched }) {
  const label = matched ? 'Gateway matched' : 'No gateway match';
  return (
    <Tooltip label={label}>
      <span className={matched ? 'gw gw--yes' : 'gw gw--no'}>
        <Icon name="thumbsDown" size={14} />
      </span>
    </Tooltip>
  );
}

/**
 * A label/value pair in a read-only record summary. Lived inside
 * LiveParticipantDetail until the risk merchant profile needed the same
 * pattern; a second copy would have been the moment the two drifted.
 */
export function SummaryRow({ label, children }) {
  return (
    <div className="fi-summary__row">
      <span className="fi-summary__label">{label} :</span>
      <span className="fi-summary__value">{children}</span>
    </div>
  );
}

/**
 * How the merchant got here — bank-boarded or self-service.
 *
 * Worth a badge rather than a plain word because it changes how much of the
 * record can be trusted: a self-service application's figures are the
 * merchant's own until underwriting verifies them.
 */
export function IntakeBadge({ value, verified }) {
  const self = value === 'self';
  return (
    <Tooltip
      label={self
        ? 'Self-service signup — figures are self-declared until verified, identity proven electronically'
        : 'Boarded by the bank or a partner — an agent owns the relationship and underwriting keyed the application'}
    >
      <span className={`intake intake--${self ? 'self' : 'bank'}`}>
        <Icon name={self ? 'globe' : 'users'} size={12} />
        {self ? 'Self-service' : 'Bank-boarded'}
        {self && verified === false && <Icon name="alert" size={11} className="warn" />}
      </span>
    </Tooltip>
  );
}
