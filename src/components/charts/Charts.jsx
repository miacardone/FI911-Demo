import { useLayoutEffect, useRef, useState } from 'react';
import useElementWidth from '@/hooks/useElementWidth';
import { formatAxis, formatNumber } from '@/utils/format';

/**
 * Hand-rolled inline SVG charts — no charting library.
 *
 * Every chart draws into a viewBox that matches its measured pixel width, so
 * one SVG unit is one CSS pixel. Nothing is scaled: a chart asked for 260px is
 * 260px, and an 11px label is 11px. (The earlier fixed 680-unit viewBox scaled
 * the whole drawing ~1.7× inside a wide card, which is what made everything
 * look oversized.)
 *
 * Mark specs: thin marks, a 2px surface gap between stacked segments, 4px
 * rounded corners on the data end only, 2px lines, a marker only on the hovered
 * point, and a recessive grid. One y-axis, never two.
 */

const seriesColor = (i) => `var(--c-series-${i % 5})`;

/**
 * A "nice" y-scale: a top value and a step both landing on 1, 2, 2.5 or 5
 * times a power of ten.
 *
 * The previous version rounded the maximum up to a power of ten and then
 * divided by three, which is how an axis ends up reading 66,666,667 and
 * 133,333,333 — arithmetically correct and unreadable. Ticks people can
 * actually place have to fall on round numbers, which means choosing the
 * STEP first and letting it decide the top of the scale.
 */
function niceScale(max, targetTicks = 4) {
  const safe = Math.max(1, max);
  const rough = safe / targetTicks;
  const mag = 10 ** Math.floor(Math.log10(rough));
  const norm = rough / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const top = Math.ceil(safe / step) * step;
  const ticks = [];
  for (let v = 0; v <= top + step / 2; v += step) ticks.push(v);
  return { top, step, ticks };
}

/**
 * Fit an axis label to the space available.
 *
 * Blunt truncation is fine for words and useless for dates: a week of
 * "2026/08/15 … 2026/08/20" all cut to "2026/08/…" prints the same label six
 * times. A date sheds its least useful part first — the year, then the month —
 * so what survives is what distinguishes one tick from the next.
 */
function fitLabel(value, chars) {
  const str = String(value);
  if (str.length <= chars) return str;

  const date = str.match(/^(\d{4})[/-](\d{2})[/-](\d{2})$/);
  if (date) {
    const [, , mm, dd] = date;
    if (chars >= 5) return `${mm}/${dd}`;
    return dd;
  }

  /* Mon-YYYY sheds its century before its month. */
  const month = str.match(/^([A-Za-z]{3})-(\d{4})$/);
  if (month) {
    const [, mon, yyyy] = month;
    if (chars >= 6) return `${mon} '${yyyy.slice(2)}`;
    return mon;
  }

  return `${str.slice(0, Math.max(1, chars - 1))}…`;
}

/**
 * A tick at either end of the axis is centred on a point that sits ON the plot
 * edge, so half the label hangs outside the chart and gets clipped by the
 * card. Anchoring the first tick to its start and the last to its end keeps
 * both inside the box without moving the tick itself.
 *
 * The catch: an anchored end tick grows INWARD, so it can collide with its
 * neighbour where a centred one would not. That is what `axisLabels` below is
 * for — with the redundant year gone there is room for both.
 */
const anchorAt = (i, count) => (i === 0 ? 'start' : i === count - 1 ? 'end' : 'middle');

/**
 * Strip whatever every tick on the axis has in common.
 *
 * A week of daily ticks all carry the same year, so printing it six times adds
 * no information and costs four characters per label — which is the difference
 * between "2026/08/15 2026/08/16" colliding and "08/15 08/16" sitting apart.
 * The same applies to a run of months inside one year.
 *
 * Only strips when EVERY label agrees, so a series spanning a year boundary
 * keeps its years and stays unambiguous.
 */
function axisLabels(values) {
  const strs = values.map((v) => String(v ?? ''));
  const dated = strs.every((v) => /^\d{4}[/-]\d{2}[/-]\d{2}$/.test(v));
  if (dated) {
    const years = new Set(strs.map((v) => v.slice(0, 4)));
    if (years.size === 1) return strs.map((v) => v.slice(5));
  }
  const monthly = strs.every((v) => /^[A-Za-z]{3}-\d{4}$/.test(v));
  if (monthly) {
    const years = new Set(strs.map((v) => v.slice(-4)));
    if (years.size === 1) return strs.map((v) => v.slice(0, 3));
  }
  return strs;
}

