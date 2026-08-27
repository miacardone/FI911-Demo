import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { Muted, StatusBadge, TwoLine, menuColumn } from '@/components/fi911/cells';
import { Badge, Button } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import { PARAMETER_TYPES, RISK_CATEGORIES, TEMPLATE_LEVELS, UW_GROUPS, UW_KEYWORDS, UW_TEMPLATES } from '@/data/setup';
import { RecordFormModal } from '@/components/fi911/RecordFormModal';
import brand from '@/brand/brand.config';
import { useToast } from '@/context/ToastContext';
import { useRecords } from '@/hooks/useRecords';
import { CURRENT_USER } from '@/data/people';

/**
 * Setup > Merchants > Underwriting Setup.
 *
 * The three things that decide an application: templates (which checks run),
 * parameter groups (what those checks compare against) and keyword rules
 * (what auto-declines on sight).
 *
 * The reference gives all three a name, a status and an audit date. What it
 * never says is whether any of them still DO anything — a template with no
 * linked merchants, a parameter group with no members, a keyword rule that has
 * not matched in a year. Underwriting config accumulates, and config nobody
 * can prove is dead never gets deleted. Every tab here carries its usage.
 */

const TEMPLATE_TABS = [
  { value: 'all', label: 'All', match: () => true },
  { value: 'default', label: 'Defaults', match: (r) => r.isDefault },
  { value: 'unused', label: 'Never applied', match: (r) => !r.lastApplied },
  { value: 'inactive', label: 'Inactive', match: (r) => r.status === 'Inactive' },
];

function Usage({ count, lastUsed, noun = 'merchant' }) {
  if (!count) {
    return (
      <Tooltip label={`No ${noun}s linked — this configuration decides nothing`}>
        <Badge tone="neutral">Unused</Badge>
      </Tooltip>
    );
  }
  return (
    <Tooltip label={lastUsed ? `Last applied ${lastUsed}` : `${count} linked, never applied`}>
      <span className={`usage ${lastUsed ? '' : 'usage--stale'}`.trim()}>
        <strong>{count}</strong>
        {!lastUsed && <Icon name="alert" size={11} />}
      </span>
    </Tooltip>
  );
}

