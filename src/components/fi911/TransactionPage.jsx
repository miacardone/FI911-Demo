import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import {
  AdvancedSearchPanel, CustomFilterPanel, HistoricalRecordsPanel, applyFilters,
} from '@/components/fi911/Filters';
import { CUSTOM_FILTER_FIELDS, HISTORICAL_FIELDS, TXN_SCOPE } from '@/data/transactions';

/**
 * THE TRANSACTIONS PAGE SHELL.
 *
 * All nine Transactions screens are the same four-tab object — Summary /
 * Details / Custom Filter / Historical Records — differing only in their
 * columns and their rows. Some omit Summary (Gateway, Qualifications,
 * Merchant Reserves lead with Details) and one omits Details (Funding
 * Deposits), so the tab set is derived from which datasets the caller
 * actually passes rather than declared twice.
 *
 * Custom Filter and Historical Records both render a filter panel ABOVE their
 * own table, and they filter independently of each other — that separation is
 * the point of having both. Custom Filter narrows the grid and can be saved as
 * a named report; Historical Records emails an archive extract and leaves the
 * grid alone.
 */

export function TransactionPage({
  title,
  description,
  scope = TXN_SCOPE,
  scopeLabel,

  summaryColumns,
  summaryRows,
  summaryNote,

  detailColumns,
  detailRows,
  detailNote,

  advancedFields,
  customFields = CUSTOM_FILTER_FIELDS,
  historicalFields = HISTORICAL_FIELDS,

  exportName,
  historicalNote,
}) {
  const hasSummary = Boolean(summaryColumns && summaryRows);
  const hasDetails = Boolean(detailColumns && detailRows);

  const tabs = [
    hasSummary && { value: 'summary', label: 'Summary', count: summaryRows.length },
    hasDetails && { value: 'details', label: 'Details' },
    { value: 'custom', label: 'Custom Filter' },
    { value: 'historical', label: 'Historical Records' },
  ].filter(Boolean);

  const [tab, setTab] = useState(tabs[0].value);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});

  const [custom, setCustom] = useState({});
  const [customApplied, setCustomApplied] = useState({});
  const [historical, setHistorical] = useState({});

  /* The grid the Custom Filter tab narrows is whichever grain the page leads
     with — Details where it exists, otherwise Summary. */
  const baseColumns = hasDetails ? detailColumns : summaryColumns;
  const baseRows = hasDetails ? detailRows : summaryRows;

  const fields = advancedFields ?? customFields;

  const filteredSummary = useMemo(
    () => (hasSummary ? applyFilters(summaryRows, fields, applied) : []),
    [hasSummary, summaryRows, fields, applied],
  );
  const filteredDetails = useMemo(
    () => (hasDetails ? applyFilters(detailRows, fields, applied) : []),
    [hasDetails, detailRows, fields, applied],
  );
  const customRows = useMemo(
    () => applyFilters(baseRows, customFields, customApplied),
    [baseRows, customFields, customApplied],
  );

  return (
    <ListPage
      title={title}
      description={description}
      tabs={tabs}
      tab={tab}
      onTabChange={setTab}
      scope={scopeLabel ? [{ label: 'Search By', value: scopeLabel }, ...scope] : scope}
    >
      {tab === 'custom' && (
        <>
          <CustomFilterPanel
            fields={customFields}
            values={custom}
            onChange={setCustom}
            onApply={() => setCustomApplied(custom)}
            onClear={() => { setCustom({}); setCustomApplied({}); }}
          />
          <ListTable
            columns={baseColumns}
            rows={customRows}
            note={`Showing ${customRows.length} of ${baseRows.length} records.`}
            searchPlaceholder="Search filtered records"
            exportName={`${exportName}-custom`}
            empty="No records match this filter."
          />
        </>
      )}

      {tab === 'historical' && (
        <>
          <HistoricalRecordsPanel
            fields={historicalFields}
            values={historical}
            onChange={setHistorical}
            onClear={() => setHistorical({})}
            note={historicalNote}
          />
          <ListTable
            columns={baseColumns}
            rows={[]}
            searchPlaceholder="Search archived records"
            exportName={`${exportName}-historical`}
            empty="Choose a date range and email the report to retrieve archived records."
          />
        </>
      )}

      {(tab === 'summary' || tab === 'details') && (
        <ListTable
          key={tab}
          columns={tab === 'summary' ? summaryColumns : detailColumns}
          rows={tab === 'summary' ? filteredSummary : filteredDetails}
          note={tab === 'summary' ? summaryNote : detailNote}
          searchPlaceholder={tab === 'summary' ? 'Search records' : 'Search detail records'}
          exportName={`${exportName}-${tab}`}
          onAdvanced={() => setAdvancedOpen((v) => !v)}
          advancedOpen={advancedOpen}
          advanced={(
            <AdvancedSearchPanel
              fields={fields}
              values={criteria}
              onChange={setCriteria}
              onSearch={() => { setApplied(criteria); setAdvancedOpen(false); }}
              onClear={() => { setCriteria({}); setApplied({}); }}
            />
          )}
          empty="No records match these criteria."
        />
      )}
    </ListPage>
  );
}

export default TransactionPage;
