import Modal from '@/components/ui/Modal';
import { Badge, Button } from '@/components/ui/Surface';
import Icon from '@/components/ui/Icon';
import { Muted } from '@/components/fi911/cells';
import brand from '@/brand/brand.config';

/**
 * Document preview.
 *
 * Preview raised a toast reading "Previewing <filename>", which is the same
 * as not previewing it. A preview has to show the document.
 *
 * These are generated records, so there is no real file behind them — what
 * renders is a representative FIRST PAGE built from the row's own metadata,
 * clearly framed as a rendered preview rather than passed off as a scan. The
 * body differs by document type, because the whole reason to preview a KYC
 * pack rather than a bank statement is that they contain different things.
 */

/* The header block every document carries, then a type-specific body. */
const BODY = {
  kyc: ({ holder, account }) => ({
    heading: 'Know Your Customer — Verification Pack',
    rows: [
      ['Subject', holder],
      [account?.length === 9 ? 'Routing Number' : 'Sort Code', account],
      ['Identity check', 'Passed — full match on name, DOB and address'],
      ['Sanctions screening', 'No match on any consolidated watch list'],
      ['Beneficial owners', '2 identified, both verified'],
      ['Document set', 'Passport, utility bill, incorporation certificate'],
    ],
    note: 'Retained under KYC obligations. Access restricted to underwriting and risk.',
  }),
  bank: ({ holder, account }) => ({
    heading: 'Bank Statement — Settlement Account',
    rows: [
      ['Account holder', holder],
      [account?.length === 9 ? 'Routing Number' : 'Sort Code', account],
      ['Statement period', '01 – 30 June 2026'],
      ['Opening balance', '$48,210.55'],
      ['Deposits', '$412,880.10'],
      ['Withdrawals', '$389,447.32'],
      ['Closing balance', '$71,643.33'],
    ],
    note: 'Supplied by the applicant in support of the processing agreement.',
  }),
  mpa: ({ holder, account }) => ({
    heading: 'Merchant Processing Application',
    rows: [
      ['Legal name', `${holder} LLC`],
      ['DBA name', holder],
      [account?.length === 9 ? 'Routing Number' : 'Sort Code', account],
      ['Requested monthly volume', '$1,250,000.00'],
      ['Requested average ticket', '$185.00'],
      ['Requested high ticket', '$2,400.00'],
    ],
    note: 'Signed by the principal and countersigned by the acquirer.',
  }),
  evidence: ({ holder }) => ({
    heading: 'Dispute Evidence — Compelling Evidence Pack',
    rows: [
      ['Merchant', holder],
      ['Reason code', '13.1 — Merchandise/Services Not Received'],
      ['Disputed amount', '$1,134.17'],
      ['Evidence supplied', 'Proof of delivery, AVS match, prior undisputed history'],
      ['Representment status', 'Submitted, awaiting issuer response'],
    ],
    note: 'Assembled for representment. Retained for the life of the dispute plus 24 months.',
  }),
  statement: ({ holder }) => ({
    heading: 'Billing Statement',
    rows: [
      ['Merchant', holder],
      ['Billing period', 'July 2026'],
      ['Gross processing volume', '$1,184,534.00'],
      ['Discount and interchange', '$28,412.09'],
      ['Per-item and gateway fees', '$3,077.40'],
      ['Chargeback fees', '$450.00'],
      ['Net billed', '$31,939.49'],
    ],
    note: 'Issued monthly. Disputes on billing must be raised within 60 days.',
  }),
  tax: ({ holder }) => ({
    heading: 'Tax Certificate',
    rows: [
      ['Entity', `${holder} LLC`],
      ['Federal Tax ID', '84-7719022'],
      ['Filing status', 'Current — no outstanding federal liability'],
      ['Tax year', '2025'],
    ],
    note: 'Verified against the IRS TIN matching service at onboarding.',
  }),
  contract: ({ holder, account }) => ({
    heading: 'Merchant Processing Agreement — Executed',
    rows: [
      ['Merchant', holder],
      [account?.length === 9 ? 'Routing Number' : 'Sort Code', account],
      ['Agreement term', '36 months from 2026/03/01'],
      ['Early termination fee', '$495.00'],
      ['Pricing schedule', 'Interchange Plus — 0.25% + $0.10'],
    ],
    note: 'Executed copy. Supersedes all prior agreements between the parties.',
  }),
};

export function DocumentPreview({ doc, onClose, onDownload }) {
  if (!doc) return null;

  /* Both consoles render through this component, and they name the account
     holder differently — the acquiring console stores `merchant` against a
     routing number, the alternative-payments one stores `participant`
     against a sort code. Reading either keeps one implementation. */
  const holder = doc.merchant ?? doc.participant;
  const account = doc.routingNumber ?? doc.sortCode;

  const build = BODY[doc.typeId] ?? BODY.mpa;
  const { heading, rows, note } = build({ holder, account });
  const extension = doc.name.split('.').pop().toUpperCase();

  return (
    <Modal
      open
      onClose={onClose}
      title={doc.name}
      size="md"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Close</Button>
          <Button variant="primary" icon="download" onClick={() => { onClose(); onDownload?.(doc); }}>
            Download
          </Button>
        </>
      )}
    >
      <div className="stack">
        <div className="doc-meta">
          <span className="doc-meta__item"><Icon name={doc.icon} size={14} /> {doc.type}</span>
          <span className="doc-meta__item">{extension} · {doc.sizeMb} MB</span>
          <span className="doc-meta__item">Uploaded {doc.uploaded} by {doc.uploadedBy}</span>
          {doc.confidential
            ? <Badge tone="danger" dot>Confidential</Badge>
            : <Badge tone="neutral">Standard</Badge>}
        </div>

        <div className="doc-frame">
          <div className="doc-header-strip">
            <span>Page 1 of 1 — rendered preview</span>
            <span>{brand.legalName}</span>
          </div>

          <div className="doc-page">
            <div className="doc-page__brand">
              <span className="doc-page__logo">{brand.name}</span>
              <span className="doc-page__meta">
                {brand.legalName}
                <br />
                Ref {doc.id.toUpperCase()}
                <br />
                {doc.uploaded}
              </span>
            </div>

            <div className="doc-page__re">{heading}</div>

            <table className="doc-page__table">
              <tbody>
                {rows.map(([label, value]) => (
                  <tr key={label}>
                    <td>{label}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="doc-page__sig">
              {note}
              <br />
              <br />
              Retained for {doc.retentionYears} year{doc.retentionYears === 1 ? '' : 's'} · expires {doc.expires}
            </div>
          </div>
        </div>

        <Muted>
          This demo holds generated records rather than real files, so the page above is rendered
          from the document&rsquo;s own metadata.
        </Muted>
      </div>
    </Modal>
  );
}

export default DocumentPreview;