/** Axis ticks: at most this many, so a 28-day series does not print 28 labels. */
const maxTicks = (width) => Math.max(4, Math.floor(width / 90));

/* ---------- Legend ---------- */

export function Legend({ items, className = '' }) {
  return (
    <ul className={`legend ${className}`.trim()} style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {items.map((it, i) => (
        <li key={`${it.label ?? 'series'}-${i}`} className="legend__item">
          <span className="legend__swatch" style={{ background: it.color }} />
          {it.label}
          {it.value != null && <span className="mono strong" style={{ marginLeft: 4 }}>{it.value}</span>}
        </li>
      ))}
    </ul>
  );
}

/* ---------- Stacked / grouped bar ---------- */

export function BarChart({
  data, series, xKey = 'period', height = 260,
  xLabel, yLabel, formatValue = formatNumber, legend = true,
  /** Side-by-side bars instead of one stack. The onboarding funnel and the
   *  year-over-year comparison both compare series AGAINST each other, and a
   *  stack answers "what is the total" — the wrong question for both. */
  grouped = false,
}) {
  const [ref, W] = useElementWidth();
  const [hover, setHover] = useState(null);

  const H = height;
  const PAD = { top: 8, right: 6, bottom: xLabel ? 34 : 20, left: yLabel ? 46 : 34 };
  const plotW = Math.max(W - PAD.left - PAD.right, 10);
  const plotH = Math.max(H - PAD.top - PAD.bottom, 10);

  const totals = grouped
    ? data.flatMap((row) => series.map((x) => row[x.key] ?? 0))
    : data.map((row) => series.reduce((s, x) => s + (row[x.key] ?? 0), 0));
  const max = Math.max(1, ...totals);
  const scale = niceScale(max, 4);
  const niceMax = scale.top;

  const slot = plotW / Math.max(data.length, 1);
  const groupW = Math.min(46, slot * 0.62);
  const barW = grouped ? Math.max(3, groupW / series.length) : groupW;
  const y = (v) => PAD.top + plotH - (v / niceMax) * plotH;

  /* A CATEGORICAL axis must never drop a label — a five-bar funnel that
     prints "Invitations, Underwriting, Live Participants" has silently hidden
     two of its five stages. Short series always label every bar and truncate
     the text to its slot; only long time series thin their ticks out. */
  const categorical = data.length <= 8;
  const labelEvery = categorical ? 1 : Math.max(1, Math.ceil(data.length / maxTicks(plotW)));
  const labelChars = Math.max(4, Math.floor(slot / 6.2));
  const clip = (t) => (categorical ? fitLabel(t, labelChars) : String(t));
  const xLabels = axisLabels(data.map((d) => d[xKey] ?? d.period));

  return (
    <div className="chart-frame" ref={ref}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`${yLabel ?? 'Value'} by ${xLabel ?? 'period'}`}>
        {scale.ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className="chart__grid" />
            <text x={PAD.left - 6} y={y(v) + 3.5} className="chart__axis" textAnchor="end">
              {formatAxis(v)}
              <title>{formatNumber(Math.round(v))}</title>
            </text>
          </g>
        ))}

        {data.map((row, i) => {
          const bandW = grouped ? barW * series.length : barW;
          const x = PAD.left + slot * i + (slot - bandW) / 2;
          let cursor = 0;
          return (
            <g key={row[xKey]} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
              <rect x={PAD.left + slot * i} y={PAD.top} width={slot} height={plotH} fill="transparent" />
              {series.map((s, si) => {
                const v = row[s.key] ?? 0;
                if (!v) return null;
                const segH = (v / niceMax) * plotH;
                const top = grouped ? PAD.top + plotH - segH : PAD.top + plotH - cursor - segH;
                if (!grouped) cursor += segH;
                const isTop = grouped || series.slice(si + 1).every((rest) => !(row[rest.key] ?? 0));
                return (
                  <rect
                    key={s.key}
                    x={grouped ? x + barW * si : x}
                    y={top}
                    width={grouped ? Math.max(barW - 1.5, 2) : barW}
                    height={Math.max(segH - 2, 1)}
                    rx={isTop ? 3 : 0}
                    fill={s.color ?? seriesColor(si)}
                    opacity={hover == null || hover === i ? 1 : 0.42}
                    style={{ transition: 'opacity 120ms var(--ease)' }}
                  >
                    <title>{`${row[xKey]} · ${(s.name ?? s.label)}: ${formatValue(v)}`}</title>
                  </rect>
                );
              })}
              {i % labelEvery === 0 && (
                <text x={PAD.left + slot * i + slot / 2} y={H - (xLabel ? 20 : 6)} className="chart__axis" textAnchor="middle">
                  {clip(xLabels[i])}
                  <title>{row[xKey]}</title>
                </text>
              )}
            </g>
          );
        })}

        <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} className="chart__baseline" />

        {xLabel && <text x={PAD.left + plotW / 2} y={H - 4} className="chart__axis-title" textAnchor="middle">{xLabel}</text>}
        {yLabel && (
          <text transform={`rotate(-90 11 ${PAD.top + plotH / 2})`} x={11} y={PAD.top + plotH / 2} className="chart__axis-title" textAnchor="middle">{yLabel}</text>
        )}
      </svg>

      {hover != null && (
        <div className="tooltip" style={{ position: 'absolute', left: PAD.left + slot * hover + slot / 2, top: 2, transform: 'translate(-50%,0)' }}>
          <span className="tooltip__title">{data[hover][xKey]}</span>
          {series.map((s, si) => (
            <div key={s.key} className="row row--between row--nowrap" style={{ gap: 10 }}>
              <span className="row row--xtight row--nowrap">
                <span className="legend__swatch" style={{ background: s.color ?? seriesColor(si) }} />{(s.name ?? s.label)}
              </span>
              <span className="mono strong">{formatValue(data[hover][s.key] ?? 0)}</span>
            </div>
          ))}
        </div>
      )}

      {legend && series.length > 1 && (
        <Legend items={series.map((s, i) => ({ label: (s.name ?? s.label), color: s.color ?? seriesColor(i) }))} />
      )}
    </div>
  );
}

