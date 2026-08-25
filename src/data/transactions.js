/**
 * TRANSACTIONS — nine views of the money as it moves.
 *
 * Account Holder → Gateway → Authorizations → Settlements → Funding Category
 * → Funding Deposits, with ACH Listings, Qualifications and Merchant Reserves
 * alongside. Each screen is the same payments story at a different point in
 * the lifecycle, which is why they share reference data (merchants, partners,
 * routing numbers) rather than each inventing its own.
 *
 * All of these are seeded from rng.js with a per-dataset seed, so the grids
 * are large enough to paginate and stable across reloads.
 */

import { createDraw } from '@/data/rng';
import {
  ISO_PORTFOLIOS, MERCHANTS, PARTNERS, PROCESSOR_MERCHANTS, REGIONS,
  INSTITUTIONS, maskAccount, midFor, routingNumberFor,
} from '@/data/reference';
import brand from '@/brand/brand.config';

const SCHEMES = ['visa', 'mastercard', 'amex', 'discover', 'maestro', 'unionpay'];
const CARDHOLDERS = [
  'MELISSA BARNES', 'RICK PEREZ', 'DENNIS KLINE', 'KIMBERLY PRATT', 'MARY BATES',
  'OSCAR BLEVINS', 'JULIE SANDERSON', 'RUBY STEWART', 'AIDAN PRICE', 'PIPER NASH',
  'RITA GLOVER', 'GREGORY DALE', 'BRETT MODESTI', 'CULLEN J WILSON', 'SCOTT HANSON',
  'WEILAND MARINE', 'ROBERT LOPEZ', 'THYESHA *JAMES', 'VICTORY WAY CHRISTIAN',
  'LISA KIERNAN', 'CHARLES THOMAS', 'ROBIN GRAHAM',
];

const stamp = (d, month = 8) => `2026/${String(month).padStart(2, '0')}/${String(d).padStart(2, '0')}`;

/* ------------------------------------------------------------------ *
 * 1. Account Holder
 * ------------------------------------------------------------------ */

export const ACCOUNT_HOLDER_SUMMARY = (() => {
  const d = createDraw(6101);
  return Array.from({ length: 27 }, (_, i) => {
    const merchant = MERCHANTS[i % MERCHANTS.length];
    const inst = d.pick(INSTITUTIONS);
    const auths = d.int(1, 4);
    const authValue = d.money(19, 250);
    const disputes = d.int(0, 8);

    return {
      id: `ah-${i}`,
      accountName: merchant,
      accountNumber: d.digits(16),
      sendingPsp: inst.name,
      sendingCode: inst.routingNumber,
      disputeCount: disputes,
      disputeValue: d.money(1, 12),
      authDate: stamp(18),
      receivingSortCode: d.digits(8),
      authCount: auths,
      authValue,
      adjustmentCount: 0,
      adjustmentValue: 0,
      netCount: auths,
      netValue: authValue,
      type: 'PSP',
    };
  });
})();

export const ACCOUNT_HOLDER_DETAILS = (() => {
  const d = createDraw(6102);
  return Array.from({ length: 46 }, (_, i) => {
    const merchant = MERCHANTS[i % MERCHANTS.length];
    const inst = d.pick(INSTITUTIONS);
    return {
      id: `ahd-${i}`,
      accountName: merchant,
      accountNumber: d.digits(16),
      merchant: d.pick(['Fiserv Wells', 'TSYS Merrick', 'Chase Direct']),
      disputeCount: d.int(0, 2),
      disputeValue: d.money(0.25, 2.5),
      bankAccount: `${d.digits(4)}****${d.digits(4)}`,
      routingNumber: d.pick(INSTITUTIONS).routingNumber,
      bankName: inst.name,
      transactionType: 'AuthOnly',
      authResponse: 'Declined',
      authCode: d.digits(10),
      transactionId: d.digits(16),
      authAmount: d.money(5, 50),
      authDateTime: stamp(14),
      type: 'PSP',
    };
  });
})();

/* ------------------------------------------------------------------ *
 * 2. Gateway
 * ------------------------------------------------------------------ */

