import { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { Badge, Button, PageHeader } from '@/components/ui/Surface';
import { FieldGrid, Section, SelectField, TextField, ToggleRow, useForm } from '@/components/fi911/DetailPage';
import { useBrand } from '@/brand/BrandProvider';
import { usePreferences, THEMES } from '@/context/PreferencesContext';
import { useToast } from '@/context/ToastContext';

/**
 * Setup — tenant configuration.
 *
 * This screen is the white-label control file made visible. Everything here is
 * read from `brand.config.js` — the palette, the processors, the MCC list, the
 * record-numbering scheme, the feature flags — which is exactly the point of
 * having a single tenant control file: the settings screen is a VIEW of it
 * rather than a second copy that can drift.
 *
 * Feature flags actually gate UI elsewhere in the console, so switching one
 * off is not decorative — it is the same switch the code reads.
 */

const opts = (list) => list.map((v) => ({ value: v, label: v }));

function Swatch({ name, value }) {
  return (
    <div className="swatch">
      <span className="swatch__chip" style={{ background: value }} />
      <span className="swatch__text">
        <span className="swatch__name">{name}</span>
        <span className="swatch__value">{value}</span>
      </span>
    </div>
  );
}

function ListChips({ items }) {
  return (
    <div className="setup-chips">
      {items.map((i) => <span key={i} className="setup-chip">{i}</span>)}
    </div>
  );
}

export function TenantConfiguration() {
  const brand = useBrand();
  const toast = useToast();
  const { theme, setTheme, density, setDensity } = usePreferences();

  const [flags, setFlags] = useState(brand.features);

  const form = useForm({
    tenantName: brand.name,
    productName: brand.productName,
    legalName: brand.legalName,
    supportEmail: brand.supportEmail,
    emailDomain: brand.emailDomain,
    currency: brand.currency,
    locale: brand.locale,
    timezone: brand.timezone,
    prefix: brand.numbering.prefix,
    separator: brand.numbering.separator,
    digits: String(brand.numbering.digits),
    nextSequence: String(brand.numbering.nextSequence),
  });

  const { field } = form;

  const brandColours = [
    ['Primary', brand.colors.primary],
    ['Primary deep', brand.colors.primaryDeep],
    ['Accent', brand.colors.accent],
    ['Navigation rail', brand.colors.navRail],
    ['Canvas', brand.colors.canvas],
    ['Ink', brand.colors.ink],
  ];

  return (
    <>
      <PageHeader
        title="Tenant Configuration"
        description="The single control file behind every screen in this console"
        actions={(
          <Button
            variant="primary"
            size="sm"
            icon="check"
            disabled={!form.dirty}
            onClick={() => { form.markSaved(); toast.notify('Tenant configuration saved.'); }}
          >
            {form.dirty ? 'Save configuration' : 'Saved'}
          </Button>
        )}
      />

      <div className="fi-detail__body">
        <Section title="Tenant">
          <FieldGrid>
            <TextField {...field('tenantName', 'Tenant Name')} />
            <TextField {...field('productName', 'Product Name')} />
            <TextField {...field('legalName', 'Legal Name')} />
            <TextField {...field('supportEmail', 'Support Email')} />
            <TextField {...field('emailDomain', 'Operator Email Domain')} />
          </FieldGrid>
        </Section>

        <Section title="Localization">
          <FieldGrid columns={3}>
            <SelectField {...field('currency', 'Currency')} options={opts(['USD', 'EUR', 'GBP'])} />
            <SelectField {...field('locale', 'Locale')} options={opts(['en-US', 'en-GB', 'de-DE'])} />
            <SelectField {...field('timezone', 'Timezone')} options={opts(['America/New_York', 'America/Chicago', 'America/Los_Angeles', 'UTC'])} />
          </FieldGrid>
        </Section>

        <Section title="Record Numbering" defaultOpen={false}>
          <FieldGrid columns={4}>
            <TextField {...field('prefix', 'Prefix')} />
            <TextField {...field('separator', 'Separator')} />
            <TextField {...field('digits', 'Digits')} type="number" />
            <TextField {...field('nextSequence', 'Next Sequence')} type="number" />
          </FieldGrid>
          <p className="fi-note">
            Next record will be numbered{' '}
            <strong>
              {form.values.prefix}{form.values.separator}
              {String(form.values.nextSequence).padStart(Number(form.values.digits) || 6, '0')}
            </strong>
          </p>
        </Section>

        <Section title="Appearance" defaultOpen={false}>
          <div>
            <span className="fi-checkgroup__label">Theme</span>
            <div className="profile__seg" style={{ maxWidth: 380, marginTop: 6 }}>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`profile__seg-btn ${theme === t.id ? 'is-active' : ''}`.trim()}
                  onClick={() => setTheme(t.id)}
                >
                  <Icon name={t.icon} size={13} /> {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="fi-checkgroup__label">Default table density</span>
            <div className="profile__seg" style={{ maxWidth: 380, marginTop: 6 }}>
              {[{ id: 'fit', label: 'Fit to width' }, { id: 'comfortable', label: 'Comfortable' }].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`profile__seg-btn ${density === d.id ? 'is-active' : ''}`.trim()}
                  onClick={() => setDensity(d.id)}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="fi-checkgroup__label">Brand palette</span>
            <div className="swatch-grid">
              {brandColours.map(([name, value]) => <Swatch key={name} name={name} value={value} />)}
            </div>
          </div>
        </Section>

        <Section title="Reference Data" defaultOpen={false}>
          <div>
            <span className="fi-checkgroup__label">Processors ({brand.processors.length})</span>
            <ListChips items={brand.processors} />
          </div>
          <div>
            <span className="fi-checkgroup__label">Merchant Category Codes ({brand.mccs.length})</span>
            <ListChips items={brand.mccs.map((m) => `${m.code} — ${m.label}`)} />
          </div>
          <div>
            <span className="fi-checkgroup__label">Business Types</span>
            <ListChips items={brand.businessTypes} />
          </div>
          <div>
            <span className="fi-checkgroup__label">Pricing Types</span>
            <ListChips items={brand.pricingTypes} />
          </div>
        </Section>

        <Section title="Feature Flags">
          <p className="fi-note">
            These are the same flags the application code reads — switching one off removes the
            control everywhere it appears.
          </p>
          {Object.entries(flags).map(([key, on]) => (
            <ToggleRow
              key={key}
              label={key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}
              checked={on}
              onChange={(v) => {
                setFlags((f) => ({ ...f, [key]: v }));
                toast.notify(`${key} ${v ? 'enabled' : 'disabled'}.`);
              }}
            />
          ))}
        </Section>

        <Section title="Demo Access" defaultOpen={false}>
          <FieldGrid>
            <TextField label="Username" value={brand.demoCredentials.username} readOnly />
            <TextField label="Password" value={brand.demoCredentials.password} readOnly />
          </FieldGrid>
          <p className="fi-note">
            <Badge tone="warning" dot>Demo tenant</Badge>{' '}
            These credentials exist because this is a demonstration build. A production tenant
            authenticates against the identity provider and has no static credentials.
          </p>
        </Section>
      </div>
    </>
  );
}

export default TenantConfiguration;
