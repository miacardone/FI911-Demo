import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { Muted, StatusBadge, TwoLine, menuColumn } from '@/components/fi911/cells';
import { Badge, Button } from '@/components/ui/Surface';
import { Tooltip } from '@/components/ui/Overlay';
import Icon from '@/components/ui/Icon';
import { RISK_CATEGORIES, UW_GROUPS, UW_KEYWORDS, UW_TEMPLATES } from '@/data/setup';
import { useToast } from '@/context/ToastContext';

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

function TemplatesTab() {
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const rows = useMemo(
    () => UW_TEMPLATES.filter((TEMPLATE_TABS.find((t) => t.value === tab) ?? TEMPLATE_TABS[0]).match),
    [tab],
  );

  const columns = [
    menuColumn((r) => [
      { label: 'Edit template', icon: 'edit', onSelect: () => toast.notify(`Editing "${r.name}".`) },
      { label: 'Clone template', icon: 'copy', onSelect: () => toast.notify(`"${r.name}" cloned.`) },
      { label: 'Change status', icon: 'power', onSelect: () => toast.notify(`"${r.name}" status changed.`) },
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
      leftExtra={(
        <div className="wq-tabs" role="tablist" aria-label="Template view">
          {TEMPLATE_TABS.map((t) => (
            <button
              key={t.value} type="button" role="tab" aria-selected={tab === t.value}
              className={`wq-tab ${tab === t.value ? 'is-active' : ''}`.trim()}
              onClick={() => setTab(t.value)}
            >
              {t.label}<span className="wq-tab__count">{UW_TEMPLATES.filter(t.match).length}</span>
            </button>
          ))}
        </div>
      )}
      empty="No templates in this view."
    />
  );
}

function GroupsTab() {
  const toast = useToast();

  const columns = [
    menuColumn((r) => [
      { label: 'Edit group', icon: 'edit', onSelect: () => toast.notify(`Editing "${r.name}" (${r.members} members).`) },
      { label: 'Change status', icon: 'power', onSelect: () => toast.notify(`"${r.name}" status changed.`) },
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
      rows={UW_GROUPS}
      searchPlaceholder="Search group name"
      exportName="uw-groups"
      totals={['members']}
      empty="No parameter groups."
    />
  );
}

function KeywordsTab() {
  const toast = useToast();

  const columns = [
    menuColumn((r) => [
      { label: 'Edit rule', icon: 'edit', onSelect: () => toast.notify(`Editing "${r.name}".`) },
      { label: 'View matches', icon: 'search', onSelect: () => toast.notify(`${r.matchesLast30} applications matched in the last 30 days.`) },
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
      rows={UW_KEYWORDS}
      searchPlaceholder="Search rule or term"
      exportName="uw-keywords"
      totals={['matchesLast30']}
      empty="No keyword rules."
    />
  );
}

export function UnderwritingSetup() {
  const toast = useToast();
  const [tab, setTab] = useState('templates');

  return (
    <ListPage
      title="Underwriting Setup"
      description="What runs on an application, what it compares against, and what declines on sight"
      tabs={[
        { value: 'templates', label: 'Templates', count: UW_TEMPLATES.length },
        { value: 'groups', label: 'Parameter Groups', count: UW_GROUPS.length },
        { value: 'keywords', label: 'Keyword Rules', count: UW_KEYWORDS.length },
      ]}
      tab={tab}
      onTabChange={setTab}
      headerActions={<Button variant="primary" size="sm" icon="plus" onClick={() => toast.notify('New underwriting configuration.')}>New</Button>}
    >
      {tab === 'templates' && <TemplatesTab />}
      {tab === 'groups' && <GroupsTab />}
      {tab === 'keywords' && <KeywordsTab />}
    </ListPage>
  );
}

export default UnderwritingSetup;
