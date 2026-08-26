import { useEffect, useRef, useState } from 'react';
import { Badge, Button } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import { Muted } from '@/components/fi911/cells';
import {
  VERIFICATION_TONE, scoreBandFor, scorecardFor, verificationsFor,
} from '@/data/underwriting';

/**
 * The two underwriting screens that decide a file, rather than describe it.
 *
 * Review feedback: the wizard captured the application well but had no score
 * card and no way to initiate the third-party services an underwriter
 * actually runs. Both live here so the underwriting detail and any future
 * re-underwriting screen share one implementation.
 */

/* ------------------------------------------------------------------ *
 * Score card
 * ------------------------------------------------------------------ */

/**
 * A semicircular gauge. An underwriting score is a position on a banded
 * scale, not a quantity — a bar chart of one value says nothing about
 * whether 68 is good, and the band boundaries are the whole point.
 */
function ScoreGauge({ total, tone }) {
  const R = 68;
  const CX = 82;
  const CY = 78;

  const arc = (from, to) => {
    const p = (a) => [CX + R * Math.cos(Math.PI - Math.PI * a), CY - R * Math.sin(Math.PI - Math.PI * a)];
    const [x1, y1] = p(from);
    const [x2, y2] = p(to);
    return `M ${x1} ${y1} A ${R} ${R} 0 0 1 ${x2} ${y2}`;
  };

  return (
    <svg className="gauge" viewBox="0 0 164 96" role="img" aria-label={`Underwriting score ${total} out of 100`}>
      {/* Band track — where Decline, Refer, Conditions and Approve begin */}
      <path d={arc(0, 0.44)} className="gauge__band gauge__band--danger" />
      <path d={arc(0.45, 0.59)} className="gauge__band gauge__band--warn-deep" />
      <path d={arc(0.60, 0.74)} className="gauge__band gauge__band--warning" />
      <path d={arc(0.75, 1)} className="gauge__band gauge__band--success" />

      {/* The file's score, drawn over the track */}
      <path d={arc(0.001, Math.max(total / 100, 0.002))} className={`gauge__value gauge__value--${tone}`} />

      <text x={CX} y={CY - 12} className="gauge__total">{total}</text>
      <text x={CX} y={CY + 6} className="gauge__scale">out of 100</text>
    </svg>
  );
}

