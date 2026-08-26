import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import {
  CardBrand, LinkCell, Money, Muted, StatusBadge, TwoLine, menuColumn, moneyText, moneyTotal,
} from '@/components/fi911/cells';
import { AlertBadges, useAlertLegend } from '@/components/fi911/AlertCodes';
import { Badge, Button, Kpi } from '@/components/ui/Surface';
import { Drawer, Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import { ACTION_HISTORY, ACTION_TABS } from '@/data/riskQueue';
import { downloadAttachment } from '@/utils/export';
import { useToast } from '@/context/ToastContext';
import { CURRENT_USER, initialsFor } from '@/data/people';
import brand from '@/brand/brand.config';

/**
 * RISK > ACTION HISTORY.
 *
 * Every risk decision already taken, and the case each one belongs to.
 *
 * The reference's Case Management panel lists "View Comments" and "View
 * Attachments" as links that lead nowhere — the two things you actually opened
 * the case to read. Here the comments and the attachments are ON the case, so
 * the drawer shows them, and a new comment can be added without leaving it.
 *
 * The other addition is `responseDays`: alert date and action date are both in
 * the reference, but nothing subtracts them, so the one number that says
 * whether the desk is keeping up has to be worked out by eye, per row.
 */

const ADVANCED_FIELDS = [
  { name: 'transactionId', label: 'Transaction ID' },
  { name: 'mid', label: 'MID' },
  { name: 'merchant', label: 'Merchant Name' },
  { name: 'partner', label: 'Partner Name' },
  { name: 'actionStatus', label: 'Action Status', type: 'select', options: ['Released', 'Declined', 'Held'].map((v) => ({ value: v, label: v })) },
  { name: 'sourceType', label: 'Source Type', type: 'select', options: ['Settlement', 'Authorization'].map((v) => ({ value: v, label: v })) },
  { name: 'alertDate', label: 'Alert Date', type: 'date' },
  { name: 'actionDate', label: 'Action Date', type: 'date' },
];

function ResponseTime({ days }) {
  const tone = days > 4 ? 'danger' : days > 2 ? 'warning' : 'success';
  return (
    <Tooltip label={`Alerted and decided ${days === 0 ? 'the same day' : `${days} day${days === 1 ? '' : 's'} apart`}`}>
      <span className={`resp resp--${tone}`}>{days}d</span>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ *
 * Case Management drawer
 * ------------------------------------------------------------------ */

function CaseDrawer({ row, onClose }) {
  const toast = useToast();
  const [draft, setDraft] = useState('');
  const [comments, setComments] = useState([]);

  const c = row?.case;
  const all = c ? [...c.comments, ...comments] : [];

  if (!row) return null;

  return (
    <Drawer open onClose={onClose} title={`Case ${c.caseId}`} width={420}>
      <div className="case">
        <div className="case__head">
          <span className="case__merchant">
            <span className="case__merchant-name">{row.merchant}</span>
            <span className="case__merchant-mid">MID {row.mid}</span>
          </span>
          <Badge tone={c.priority === 'high' ? 'danger' : c.priority === 'medium' ? 'warning' : 'neutral'} dot>
            {c.priority} priority
          </Badge>
        </div>

        {/* A stat STRIP rather than eight bare label/value pairs: the figures
            are what an analyst scans, and unbounded rows of them read as a
            wall of text. The risk meter takes the full width because it is a
            position on a scale, not a value. */}
        <div className="case__stats">
          <span className="case__stat"><span className="case__label">Case Status</span><StatusBadge value={c.caseStatus} /></span>
          <span className="case__stat"><span className="case__label">Transaction</span><StatusBadge value={row.actionStatus} /></span>
          <span className="case__stat"><span className="case__label">Flagged Amount</span><strong className="case__figure"><Money value={c.flaggedAmount} /></strong></span>
          <span className="case__stat"><span className="case__label">Total Settlements</span><strong className="case__figure"><Money value={c.totalSettlements} /></strong></span>
          <span className="case__stat"><span className="case__label">Created</span><strong>{c.createdDate}</strong></span>
          <span className="case__stat">
            <span className="case__label">Decided</span>
            <strong>{row.actionDate} <ResponseTime days={row.responseDays} /></strong>
          </span>
          <span className="case__stat"><span className="case__label">Assigned To</span><strong>{c.assignedTo || <Muted>Unassigned</Muted>}</strong></span>
          <span className="case__stat"><span className="case__label">Priority</span><strong className="case__priority">{c.priority}</strong></span>
        </div>

        <div className="case__risk">
          <span className="case__label">Risk Score</span>
          <span className="case__score">
            <span className="case__score-bar">
              <span
                className={`case__score-fill case__score-fill--${c.riskScore >= 66 ? 'high' : c.riskScore >= 33 ? 'mid' : 'low'}`}
                style={{ width: `${Math.min(Math.max(c.riskScore, 0), 100)}%` }}
              />
            </span>
            <strong className="case__score-value">{c.riskScore}</strong>
          </span>
        </div>

        <div className="case__block">
          <span className="case__block-title">Flagged rules</span>
          <AlertBadges codes={c.flaggedRules} max={12} />
        </div>

        <div className="case__block">
          <span className="case__block-title">Attachments ({c.attachments.length})</span>
          {c.attachments.length === 0
            ? <span className="case__empty">Nothing attached to this case.</span>
            : (
              <ul className="case__files">
                {c.attachments.map((a) => (
                  <li key={a.id}>
                    <Icon name="paperclip" size={13} className="subtle" />
                    <button type="button" className="link" onClick={() => { downloadAttachment(a, { Case: c.caseId }); toast.notify(`${a.name} downloaded.`); }}>{a.name}</button>
                    <span className="case__file-size">{a.sizeMb} MB</span>
                  </li>
                ))}
              </ul>
            )}
        </div>

        <div className="case__block">
          <span className="case__block-title">Comments ({all.length})</span>
          {all.length === 0 && <span className="case__empty">No comments yet.</span>}
          <ul className="case__comments">
            {all.map((cm) => (
              <li key={cm.id}>
                <span className="case__avatar" aria-hidden="true">{initialsFor(cm.author)}</span>
                <span className="case__comment">
                  <span className="case__comment-head">
                    <strong>{cm.author}</strong>
                    <span className="case__comment-date">{cm.date}</span>
                  </span>
                  <span className="case__comment-body">{cm.text}</span>
                </span>
              </li>
            ))}
          </ul>

          <textarea
            className="field__control case__draft"
            rows={3}
            placeholder="Add a comment…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button
            variant="primary"
            size="sm"
            icon="send"
            disabled={!draft.trim()}
            onClick={() => {
              setComments((list) => [...list, { id: `new-${list.length}`, author: CURRENT_USER.name, date: brand.today.replace(/-/g, '/'), text: draft.trim() }]);
              setDraft('');
              toast.notify('Comment added to the case.');
            }}
          >
            Add comment
          </Button>
        </div>
      </div>
    </Drawer>
  );
}

/* ------------------------------------------------------------------ */

export function ActionHistory() {
  const legend = useAlertLegend();
  const [tab, setTab] = useState('all');
  const [caseRow, setCaseRow] = useState(null);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});

  const rows = useMemo(
    () => applyFilters(
      ACTION_HISTORY.filter((ACTION_TABS.find((t) => t.value === tab) ?? ACTION_TABS[0]).match),
      ADVANCED_FIELDS,
      applied,
    ),
    [tab, applied],
  );

  const tabs = ACTION_TABS.map((t) => ({ ...t, count: ACTION_HISTORY.filter(t.match).length }));

  const avgResponse = ACTION_HISTORY.reduce((s, r) => s + r.responseDays, 0) / ACTION_HISTORY.length;
  const slow = ACTION_HISTORY.filter((r) => r.responseDays > 4).length;
  const openCases = ACTION_HISTORY.filter((r) => r.case.caseStatus === 'Under Review' || r.case.caseStatus === 'Escalated').length;
  const declinedValue = ACTION_HISTORY.filter((r) => r.actionStatus === 'Declined').reduce((s, r) => s + r.amount, 0);

  const columns = [
    menuColumn((r) => [
      { label: 'Case management', icon: 'folder', onSelect: () => setCaseRow(r) },
      { label: 'View comments', icon: 'message', onSelect: () => setCaseRow(r) },
      { label: 'View attachments', icon: 'paperclip', onSelect: () => setCaseRow(r) },
    ]),
    { key: 'transactionId', header: 'Transaction ID', fw: 10, sortable: true },
    {
      key: 'merchant', header: 'Merchant', fw: 16, sortable: true,
      cell: (r) => <TwoLine primary={r.merchant} secondary={`MID: ${r.mid}`} />,
      text: (r) => `${r.merchant} ${r.mid}`,
    },
    { key: 'partner', header: 'Partner Name', fw: 13, sortable: true },
    { key: 'amount', header: 'Amount', fw: 8, align: 'right', sortable: true, cell: (r) => <Money value={r.amount} />, text: (r) => moneyText(r.amount), totalCell: moneyTotal },
    { key: 'actionStatus', header: 'Action Status', fw: 8, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.actionStatus} /> },
    { key: 'responseDays', header: 'Response', fw: 6, align: 'center', sortable: true, cell: (r) => <ResponseTime days={r.responseDays} />, text: (r) => `${r.responseDays}d`, description: 'Days between the alert firing and the operator deciding' },
    { key: 'batchAlerts', header: 'Batch Alert', fw: 11, align: 'center', cell: (r) => <AlertBadges codes={r.batchAlerts} max={2} />, text: (r) => r.batchAlerts.join(' ') },
    { key: 'transAlerts', header: 'Trans Alert', fw: 9, align: 'center', cell: (r) => <AlertBadges codes={r.transAlerts} max={2} empty={<Muted>—</Muted>} />, text: (r) => r.transAlerts.join(' ') },
    { key: 'alertDate', header: 'Alert Date', fw: 8, align: 'center', sortable: true },
    { key: 'actionDate', header: 'Action Date', fw: 8, align: 'center', sortable: true },
    { hiddenByDefault: true, key: 'transactionDate', header: 'Transaction Date', fw: 9, align: 'center', sortable: true },
    { hiddenByDefault: true, key: 'entryMode', header: 'POS Entry Mode', fw: 9, align: 'center', sortable: true },
    { hiddenByDefault: true, key: 'transactionType', header: 'Transaction Type', fw: 8, align: 'center', sortable: true },
    { hiddenByDefault: true, key: 'sourceType', header: 'Source Type', fw: 8, align: 'center', sortable: true },
    { hiddenByDefault: true, key: 'cardNumber', header: 'Card Number', fw: 11, align: 'center' },
    { key: 'scheme', header: 'Card Type', fw: 8, align: 'center', sortable: true, cell: (r) => <CardBrand scheme={r.scheme} />, text: (r) => r.scheme },
    {
      key: 'case', header: 'Case', fw: 8, align: 'center', sortable: true,
      sortValue: (r) => r.case.caseId,
      cell: (r) => <LinkCell onClick={() => setCaseRow(r)}>{r.case.caseId}</LinkCell>,
      text: (r) => r.case.caseId,
      description: 'Opens the case record — status, risk score, comments and attachments',
    },
  ];

  return (
    <ListPage
      title="Action History"
      description="Risk decisions already taken, and the cases they belong to"
      tabs={tabs}
      tab={tab}
      onTabChange={setTab}
    >
      <div className="queue-kpis">
        <Kpi label="Average response" value={`${avgResponse.toFixed(1)} days`} meta="Alert fired to decision made" />
        <Kpi label="Slow decisions" value={slow} meta="Took more than 4 days" invert />
        <Kpi label="Cases still open" value={openCases} meta="Under review or escalated" invert />
        <Kpi label="Value declined" value={moneyText(declinedValue)} meta="Transactions stopped at review" />
      </div>

      {legend.panel}

      <ListTable
        key={tab}
        columns={columns}
        rows={rows}
        searchPlaceholder="Search MID or merchant name"
        exportName="action-history"
        totals={['amount']}
        onRowClick={(r) => setCaseRow(r)}
        onAdvanced={() => setAdvancedOpen((v) => !v)}
        advancedOpen={advancedOpen}
        advanced={(
          <AdvancedSearchPanel
            fields={ADVANCED_FIELDS}
            values={criteria}
            onChange={setCriteria}
            onSearch={() => { setApplied(criteria); setAdvancedOpen(false); }}
            onClear={() => { setCriteria({}); setApplied({}); }}
          />
        )}
        rightExtra={legend.button}
        empty="No decisions match this view."
      />

      <CaseDrawer row={caseRow} onClose={() => setCaseRow(null)} />
    </ListPage>
  );
}

export default ActionHistory;