/* ---------- Area ---------- */

export function AreaChart({
  data, valueKey = 'value', xKey = 'period', height = 200,
  xLabel, yLabel, color = 'var(--c-series-0)', formatValue = formatNumber,
}) {
  const [ref, W] = useElementWidth();
  const [hover, setHover] = useState(null);

  const H = height;
  const PAD = { top: 8, right: 8, bottom: xLabel ? 34 : 20, left: yLabel ? 46 : 34 };
  const plotW = Math.max(W - PAD.left - PAD.right, 10);
  const plotH = Math.max(H - PAD.top - PAD.bottom, 10);

  const max = Math.max(1, ...data.map((d) => d[valueKey] ?? 0));
  const scale = niceScale(max, 4);
  const niceMax = scale.top;

  const x = (i) => PAD.left + (data.length <= 1 ? plotW / 2 : (plotW / (data.length - 1)) * i);
  const y = (v) => PAD.top + plotH - (v / niceMax) * plotH;

  const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d[valueKey] ?? 0)}`).join(' ');
  const area = data.length ? `${line} L${x(data.length - 1)},${PAD.top + plotH} L${x(0)},${PAD.top + plotH} Z` : '';
  const gid = `area-${valueKey}-${data.length}`;
  /* A CATEGORICAL axis must never drop a label — a five-bar funnel that
     prints "Invitations, Underwriting, Live Participants" has silently hidden
     two of its five stages. Short series always label every bar and truncate
     the text to its slot; only long time series thin their ticks out. */
  const categorical = data.length <= 8;
  const labelEvery = categorical ? 1 : Math.max(1, Math.ceil(data.length / maxTicks(plotW)));
  const labelChars = Math.max(4, Math.floor((plotW / Math.max(data.length, 1)) / 6.2));
  const clip = (t) => (categorical ? fitLabel(t, labelChars) : String(t));
  const xLabels = axisLabels(data.map((d) => d[xKey] ?? d.period));

  return (
    <div className="chart-frame" ref={ref}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`${yLabel ?? 'Value'} over time`} onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {scale.ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className="chart__grid" />
            <text x={PAD.left - 6} y={y(v) + 3.5} className="chart__axis" textAnchor="end">
              {formatAxis(v)}
              <title>{formatNumber(Math.round(v))}</title>
            </text>
          </g>
        ))}

        {area && <path d={area} fill={`url(#${gid})`} />}
        {line && <path d={line} className="chart__line" stroke={color} />}

        {hover != null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} stroke="var(--c-line-strong)" strokeDasharray="3 3" />
            <circle cx={x(hover)} cy={y(data[hover][valueKey] ?? 0)} r="4" fill={color} className="chart__dot" />
          </g>
        )}

        {data.map((d, i) => (
          <rect
            key={`hit-${d[xKey]}-${i}`}
            x={x(i) - plotW / Math.max(data.length, 1) / 2}
            y={PAD.top}
            width={plotW / Math.max(data.length, 1)}
            height={plotH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}

        {data.map((d, i) => (i % labelEvery === 0 ? (
          <text key={`lbl-${d[xKey]}-${i}`} x={x(i)} y={H - (xLabel ? 20 : 6)} className="chart__axis" textAnchor={anchorAt(i, data.length)}>
            {clip(xLabels[i])}
            <title>{d[xKey]}</title>
          </text>
        ) : null))}

        <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} className="chart__baseline" />

        {xLabel && <text x={PAD.left + plotW / 2} y={H - 4} className="chart__axis-title" textAnchor="middle">{xLabel}</text>}
        {yLabel && (
          <text transform={`rotate(-90 11 ${PAD.top + plotH / 2})`} x={11} y={PAD.top + plotH / 2} className="chart__axis-title" textAnchor="middle">{yLabel}</text>
        )}
      </svg>

      {hover != null && (
        <div className="tooltip" style={{ position: 'absolute', left: x(hover), top: 2, transform: 'translate(-50%,0)' }}>
          <span className="tooltip__title">{data[hover][xKey]}</span>
          <span className="mono">{formatValue(data[hover][valueKey] ?? 0)}</span>
        </div>
      )}
    </div>
  );
}

