import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { Popover, Tooltip } from '@/components/ui/Overlay';
import { ALERT_CODES, alertCode } from '@/data/riskQueue';

/**
 * RISK ALERT CODES.
 *
 * The reference prints these as flat three-letter badges — "● AAT ● ABT ● AMV
 * more" — with every meaning buried in one shared legend that you have to
 * hover a specific "more" link to see. Two problems: the badge itself tells
 * you nothing, and the legend disappears the moment you move the mouse toward
 * the row you were reading about.
 *
 * Here each badge carries its own meaning on hover, and its dot is coloured by
 * severity, so a row with three high-severity alerts LOOKS different from a
 * row with three low ones without reading a single code. The full legend is
 * still available, but as a pinned toolbar panel you can leave open while you
 * work the queue rather than a tooltip that vanishes.
 */

export function AlertBadge({ code }) {
  const meta = alertCode(code);
  return (
    <Tooltip label={`${meta.code} — ${meta.label}`}>
      <span className={`acode acode--${meta.severity}`}>
        <span className="acode__dot" />
        {meta.code}
      </span>
    </Tooltip>
  );
}

/**
 * A row's codes, capped so one noisy merchant cannot blow the column width
 * open. The overflow is a popover listing the rest in full, not another
 * abbreviation.
 */
export function AlertBadges({ codes = [], max = 3, empty = null }) {
  if (!codes.length) return empty;

  const shown = codes.slice(0, max);
  const rest = codes.slice(max);

  return (
    <span className="acodes">
      {shown.map((c) => <AlertBadge key={c} code={c} />)}
      {rest.length > 0 && (
        <Popover
          align="left"
          width={252}
          trigger={({ toggle }) => (
            <button type="button" className="acode acode--more" onClick={(e) => { e.stopPropagation(); toggle(e); }}>
              +{rest.length}
            </button>
          )}
        >
          {() => (
            <div className="acode-list">
              {rest.map((c) => {
                const meta = alertCode(c);
                return (
                  <span key={c} className="acode-list__row">
                    <span className={`acode acode--${meta.severity}`}><span className="acode__dot" />{meta.code}</span>
                    <span className="acode-list__label">{meta.label}</span>
                  </span>
                );
              })}
            </div>
          )}
        </Popover>
      )}
    </span>
  );
}

/** The full key, grouped by what the rule actually evaluates. */
export function AlertLegend({ onClose }) {
  const groups = [
    { id: 'batch', label: 'Batch alerts — evaluated across a whole settlement batch' },
    { id: 'trans', label: 'Transaction alerts — evaluated on a single transaction' },
  ];

  return (
    <div className="alert-legend">
      <div className="alert-legend__head">
        <span className="alert-legend__title">Alert code key</span>
        {onClose && (
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Hide key">
            <Icon name="close" size={14} />
          </button>
        )}
      </div>

      {groups.map((g) => (
        <div key={g.id} className="alert-legend__group">
          <span className="alert-legend__group-label">{g.label}</span>
          <div className="alert-legend__grid">
            {ALERT_CODES.filter((a) => a.scope === g.id).map((a) => (
              <span key={a.code} className="alert-legend__item">
                <span className={`acode acode--${a.severity}`}><span className="acode__dot" />{a.code}</span>
                <span className="alert-legend__text">{a.label}</span>
              </span>
            ))}
          </div>
        </div>
      ))}

      <span className="alert-legend__foot">
        Dot colour is severity — <span className="acode acode--high"><span className="acode__dot" />high</span>
        <span className="acode acode--medium"><span className="acode__dot" />medium</span>
        <span className="acode acode--low"><span className="acode__dot" />low</span>
      </span>
    </div>
  );
}

/** Toolbar button + the panel it toggles. */
export function useAlertLegend() {
  const [open, setOpen] = useState(false);
  return {
    open,
    button: (
      <button
        type="button"
        className={`btn btn--secondary btn--sm ${open ? 'is-active' : ''}`.trim()}
        onClick={() => setOpen((v) => !v)}
      >
        <Icon name="help" size={14} /> Alert key
      </button>
    ),
    panel: open ? <AlertLegend onClose={() => setOpen(false)} /> : null,
  };
}

export default AlertBadges;