export const GATEWAY = (() => {
  const d = createDraw(6201);
  const merchants = PROCESSOR_MERCHANTS.slice(11);
  return Array.from({ length: 22 }, (_, i) => {
    const merchant = merchants[i % merchants.length];
    const partner = d.pick(PARTNERS.slice(8, 11));
    const approved = d.bool(0.78);
    return {
      id: `gw-${i}`,
      merchant: merchant,
      partner: partner.name,
      transactionId: `${d.digits(4)}.${d.digits(4)}.${d.digits(4)}`,
      accountNumber: `****${d.digits(8)}`,
      routingNumber: `${d.digits(2)}-${d.digits(2)}-${d.digits(2)}`,
      transactionType: d.pick(['Sale', 'Refund', 'Authorization']),
      transactionDate: stamp(20),
      amount: d.money(12, 260),
      type: d.pick(['TSYS', 'Fiserv', 'Global Payments']),
      status: approved ? 'Approved' : 'Declined',
    };
  });
})();

/* ------------------------------------------------------------------ *
 * 3. ACH Listings
 * ------------------------------------------------------------------ */

export const ACH_SUMMARY = (() => {
  const d = createDraw(6301);
  const isoIds = ['ISO_6109', 'U.S. Bank_UK', 'ISO_1116', 'ISO_6897', 'ISO_7679', 'ISO_0787', 'ISO_9106', 'ISO_7558', 'ISO_5101', 'BOS_UK'];
  return Array.from({ length: 15 }, (_, i) => {
    const iso = isoIds[i % isoIds.length];
    const completed = d.bool(0.78);
    const credits = d.int(0, 15);
    const creditValue = credits ? d.money(40, 5000) : 0;
    const debits = d.int(0, 15);

    return {
      id: `ach-${i}`,
      institutionId: d.digits(3),
      isoId: iso,
      agentId: iso,
      merchant: d.pick(MERCHANTS),
      partner: d.pick(INSTITUTIONS).name,
      authDate: stamp(14 + (i % 6)),
      finalStatus: completed ? 'Completed' : 'Rejected',
      creditCount: credits,
      creditValue,
      debitCount: debits,
      debitValue: 0,
      creditReturnCount: 0,
      creditReturnValue: 0,
      debitReturnCount: 0,
      debitReturnValue: 0,
      transactions: credits || debits,
      net: completed ? creditValue : -creditValue,
      processor: 'Fiserv',
    };
  });
})();

export const ACH_DETAILS = (() => {
  const d = createDraw(6302);
  return Array.from({ length: 38 }, (_, i) => ({
    id: `achd-${i}`,
    merchant: d.pick(MERCHANTS),
    partner: d.digits(10),
    terminalId: `${d.pick(['OV5RLROX9K0E', 'SOUTHDAKO001', 'ICARECRED004', 'CLEARINVE001', 'GEEKS-ONSI02', 'PERSONAL-M01'])}`,
    transactionId: d.digits(18),
    account: `****${d.digits(4)}`,
    transactionType: 'Credit',
    status: d.weighted([['Completed', 5], ['Rejected', 1]]),
    amount: d.money(20, 330),
    accountHolder: d.pick(CARDHOLDERS),
    authDate: stamp(14 + (i % 6)),
    completionDate: stamp(18 + (i % 3)),
    type: 'PSP',
  }));
})();

/* ------------------------------------------------------------------ *
 * 4. Authorizations
 * ------------------------------------------------------------------ */

export const AUTH_SUMMARY = (() => {
  const d = createDraw(6401);
  const merchants = ['Harrington & Sons LLC', 'Dunmore Travel LLC', 'Whitmore Building Supplies', 'Lakeside Garden Center', 'Summit Textiles Inc', 'Bridgeport Food Services'];
  return Array.from({ length: 12 }, (_, i) => {
    const isRefund = d.bool(0.3);
    const value = d.money(120, 12000);
    return {
      id: `au-${i}`,
      merchant: merchants[i % merchants.length],
      partner: d.pick(ISO_PORTFOLIOS),
      authDate: stamp(16 + (i % 5)),
      cardType: d.pick(SCHEMES),
      terminalId: d.pick(['QC1KJZ3STMPN', '100851700334', '100873224107', '100849111024', '100897159180', '100810326478']),
      authCount: isRefund ? 0 : 1,
      authValue: isRefund ? 0 : value,
      refundCount: isRefund ? 1 : 0,
      refundValue: isRefund ? -value : 0,
      netCount: 1,
      netValue: isRefund ? -value : value,
      processor: d.pick(['Fiserv', 'TSYS']),
    };
  });
})();

