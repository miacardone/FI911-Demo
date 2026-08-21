import { Fragment, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/Surface';
import { DetailPage, useForm } from '@/components/fi911/DetailPage';
import {
  AddressSection, BankAccountsSection, BusinessInformationSection, ComplianceSection,
  DefaultTerminalSettingsSection, IndividualsSection, NatureOfBusinessSection,
  ParticipantRiskRulesSection, PaymentTerminalsSection, PricingSection, ShippingMethodSection,
  TransactionInformationSection,
} from '@/components/fi911/AgreementSections';
import { AttachmentsModal, NotesModal } from '@/components/fi911/RecordModals';
import { useDetailCrumb } from '@/components/layout/AppLayout';
import { LIVE_PARTICIPANTS, attachmentsFor, notesFor } from '@/data/participants';
import { institutionByName, sortCodeFor } from '@/data/reference';
import { routes } from '@/data/navigation';
import { formatCurrency } from '@/utils/format';
import { statusTone } from '@/domain/statuses';

/**
 * Live Participant detail — the agreement as a four-step wizard.
 *
 * A live participant's agreement is long enough that presenting it as one
 * scroll is hostile, so the reference splits it into Business Information /
 * Banking & Individual Information / Terminals / Pricing.
 *
 * The steps are NAVIGATION, not a submission flow — the record already exists,
 * so every step is reachable in any order and nothing gates on completing the
 * previous one. Treating them as a linear wizard would make reviewing the
 * pricing of a live participant a four-click journey.
 */

const STEPS = ['Business Information', 'Banking & Individual Information', 'Terminals', 'Pricing'];

function Steps({ current, onSelect }) {
  return (
    <div className="fi-steps">
      {STEPS.map((label, i) => (
        <Fragment key={label}>
          <button
            type="button"
            className={`fi-step ${i === current ? 'is-active' : i < current ? 'is-done' : ''}`.trim()}
            onClick={() => onSelect(i)}
            aria-current={i === current ? 'step' : undefined}
          >
            <span className="fi-step__dot">{i + 1}</span>
            <span className="fi-step__label">{label}</span>
          </button>
          {i < STEPS.length - 1 && <span className="fi-step__line" />}
        </Fragment>
      ))}
    </div>
  );
}

function SummaryRow({ label, children }) {
  return (
    <div className="fi-summary__row">
      <span className="fi-summary__label">{label} :</span>
      <span className="fi-summary__value">{children}</span>
    </div>
  );
}

export function LiveParticipantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const record = LIVE_PARTICIPANTS.find((r) => r.id === id) ?? LIVE_PARTICIPANTS[0];

  useDetailCrumb(record.participant);

  const [step, setStep] = useState(0);
  const [modal, setModal] = useState(null);

  const institution = institutionByName(record.participant);
  const sortCode = institution?.sortCode ?? sortCodeFor(record.participant);

  const form = useForm({
    agentName: record.agent,
    agentEmail: `Clooney@ukpaymentsops.co.uk`,
    type: record.type,
    region: '',
    legalName: record.participant,
    participant: record.participant,
    website: 'www.nikesportstest.com',
    contact: record.contact,
    phone: record.phone,
    serviceNumber: '754-875-8475',
    email: record.email,
    taxId: '548785748',
    businessType: '',
    participantType: '',
    businessStart: '',
    businessDescription: 'sports products',

    physicalAddress: '556 Tilbury turn ave', physicalCity: 'Duluth', physicalCountry: 'United States', physicalState: 'Arkansas', physicalZip: '43784',
    mailingAddress: '4120 Mathis Airport Ln', mailingCity: 'Buford', mailingCountry: 'United States', mailingState: 'South Carolina', mailingZip: '43784',

    averageTicket: '100.00', highestTicket: '500', monthlyVolume: '100000',
    retailSwipe: '60', keyEntered: '0', moto: '0', internet: '20',

    advertise: ['Internet Ads', 'Online', 'Social Media'],
    soldHow: ['In Person', 'Online Shopping Cart'],
    seasonal: 'No',
    refundPolicy: ['Full Refund', 'Refund up to 30 days'],
    stock: ['In Stock'],
    fulfillment: '3-5 Days',
    cardEntry: ['Cardholder'],
    acceptsCards: true,
    subscription: false,
    billPrior: false,

    volumeHourly: '25', volumeDaily: '200', volumeMonthly: '6000',
    valueHourly: '5000', valueDaily: '20000', valueMonthly: '120000',
    accountHourly: '15', accountDaily: '80', accountMonthly: '800',
    emailHourly: '10', emailDaily: '50', emailMonthly: '500',
    ipDeviceHourly: '5', ipDeviceDaily: '20', ipDeviceMonthly: '200',
    chargebackRatio: '0.75', chargebackVolume: '5',

    storesCardData: false, storesTrack: false, storesCvv: false,
    accessLimited: true, noUnencrypted: true,

    bankAccounts: [{ bankName: record.participant, accountNumber: '28473910', routing: sortCode, use: 'Direct Credit Authority' }],
    individuals: [{ name: record.contact, phone: record.phone, email: record.email, city: 'Duluth', ownership: '100', isSignatory: true, isOfficer: true }],
    terminals: [{}],
    shipping: 'Ship to Participant Address',
    pricingType: 'Interchange Plus',
  });

  return (
    <>
      <DetailPage
        title="Participant Processing Agreement"
        badge={{ label: record.type, tone: record.type === 'Bank' ? 'success' : 'info' }}
        onBack={() => navigate(routes.liveParticipants)}
        dirty={form.dirty}
        onDiscard={() => form.reset()}
        headerIcons={[
          { icon: 'file', label: 'Agreement PDF', onSelect: () => {} },
          { icon: 'paperclip', label: 'Attachments', onSelect: () => setModal({ kind: 'attachments' }) },
          { icon: 'message', label: 'Notes', onSelect: () => setModal({ kind: 'notes' }) },
          { icon: 'menu', label: 'More actions', onSelect: () => {} },
        ]}
      >
        <section className="fi-section">
          <header className="fi-section__head"><span className="fi-section__title">Participant Details</span></header>
          <div className="fi-section__body">
            <div className="fi-summary">
              <SummaryRow label="Participant Name">{record.participant}</SummaryRow>
              <SummaryRow label="Business Type">LLC</SummaryRow>
              <SummaryRow label="Sort Code">{sortCode}</SummaryRow>
              <SummaryRow label="Status"><Badge tone={statusTone(record.status)}>{record.status}</Badge></SummaryRow>
              <SummaryRow label="Agent Name">{record.agent}</SummaryRow>
              <SummaryRow label="Work Number">{record.phone}</SummaryRow>
              <SummaryRow label="Contact Name">{record.contact}</SummaryRow>
              <SummaryRow label="Email">{record.email}</SummaryRow>
              <SummaryRow label="Participant Address">556 Tilbury turn ave</SummaryRow>
              <SummaryRow label="Average Ticket">100.00</SummaryRow>
              <SummaryRow label="Open Date">2015/07/24</SummaryRow>
              <SummaryRow label="Annual Revenue">-</SummaryRow>
              <SummaryRow label="Highest Txn (3M)">
                {formatCurrency(record.highest)} <span className={record.trend === 'up' ? 'trend--up' : 'trend--down'}>{record.trend === 'up' ? '↗' : '↘'}</span>
              </SummaryRow>
            </div>
          </div>
        </section>

        <Steps current={step} onSelect={setStep} />

        {step === 0 && (
          <>
            <BusinessInformationSection form={form} variant="onboarding" />
            <AddressSection form={form} title="Physical Address" prefix="physical" />
            <AddressSection form={form} title="Mailing Address" prefix="mailing" />
            <TransactionInformationSection form={form} />
            <NatureOfBusinessSection form={form} showFulfillment />
            <ParticipantRiskRulesSection form={form} />
            <ComplianceSection form={form} long />
          </>
        )}

        {step === 1 && (
          <>
            <BankAccountsSection form={form} />
            <IndividualsSection form={form} />
          </>
        )}

        {step === 2 && (
          <>
            <PaymentTerminalsSection form={form} />
            <DefaultTerminalSettingsSection form={form} />
            <ShippingMethodSection form={form} />
          </>
        )}

        {step === 3 && <PricingSection form={form} />}
      </DetailPage>

      <AttachmentsModal open={modal?.kind === 'attachments'} onClose={() => setModal(null)} attachments={attachmentsFor(record.id)} />
      <NotesModal open={modal?.kind === 'notes'} onClose={() => setModal(null)} notes={notesFor(record.id)} />
    </>
  );
}

export default LiveParticipantDetail;
