import { ListPage } from '@/components/fi911/ListPage';
import { Money, Muted, StatusBadge, TwoLine, menuColumn, moneyText, moneyTotal } from '@/components/fi911/cells';
import { Badge, Button } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import { PORTFOLIO_SETUP } from '@/apm/data/setup';
import { setupRoutes } from '@/apm/data/navigation';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';

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

export function PortfolioSetup() {
  const navigate = useNavigate();
  const toast = useToast();

  const columns = [
    menuColumn((r) => [
      { label: 'Edit portfolio', icon: 'edit', onSelect: () => toast.notify(`Editing ${r.name}.`) },
      r.unmapped > 0 && { label: `Map ${r.unmapped} merchant${r.unmapped === 1 ? '' : 's'}`, icon: 'branch', onSelect: () => navigate(setupRoutes.merchantMapping) },
      { label: 'Change status', icon: 'power', onSelect: () => toast.notify(`${r.name} status changed.`) },
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
          <Button variant="secondary" size="sm" icon="upload" onClick={() => toast.notify('Import portfolios as CSV.')}>Import</Button>
          <Button variant="primary" size="sm" icon="plus" onClick={() => toast.notify('New portfolio.')}>New</Button>
        </>
      )}
      columns={columns}
      rows={PORTFOLIO_SETUP}
      searchPlaceholder="Search portfolio name"
      exportName="portfolio-setup"
      totals={['merchants', 'unmapped', 'monthlyResidual']}
      empty="No portfolios configured."
    />
  );
}

export default PortfolioSetup;