export const AUTH_DETAILS = (() => {
  const d = createDraw(6402);
  const types = ['Auth Only', 'Sale', 'Refund (Credit)', 'Capture', 'Purchase', 'Void', 'Incremental Auth', 'Auth Only Reversal', 'Inquiry', 'Force', 'Retry'];
  return Array.from({ length: 34 }, (_, i) => {
    const merchant = d.pick(MERCHANTS);
    return {
      id: `aud-${i}`,
      institutionId: d.pick(['211', '317']),
      isoId: d.pick(['WELLS_FI', 'MERRICK01', 'MERRICK02']),
      agentId: `AGT_${d.digits(4)}`,
      merchant,
      mid: midFor(merchant, 12),
      groupName: d.pick(ISO_PORTFOLIOS),
      region: d.pick(REGIONS),
      type: d.pick(['PSP', 'Merchant', 'Supplier']),
      cardLast4: d.digits(4),
      authCode: `${String.fromCharCode(65 + d.int(0, 12))}${d.digits(5)}`,
      terminalId: d.pick(['QC1KJZ3STMPN', '100851700334', '100873224107', '100849111024']),
      transactionId: `TID-2026032${d.int(0, 9)}-000${d.digits(3)}`,
      transactionType: types[i % types.length],
      cardType: d.pick(SCHEMES),
      authAmount: d.money(120, 12000),
      cardholder: d.pick(CARDHOLDERS),
      authDateTime: stamp(16 + (i % 5)),
      processor: d.pick(['Fiserv', 'TSYS']),
    };
  });
})();

/* ------------------------------------------------------------------ *
 * 5. Settlements
 * ------------------------------------------------------------------ */

export const SETTLEMENT_SUMMARY = (() => {
  const d = createDraw(6501);
  const rows = [
    { iso: 'PERSONIFY_INC', merchant: 'Pemberton Retail Group', mid: '559909667570001', bank: 'U.S. Bank', terminal: 'IFKQJQBYQ0Q', sales: 7, salesValue: 129251.25, refunds: 0, refundValue: 0 },
    { iso: 'MERCHANT_PREFERRED_Z', merchant: 'Highfield Sports Direct', mid: '557978610570016', bank: 'U.S. Bank', terminal: '100859927728', sales: 5, salesValue: 91255.75, refunds: 0, refundValue: 0 },
    { iso: 'ATM_ONE_INC', merchant: 'Kingsport Electronics Ltd', mid: '876595895970182', bank: 'U.S. Bank', terminal: 'OKDMVENIDT08', sales: 4, salesValue: 88600.00, refunds: 1, refundValue: -1890.00 },
    { iso: 'ATM_ONE_INC', merchant: 'Kingsport Electronics Ltd', mid: '876595895970182', bank: 'Wells Fargo Bank', terminal: 'OKDMVENIDT07', sales: 5, salesValue: 134721.80, refunds: 1, refundValue: -3420.00 },
    { iso: 'ATM_ONE_INC', merchant: 'Kingsport Electronics Ltd', mid: '876595895970182', bank: 'Wells Fargo Bank', terminal: 'OKDMVENIDT06', sales: 6, salesValue: 87317.05, refunds: 0, refundValue: 0 },
    { iso: 'ATM_ONE_INC', merchant: 'Kingsport Electronics Ltd', mid: '876595895970182', bank: 'Citibank', terminal: 'OKDMVENIDT05', sales: 6, salesValue: 47420.25, refunds: 0, refundValue: 0 },
  ];

  return rows.map((r, i) => ({
    id: `set-${i}`,
    institutionId: '107',
    isoId: r.iso,
    agentId: r.iso,
    merchant: r.merchant,
    mid: r.mid,
    bankName: r.bank,
    settleDate: stamp(18),
    terminalId: r.terminal,
    salesCount: r.sales,
    salesValue: r.salesValue,
    refundCount: r.refunds,
    refundValue: r.refundValue,
    netCount: r.sales + r.refunds,
    netValue: Math.round((r.salesValue + r.refundValue) * 100) / 100,
    processor: 'TSYS',
  }));
})();

