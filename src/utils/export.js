/**
 * Copy / Excel / CSV — the three export controls every data table carries.
 *
 * All three build from the same rows and the same visible columns, so what you
 * export is exactly what you can see.
 */

const escapeCsv = (value) => {
  const s = value == null ? '' : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function toDelimited(columns, rows, delimiter = ',') {
  const header = columns.map((c) => escapeCsv(c.header)).join(delimiter);
  const body = rows.map((row) =>
    columns.map((c) => escapeCsv(c.exportValue ? c.exportValue(row) : row[c.key])).join(delimiter),
  );
  return [header, ...body].join('\n');
}

function download(content, filename, mime) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export const downloadCsv = (columns, rows, name = 'export') =>
  download(toDelimited(columns, rows, ','), `${name}.csv`, 'text/csv;charset=utf-8;');

/** Tab-separated with an .xls extension — opens straight into Excel without a library. */
export const downloadExcel = (columns, rows, name = 'export') =>
  download(toDelimited(columns, rows, '\t'), `${name}.xls`, 'application/vnd.ms-excel;charset=utf-8;');

export async function copyToClipboard(columns, rows) {
  const text = toDelimited(columns, rows, '\t');
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/**
 * Download an attachment.
 *
 * These are generated records with no bytes behind them, so instead of
 * pretending to stream a PDF the console writes a short receipt naming the
 * file, its size and where it came from. That is a real download of the only
 * thing the demo actually holds — and it beats a "Download started." toast
 * that starts nothing.
 */
export function downloadAttachment(attachment, context = {}) {
  const lines = [
    `File: ${attachment.name}`,
    attachment.sizeMb != null ? `Size: ${attachment.sizeMb} MB` : null,
    attachment.description ? `Description: ${attachment.description}` : null,
    ...Object.entries(context).map(([k, v]) => `${k}: ${v}`),
    '',
    'This demo holds generated records rather than real files. This receipt',
    'stands in for the document itself.',
  ].filter(Boolean);

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${String(attachment.name).replace(/\.[^.]+$/, '')}.txt`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
