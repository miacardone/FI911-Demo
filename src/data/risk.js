/**
 * RISK MANAGEMENT.
 *
 * The merchant book, the alerts raised against it, the volume held as a
 * result, and the rules that decide all of it.
 *
 * RULE DESCRIPTIONS ARE TEMPLATES. Each rule stores its description with
 * `{parameter_1}` / `{parameter_2}` placeholders and its parameters
 * separately, so the Rules grid and the Edit modal's live preview render from
 * one source. The reference bakes the numbers into the prose, which is why
 * editing a threshold there leaves the description describing the old value.
 */

import { createDraw } from '@/data/rng';
import { PROCESSOR_MERCHANTS, RISK_MERCHANTS } from '@/data/reference';
import brand from '@/brand/brand.config';

/* ------------------------------------------------------------------ *
 * Dashboard
 * ------------------------------------------------------------------ */

export const RISK_KPIS = [
  { id: 'avg_score', label: 'Average Risk Score', value: '99.0', icon: 'shieldCheck', tone: 'neutral', hint: 'Average portfolio vulnerability across monitored merchants' },
  { id: 'high_risk', label: 'High Risk Merchants', value: '8', icon: 'alert', tone: 'danger', hint: 'Estimated population currently mapped to the high risk tier' },
  { id: 'kyc_pending', label: 'KYC Pending Reviews', value: '5', icon: 'userCheck', tone: 'neutral', hint: 'Merchant files still waiting for analyst clearance' },
  { id: 'fraud_rate', label: 'Fraud Detection Rate', value: '88%', icon: 'eye', tone: 'neutral', hint: 'Signals correctly escalated during the latest review cycle' },
  { id: 'violations', label: 'Compliance Violations', value: '1', icon: 'ban', tone: 'danger', hint: 'Open policy exceptions requiring remediation follow-up' },
  { id: 'alerts_today', label: 'Risk Alerts Today', value: '21', icon: 'trendingUp', tone: 'neutral', hint: 'New alerts routed into analyst triage since midnight' },
];

export const RISK_DISTRIBUTION = [
  { id: 'high', label: 'High Risk', value: 39, color: '#C42B21' },
  { id: 'medium', label: 'Medium Risk', value: 45, color: '#E0A32E' },
  { id: 'low', label: 'Low Risk', value: 16, color: '#1D6FE0' },
];

export const FLAGGED_TREND = [
  { label: '2026/03/20', value: 12 },
  { label: '2026/04/20', value: 14 },
  { label: '2026/05/20', value: 16 },
  { label: '2026/06/20', value: 18 },
  { label: '2026/07/20', value: 19 },
  { label: '2026/08/20', value: 21 },
];

export const TOP_FLAGGED_VOLUME = [
  { label: 'Chase Paymentech Ashland Antiques', value: 52_400_000 },
  { label: 'Fiserv Wells Tewkesbury Forge', value: 38_900_000 },
  { label: 'Chase Paymentech Fairfield Garden Rooms', value: 36_200_000 },
  { label: 'Worldpay Ximenes Spice Importers', value: 28_100_000 },
  { label: 'Fiserv Wells Zeals Honey Farm', value: 24_300_000 },
];

export const TOP_VULNERABILITY = [
  { label: 'TSYS Montrose Seafood Bar', value: 100 },
  { label: 'Chase Paymentech Oakvale Cheese Co', value: 100 },
  { label: 'Fiserv Wells Tewkesbury Forge', value: 99 },
  { label: 'Chase Paymentech Fairfield Garden Rooms', value: 99 },
  { label: 'Chase Paymentech Ashland Antiques', value: 98 },
];

export const PARSED_FILES = [
  { id: 'f1', name: 'merchant-risk-daily-ingest.csv', size: '1.8 MB', status: 'Success', parsed: '2026/08/20', records: 33 },
  { id: 'f2', name: 'flagged-batch-monitoring.csv', size: '2.3 MB', status: 'Success', parsed: '2026/08/19', records: 20 },
  { id: 'f3', name: 'flagged-transactions-review.csv', size: '3.4 MB', status: 'Success', parsed: '2026/08/18', records: 58 },
  { id: 'f4', name: 'kyc-remediation-extract.csv', size: '1.1 MB', status: 'Failed', parsed: '2026/08/17', records: 0 },
];