export const SETTLEMENT_DETAILS = (() => {
  const d = createDraw(6502);
  return Array.from({ length: 30 }, (_, i) => {
    const base = SETTLEMENT_SUMMARY[i % SETTLEMENT_SUMMARY.length];
    const isRefund = d.bool(0.15);
    const amount = d.money(3200, 47500);
    return {
      id: `setd-${i}`,
      isoId: base.isoId,
      merchant: `${base.merchant} MID: ${base.mid}`,
      transactionType: isRefund ? 'Refund (Credit)' : d.pick(['Sale', 'Capture']),
      accountNumber: d.digits(8),
      routingNumber: d.pick(INSTITUTIONS).routingNumber,
      terminalId: base.terminalId,
      currency: 'USD',
      transactionId: `TXN-20250617-000${101 + i}`,
      authCode: `${String.fromCharCode(65 + d.int(0, 3))}${d.digits(5)}`,
      authDate: stamp(19),
      settleDate: stamp(18),
      salesAmount: isRefund ? -amount : amount,
      type: d.pick(['PSP', 'Merchant', 'Supplier']),
    };
  });
})();

/* ------------------------------------------------------------------ *
 * 6. Funding Category
 * ------------------------------------------------------------------ */

const FUNDING_CATEGORIES = ['Sale Transactions', 'Interchange Fee', 'Assessment Fee', 'Convenience Charge', 'Convenience Charge Third Party'];

export const FUNDING_CATEGORY_SUMMARY = (() => {
  const d = createDraw(6601);
  return Array.from({ length: 19 }, (_, i) => {
    const merchant = d.pick(MERCHANTS);
    const category = d.pick(FUNDING_CATEGORIES);
    const isFee = category !== 'Sale Transactions';
    const value = isFee ? -d.money(0.1, 105) : d.money(1.3, 102000);

    return {
      id: `fc-${i}`,
      merchant,
      mid: midFor(merchant, 15),
      partner: 'Citi Merchant Services',
      partnerCode: 'Code:int01',
      fundingCategory: category,
      processDate: stamp(14 + (i % 7)),
      fundingCount: d.int(1, 8),
      fundingValue: value,
      processor: d.pick(['TSYS', 'Fiserv']),
    };
  });
})();

export const FUNDING_CATEGORY_DETAILS = (() => {
  const d = createDraw(6602);
  return Array.from({ length: 26 }, (_, i) => {
    const merchant = d.pick(MERCHANTS);
    return {
      id: `fcd-${i}`,
      merchant,
      mid: midFor(merchant, 15),
      partner: 'Citi Merchant Services',
      partnerCode: 'Code:int01',
      fundingCategory: d.pick(FUNDING_CATEGORIES),
      accountNumber: `****${d.digits(4)}`,
      routingNumber: d.pick(INSTITUTIONS).routingNumber,
      amount: d.money(60, 630),
      processDate: stamp(14 + (i % 7)),
      type: d.pick(['PSP', 'Merchant']),
    };
  });
})();

/* ------------------------------------------------------------------ *
 * 7. Funding Deposits
 * ------------------------------------------------------------------ */

