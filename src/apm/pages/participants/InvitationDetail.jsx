import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/Surface';
import { DetailPage, FieldGrid, FullRow, Section, SelectField, TextAreaField, TextField, useForm } from '@/components/fi911/DetailPage';
import { AddressSection, TaxBusinessSection } from '@/components/fi911/AgreementSections';
import { AttachmentsModal, ChangeStatusModal, NotesModal } from '@/components/fi911/RecordModals';
import { useDetailCrumb } from '@/components/layout/AppLayout';
import {
  INVITATIONS, INVITATION_STATUS, attachmentsFor, notesFor, statusOptionsFor,
} from '@/apm/data/participants';
import { routes } from '@/apm/data/navigation';
import brand from '@/apm/brand.config';

/**
 * Invitation detail — the lead form.
 *
 * This is the lightest of the five detail screens: an invitation is a lead,
 * not yet an application, so it collects who introduced it, who owns it, and
 * enough business identity to underwrite later. No pricing, no terminals.
 */

const opts = (list) => list.map((v) => ({ value: v, label: v }));

export function InvitationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const record = INVITATIONS.find((r) => r.id === id) ?? INVITATIONS[0];

  useDetailCrumb(record.participant);

  const [status, setStatus] = useState(record.status);
  const [modal, setModal] = useState(null);

  const form = useForm({
    agentName: record.agent,
    agentContactName: '',
    agentContactEmail: `Dm@${brand.emailDomain}`,
    assignedTo: record.assignedTo,
    type: '',
    legalName: record.participant,
    participant: record.participant,
    website: 'www.johnsmith.com',
    contact: record.contact,
    phone: record.phone,
    serviceNumber: '800-555-0100',
    email: record.email,
    businessDescription: 'Pet Shops, Pet Foods, and Supplies Stores',
    physicalAddress: '1134 main rd',
    physicalCity: 'Los Angeles',
    physicalCountry: '',
    physicalState: '',
    physicalZip: '90026',
    taxId: '457894114',
    businessType: 'Proprietary',
    participantType: '',
    businessStart: '',
    mailingAddress: '1134 main rd',
    mailingCity: 'Los Angeles',
    mailingCountry: '',
    mailingState: '',
    mailingZip: '90026',
    ownerName: record.contact,
    ownerTitle: 'CEO',
    ownerDob: '',
    ownerOwnership: '100',
    ownerAddress1: '1134 main street',
    ownerAddress2: '',
    ownerEmail: `Owner7@${brand.emailDomain}`,
    ownerCity: 'Los Angeles',
    ownerCountry: '',
    ownerState: '',
    ownerZip: '90026',
  });

  const { field } = form;

  return (
    <>
      <DetailPage
        title="Invitation"
        subtitle={`${record.agent} (${record.agent.toLowerCase().replace(/\s+/g, '').slice(0, 8)}@${brand.emailDomain})`}
        onBack={() => navigate(routes.invitations)}
        dirty={form.dirty}
        onDiscard={() => form.reset()}
        actions={<Button variant="primary" size="sm" onClick={() => setModal({ kind: 'status' })}>Update Status</Button>}
        headerIcons={[
          { icon: 'paperclip', label: 'Attachments', onSelect: () => setModal({ kind: 'attachments' }) },
          { icon: 'message', label: 'Notes', onSelect: () => setModal({ kind: 'notes' }) },
          { icon: 'printer', label: 'Print record', onSelect: () => window.print() },
        ]}
      >
        <Section title="Agent Information">
          <FieldGrid>
            <TextField {...field('agentName', 'Agent Name')} required />
            <TextField {...field('agentContactName', 'Agent Contact Name')} placeholder="Agent Contact Name" />
            <FullRow>
              <TextField {...field('agentContactEmail', 'Agent Contact Email Address')} />
            </FullRow>
          </FieldGrid>
        </Section>

        <Section title="Assignment">
          <TextField {...field('assignedTo', 'Assign To')} placeholder="Enter assignee name" />
        </Section>

        <Section title="Business Information">
          <FieldGrid>
            <SelectField {...field('type', 'Type')} options={opts(brand.participantTypes.map((t) => t.label))} placeholder="" />
            <TextField {...field('legalName', 'Legal Name')} />
            <TextField {...field('participant', 'Participant Name')} required />
            <TextField {...field('website', 'Website')} />
            <TextField {...field('contact', 'Contact Name')} required />
            <TextField {...field('phone', 'Contact Phone')} />
            <TextField {...field('serviceNumber', 'Customer Service Number')} />
            <TextField {...field('email', 'Contact Email')} required />
            <FullRow>
              <TextAreaField {...field('businessDescription', 'Business Description')} rows={3} />
            </FullRow>
          </FieldGrid>
        </Section>

        <AddressSection form={form} title="Physical Address" prefix="physical" />
        <TaxBusinessSection form={form} />
        <AddressSection form={form} title="Mailing Address" prefix="mailing" />

        <Section title="Business Owner Details">
          <FieldGrid>
            <TextField {...field('ownerName', 'Owner Name')} />
            <SelectField {...field('ownerTitle', 'Title')} options={opts(brand.ownerTitles)} placeholder="" />
            <TextField {...field('ownerDob', 'DOB (YYYY/MM/DD)')} type="date" />
            <TextField {...field('ownerOwnership', 'Ownership %')} type="number" />
            <TextField {...field('ownerAddress1', 'Address Line 1')} />
            <TextField {...field('ownerAddress2', 'Address Line 2')} placeholder="Enter address line 2" />
            <TextField {...field('ownerEmail', 'E-mail Address')} />
            <TextField {...field('ownerCity', 'City')} />
            <SelectField {...field('ownerCountry', 'Country')} options={opts(['United Kingdom', 'United States'])} placeholder="" />
            <SelectField {...field('ownerState', 'State')} options={opts(['California', 'New York', 'Texas'])} placeholder="" />
            <TextField {...field('ownerZip', 'Zip Code')} />
          </FieldGrid>
        </Section>
      </DetailPage>

      <ChangeStatusModal
        open={modal?.kind === 'status'}
        onClose={() => setModal(null)}
        current={status}
        statuses={statusOptionsFor(INVITATION_STATUS)}
        onSubmit={({ status: next }) => setStatus(next)}
        title="Update Status"
      />
      <AttachmentsModal open={modal?.kind === 'attachments'} onClose={() => setModal(null)} attachments={attachmentsFor(record.id)} />
      <NotesModal open={modal?.kind === 'notes'} onClose={() => setModal(null)} notes={notesFor(record.id)} />
    </>
  );
}

export default InvitationDetail;
