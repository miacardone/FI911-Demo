import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { Money, Muted, StatusBadge, TwoLine, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import { Badge, Button, Kpi } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import { MAPPING_TABS, MERCHANT_MAPPING, PORTFOLIO_PROFILES } from '@/data/setup';
import { RecordFormModal } from '@/components/fi911/RecordFormModal';
import { useToast } from '@/context/ToastContext';
import brand from '@/brand/brand.config';

/**
 * Setup > Residuals > Merchant Mapping.
 *
 * Attach merchants to the portfolio that pays out on them. An unmapped
 * merchant earns revenue that reaches nobody's residual.
 *
 * The reference marks system suggestions with a red "••" and a legend reading
 * "System suggested Portfolio" — the suggestion has no reason and no
 * confidence, so accepting it is an act of faith. Here each suggestion says
 * WHY it was made and how confident it is, and can be accepted in one click
 * from the row. Accepting them in bulk is possible because the confidence
 * makes it safe to filter on.
 */

export function MerchantMapping() {
  const toast = useToast();
  const [tab, setTab] = useState('unmapped');
  const [rows, setRows] = useState(MERCHANT_MAPPING);
  const [target, setTarget] = useState('');

  const visible = useMemo(
    () => rows.filter((MAPPING_TABS.find((t) => t.value === tab) ?? MAPPING_TABS[0]).match),
    [rows, tab],
  );
  const tabs = MAPPING_TABS.map((t) => ({ ...t, count: rows.filter(t.match).length }));

  const unmapped = rows.filter((r) => !r.portfolio);
  const suggested = unmapped.filter((r) => r.suggestion);
  const highConfidence = suggested.filter((r) => r.suggestion.confidence >= 85);
  const unmappedVolume = unmapped.reduce((s, r) => s + r.monthlyVolume, 0);

  const [mapping, setMapping] = useState(null);

  const mapTo = (ids, portfolio, label) => {
    setRows((rs) => rs.map((r) => (ids.includes(r.id)
      ? { ...r, portfolio, suggestion: null, effectiveStart: brand.today.replace(/-/g, '/'), updated: brand.today.replace(/-/g, '/') }
      : r)));
    toast.notify(label);
  };

  const columns = [
    menuColumn((r) => [
      r.suggestion && {
        label: `Accept: ${r.suggestion.portfolio.split(' — ')[0]}`,
        icon: 'check',
        onSelect: () => mapTo([r.id], r.suggestion.portfolio, `${r.merchant} mapped to ${r.suggestion.portfolio}.`),
      },
      /* Was a hint pointing at the toolbar, which is a dead end from inside a
         row menu. Picking the portfolio here is what the menu item promises. */
      { label: 'Map manually…', icon: 'branch', onSelect: () => setMapping(r) },
      r.portfolio && { label: 'Unmap', icon: 'close', tone: 'danger', onSelect: () => mapTo([r.id], '', `${r.merchant} unmapped.`) },
    ]),
    {
      key: 'merchant', header: 'Merchant', fw: 18, sortable: true,
      cell: (r) => <TwoLine primary={r.merchant} secondary={`MID: ${r.mid}`} />,
      text: (r) => `${r.merchant} ${r.mid}`,
    },
    {
      key: 'portfolio', header: 'Portfolio', fw: 24, sortable: true,
      cell: (r) => {
        if (r.portfolio) return r.portfolio;
        if (!r.suggestion) return <Badge tone="danger" dot>Unmapped</Badge>;
        return (
          <span className="suggest">
            <Tooltip label={`Suggested because: ${r.suggestion.basis}`}>
              <span className={`suggest__conf ${r.suggestion.confidence >= 85 ? 'is-high' : ''}`.trim()}>
                {r.suggestion.confidence}%
              </span>
            </Tooltip>
            <span className="suggest__name">{r.suggestion.portfolio}</span>
            <button
              type="button"
              className="suggest__accept"
              onClick={(e) => { e.stopPropagation(); mapTo([r.id], r.suggestion.portfolio, `${r.merchant} mapped to ${r.suggestion.portfolio}.`); }}
            >
              <Icon name="check" size={12} /> Accept
            </button>
          </span>
        );
      },
      text: (r) => r.portfolio || r.suggestion?.portfolio || 'Unmapped',
      description: 'The portfolio that pays out on this merchant. A suggestion shows its confidence and why it was made.',
    },
    {
      key: 'monthlyVolume', header: 'Monthly Volume', fw: 11, align: 'right', sortable: true,
      cell: (r) => <Money value={r.monthlyVolume} />, text: (r) => moneyText(r.monthlyVolume), totalCell: moneyTotal,
      description: 'What is at stake — volume on an unmapped merchant reaches nobody’s residual',
    },
    { key: 'processor', header: 'Processor', fw: 9, align: 'center', sortable: true },
    { key: 'repCode', header: 'Rep Code', fw: 7, align: 'center', sortable: true, cell: (r) => (r.repCode ? r.repCode : <Muted>—</Muted>) },
    { key: 'openedDate', header: 'Opened', fw: 8, align: 'center', sortable: true },
    { key: 'effectiveStart', header: 'Effective Start', fw: 8, align: 'center', sortable: true, cell: (r) => (r.effectiveStart ? r.effectiveStart : <Muted>—</Muted>) },
    { key: 'updated', header: 'Updated', fw: 8, align: 'center', sortable: true, cell: (r) => (r.updated ? r.updated : <Muted>—</Muted>) },
    { key: 'merchantStatus', header: 'Merchant Status', fw: 9, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.merchantStatus} /> },
  ];

  return (
    <ListPage
      title="Merchant Mapping"
      description="Attach merchants to the portfolio that pays out on them"
      tabs={tabs}
      tab={tab}
      onTabChange={setTab}
      headerActions={highConfidence.length > 0 && (
        <Button
          variant="primary"
          size="sm"
          icon="check"
          onClick={() => {
            const ids = highConfidence.map((r) => r.id);
            setRows((rs) => rs.map((r) => (ids.includes(r.id)
              ? { ...r, portfolio: r.suggestion.portfolio, suggestion: null, effectiveStart: brand.today.replace(/-/g, '/'), updated: brand.today.replace(/-/g, '/') }
              : r)));
            toast.notify(`${ids.length} merchant${ids.length === 1 ? '' : 's'} mapped from high-confidence suggestions.`);
          }}
        >
          Accept {highConfidence.length} high-confidence
        </Button>
      )}
    >
      <div className="queue-kpis">
        <Kpi label="Unmapped merchants" value={unmapped.length} meta="Earning revenue that reaches no residual" invert />
        <Kpi label="Volume at stake" value={moneyText(unmappedVolume)} meta="Monthly volume on unmapped merchants" invert />
        <Kpi label="Suggestions ready" value={suggested.length} meta={`${highConfidence.length} at 85% confidence or better`} />
        <Kpi label="Portfolios" value={PORTFOLIO_PROFILES.length} meta="Available mapping targets" />
      </div>

      <ListTable
        key={tab}
        columns={columns}
        rows={visible}
        searchPlaceholder="Search merchant or MID"
        exportName="merchant-mapping"
        totals={['monthlyVolume']}
        leftExtra={(
          <label className="wq-assign">
            <span className="wq-assign__label">Assign to</span>
            <select className="field__control field__control--sm" value={target} onChange={(e) => setTarget(e.target.value)}>
              <option value="">Choose a portfolio…</option>
              {PORTFOLIO_PROFILES.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
            </select>
          </label>
        )}
        rightExtra={(
          <Button
            variant="secondary"
            size="sm"
            disabled={!target}
            onClick={() => mapTo(visible.filter((r) => !r.portfolio).map((r) => r.id), target, `${visible.filter((r) => !r.portfolio).length} merchants mapped to ${target}.`)}
          >
            Assign view
          </Button>
        )}
        empty="Nothing in this view."
      />
      <RecordFormModal
        open={Boolean(mapping)}
        onClose={() => setMapping(null)}
        title="mapping"
        submitLabel="Map merchant"
        fields={[{
          name: 'portfolio',
          label: 'Map to portfolio',
          type: 'select',
          required: true,
          options: PORTFOLIO_PROFILES.map((x) => x.name),
        }]}
        initial={mapping ? { portfolio: mapping.portfolio ?? '' } : null}
        onSubmit={(v) => mapTo([mapping.id], v.portfolio, `${mapping.merchant} mapped to ${v.portfolio}.`)}
      />
    </ListPage>
  );
}

export default MerchantMapping;
