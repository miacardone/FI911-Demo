/**
 * REFERENCE DATA — the shared nouns.
 *
 * Participants, merchants, partners and sort codes are referenced by nearly
 * every module, so they are defined once here and imported rather than
 * re-invented per screen. That is what makes the demo hang together: the
 * "Lloyds Bank" you onboard in Participants is the same institution that
 * appears in Disputes, in Claim Turnover on the dashboard, and in the
 * Residuals participant status list.
 *
 * Sort codes are the join key. UK sort codes are `nn-nn-nn`; the reference
 * uses a stable one per institution for identity columns, and a per-account
 * one for account-level rows (a bank has many sort codes — the institution's
 * headline code is not the code on a given merchant's account).
 */

/* ------------------------------------------------------------------ *
 * Participants — the banks and PSPs Fi911 onboards
 * ------------------------------------------------------------------ */

export const INSTITUTIONS = [
  { id: 'lloyds', name: 'Lloyds Bank', short: 'Lloyds', sortCode: '30-96-35', type: 'psp', domain: 'lloydsbank.com' },
  { id: 'barclays', name: 'Barclays', short: 'Barclays', sortCode: '20-26-78', type: 'bank', domain: 'barclays.com' },
  { id: 'hsbc', name: 'HSBC', short: 'HSBC', sortCode: '40-12-76', type: 'bank', domain: 'hsbc.uk.com' },
  { id: 'halifax', name: 'Halifax', short: 'Halifax', sortCode: '11-16-26', type: 'psp', domain: 'halifax.com' },
  { id: 'natwest', name: 'National Westminster Bank', short: 'NWB', sortCode: '56-00-03', type: 'bank', domain: 'natwest.com' },
  { id: 'santander', name: 'Santander UK', short: 'Santander UK', sortCode: '72-00-00', type: 'psp', domain: 'santander.uk.com' },
  { id: 'bos', name: 'Bank of Scotland', short: 'BOS', sortCode: '12-11-03', type: 'psp', domain: 'rbs.com' },
  { id: 'first_direct', name: 'First Direct', short: 'First Direct', sortCode: '40-47-87', type: 'psp', domain: 'firstdirect.com' },
  { id: 'bony', name: 'Bank of New York Mellon', short: 'BNY', sortCode: '76-02-25', type: 'psp', domain: 'bonym.com' },
  { id: 'starling', name: 'Starling Bank Limited', short: 'SBL', sortCode: '60-83-71', type: 'psp', domain: 'sbl.com' },
  { id: 'monzo', name: 'Monzo Business', short: 'Monzo', sortCode: '04-00-03', type: 'psp', domain: 'monzo.com' },
  { id: 'revolut', name: 'Revolut Business', short: 'Revolut', sortCode: '04-29-09', type: 'psp', domain: 'revolut.com' },
  { id: 'metro', name: 'Metro Bank', short: 'Metro', sortCode: '23-05-80', type: 'psp', domain: 'metrobank.co.uk' },
  { id: 'tsb', name: 'TSB Bank', short: 'TSB', sortCode: '77-91-22', type: 'psp', domain: 'tsb.co.uk' },
  { id: 'virgin', name: 'Virgin Money', short: 'Virgin', sortCode: '05-01-15', type: 'psp', domain: 'virginmoney.com' },
  { id: 'clydesdale', name: 'Clydesdale Bank', short: 'Clydesdale', sortCode: '82-62-26', type: 'psp', domain: 'cbonline.co.uk' },
  { id: 'nationwide', name: 'Nationwide Building Society', short: 'Nationwide', sortCode: '07-00-93', type: 'psp', domain: 'nationwide.com' },
  { id: 'tide', name: 'Tide Payments', short: 'Tide', sortCode: '04-06-20', type: 'psp', domain: 'tidepayments.com' },
  { id: 'clearbank', name: 'ClearBank', short: 'ClearBank', sortCode: '04-11-22', type: 'bank', domain: 'clearbank.com' },
  { id: 'barclays_uk', name: 'Barclays Bank UK', short: 'Barclays UK', sortCode: '36-26-74', type: 'bank', domain: 'barclaysuk.com' },
];

