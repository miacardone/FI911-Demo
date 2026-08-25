/**
 * COLUMN HELP — what each column actually means.
 *
 * These grids are dense and full of payments jargon: MID, TRN, ARN, MCC,
 * BuyRate, PassThru, sort codes, four different date columns that all look
 * alike. An operator who has not been trained on the product cannot tell
 * "Auth Date" from "Settle Date" from "Process Date" by looking.
 *
 * Rather than hand-write a `description` on several hundred column
 * definitions, the help text is keyed here — by column key first, then by
 * header text — and attached automatically in ListTable. A page can still
 * override by declaring its own `description`; this is only the fallback.
 *
 * Icon-only and abbreviated columns matter most: those are the ones with no
 * self-evident meaning at all.
 */

/** Keyed by column `key`. */
const BY_KEY = {
  /* Identity */
  participant: 'The bank or PSP this record belongs to',
  merchant: 'The trading business beneath the participant',
  accountName: 'Account holder and their account number',
  agent: 'Partner representative who introduced this participant',
  agentName: 'Partner representative who introduced this participant',
  assignedTo: 'Fi911 operator currently responsible for this record',
  assignee: 'Operator this notification is assigned to',
  contact: "The participant's own named contact",
  contactName: "The participant's own named contact",
  partner: 'Acquiring partner or portfolio the record settles through',
  processor: 'Payment processor handling this traffic',
  isoId: 'Independent Sales Organisation identifier',
  agentId: 'Agent identifier on the processor platform',
  institutionId: 'Financial institution identifier',
  mid: 'Merchant ID — the merchant’s account number with the processor',
  terminalId: 'Physical or virtual terminal the transaction ran through',
  portfolio: 'Pricing portfolio the participant is assigned to',
  groupName: 'Reporting group this merchant rolls up into',
  region: 'Region, channel or department that owns the relationship',

  /* Codes */
  sortCode: 'UK sort code identifying the bank branch (nn-nn-nn)',
  receivingSortCode: 'Sort code of the account receiving the funds',
  accountNumber: 'Bank account number, masked to the last four digits',
  bankAccount: 'Bank account number, masked to the last four digits',
  mcc: 'Merchant Category Code — the industry classification',
  mccCode: 'Merchant Category Code — the industry classification',
  trn: 'Transaction Reference Number assigned by the acquirer',
  arn: 'Acquirer Reference Number tracing the transaction through the network',
  caseNumber: 'Unique dispute case reference',
  batchId: 'Settlement batch this transaction belongs to',
  transactionId: 'Unique identifier for this transaction',
  authCode: 'Authorisation code returned by the issuer',
  typeReference: 'Processor reference for this dispute type',
  cardLast4: 'Last four digits of the card number',
  profileId: 'Residual profile the agent is paid under',

  /* Status */
  status: 'Current state of this record',
  midStatus: 'Whether the merchant ID is currently able to process',
  finalStatus: 'Outcome once the batch finished processing',
  fundingStatus: 'Whether the funding transfer completed',
  reserveStatus: 'Whether the withheld reserve is still held or released',
  payStatus: 'Whether the released reserve has actually been paid out',
  authResponse: 'Issuer response — Declined means the authorisation failed',
  outcome: 'How the dispute was ultimately resolved',
  cycle: 'Stage the dispute has reached in the escalation chain',
  priority: 'Urgency — arrow up is high, down is low',
  risk: 'Assessed risk tier for this participant',
  riskScore: 'Model score from 0–100; higher is riskier',
  tagged: 'Flagged for manual review',
  gatewayMatch: 'Whether the dispute matched a gateway transaction record',

  /* Dates */
  created: 'When the record was first created',
  creationDate: 'When the record was first created',
  statusChanged: 'When the status last changed',
  authDate: 'When the transaction was authorised',
  authDateTime: 'Date and time the authorisation was requested',
  settleDate: 'When the funds actually settled',
  processDate: 'When the funding entry was processed',
  postDate: 'When the dispute was posted to the account',
  dueDate: 'Deadline for responding before the case expires',
  due: 'Deadline for responding to this notification',
  closed: 'When the record was closed',
  boarded: 'When the merchant was first boarded',
  boardedDate: 'When the merchant was first boarded',
  alertDate: 'When the alert was raised',
  batchDate: 'Date of the settlement batch',
  fundingDate: 'Date the deposit was funded',
  transactionDate: 'Date the transaction took place',
  contractDate: 'Date the reserve agreement was signed',
  month: 'Billing or residual month this row covers',
  residualMonth: 'Month the residual income was earned',
  payoutMonth: 'Month the residual was actually paid',
  reserveMonth: 'Month the reserve was funded',
  fromMonth: 'Start of the trended period',
  toMonth: 'End of the trended period',
  openDate: 'When the portfolio assignment opened',
  close: 'When the portfolio assignment closed',

  /* Money and counts */
  volume: 'Total value processed',
  income: 'Gross income earned before costs',
  expense: 'Cost of processing, deducted from income',
  grossProfit: 'Income minus expense',
  payout: 'Amount actually paid to the agent',
  grossPayout: 'Payout before adjustments',
  payoutToOthers: 'Share of the payout owed to other agents',
  adjustments: 'Manual corrections applied to this payout',
  buyRate: 'Cost rate paid to the processor',
  rateType: 'How the fee is charged — per Count, per Volume, or PassThru at cost',
  feePercent: 'Interchange rate applied to this transaction',
  baseFee: 'Fixed fee applied on top of the percentage rate',
  interchange: 'Interchange cost paid to the issuing bank',
  netAmount: 'Amount remaining after interchange',
  qualification: 'Interchange band the transaction qualified into',
  settlement: 'Amount settled to the participant for the month',
  reserve: 'Funds withheld against future chargeback exposure',
  rate: 'Percentage of settlement withheld as reserve',
  transactions: 'Number of transactions in scope',
  disputeAmount: 'Value of the disputed transaction',
  countRatio: 'Disputes as a percentage of transactions',
  amountRatio: 'Disputed value as a percentage of processed value',
  highest: 'Largest single transaction in the last three months',
  heldAmount: 'Value currently withheld by a risk rule',
  netDeposit: 'Deposit after chargebacks and refunds are deducted',
  chargebacks: 'Value clawed back through chargebacks',
  refunds: 'Value returned to cardholders',

  /* Risk rules */
  flagName: 'Name of the risk rule',
  flagType: 'Trans applies per transaction; Batch applies to a whole batch',
  p1: 'Primary threshold the rule tests against',
  p2: 'Secondary threshold; N/A where the rule needs only one',
  rule: 'Risk rule or rules that withheld this volume',
  actionedBy: 'Who cleared the alert; blank means nobody has picked it up',
  totalRules: 'Number of risk rules this batch tripped',

  /* Misc */
  type: 'Classification of this record',
  cardType: 'Card scheme used for the transaction',
  currency: 'Currency the amount is denominated in',
  description: 'Free-text detail for this record',
  reasonCategory: 'Why the cardholder disputed the transaction',
  fundingCategory: 'What this funding line was for',
  sender: 'Who raised the notification',
  recipient: 'Desk or participant the notification was routed to',
  splits: 'Number of ways the income was split',
  splitTo: 'Party receiving the split',
  splitFrom: 'Party the split came from',
  merchants: 'Number of merchants included',
  parameter: 'Which measure is being trended',
  period: 'Basis the period is measured on',
  profiles: 'Number of residual profiles held by this agent',
  participants: 'Number of participants under this agent',
};

