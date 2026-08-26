import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '@/components/ui/Surface';
import { DetailPage, useForm } from '@/components/fi911/DetailPage';
import {
  AddressSection, BankAccountsSection, BusinessInformationSection, ComplianceSection,
  DefaultTerminalSettingsSection, IndividualsSection, NatureOfBusinessSection,
  ParticipantRiskRulesSection, PaymentTerminalsSection, PricingSection, ShippingMethodSection,
  TransactionInformationSection,
} from '@/components/fi911/AgreementSections';
import { SummaryRow } from '@/components/fi911/cells';
import { AttachmentsModal, NotesModal } from '@/components/fi911/RecordModals';
import { useDetailCrumb } from '@/components/layout/AppLayout';
import { LIVE_PARTICIPANTS, attachmentsFor, notesFor } from '@/data/participants';
import { institutionByName, routingNumberFor } from '@/data/reference';
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

export function LiveParticipantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const record = LIVE_PARTICIPANTS.find((r) => r.id === id) ?? LIVE_PARTICIPANTS[0];

  useDetailCrumb(record.merchant);

  const [modal, setModal] = useState(null);

  const institution = institutionByName(record.merchant);
  const routingNumber = institution?.routingNumber ?? routingNumberFor(record.merchant);

  const form = useForm({
    agentName: record.agent,
    agentEmail: `Clooney@ukpaymentsops.com`,
    type: record.type,
    region: '',
    legalName: record.merchant,
    merchant: record.merchant,
    website: 'www.nikesportstest.com',
    contact: record.contact,
    phone: record.phone,
    serviceNumber: '754-875-8475',
    email: record.email,
    taxId: '54-8785748',
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

    bankAccounts: [{ bankName: record.merchant, accountNumber: '28473910', routing: routingNumber, use: 'Direct Credit Authority' }],
    individuals: [{ name: record.contact, phone: record.phone, email: record.email, city: 'Duluth', ownership: '100', isSignatory: true, isOfficer: true }],
    terminals: [{}],
    shipping: 'Ship to Merchant Address',
    pricingType: 'Interchange Plus',
  });

  return (
    <>
      <DetailPage
        title="Merchant Processing Agreement"
        badge={{ label: record.type, tone: record.type === 'Bank' ? 'success' : 'info' }}
        onBack={() => navigate(routes.liveParticipants)}
        dirty={form.dirty}
        onSave={() => form.markSaved()}
        onDiscard={() => form.reset()}
        headerIcons={[
          { icon: 'file', label: 'Agreement PDF', onSelect: () => {} },
          { icon: 'paperclip', label: 'Attachments', onSelect: () => setModal({ kind: 'attachments' }) },
          { icon: 'message', label: 'Notes', onSelect: () => setModal({ kind: 'notes' }) },
          { icon: 'menu', label: 'More actions', onSelect: () => {} },
        ]}
        summary={(
          <section className="fi-section">
            <header className="fi-section__head"><span className="fi-section__title">Participant Details</span></header>
            <div className="fi-section__body">
              <div className="fi-summary">
                <SummaryRow label="Merchant Name">{record.merchant}</SummaryRow>
                <SummaryRow label="Business Type">LLC</SummaryRow>
                <SummaryRow label="Routing Number">{routingNumber}</SummaryRow>
                <SummaryRow label="Status"><Badge tone={statusTone(record.status)}>{record.status}</Badge></SummaryRow>
                <SummaryRow label="Agent Name">{record.agent}</SummaryRow>
                <SummaryRow label="Work Number">{record.phone}</SummaryRow>
                <SummaryRow label="Contact Name">{record.contact}</SummaryRow>
                <SummaryRow label="Email">{record.email}</SummaryRow>
                <SummaryRow label="Merchant Address">556 Tilbury turn ave</SummaryRow>
                <SummaryRow label="Average Ticket">100.00</SummaryRow>
                <SummaryRow label="Open Date">2015/07/24</SummaryRow>
                <SummaryRow label="Annual Revenue">-</SummaryRow>
                <SummaryRow label="Highest Txn (3M)">
                  {formatCurrency(record.highest)} <span className={record.trend === 'up' ? 'trend--up' : 'trend--down'}>{record.trend === 'up' ? '↗' : '↘'}</span>
                </SummaryRow>
              </div>
            </div>
          </section>
        )}
        values={form.values}
        /* One screen per step. The four-step version put seven sections in its
           first step, which is how a "wizard" ended up 5.5 screens tall — the
           steps were chapter headings, not pages. */
        steps={[
          {
            label: 'Business',
            required: ['agentName', 'agentEmail', 'type', 'legalName', 'merchant', 'website', 'contact', 'phone', 'email', 'taxId'],
            render: () => <BusinessInformationSection form={form} variant="onboarding" />,
          },
          {
            label: 'Addresses',
            required: ['physicalAddress', 'physicalCity', 'physicalZip'],
            render: () => (
              <>
                <AddressSection form={form} title="Physical Address" prefix="physical" />
                <AddressSection form={form} title="Mailing Address" prefix="mailing" />
              </>
            ),
          },
          {
            label: 'Processing',
            required: ['averageTicket', 'monthlyVolume'],
            render: () => <TransactionInformationSection form={form} />,
          },
          {
            label: 'Nature of Business',
            required: ['businessDescription'],
            render: () => <NatureOfBusinessSection form={form} showFulfillment />,
          },
          {
            label: 'Risk Rules',
            required: [],
            render: () => <ParticipantRiskRulesSection form={form} />,
          },
          {
            label: 'Compliance',
            required: [],
            render: () => <ComplianceSection form={form} long />,
          },
          {
            label: 'Banking',
            required: ['bankAccounts'],
            render: () => <BankAccountsSection form={form} />,
          },
          {
            label: 'Individuals',
            required: ['individuals'],
            render: () => <IndividualsSection form={form} />,
          },
          {
            label: 'Terminals',
            required: ['terminals', 'shipping'],
            render: () => (
              <>
                <PaymentTerminalsSection form={form} />
                <DefaultTerminalSettingsSection form={form} />
                <ShippingMethodSection form={form} />
              </>
            ),
          },
          {
            label: 'Card Rates',
            required: ['pricingType'],
            render: () => <PricingSection form={form} part="rates" />,
          },
          {
            label: 'Debit & Fees',
            required: [],
            render: () => <PricingSection form={form} part="fees" />,
          },
        ]}
      />

      <AttachmentsModal open={modal?.kind === 'attachments'} onClose={() => setModal(null)} attachments={attachmentsFor(record.id)} />
      <NotesModal open={modal?.kind === 'notes'} onClose={() => setModal(null)} notes={notesFor(record.id)} />
    </>
  );
}

export default LiveParticipantDetail;
