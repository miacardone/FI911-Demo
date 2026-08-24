import { useMemo, useState } from 'react';
import Icon from '@/components/ui/Icon';
import { Badge, Button } from '@/components/ui/Surface';
import { ListPage } from '@/components/fi911/ListPage';
import { AdvancedSearchPanel, applyFilters } from '@/components/fi911/Filters';
import { Muted, TwoLine, menuColumn } from '@/components/fi911/cells';
import { DOCUMENTS, DOCUMENT_TYPES } from '@/data/reports';
import { INSTITUTIONS } from '@/data/reference';
import { useToast } from '@/context/ToastContext';

/**
 * Document Center — every file held against a participant, in one place.
 *
 * Files otherwise live inside the Attachments modal of whichever record they
 * were uploaded to, which makes "find me that merchant's KYC pack" a hunt
 * through five funnel stages. This is the flat view.
 *
 * RETENTION IS THE REASON THIS SCREEN EARNS ITS PLACE. Each document carries a
 * retention period, so the list can say which files are close to aging out —
 * a compliance question a folder cannot answer. That is what the Expiry column
 * and the "Expiring soon" tab are for.
 */

const TODAY = new Date('2026-08-20T00:00:00');

const expiryOf = (doc) => {
  const d = new Date(doc.uploaded.replace(/\//g, '-'));
  d.setFullYear(d.getFullYear() + doc.retentionYears);
  return d;
};

const daysUntilExpiry = (doc) => Math.round((expiryOf(doc) - TODAY) / 86_400_000);

const stamp = (d) => `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

const ADVANCED_FIELDS = [
  { name: 'name', label: 'File Name' },
  { name: 'merchant', label: 'Merchant', type: 'select', options: INSTITUTIONS.map((i) => ({ value: i.name, label: i.name })) },
  { name: 'type', label: 'Document Type', type: 'select', options: DOCUMENT_TYPES.map((t) => ({ value: t.label, label: t.label })) },
  { name: 'uploadedBy', label: 'Uploaded By' },
  { name: 'uploaded', label: 'Uploaded', type: 'date' },
];

export function DocumentCenter() {
  const toast = useToast();
  const [docs, setDocs] = useState(DOCUMENTS);
  const [tab, setTab] = useState('all');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [criteria, setCriteria] = useState({});
  const [applied, setApplied] = useState({});

  const enriched = useMemo(
    () => docs.map((d) => ({ ...d, expires: stamp(expiryOf(d)), daysLeft: daysUntilExpiry(d) })),
    [docs],
  );

  const TABS = useMemo(() => ([
    { value: 'all', label: 'All', match: () => true },
    { value: 'expiring', label: 'Expiring soon', tone: 'danger', match: (d) => d.daysLeft <= 365 },
    { value: 'confidential', label: 'Confidential', match: (d) => d.confidential },
    ...DOCUMENT_TYPES.slice(0, 3).map((t) => ({ value: t.id, label: t.label, match: (d) => d.typeId === t.id })),
  ]), []);

  const tabs = TABS.map((t) => ({ ...t, count: enriched.filter(t.match).length }));

  const visible = useMemo(() => {
    const spec = TABS.find((t) => t.value === tab) ?? TABS[0];
    return applyFilters(enriched.filter(spec.match), ADVANCED_FIELDS, applied);
  }, [enriched, tab, applied, TABS]);

  const columns = [
    {
      key: 'name', header: 'File', fw: 20, sortable: true,
      cell: (r) => (
        <span className="row row--tight row--nowrap">
          <Icon name={r.icon} size={16} className="subtle" />
          <TwoLine primary={r.name} secondary={`${r.sizeMb} MB`} />
        </span>
      ),
      text: (r) => r.name,
    },
    { key: 'type', header: 'Document Type', fw: 12, sortable: true },
    {
      key: 'merchant', header: 'Merchant', fw: 15, sortable: true,
      cell: (r) => <TwoLine primary={r.participant} secondary={r.routingNumber} />,
      text: (r) => `${r.merchant} ${r.routingNumber}`,
    },
    { key: 'uploadedBy', header: 'Uploaded By', fw: 12, sortable: true },
    { key: 'uploaded', header: 'Uploaded', fw: 9, sortable: true },
    {
      key: 'expires', header: 'Retention Expiry', fw: 11, sortable: true,
      description: 'When this document may be destroyed under its retention policy',
      cell: (r) => (
        <span className={r.daysLeft <= 365 ? 'money--neg' : undefined} style={r.daysLeft <= 365 ? { fontWeight: 600 } : undefined}>
          {r.expires}
          {r.daysLeft <= 365 && <span className="micro"> ({Math.max(0, Math.round(r.daysLeft / 30))}mo)</span>}
        </span>
      ),
      sortValue: (r) => r.daysLeft,
    },
    {
      key: 'confidential', header: 'Access', fw: 9, align: 'center',
      description: 'Confidential documents are restricted to underwriting and risk',
      cell: (r) => (r.confidential
        ? <Badge tone="danger" dot>Confidential</Badge>
        : <Badge tone="neutral">Standard</Badge>),
      text: (r) => (r.confidential ? 'Confidential' : 'Standard'),
    },
    menuColumn((row) => [
      { label: 'Preview', icon: 'eye', onSelect: () => toast.notify(`Previewing ${row.name}`) },
      { label: 'Download', icon: 'download', onSelect: () => toast.notify('Download started.') },
      { label: 'Copy link', icon: 'link', onSelect: () => toast.notify('Link copied.') },
      {
        label: 'Delete',
        icon: 'trash',
        tone: 'danger',
        onSelect: () => { setDocs((ds) => ds.filter((d) => d.id !== row.id)); toast.notify(`${row.name} deleted.`); },
      },
    ]),
  ];

  const expiringSoon = enriched.filter((d) => d.daysLeft <= 365).length;

  return (
    <ListPage
      title="Document Center"
      description="Every document held against a merchant, with its retention position"
      tabs={tabs}
      tab={tab}
      onTabChange={setTab}
      scope={[
        { label: 'Documents', value: `${enriched.length}` },
        { label: 'Within 12 months of expiry', value: `${expiringSoon}` },
      ]}
      columns={columns}
      rows={visible}
      searchPlaceholder="Search documents"
      exportName="document-center"
      onAdvanced={() => setAdvancedOpen((v) => !v)}
      advancedOpen={advancedOpen}
      advanced={(
        <AdvancedSearchPanel
          fields={ADVANCED_FIELDS}
          values={criteria}
          onChange={setCriteria}
          onSearch={() => { setApplied(criteria); setAdvancedOpen(false); }}
          onClear={() => { setCriteria({}); setApplied({}); }}
        />
      )}
      leftExtra={<Button variant="primary" size="sm" icon="upload" onClick={() => toast.notify('Choose a file to upload.')}>Upload</Button>}
      empty="No documents match these criteria."
    />
  );
}

export default DocumentCenter;