/* ---------- Donut ---------- */

/**
 * One stroked circle per slice using dasharray, which makes the 2px surface gap
 * between slices trivial. Center carries the total; a dot legend sits beneath.
 */
/** `variant="pie"` is the same arc math with thickness widened to fill the
 *  full radius (a stroke from the center to the edge), center text hidden. */
export function Donut({
  data, centerValue, centerLabel, size = 170, thickness = 22,
  legend = true, colorOffset = 0, formatValue = formatNumber, variant = 'donut',
  /** Print each slice's COUNT on the slice itself. A percentage tells you the
   *  shape but never the size — "20%" of what? The number is the answer, and
   *  the share is one hover away. Slices under 6% are skipped: a four-digit
   *  number does not fit an arc that thin and would collide with its
   *  neighbor. */
  arcLabels = false,
}) {
  if (variant === 'pie') thickness = size / 2;
  const [hover, setHover] = useState(null);

  const total = data.reduce((s, d) => s + d.value, 0);
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;
  const c = size / 2;
  const GAP = 2;

  let offset = 0;
  const arcs = data.map((d, i) => {
    const fraction = total ? d.value / total : 0;
    const length = Math.max(fraction * circumference - GAP, 0);
    const arc = {
      ...d,
      length,
      offset,
      fraction,
      color: d.color ?? (d.other ? 'var(--c-series-neutral)' : seriesColor(i + colorOffset)),
    };
    offset += fraction * circumference;
    return arc;
  });

  const active = hover != null ? arcs[hover] : null;

  /* The center answers "what is the headline here". A total is the wrong
     headline for a breakdown — every slice already sums to it. The LARGEST
     slice is the thing worth reading first, so that is what sits in the hole,
     with its name underneath in smaller type. Hovering swaps in whichever
     slice is under the cursor. */
  const biggest = arcs.reduce((best, a) => (a.value > (best?.value ?? -1) ? a : best), null);
  const focus = active ?? biggest;

  /* The centre label has to live inside the HOLE, not the ring. "Fraud — Card
     Not Present" ran straight through the doughnut and out the other side, so
     it is measured against the hole's width and truncated to fit. The full
     text is on hover. */
  const holeWidth = Math.max(size - thickness * 2 - 10, 24);
  const centreChars = Math.max(6, Math.floor(holeWidth / 4.6));
  const fitCentre = (t) => {
    const str = String(t ?? '');
    return str.length > centreChars ? `${str.slice(0, centreChars - 1)}…` : str;
  };

  /* Tooltip sits beside the doughnut, not on it — it used to cover the very
     numbers it was explaining. Placing it by the slice's own angle sent it
     diagonally out of the card, so it hugs the LEFT edge of the ring instead,
     level with the slice, and only flips right when the card is too close to
     the window edge for the card to fit on the left. */
  const tipRef = useRef(null);
  const tipElRef = useRef(null);
  const [tipSide, setTipSide] = useState('left');

  /**
   * Which side of the ring the hover card sits on.
   *
   * Two earlier attempts failed for instructive reasons. Placing it at the
   * slice's own angle sent it diagonally off the card. Clamping it back inside
   * the page pushed it straight back over the doughnut — when there is no room
   * on the left, "stay inside" and "stay off the ring" are contradictory
   * instructions.
   *
   * So the side is CHOSEN, once, from the card's measured width against the
   * space actually available either side. Left is preferred because that is
   * where the eye already is; right is the fallback for the leftmost chart in
   * a row, whose left is the navigation rail. Deriving it from a measurement
   * rather than from the current position means it settles in one pass and
   * cannot oscillate.
   */
  useLayoutEffect(() => {
    if (!active) return;
    const host = tipRef.current;
    const el = tipElRef.current;
    if (!host || !el) return;

    const scroller = host.closest('.shell__content');
    const bound = scroller ? scroller.getBoundingClientRect() : { left: 0, right: window.innerWidth };
    const box = host.getBoundingClientRect();
    const width = el.getBoundingClientRect().width + 12;

    const fitsLeft = box.left - width >= bound.left;
    setTipSide(fitsLeft ? 'left' : 'right');
  }, [active]);

  const tipAt = (() => {
    if (!active) return null;
    const mid = (active.offset + active.length / 2) / circumference;
    const angle = mid * 2 * Math.PI - Math.PI / 2;
    /* Vertical position follows the slice, so which one is described is
       obvious; horizontal is fixed so the card never wanders. */
    const top = Math.min(Math.max(c + Math.sin(angle) * r, 14), size - 14);
    return tipSide === 'left'
      ? { left: -10, top, transform: 'translate(-100%, -50%)' }
      : { left: size + 10, top, transform: 'translate(0, -50%)' };
  })();

  return (
    <div className="donut" ref={tipRef}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${data.length} segments, ${total} total`}>
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--c-line)" strokeWidth={thickness} />
        <g transform={`rotate(-90 ${c} ${c})`}>
          {arcs.map((arc, i) => (
            <circle
              key={arc.label}
              cx={c} cy={c} r={r}
              fill="none"
              stroke={arc.color}
              strokeWidth={hover === i ? thickness + 3 : thickness}
              strokeDasharray={`${arc.length} ${circumference - arc.length}`}
              strokeDashoffset={-arc.offset}
              style={{ transition: 'stroke-width 120ms var(--ease)', cursor: 'pointer' }}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              /* No <title> here — the styled tooltip below already covers this
                 slice, and a native title on top of it renders both at once. */
            />
          ))}
        </g>
        {arcLabels && arcs.map((arc) => {
          if (arc.fraction < 0.06) return null;
          /* The biggest slice is already spelled out in the center, with its
             name under it. Printing the same number again on its own arc reads
             as two different figures that happen to match. */
          if (!active && arc === biggest) return null;
          if (active && arc === active) return null;
          const mid = (arc.offset + arc.length / 2) / circumference;
          const angle = mid * 2 * Math.PI - Math.PI / 2;
          return (
            <text
              key={`lbl-${arc.label}`}
              x={c + Math.cos(angle) * r}
              y={c + Math.sin(angle) * r + 4}
              className="donut-arc__label"
              textAnchor="middle"
            >
              {formatAxis(arc.value)}
            </text>
          );
        })}

        {variant !== 'pie' && focus && (
          <>
            <text x={c} y={c - 1} className="donut-center__value" textAnchor="middle">
              {active ? formatValue(active.value) : (centerValue ?? formatValue(focus.value))}
            </text>
            <text x={c} y={c + 13} className="donut-center__label" textAnchor="middle">
              {fitCentre(active ? active.label : (centerLabel ?? focus.label))}
              <title>{active ? active.label : (centerLabel ?? focus.label)}</title>
            </text>
          </>
        )}
      </svg>

      {active && tipAt && (
        <div ref={tipElRef} className="tooltip donut__tip" style={{ position: 'absolute', left: tipAt.left, top: tipAt.top, transform: tipAt.transform }}>
          <span className="row row--xtight row--nowrap" style={{ gap: 6 }}>
            <span className="legend__swatch" style={{ background: active.color }} />
            <span className="tooltip__title" style={{ marginBottom: 0 }}>{active.label}</span>
          </span>
          <span className="mono strong">{formatValue(active.value)}</span>
          <span className="tooltip__sub">{(active.fraction * 100).toFixed(1)}% of {formatValue(total)}</span>
        </div>
      )}

      {legend && <Legend items={arcs.map((a) => ({ label: a.label, color: a.color }))} />}
    </div>
  );
}

/* ---------- Horizontal bar rows ---------- */

export function BarRows({ rows, formatValue = formatNumber }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="stack stack--tight">
      {rows.map((row, i) => (
        <div key={row.label} className="stack" style={{ gap: 3 }}>
          <div className="row row--between row--nowrap">
            <span className="small truncate">{row.label}</span>
            <span className="row row--xtight" style={{ flex: 'none' }}>
              {row.meta && <span className="micro subtle">{row.meta}</span>}
              <span className="mono small strong">{formatValue(row.value)}</span>
            </span>
          </div>
          <div className="meter">
            <div className="meter__fill" style={{ width: `${(row.value / max) * 100}%`, background: row.color ?? seriesColor(i) }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ---------- Multi-series line ---------- */

export function LineChart({
  data, series, xKey = 'period', height = 220,
  xLabel, yLabel, formatValue = formatNumber, legend = true,
}) {
  const [ref, W] = useElementWidth();
  const [hover, setHover] = useState(null);

  const H = height;
  const PAD = { top: 8, right: 8, bottom: xLabel ? 34 : 20, left: yLabel ? 46 : 34 };
  const plotW = Math.max(W - PAD.left - PAD.right, 10);
  const plotH = Math.max(H - PAD.top - PAD.bottom, 10);

  const max = Math.max(1, ...data.flatMap((d) => series.map((s) => d[s.key] ?? 0)));
  const scale = niceScale(max, 4);
  const niceMax = scale.top;

  const x = (i) => PAD.left + (data.length <= 1 ? plotW / 2 : (plotW / (data.length - 1)) * i);
  const y = (v) => PAD.top + plotH - (v / niceMax) * plotH;
  /* A CATEGORICAL axis must never drop a label — a five-bar funnel that
     prints "Invitations, Underwriting, Live Participants" has silently hidden
     two of its five stages. Short series always label every bar and truncate
     the text to its slot; only long time series thin their ticks out. */
  const categorical = data.length <= 8;
  const labelEvery = categorical ? 1 : Math.max(1, Math.ceil(data.length / maxTicks(plotW)));
  const labelChars = Math.max(4, Math.floor((plotW / Math.max(data.length, 1)) / 6.2));
  const clip = (t) => (categorical ? fitLabel(t, labelChars) : String(t));
  const xLabels = axisLabels(data.map((d) => d[xKey] ?? d.period));

  return (
    <div className="chart-frame" ref={ref}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`${yLabel ?? 'Value'} over time`} onMouseLeave={() => setHover(null)}>
        {scale.ticks.map((v) => (
          <g key={v}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className="chart__grid" />
            <text x={PAD.left - 6} y={y(v) + 3.5} className="chart__axis" textAnchor="end">
              {formatAxis(v)}
              <title>{formatNumber(Math.round(v))}</title>
            </text>
          </g>
        ))}

        {series.map((s, si) => {
          const line = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d[s.key] ?? 0)}`).join(' ');
          const color = s.color ?? seriesColor(si);
          return (
            <g key={s.key}>
              <path d={line} className="chart__line" stroke={color} />
              {data.map((d, i) => (
                <circle
                  key={i} cx={x(i)} cy={y(d[s.key] ?? 0)}
                  r={hover === i ? 4 : 2.5} fill={color}
                  style={{ transition: 'r 120ms var(--ease)' }}
                />
              ))}
            </g>
          );
        })}

        {hover != null && <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} stroke="var(--c-line-strong)" strokeDasharray="3 3" />}

        {data.map((d, i) => (
          <rect
            key={`hit-${d[xKey]}-${i}`}
            x={x(i) - plotW / Math.max(data.length, 1) / 2} y={PAD.top}
            width={plotW / Math.max(data.length, 1)} height={plotH}
            fill="transparent" onMouseEnter={() => setHover(i)}
          />
        ))}

        {data.map((d, i) => (i % labelEvery === 0 ? (
          <text key={`lbl-${d[xKey]}-${i}`} x={x(i)} y={H - (xLabel ? 20 : 6)} className="chart__axis" textAnchor={anchorAt(i, data.length)}>
            {clip(xLabels[i])}
            <title>{d[xKey]}</title>
          </text>
        ) : null))}

        <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} className="chart__baseline" />

        {xLabel && <text x={PAD.left + plotW / 2} y={H - 4} className="chart__axis-title" textAnchor="middle">{xLabel}</text>}
        {yLabel && (
          <text transform={`rotate(-90 11 ${PAD.top + plotH / 2})`} x={11} y={PAD.top + plotH / 2} className="chart__axis-title" textAnchor="middle">{yLabel}</text>
        )}
      </svg>

      {hover != null && (
        <div className="tooltip" style={{ position: 'absolute', left: x(hover), top: 2, transform: 'translate(-50%,0)' }}>
          <span className="tooltip__title">{data[hover][xKey]}</span>
          {series.map((s, si) => (
            <div key={s.key} className="row row--between row--nowrap" style={{ gap: 10 }}>
              <span className="row row--xtight row--nowrap">
                <span className="legend__swatch" style={{ background: s.color ?? seriesColor(si) }} />{(s.name ?? s.label)}
              </span>
              <span className="mono strong">{formatValue(data[hover][s.key] ?? 0)}</span>
            </div>
          ))}
        </div>
      )}

      {legend && series.length > 1 && (
        <Legend items={series.map((s, i) => ({ label: (s.name ?? s.label), color: s.color ?? seriesColor(i) }))} />
      )}
    </div>
  );
}