/** Fallback keyed by header text, for columns whose key is generic. */
const BY_HEADER = {
  'Auth (#)': 'Number of authorisations',
  'Auth (£)': 'Value of authorisations',
  'Refund (#)': 'Number of refunds',
  'Refund (£)': 'Value of refunds',
  'Net (#)': 'Authorisations less refunds, by count',
  'Net (£)': 'Authorisations less refunds, by value',
  'Sales (#)': 'Number of sales in the batch',
  'Sales (£)': 'Value of sales in the batch',
  'Dispute #': 'Number of disputes raised',
  'Dispute £': 'Value of disputes raised',
  'Transaction (#)': 'Number of transactions processed',
  'Transaction (£)': 'Value of transactions processed',
  'Credits (#)': 'Number of ACH credits',
  'Debits (#)': 'Number of ACH debits',
  'Held Transactions (#)': 'Number of transactions withheld',
  'Held Amount (£)': 'Value withheld pending review',
  'Total Rules': 'Number of risk rules tripped',
  'Risk Profile': 'Risk tier — red up is high, amber up is medium, green down is low',
  Tagged: 'Flagged for manual review',
  Actions: 'Row actions available for this record',
};

const normalise = (h) => String(h ?? '').replace(/\.\.\.$/, '').replace(/…$/, '').trim();

