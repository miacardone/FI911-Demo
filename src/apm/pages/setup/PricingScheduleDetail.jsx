import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, PageHeader, SubTabs } from '@/components/ui/Surface';
import { Section, FieldGrid, useForm } from '@/components/fi911/DetailPage';
import { SelectField, TextField } from '@/components/ui/Form';
import { ListTable } from '@/components/fi911/ListPage';
import { useDetailCrumb } from '@/components/layout/AppLayout';
import { Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import {
  ITEM_TYPES, PRICING_CATEGORIES, PRICING_TYPES, RATE_TYPES, SPLIT_TYPES,
  pricingItems, pricingSchedule,
} from '@/apm/data/setup';
import { setupRoutes } from '@/apm/data/navigation';
import { useToast } from '@/context/ToastContext';
import brand from '@/apm/brand.config';

/**
 * The rate card behind one pricing schedule.
 *
 * The reference puts six category tabs above a grid of dropdowns and free-text
 * rate boxes, with a "MULTIPLE UPDATE" strip that applies one rate to
 * everything selected. That bulk edit is the genuinely good idea here — a
 * ninety-three-line rate card is not editable one field at a time.
 *
 * What it does not do is tell you what you are about to change. Here the bulk
 * strip only acts on the rows you have TICKED, says how many that is before
 * you commit, and every category tab carries its own edited count so you can
 * see what has moved across the whole card before saving.
 */

const opts = (list) => list.map((v) => ({ value: String(v), label: String(v) }));

export function PricingScheduleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const schedule = pricingSchedule(id);
  useDetailCrumb(schedule.name);

  const [category, setCategory] = useState(PRICING_CATEGORIES[0].id);
  const [edits, setEdits] = useState({});
  const [selected, setSelected] = useState(() => new Set());
  const [bulk, setBulk] = useState({ itemType: '', rateType: '', rate: '' });

  const form = useForm({
    name: schedule.name,
    processor: schedule.processor,
    pricingType: schedule.pricingType,
    splitType: schedule.splitType,
    startMonth: schedule.startMonth,
    profitPct: String(schedule.profitPct),
    lossPct: String(schedule.lossPct),
    description: schedule.description,
  });

  const items = useMemo(() => pricingItems(schedule.id, category), [schedule.id, category]);
  const rows = useMemo(() => items.map((i) => ({ ...i, ...(edits[i.id] ?? {}) })), [items, edits]);

  const editedInCategory = items.filter((i) => edits[i.id]).length;
  const editedTotal = Object.keys(edits).length;

  const toggle = (rowId) => setSelected((s) => {
    const next = new Set(s);
    if (next.has(rowId)) next.delete(rowId); else next.add(rowId);
    return next;
  });

  const applyBulk = () => {
    const patch = {};
    if (bulk.itemType) patch.itemType = bulk.itemType;
    if (bulk.rateType) patch.rateType = bulk.rateType;
    if (bulk.rate !== '') patch.rate = Number(bulk.rate);
    if (!Object.keys(patch).length) return;

    setEdits((e) => {
      const next = { ...e };
      selected.forEach((rowId) => { next[rowId] = { ...(next[rowId] ?? {}), ...patch }; });
      return next;
    });
    toast.notify(`Applied to ${selected.size} item${selected.size === 1 ? '' : 's'}.`);
    setSelected(new Set());
  };

  const patch = (rowId, key, value) => setEdits((e) => ({ ...e, [rowId]: { ...(e[rowId] ?? {}), [key]: value } }));

  const columns = [
    {
      key: '__pick', header: '', fw: 3, align: 'center', searchable: false, locked: true, pinned: true, width: 42,
      cell: (r) => (
        <input
          type="checkbox"
          className="check"
          checked={selected.has(r.id)}
          onChange={() => toggle(r.id)}
          aria-label={`Select ${r.name}`}
        />
      ),
    },
    {
      key: 'name', header: 'Item Name', fw: 26, sortable: true,
      cell: (r) => (
        <span className="rate-name">
          {edits[r.id] && <Tooltip label="Edited — not saved yet"><span className="rate-dot" /></Tooltip>}
          {r.name}
        </span>
      ),
    },
    {
      key: 'itemType', header: 'Item Type', fw: 8, align: 'center',
      cell: (r) => (
        <select className="field__control field__control--sm" value={r.itemType} onChange={(e) => patch(r.id, 'itemType', e.target.value)}>
          {ITEM_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      ),
      text: (r) => r.itemType,
    },
    {
      key: 'rateType', header: 'Rate Type', fw: 10, align: 'center',
      cell: (r) => (
        <select className="field__control field__control--sm" value={r.rateType} onChange={(e) => patch(r.id, 'rateType', e.target.value)}>
          {RATE_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      ),
      text: (r) => r.rateType,
    },
    {
      key: 'rate', header: 'Rate', fw: 7, align: 'right',
      cell: (r) => (
        <input
          type="number" step="0.01" className="field__control field__control--sm field__control--num"
          value={r.rate} onChange={(e) => patch(r.id, 'rate', Number(e.target.value))}
          aria-label={`Rate for ${r.name}`}
        />
      ),
      text: (r) => String(r.rate),
    },
    {
      key: 'profitPct', header: 'Profit %', fw: 6, align: 'right',
      cell: (r) => (
        <input
          type="number" className="field__control field__control--sm field__control--num"
          value={r.profitPct} onChange={(e) => patch(r.id, 'profitPct', Number(e.target.value))}
          aria-label={`Profit share for ${r.name}`}
        />
      ),
      text: (r) => String(r.profitPct),
    },
    {
      key: 'lossPct', header: 'Loss %', fw: 6, align: 'right',
      cell: (r) => (
        <input
          type="number" className="field__control field__control--sm field__control--num"
          value={r.lossPct} onChange={(e) => patch(r.id, 'lossPct', Number(e.target.value))}
          aria-label={`Loss share for ${r.name}`}
        />
      ),
      text: (r) => String(r.lossPct),
    },
  ];

  return (
    <>
      <PageHeader
        title={schedule.name}
        description={`${schedule.processor} · ${schedule.pricingType} · ${schedule.usersLinked} agent${schedule.usersLinked === 1 ? '' : 's'} linked`}
        meta={editedTotal > 0
          ? <Badge tone="warning" dot>{editedTotal} unsaved change{editedTotal === 1 ? '' : 's'}</Badge>
          : <Badge tone="success" dot>No unsaved changes</Badge>}
        actions={(
          <>
            <Button variant="secondary" size="sm" icon="arrowLeft" onClick={() => navigate(setupRoutes.pricingSchedules)}>Back</Button>
            <Button variant="secondary" size="sm" disabled={!editedTotal} onClick={() => { setEdits({}); toast.notify('Changes discarded.'); }}>Discard</Button>
            <Button variant="primary" size="sm" icon="check" disabled={!editedTotal} onClick={() => { toast.notify(`${editedTotal} rate${editedTotal === 1 ? '' : 's'} saved.`); setEdits({}); }}>
              Save {editedTotal || ''}
            </Button>
          </>
        )}
      />

      <div className="fi-detail__body">
        <Section title="Schedule">
          <FieldGrid columns={3}>
            <TextField {...form.field('name', 'Name')} required />
            <SelectField {...form.field('processor', 'Processor')} options={opts(brand.processors)} />
            <TextField {...form.field('startMonth', 'Start Month')} />
            <SelectField {...form.field('pricingType', 'Pricing Schedule Type')} options={opts(PRICING_TYPES)} required />
            <SelectField {...form.field('splitType', 'Split Type')} options={opts(SPLIT_TYPES)} required />
            <TextField {...form.field('description', 'Description')} />
            <TextField {...form.field('profitPct', 'Profit %')} type="number" required />
            <TextField {...form.field('lossPct', 'Loss %')} type="number" required />
          </FieldGrid>
        </Section>

        <Section title="Rates" collapsible={false}>
          {/* Category tabs carry their own edited count, so you can see what has
              moved elsewhere on the card without visiting every tab. */}
          <div className="rate-cats" role="tablist" aria-label="Rate category">
            {PRICING_CATEGORIES.map((c) => {
              const count = pricingItems(schedule.id, c.id).filter((i) => edits[i.id]).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={category === c.id}
                  className={`rate-cat ${category === c.id ? 'is-active' : ''}`.trim()}
                  onClick={() => { setCategory(c.id); setSelected(new Set()); }}
                >
                  {c.label}
                  <span className="rate-cat__count">{c.count}</span>
                  {count > 0 && (
              <Tooltip label={`${count} rate${count === 1 ? '' : 's'} changed but not yet saved`}>
                <span className="rate-cat__edited">{count}</span>
              </Tooltip>
            )}
                </button>
              );
            })}
          </div>

          {/* Bulk edit acts on the ticked rows only, and says how many before
              you commit — the reference applies to everything, silently. */}
          <div className={`bulk ${selected.size ? 'is-armed' : ''}`.trim()}>
            <span className="bulk__label">
              <Icon name="layers" size={14} />
              Multiple update
            </span>

            <select className="field__control field__control--sm" value={bulk.itemType} onChange={(e) => setBulk((b) => ({ ...b, itemType: e.target.value }))}>
              <option value="">Item type…</option>
              {ITEM_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>

            <select className="field__control field__control--sm" value={bulk.rateType} onChange={(e) => setBulk((b) => ({ ...b, rateType: e.target.value }))}>
              <option value="">Rate type…</option>
              {RATE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>

            <input
              type="number" step="0.01" className="field__control field__control--sm field__control--num"
              placeholder="Rate" value={bulk.rate}
              onChange={(e) => setBulk((b) => ({ ...b, rate: e.target.value }))}
              aria-label="Bulk rate"
            />

            <span className="bulk__count">
              {selected.size
                ? `${selected.size} item${selected.size === 1 ? '' : 's'} selected`
                : 'Tick items below to apply'}
            </span>

            <Button variant="primary" size="sm" disabled={!selected.size} onClick={applyBulk}>Apply</Button>
          </div>

          <ListTable
            key={category}
            columns={columns}
            rows={rows}
            selectable={false}
            searchPlaceholder="Search item name"
            exportName={`rates-${category}`}
            note={editedInCategory > 0 ? `${editedInCategory} item${editedInCategory === 1 ? '' : 's'} edited in this category.` : undefined}
            leftExtra={(
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelected((s) => (s.size === rows.length ? new Set() : new Set(rows.map((r) => r.id))))}
              >
                {selected.size === rows.length && rows.length ? 'Clear selection' : 'Select all in view'}
              </Button>
            )}
            empty="No priced items in this category."
          />
        </Section>
      </div>
    </>
  );
}

export default PricingScheduleDetail;
