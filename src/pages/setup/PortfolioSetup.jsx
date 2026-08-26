import { ListPage } from '@/components/fi911/ListPage';
import { Money, Muted, StatusBadge, TwoLine, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import { Badge, Button } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import { PORTFOLIO_SETUP } from '@/data/setup';
import { setupRoutes } from '@/data/navigation';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImportButton } from '@/components/fi911/ImportButton';
import { useToast } from '@/context/ToastContext';
import { useRecords } from '@/hooks/useRecords';
import { RecordFormModal } from '@/components/fi911/RecordFormModal';
import brand from '@/brand/brand.config';

/**
 * Setup > Residuals > Portfolio Setup.
 *
 * The container residuals are calculated against.
 *
 * The reference shows Portfolio Name, Merchants, and four audit dates. What it
 * cannot tell you is that a portfolio is missing merchants — and a portfolio
 * missing merchants pays out short, silently, until the month closes. The
 * unmapped count is surfaced here and links straight to Merchant Mapping.
 */

const PORTFOLIO_FIELDS = [
  { name: 'name', label: 'Portfolio Name', required: true },
  { name: 'processor', label: 'Processor', type: 'select', options: brand.processors, required: true },
  { name: 'startDate', label: 'Start Date' },
];

export function PortfolioSetup() {
  const navigate = useNavigate();
  const toast = useToast();
  const store = useRecords(PORTFOLIO_SETUP, { key: 'id' });

  const [draft, setDraft] = useState(null);
  const editing = draft && Object.keys(draft).length > 0 ? draft : null;

  const columns = [
    menuColumn((r) => [
      { label: 'Edit portfolio', icon: 'edit', onSelect: () => setDraft(r) },
      r.unmapped > 0 && { label: `Map ${r.unmapped} merchant${r.unmapped === 1 ? '' : 's'}`, icon: 'branch', onSelect: () => navigate(setupRoutes.merchantMapping) },
      {
        label: r.status === 'Active' ? 'Deactivate' : 'Activate',
        icon: 'power',
        tone: r.status === 'Active' ? 'danger' : undefined,
        onSelect: () => toast.notify(`${r.name} is now ${store.toggleStatus(r).toLowerCase()}.`),
      },
    ]),
    { key: 'name', header: 'Portfolio Name', fw: 26, sortable: true, cell: (r) => <TwoLine primary={r.name} secondary={r.processor} />, text: (r) => `${r.name} ${r.processor}` },
    { key: 'merchants', header: 'Merchants', fw: 7, align: 'center', sortable: true },
    {
      key: 'unmapped', header: 'Unmapped', fw: 8, align: 'center', sortable: true,
      cell: (r) => (r.unmapped
        ? (
          <Tooltip label="Merchants that belong here but are not mapped — they pay out short until they are">
            <Badge tone="danger" dot>{r.unmapped}</Badge>
          </Tooltip>
        )
        : <Muted>0</Muted>),
      text: (r) => String(r.unmapped),
      description: 'Merchants expected in this portfolio but not yet mapped to it',
    },
    {
      key: 'monthlyResidual', header: 'Monthly Residual', fw: 11, align: 'right', sortable: true,
      cell: (r) => (r.monthlyResidual ? <Money value={r.monthlyResidual} /> : <Muted>—</Muted>),
      text: (r) => moneyText(r.monthlyResidual), totalCell: moneyTotal,
    },
    { key: 'startDate', header: 'Start Date', fw: 8, align: 'center', sortable: true },
    { key: 'created', header: 'Created', fw: 8, align: 'center', sortable: true },
    { key: 'modified', header: 'Last Modified', fw: 8, align: 'center', sortable: true },
    { key: 'modifiedBy', header: 'Modified By', fw: 11, sortable: true },
    { key: 'status', header: 'Status', fw: 7, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  const totalUnmapped = PORTFOLIO_SETUP.reduce((s, r) => s + r.unmapped, 0);

  return (
    <ListPage
      title="Portfolio Setup"
      description="The containers residuals are calculated against"
      headerActions={(
        <>
          {totalUnmapped > 0 && (
            <Button variant="secondary" size="sm" icon="branch" onClick={() => navigate(setupRoutes.merchantMapping)}>
              {totalUnmapped} unmapped
            </Button>
          )}
          <ImportButton noun="portfolios" />
          <Button variant="primary" size="sm" icon="plus" onClick={() => setDraft({})}>New</Button>
        </>
      )}
      columns={columns}
      rows={store.rows}
      searchPlaceholder="Search portfolio name"
      exportName="portfolio-setup"
      totals={['merchants', 'unmapped', 'monthlyResidual']}
      empty="No portfolios configured."
      footer={(
        <RecordFormModal
          open={Boolean(draft)}
          onClose={() => setDraft(null)}
          title="portfolio"
          fields={PORTFOLIO_FIELDS}
          initial={editing}
          onSubmit={(v) => (editing
            ? store.update(editing, v)
            : store.create({
              id: `new-pso-${store.rows.length}`,
              status: 'Active', merchants: 0, unmapped: 0, monthlyResidual: 0,
              created: brand.today.replace(/-/g, '/'), modified: brand.today.replace(/-/g, '/'),
              ...v,
            }))}
        />
      )}
    />
  );
}

export default PortfolioSetup;
