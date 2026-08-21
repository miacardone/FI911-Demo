import { Link } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import { Badge } from '@/components/ui/Surface';
import { Popover } from '@/components/ui/Overlay';
import { statusLabel, statusTone, priorityMeta } from '@/domain/statuses';
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
 *  "Lloyds Bank / [30-96-35]", "Ashton & Partners Ltd / MID: 8895…". */
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
  return <Badge tone={tone ?? statusTone(value)}>{statusLabel(value)}</Badge>;
}

/** PSP / Bank / Merchant — the participant Type column. */
export function TypeBadge({ value }) {
  const key = String(value ?? '').toLowerCase();
  const tone = key === 'bank' ? 'success' : key === 'psp' ? 'info' : 'neutral';
  return <Badge tone={tone}>{value}</Badge>;
}

/* ---------- Risk ---------- *
 * A solid triangle, pointing up for elevated risk and down for low. Colour
 * alone would not survive a colour-vision deficiency, so direction carries the
 * same information redundantly. */

export function RiskTriangle({ tier }) {
  const key = String(tier ?? '').toLowerCase();
  const meta = key === 'high' ? { icon: 'triangleUp', cls: 'risk--high', label: 'High risk' }
    : key === 'medium' ? { icon: 'triangleUp', cls: 'risk--medium', label: 'Medium risk' }
    : { icon: 'triangleDown', cls: 'risk--low', label: 'Low risk' };

  return (
    <span className={`risk ${meta.cls}`} title={meta.label}>
      <Icon name={meta.icon} size={13} title={meta.label} />
    </span>
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
  return <span className="tagged-flag" title="Tagged"><Icon name="flag" size={13} title="Tagged" /></span>;
}

/* ---------- Priority ---------- *
 * ERT shows priority as a bare coloured arrow, no text. */

export function PriorityArrow({ value }) {
  const meta = priorityMeta(value);
  return (
    <span className={`priority priority--${meta.tone}`} title={`${meta.label} priority`}>
      <Icon name={meta.direction === 'up' ? 'arrowUp' : 'arrowDown'} size={14} strokeWidth={2.4} title={`${meta.label} priority`} />
    </span>
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
          <Icon name="dots" size={16} />
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
  return (
    <span className={matched ? 'gw gw--yes' : 'gw gw--no'} title={matched ? 'Gateway matched' : 'No gateway match'}>
      <Icon name="thumbsDown" size={14} title={matched ? 'Gateway matched' : 'No gateway match'} />
    </span>
  );
}
