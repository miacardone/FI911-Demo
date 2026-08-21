import { useMemo, useRef, useState } from 'react';
import Icon from '@/components/ui/Icon';
import { Button, PageHeader } from '@/components/ui/Surface';
import { ColumnToggle, DataTable, DensityToggle, ExportButtons } from '@/components/ui/DataTable';
import { useToast } from '@/context/ToastContext';
import { useAutoPageSize } from '@/hooks/useAutoPageSize';
import { withColumnHelp } from '@/domain/columnHelp';

/**
 * THE LIST PAGE SHELL.
 *
 * Nearly every screen in this console is the same object: a header with a
 * Feedback button, a tab strip carrying counts, a scope strip naming the date
 * field and range, a toolbar (search + Advanced Search on the left, Autosize /
 * Columns / Export to Excel on the right), an optional collapsible Advanced
 * Search panel, a table, and a pager.
 *
 * Building that once and passing it `columns` + `rows` is what keeps 39 pages
 * consistent. A page that hand-rolled its own toolbar would drift the moment
 * someone added a button — which is exactly what the reference product did,
 * and why its Autosize control sits in three different places.
 *
 * Search, sort and pagination are handled HERE rather than by each caller:
 * they are presentation concerns of the table, not of the domain, and pushing
 * them down means a page module is just its columns and its data.
 */

/* ---------- Tabs with counts ---------- */