export const FUNDING_DEPOSITS = (() => {
  const d = createDraw(6701);
  const merchants = [
    'Riverton Timber Supply', 'Clearwater Catering Supply', 'Monroe Steel Fabricators',
    'Blue Ridge Holiday Park', 'Arbor Hill Bakers LLC', 'Pontypool Packaging Ltd',
    'Tredegar Office Interiors Ltd', 'Tredegar Office Interiors Ltd', 'Caerphilly Cheese & Deli Ltd',
    'Elmwood Engineering Ltd', 'Monmouth River Cruises', 'Lakewood Springs Spa LLC',
    'Welshpool Agricultural Traders', 'Newtown Furniture Makers Ltd', 'Aberystwyth Marine Chandlery',
  ];

  return merchants.map((merchant, i) => {
    const settle = d.bool(0.6) ? d.money(660, 85482) : 0;
    const chargebacks = d.bool(0.4) ? -d.money(70, 3396) : 0;
    const refunds = d.bool(0.4) ? -d.money(125, 2150) : 0;

    return {
      id: `fd-${i}`,
      merchant,
      fundingDate: stamp(10 + (i % 11)),
      currency: 'USD',
      settleBankcards: settle,
      settleNonBankcards: 0,
      chargebacks,
      refunds,
      netDeposit: Math.round((settle + chargebacks + refunds) * 100) / 100,
      fundingStatus: 'Success',
      processor: 'Fiserv',
    };
  });
})();

/* ------------------------------------------------------------------ *
 * 8. Qualifications
 * ------------------------------------------------------------------ */

const QUALIFICATIONS = [
  'MC US MCW Merit I', 'VS CPS Ecomm Basic', 'Business Card B2B', 'CPS_ECom-Basic P...',
  'US CPS Reg Debit', 'US VSP B2B', 'MC US Standard', 'VS CPS Retail', 'MC World Elite',
];

export const QUALIFICATION_ROWS = (() => {
  const d = createDraw(6801);
  const merchants = ['Corsham Print & Design Ltd', 'Bradford-on-Avon Stone Masons', 'Kenwood Outdoor Supply LLC'];
  const partners = ['Citi Merchant Services', 'Wells Fargo Merchant Services', 'Worldpay from FIS'];

  return Array.from({ length: 10 }, (_, i) => {
    const amount = d.money(40, 250);
    const feePct = Number(d.float(0.24, 2.45).toFixed(4));
    const interchange = -Math.round(amount * (feePct / 100) * 100) / 100;

    return {
      id: `q-${i}`,
      merchant: merchants[i % merchants.length],
      partner: partners[i % partners.length],
      transactionId: `${d.digits(9)}00000000`,
      trn: d.digits(24),
      bankName: d.pick(INSTITUTIONS).name,
      accountNumber: d.digits(8),
      routingNumber: d.pick(INSTITUTIONS).routingNumber,
      qualification: QUALIFICATIONS[i % QUALIFICATIONS.length],
      feePercent: feePct,
      baseFee: 0,
      amount,
      interchange,
      netAmount: Math.round((amount + interchange) * 100) / 100,
      authDate: stamp(19),
      settleDate: stamp(17),
      transactionDate: stamp(18),
      processor: 'Fiserv',
    };
  });
})();

/* ------------------------------------------------------------------ *
 * 9. Merchant Reserves
 * ------------------------------------------------------------------ */