/* ---------- Dot plot ---------- */

/** One dot per category on a shared value axis — good for spotting outliers
 *  a bar chart buries (e.g. average handle time per analyst). */
export function DotPlot({ data, xKey = 'label', valueKey = 'value', height = 220, yLabel, formatValue = formatNumber, color = 'var(--c-series-0)' }) {
  const [ref, W] = useElementWidth();
  const [hover, setHover] = useState(null);

  const H = height;
  const PAD = { top: 10, right: 10, bottom: 34, left: yLabel ? 46 : 34 };
  const plotW = Math.max(W - PAD.left - PAD.right, 10);
  const plotH = Math.max(H - PAD.top - PAD.bottom, 10);

  const values = data.map((d) => d[valueKey] ?? 0);
  const rawMax = Math.max(1, ...values);
  const min = Math.min(0, ...values);
  const scale = niceScale(rawMax - min, 4);
  const max = min + scale.top;
  const y = (v) => PAD.top + plotH - ((v - min) / (max - min || 1)) * plotH;
  const slot = plotW / Math.max(data.length, 1);
  const x = (i) => PAD.left + slot * i + slot / 2;
  const avg = values.reduce((s, v) => s + v, 0) / (values.length || 1);

  return (
    <div className="chart-frame" ref={ref}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label={`${yLabel ?? 'Value'} by ${xKey}`}>
        {scale.ticks.map((t) => {
          const v = min + t;
          return (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(v)} y2={y(v)} className="chart__grid" />
              <text x={PAD.left - 6} y={y(v) + 3.5} className="chart__axis" textAnchor="end">
                {formatAxis(v)}
                <title>{formatNumber(Math.round(v))}</title>
              </text>
            </g>
          );
        })}

        <line x1={PAD.left} x2={W - PAD.right} y1={y(avg)} y2={y(avg)} stroke="var(--c-series-neutral)" strokeDasharray="3 3" />

        {data.map((d, i) => (
          <g key={d[xKey]} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
            <line x1={x(i)} x2={x(i)} y1={y(0)} y2={y(d[valueKey] ?? 0)} stroke="var(--c-line-strong)" strokeWidth={1} />
            <circle cx={x(i)} cy={y(d[valueKey] ?? 0)} r={hover === i ? 7 : 5} fill={color} style={{ transition: 'r 120ms var(--ease)', cursor: 'pointer' }}>
              <title>{`${d[xKey]}: ${formatValue(d[valueKey] ?? 0)}`}</title>
            </circle>
            <text x={x(i)} y={H - 12} className="chart__axis" textAnchor="middle">{String(d[xKey]).length > 10 ? `${String(d[xKey]).slice(0, 9)}…` : d[xKey]}</text>
          </g>
        ))}

        <line x1={PAD.left} x2={W - PAD.right} y1={PAD.top + plotH} y2={PAD.top + plotH} className="chart__baseline" />

        {yLabel && (
          <text transform={`rotate(-90 11 ${PAD.top + plotH / 2})`} x={11} y={PAD.top + plotH / 2} className="chart__axis-title" textAnchor="middle">{yLabel}</text>
        )}
      </svg>

      {hover != null && (
        <div className="tooltip" style={{ position: 'absolute', left: x(hover), top: 2, transform: 'translate(-50%,0)' }}>
          <span className="tooltip__title">{data[hover][xKey]}</span>
          <span className="mono">{formatValue(data[hover][valueKey] ?? 0)}</span>
        </div>
      )}
    </div>
  );
}