export function TabStrip({ tabs, value, onChange }) {
  return (
    <div className="fi-tabs" role="tablist">
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          role="tab"
          aria-selected={value === t.value}
          className={`fi-tab ${value === t.value ? 'is-active' : ''} ${t.tone ? `fi-tab--${t.tone}` : ''}`.trim()}
          onClick={() => onChange?.(t.value)}
        >
          {t.label}
          {t.count != null && <span className="fi-tab__count"> ({t.count})</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Scope strip ----------
   The active filters, as chips.

   This began as a static line of text ("Search By: Status Change Date  Start
   Date: …"), which told you the scope but gave you no way to change it. Chips
   are the better function: a chip that can be lifted carries an ×, so you can
   widen the range without opening Advanced Search, and "Clear All" resets in
   one click. Chips that merely describe the scope (the field being searched,
   "Last calculated") have no × because there is nothing to remove.

   An item is `{ label, value, onRemove? }`. */

export function ScopeStrip({ items = [], onClearAll }) {
  const live = items.filter(Boolean);
  if (!live.length) return null;

  const removable = live.filter((i) => i.onRemove);

  return (
    <div className="fi-scope">
      <div className="fi-scope__chips">
        {live.map((it) => (
          <span key={it.label} className={`fi-chip ${it.onRemove ? 'fi-chip--removable' : ''}`.trim()}>
            <span className="fi-chip__label">{it.label} :</span>
            <span className="fi-chip__value">{it.value}</span>
            {it.onRemove && (
              <button type="button" className="fi-chip__x" aria-label={`Remove ${it.label} filter`} onClick={it.onRemove}>
                <Icon name="close" size={11} strokeWidth={2.6} />
              </button>
            )}
          </span>
        ))}
      </div>

      {removable.length > 0 && onClearAll && (
        <Button variant="danger" size="sm" icon="trash" className="fi-scope__clear" onClick={onClearAll}>
          Clear All
        </Button>
      )}
    </div>
  );
}

/* ---------- Toolbar ---------- */

export function ListToolbar({
  search, onSearchChange, searchPlaceholder = 'Search records',
  onAdvanced, advancedOpen, advancedLabel = 'Advanced Search',
  leftExtra, rightExtra,
  density, onDensityChange,
  columns, hiddenColumns, onHiddenColumnsChange,
  exportRows, exportName,
}) {
  const toast = useToast();

  return (
    <div className="fi-toolbar">
      <div className="fi-toolbar__left">
        {onSearchChange && (
          <input
            className="input fi-toolbar__search"
            type="search"
            value={search}
            placeholder={searchPlaceholder}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label={searchPlaceholder}
          />
        )}
        {onAdvanced && (
          <Button variant="primary" size="sm" icon="search" onClick={onAdvanced} aria-expanded={advancedOpen}>
            {advancedLabel}
          </Button>
        )}
        {leftExtra}
      </div>

      <div className="fi-toolbar__right">
        {rightExtra}
        {onDensityChange && <DensityToggle value={density} onChange={onDensityChange} />}
        {columns && onHiddenColumnsChange && (
          <ColumnToggle columns={columns} hidden={hiddenColumns} onChange={onHiddenColumnsChange} />
        )}
        {exportRows && (
          <ExportButtons
            columns={columns.filter((c) => !hiddenColumns?.has(c.key))}
            rows={exportRows}
            name={exportName ?? 'export'}
            onCopied={(ok) => toast.notify(ok ? 'Copied to clipboard.' : 'Copy failed.', ok ? 'default' : 'danger')}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Pager ----------
   "Page Size: [20]   1 to 20 of 22   |< < Page 1 of 2 > >|" — first/last jumps
   included, which the shared Pagination in DataTable.jsx does not carry. */

export function ListPager({ total, page, pageSize, onPageChange, onPageSizeChange, pageSizes = [10, 20, 50, 100], auto, onAutoChange }) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  const jump = (p) => onPageChange(Math.min(pageCount, Math.max(1, p)));

  return (
    <div className="fi-pager">
      <label className="fi-pager__size">
        <span>Page Size:</span>
        <select
          className="select"
          value={auto ? 'auto' : pageSize}
          onChange={(e) => {
            const v = e.target.value;
            if (v === 'auto') { onAutoChange?.(true); } else { onAutoChange?.(false); onPageSizeChange(Number(v)); }
            onPageChange(1);
          }}
          aria-label="Page size"
        >
          <option value="auto">Auto ({pageSize})</option>
          {pageSizes.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </label>

      <span className="fi-pager__range">{start} to <strong>{end}</strong> of <strong>{total}</strong></span>

      <div className="fi-pager__nav">
        <button type="button" className="fi-pager__btn" disabled={page <= 1} onClick={() => jump(1)} aria-label="First page">⇤</button>
        <button type="button" className="fi-pager__btn" disabled={page <= 1} onClick={() => jump(page - 1)} aria-label="Previous page">
          <Icon name="chevron" size={14} style={{ transform: 'rotate(180deg)' }} />
        </button>
        <span className="fi-pager__page">Page <strong>{page}</strong> of <strong>{pageCount}</strong></span>
        <button type="button" className="fi-pager__btn" disabled={page >= pageCount} onClick={() => jump(page + 1)} aria-label="Next page">
          <Icon name="chevron" size={14} />
        </button>
        <button type="button" className="fi-pager__btn" disabled={page >= pageCount} onClick={() => jump(pageCount)} aria-label="Last page">⇥</button>
      </div>
    </div>
  );
}

/* ---------- The table block, without the page header ----------
   Transactions pages stack several of these inside one page (Summary /
   Details / Custom Filter / Historical Records all render their own table),
   so the table + its toolbar + its pager is separable from the page chrome. */

export function ListTable({
  columns: columnsProp,
  rows,
  rowKey = (r) => r.id,
  search: searchProp,
  onSearchChange: onSearchChangeProp,
  searchPlaceholder,
  onAdvanced,
  advancedOpen,
  advanced,
  leftExtra,
  rightExtra,
  onRowClick,
  empty,
  exportName,
  initialPageSize = 20,
  showToolbar = true,
  note,
  selectable = true,
  /** Column keys to sum into a footer row. */
  totals,
}) {
  /* Every header carries an explanation of what the column holds. Declaring
     that on several hundred column definitions would guarantee drift, so it is
     looked up centrally and a page can still override per column. */
  const columns = useMemo(() => withColumnHelp(columnsProp), [columnsProp]);

  const [innerSearch, setInnerSearch] = useState('');
  const [selected, setSelected] = useState(() => new Set());
  const bodyRef = useRef(null);
  const [auto, setAuto] = useState(true);
  const search = searchProp ?? innerSearch;
  const onSearchChange = onSearchChangeProp ?? setInnerSearch;

  const [density, setDensity] = useState('comfortable');
  const [hidden, setHidden] = useState(() => new Set());
  const [sort, setSort] = useState(null);
  const [page, setPage] = useState(1);
  const [manualPageSize, setManualPageSize] = useState(initialPageSize);

  /* Row height tracks density: "Fit to width" is the compact mode. */
  const autoSize = useAutoPageSize(bodyRef, {
    estimatedRowHeight: density === 'fit' ? 33 : 44,
    enabled: auto,
  });
  const pageSize = auto ? (autoSize ?? initialPageSize) : manualPageSize;

  /* Search matches the rendered TEXT of a row, not its raw fields, so a
     search for "Bank" hits a row whose Type column renders a badge reading
     "Bank" from a `type: 'bank'` id. Columns opt out with searchable:false. */
  const searchText = (row) => columns
    .filter((c) => c.searchable !== false)
    .map((c) => (c.text ? c.text(row) : row[c.key]))
    .filter((v) => v != null)
    .join(' ')
    .toLowerCase();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => searchText(r).includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search, columns]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return filtered;
    const valueOf = (r) => (col.sortValue ? col.sortValue(r) : (col.text ? col.text(r) : r[col.key]));
    return [...filtered].sort((a, b) => {
      const av = valueOf(a); const bv = valueOf(b);
      if (av == null) return 1;
      if (bv == null) return -1;
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sort.dir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const visibleColumns = columns.filter((c) => !hidden.has(c.key));

  const toggleSort = (key) => setSort((s) => (
    s?.key === key ? (s.dir === 'asc' ? { key, dir: 'desc' } : null) : { key, dir: 'asc' }
  ));

  /* Selection is page-scoped in the reference: the header checkbox selects the
     rows you can see, not the 264 rows behind the pager. */
  const selection = selectable ? {
    selected,
    onToggle: (id) => setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    }),
    onToggleAll: (ids, on) => setSelected((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
      return next;
    }),
  } : undefined;

  return (
    <>
      {showToolbar && (
        <ListToolbar
          search={search}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          onAdvanced={onAdvanced}
          advancedOpen={advancedOpen}
          leftExtra={leftExtra}
          rightExtra={rightExtra}
          density={density}
          onDensityChange={setDensity}
          columns={columns}
          hiddenColumns={hidden}
          onHiddenColumnsChange={setHidden}
          exportRows={sorted}
          exportName={exportName}
        />
      )}

      {advancedOpen && advanced}
      {note && <p className="fi-note">{note}</p>}

      <div ref={bodyRef}>
        <DataTable
          columns={visibleColumns}
          rows={pageRows}
          rowKey={rowKey}
          density={density}
          sort={sort}
          onSort={toggleSort}
          selection={selection}
          onRowClick={onRowClick}
          empty={empty}
          totals={totals}
        />
      </div>

      <ListPager
        total={sorted.length}
        page={safePage}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setManualPageSize}
        auto={auto}
        onAutoChange={setAuto}
      />
    </>
  );
}

/* ---------- The whole page ---------- */

export function ListPage({
  title,
  description,
  headerActions,
  tabs,
  tab,
  onTabChange,
  scope,
  onClearScope,
  children,
  ...tableProps
}) {
  return (
    <>
      <PageHeader title={title} description={description} actions={headerActions} />

      {tabs && <TabStrip tabs={tabs} value={tab} onChange={onTabChange} />}
      {scope && <ScopeStrip items={scope} onClearAll={onClearScope} />}

      <div className="fi-panel">
        {children ?? <ListTable {...tableProps} />}
      </div>
    </>
  );
}

export default ListPage;
