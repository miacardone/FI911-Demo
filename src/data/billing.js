/**
 * BILLING — monthly settlement statements.
 *
 * One row per participant per billing month. The Participant Name column is a
 * two-line identity: the acquiring entity on top, the underlying merchant and
 * its MID beneath, because a statement belongs to both and an operator
 * searching either one expects to find it.
 */

export const STATEMENTS = [
  { id: 'st-1', merchant: 'PNC Merchant Services', merchant: 'Wealth RB', mid: '92490014392571', processor: 'TSYS', month: '2026/08/20', currency: 'USD', settlement: 13559.26, reserve: 1355.93, adjustments: 0 },
  { id: 'st-2', merchant: 'Citi Gateway Operations', merchant: 'Parsing lay', mid: '8847101200231520', processor: 'TSYS', month: '2026/08/20', currency: 'USD', settlement: 2500.00, reserve: 250.00, adjustments: 123.00 },
  { id: 'st-3', merchant: 'U.S. Bank Merchant Processing', merchant: 'ECHO NET', mid: '6333999524080001', processor: 'TSYS', month: '2026/08/20', currency: 'USD', settlement: 30.19, reserve: 3.02, adjustments: 0 },
  { id: 'st-4', merchant: 'Wells Fargo Payment Services', merchant: 'S-Paragon.com', mid: '6333999617020001', processor: 'TSYS', month: '2026/08/20', currency: 'USD', settlement: 1506.58, reserve: 150.66, adjustments: 0 },
  { id: 'st-5', merchant: 'Chase Acquiring', merchant: 'SELTOS LLC', mid: '6333999100012385', processor: 'TSYS', month: '2026/08/20', currency: 'USD', settlement: 8.17, reserve: 0.82, adjustments: 0 },
  { id: 'st-6', merchant: 'Worldpay Enterprise', merchant: 'Global Tech Solutions', mid: '7744001234567890', processor: 'Fiserv', month: '2026/08/20', currency: 'USD', settlement: 8750.00, reserve: 875.00, adjustments: 25.00 },
  { id: 'st-7', merchant: 'Fiserv Digital Payments', merchant: 'Digital Commerce Inc', mid: '5566778899001122', processor: 'First Data', month: '2026/08/20', currency: 'USD', settlement: 15200.45, reserve: 1520.05, adjustments: 0 },
  { id: 'st-8', merchant: 'Global Payments UK', merchant: 'Northern Retail Corp', mid: '9988776655443322', processor: 'TSYS', month: '2026/08/20', currency: 'USD', settlement: 4567.89, reserve: 456.79, adjustments: 12.50 },
  { id: 'st-9', merchant: 'Elavon Merchant Acquiring', merchant: 'Metro Services Ltd', mid: '1122334455667788', processor: 'Chase Paymentech', month: '2026/08/20', currency: 'USD', settlement: 22100.00, reserve: 2210.00, adjustments: 50.00 },
  { id: 'st-10', merchant: 'Checkout.com Settlement Team', merchant: 'Pacific Trading Co', mid: '9876543210123456', processor: 'Global Payments', month: '2026/08/20', currency: 'USD', settlement: 6789.12, reserve: 678.91, adjustments: 0 },
  { id: 'st-11', merchant: 'Adyen UK Finance Ops', merchant: 'Atlantic Enterprises', mid: '4567890123456789', processor: 'Worldpay', month: '2026/08/20', currency: 'USD', settlement: 12345.67, reserve: 1234.57, adjustments: 15.00 },
  { id: 'st-12', merchant: 'Truist Merchant Services', merchant: 'Riverton Timber Supply', mid: '3344556677889900', processor: 'Fiserv', month: '2026/08/20', currency: 'USD', settlement: 9876.54, reserve: 987.65, adjustments: 0 },
  { id: 'st-13', merchant: 'Fifth Third Acquiring', merchant: 'Clearwater Catering Supply', mid: '2233445566778899', processor: 'TSYS', month: '2026/08/20', currency: 'USD', settlement: 3421.08, reserve: 342.11, adjustments: 7.25 },
  { id: 'st-14', merchant: 'KeyBank Merchant Ops', merchant: 'Blue Ridge Holiday Park', mid: '5544332211009988', processor: 'Global Payments', month: '2026/08/20', currency: 'USD', settlement: 18902.33, reserve: 1890.23, adjustments: 0 },
  { id: 'st-15', merchant: 'Capital One Acquiring Desk', merchant: 'Arbor Hill Bakers LLC', mid: '6677889900112233', processor: 'Chase Paymentech', month: '2026/08/20', currency: 'USD', settlement: 7654.32, reserve: 765.43, adjustments: 30.00 },
];

export default STATEMENTS;
