import { Badge } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import { Section, FieldGrid } from '@/components/fi911/DetailPage';
import { SummaryRow, Muted } from '@/components/fi911/cells';
import { formatCurrency } from '@/utils/format';

/**
 * How this merchant was verified — and therefore how much of the file to trust.
 *
 * The two intake routes reach the same record by genuinely different means, so
 * they cannot show the same panel:
 *
 *   Bank-boarded — an agent owns the relationship and an underwriter keyed the
 *   application from documents the merchant handed over. The figures have been
 *   read against bank statements. The open question is whether the file is
 *   complete.
 *
 *   Self-service — nobody met this merchant. The volume and ticket figures are
 *   whatever they typed, identity was proven electronically, and the document
 *   set is usually short. The open question is whether any of it is true.
 *
 * Showing "Monthly Volume: $84,000" identically for both is the failure this
 * panel exists to prevent: on a self-service file that number is a claim, not
 * a fact, and an underwriter approving against it should be told so.
 */

function Check({ ok, label, hint }) {
  return (
    <Tooltip label={hint}>
      <span className={`vcheck vcheck--${ok ? 'ok' : 'no'}`}>
        <Icon name={ok ? 'check' : 'alert'} size={13} />
        {label}
      </span>
    </Tooltip>
  );
}

export function IntakeVerification({ record }) {
  const self = record.intake === 'self';

  return (
    <Section
      title={self ? 'Verification — self-service signup' : 'Verification — bank-boarded'}
      description={self
        ? 'This merchant signed itself up. Figures below are self-declared until underwriting verifies them.'
        : 'An agent owns this relationship and the application was keyed from documents.'}
    >
      <div className="stack">
        <div className="vchecks">
          {self ? (
            <>
              <Check ok={record.emailVerified} label="Email verified" hint={record.emailVerified ? 'Confirmation link followed' : 'Confirmation link never followed — the contact address is unproven'} />
              <Check ok={record.bankVerified} label="Bank account verified" hint={record.bankVerified ? 'Settlement account confirmed' : 'Settlement account not yet confirmed — funds cannot be paid out'} />
              <Check ok={record.documentsOnFile >= 3} label={`${record.documentsOnFile} of 6 documents`} hint="Standard document set: application, ID, bank statement, tax certificate, PCI attestation, processing history" />
              <Check ok={false} label="Volume self-declared" hint="No bank statements read against the stated volume — approve against this figure at your own risk" />
            </>
          ) : (
            <>
              <Check ok label="Identity reviewed" hint="Documentary review by a named underwriter" />
              <Check ok label="Volume verified" hint="Stated volume read against supplied bank statements" />
              <Check ok={record.documentsOnFile >= 5} label={`${record.documentsOnFile} of 6 documents`} hint="Standard document set for a bank-boarded application" />
              <Check ok label="Relationship owned" hint="An agent is accountable for this merchant" />
            </>
          )}
        </div>

        <FieldGrid columns={2}>
          <div className="fi-summary fi-summary--single">
            <SummaryRow label="Intake Route">
              <Badge tone={self ? 'warning' : 'primary'}>{record.intakeLabel}</Badge>
            </SummaryRow>
            <SummaryRow label="Signup Source">
              {record.signupSource || <Muted>Introduced by {record.agent || 'an agent'}</Muted>}
            </SummaryRow>
            <SummaryRow label="Identity Method">{record.identityMethod}</SummaryRow>
          </div>
          <div className="fi-summary fi-summary--single">
            <SummaryRow label="Stated Monthly Volume">
              {formatCurrency(record.monthlyVolume)}
              {' '}
              {record.volumeVerified
                ? <Badge tone="success">Verified</Badge>
                : <Badge tone="warning">Unverified</Badge>}
            </SummaryRow>
            <SummaryRow label="Stated Average Ticket">
              {formatCurrency(record.averageTicket)}
              {' '}
              {record.volumeVerified
                ? <Badge tone="success">Verified</Badge>
                : <Badge tone="warning">Unverified</Badge>}
            </SummaryRow>
            <SummaryRow label="Underwriting Effort">
              {self ? 'Higher — figures need substantiating' : 'Standard — file already substantiated'}
            </SummaryRow>
          </div>
        </FieldGrid>
      </div>
    </Section>
  );
}

export default IntakeVerification;
