import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Surface';
import { SelectField, TextField } from '@/components/ui/Form';
import { useToast } from '@/context/ToastContext';

/**
 * THE THREE FILTER PANELS.
 *
 * The reference has three visually similar but functionally distinct panels,
 * and the difference matters:
 *
 *   · Advanced Search  — narrows the table in place. Search / Clear.
 *   · Custom Filter    — narrows the table AND is saveable as a named report.
 *                        Saved Report + Report Name, with Save / Download /
 *                        Update Report / Delete Report, then Clear / Apply Filters.
 *   · Historical Records — a narrower field set that does NOT filter the table;
 *                        it emails a report for an archived range. Clear / Email Report.
 *
 * They share a field grid, so that is the one primitive (`FilterGrid`) and the
 * three panels are thin wrappers over it. Collapsing them into one component
 * with a `mode` prop was the alternative; three named exports read better at
 * the call site and keep each panel's footer honest about what it does.
 *
 * A field is `{ name, label, type, options, placeholder, required, span }`.
 * `type` is 'text' | 'select' | 'date' | 'number'. `span` widens a field
 * across grid columns (the reference gives Description-style fields the full
 * row).
 */

const EMPTY = {};

export function FilterGrid({ fields, values, onChange, columns = 4 }) {
  return (
    <div className="fi-filter__grid" style={{ '--fi-filter-cols': columns }}>
      {fields.map((f) => {
        const value = values[f.name] ?? '';
        const set = (v) => onChange({ ...values, [f.name]: v });
        const style = f.span ? { gridColumn: `span ${f.span}` } : undefined;

        if (f.type === 'select') {
          return (
            <div key={f.name} style={style}>
              <SelectField
                label={f.label}
                required={f.required}
                value={value}
                onChange={(e) => set(e.target.value)}
                options={f.options ?? []}
                placeholder={f.placeholder ?? 'All'}
              />
            </div>
          );
        }

        return (
          <div key={f.name} style={style}>
            <TextField
              label={f.label}
              required={f.required}
              type={f.type === 'date' ? 'date' : f.type === 'number' ? 'number' : 'text'}
              value={value}
              placeholder={f.placeholder}
              onChange={(e) => set(e.target.value)}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Advanced Search ---------- */

export function AdvancedSearchPanel({ fields, values = EMPTY, onChange, onSearch, onClear, columns = 5 }) {
  return (
    <section className="fi-filter" aria-label="Advanced search">
      <FilterGrid fields={fields} values={values} onChange={onChange} columns={columns} />
      <footer className="fi-filter__foot fi-filter__foot--left">
        <Button variant="primary" size="sm" onClick={onSearch}>Search</Button>
        <Button variant="secondary" size="sm" onClick={onClear}>Clear</Button>
      </footer>
    </section>
  );
}

/* ---------- Custom Filter ---------- *
 * The saved-report header is the whole point of this panel. Save is enabled
 * only once the report has a name; Download / Update / Delete only once an
 * existing report is selected — otherwise they'd act on nothing, which is how
 * the reference ends up with a live "Delete Report" button on a blank form. */

export function CustomFilterPanel({
  fields,
  values = EMPTY,
  onChange,
  onApply,
  onClear,
  columns = 4,
  reportKey = 'report',
}) {
  const toast = useToast();
  const [saved, setSaved] = useState([]);
  const [selected, setSelected] = useState('');
  const [name, setName] = useState('');

  const options = useMemo(
    () => [{ value: '', label: 'None' }, ...saved.map((s) => ({ value: s.name, label: s.name }))],
    [saved],
  );

  const hasName = name.trim().length > 0;
  const hasSelection = selected !== '';

  const save = () => {
    const next = { name: name.trim(), values };
    setSaved((s) => [...s.filter((x) => x.name !== next.name), next]);
    setSelected(next.name);
    toast.notify(`Saved report "${next.name}".`);
  };

  const update = () => {
    setSaved((s) => s.map((x) => (x.name === selected ? { ...x, values } : x)));
    toast.notify(`Updated report "${selected}".`);
  };

  const remove = () => {
    setSaved((s) => s.filter((x) => x.name !== selected));
    setSelected('');
    setName('');
    toast.notify('Report deleted.');
  };

  const load = (value) => {
    setSelected(value);
    const found = saved.find((s) => s.name === value);
    setName(value);
    onChange(found ? found.values : {});
  };

  return (
    <section className="fi-filter" aria-label="Custom filter">
      <div className="fi-filter__report">
        <div className="fi-filter__report-fields">
          <SelectField label="Saved Report" value={selected} onChange={(e) => load(e.target.value)} options={options} placeholder="None" />
          <TextField label="Report Name" value={name} placeholder="Enter report name" onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="fi-filter__report-actions">
          <Button variant="primary" size="sm" disabled={!hasName} onClick={save}>Save</Button>
          <Button variant="secondary" size="sm" disabled={!hasSelection} onClick={() => toast.notify('Download started.')}>Download</Button>
          <Button variant="secondary" size="sm" disabled={!hasSelection} onClick={update}>Update Report</Button>
          <Button variant="danger" size="sm" disabled={!hasSelection} onClick={remove}>Delete Report</Button>
        </div>
      </div>

      <FilterGrid fields={fields} values={values} onChange={onChange} columns={columns} />

      <footer className="fi-filter__foot">
        <Button variant="secondary" size="sm" onClick={onClear}>Clear</Button>
        <Button variant="primary" size="sm" onClick={onApply}>Apply Filters</Button>
      </footer>
    </section>
  );
}

/* ---------- Historical Records ---------- *
 * Emails a report rather than filtering the grid, so its only commitment is
 * that the range is complete. */

export function HistoricalRecordsPanel({ fields, values = EMPTY, onChange, onClear, columns = 4, note }) {
  const toast = useToast();

  const missing = fields.filter((f) => f.required && !String(values[f.name] ?? '').trim());
  const ready = missing.length === 0;

  return (
    <section className="fi-filter" aria-label="Historical records">
      <FilterGrid fields={fields} values={values} onChange={onChange} columns={columns} />
      {note && <p className="fi-note">{note}</p>}
      <footer className="fi-filter__foot">
        <Button variant="secondary" size="sm" onClick={onClear}>Clear</Button>
        <Button
          variant="primary"
          size="sm"
          disabled={!ready}
          onClick={() => toast.notify('Report queued — it will arrive by email.')}
        >
          Email Report
        </Button>
      </footer>
    </section>
  );
}

/**
 * Apply a filter value-bag to rows.
 *
 * Every panel above produces the same shape — `{ fieldName: value }` — so one
 * matcher serves all three. A field declares how it maps onto a row through
 * `match(row, value)`; without one it falls back to a case-insensitive
 * substring test against `row[field.name]`, which covers most of the text
 * inputs. Empty values never filter.
 */
export function applyFilters(rows, fields, values) {
  const active = fields.filter((f) => String(values[f.name] ?? '').trim() !== '');
  if (!active.length) return rows;

  return rows.filter((row) => active.every((f) => {
    const v = values[f.name];
    if (f.match) return f.match(row, v);
    const cell = row[f.name];
    if (cell == null) return false;
    return String(cell).toLowerCase().includes(String(v).toLowerCase());
  }));
}

export default AdvancedSearchPanel;