/** Look up help for a column, preferring an explicit `description`. */
export function helpFor(column) {
  if (column.description) return column.description;
  return BY_KEY[column.key] ?? BY_HEADER[normalise(column.header)] ?? null;
}

/** Attach fallback descriptions to a column list. */
export function withColumnHelp(columns) {
  return columns.map((c) => {
    const description = helpFor(c);
    return description && !c.description ? { ...c, description } : c;
  });
}

export default withColumnHelp;

/* ------------------------------------------------------------------ *
 * STATUS MEANINGS
 * ------------------------------------------------------------------ *
 * A status badge names a state but never explains it. "Do Not Represent",
 * "Merchant On Hold" and "Released" all read as English and none of them tell
 * a new operator what actually happened or what they are expected to do next.
 * The badge carries this on hover, so the vocabulary is learnable from the
 * grid rather than from a manual.
 */

const STATUS_HELP = {
  /* Participant funnel */
  'new': 'Created but not yet picked up by anyone.',
  'new lead': 'Captured from an enquiry; no contact made yet.',
  'wip lead': 'Being worked — contact made, application not yet submitted.',
  'in progress': 'Actively being worked by the assigned owner.',
  'pending': 'Waiting on someone outside this team — usually the participant.',
  'open': 'Live and unresolved.',
  'assigned': 'Has an owner and is queued for work.',
  'submitted to underwriting': 'Handed to the underwriting desk for a decision.',
  'manual review required': 'Automated checks were inconclusive; a human decision is needed.',
  'approved': 'Underwriting passed. Not yet processing.',
  'new contract': 'Approved and contracted, awaiting boarding.',
  'onboarded': 'Boarded and able to process.',
  'live': 'Processing transactions now.',
  'declined': 'Rejected — no further action.',
  'dead lead': 'Abandoned. Kept for reporting only.',
  'closed': 'Ended. No longer processing.',
  'completed': 'Finished, nothing outstanding.',
  'expired': 'Passed its deadline without action and can no longer be worked.',

  /* Risk */
  'merchant on hold': 'Settlement suspended pending a risk decision.',
  'flagged': 'Tripped a rule and is waiting on a decision.',
  'released': 'Reviewed and allowed to settle.',
  'held': 'Funds retained pending further evidence.',
  'active': 'Operating normally.',
  'suspended': 'Temporarily stopped; can be reinstated.',
  'locked': 'Sign-in blocked.',
  'inactive': 'Configured but switched off.',

  /* Disputes */
  'do not represent': 'A decision was taken not to contest this chargeback.',
  'won': 'Represented successfully — funds retained.',
  'lost': 'Represented and lost — funds go to the cardholder.',
  'represented': 'Evidence submitted; awaiting the issuer.',

  /* Jobs and imports */
  'in progress ': 'Currently running.',
  'completed with errors': 'Finished, but some rows failed and were skipped.',
  'failed': 'Did not finish. Nothing was written.',
  'cancelled': 'Stopped before completion by an operator.',
  'scheduled': 'Not started yet — waiting for its start date.',
  'recalculating': 'Figures are being rebuilt and may move.',
  'calculated': 'Figures are final for this cycle.',

  /* Approvals */
  'pending approval': 'Calculated but not yet signed off; it will not pay until it is.',
  'on hold': 'Deliberately excluded from this payout cycle.',
  'rejected': 'Sent back — the calculation will not pay as it stands.',
  'under review': 'A case is open and being investigated.',
  'escalated': 'Raised to a second line for a decision.',
  'resolved': 'Case closed with an outcome recorded.',
  'closed — no action': 'Case closed; nothing was wrong.',
  'unmapped': 'Not attached to a portfolio, so it pays out to nobody.',
};

/** Plain-English meaning of a status value, if one is known. */
export const statusHelp = (value) => STATUS_HELP[String(value ?? '').trim().toLowerCase()] ?? null;