function TemplatesTab({ store, onEdit }) {
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const all = store.rows;
  const rows = useMemo(
    () => all.filter((TEMPLATE_TABS.find((t) => t.value === tab) ?? TEMPLATE_TABS[0]).match),
    [tab, all],
  );

  const columns = [
    menuColumn((r) => [
      { label: 'Edit template', icon: 'edit', onSelect: () => onEdit(r) },
      {
        label: 'Clone template',
        icon: 'copy',
        onSelect: () => { store.clone(r, { patch: { isDefault: false, linkedMerchants: 0, lastApplied: '' } }); toast.notify(`"${r.name}" cloned. The copy is inactive until you activate it.`); },
      },
      {
        label: r.status === 'Active' ? 'Deactivate' : 'Activate',
        icon: 'power',
        tone: r.status === 'Active' ? 'danger' : undefined,
        onSelect: () => toast.notify(`"${r.name}" is now ${store.toggleStatus(r).toLowerCase()}.`),
      },
    ]),
    { key: 'name', header: 'Template', fw: 22, sortable: true, cell: (r) => <TwoLine primary={r.name} secondary={`${r.level} level · ${r.appliesTo}`} />, text: (r) => `${r.name} ${r.appliesTo}` },
    {
      key: 'category', header: 'Risk Category', fw: 9, align: 'center', sortable: true,
      cell: (r) => <Badge tone={r.category === 'High' ? 'danger' : r.category === 'Medium' ? 'warning' : 'success'}>{r.category}</Badge>,
    },
    { key: 'rules', header: 'Checks', fw: 6, align: 'center', sortable: true, description: 'How many underwriting checks this template runs' },
    {
      key: 'linkedMerchants', header: 'Linked', fw: 7, align: 'center', sortable: true,
      cell: (r) => <Usage count={r.linkedMerchants} lastUsed={r.lastApplied} />,
      text: (r) => String(r.linkedMerchants),
      description: 'Merchants underwritten with this template — zero means it decides nothing',
    },
    {
      key: 'lastApplied', header: 'Last Applied', fw: 9, align: 'center', sortable: true,
      cell: (r) => (r.lastApplied
        ? r.lastApplied
        : <Tooltip label="This template has never decided an application"><Muted>Never</Muted></Tooltip>),
      description: 'When this template last decided an application. The reference does not record it, so dead templates are indistinguishable from live ones.',
    },
    {
      key: 'isDefault', header: 'Default', fw: 6, align: 'center', sortable: true,
      cell: (r) => (r.isDefault ? <Icon name="check" size={15} className="ok" /> : <Muted>—</Muted>),
      text: (r) => (r.isDefault ? 'default' : ''),
    },
    { key: 'created', header: 'Created', fw: 8, align: 'center', sortable: true },
    { key: 'createdBy', header: 'Created By', fw: 11, sortable: true },
    { key: 'status', header: 'Status', fw: 7, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <ListTable
      key={tab}
      columns={columns}
      rows={rows}
      searchPlaceholder="Search template name"
      exportName="uw-templates"
      totals={['rules', 'linkedMerchants']}
      viewTabs={TEMPLATE_TABS.map((t) => ({ ...t, count: all.filter(t.match).length }))}
      viewTab={tab}
      onViewTabChange={setTab}
      viewTabsLabel="Template view"
      empty="No templates in this view."
    />
  );
}

function GroupsTab({ store, onEdit }) {
  const toast = useToast();

  const columns = [
    menuColumn((r) => [
      { label: 'Edit group', icon: 'edit', onSelect: () => onEdit(r) },
      {
        label: r.status === 'Active' ? 'Deactivate' : 'Activate',
        icon: 'power',
        tone: r.status === 'Active' ? 'danger' : undefined,
        onSelect: () => toast.notify(`"${r.name}" is now ${store.toggleStatus(r).toLowerCase()}.`),
      },
    ]),
    { key: 'name', header: 'Group', fw: 20, sortable: true },
    { key: 'processor', header: 'Processor', fw: 10, align: 'center', sortable: true },
    { key: 'parameterType', header: 'Parameter Type', fw: 11, align: 'center', sortable: true, description: 'What the group is a list of — MCCs, verification codes, countries' },
    {
      key: 'members', header: 'Members', fw: 8, align: 'center', sortable: true,
      cell: (r) => <Usage count={r.members} lastUsed="in use" noun="member" />,
      text: (r) => String(r.members),
      description: 'Entries in the list. An empty group silently matches nothing — the reference does not show this.',
    },
    {
      key: 'usedByTemplates', header: 'Used By', fw: 7, align: 'center', sortable: true,
      cell: (r) => (r.usedByTemplates ? `${r.usedByTemplates} templates` : <Muted>Nothing</Muted>),
      text: (r) => String(r.usedByTemplates),
    },
    { key: 'updated', header: 'Last Updated', fw: 9, align: 'center', sortable: true },
    { key: 'status', header: 'Status', fw: 7, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <ListTable
      columns={columns}
      rows={store.rows}
      searchPlaceholder="Search group name"
      exportName="uw-groups"
      totals={['members']}
      empty="No parameter groups."
    />
  );
}

function KeywordsTab({ store, onEdit }) {
  const toast = useToast();

  const columns = [
    menuColumn((r) => [
      { label: 'Edit rule', icon: 'edit', onSelect: () => onEdit(r) },
      {
        label: r.status === 'Active' ? 'Deactivate' : 'Activate',
        icon: 'power',
        tone: r.status === 'Active' ? 'danger' : undefined,
        onSelect: () => toast.notify(`"${r.name}" is now ${store.toggleStatus(r).toLowerCase()}.`),
      },
    ]),
    { key: 'name', header: 'Keyword Rule', fw: 20, sortable: true },
    {
      key: 'terms', header: 'Terms', fw: 24,
      cell: (r) => (
        <span className="setup-chips setup-chips--inline">
          {r.terms.map((t) => <span key={t} className="setup-chip">{t}</span>)}
        </span>
      ),
      text: (r) => r.terms.join(' '),
      description: 'What the rule scans application text for. The reference shows only the rule name, so you cannot see what it catches.',
    },
    {
      key: 'action', header: 'Action', fw: 10, align: 'center', sortable: true,
      cell: (r) => <Badge tone={r.action === 'Auto decline' ? 'danger' : 'warning'}>{r.action}</Badge>,
    },
    {
      key: 'matchesLast30', header: 'Matched (30d)', fw: 9, align: 'center', sortable: true,
      cell: (r) => (r.matchesLast30
        ? <strong>{r.matchesLast30}</strong>
        : <Tooltip label="Has not caught anything in a month"><Badge tone="neutral">None</Badge></Tooltip>),
      text: (r) => String(r.matchesLast30),
      description: 'Applications this rule caught in the last 30 days — the only proof it is doing anything',
    },
    { key: 'updated', header: 'Last Updated', fw: 9, align: 'center', sortable: true },
    { key: 'status', header: 'Status', fw: 7, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <ListTable
      columns={columns}
      rows={store.rows}
      searchPlaceholder="Search rule or term"
      exportName="uw-keywords"
      totals={['matchesLast30']}
      empty="No keyword rules."
    />
  );
}

/* One dialog per tab, so "New" always creates the thing the tab is showing
   rather than raising a toast and leaving the grid unchanged. */
const NEW_FIELDS = {
  templates: [
    { name: 'name', label: 'Template Name', required: true },
    { name: 'level', label: 'Template Level', type: 'select', options: TEMPLATE_LEVELS, required: true },
    { name: 'appliesTo', label: 'Applies To', type: 'select', options: brand.processors },
    { name: 'category', label: 'Risk Category', type: 'select', options: RISK_CATEGORIES, required: true },
    { name: 'rules', label: 'Checks', type: 'number' },
  ],
  groups: [
    { name: 'name', label: 'Group Name', required: true },
    { name: 'processor', label: 'Processor', type: 'select', options: brand.processors, required: true },
    { name: 'parameterType', label: 'Parameter Type', type: 'select', options: PARAMETER_TYPES, required: true },
    { name: 'members', label: 'Members', type: 'number' },
  ],
  keywords: [
    { name: 'name', label: 'Rule Name', required: true },
    { name: 'action', label: 'Action', type: 'select', options: ['Flag for review', 'Auto decline'], required: true },
    { name: 'terms', label: 'Terms (comma separated)', type: 'textarea', required: true },
  ],
};

export function UnderwritingSetup() {
  const [tab, setTab] = useState('templates');
  /* One store per tab. The seed arrays are module constants, so they cannot be
     edited in place — holding them in state is what lets Edit, Clone and
     Change status do anything at all. */
  const templates = useRecords(UW_TEMPLATES, { key: 'id' });
  const groups = useRecords(UW_GROUPS, { key: 'id' });
  const keywords = useRecords(UW_KEYWORDS, { key: 'id' });

  const store = tab === 'templates' ? templates : tab === 'groups' ? groups : keywords;

  /* `null` closes the dialog; a row opens it as Edit; `{}` opens it as New.
     Not a boolean plus a row — `setEditing({})` being truthy is exactly the
     bug that once made Create take the Edit path and change nothing. */
  const [draft, setDraft] = useState(null);
  const editing = draft && Object.keys(draft).length > 0 ? draft : null;

  const titleFor = { templates: 'template', groups: 'parameter group', keywords: 'keyword rule' }[tab];

  /* Terms live as an array on the row but edit as a comma-separated string. */
  const toForm = (row) => (row && Array.isArray(row.terms) ? { ...row, terms: row.terms.join(', ') } : row);
  const fromForm = (v) => (tab === 'keywords' && v.terms !== undefined
    ? { ...v, terms: String(v.terms).split(',').map((t) => t.trim()).filter(Boolean) }
    : v);

  const submit = (v) => {
    if (editing) {
      store.update(editing, fromForm(v));
      return;
    }
    store.create({
      id: `new-${tab}-${store.rows.length}`,
      status: 'Active',
      updated: brand.today.replace(/-/g, '/'),
      created: brand.today.replace(/-/g, '/'),
      createdBy: CURRENT_USER.name,
      linkedMerchants: 0, lastApplied: '', isDefault: false,
      usedByTemplates: 0, matchesLast30: 0,
      ...fromForm(v),
    });
  };

  return (
    <ListPage
      title="Underwriting Setup"
      description="What runs on an application, what it compares against, and what declines on sight"
      tabs={[
        { value: 'templates', label: 'Templates', count: templates.rows.length },
        { value: 'groups', label: 'Parameter Groups', count: groups.rows.length },
        { value: 'keywords', label: 'Keyword Rules', count: keywords.rows.length },
      ]}
      tab={tab}
      onTabChange={setTab}
      headerActions={<Button variant="primary" size="sm" icon="plus" onClick={() => setDraft({})}>New</Button>}
    >
      {tab === 'templates' && <TemplatesTab store={templates} onEdit={setDraft} />}
      {tab === 'groups' && <GroupsTab store={groups} onEdit={setDraft} />}
      {tab === 'keywords' && <KeywordsTab store={keywords} onEdit={setDraft} />}

      <RecordFormModal
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={titleFor}
        fields={NEW_FIELDS[tab]}
        initial={toForm(editing)}
        onSubmit={submit}
      />
    </ListPage>
  );
}

export default UnderwritingSetup;
