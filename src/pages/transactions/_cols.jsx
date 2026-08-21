import { CardBrand, LinkCell, Money, Muted, StatusBadge, TwoLine, moneyText, moneyTotal } from '@/components/fi911/cells';
import { formatNumber, formatPercent } from '@/utils/format';

/**
 * Column builders shared by the Transactions screens.
 *
 * Money, counts and two-line identity cells recur on every one of the nine
 * grids, so the shapes are defined once here. A page then reads as a list of
 * what it shows rather than a wall of repeated cell renderers.
 */

export const money = (key, header, fw = 9) => ({
  key, header, fw, align: 'right', sortable: true,
  sortValue: (r) => r[key],
  text: (r) => moneyText(r[key]),
  cell: (r) => <Money value={r[key]} />,
  totalCell: moneyTotal,
});

export const count = (key, header, fw = 7) => ({
  key, header, fw, align: 'right', sortable: true,
  cell: (r) => formatNumber(r[key]),
});

export const text = (key, header, fw = 10) => ({ key, header, fw, sortable: true });

export const twoLine = (key, header, primary, secondary, fw = 14) => ({
  key, header, fw, sortable: true,
  cell: (r) => <TwoLine primary={primary(r)} secondary={secondary(r)} />,
  text: (r) => `${primary(r)} ${secondary(r)}`,
});

export const status = (key, header, fw = 9) => ({
  key, header, fw, sortable: true, cell: (r) => <StatusBadge value={r[key]} />,
});

export const card = (key = 'cardType', header = 'Card Type', fw = 10) => ({
  key, header, fw, sortable: true,
  cell: (r) => <CardBrand scheme={r[key]} />, text: (r) => r[key],
});

export const link = (key, header, onClick, fw = 10) => ({
  key, header, fw, sortable: true,
  cell: (r) => <LinkCell onClick={() => onClick?.(r)}>{r[key]}</LinkCell>,
});

/** A declined response is the thing an operator is scanning for, so it is red. */
export const response = (key, header, fw = 9) => ({
  key, header, fw, sortable: true,
  cell: (r) => (r[key] === 'Declined'
    ? <span className="money--neg" style={{ fontWeight: 600 }}>{r[key]}</span>
    : r[key]),
});

export const percent = (key, header, fw = 9, digits = 4) => ({
  key, header, fw, align: 'right', sortable: true,
  cell: (r) => Number(r[key]).toFixed(digits),
});

export { Muted };