export const PARSE_STATS = [
  { label: 'Files Parsed', value: PARSED_FILES.length },
  { label: 'Successful', value: PARSED_FILES.filter((f) => f.status === 'Success').length },
  { label: 'Failed', value: PARSED_FILES.filter((f) => f.status === 'Failed').length },
  { label: 'Records Processed', value: PARSED_FILES.reduce((s, f) => s + f.records, 0) },
];

/* ------------------------------------------------------------------ *
 * Merchants
 * ------------------------------------------------------------------ */

export const RISK_MERCHANT_ROWS = (() => {
  const d = createDraw(3311);
  const contacts = [
    'Belle Joseph', 'Jarvis Stark', 'Robert Martinez', 'Jennifer Davis', 'Maria Rodriguez',
    'John Anderson', 'Florence Well', 'Sara John', 'Mike Lewis', 'Lisa Thompson',
    'Emily Johnson', 'Michael Brown', 'Steve Johnson', 'Shawn Reeves', 'Karen Mills',
    'Dean Fletcher', 'Nina Roberts', 'Owen Clarke', 'Grace Hall', 'Peter Nash',
    'Tanya Brooks', 'Victor Shaw', 'Wendy Price', 'Xavier Dunn', 'Yasmin Cole',
    'Zach Turner', 'Amy Blake', 'Ben Foster', 'Cara Nolan', 'Dylan Pope',
    'Erin Vaughn', 'Felix Grant', 'Gina Marsh',
  ];

  return RISK_MERCHANTS.map((m, i) => ({
    id: `rm-${i}`,
    status: m.status,
    boarded: `2026/08/${String(14 + (i % 6)).padStart(2, '0')}`,
    merchant: m.name,
    processor: m.processor,
    contact: contacts[i % contacts.length],
    phone: `+1 (${d.digits(3)}) ${d.digits(3)}-${d.digits(4)}`,
    email: `${contacts[i % contacts.length].toLowerCase().replace(/\s+/g, '.')}@${m.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    mcc: m.mcc,
    risk: m.tier,
    tagged: m.tagged,
  }));
})();

export const MERCHANT_TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'active', label: 'Active', match: (r) => r.status === 'Active' },
  { value: 'onboarded', label: 'Onboarded', match: (r) => r.status === 'Onboarded' },
  { value: 'hold', label: 'On Hold', match: (r) => r.status.includes('Hold') },
  { value: 'closed', label: 'Closed', match: (r) => r.status === 'Closed' },
];

export const merchantTabs = (rows) => MERCHANT_TABS.map((t) => ({ ...t, count: rows.filter(t.match).length }));
export const filterMerchants = (rows, tab) => rows.filter((MERCHANT_TABS.find((t) => t.value === tab) ?? MERCHANT_TABS[0]).match);

export const MERCHANT_STATUSES = ['Active', 'Onboarded', 'Merchant On Hold', 'Closed'];

/* ------------------------------------------------------------------ *
 * Alert Action — batch and transaction summaries
 * ------------------------------------------------------------------ */

const MID_STATUSES = [['Active', 8], ['Suspended', 1], ['Inactive', 1]];

export const ALERT_BATCHES = (() => {
  const d = createDraw(8890);

  return Array.from({ length: 20 }, (_, i) => {
    const merchant = PROCESSOR_MERCHANTS[i % PROCESSOR_MERCHANTS.length];
    const processor = merchant.split(' ')[0] === 'Chase' ? 'Chase Paymentech'
      : merchant.split(' ')[0] === 'Global' ? 'Global Payments'
        : merchant.split(' ')[0] === 'First' ? 'First Data'
          : merchant.split(' ')[0];
    const total = d.int(2, 4);
    const totalValue = d.money(2900, 27500);

    return {
      id: `ab-${i}`,
      midStatus: d.weighted(MID_STATUSES),
      batchDate: `2026/08/${String(12 + (i % 8)).padStart(2, '0')}`,
      merchant,
      processor,
      mcc: d.pick(brand.mccs).code,
      batchId: `657100${String(i).padStart(2, '0')}`,
      lastVolume: d.money(2600, 25300),
      totalTransactions: total,
      totalValue,
      flaggedTransactions: total,
      flaggedValue: Math.round(totalValue * d.float(0.9, 1.05) * 100) / 100,
      totalRules: d.int(2, 3),
    };
  });
})();

export const ALERT_TRANSACTIONS = (() => {
  const d = createDraw(1177);
  const schemes = ['visa', 'mastercard', 'amex', 'discover'];
  const responses = ['00', '05', '10', '85'];

  return Array.from({ length: 58 }, (_, i) => {
    const batch = ALERT_BATCHES[i % ALERT_BATCHES.length];
    return {
      id: `at-${i}`,
      midStatus: batch.midStatus,
      transactionDate: batch.batchDate,
      merchant: batch.merchant,
      processor: batch.processor,
      mcc: batch.mcc,
      batchId: batch.batchId,
      transactionId: `TXN-${101 + (i % 9)}-${1001 + i}`,
      amount: d.money(1200, 2700),
      cardType: d.pick(schemes),
      authCode: `${String.fromCharCode(65 + (i % 4))}${d.digits(4)}`,
      response: d.pick(responses),
      riskScore: d.int(72, 95),
      flagged: d.int(1, 3),
    };
  });
})();

/* ------------------------------------------------------------------ *
 * Held Volume
 * ------------------------------------------------------------------ */

export const HELD_VOLUME = [
  { id: 'hv-1', status: 'Cleared', alertDate: '2026/08/19', merchant: 'Wealth RB', processor: 'TSYS', mcc: '7399', boarded: '2026/03/14', rule: 'DuplicateCard,Exceed Daily Trans Per Card', transactions: 1494, amount: 627321.00, actionedBy: 'Mark Finnegan' },
  { id: 'hv-2', status: 'Cleared', alertDate: '2026/08/19', merchant: 'S-Paragon.com', processor: 'TSYS', mcc: '5967', boarded: '2026/03/13', rule: 'Exceed Daily Trans Per Card', transactions: 3440, amount: 134500.00, actionedBy: 'Donald Kossmann' },
  { id: 'hv-3', status: 'Pending', alertDate: '2026/08/19', merchant: 'ECHO.NET', processor: 'TSYS', mcc: '5045', boarded: '2026/03/12', rule: 'High Risk Transaction Pattern', transactions: 892, amount: 245780.50, actionedBy: '' },
  { id: 'hv-4', status: 'Under Review', alertDate: '2026/08/19', merchant: 'SELTOS LLC', processor: 'TSYS', mcc: '5045', boarded: '2026/03/18', rule: 'Velocity Check Failed', transactions: 567, amount: 89432.25, actionedBy: 'Risk Management Team' },
  { id: 'hv-5', status: 'Cleared', alertDate: '2026/08/19', merchant: 'Parsing lay', processor: 'TSYS', mcc: '5045', boarded: '2026/03/17', rule: 'Exceed Daily Trans Per Card', transactions: 2156, amount: 456789.75, actionedBy: 'Bucks Fisher' },
  { id: 'hv-6', status: 'Pending', alertDate: '2026/08/19', merchant: 'Fiserv Merchant-High 02', processor: 'Fiserv', mcc: '5411', boarded: '2026/03/17', rule: 'Suspicious Activity Pattern', transactions: 1823, amount: 312567.80, actionedBy: '' },
  { id: 'hv-7', status: 'Cleared', alertDate: '2026/08/19', merchant: 'Chase Merchant-High 03', processor: 'Chase Paymentech', mcc: '5734', boarded: '2026/03/16', rule: 'DuplicateCard,High Volume Alert', transactions: 3789, amount: 892345.60, actionedBy: 'Mark Finnegan' },
  { id: 'hv-8', status: 'Under Review', alertDate: '2026/08/19', merchant: 'Global Payments Merchant', processor: 'Global Payments', mcc: '5999', boarded: '2026/03/22', rule: 'Exceed Daily Trans Per Card', transactions: 1245, amount: 198765.40, actionedBy: 'Risk Management Team' },
  { id: 'hv-9', status: 'Cleared', alertDate: '2026/08/19', merchant: 'First Data Merchant-Low', processor: 'First Data', mcc: '5812', boarded: '2026/03/21', rule: 'Velocity Check Failed', transactions: 678, amount: 123456.90, actionedBy: 'Donald Kossmann' },
  { id: 'hv-10', status: 'Pending', alertDate: '2026/08/19', merchant: 'Worldpay Merchant-High', processor: 'Worldpay', mcc: '5541', boarded: '2026/03/15', rule: 'High Risk Transaction Pattern', transactions: 2934, amount: 567890.25, actionedBy: '' },
  { id: 'hv-11', status: 'Cleared', alertDate: '2026/08/19', merchant: 'TSYS Merchant-Medium 04', processor: 'TSYS', mcc: '5311', boarded: '2026/03/16', rule: 'Exceed Daily Trans Per Card', transactions: 1567, amount: 298456.30, actionedBy: 'Mark Finnegan' },
  { id: 'hv-12', status: 'Under Review', alertDate: '2026/08/18', merchant: 'Fiserv Merchant-Low 05', processor: 'Fiserv', mcc: '5942', boarded: '2026/03/17', rule: 'Suspicious Activity Pattern,Velocity Check Failed', transactions: 2345, amount: 445678.90, actionedBy: 'Risk Management Team' },
  { id: 'hv-13', status: 'Pending', alertDate: '2026/08/18', merchant: 'Chase Merchant-Low 06', processor: 'Chase Paymentech', mcc: '5661', boarded: '2026/03/18', rule: 'High Risk Transaction Pattern', transactions: 789, amount: 156234.75, actionedBy: '' },
  { id: 'hv-14', status: 'Cleared', alertDate: '2026/08/18', merchant: 'Global Payments Merchant-High', processor: 'Global Payments', mcc: '5999', boarded: '2026/03/19', rule: 'DuplicateCard,Exceed Daily Trans Per Card', transactions: 1102, amount: 388102.45, actionedBy: 'Donald Kossmann' },
  { id: 'hv-15', status: 'Pending', alertDate: '2026/08/18', merchant: 'TSYS Merchant-High 04', processor: 'TSYS', mcc: '5967', boarded: '2026/03/20', rule: 'High Volume Alert', transactions: 1988, amount: 512004.10, actionedBy: '' },
];

export const HELD_TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'cleared', label: 'Cleared', match: (r) => r.status === 'Cleared' },
  { value: 'pending', label: 'Pending', match: (r) => r.status === 'Pending' },
  { value: 'review', label: 'Under Review', match: (r) => r.status === 'Under Review' },
];

export const heldTabs = (rows) => HELD_TABS.map((t) => ({ ...t, count: rows.filter(t.match).length }));
export const filterHeld = (rows, tab) => rows.filter((HELD_TABS.find((t) => t.value === tab) ?? HELD_TABS[0]).match);

/* ------------------------------------------------------------------ *
 * Rules
 * ------------------------------------------------------------------ */

export const RULES = [
  { name: 'Daily aggregated refund limit', type: 'Trans', priority: 'high', p1: '50', p2: 'NA', description: 'Todays Approved Auth {parameter_1}% of Contract Daily AND Todays Approved Auth {parameter_1}% AND Todays Approved Auth Increase vs 90 Day AVG Daily Gross Sales {parameter_1}%' },
  { name: '1 Percent Rule (Monthly Flag)', type: 'Trans', priority: 'high', p1: '1', p2: '200', description: 'Flags transaction where For Each batch Total Monthly Sales Volume is greater than {parameter_1}% of High Monthly Volume of MID with threshold ${parameter_2}' },
  { name: 'ACH Return $ Threshold', type: 'Batch', priority: 'medium', p1: '200', p2: 'NA', description: 'ACH Return = AMT of a Single ACH Return for Current Day IF ACH Return > ${parameter_1} THEN alert' },
  { name: 'Auth $ Exceeding Threshold', type: 'Batch', priority: 'medium', p1: '200', p2: 'NA', description: 'IF Daily Approved Auth Increase > ${parameter_1} THEN alert' },
  { name: 'AverageBatchTrending', type: 'Batch', priority: 'medium', p1: '125', p2: 'NA', description: 'Actual batch compared to the previous month Average Batch if variance is greater than {parameter_1}% display on the Exceptions reports' },
  { name: 'AverageTicketOverApplication', type: 'Trans', priority: 'low', p1: '100', p2: 'NA', description: 'Flags transaction where For Each batch Actual Avg Ticket Amt minus Application Avg Ticket If the difference is equal to or greater than ${parameter_1} then display on the Exceptions report' },
  { name: 'Avg Ticket Over from Signed Avg Ticket', type: 'Batch', priority: 'high', p1: '300', p2: 'NA', description: 'IF the current average ticket is ${parameter_1}+ the signed average ticket THEN flag the batch' },
  { name: 'Bad Auth - High Daily Decline Rate', type: 'Trans', priority: 'low', p1: '15', p2: 'NA', description: 'If total number of declined authorizations / total authorizations * 100 is greater than {parameter_1}% flag merchant account' },
  { name: 'Bad Auth-High 5 Day Decline Rate', type: 'Batch', priority: 'high', p1: '30', p2: '3', description: 'If total number of declined authorizations / total authorizations*100 for trailing {parameter_2} days is GREATER THAN {parameter_1}% flag merchant account' },
  { name: 'Credit WithOut OffSet', type: 'Trans', priority: 'medium', p1: '150', p2: '265', description: 'Flags transaction which is of return type and there is no corresponding Sales transaction within {parameter_2} days above ${parameter_1}' },
  { name: 'DuplicateCard', type: 'Trans', priority: 'high', p1: '3', p2: 'NA', description: 'Flags where the same card number is used more than {parameter_1} times within a single batch' },
  { name: 'Exceed Daily Trans Per Card', type: 'Trans', priority: 'high', p1: '5', p2: 'NA', description: 'Flags where a single card exceeds {parameter_1} transactions in one processing day' },
  { name: 'High Risk MCC Monitor', type: 'Batch', priority: 'medium', p1: '5967', p2: 'NA', description: 'Flags any batch processed under high risk MCC {parameter_1}' },
  { name: 'High Volume Alert', type: 'Batch', priority: 'high', p1: '500000', p2: 'NA', description: 'IF daily settled volume exceeds ${parameter_1} THEN flag the merchant for review' },
  { name: 'Large Ticket Monitor', type: 'Trans', priority: 'medium', p1: '5000', p2: 'NA', description: 'Flags any single transaction greater than ${parameter_1}' },
  { name: 'Monthly Volume Over Application', type: 'Batch', priority: 'medium', p1: '150', p2: 'NA', description: 'Flags where actual monthly volume exceeds the applied volume by {parameter_1}%' },
  { name: 'New Merchant High Volume', type: 'Batch', priority: 'high', p1: '90', p2: '250000', description: 'Flags merchants boarded within {parameter_1} days settling more than ${parameter_2}' },
  { name: 'Refund Rate Threshold', type: 'Trans', priority: 'high', p1: '10', p2: 'NA', description: 'If refunds / total sales * 100 is greater than {parameter_1}% flag merchant account' },
  { name: 'Suspicious Activity Pattern', type: 'Trans', priority: 'high', p1: '4', p2: '24', description: 'Flags {parameter_1} or more high-value authorisations from one device inside {parameter_2} hours' },
  { name: 'Swiped vs Keyed Variance', type: 'Batch', priority: 'low', p1: '40', p2: 'NA', description: 'Flags where keyed transactions exceed the applied mix by {parameter_1}%' },
  { name: 'Trailing 30 Day Chargeback Ratio', type: 'Batch', priority: 'high', p1: '1', p2: '30', description: 'If chargebacks / sales * 100 over trailing {parameter_2} days exceeds {parameter_1}% flag merchant account' },
  { name: 'Unmatched Settlement Batch', type: 'Batch', priority: 'medium', p1: '2', p2: 'NA', description: 'Flags settlement files that fail to match after {parameter_1} reconciliation attempts' },
  { name: 'Velocity Check Failed', type: 'Trans', priority: 'high', p1: '10', p2: '60', description: 'Flags {parameter_1} or more authorisations from one card inside {parameter_2} minutes' },
  { name: 'Void Rate Threshold', type: 'Trans', priority: 'low', p1: '8', p2: 'NA', description: 'If voids / total authorisations * 100 is greater than {parameter_1}% flag merchant account' },
  { name: 'Zero Dollar Auth Spike', type: 'Trans', priority: 'medium', p1: '25', p2: 'NA', description: 'Flags a spike of more than {parameter_1} zero-value authorisations in one day' },
].map((r, i) => ({ id: `rule-${i}`, active: true, ...r }));

/**
 * Render a rule description with its parameters substituted in.
 * Returns segments so the caller can style the substituted values — the grid
 * shows them bold-blue, which is how an operator sees at a glance which parts
 * of the sentence are configurable.
 */
export function renderRuleDescription(rule) {
  const parts = String(rule.description).split(/(\{parameter_[12]\})/g);
  return parts.filter(Boolean).map((part, i) => {
    if (part === '{parameter_1}') return { key: i, value: rule.p1, isParam: true };
    if (part === '{parameter_2}') return { key: i, value: rule.p2, isParam: true };
    return { key: i, value: part, isParam: false };
  });
}

export const ruleDescriptionText = (rule) =>
  renderRuleDescription(rule).map((s) => s.value).join('');

export const RULE_TYPES = ['Trans', 'Batch'];
export const RULE_PRIORITIES = ['high', 'medium', 'low'];
