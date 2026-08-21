import { useState } from 'react';
import { ListPage } from '@/components/fi911/ListPage';
import { LinkCell, Money, moneyText } from '@/components/fi911/cells';
import { AGENT_PAYOUTS, PAYOUT_SCOPE } from '@/data/residuals';
import { formatNumber } from '@/utils/format';
import { useToast } from '@/context/ToastContext';

/** Agent Payout Summary — one row per agent per payout month.
 *  "No Of Profiles" and "Participants" are links because in the reference each
 *  drills into the set behind the number. */

export function AgentPayoutSummary() {
  const toast = useToast();

  const columns = [
    { key: 'residualMonth', header: 'Residual Month', fw: 10, sortable: true },
    { key: 'payoutMonth', header: 'Payout Month', fw: 10, sortable: true },
    { key: 'type', header: 'Type', fw: 6, sortable: true },
    { key: 'agent', header: 'Agent', fw: 14, sortable: true },
    {
      key: 'profiles', header: 'No Of Profiles', fw: 9, align: 'right', sortable: true,
      cell: (r) => <LinkCell onClick={() => toast.notify(`${r.profiles} profile(s) for ${r.agent}.`)}>{r.profiles}</LinkCell>,
    },
    {
      key: 'participants', header: 'Participants', fw: 9, align: 'right', sortable: true,
      cell: (r) => <LinkCell onClick={() => toast.notify(`${r.participants} participants under ${r.agent}.`)}>{r.participants}</LinkCell>,
    },
    { key: 'transactions', header: 'Transactions', fw: 9, align: 'right', sortable: true, cell: (r) => formatNumber(r.transactions) },
    { key: 'volume', header: 'Volume', fw: 10, align: 'right', sortable: true, sortValue: (r) => r.volume, text: (r) => moneyText(r.volume), cell: (r) => <Money value={r.volume} /> },
    { key: 'income', header: 'Income', fw: 9, align: 'right', sortable: true, sortValue: (r) => r.income, text: (r) => moneyText(r.income), cell: (r) => <Money value={r.income} /> },
    { key: 'expense', header: 'Expense', fw: 9, align: 'right', sortable: true, sortValue: (r) => r.expense, text: (r) => moneyText(r.expense), cell: (r) => <Money value={r.expense} /> },
    { key: 'grossProfit', header: 'Gross Profit', fw: 9, align: 'right', sortable: true, sortValue: (r) => r.grossProfit, text: (r) => moneyText(r.grossProfit), cell: (r) => <Money value={r.grossProfit} /> },
  ];

  return (
    <ListPage
      title="Agent Payout Summary"
      description="View and manage agent payout summaries and residual calculations"
      scope={PAYOUT_SCOPE}
      columns={columns}
      rows={AGENT_PAYOUTS}
      searchPlaceholder="Search records"
      exportName="agent-payout-summary"
      empty="No payouts for this period."
    />
  );
}

export default AgentPayoutSummary;
