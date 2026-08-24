import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { Muted, StatusBadge, TwoLine, menuColumn } from '@/components/fi911/cells';
import { Badge, Button, Kpi } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import { DOC_CATEGORIES } from '@/eric/data/setup';
import { DOCUMENTS } from '@/eric/data/reports';
import { ROLES } from '@/eric/data/setup';
import { routes } from '@/eric/data/navigation';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/context/ToastContext';

/**
 * Setup > Admin > Document Library.
 *
 * The CONFIGURATION side of documents: what categories exist, how long each
 * one is kept, and who can see it. The operating side — browsing and
 * downloading actual files — stays in Document Center on the main rail, since
 * those are different jobs done by different people.
 *
 * The reference's category tab lists Category, Status, Profiles Assigned,
 * Documents Linked and a created date. Retention is missing, which is the one
 * property of a document category with legal consequences, so it is a column
 * here and drives an expiry count.
 */

function CategoriesTab() {
  const navigate = useNavigate();
  const toast = useToast();

  /* Documents inherit their category's retention, so the expiry count is
     derived rather than stored — it cannot disagree with the rule above it. */
  const withExpiry = useMemo(() => DOC_CATEGORIES.map((c) => {
    const docs = DOCUMENTS.filter((d) => d.retentionYears === c.retentionYears);
    const expiringSoon = docs.filter((d) => {
      const year = Number(String(d.uploaded).slice(0, 4));
      return year + c.retentionYears <= 2027;
    }).length;
    return { ...c, expiringSoon };
  }), []);

  const columns = [
    menuColumn((r) => [
      { label: 'Edit category', icon: 'edit', onSelect: () => toast.notify(`Editing "${r.name}".`) },
      { label: 'View documents', icon: 'folder', onSelect: () => navigate(routes.documentCenter) },
      { label: 'Change status', icon: 'power', onSelect: () => toast.notify(`"${r.name}" status changed.`) },
    ]),
    {
      key: 'name', header: 'Category', fw: 20, sortable: true,
      cell: (r) => (
        <TwoLine
          primary={(
            <span className="doc-cat">
              {r.name}
              {r.confidential && (
                <Tooltip label="Confidential — visible only to the assigned profiles">
                  <span><Icon name="lock" size={12} className="subtle" /></span>
                </Tooltip>
              )}
            </span>
          )}
          secondary={`Visible to ${r.profilesAssigned} of ${ROLES.length} roles`}
        />
      ),
      text: (r) => r.name,
    },
    {
      key: 'retentionYears', header: 'Retention', fw: 8, align: 'center', sortable: true,
      cell: (r) => <Badge tone={r.retentionYears >= 7 ? 'primary' : 'neutral'}>{r.retentionYears} year{r.retentionYears === 1 ? '' : 's'}</Badge>,
      text: (r) => `${r.retentionYears} years`,
      description: 'How long documents in this category must be kept. The reference does not record it, which is the one property with legal consequences.',
    },
    { key: 'documentsLinked', header: 'Documents', fw: 8, align: 'center', sortable: true, cell: (r) => (r.documentsLinked ? <strong>{r.documentsLinked}</strong> : <Muted>0</Muted>) },
    {
      key: 'expiringSoon', header: 'Expiring', fw: 7, align: 'center', sortable: true,
      cell: (r) => (r.expiringSoon ? <Badge tone="warning" dot>{r.expiringSoon}</Badge> : <Muted>—</Muted>),
      text: (r) => String(r.expiringSoon),
      description: 'Documents reaching the end of their retention period within the next year',
    },
    { key: 'profilesAssigned', header: 'Profiles Assigned', fw: 9, align: 'center', sortable: true },
    {
      key: 'confidential', header: 'Confidential', fw: 8, align: 'center', sortable: true,
      cell: (r) => (r.confidential ? <Icon name="check" size={15} className="ok" /> : <Muted>—</Muted>),
      text: (r) => (r.confidential ? 'confidential' : ''),
    },
    { key: 'created', header: 'Created On', fw: 8, align: 'center', sortable: true },
    { key: 'status', header: 'Status', fw: 7, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <div className="queue-kpis">
        <Kpi label="Categories" value={DOC_CATEGORIES.length} meta={`${DOC_CATEGORIES.filter((c) => c.status === 'Active').length} active`} />
        <Kpi label="Documents held" value={DOCUMENTS.length} meta="Across every category" />
        <Kpi label="Confidential" value={DOC_CATEGORIES.filter((c) => c.confidential).length} meta="Restricted to assigned profiles" />
        <Kpi label="Longest retention" value={`${Math.max(...DOC_CATEGORIES.map((c) => c.retentionYears))} years`} meta="Statutory hold on the oldest category" />
      </div>

      <ListTable
        columns={columns}
        rows={withExpiry}
        searchPlaceholder="Search category"
        exportName="document-categories"
        totals={['documentsLinked', 'expiringSoon']}
        empty="No categories configured."
      />
    </>
  );
}

function DocumentsTab() {
  const navigate = useNavigate();
  const toast = useToast();

  const columns = [
    menuColumn((r) => [
      { label: 'Download', icon: 'download', onSelect: () => toast.notify(`Downloading ${r.name}.`) },
      { label: 'Open in Document Center', icon: 'external', onSelect: () => navigate(routes.documentCenter) },
      { label: 'Move category', icon: 'folder', onSelect: () => toast.notify(`Move ${r.name} to another category.`) },
    ]),
    {
      key: 'name', header: 'Document', fw: 24, sortable: true,
      cell: (r) => (
        <span className="doc-name">
          <Icon name={r.icon} size={14} className="subtle" />
          <TwoLine primary={r.name} secondary={r.participant} />
        </span>
      ),
      text: (r) => `${r.name} ${r.participant}`,
    },
    { key: 'type', header: 'Category', fw: 14, sortable: true },
    { key: 'retentionYears', header: 'Retention', fw: 8, align: 'center', sortable: true, cell: (r) => `${r.retentionYears} yr` },
    {
      key: 'confidential', header: 'Confidential', fw: 8, align: 'center', sortable: true,
      cell: (r) => (r.confidential ? <Icon name="lock" size={14} className="warn" /> : <Muted>—</Muted>),
      text: (r) => (r.confidential ? 'confidential' : ''),
    },
    { key: 'sizeMb', header: 'Size', fw: 6, align: 'right', sortable: true, cell: (r) => `${r.sizeMb} MB` },
    { key: 'uploadedBy', header: 'Uploaded By', fw: 12, sortable: true },
    { key: 'uploaded', header: 'Uploaded On', fw: 9, align: 'center', sortable: true },
  ];

  return (
    <ListTable
      columns={columns}
      rows={DOCUMENTS}
      searchPlaceholder="Search document or participant"
      exportName="documents"
      totals={['sizeMb']}
      note="Configuration view. Browsing and downloading day to day happens in Document Center on the main rail."
      empty="No documents held."
    />
  );
}

export function DocumentLibrary() {
  const toast = useToast();
  const [tab, setTab] = useState('categories');

  return (
    <ListPage
      title="Document Library"
      description="Categories, retention periods, and who each category is visible to"
      tabs={[
        { value: 'categories', label: 'Categories', count: DOC_CATEGORIES.length },
        { value: 'documents', label: 'Documents', count: DOCUMENTS.length },
      ]}
      tab={tab}
      onTabChange={setTab}
      headerActions={<Button variant="primary" size="sm" icon="plus" onClick={() => toast.notify('New category.')}>New category</Button>}
    >
      {tab === 'categories' ? <CategoriesTab /> : <DocumentsTab />}
    </ListPage>
  );
}

export default DocumentLibrary;
