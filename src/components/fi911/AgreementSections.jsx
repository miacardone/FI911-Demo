import {
  AddButton, CheckGroup, FieldGrid, FullRow, RadioGroup, RepeatBlock, Section, ToggleRow,
  SelectField, TextAreaField, TextField,
} from '@/components/fi911/DetailPage';
import brand from '@/brand/brand.config';

/**
 * PARTICIPANT PROCESSING AGREEMENT — the shared sections.
 *
 * Applications, Onboarding and Live Participants all render a "Participant
 * Processing Agreement", and Underwriting renders a near-sibling. They are not
 * the same form — Onboarding adds MCC and Participant Risk Rules, Applications
 * adds Payment Terminals and Pricing, Live wraps the lot in a 4-step wizard —
 * but they share most of their body.
 *
 * So the sections live here as composable pieces and each detail page picks
 * the ones it needs, in its own order. Building one mega-form with a dozen
 * `showX` booleans was the alternative; it would make every page pay for every
 * other page's fields and turn a layout change into a game of flag archaeology.
 *
 * Every section takes the same `form` object from `useForm()` in DetailPage.
 */

const opts = (list) => list.map((v) => ({ value: v, label: v }));

const COUNTRIES = ['United Kingdom', 'United States', 'Ireland', 'Germany', 'France'];
const US_STATES = ['California', 'Arkansas', 'South Carolina', 'New York', 'Texas'];

/* ------------------------------------------------------------------ *
 * Business information
 * ------------------------------------------------------------------ */

