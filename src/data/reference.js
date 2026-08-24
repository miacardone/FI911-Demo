/**
 * REFERENCE DATA — the shared nouns.
 *
 * Participants, merchants, partners and routing numbers are referenced by
 * nearly every module, so they are defined once here and imported rather than
 * re-invented per screen. That is what makes the demo hang together: the
 * "Wells Fargo Bank" you onboard in Participants is the same institution that
 * appears in Disputes, in Claim Turnover on the dashboard, and in the
 * Residuals participant status list.
 *
 * Routing numbers are the join key. An ABA routing number is nine digits with
 * a weighted check digit; the reference uses a stable one per institution for
 * identity columns, and a per-account one for account-level rows (a bank
 * holds many routing numbers — the institution's headline ABA is not the one
 * on a given merchant's account).
 */

/* ------------------------------------------------------------------ *
 * Participants — the banks and PSPs Fi911 onboards
 * ------------------------------------------------------------------ */

export const INSTITUTIONS = [
  { id: 'chase', name: 'JPMorgan Chase Bank', short: 'Chase', routingNumber: '021000021', type: 'bank', domain: 'chase.com' },
  { id: 'bofa', name: 'Bank of America', short: 'BofA', routingNumber: '026009593', type: 'bank', domain: 'bankofamerica.com' },
  { id: 'wells', name: 'Wells Fargo Bank', short: 'Wells Fargo', routingNumber: '121000248', type: 'bank', domain: 'wellsfargo.com' },
  { id: 'citi', name: 'Citibank', short: 'Citi', routingNumber: '021000089', type: 'bank', domain: 'citi.com' },
  { id: 'usbank', name: 'U.S. Bank', short: 'U.S. Bank', routingNumber: '091000022', type: 'bank', domain: 'usbank.com' },
  { id: 'pnc', name: 'PNC Bank', short: 'PNC', routingNumber: '043000096', type: 'psp', domain: 'pnc.com' },
  { id: 'truist', name: 'Truist Bank', short: 'Truist', routingNumber: '061000104', type: 'psp', domain: 'truist.com' },
  { id: 'capitalone', name: 'Capital One', short: 'Capital One', routingNumber: '051405515', type: 'psp', domain: 'capitalone.com' },
  { id: 'bony', name: 'Bank of New York Mellon', short: 'BNY', routingNumber: '021000018', type: 'psp', domain: 'bnymellon.com' },
  { id: 'tdbank', name: 'TD Bank', short: 'TD Bank', routingNumber: '031201360', type: 'psp', domain: 'td.com' },
  { id: 'fifththird', name: 'Fifth Third Bank', short: 'Fifth Third', routingNumber: '042000314', type: 'psp', domain: '53.com' },
  { id: 'keybank', name: 'KeyBank', short: 'KeyBank', routingNumber: '041001039', type: 'psp', domain: 'key.com' },
  { id: 'regions', name: 'Regions Bank', short: 'Regions', routingNumber: '062005690', type: 'psp', domain: 'regions.com' },
  { id: 'huntington', name: 'Huntington National Bank', short: 'Huntington', routingNumber: '044000024', type: 'psp', domain: 'huntington.com' },
  { id: 'mtb', name: 'M&T Bank', short: 'M&T', routingNumber: '022000046', type: 'psp', domain: 'mtb.com' },
  { id: 'citizens', name: 'Citizens Bank', short: 'Citizens', routingNumber: '011500120', type: 'psp', domain: 'citizensbank.com' },
  { id: 'firstcitizens', name: 'First Citizens Bank', short: 'First Citizens', routingNumber: '053100300', type: 'psp', domain: 'firstcitizens.com' },
  { id: 'comerica', name: 'Comerica Bank', short: 'Comerica', routingNumber: '072000096', type: 'psp', domain: 'comerica.com' },
  { id: 'synovus', name: 'Synovus Bank', short: 'Synovus', routingNumber: '061100606', type: 'bank', domain: 'synovus.com' },
  { id: 'zions', name: 'Zions Bancorporation', short: 'Zions', routingNumber: '124000054', type: 'bank', domain: 'zionsbank.com' },
];

export const institutionById = (id) => INSTITUTIONS.find((i) => i.id === id) ?? INSTITUTIONS[0];
export const institutionByName = (name) => INSTITUTIONS.find((i) => i.name === name) ?? null;

/** The five routing numbers the dashboard's "Top Five Routing Numbers" donut ranks. */
export const TOP_ROUTING_NUMBERS = ['021000021', '026009593', '121000248', '021000089', '091000022'];

/* ------------------------------------------------------------------ *
 * Merchants — the businesses beneath the participants
 * ------------------------------------------------------------------ */

/** UK trading names, used across Transactions, Residuals and Billing. */
export const MERCHANTS = [
  'Ashton & Partners LLC', 'Bluebell Care Services', 'Cornerstone Engineering Inc',
  'Dover Street Tea Room', 'Eastgate Office Supplies', 'Fairfield Sports Co',
  'Pelican Marina LLC', 'Topsail Surf School', 'Hillside Artisan Bakery',
  'Phoenix Wine Merchants', 'Quarry Lane Hardware', 'Whitmore Building Supplies',
  'Kenwood Outdoor Supply', 'Summit Textiles Inc', 'Bridgeport Food Services',
  'Lakeside Garden Center', 'Midwest Craft Supply Co', 'Deep Dish Delights',
  'Sunshine Pool & Spa', 'Peach State Auto Spa', 'Tropical Flavors Bistro',
  'Cascade Mountain Sports', 'Evergreen Digital Agency', 'Brooklyn Web Studios',
  'Merrimack Valley Wines', 'Stone Mountain BBQ', 'Bluegrass Direct Sales',
  'Liberty Bell Tutoring', 'Lakeside Event Rentals', 'CloudCart Solutions',
  'Lakewood Springs Spa', 'Elmwood Engineering', 'Westgate Print & Design',
  'Monroe Steel', 'Kingsport Electronics', 'Greenfield Print Co',
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
  { name: 'Citi Merchant Services', code: 'BMS01' },
  { name: 'Citi Commercial Cards', code: 'BARC01' },
  { name: 'Wells Fargo Merchant Services', code: 'LLOY02' },
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

/**
 * Deterministic ABA routing number from any string — stable across reloads.
 *
 * A US routing number is nine digits and its last one is a weighted check
 * digit (3-7-1 repeating). Generating it properly means a validator would
 * accept these, which matters for a demo shown to payments people: an
 * obviously fake routing number is the kind of detail that gets noticed.
 */
export function routingNumberFor(seedText) {
  let h = 0;
  for (let i = 0; i < seedText.length; i += 1) h = (h * 31 + seedText.charCodeAt(i)) >>> 0;

  let body = '';
  let x = h;
  while (body.length < 8) {
    x = (x * 1103515245 + 12345) >>> 0;
    body += String(x % 10);
  }
  body = body.slice(0, 8);

  const w = [3, 7, 1, 3, 7, 1, 3, 7];
  const sum = body.split('').reduce((acc, d, i) => acc + Number(d) * w[i], 0);
  return `${body}${(10 - (sum % 10)) % 10}`;
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
  `${name.toLowerCase().replace(/[^a-z0-9]+/g, '')}@example.com`.replace(/(llc|inc)@/, '@');

export default INSTITUTIONS;
