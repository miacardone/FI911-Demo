import { useMemo, useState } from 'react';
import { PageHeader, Badge, Button, Kpi } from '@/components/ui/Surface';
import { TabStrip } from '@/components/fi911/ListPage';
import { RowMenu } from '@/components/fi911/cells';
import { Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import { BANNERS, BANNER_KINDS, ROLES } from '@/data/setup';
import { RecordFormModal } from '@/components/fi911/RecordFormModal';
import brand from '@/brand/brand.config';
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

function BannerCard({ banner, onAction }) {
  const dead = banner.status === 'Active' && banner.impressions > 500 && banner.ctr < 1;

  return (
    <article className={`banner banner--${banner.status.toLowerCase()}`}>
      {/* Deterministic artwork stand-in. A real tenant uploads an image; a
          broken-image icon tells the admin nothing at all. */}
      <div
        className="banner__art"
        style={{ background: `linear-gradient(135deg, hsl(${banner.hue} 62% 52%), hsl(${(banner.hue + 42) % 360} 58% 38%))` }}
        aria-hidden
      >
        <Icon name={banner.kind === 'flyout' ? 'expand' : 'image'} size={22} />
      </div>

      <div className="banner__body">
        <div className="banner__head">
          <span className="banner__title">{banner.title}</span>
          <RowMenu
            items={[
              { label: 'Edit banner', icon: 'edit', onSelect: () => onAction(`Editing "${banner.title}".`) },
              { label: 'Preview', icon: 'eye', onSelect: () => onAction(`Previewing "${banner.title}" as a ${banner.kind}.`) },
              { label: banner.status === 'Active' ? 'End now' : 'Publish', icon: 'power', tone: banner.status === 'Active' ? 'danger' : undefined, onSelect: () => onAction(`"${banner.title}" ${banner.status === 'Active' ? 'ended' : 'published'}.`) },
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
  const [creating, setCreating] = useState(false);
  const [added, setAdded] = useState([]);

  const rows = useMemo(
    () => [...added, ...BANNERS].filter((b) => b.kind === kind),
    [kind, added],
  );

  const create = (v) => setAdded((a) => [{
    id: `ban-new-${a.length}`,
    kind,
    hue: (a.length * 47 + 190) % 360,
    impressions: 0, clicks: 0, ctr: 0,
    status: 'Scheduled',
    ...v,
    /* AFTER the spread: the form hands back a single role as a string and the
       card maps over roles. Spreading last put the string back and took the
       page down with it. */
    roles: v.roles ? [v.roles] : ['Admin'],
  }, ...a]);

  const live = BANNERS.filter((b) => b.status === 'Active');
  const impressions = BANNERS.reduce((s, b) => s + b.impressions, 0);
  const clicks = BANNERS.reduce((s, b) => s + b.clicks, 0);
  const dead = live.filter((b) => b.impressions > 500 && b.ctr < 1);

  return (
    <>
      <PageHeader
        title="Banner Ads"
        description="In-console announcements, and which roles actually see them"
        actions={<Button variant="primary" size="sm" icon="plus" onClick={() => setCreating(true)}>New banner</Button>}
      />

      <TabStrip
        tabs={BANNER_KINDS.map((k) => ({ value: k.id, label: k.label, count: BANNERS.filter((b) => b.kind === k.id).length }))}
        value={kind}
        onChange={setKind}
      />

      <div className="queue-kpis">
        <Kpi label="Live banners" value={live.length} meta={`${BANNERS.filter((b) => b.status === 'Scheduled').length} scheduled to start`} />
        <Kpi label="Impressions" value={impressions.toLocaleString()} meta="Across every banner" />
        <Kpi label="Click-through" value={`${impressions ? Math.round((clicks / impressions) * 1000) / 10 : 0}%`} meta={`${clicks.toLocaleString()} clicks`} />
        <Kpi label="No engagement" value={dead.length} meta="Live, seen, and nobody clicking" invert />
      </div>

      <div className="fi-panel">
        {rows.length === 0
          ? <p className="fi-note">No {kind === 'flyout' ? 'flyout' : 'thumbnail'} banners configured.</p>
          : (
            <div className="banner-grid">
              {rows.map((b) => <BannerCard key={b.id} banner={b} onAction={(m) => toast.notify(m)} />)}
            </div>
          )}
      </div>

      <RecordFormModal
        open={creating}
        onClose={() => setCreating(false)}
        title="banner"
        fields={[
          { name: 'title', label: 'Title', required: true },
          { name: 'roles', label: 'Visible To Role', type: 'select', options: ROLES.map((r) => r.name), required: true },
          { name: 'startDate', label: 'Start Date', type: 'date', required: true },
          { name: 'endDate', label: 'End Date', type: 'date' },
        ]}
        onSubmit={create}
      />
    </>
  );
}

export default BannerAds;