export function BusinessInformationSection({ form, variant = 'application' }) {
  const { field } = form;

  return (
    <Section title="Business Information">
      <FieldGrid>
        <TextField {...field('agentName', 'Agent Name')} required />
        <TextField {...field('agentEmail', 'Agent Email')} />
        {variant === 'application' && <TextField {...field('agentContactName', 'Agent Contact Name')} />}
        {variant === 'application' && <TextField {...field('agentContactEmail', 'Agent Contact Email')} />}
        <SelectField {...field('type', 'Type')} options={opts(brand.participantTypes.map((t) => t.label))} placeholder="Select type" />
        <TextField {...field('region', 'Region / Channel-Department')} placeholder="Region / Channel-Department" />
        {variant === 'application' && <TextField {...field('legalProduct', 'Legal Product Sold')} />}
        <TextField {...field('legalName', 'Legal Name')} />
        <TextField {...field('participant', 'Participant Name')} required />
        <TextField {...field('website', 'Website')} required />
        <TextField {...field('contact', 'Contact Name')} required />
        <TextField {...field('phone', 'Contact Phone')} />
        <TextField {...field('serviceNumber', 'Customer Service Number')} placeholder="Customer service number" />
        <TextField {...field('email', 'Contact Email')} required />
        <TextField {...field('taxId', 'Federal Tax ID')} required />
        <SelectField {...field('businessType', 'Business Type')} options={opts(brand.businessTypes)} placeholder="" />
        <SelectField {...field('participantType', 'Participant Type')} options={opts(['Acquirer', 'Issuer', 'Gateway'])} placeholder="" />
        <TextField {...field('businessStart', 'Business Start Date')} type="date" />
        {variant === 'application' && <TextField {...field('mcc', 'MCC')} />}
        <FullRow>
          <TextAreaField {...field('businessDescription', 'Business Description')} rows={3} />
        </FullRow>
      </FieldGrid>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Addresses
 * ------------------------------------------------------------------ */

export function AddressSection({ form, title, prefix }) {
  const { field } = form;
  const k = (name) => `${prefix}${name}`;

  return (
    <Section title={title}>
      <FieldGrid>
        <FullRow>
          <TextField {...field(k('Address'), 'Address')} placeholder="Street address" />
        </FullRow>
        <TextField {...field(k('City'), 'City')} placeholder="City" />
        <SelectField {...field(k('Country'), 'Country')} options={opts(COUNTRIES)} placeholder="Select country" />
        <SelectField {...field(k('State'), 'State')} options={opts(US_STATES)} placeholder="Select country first" />
        <TextField {...field(k('Zip'), 'Zip Code')} placeholder="Zip code" />
      </FieldGrid>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Tax & business details (Invitation form)
 * ------------------------------------------------------------------ */

export function TaxBusinessSection({ form }) {
  const { field } = form;
  return (
    <Section title="Tax &amp; Business Details">
      <FieldGrid>
        <TextField {...field('taxId', 'Federal Tax ID')} />
        <SelectField {...field('businessType', 'Business Type')} options={opts(brand.businessTypes)} placeholder="" />
        <SelectField {...field('participantType', 'Participant Type')} options={opts(['Acquirer', 'Issuer', 'Gateway'])} placeholder="" />
        <TextField {...field('businessStart', 'Business Start Date')} type="date" />
      </FieldGrid>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Transaction information
 * ------------------------------------------------------------------ */

export function TransactionInformationSection({ form, underline = false }) {
  const { field, values, set } = form;

  /* The four sales-method percentages must total 100. Showing the running
     total inline is cheaper than a validation error after submit. */
  const total = ['retailSwipe', 'keyEntered', 'moto', 'internet']
    .reduce((s, k) => s + (Number(values[k]) || 0), 0);

  return (
    <Section title="Transaction Information" underline={underline}>
      <FieldGrid columns={3}>
        <TextField {...field('averageTicket', 'Average Ticket')} type="number" />
        <TextField {...field('highestTicket', 'Highest Ticket')} type="number" />
        <TextField {...field('monthlyVolume', 'Monthly Processing Volume')} type="number" />
      </FieldGrid>

      <div>
        <span className="fi-checkgroup__label">
          Sales Method % (total should = 100%)
          {total > 0 && total !== 100 && <span className="field__error"> — currently {total}%</span>}
        </span>
        <FieldGrid columns={4}>
          <TextField {...field('retailSwipe', 'Retail Swipe %')} type="number" />
          <TextField {...field('keyEntered', 'Key Entered %')} type="number" />
          <TextField {...field('moto', 'MOTO %')} type="number" />
          <TextField {...field('internet', 'Internet %')} type="number" />
        </FieldGrid>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Nature of business
 * ------------------------------------------------------------------ */

const ADVERTISE = ['Catalog/Publications', 'Internet Ads', 'Mass/Direct Mail', 'Online', 'Other', 'Radio/Television', 'Social Media', 'Telemarketing', 'Yellow Pages'];
const SOLD_HOW = ['In Person', 'Mail Order', 'Mobile Swiped', 'Online Shopping Cart', 'Other', 'Phone Inbound', 'Phone Outbound'];
const REFUND_POLICY = ['31-90 days', 'Exchange Only', 'Full Refund', 'Greater than 90 days', 'No Refund', 'Other', 'Refund up to 30 days'];
const STOCK = ['In Stock', 'N/A', 'Other', 'Shipped direct from Manufacturer'];
const CARD_ENTRY = ['Cardholder', 'Fulfillment Center', 'Merchant', 'Other'];
const SUB_FREQUENCY = ['Every 60 days', 'Monthly', 'Other, please explain', 'Quarterly'];

export function NatureOfBusinessSection({ form, showFulfillment = false }) {
  const { values, set } = form;
  const list = (name) => values[name] ?? [];

  return (
    <Section title="Nature of Business">
      <CheckGroup label="How do you advertise/market your business?" options={ADVERTISE} values={list('advertise')} onChange={(v) => set('advertise', v)} />
      <CheckGroup label="How are your products or services sold?" options={SOLD_HOW} values={list('soldHow')} onChange={(v) => set('soldHow', v)} />

      <SelectField label="Seasonal Sales?" value={values.seasonal ?? 'No'} onChange={(e) => set('seasonal', e.target.value)} options={opts(['No', 'Yes'])} />

      <CheckGroup label="Refund Policy" options={REFUND_POLICY} values={list('refundPolicy')} onChange={(v) => set('refundPolicy', v)} />
      <CheckGroup label="If applicable, are products" options={STOCK} values={list('stock')} onChange={(v) => set('stock', v)} />

      {showFulfillment && (
        <SelectField
          label="Fulfillment timeframe for goods/services"
          value={values.fulfillment ?? '3-5 Days'}
          onChange={(e) => set('fulfillment', e.target.value)}
          options={opts(['Same Day', '1-2 Days', '3-5 Days', '1-2 Weeks', 'Over 2 Weeks'])}
        />
      )}

      <CheckGroup label="Who enters credit card information?" options={CARD_ENTRY} values={list('cardEntry')} onChange={(v) => set('cardEntry', v)} />

      <ToggleRow label="Do you currently accept credit cards at this business?" checked={Boolean(values.acceptsCards)} onChange={(v) => set('acceptsCards', v)} />
      <ToggleRow label="Do you offer subscription/recurring billing?" checked={Boolean(values.subscription)} onChange={(v) => set('subscription', v)} />

      {values.subscription && (
        <div style={{ paddingLeft: 'var(--s-5)' }}>
          <CheckGroup label="Subscription frequency" options={SUB_FREQUENCY} values={list('subFrequency')} onChange={(v) => set('subFrequency', v)} />
        </div>
      )}

      <ToggleRow label="Do you bill your customer prior to goods being shipped or services being provided?" checked={Boolean(values.billPrior)} onChange={(v) => set('billPrior', v)} />
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Cardholder data storage compliance
 * ------------------------------------------------------------------ */

const COMPLIANCE_SHORT = [
  ['storesCardData', 'Is cardholder data stored in any format (electronic or paper)?'],
  ['storesTrack', 'Does your company store the full contents of any track from the magnetic stripe or PIN?'],
  ['storesCvv', 'Does your company store the card validation code or value (CVV/CVV2)?'],
  ['accessLimited', 'Is access to system components and cardholder data limited to only those whose jobs require it?'],
  ['noUnencrypted', 'Are policies in place to preclude sending unencrypted credit card numbers via e-mail or messaging?'],
];

const COMPLIANCE_LONG = [
  ['storesCardData', 'Is Cardholder data stored in any format (electronic or paper)?'],
  ['storesTrack', 'Does your company store the full contents of any track from the magnetic stripe of credit cards, or personal identification numbers (PIN) or the encrypted PIN block?'],
  ['storesCvv', 'Does your company store the card validation code or value (three or four-digit number on the front or back of a card) used to verify card-not-present transactions?'],
  ['accessLimited', 'Is access to system components and cardholder data limited to only those individuals whose jobs require such access?'],
  ['noUnencrypted', 'Are policies, procedures, and practices in place to preclude the sending of unencrypted credit card number by end-user technologies like e-mail, messaging or chat?'],
];

export function ComplianceSection({ form, long = false }) {
  const { values, set } = form;
  const questions = long ? COMPLIANCE_LONG : COMPLIANCE_SHORT;

  return (
    <Section title="Cardholder Data Storage Compliance">
      {questions.map(([name, label]) => (
        <ToggleRow key={name} label={label} checked={Boolean(values[name])} onChange={(v) => set(name, v)} />
      ))}
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Participant risk rules (Onboarding)
 * ------------------------------------------------------------------ */

const RISK_GROUPS = [
  ['volume', 'Volume'],
  ['value', 'Value $'],
  ['account', 'Account'],
  ['email', 'Email'],
  ['ipDevice', 'IP / Device'],
];

export function ParticipantRiskRulesSection({ form }) {
  const { field } = form;

  return (
    <Section title="Participant Risk Rules" underline>
      {RISK_GROUPS.map(([key, label]) => (
        <div key={key}>
          <span className="fi-checkgroup__label">{label}</span>
          <FieldGrid columns={3}>
            <TextField {...field(`${key}Hourly`, 'Max Hourly Transaction Limit')} type="number" placeholder="0" />
            <TextField {...field(`${key}Daily`, 'Max Daily Transaction Limit')} type="number" placeholder="0" />
            <TextField {...field(`${key}Monthly`, 'Max Monthly Transaction Limit')} type="number" placeholder="0" />
          </FieldGrid>
        </div>
      ))}

      <FieldGrid columns={3}>
        <TextField {...field('chargebackRatio', 'Chargeback/Claim Ratio (%)')} type="number" placeholder="0" />
        <TextField {...field('chargebackVolume', 'Chargeback/Claim Volume')} type="number" placeholder="0" />
      </FieldGrid>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Repeating groups — bank accounts, individuals, terminals
 * ------------------------------------------------------------------ */

export function BankAccountsSection({ form }) {
  const { values, set } = form;
  const accounts = values.bankAccounts ?? [{}];

  const update = (i, key, value) => set('bankAccounts', accounts.map((a, idx) => (idx === i ? { ...a, [key]: value } : a)));

  return (
    <Section title="Bank Accounts" actions={<AddButton onClick={() => set('bankAccounts', [...accounts, {}])}>Add Account</AddButton>}>
      {accounts.map((a, i) => (
        <RepeatBlock
          key={i}
          title={`Bank Account ${i + 1}`}
          onRemove={accounts.length > 1 ? () => set('bankAccounts', accounts.filter((_, idx) => idx !== i)) : undefined}
        >
          <FieldGrid>
            <TextField label="Bank Name" value={a.bankName ?? ''} onChange={(e) => update(i, 'bankName', e.target.value)} />
            <TextField label="Account Number" value={a.accountNumber ?? ''} onChange={(e) => update(i, 'accountNumber', e.target.value)} />
            <TextField label="Routing Number" value={a.routing ?? ''} onChange={(e) => update(i, 'routing', e.target.value)} />
            <SelectField label="Account Use" value={a.use ?? ''} onChange={(e) => update(i, 'use', e.target.value)} options={opts(brand.accountUses)} placeholder="" />
          </FieldGrid>
        </RepeatBlock>
      ))}
    </Section>
  );
}

export function IndividualsSection({ form }) {
  const { values, set } = form;
  const people = values.individuals ?? [{}];

  const update = (i, key, value) => set('individuals', people.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)));

  return (
    <Section title="Individual Information" actions={<AddButton onClick={() => set('individuals', [...people, {}])}>Add Individual</AddButton>}>
      {people.map((p, i) => (
        <RepeatBlock
          key={i}
          title={`Individual ${i + 1}`}
          onRemove={people.length > 1 ? () => set('individuals', people.filter((_, idx) => idx !== i)) : undefined}
        >
          <FieldGrid>
            <TextField label="Name" value={p.name ?? ''} onChange={(e) => update(i, 'name', e.target.value)} />
            <TextField label="DOB (MM/DD/YYYY)" type="date" value={p.dob ?? ''} onChange={(e) => update(i, 'dob', e.target.value)} />
            <TextField label="Contact Number" value={p.phone ?? ''} onChange={(e) => update(i, 'phone', e.target.value)} />
            <TextField label="E-mail Address" value={p.email ?? ''} onChange={(e) => update(i, 'email', e.target.value)} />
            <TextField label="Address Line 1" value={p.address1 ?? ''} onChange={(e) => update(i, 'address1', e.target.value)} />
            <TextField label="Address Line 2" value={p.address2 ?? ''} placeholder="Address line 2" onChange={(e) => update(i, 'address2', e.target.value)} />
            <TextField label="City" value={p.city ?? ''} onChange={(e) => update(i, 'city', e.target.value)} />
            <SelectField label="Country" value={p.country ?? ''} onChange={(e) => update(i, 'country', e.target.value)} options={opts(COUNTRIES)} placeholder="" />
            <SelectField label="State" value={p.state ?? ''} onChange={(e) => update(i, 'state', e.target.value)} options={opts(US_STATES)} placeholder="" />
            <TextField label="Zip Code" value={p.zip ?? ''} onChange={(e) => update(i, 'zip', e.target.value)} />
            <TextField label="SSN" value={p.ssn ?? ''} placeholder="SSN" onChange={(e) => update(i, 'ssn', e.target.value)} />
            <SelectField label="Identification Type" value={p.idType ?? ''} onChange={(e) => update(i, 'idType', e.target.value)} options={opts(brand.idTypes)} placeholder="" />
            <TextField label="Identification Number" value={p.idNumber ?? ''} onChange={(e) => update(i, 'idNumber', e.target.value)} />
            <TextField label="Issuer Country" value={p.issuerCountry ?? ''} onChange={(e) => update(i, 'issuerCountry', e.target.value)} />
            <TextField label="Issuer State" value={p.issuerState ?? ''} placeholder="e.g. CA" onChange={(e) => update(i, 'issuerState', e.target.value)} />
            <TextField label="Expiry Date" type="date" value={p.expiry ?? ''} onChange={(e) => update(i, 'expiry', e.target.value)} />
          </FieldGrid>

          <div>
            <span className="fi-checkgroup__label">Company Information</span>
            <FieldGrid>
              <SelectField label="Title" value={p.title ?? ''} onChange={(e) => update(i, 'title', e.target.value)} options={opts(brand.ownerTitles)} placeholder="" />
              <TextField label="Ownership %" type="number" value={p.ownership ?? '0'} onChange={(e) => update(i, 'ownership', e.target.value)} />
            </FieldGrid>
            <div className="fi-checkgroup__grid" style={{ marginTop: 'var(--s-2)' }}>
              {[['isSignatory', 'Is Signatory'], ['isOfficer', 'Is Officer'], ['isBeneficiary', 'Is Beneficiary Owner']].map(([key, label]) => (
                <label key={key} className="check-row">
                  <input type="checkbox" className="checkbox" checked={Boolean(p[key])} onChange={(e) => update(i, key, e.target.checked)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
        </RepeatBlock>
      ))}
    </Section>
  );
}

export function PaymentTerminalsSection({ form }) {
  const { values, set } = form;
  const terminals = values.terminals ?? [{}];

  const update = (i, key, value) => set('terminals', terminals.map((t, idx) => (idx === i ? { ...t, [key]: value } : t)));

  return (
    <Section title="Payment Terminals" actions={<AddButton onClick={() => set('terminals', [...terminals, {}])}>Add Terminal</AddButton>}>
      {terminals.map((t, i) => (
        <RepeatBlock
          key={i}
          title={`Terminal ${i + 1}`}
          onRemove={terminals.length > 1 ? () => set('terminals', terminals.filter((_, idx) => idx !== i)) : undefined}
        >
          <FieldGrid>
            <SelectField label="Equipment Type" value={t.equipmentType ?? ''} onChange={(e) => update(i, 'equipmentType', e.target.value)} options={opts(brand.terminalTypes)} placeholder="Select type" />
            <SelectField label="Make" value={t.make ?? ''} onChange={(e) => update(i, 'make', e.target.value)} options={opts(brand.terminalMakes)} placeholder="Select make" />
            <SelectField label="Model" value={t.model ?? ''} onChange={(e) => update(i, 'model', e.target.value)} options={opts(['Desk 5000', 'Move 5000', 'A920', 'V400M', 'Flex'])} placeholder="Select model" />
            <TextField label="Terminal ID" value={t.terminalId ?? ''} placeholder="Terminal ID" onChange={(e) => update(i, 'terminalId', e.target.value)} />
            <TextField label="TID Descriptor" value={t.descriptor ?? ''} placeholder="Descriptor" onChange={(e) => update(i, 'descriptor', e.target.value)} />
            <TextField label="Monthly Rental" value={t.rental ?? ''} placeholder="0.00" onChange={(e) => update(i, 'rental', e.target.value)} />
            <TextField label="Daily Auth Count" type="number" value={t.authCount ?? '0'} onChange={(e) => update(i, 'authCount', e.target.value)} />
            <SelectField label="Ownership Type" value={t.ownership ?? ''} onChange={(e) => update(i, 'ownership', e.target.value)} options={opts(['Owned', 'Rented', 'Leased'])} placeholder="Select ownership" />
            <SelectField label="Service Option" value={t.service ?? ''} onChange={(e) => update(i, 'service', e.target.value)} options={opts(['Standard', 'Next Day Swap', 'On-site'])} placeholder="Select option" />
          </FieldGrid>
        </RepeatBlock>
      ))}
    </Section>
  );
}

export function DefaultTerminalSettingsSection({ form }) {
  const { field } = form;
  return (
    <Section title="Default Terminal Settings">
      <FieldGrid>
        <TextField {...field('prompt', 'Prompt')} placeholder="Prompt" />
        <TextField {...field('pinDebit', 'PIN Based Debit')} placeholder="Yes / No" />
        <TextField {...field('autoClose', 'Auto Close Time')} placeholder="e.g. 11:59 PM" />
        <TextField {...field('cvvOn', 'CVV On')} placeholder="Yes / No" />
        <TextField {...field('fraudLastFour', 'Fraud Control Last Four Prompt')} placeholder="Yes / No" />
        <TextField {...field('tipAtSale', 'Tip at Time of Sale')} placeholder="Yes / No" />
        <TextField {...field('smallTicket', 'Small Ticket')} placeholder="Yes / No" />
        <TextField {...field('passwordRefund', 'Password Protect Refund')} placeholder="Yes / No" />
        <TextField {...field('captureMethod', 'Capture Method')} placeholder="Terminal / Host" />
        <TextField {...field('commsMethod', 'Communication Method')} placeholder="IP/Ethernet, etc." />
        <FullRow>
          <TextAreaField {...field('specialInstructions', 'Special Instructions')} rows={3} placeholder="Special instructions" />
        </FullRow>
      </FieldGrid>
    </Section>
  );
}

export function ShippingMethodSection({ form }) {
  const { values, set } = form;
  return (
    <Section title="Shipping Method">
      <RadioGroup
        name="shipping"
        options={['Ship to Participant Address', 'Ship to Other Address']}
        value={values.shipping ?? 'Ship to Participant Address'}
        onChange={(v) => set('shipping', v)}
      />
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Pricing
 * ------------------------------------------------------------------ */

const CARD_RATES = [
  ['mcVisaDiscover', 'MC/Visa/Discover'],
  ['mcVisaDiscoverMid', 'MC/Visa/Discover® Mid-Qualified'],
  ['mcVisaDiscoverNon', 'MC/Visa/Discover® Non-Qualified'],
  ['amex', 'AMEX'],
  ['amexMid', 'AMEX Mid-Qualified'],
  ['amexNon', 'AMEX Non-Qualified'],
];

const PIN_RATES = [
  ['pinDebitRate', 'PIN Debit'],
  ['visaCredit', 'Visa Credit'],
  ['visaDebit', 'Visa Debit'],
  ['mcCredit', 'Mastercard Credit'],
  ['mcDebit', 'Mastercard Debit'],
];

const MISC_FEES = [
  ['joining', 'Joining (one-time charge)'], ['annual', 'Annual (per annum)'],
  ['admin', 'Administration Fee (per month)'], ['creditTxn', 'Credit Transaction (per transaction)'],
  ['debitTxn', 'Debit Transaction (per transaction)'], ['minService', 'Minimum Merchant Service (per month)'],
  ['amexSwitch', 'AMEX Switching Fee (%)'], ['dcc', 'DCC Commission (%)'],
  ['refundTxn', 'Refund Transaction (per transaction)'], ['chargebackFee', 'Chargeback (per occurrence)'],
  ['retrieval', 'Retrieval (per occurrence)'], ['closure', 'Closure (one-time charge)'],
  ['urgentInstall', 'Urgent Installation (one-time charge)'], ['earlyTermination', 'Early Termination (per year remaining)'],
  ['lostEquipment', 'Lost Supplied Equipment'], ['otherFees', 'Other fees'],
];

/** A rate row: a name, a percentage and a per-transaction amount. */
function RateRow({ label, form, name }) {
  const { values, set } = form;
  return (
    <div className="rate-row">
      <span className="rate-row__label">{label}</span>
      <input
        className="input rate-row__num"
        type="number" step="0.01"
        value={values[`${name}Pct`] ?? ''}
        onChange={(e) => set(`${name}Pct`, e.target.value)}
        aria-label={`${label} percentage`}
      />
      <span className="rate-row__op">% + $</span>
      <input
        className="input rate-row__num"
        type="number" step="0.001"
        value={values[`${name}Fixed`] ?? ''}
        onChange={(e) => set(`${name}Fixed`, e.target.value)}
        aria-label={`${label} per transaction`}
      />
    </div>
  );
}

export function PricingSection({ form }) {
  const { values, set, field } = form;

  return (
    <Section title="Pricing">
      <FieldGrid>
        <TextField {...field('pricingType', 'Pricing Type')} placeholder="Interchange Plus" />
      </FieldGrid>

      <div>
        <span className="fi-checkgroup__label">MC/Visa/Discover/AMEX Rates</span>
        <div className="rate-table">
          <div className="rate-row rate-row--head">
            <span className="rate-row__label">RATE</span>
            <span className="rate-row__num">%</span>
            <span className="rate-row__op" />
            <span className="rate-row__num">$ per txn</span>
          </div>
          {CARD_RATES.map(([name, label]) => <RateRow key={name} name={name} label={label} form={form} />)}
        </div>
      </div>

      <FieldGrid columns={3}>
        <TextField {...field('authFee', 'Authorization Fee')} type="number" step="0.0001" />
      </FieldGrid>

      <div>
        <span className="fi-checkgroup__label">Surcharge</span>
        <FieldGrid columns={3}>
          <TextField {...field('surchargePct', '% of Txn. value')} type="number" placeholder="0" />
          <TextField {...field('surchargePerTxn', 'or Per Txn.')} type="number" placeholder="0" />
        </FieldGrid>
      </div>

      <div>
        <span className="fi-checkgroup__label">PIN Debit Rates</span>
        <div className="rate-table">
          <div className="rate-row rate-row--head">
            <span className="rate-row__label">RATE</span>
            <span className="rate-row__num">%</span>
            <span className="rate-row__op" />
            <span className="rate-row__num">$ per txn</span>
          </div>
          {PIN_RATES.map(([name, label]) => <RateRow key={name} name={name} label={label} form={form} />)}
        </div>
      </div>

      <div>
        <span className="fi-checkgroup__label">Miscellaneous Fees</span>
        <FieldGrid>
          {MISC_FEES.map(([name, label]) => (
            <TextField key={name} {...field(name, label)} type="number" step="0.01" />
          ))}
        </FieldGrid>
      </div>
    </Section>
  );
}

/* ------------------------------------------------------------------ *
 * Fee schedule (Underwriting)
 * ------------------------------------------------------------------ */

export function FeeScheduleSection({ form }) {
  const { values, set } = form;
  const fees = values.fees ?? [];

  const update = (i, key, value) => set('fees', fees.map((f, idx) => (idx === i ? { ...f, [key]: value } : f)));

  return (
    <Section title="Fee Schedule">
      <FieldGrid>
        <SelectField
          label="Pricing Type"
          value={values.pricingType ?? 'Tiered'}
          onChange={(e) => set('pricingType', e.target.value)}
          options={opts(brand.pricingTypes)}
        />
      </FieldGrid>

      <div className="fee-table">
        <div className="fee-row fee-row--head">
          <span>FEE NAME</span>
          <span className="fee-row__num">Rate %</span>
          <span className="fee-row__num">Per Txn</span>
          <span className="fee-row__del" />
        </div>
        {fees.map((f, i) => (
          <div className="fee-row" key={i}>
            <input className="input" value={f.name ?? ''} onChange={(e) => update(i, 'name', e.target.value)} aria-label="Fee name" />
            <input className="input fee-row__num" value={f.rate ?? ''} placeholder="-" onChange={(e) => update(i, 'rate', e.target.value)} aria-label="Rate %" />
            <input className="input fee-row__num" value={f.perTxn ?? ''} onChange={(e) => update(i, 'perTxn', e.target.value)} aria-label="Per transaction" />
            <button type="button" className="fi-repeat__remove fee-row__del" onClick={() => set('fees', fees.filter((_, idx) => idx !== i))} aria-label={`Remove ${f.name}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M4 7h16M10 11v6M14 11v6" /><path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13M9 7V4h6v3" /></svg>
            </button>
          </div>
        ))}
      </div>

      <div><AddButton onClick={() => set('fees', [...fees, { name: '', rate: '', perTxn: '' }])}>Add Fee</AddButton></div>
    </Section>
  );
}
