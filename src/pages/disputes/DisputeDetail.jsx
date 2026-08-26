import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import { Button } from '@/components/ui/Surface';
import { DetailPage } from '@/components/fi911/DetailPage';
import { Money } from '@/components/fi911/cells';
import { useDetailCrumb } from '@/components/layout/AppLayout';
import { findDispute } from '@/data/disputes';
import { routes } from '@/data/navigation';
import { useToast } from '@/context/ToastContext';

/**
 * Chargeback detail.
 *
 * Read-only by design: a chargeback record is the network's account of what
 * happened, not something an operator edits. The only mutable thing on the
 * page is the evidence you attach to it, which is why Documents is the one
 * interactive block and there is no Save footer.
 */

function InfoRow({ label, children }) {
  return (
    <div className="cb-row">
      <span className="cb-row__label">{label}</span>
      <span className="cb-row__value">{children}</span>
    </div>
  );
}

export function DisputeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const record = findDispute(id);
  const [documents, setDocuments] = useState([]);

  useDetailCrumb(record.merchant);

  return (
    <DetailPage
      title={record.caseNumber}
      subtitle={`${record.merchant} · MID ${record.mid} · ${record.reasonCode} ${record.reasonCategory}`}
      onBack={() => navigate(routes.disputes)}
    >
      <section className="fi-section">
        <header className="fi-section__head">
          <span className="fi-section__title">
            <Icon name="info" size={15} style={{ marginRight: 6, verticalAlign: -2, color: 'var(--c-ink-muted)' }} />
            Chargeback Information
          </span>
        </header>
        <div className="fi-section__body">
          <div className="cb-grid">
            <InfoRow label="Processor">{record.processor}</InfoRow>
            <InfoRow label="Transaction ID">{record.transactionId}</InfoRow>
            <InfoRow label="Transaction Amount"><Money value={record.transactionAmount} /></InfoRow>
            <InfoRow label="Transaction Date">{record.transactionDate}</InfoRow>
            <InfoRow label="Original Approval Number">{record.approvalNumber}</InfoRow>
            <InfoRow label="Retrieval Request Date">{record.retrievalDate}</InfoRow>
            <InfoRow label="Reason Category">{record.reasonCategory}</InfoRow>
            <InfoRow label="CB ID">{record.caseNumber}</InfoRow>
            <InfoRow label="Completed Date">{record.completedDate}</InfoRow>
            <InfoRow label="Currency">{record.currency}</InfoRow>
          </div>
        </div>
      </section>

      <section className="fi-section">
        <header className="fi-section__head">
          <span className="fi-section__title">
            <Icon name="file" size={15} style={{ marginRight: 6, verticalAlign: -2, color: 'var(--c-ink-muted)' }} />
            Documents
          </span>
          <div className="fi-section__actions">
            <Button
              variant="primary"
              size="sm"
              icon="upload"
              onClick={() => {
                setDocuments((d) => [...d, { id: `doc-${d.length + 1}`, name: `evidence_${d.length + 1}.pdf`, size: '1.2 MB', date: '2026/08/20' }]);
                toast.notify('Document uploaded.');
              }}
            >
              Upload Document
            </Button>
          </div>
        </header>
        <div className="fi-section__body">
          {documents.length === 0 ? (
            <div className="empty">
              <span className="empty__glyph"><Icon name="file" size={20} /></span>
              <p className="empty__title">No Documents Available</p>
              <p className="empty__hint">Upload representment evidence to attach it to this case.</p>
            </div>
          ) : (
            <table className="fi-mini-table">
              <thead><tr><th>File Name</th><th>Size</th><th>Uploaded</th></tr></thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id}><td>{d.name}</td><td>{d.size}</td><td>{d.date}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </DetailPage>
  );
}

export default DisputeDetail;
