import { useMemo, useState } from 'react';
import { PageHeader, Badge, Button, Kpi } from '@/components/ui/Surface';
import { TabStrip } from '@/components/fi911/ListPage';
import { RowMenu } from '@/components/fi911/cells';
import { Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import { BANNERS, BANNER_KINDS, ROLES } from '@/apm/data/setup';
import { RecordFormModal } from '@/components/fi911/RecordFormModal';
import Modal from '@/components/ui/Modal';
import { useRecords } from '@/hooks/useRecords';
import brand from '@/apm/brand.config';
import { useToast } from '@/context/ToastContext';

/**
 * Setup > Admin > Banner Ads.
 *
 * In-console announcements, and which roles see them.
 *
 * The reference shows a card grid of broken image placeholders labeled only
 * "Roles: 2" — you cannot tell what a banner says, when it runs, or whether
 * anyone clicked it. A banner nobody clicks is worth knowing about, so each
 * card carries its title, its schedule, its audience and its click-through
 * rate, and a banner that has been live with no engagement says so.
 */

function BannerCard({ banner, onEdit, onPreview, onToggle }) {
  const dead = banner.status === 'Active' && banner.impressions > 500 && banner.ctr < 1;

  return (
    <article className={`banner banner--${banner.status.toLowerCase()}`}>
      {/* A rendered PREVIEW of the announcement, not a random-hue rectangle.
          Twelve unrelated gradients read as decoration and told the admin
          nothing; what they need to see is roughly how the thing will look
          in the console, in the console's own colors. */}
      <div className={`banner__art banner__art--${banner.kind}`} aria-hidden>
        <span className="banner__art-chrome">
          <Icon name={banner.kind === 'flyout' ? 'expand' : 'megaphone'} size={13} />
          {banner.kind === 'flyout' ? 'Flyout' : 'Thumbnail'}
        </span>
        <span className="banner__art-title">{banner.title}</span>
      </div>

      <div className="banner__body">
        <div className="banner__head">
          <span className="banner__title">{banner.title}</span>
          <RowMenu
            items={[
              { label: 'Edit banner', icon: 'edit', onSelect: () => onEdit(banner) },
              { label: 'Preview', icon: 'eye', onSelect: () => onPreview(banner) },
              {
                label: banner.status === 'Active' ? 'End now' : 'Publish',
                icon: 'power',
                tone: banner.status === 'Active' ? 'danger' : undefined,
                onSelect: () => onToggle(banner),
              },
            ]}
          />
        </div>

        <span className="banner__dates">
          <Icon name="calendar" size={12} className="subtle" />
          {banner.startDate} → {banner.endDate}
        </span>

        <div className="banner__roles">
          {banner.roles.slice(0, 3).map((r) => <span key={r} className="setup-chip">{r}</span>)}
          {banner.roles.length > 3 && (
            <Tooltip label={banner.roles.slice(3).join(', ')}>
              <span className="setup-chip">+{banner.roles.length - 3}</span>
            </Tooltip>
          )}
        </div>

        <div className="banner__stats">
          <span className="banner__stat">
            <strong>{banner.impressions.toLocaleString()}</strong>
            <span>Impressions</span>
          </span>
          <span className="banner__stat">
            <strong>{banner.clicks.toLocaleString()}</strong>
            <span>Clicks</span>
          </span>
          <span className="banner__stat">
            <Tooltip label={dead ? 'Live with almost no engagement — worth rewriting or retiring' : 'Click-through rate'}>
              <strong className={dead ? 'warn' : ''}>{banner.ctr}%</strong>
            </Tooltip>
            <span>CTR</span>
          </span>
          <Badge tone={banner.status === 'Active' ? 'success' : banner.status === 'Scheduled' ? 'primary' : 'neutral'} dot>
            {banner.status}
          </Badge>
        </div>
      </div>
    </article>
  );
}

export function BannerAds() {
  const toast = useToast();
  const [kind, setKind] = useState('thumbnail');
  const store = useRecords(BANNERS, { key: 'id' });
  const all = store.rows;

  const [draft, setDraft] = useState(null);
  const editing = draft && Object.keys(draft).length > 0 ? draft : null;
  const [preview, setPreview] = useState(null);

  const rows = useMemo(() => all.filter((b) => b.kind === kind), [kind, all]);

  const submit = (v) => {
    /* roles AFTER the spread: the form hands back a single role as a string
       and the card maps over roles. Spreading last put the string back and
       took the page down with it. */
    const shaped = { ...v, roles: v.roles ? [v.roles] : ['Admin'] };
    if (editing) { store.update(editing, shaped); return; }
    store.create({
      id: `ban-new-${all.length}`,
      kind,
      impressions: 0, clicks: 0, ctr: 0,
      status: 'Scheduled',
      ...shaped,
    });
  };

  const toggle = (b) => {
    const next = b.status === 'Active' ? 'Expired' : 'Active';
    store.update(b, { status: next });
    toast.notify(`"${b.title}" ${next === 'Active' ? 'published' : 'ended'}.`);
  };

  /* Read off the live rows so publishing a banner moves the KPI strip. */
  const live = all.filter((b) => b.status === 'Active');
  const impressions = all.reduce((s, b) => s + b.impressions, 0);
  const clicks = all.reduce((s, b) => s + b.clicks, 0);
  const dead = live.filter((b) => b.impressions > 500 && b.ctr < 1);

  return (
    <>
      <PageHeader
        title="Banner Ads"
        description="In-console announcements, and which roles actually see them"
        actions={<Button variant="primary" size="sm" icon="plus" onClick={() => setDraft({})}>New banner</Button>}
      />

      <TabStrip
        tabs={BANNER_KINDS.map((k) => ({ value: k.id, label: k.label, count: all.filter((b) => b.kind === k.id).length }))}
        value={kind}
        onChange={setKind}
      />

      <div className="queue-kpis">
        <Kpi label="Live banners" value={live.length} meta={`${all.filter((b) => b.status === 'Scheduled').length} scheduled to start`} />
        <Kpi label="Impressions" value={impressions.toLocaleString()} meta="Across every banner" />
        <Kpi label="Click-through" value={`${impressions ? Math.round((clicks / impressions) * 1000) / 10 : 0}%`} meta={`${clicks.toLocaleString()} clicks`} />
        <Kpi label="No engagement" value={dead.length} meta="Live, seen, and nobody clicking" invert />
      </div>

      <div className="fi-panel">
        {rows.length === 0
          ? <p className="fi-note">No {kind === 'flyout' ? 'flyout' : 'thumbnail'} banners configured.</p>
          : (
            <div className="banner-grid">
              {rows.map((b) => (
                <BannerCard
                  key={b.id}
                  banner={b}
                  onEdit={setDraft}
                  onPreview={setPreview}
                  onToggle={toggle}
                />
              ))}
            </div>
          )}
      </div>

      <RecordFormModal
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title="banner"
        fields={[
          { name: 'title', label: 'Title', required: true },
          { name: 'roles', label: 'Visible To Role', type: 'select', options: ROLES.map((r) => r.name), required: true },
          { name: 'startDate', label: 'Start Date', type: 'date', required: true },
          { name: 'endDate', label: 'End Date', type: 'date' },
        ]}
        initial={editing ? { ...editing, roles: editing.roles?.[0] ?? '' } : null}
        onSubmit={submit}
      />

      <Modal
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
        title={`Preview — ${preview?.title ?? ''}`}
        size="md"
        footer={<Button variant="secondary" onClick={() => setPreview(null)}>Close</Button>}
      >
        {preview && (
          <div className="stack">
            <p className="fi-note">
              How this {preview.kind === 'flyout' ? 'flyout' : 'thumbnail'} appears to
              {' '}{preview.roles.join(', ')}.
            </p>
            <div className={`banner-preview banner-preview--${preview.kind}`}>
              <span className="banner-preview__chrome">
                <Icon name={preview.kind === 'flyout' ? 'expand' : 'megaphone'} size={14} />
                Announcement
              </span>
              <span className="banner-preview__title">{preview.title}</span>
              <span className="banner-preview__dates">
                Running {preview.startDate} → {preview.endDate}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default BannerAds;