export const institutionById = (id) => INSTITUTIONS.find((i) => i.id === id) ?? INSTITUTIONS[0];
export const institutionByName = (name) => INSTITUTIONS.find((i) => i.name === name) ?? null;

/** The five sort codes the dashboard's "Top Five Sort Codes" donut ranks. */
export const TOP_SORT_CODES = ['16-52-21', '40-63-77', '40-11-99', '11-00-01', '30-00-05'];

/* ------------------------------------------------------------------ *
 * Merchants — the businesses beneath the participants
 * ------------------------------------------------------------------ */

/** UK trading names, used across Transactions, Residuals and Billing. */
export const MERCHANTS = [
  'Ashton & Partners Ltd', 'Bluebell Care Services', 'Corbridge Engineering', 'Devonshire Tea Rooms',
  'Eastgate Office Supplies', 'Fairfield Sports Ltd', 'Penarth Marina Ltd', 'Tenby Surf School Ltd',
  'Helmsley Artisan Bakery', 'Phoenix Wine Merchants', 'Quarry Lane Hardware Ltd', 'Summit Electrical Ltd',
  'Dunmore Travel Ltd', 'Riverside Flooring Co', 'Whitmore Building Supplies', 'Hargreaves & Sons Ltd',
  'Thornfield Market Ltd', 'Westgate Print & Design', 'Birchwood Vets Ltd', 'Cranleigh Kitchens Ltd',
  'Gainsborough Print Ltd', 'Bramble Hill Deli', 'Granary Bakehouse Ltd', 'Elmside Gift Shop',
  'Clifton Beauty & Wellness', 'Corsham Print & Design Ltd', 'Bradford-on-Avon Stone Masons',
  'Kendal Outdoor Supplies Ltd', 'Pennine Textiles Ltd', 'Bridgford Food Services', 'Lakeside Garden Centre',
  'Neston Electrical Ltd', 'Redditch Tool Hire Ltd', 'Pemberton Retail Group', 'Highfield Sports Direct',
  'Kingsway Electronics Ltd', 'Fernbrook Hospitality Ltd', 'Redwood Pharmacy Group', 'Northgate Motor Spares',
  'Ruthin Timber Merchants', 'Colwyn Bay Catering Supplies', 'Merthyr Tydfil Steel Fabricators',
  'Brecon Beacons Holiday Park', 'Abergavenny Bakers Ltd', 'Pontypool Packaging Ltd',
  'Tredegar Office Interiors Ltd', 'Caerphilly Cheese & Deli Ltd', 'Ebbw Vale Engineering Ltd',
  'Monmouth River Cruises', 'Llandrindod Wells Spa Ltd', 'Welshpool Agricultural Traders',
  'Newtown Furniture Makers Ltd', 'Aberystwyth Marine Chandlery',
];

/** Merchants named for their acquirer — Alert Action and Gateway use these. */
export const PROCESSOR_MERCHANTS = [
  'Chase Paymentech Oswestry Cheese Co', 'Worldpay Ramsgate Chandlery Ltd', 'First Data Penrith Pet Emporium',
  'Chase Paymentech Arundel Antiques Ltd', 'Worldpay Ximenes Spice Importers',
  'Chase Paymentech Uckfield Garden Rooms', 'Fiserv Wells Newark Markets Ltd', 'TSYS Wells Montrose Seafood Bar',
  'Fiserv Wells Zeals Honey Farm', 'Global Payments Whitstable Oyster Bar', 'Fiserv Wells Tewkesbury Forge',
  'TSYS Wells Lichfield Cathedral Shop', 'Fiserv Chase Kendal Mint Cake Co', 'Global Payments Glastonbury Music Store',
];

