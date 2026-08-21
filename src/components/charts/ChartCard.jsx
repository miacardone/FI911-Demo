import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { Card } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';

/**
 * A chart card that can show the figures behind the chart.
 *
 * The list icon in the card header is not decoration — it swaps the chart for
 * a plain table of the same numbers. A chart answers "what is the shape";
 * the table answers "what is the number", and on a dashboard people
 * legitimately want both. Before this the icon was a placeholder that did
 * nothing, which is worse than not having it.
 *
 * The card owns the toggle so every chart on every dashboard behaves the same
 * way, and so a page can drop the icon simply by not passing `table`.
 */
export function ChartCard({ title, description, action, table, children }) {
  const [showTable, setShowTable] = useState(false);

  const toggle = table ? (
    <Tooltip label={showTable ? 'Show chart' : 'Show the data behind this chart'}>
      <button
        type="button"
        className={`chart-toggle ${showTable ? 'is-active' : ''}`.trim()}
        onClick={() => setShowTable((v) => !v)}
        aria-pressed={showTable}
        aria-label={showTable ? 'Show chart' : 'Show data table'}
      >
        <Icon name={showTable ? 'chart' : 'checklist'} size={16} />
      </button>
    </Tooltip>
  ) : null;

  return (
    <Card
      title={title}
      description={description}
      action={(action || toggle) && (
        <span className="row row--tight row--nowrap">
          {action}
          {toggle}
        </span>
      )}
    >
      {showTable ? <ChartTable {...table} /> : children}
    </Card>
  );
}

/**
 * The tabular view of a chart's data.
 *
 * `columns` is `[{ key, label, format? }]` and `rows` is the same array the
 * chart was given, so the two views can never disagree — they read the same
 * source.
 */
export function ChartTable({ columns, rows, height = 250 }) {
  return (
    <div className="chart-table" style={{ maxHeight: height }}>
      <table className="fi-mini-table">
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th key={c.key} style={{ textAlign: i === 0 ? 'left' : 'right' }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row.period ?? row.label ?? ri}>
              {columns.map((c, i) => (
                <td
                  key={c.key}
                  style={{ textAlign: i === 0 ? 'left' : 'right' }}
                  className={i === 0 ? undefined : 'chart-table__value'}
                >
                  {c.format ? c.format(row[c.key], row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ChartCard;
