import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Surface';
import { DetailPage, useForm } from '@/components/fi911/DetailPage';
import {
  AddressSection, BankAccountsSection, BusinessInformationSection, ComplianceSection,
  DefaultTerminalSettingsSection, IndividualsSection, NatureOfBusinessSection,
  PaymentTerminalsSection, PricingSection, ShippingMethodSection, TransactionInformationSection,
} from '@/components/fi911/AgreementSections';
import { AttachmentsModal, ChangeStatusModal, NotesModal } from '@/components/fi911/RecordModals';
import { IntakeVerification } from '@/components/fi911/IntakeVerification';
import { useDetailCrumb } from '@/components/layout/AppLayout';
import { APPLICATIONS, APPLICATION_STATUS, attachmentsFor, notesFor, statusOptionsFor } from '@/data/participants';
import { routes } from '@/data/navigation';
import { useToast } from '@/context/ToastContext';

/**
 * Application detail — the full Participant Processing Agreement.
 *
 * This is the widest form in the console: identity, both addresses, trading
 * profile, compliance attestations, banking, beneficial owners, terminals and
 * the complete rate card. It is assembled from AgreementSections rather than
 * written out, so Onboarding and Live can reuse the same blocks in a different
 * order without any of it being copied.
 */

export function ApplicationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const record = APPLICATIONS.find((r) => r.id === id) ?? APPLICATIONS[0];

  useDetailCrumb(record.merchant);

  const [status, setStatus] = useState(record.status);
  const [modal, setModal] = useState(null);

  const form = useForm({
    agentName: record.agent,
    agentEmail: 'gayle.seder@fi911.com',
    agentContactName: record.agent,
    agentContactEmail: 'gayle.seder@fi911.com',
    type: record.type,
    region: 'West / Enterprise',
    legalProduct: 'Business Banking & Payment Processing',
    legalName: `${record.merchant.replace(/ (LLC|Inc|Co)$/, '')} LLC`,
    merchant: record.merchant,
    website: 'www.tide.co',
    contact: record.contact,
    phone: record.phone,
    serviceNumber: '0800-555-0660',
    email: record.email,
    taxId: '88-9900112',
    businessType: 'Corporation',
    participantType: '',
    businessStart: '',
    mcc: '6099',
    businessDescription: 'SME-focused digital banking platform — Business accounts and invoicing',

    physicalAddress: '640 Commerce Drive', physicalCity: 'Columbus', physicalCountry: 'United States', physicalState: 'OH', physicalZip: '43215',
    mailingAddress: '640 Commerce Drive', mailingCity: 'Columbus', mailingCountry: 'United States', mailingState: 'OH', mailingZip: '43215',

    averageTicket: '195', highestTicket: '4000', monthlyVolume: '350000',
    retailSwipe: '5', keyEntered: '10', moto: '10', internet: '75',

    advertise: ['Internet Ads', 'Social Media'],
    soldHow: ['Online Shopping Cart'],
    seasonal: 'No',
    refundPolicy: ['Full Refund', 'Refund up to 30 days'],
    stock: [],
    cardEntry: ['Cardholder'],
    acceptsCards: true,
    subscription: true,
    subFrequency: ['Monthly'],
    billPrior: false,

    storesCardData: false, storesTrack: false, storesCvv: false,
    accessLimited: true, noUnencrypted: true,

    bankAccounts: [{ bankName: 'First Citizens Bank', accountNumber: '04112233445566', routing: '040620021', use: 'Direct Credit Authority' }],
    individuals: [{
      name: record.contact, phone: record.phone, email: record.email,
      address1: '640 Commerce Drive', city: 'Columbus', zip: '43215',
      idType: 'Driver’s License', idNumber: 'OH-RM428913', issuerCountry: 'United States',
      ownership: '0', isSignatory: true, isOfficer: true, isBeneficiary: false,
    }],
    terminals: [{}],
    shipping: 'Ship to Merchant Address',

    pricingType: 'Interchange Plus',
    mcVisaDiscoverPct: '0.11', mcVisaDiscoverFixed: '0.004',
    mcVisaDiscoverMidPct: '0.21', mcVisaDiscoverMidFixed: '0.007',
    mcVisaDiscoverNonPct: '0.34', mcVisaDiscoverNonFixed: '0.011',
    amexPct: '0.07', amexFixed: '0.007',
    amexMidPct: '0.24', amexMidFixed: '0.011',
    amexNonPct: '0.38', amexNonFixed: '0.016',
    authFee: '0.0003',
    surchargePct: '0', surchargePerTxn: '0',
    pinDebitRatePct: '0.03', pinDebitRateFixed: '0.006',
    visaCreditPct: '0.21', visaCreditFixed: '0.11',
    visaDebitPct: '0.03', visaDebitFixed: '0.07',
    mcCreditPct: '0.24', mcCreditFixed: '0.11',
    mcDebitPct: '0.03', mcDebitFixed: '0.07',
    joining: '60', annual: '35', admin: '4.50', creditTxn: '0.22',
    debitTxn: '0.20', minService: '9', amexSwitch: '0.003', dcc: '0.18',
    refundTxn: '0.006', chargebackFee: '24', retrieval: '9', closure: '90',
    urgentInstall: '25', earlyTermination: '40', lostEquipment: '50', otherFees: '0',
  });

  return (
    <>
      <DetailPage
        title="Merchant Processing Agreement"
        subtitle={`${record.agent} (${record.agent.toLowerCase().replace(/\s+/g, '.')}@fi911.com)`}
        onBack={() => navigate(routes.applications)}
        dirty={form.dirty}
        onSave={() => form.markSaved()}
        onDiscard={() => form.reset()}
        actions={<Button variant="primary" size="sm" onClick={() => setModal({ kind: 'status' })}>Update Status</Button>}
        headerIcons={[
          { icon: 'paperclip', label: 'Attachments', onSelect: () => setModal({ kind: 'attachments' }) },
          { icon: 'message', label: 'Notes', onSelect: () => setModal({ kind: 'notes' }) },
          {
            icon: 'mail',
            label: 'Email merchant',
            /* Hands off to the operator's own mail client — the console has no
               outbox, and a fake compose window would be worse. */
            onSelect: () => {
              window.location.href = `mailto:${record.email}?subject=${encodeURIComponent(`Your application — ${record.merchant ?? ''}`)}`;
            },
          },
        ]}
        values={form.values}
        /* A step is a screen, not a chapter. */
        steps={[
          {
            label: 'Business',
            required: ['agentName', 'agentEmail', 'type', 'legalName', 'merchant', 'website',
              'contact', 'phone', 'email', 'taxId', 'businessType', 'businessDescription',
              'physicalAddress', 'physicalCity', 'physicalZip', 'mailingAddress', 'mailingCity', 'mailingZip'],
            render: () => <BusinessInformationSection form={form} variant="application" />,
          },
          {
            label: 'Verification',
            required: [],
            render: () => <IntakeVerification record={record} />,
          },
          {
            label: 'Addresses',
            required: [],
            render: () => (
              <>
                <AddressSection form={form} title="Physical Address" prefix="physical" />
                <AddressSection form={form} title="Mailing Address" prefix="mailing" />
              </>
            ),
          },
          {
            label: 'Processing',
            required: ['averageTicket', 'highestTicket', 'monthlyVolume', 'retailSwipe',
              'keyEntered', 'moto', 'internet', 'advertise', 'soldHow', 'refundPolicy', 'cardEntry'],
            render: () => <TransactionInformationSection form={form} />,
          },
          {
            label: 'Nature of Business',
            required: [],
            render: () => <NatureOfBusinessSection form={form} />,
          },
          {
            label: 'Compliance',
            required: [],
            render: () => <ComplianceSection form={form} />,
          },
          {
            label: 'Banking',
            required: ['bankAccounts', 'individuals'],
            render: () => <BankAccountsSection form={form} />,
          },
          {
            label: 'Individuals',
            required: [],
            render: () => <IndividualsSection form={form} />,
          },
          {
            label: 'Terminals',
            required: ['pricingType', 'authFee', 'mcVisaDiscoverPct', 'amexPct', 'joining',
              'annual', 'admin', 'chargebackFee', 'shipping'],
            render: () => (
              <>
                <PaymentTerminalsSection form={form} />
                <DefaultTerminalSettingsSection form={form} />
              </>
            ),
          },
          {
            label: 'Shipping',
            required: [],
            render: () => <ShippingMethodSection form={form} />,
          },
          {
            label: 'Card Rates',
            required: [],
            render: () => <PricingSection form={form} part="rates" />,
          },
          {
            label: 'Debit & Fees',
            required: [],
            render: () => <PricingSection form={form} part="fees" />,
          },
        ]}
      >
      </DetailPage>

      <ChangeStatusModal
        open={modal?.kind === 'status'}
        onClose={() => setModal(null)}
        current={status}
        statuses={statusOptionsFor(APPLICATION_STATUS)}
        onSubmit={({ status: next }) => setStatus(next)}
        title="Update Status"
      />
      <AttachmentsModal open={modal?.kind === 'attachments'} onClose={() => setModal(null)} attachments={attachmentsFor(record.id)} />
      <NotesModal open={modal?.kind === 'notes'} onClose={() => setModal(null)} notes={notesFor(record.id)} />
    </>
  );
}

export default ApplicationDetail;