export const MERCHANT_RESERVES = [
  { id: 'mr-1', institutionId: 'WF001', isoId: 'WORLDPAY001', merchant: 'Corsham Print & Design Ltd', partner: 'Global Payment Solutions', rate: 5.0, reserveStatus: 'Held', payStatus: 'Pending', contractDate: '2026/08/15', processDate: '2026/08/17', processor: 'Fiserv' },
  { id: 'mr-2', institutionId: 'BOA001', isoId: 'GPS001', merchant: 'Bradford-on-Avon Stone Masons', partner: 'Mercury Payment Systems', rate: 7.5, reserveStatus: 'Released', payStatus: 'Paid', contractDate: '2026/08/07', processDate: '2026/08/17', processor: 'Fiserv' },
  { id: 'mr-3', institutionId: 'FISERV001', isoId: 'VANTIVISO', merchant: 'Kenwood Outdoor Supply LLC', partner: 'Heartland Payment Systems', rate: 10.0, reserveStatus: 'Held', payStatus: 'Pending', contractDate: '2026/08/15', processDate: '2026/08/17', processor: 'Fiserv' },
  { id: 'mr-4', institutionId: 'TSYS001', isoId: 'ELAVONISO', merchant: 'Fernbrook Hospitality Ltd', partner: 'Priority Payment Systems', rate: 6.0, reserveStatus: 'Partial', payStatus: 'Processing', contractDate: '2026/08/15', processDate: '2026/08/17', processor: 'TSYS' },
  { id: 'mr-5', institutionId: 'TSYS001', isoId: 'PAYSIMPLE001', merchant: 'Highfield Sports Direct', partner: 'Paymentech Solutions', rate: 8.5, reserveStatus: 'Released', payStatus: 'Paid', contractDate: '2026/08/15', processDate: '2026/08/17', processor: 'TSYS' },
  { id: 'mr-6', institutionId: 'TSYS001', isoId: 'GPS001', merchant: 'Redwood Pharmacy Group', partner: 'Global Payment Solutions', rate: 4.5, reserveStatus: 'Held', payStatus: 'On Hold', contractDate: '2026/08/15', processDate: '2026/08/17', processor: 'TSYS' },
  { id: 'mr-7', institutionId: 'JPM001', isoId: 'WORLDPAY001', merchant: 'Neston Electrical Ltd', partner: 'Mercury Payment Systems', rate: 9.0, reserveStatus: 'Held', payStatus: 'Pending', contractDate: '2026/08/15', processDate: '2026/08/17', processor: 'Chase Paymentech' },
  { id: 'mr-8', institutionId: 'ELAV001', isoId: 'ELAVONISO', merchant: 'Redditch Tool Hire Ltd', partner: 'Priority Payment Systems', rate: 12.0, reserveStatus: 'Released', payStatus: 'Paid', contractDate: '2026/08/15', processDate: '2026/08/17', processor: 'Global Payments' },
];

/* ------------------------------------------------------------------ *
 * Shared filter field sets
 * ------------------------------------------------------------------ */

const processorOptions = brand.processors.map((p) => ({ value: p, label: p }));

/** The Custom Filter field set — the widest of the three, with saved reports. */
export const CUSTOM_FILTER_FIELDS = [
  { name: 'merchant', label: 'Merchant / MID' },
  { name: 'groupName', label: 'Group Name', type: 'select', options: ISO_PORTFOLIOS.map((g) => ({ value: g, label: g })) },
  { name: 'region', label: 'Region / Channel-Department' },
  { name: 'type', label: 'Type', type: 'select', options: [{ value: 'PSP', label: 'PSP' }, { value: 'Merchant', label: 'Merchant' }, { value: 'Supplier', label: 'Supplier' }] },
  { name: 'cardLast4', label: 'Card Number (Last Four Digits)' },
  { name: 'authCode', label: 'Auth Code' },
  { name: 'terminalId', label: 'Terminal ID' },
  { name: 'transactionId', label: 'Transaction ID' },
  { name: 'transactionType', label: 'Transaction Type' },
  { name: 'cardType', label: 'Card Type', type: 'select', options: SCHEMES.map((s) => ({ value: s, label: s })) },
  { name: 'institutionId', label: 'Institution ID' },
  { name: 'isoId', label: 'ISO ID' },
  { name: 'agentId', label: 'Agent ID' },
  { name: 'authAmount', label: 'Auth Amount', type: 'number' },
  { name: 'cardholder', label: 'Cardholder Name' },
  { name: 'startDate', label: 'Start Date', type: 'date', required: true },
  { name: 'endDate', label: 'End Date', type: 'date', required: true },
];

/** Historical Records is deliberately narrower — it emails an archive extract,
 *  so it only needs to identify the scope and the range. */
export const HISTORICAL_FIELDS = [
  { name: 'merchant', label: 'Merchant' },
  { name: 'groupName', label: 'Group Name' },
  { name: 'region', label: 'Region Name' },
  { name: 'processor', label: 'Processor', type: 'select', options: processorOptions },
  { name: 'startDate', label: 'Start Date', type: 'date', required: true },
  { name: 'endDate', label: 'End Date', type: 'date', required: true },
];

export const TXN_SCOPE = [
  { label: 'Start Date', value: '2026/08/14' },
  { label: 'End Date', value: '2026/08/20' },
];

export { SCHEMES, CARDHOLDERS };