/** Risk-tier merchants — the Risk Management merchant book. */
export const RISK_MERCHANTS = [
  { name: 'TSYS Merchant-High 01', processor: 'TSYS', tier: 'high', mcc: '5994', status: 'Onboarded', tagged: true },
  { name: 'Wealth RB', processor: 'TSYS', tier: 'high', mcc: '5039', status: 'Active', tagged: true },
  { name: 'Chase Merchant-High 03', processor: 'Chase Paymentech', tier: 'high', mcc: '5734', status: 'Active', tagged: true },
  { name: 'Worldpay Merchant-High', processor: 'Worldpay', tier: 'high', mcc: '5541', status: 'Closed', tagged: true },
  { name: 'TSYS Merchant-High 04', processor: 'TSYS', tier: 'high', mcc: '5967', status: 'Active', tagged: true },
  { name: 'Fiserv Merchant-High 01', processor: 'Fiserv', tier: 'high', mcc: '5732', status: 'Onboarded', tagged: true },
  { name: 'Parsing lay', processor: 'TSYS', tier: 'medium', mcc: '5045', status: 'Onboarded', tagged: false },
  { name: 'S-Paragon.com', processor: 'TSYS', tier: 'medium', mcc: '5045', status: 'Active', tagged: false },
  { name: 'SELTOS LLC', processor: 'TSYS', tier: 'medium', mcc: '5045', status: 'Merchant On Hold', tagged: true },
  { name: 'Global Payments Merchant', processor: 'Global Payments', tier: 'medium', mcc: '5999', status: 'Onboarded', tagged: false },
  { name: 'Chase Merchant-Medium 01', processor: 'Chase Paymentech', tier: 'medium', mcc: '5411', status: 'Active', tagged: false },
  { name: 'Worldpay Merchant-Medium', processor: 'Worldpay', tier: 'medium', mcc: '5812', status: 'Active', tagged: false },
  { name: 'TSYS Merchant-Low 01', processor: 'TSYS', tier: 'low', mcc: '5039', status: 'Closed', tagged: true },
  { name: 'ECHO.NET', processor: 'TSYS', tier: 'medium', mcc: '5045', status: 'Active', tagged: false },
  { name: 'Fiserv Merchant-High 02', processor: 'Fiserv', tier: 'high', mcc: '5411', status: 'Active', tagged: true },
  { name: 'First Data Merchant-Low', processor: 'First Data', tier: 'low', mcc: '5812', status: 'Active', tagged: false },
  { name: 'TSYS Merchant-Medium 04', processor: 'TSYS', tier: 'medium', mcc: '5311', status: 'Active', tagged: false },
  { name: 'Fiserv Merchant-Low 05', processor: 'Fiserv', tier: 'low', mcc: '5942', status: 'Active', tagged: false },
  { name: 'Chase Merchant-Low 06', processor: 'Chase Paymentech', tier: 'low', mcc: '5661', status: 'Active', tagged: false },
  { name: 'Global Payments Merchant-High', processor: 'Global Payments', tier: 'high', mcc: '5999', status: 'Active', tagged: true },
  { name: 'Worldpay Merchant-Low 02', processor: 'Worldpay', tier: 'low', mcc: '5814', status: 'Active', tagged: false },
  { name: 'TSYS Merchant-Medium 07', processor: 'TSYS', tier: 'medium', mcc: '5045', status: 'Active', tagged: false },
  { name: 'Fiserv Merchant-Medium 03', processor: 'Fiserv', tier: 'medium', mcc: '5722', status: 'Active', tagged: false },
  { name: 'Chase Merchant-High 08', processor: 'Chase Paymentech', tier: 'high', mcc: '5912', status: 'Active', tagged: true },
  { name: 'First Data Merchant-Medium', processor: 'First Data', tier: 'medium', mcc: '5999', status: 'Onboarded', tagged: false },
  { name: 'Elavon Merchant-Low 01', processor: 'Elavon', tier: 'low', mcc: '5411', status: 'Active', tagged: false },
  { name: 'TSYS Merchant-Low 09', processor: 'TSYS', tier: 'low', mcc: '5045', status: 'Active', tagged: false },
  { name: 'Worldpay Merchant-High 03', processor: 'Worldpay', tier: 'high', mcc: '5541', status: 'Active', tagged: true },
  { name: 'Global Payments Merchant-Low', processor: 'Global Payments', tier: 'low', mcc: '5812', status: 'Closed', tagged: false },
  { name: 'Fiserv Merchant-High 07', processor: 'Fiserv', tier: 'high', mcc: '5734', status: 'Active', tagged: true },
  { name: 'Chase Merchant-Medium 05', processor: 'Chase Paymentech', tier: 'medium', mcc: '5967', status: 'Active', tagged: false },
  { name: 'TSYS Merchant-Medium 02', processor: 'TSYS', tier: 'medium', mcc: '5994', status: 'Active', tagged: false },
  { name: 'Elavon Merchant-Medium 04', processor: 'Elavon', tier: 'medium', mcc: '7399', status: 'Active', tagged: false },
];

