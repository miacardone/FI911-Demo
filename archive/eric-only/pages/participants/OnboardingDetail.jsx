import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Surface';
import { DetailPage, FieldGrid, Section, TextField, useForm } from '@/components/fi911/DetailPage';
import {
  AddressSection, BusinessInformationSection, ComplianceSection,
  NatureOfBusinessSection, ParticipantRiskRulesSection, TransactionInformationSection,
} from '@/components/fi911/AgreementSections';
import { AttachmentsModal, ChangeStatusModal, NotesModal } from '@/components/fi911/RecordModals';
import { useDetailCrumb } from '@/components/layout/AppLayout';
import { ONBOARDING, ONBOARDING_STATUS, attachmentsFor, notesFor, statusOptionsFor } from '@/data/participants';
import { routes } from '@/data/navigation';

/**
 * Onboarding detail — "PSP — Participant Processing Agreement".
 *
 * Same agreement, one stage later, plus the two things that only matter once
 * a participant is about to go live: the MCC it will process under, and the
 * Participant Risk Rules that will police it — hourly/daily/monthly ceilings
 * by volume, value, account, email and device, plus the chargeback ratio that
 * trips a review. Those limits are what Risk Management's Held Volume screen
 * later enforces, which is why they are captured here rather than after launch.
 */

export function OnboardingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const record = ONBOARDING.find((r) => r.id === id) ?? ONBOARDING[0];

  useDetailCrumb(record.participant);

  const [status, setStatus] = useState(record.status);
  const [modal, setModal] = useState(null);

  const form = useForm({
    agentName: record.agent,
    agentEmail: `lMartinez@ukpaymentsops.co.uk`,
    type: record.type,
    region: '',
    legalName: record.participant,
    participant: record.participant,
    website: 'www.barclaysmerchantservices.co.uk',
    contact: record.contact,
    phone: '020-156-9978',
    serviceNumber: '',
    email: record.email,
    taxId: '457894114',
    businessType: 'Proprietary',
    participantType: '',
    businessStart: '',
    businessDescription: 'Pet Shops, Pet Foods, and Supplies Stores',

    physicalAddress: '1134 main rd', physicalCity: 'Los Angeles', physicalCountry: 'United States', physicalState: 'California', physicalZip: '90026',
    mailingAddress: '', mailingCity: '', mailingCountry: '', mailingState: '', mailingZip: '',

    mcc: '',

    averageTicket: '350', highestTicket: '3500', monthlyVolume: '35000',
    retailSwipe: '30', keyEntered: '0', moto: '40', internet: '30',

    advertise: ['Internet Ads', 'Online', 'Social Media'],
    soldHow: ['In Person', 'Online Shopping Cart'],
    seasonal: 'No',
    refundPolicy: ['Full Refund', 'Refund up to 30 days'],
    stock: ['In Stock'],
    cardEntry: ['Cardholder', 'Merchant'],
    acceptsCards: true,
    subscription: true,
    subFrequency: ['Every 60 days', 'Monthly'],
    billPrior: false,

    volumeHourly: '0', volumeDaily: '0', volumeMonthly: '0',
    valueHourly: '0', valueDaily: '0', valueMonthly: '0',
    accountHourly: '0', accountDaily: '0', accountMonthly: '0',
    emailHourly: '0', emailDaily: '0', emailMonthly: '0',
    ipDeviceHourly: '0', ipDeviceDaily: '0', ipDeviceMonthly: '0',
    chargebackRatio: '0', chargebackVolume: '0',

    storesCardData: false, storesTrack: false, storesCvv: false,
    accessLimited: true, noUnencrypted: true,
  });

  return (
    <>
      <DetailPage
        title="PSP — Participant Processing Agreement"
        subtitle={`${record.agent} (lMartinez@ukpaymentsops.co.uk)`}
        onBack={() => navigate(routes.onboarding)}
        dirty={form.dirty}
        onDiscard={() => form.reset()}
        actions={<Button variant="primary" size="sm" onClick={() => setModal({ kind: 'status' })}>Update Status</Button>}
        headerIcons={[
          { icon: 'menu', label: 'More actions', onSelect: () => {} },
          { icon: 'message', label: 'Notes', onSelect: () => setModal({ kind: 'notes' }) },
          { icon: 'paperclip', label: 'Attachments', onSelect: () => setModal({ kind: 'attachments' }) },
          { icon: 'userCheck', label: 'Assign participant', onSelect: () => {} },
        ]}
        values={form.values}
        steps={[
          {
            label: 'Business Information',
            required: ['agentName', 'agentEmail', 'type', 'legalName', 'participant', 'website',
              'contact', 'phone', 'email', 'taxId', 'businessType', 'businessDescription',
              'physicalAddress', 'physicalCity', 'physicalZip', 'mcc'],
            render: () => (
              <>
                <BusinessInformationSection form={form} variant="onboarding" />
                <AddressSection form={form} title="Physical Address" prefix="physical" />
                <AddressSection form={form} title="Mailing Address" prefix="mailing" />
                <Section title="MCC">
                  <FieldGrid>
                    <TextField {...form.field('mcc', 'MCC')} placeholder="MCC code" />
                  </FieldGrid>
                </Section>
              </>
            ),
          },
          {
            label: 'Trading Profile',
            required: ['averageTicket', 'highestTicket', 'monthlyVolume', 'retailSwipe',
              'keyEntered', 'moto', 'internet', 'advertise', 'soldHow', 'refundPolicy'],
            render: () => (
              <>
                <TransactionInformationSection form={form} underline />
                <NatureOfBusinessSection form={form} />
              </>
            ),
          },
          {
            label: 'Risk Rules',
            required: ['volumeHourly', 'volumeDaily', 'volumeMonthly', 'valueHourly', 'valueDaily',
              'valueMonthly', 'chargebackRatio', 'chargebackVolume'],
            render: () => <ParticipantRiskRulesSection form={form} />,
          },
          {
            label: 'Compliance',
            required: ['storesCardData', 'storesTrack', 'storesCvv', 'accessLimited', 'noUnencrypted'],
            render: () => <ComplianceSection form={form} long />,
          },
        ]}
      >
      </DetailPage>

      <ChangeStatusModal
        open={modal?.kind === 'status'}
        onClose={() => setModal(null)}
        current={status}
        statuses={statusOptionsFor(ONBOARDING_STATUS)}
        onSubmit={({ status: next }) => setStatus(next)}
        title="Update Status"
      />
      <AttachmentsModal open={modal?.kind === 'attachments'} onClose={() => setModal(null)} attachments={attachmentsFor(record.id)} />
      <NotesModal open={modal?.kind === 'notes'} onClose={() => setModal(null)} notes={notesFor(record.id)} />
    </>
  );
}

export default OnboardingDetail;