/* ---------- Geographic bubble map ---------- */

/** Approximate country centroids for the ten markets the book uses — enough
 *  to place a bubble, not a survey-grade projection. */
const MARKET_COORDS = {
  US: { lon: -98, lat: 39 }, CA: { lon: -106, lat: 56 }, GB: { lon: -2, lat: 54 },
  DE: { lon: 10, lat: 51 }, FR: { lon: 2, lat: 46 }, ES: { lon: -4, lat: 40 },
  IT: { lon: 12, lat: 43 }, AU: { lon: 133, lat: -27 }, JP: { lon: 138, lat: 36 },
  MX: { lon: -102, lat: 23 },
};

export function WorldBubbleMap({ data, height = 260, formatValue = formatNumber }) {
  const [ref, W] = useElementWidth();
  const [hover, setHover] = useState(null);

  const H = height;
  const PAD = { top: 14, right: 14, bottom: 14, left: 14 };
  const plotW = Math.max(W - PAD.left - PAD.right, 10);
  const plotH = Math.max(H - PAD.top - PAD.bottom, 10);

  const project = (lon, lat) => ({
    x: PAD.left + ((lon + 180) / 360) * plotW,
    y: PAD.top + ((90 - lat) / 180) * plotH,
  });

  const rows = data.filter((d) => MARKET_COORDS[d.market]);
  const max = Math.max(1, ...rows.map((d) => d.count));
  const radius = (count) => 7 + Math.sqrt(count / max) * 20;

  return (
    <div className="chart-frame" ref={ref}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Cases by market">
        <rect x={PAD.left} y={PAD.top} width={plotW} height={plotH} fill="var(--c-surface-sunken)" rx={8} />
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={`v${f}`} x1={PAD.left + plotW * f} x2={PAD.left + plotW * f} y1={PAD.top} y2={PAD.top + plotH} className="chart__grid" />
        ))}
        {[0.33, 0.66].map((f) => (
          <line key={`h${f}`} x1={PAD.left} x2={PAD.left + plotW} y1={PAD.top + plotH * f} y2={PAD.top + plotH * f} className="chart__grid" />
        ))}

        {rows.map((d, i) => {
          const { x, y } = project(MARKET_COORDS[d.market].lon, MARKET_COORDS[d.market].lat);
          const r = hover === i ? radius(d.count) + 2 : radius(d.count);
          return (
            <g key={d.market} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r={r} fill="var(--c-primary)" fillOpacity={0.72} stroke="var(--c-primary-deep)" strokeWidth={1} style={{ transition: 'r 120ms var(--ease)' }}>
                <title>{`${d.market}: ${formatNumber(d.count)} cases · ${formatValue(d.value)}`}</title>
              </circle>
              <text x={x} y={y + 3.5} textAnchor="middle" className="micro" style={{ fill: '#fff', fontWeight: 700, pointerEvents: 'none' }}>{d.market}</text>
            </g>
          );
        })}
      </svg>

      {hover != null && (() => {
        const d = rows[hover];
        const { x, y } = project(MARKET_COORDS[d.market].lon, MARKET_COORDS[d.market].lat);
        return (
          <div className="tooltip" style={{ position: 'absolute', left: x, top: y - radius(d.count) - 12, transform: 'translate(-50%, -100%)' }}>
            <span className="tooltip__title">{d.market}</span>
            <span className="mono">{formatNumber(d.count)} cases · {formatValue(d.value)}</span>
          </div>
        );
      })()}
    </div>
  );
}

export default BarChart;