/* ------------------------------------------------------------------ *
 * Partners and portfolios
 * ------------------------------------------------------------------ */

export const PARTNERS = [
  { name: 'Barclays Merchant Services', code: 'BMS01' },
  { name: 'Barclaycard Business', code: 'BARC01' },
  { name: 'Lloyds Cardnet', code: 'LLOY02' },
  { name: 'Worldpay from FIS', code: 'WPF03' },
  { name: 'Elavon Merchant Services', code: 'ELAV04' },
  { name: 'Global Payments 03', code: 'GP03' },
  { name: 'Worldpay 04', code: 'WP04' },
  { name: 'First Data 02', code: 'FD02' },
  { name: 'Wells Fargo Partners', code: 'WF001' },
  { name: 'Chase Payment Solutions', code: 'CPS01' },
  { name: 'Global Payment Partners', code: 'GPP01' },
  { name: 'Mercury Payment Systems', code: 'MPS01' },
  { name: 'Heartland Payment Systems', code: 'HPS01' },
  { name: 'Priority Payment Systems', code: 'PPS01' },
  { name: 'Paymentech Solutions', code: 'PTS01' },
  { name: 'Global Payment Solutions', code: 'GPS001' },
];

export const ISO_PORTFOLIOS = ['Enterprise ISO', 'Direct Bank Portfolio', 'High-Risk Oversight'];

export const REGIONS = [
  'West / ISO Sales', 'West / Risk Ops', 'South / Merchant Support', 'South / Banking Ops',
  'Midwest / Banking Ops', 'Northeast / Enterprise', 'EMEA',
];

export const PORTFOLIOS = [
  '0115 - House Price List - Int - Int 20',
  'Int - House Price List - Int - Int 10',
  'A3212-2 - New 3212 Huntingdon Garner',
  'A3097-2 - NEW-Kentucky Bank 163 1 - SP 75',
  '_QA1',
];

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

/** Deterministic sort code from any string — stable across reloads. */
export function sortCodeFor(seedText) {
  let h = 0;
  for (let i = 0; i < seedText.length; i += 1) h = (h * 31 + seedText.charCodeAt(i)) >>> 0;
  const pair = (n) => String(n % 100).padStart(2, '0');
  return `${pair(h)}-${pair(h >> 7)}-${pair(h >> 14)}`;
}

/** Deterministic MID (merchant ID) from any string. */
export function midFor(seedText, length = 15) {
  let h = 0;
  for (let i = 0; i < seedText.length; i += 1) h = (h * 33 + seedText.charCodeAt(i)) >>> 0;
  let out = '';
  let x = h;
  while (out.length < length) {
    x = (x * 1103515245 + 12345) >>> 0;
    out += String(x % 10);
  }
  return out.slice(0, length);
}

/** Masked account number — "****8562". */
export const maskAccount = (digits) => `****${String(digits).slice(-4)}`;

/** Business email for a merchant trading name. */
export const merchantEmail = (name) =>
  `${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}@example.co.uk`.replace(/ltd@/, '@');

export default INSTITUTIONS;