export function ScoreCard({ record }) {
  const card = scorecardFor(record);

  return (
    <div className="scorecard">
      <div className="scorecard__head">
        <ScoreGauge total={card.total} tone={card.tone} />

        <div className="scorecard__verdict">
          <Badge tone={card.tone}>{card.decision}</Badge>
          <p className="scorecard__guidance">{card.guidance}</p>
          <div className="scorecard__meta">
            <span>Model <span className="strong">{card.model}</span></span>
            <span>Scored <span className="strong">{card.scoredOn}</span></span>
          </div>
          <div className="scorecard__weak">
            <span className="t-section-label">Costing this file the most</span>
            {card.weakest.map((f) => (
              <span key={f.key} className="scorecard__weak-item">
                <Icon name="alert" size={13} />
                {f.label} — {f.band} ({f.points} of {f.weight})
              </span>
            ))}
          </div>
        </div>
      </div>

      <table className="scorecard__table">
        <thead>
          <tr>
            <th>Factor</th>
            <th>Value</th>
            <th>Band</th>
            <th className="scorecard__num">Points</th>
            <th>Contribution</th>
          </tr>
        </thead>
        <tbody>
          {card.factors.map((f) => {
            const share = (f.points / f.weight) * 100;
            const tone = share >= 75 ? 'success' : share >= 45 ? 'warning' : 'danger';

            return (
              <tr key={f.key}>
                <td>
                  <Tooltip label={f.hint}>
                    <span className="scorecard__factor">
                      <span className="strong">{f.label}</span>
                      <span className="subtle">{f.category}</span>
                    </span>
                  </Tooltip>
                </td>
                <td className="scorecard__num">{f.display}</td>
                <td><Badge tone={tone}>{f.band}</Badge></td>
                <td className="scorecard__num">
                  <span className="strong">{f.points}</span>
                  <Muted> / {f.weight}</Muted>
                </td>
                <td>
                  <Tooltip label={`${f.label} earned ${f.points} of a possible ${f.weight} points`}>
                    <span className="scorecard__meter">
                      <span className={`scorecard__fill scorecard__fill--${tone}`} style={{ width: `${share}%` }} />
                    </span>
                  </Tooltip>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>Weighted total</td>
            <td className="scorecard__num"><span className="strong">{card.total}</span><Muted> / 100</Muted></td>
            <td><Badge tone={card.tone}>{scoreBandFor(card.total).decision}</Badge></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Third-party verification
 * ------------------------------------------------------------------ */

/**
 * The services an underwriter initiates against a file.
 *
 * "Run check" is the point of the screen — the review noted the prototype
 * showed underwriting results with no way to start the underwriting. A run
 * moves the row through Running before settling, because these services are
 * asynchronous and a status that flipped instantly would teach the wrong
 * thing about how the file behaves.
 */
export function ThirdPartyChecks({ record, onNotify }) {
  const [results, setResults] = useState(() => verificationsFor(record));
  const timers = useRef([]);

  /* A file can be swapped under the component by route change. */
  useEffect(() => { setResults(verificationsFor(record)); }, [record]);

  /* Pending runs must not resolve into an unmounted component. */
  useEffect(() => () => { timers.current.forEach(clearTimeout); timers.current = []; }, []);

  const run = (key) => {
    setResults((rs) => rs.map((r) => (r.key === key ? { ...r, status: 'Running', detail: '', reference: '' } : r)));

    const t = setTimeout(() => {
      setResults((rs) => rs.map((r) => {
        if (r.key !== key) return r;
        const fresh = verificationsFor(record).find((v) => v.key === key);
        /* A re-run of a check that had never been run has to come back with
           SOMETHING, so fall back to a pass rather than back to "Not run". */
        const settled = fresh && fresh.status !== 'Not run'
          ? fresh
          : { ...r, status: 'Passed', detail: 'Completed — no exceptions raised', reference: `${r.provider.slice(0, 3).toUpperCase()}-40118827` };
        onNotify?.(`${settled.provider} ${settled.product} returned ${settled.status.toLowerCase()}.`, settled.status === 'Failed' ? 'danger' : 'default');
        return { ...settled, completedAt: '2026/08/20 09:14' };
      }));
    }, 1400);

    timers.current.push(t);
  };

  const outstanding = results.filter((r) => r.status === 'Not run').length;
  const blocking = results.filter((r) => r.status === 'Failed' || r.status === 'Review').length;

  return (
    <div className="checks">
      <div className="checks__summary">
        <span className={`checks__stat ${blocking ? 'is-bad' : 'is-good'}`}>
          <Icon name={blocking ? 'alert' : 'check'} size={15} />
          {blocking
            ? `${blocking} check${blocking === 1 ? '' : 's'} need adjudication`
            : 'No outstanding exceptions'}
        </span>
        {outstanding > 0 && (
          <Button
            variant="primary"
            size="sm"
            icon="play"
            onClick={() => results.filter((r) => r.status === 'Not run').forEach((r) => run(r.key))}
          >
            Run {outstanding} remaining check{outstanding === 1 ? '' : 's'}
          </Button>
        )}
      </div>

      <div className="checks__grid">
        {results.map((r) => (
          <div key={r.key} className={`check check--${VERIFICATION_TONE[r.status]}`}>
            <div className="check__head">
              <span className="check__provider">
                <span className="strong">{r.provider}</span>
                <span className="check__product">{r.product}</span>
              </span>
              <Badge tone={VERIFICATION_TONE[r.status]} dot={r.status === 'Running'}>{r.status}</Badge>
            </div>

            <span className="check__label">{r.label}</span>
            <p className="check__checks">{r.checks}</p>

            {r.detail && <p className="check__detail">{r.detail}</p>}

            <div className="check__foot">
              {r.reference
                ? (
                  <Tooltip label={`Completed ${r.completedAt}`}>
                    <span className="check__ref">{r.reference}</span>
                  </Tooltip>
                )
                : <span className="check__ref check__ref--empty">Typical turnaround: {r.turnaround}</span>}

              <Button
                variant="secondary"
                size="sm"
                icon={r.status === 'Not run' ? 'play' : 'refresh'}
                disabled={r.status === 'Running'}
                onClick={() => run(r.key)}
              >
                {r.status === 'Running' ? 'Running…' : r.status === 'Not run' ? 'Run check' : 'Re-run'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
