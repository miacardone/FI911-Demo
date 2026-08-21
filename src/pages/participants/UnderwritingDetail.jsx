import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  AddButton, DetailPage, FieldGrid, FullRow, RepeatBlock, Section,
  SelectField, TextField, ToggleRow, useForm,
} from '@/components/fi911/DetailPage';
import { FeeScheduleSection } from '@/components/fi911/AgreementSections';
import { AttachmentsModal, NotesModal } from '@/components/fi911/RecordModals';
import { useDetailCrumb } from '@/components/layout/AppLayout';
import { UNDERWRITING, attachmentsFor, notesFor } from '@/data/participants';
import { routes } from '@/data/navigation';
import brand from '@/brand/brand.config';

/**
 * Underwriting detail.
 *
 * Structurally a sibling of the processing agreement, but the questions are
 * the underwriter's rather than the applicant's: processing profile, banking
 * split between deposit and fee accounts, beneficial owners with masked
 * identifiers, deployed equipment and the negotiated fee schedule.
 *
 * The owner SSN/TIN and ID numbers arrive already masked from the record —
 * an underwriting screen has no reason to render a full national identifier,
 * and masking at the data boundary means no component can accidentally leak it.
 */

const opts = (list) => list.map((v) => ({ value: v, label: v }));

export function UnderwritingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const record = UNDERWRITING.find((r) => r.id === id) ?? UNDERWRITING[0];

  useDetailCrumb(record.participant);
  const [modal, setModal] = useState(null);

  const form = useForm({
    sortCode: '30-12-45',
    businessType: 'Government',
    openDate: '',
    participantType: '',
    address: '25 Gresham Street, London EC2V 7HN',
    website: 'www.barclaysmerchantservices.co.uk',
    workNumber: record.phone,
    mcc: '5411',
    monthlyVolume: '15,000.00',
    averageTicket: '15,000.00',
    moto: '25.00',
    swipe: '25.00',

    mid: '549281003',
    processor: 'First Data Omaha',
    agentName: record.agent,
    partnerName: 'Atlantic Payment Solutions',
    region: '',
    channel: '',
    mccCode: '5411 - Grocery Stores',
    marketingMethod: 'Web Referral',
    currency: 'GBP',

    productSold: 'Financial services, payment processing solutions',
    cardAcceptance: 'Visa, Mastercard, Amex, Discover',
    recurringBilling: 'Yes — Monthly subscription model',
    cardDataStorage: 'No — Tokenised via third-party vault',
    returnPolicy: '30-day full refund, 60-day prorated',
    subscriptionBilling: 'Monthly and Annual plans',
    advertiseBusiness: 'Online advertising, industry conferences, referral network',

    depositBank: 'Lloyds Bank', depositRouting: '30-12-45', depositAccount: '28473910', depositType: '',
    feeBank: 'Lloyds Bank', feeRouting: '30-12-45', feeAccount: '28473928', feeType: '',
    directCredit: true, directDebit: true,

    owners: [
      { name: 'James Richardson', title: 'CEO', ownership: '60%', dob: '', address: '14 Kensington High Street, London W8 4PT', ssn: '***-**-4521', idType: 'Passport', idNumber: '***8742' },
      { name: 'Sarah Mitchell', title: 'CFO', ownership: '40%', dob: '', address: '88 Victoria Road, London SW1V 1EZ', ssn: '***-**-7834', idType: '', idNumber: '***3291' },
    ],
    equipment: [
      { terminalType: '', make: 'Ingenico', model: 'Desk 5000', quantity: '3', serial: 'ING-50001-A', connection: '', autoClose: '23:00' },
      { terminalType: 'Mobile', make: 'Verifone', model: '', quantity: '2', serial: 'VER-400M-B', connection: '', autoClose: '22:00' },
    ],

    pricingType: 'Tiered',
    fees: [
      { name: 'Qualified Discount Rate', rate: '1.69%', perTxn: '0.20' },
      { name: 'Mid-Qualified Surcharge', rate: '0.50%', perTxn: '0.10' },
      { name: 'Non-Qualified Surcharge', rate: '1.00%', perTxn: '0.10' },
      { name: 'Monthly Statement Fee', rate: '', perTxn: '9.95' },
      { name: 'PCI Compliance Fee', rate: '', perTxn: '6.95' },
      { name: 'Chargeback Fee', rate: '', perTxn: '25.00' },
      { name: 'Batch Settlement Fee', rate: '', perTxn: '0.25' },
    ],
  });

  const { field, values, set } = form;
  const owners = values.owners ?? [];
  const equipment = values.equipment ?? [];

  const updateOwner = (i, key, v) => set('owners', owners.map((o, idx) => (idx === i ? { ...o, [key]: v } : o)));
  const updateKit = (i, key, v) => set('equipment', equipment.map((o, idx) => (idx === i ? { ...o, [key]: v } : o)));

  return (
    <>
      <DetailPage
        title="Participant Underwriting"
        subtitle={`${record.participant} — ${record.status}`}
        onBack={() => navigate(routes.underwriting)}
        dirty={form.dirty}
        onDiscard={() => form.reset()}
        headerIcons={[
          { icon: 'paperclip', label: 'Attachments', onSelect: () => setModal({ kind: 'attachments' }) },
          { icon: 'message', label: 'Notes', onSelect: () => setModal({ kind: 'notes' }) },
          { icon: 'menu', label: 'More actions', onSelect: () => {} },
        ]}
        steps={[
          {
            label: 'Participant & General',
            render: () => (
              <>
                <Section title="Participant Details">
          <FieldGrid>
            <TextField {...field('sortCode', 'Sort Code')} required />
            <SelectField {...field('businessType', 'Business Type')} options={opts(brand.businessTypes)} />
            <TextField {...field('openDate', 'Open Date')} type="date" />
            <SelectField {...field('participantType', 'Participant Type')} options={opts(['Acquirer', 'Issuer', 'Gateway'])} placeholder="" />
            <FullRow><TextField {...field('address', 'Address')} /></FullRow>
            <TextField {...field('website', 'Website')} />
            <TextField {...field('workNumber', 'Work Number')} />
            <TextField {...field('mcc', 'MCC')} />
            <TextField {...field('monthlyVolume', 'Monthly Volume')} />
            <TextField {...field('averageTicket', 'Average Ticket')} />
            <TextField {...field('moto', 'Moto %')} />
            <TextField {...field('swipe', 'Swipe %')} />
          </FieldGrid>
        </Section>
                <Section title="General Information">
          <FieldGrid>
            <TextField {...field('mid', 'MID')} required />
            <SelectField {...field('processor', 'Processor')} options={opts(['First Data Omaha', ...brand.processors])} />
            <TextField {...field('agentName', 'Agent Name')} />
            <TextField {...field('partnerName', 'Partner Name')} />
            <SelectField {...field('region', 'Region')} options={opts(['EMEA', 'North', 'South', 'West'])} placeholder="" />
            <SelectField {...field('channel', 'Channel')} options={opts(['Direct', 'Referral', 'ISO'])} placeholder="" />
            <TextField {...field('mccCode', 'MCC Code')} />
            <TextField {...field('marketingMethod', 'Marketing Method')} />
            <SelectField {...field('currency', 'Currency')} options={opts(['GBP', 'EUR', 'USD'])} />
          </FieldGrid>
        </Section>
              </>
            ),
          },
          {
            label: 'Business & Banking',
            render: () => (
              <>
                <Section title="Business Information">
          <FieldGrid>
            <TextField {...field('productSold', 'Product Sold')} />
            <TextField {...field('cardAcceptance', 'Card Acceptance')} />
            <TextField {...field('recurringBilling', 'Recurring Billing')} />
            <TextField {...field('cardDataStorage', 'Card Data Storage')} />
            <TextField {...field('returnPolicy', 'Return Policy')} />
            <TextField {...field('subscriptionBilling', 'Subscription Billing')} />
            <FullRow><TextField {...field('advertiseBusiness', 'Advertise Business')} /></FullRow>
          </FieldGrid>
        </Section>
                <Section title="Banking Information">
          <div>
            <span className="fi-checkgroup__label">Deposit Account</span>
            <FieldGrid>
              <TextField {...field('depositBank', 'Bank Name')} />
              <TextField {...field('depositRouting', 'Routing Number')} />
              <TextField {...field('depositAccount', 'Account Number')} />
              <SelectField {...field('depositType', 'Account Type')} options={opts(['Current', 'Savings'])} placeholder="" />
            </FieldGrid>
          </div>
          <div>
            <span className="fi-checkgroup__label">Fee Account</span>
            <FieldGrid>
              <TextField {...field('feeBank', 'Bank Name')} />
              <TextField {...field('feeRouting', 'Routing Number')} />
              <TextField {...field('feeAccount', 'Account Number')} />
              <SelectField {...field('feeType', 'Account Type')} options={opts(['Current', 'Savings'])} placeholder="" />
            </FieldGrid>
          </div>
          <ToggleRow label="Direct Credit Authority" checked={Boolean(values.directCredit)} onChange={(v) => set('directCredit', v)} />
          <ToggleRow label="Direct Debit Authority" checked={Boolean(values.directDebit)} onChange={(v) => set('directDebit', v)} />
        </Section>
              </>
            ),
          },
          {
            label: 'Owners, Equipment & Fees',
            render: () => (
              <>
                <Section title="Owners" actions={<AddButton onClick={() => set('owners', [...owners, {}])}>Add Owner</AddButton>}>
          {owners.map((o, i) => (
            <RepeatBlock key={i} title={`Owner ${i + 1}`} onRemove={() => set('owners', owners.filter((_, idx) => idx !== i))}>
              <FieldGrid>
                <TextField label="Name" value={o.name ?? ''} onChange={(e) => updateOwner(i, 'name', e.target.value)} />
                <TextField label="Title" value={o.title ?? ''} onChange={(e) => updateOwner(i, 'title', e.target.value)} />
                <TextField label="Ownership %" value={o.ownership ?? ''} onChange={(e) => updateOwner(i, 'ownership', e.target.value)} />
                <TextField label="DOB (MM/DD/YYYY)" type="date" value={o.dob ?? ''} onChange={(e) => updateOwner(i, 'dob', e.target.value)} />
                <FullRow><TextField label="Address" value={o.address ?? ''} onChange={(e) => updateOwner(i, 'address', e.target.value)} /></FullRow>
                <TextField label="SSN / TIN" value={o.ssn ?? ''} onChange={(e) => updateOwner(i, 'ssn', e.target.value)} />
                <SelectField label="ID Type" value={o.idType ?? ''} onChange={(e) => updateOwner(i, 'idType', e.target.value)} options={opts(brand.idTypes)} placeholder="" />
                <TextField label="ID Number" value={o.idNumber ?? ''} onChange={(e) => updateOwner(i, 'idNumber', e.target.value)} />
              </FieldGrid>
            </RepeatBlock>
          ))}
        </Section>
                <Section title="Equipment" actions={<AddButton onClick={() => set('equipment', [...equipment, {}])}>Add Equipment</AddButton>}>
          {equipment.map((k, i) => (
            <RepeatBlock key={i} title={`Equipment ${i + 1}`} onRemove={() => set('equipment', equipment.filter((_, idx) => idx !== i))}>
              <FieldGrid>
                <SelectField label="Terminal Type" value={k.terminalType ?? ''} onChange={(e) => updateKit(i, 'terminalType', e.target.value)} options={opts(brand.terminalTypes)} placeholder="" />
                <SelectField label="Make" value={k.make ?? ''} onChange={(e) => updateKit(i, 'make', e.target.value)} options={opts(brand.terminalMakes)} placeholder="" />
                <SelectField label="Model" value={k.model ?? ''} onChange={(e) => updateKit(i, 'model', e.target.value)} options={opts(['Desk 5000', 'Move 5000', 'A920', 'V400M'])} placeholder="" />
                <TextField label="Quantity" type="number" value={k.quantity ?? ''} onChange={(e) => updateKit(i, 'quantity', e.target.value)} />
                <TextField label="Serial Number" value={k.serial ?? ''} onChange={(e) => updateKit(i, 'serial', e.target.value)} />
                <SelectField label="Connection Type" value={k.connection ?? ''} onChange={(e) => updateKit(i, 'connection', e.target.value)} options={opts(['IP/Ethernet', 'WiFi', 'GPRS', 'Bluetooth'])} placeholder="" />
                <TextField label="Auto Close Time" value={k.autoClose ?? ''} onChange={(e) => updateKit(i, 'autoClose', e.target.value)} />
              </FieldGrid>
            </RepeatBlock>
          ))}
        </Section>
                <FeeScheduleSection form={form} />
              </>
            ),
          },
        ]}
      >

      </DetailPage>

      <AttachmentsModal open={modal?.kind === 'attachments'} onClose={() => setModal(null)} attachments={attachmentsFor(record.id)} />
      <NotesModal open={modal?.kind === 'notes'} onClose={() => setModal(null)} notes={notesFor(record.id)} />
    </>
  );
}

export default UnderwritingDetail;
