import { useMemo, useState } from 'react';
import { ListPage, ListTable } from '@/components/fi911/ListPage';
import { Muted, StatusBadge, TwoLine, menuColumn } from '@/components/fi911/cells';
import { Badge, Button, Kpi } from '@/components/ui/Surface';
import { Drawer, Tooltip } from '@/components/ui/Overlay';
import { FieldGrid, Section } from '@/components/fi911/DetailPage';
import { SelectField, TextField } from '@/components/ui/Form';
import Icon from '@/components/ui/Icon';
import {
  LANDING_PAGES, PROFILE_TYPES, ROLES, SETUP_USERS, USER_GROUPS, USER_TABS,
} from '@/data/setup';
import { PERMISSION_AREAS } from '@/data/navigation';
import { RecordFormModal } from '@/components/fi911/RecordFormModal';
import brand from '@/brand/brand.config';
import { useToast } from '@/context/ToastContext';
import { useRecords } from '@/hooks/useRecords';
import { downloadCsv } from '@/utils/export';
import { CURRENT_USER } from '@/data/people';

/**
 * Setup > Admin > Users & Access Control.
 *
 * Three tabs, as in the reference: accounts, roles and groups.
 *
 * The reference's Users grid answers "who exists" and nothing else — status is
 * Active or nothing, and there is no way to find the accounts that are a
 * standing risk. The two questions an access review actually asks are "who has
 * not logged in for months" and "who has no second factor", so both are
 * columns and both are views. Roles carry their user count for the same
 * reason: a role nobody holds is a permission surface with no owner.
 */

function Dormancy({ days, dormant }) {
  if (days <= 1) return <span className="dorm dorm--fresh">Today</span>;
  return (
    <Tooltip label={dormant ? 'Dormant — an unused account is still a way in' : `Last signed in ${days} days ago`}>
      <span className={`dorm ${dormant ? 'dorm--stale' : ''}`.trim()}>{days}d</span>
    </Tooltip>
  );
}

function RoleDrawer({ role, onClose }) {
  const toast = useToast();
  const [form, setForm] = useState(() => ({ ...role }));
  if (!role) return null;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Drawer open onClose={onClose} title={`Role — ${role.name}`} width={420}>
      <div className="fi-detail__body">
        <Section title="Role" collapsible={false}>
          <FieldGrid columns={1}>
            <TextField label="Role Name" value={form.name} onChange={set('name')} required />
            <SelectField label="Profile Type" value={form.profileType} onChange={set('profileType')} options={PROFILE_TYPES.map((v) => ({ value: v, label: v }))} required />
            <SelectField label="Home Landing Page" value={form.homeLanding} onChange={set('homeLanding')} options={LANDING_PAGES.map((v) => ({ value: v, label: v }))} required />
            <SelectField label="Setup Landing Page" value={form.setupLanding} onChange={set('setupLanding')} options={LANDING_PAGES.map((v) => ({ value: v, label: v }))} placeholder="None" />
            <TextField label="Description" value={form.description} onChange={set('description')} />
          </FieldGrid>
        </Section>

        <Section title={`Permission areas (${role.permissions})`} collapsible={false}>
          {/* The reference's role editor has no permission surface at all — you
              name a role and choose a landing page. The areas a role can reach
              are the whole point of it. */}
          <div className="setup-chips">
            {PERMISSION_AREAS.map((a) => <span key={a} className="setup-chip">{a}</span>)}
          </div>
        </Section>

        <Section title="Usage" collapsible={false}>
          <p className="fi-note">
            {role.userCount === 0
              ? 'No users hold this role. A role with no holders is a permission surface with no owner — consider removing it.'
              : `${role.userCount} user${role.userCount === 1 ? '' : 's'} hold this role. Changing it changes what they can reach immediately.`}
          </p>
        </Section>

        <div className="fi-actions">
          <Button variant="secondary" size="sm" onClick={onClose}>Back</Button>
          <Button variant="primary" size="sm" icon="check" onClick={() => { toast.notify(`Role "${form.name}" updated.`); onClose(); }}>Update</Button>
        </div>
      </div>
    </Drawer>
  );
}

function UsersTab({ store, onEdit }) {
  const toast = useToast();
  const [tab, setTab] = useState('all');
  const all = store.rows;
  const rows = useMemo(
    () => all.filter((USER_TABS.find((t) => t.value === tab) ?? USER_TABS[0]).match),
    [tab, all],
  );

  /* Read off the live rows — enrolling MFA on a user has to move the banner
     that is counting users without it. */
  const dormant = all.filter((u) => u.dormant && u.status === 'Active');
  const noMfa = all.filter((u) => !u.mfa);

  const columns = [
    menuColumn((r) => [
      { label: 'Edit user', icon: 'edit', onSelect: () => onEdit(r) },
      { label: 'Reset password', icon: 'refresh', onSelect: () => toast.notify(`Password reset link sent to ${r.email}.`) },
      !r.mfa && {
        label: 'Require MFA',
        icon: 'shieldCheck',
        onSelect: () => { store.update(r, { mfa: true }); toast.notify(`${r.name} must enroll a second factor at next sign-in.`); },
      },
      {
        label: r.status === 'Locked' ? 'Unlock account' : 'Lock account',
        icon: 'lock',
        tone: r.status === 'Locked' ? undefined : 'danger',
        onSelect: () => {
          const next = r.status === 'Locked' ? 'Active' : 'Locked';
          store.update(r, { status: next });
          toast.notify(`${r.name} ${next === 'Locked' ? 'locked' : 'unlocked'}.`);
        },
      },
    ]),
    { key: 'name', header: 'User', fw: 16, sortable: true, cell: (r) => <TwoLine primary={r.name} secondary={r.email} />, text: (r) => `${r.name} ${r.email}` },
    { key: 'role', header: 'Role', fw: 13, sortable: true, cell: (r) => <TwoLine primary={r.role} secondary={r.profileType} />, text: (r) => `${r.role} ${r.profileType}` },
    {
      key: 'lastActiveDays', header: 'Last Seen', fw: 7, align: 'center', sortable: true,
      cell: (r) => <Dormancy days={r.lastActiveDays} dormant={r.dormant} />,
      text: (r) => `${r.lastActiveDays}d`,
      description: 'Days since last sign-in. The reference has no equivalent, so abandoned accounts look identical to working ones.',
    },
    {
      key: 'mfa', header: 'MFA', fw: 5, align: 'center', sortable: true,
      cell: (r) => (r.mfa
        ? <Tooltip label="Second factor enrolled"><span><Icon name="shieldCheck" size={15} className="ok" /></span></Tooltip>
        : <Tooltip label="No second factor — password alone gets in"><span><Icon name="alert" size={15} className="warn" /></span></Tooltip>),
      text: (r) => (r.mfa ? 'mfa' : 'no mfa'),
    },
    { key: 'group', header: 'Group', fw: 14, sortable: true, cell: (r) => (r.group ? r.group : <Muted>—</Muted>) },
    { key: 'partner', header: 'Partner', fw: 13, sortable: true, cell: (r) => (r.partner ? r.partner : <Muted>—</Muted>) },
    { key: 'phone', header: 'Phone', fw: 11, align: 'center' },
    { key: 'linkedProfiles', header: 'Linked Profiles', fw: 7, align: 'center', sortable: true },
    { key: 'reportingUsers', header: 'Reports', fw: 6, align: 'center', sortable: true },
    { key: 'startDate', header: 'Start Date', fw: 8, align: 'center', sortable: true },
    { key: 'status', header: 'Status', fw: 7, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <div className="queue-kpis">
        <Kpi label="Accounts" value={SETUP_USERS.length} meta={`${SETUP_USERS.filter((u) => u.status === 'Active').length} active`} />
        <Kpi label="Dormant 90d+" value={dormant.length} meta="Still active, nobody signing in" invert />
        <Kpi label="Without MFA" value={noMfa.length} meta="Password alone gets in" invert />
        <Kpi label="Locked" value={SETUP_USERS.filter((u) => u.status === 'Locked').length} meta="Blocked from signing in" />
      </div>

      <ListTable
        key={tab}
        columns={columns}
        rows={rows}
        searchPlaceholder="Search name, email or role"
        exportName="users"
        leftExtra={(
          <div className="wq-tabs" role="tablist" aria-label="User view">
            {USER_TABS.map((t) => (
              <button
                key={t.value} type="button" role="tab" aria-selected={tab === t.value}
                className={`wq-tab ${tab === t.value ? 'is-active' : ''}`.trim()}
                onClick={() => setTab(t.value)}
              >
                {t.label}<span className="wq-tab__count">{SETUP_USERS.filter(t.match).length}</span>
              </button>
            ))}
          </div>
        )}
        empty="No users in this view."
      />
    </>
  );
}

function RolesTab({ store }) {
  const toast = useToast();
  const [editing, setEditing] = useState(null);

  const columns = [
    menuColumn((r) => [
      { label: 'View / edit', icon: 'eye', onSelect: () => setEditing(r) },
      {
        label: 'Clone role',
        icon: 'copy',
        /* A cloned role starts with nobody in it — inheriting the original's
           user count would claim accounts hold a role that did not exist a
           second ago. */
        onSelect: () => { store.clone(r, { patch: { userCount: 0 } }); toast.notify(`"${r.name}" cloned. The copy is inactive and holds no users.`); },
      },
      {
        label: r.status === 'Active' ? 'Deactivate' : 'Activate',
        icon: 'power',
        tone: r.status === 'Active' ? 'danger' : undefined,
        onSelect: () => toast.notify(`"${r.name}" is now ${store.toggleStatus(r).toLowerCase()}.`),
      },
    ]),
    { key: 'name', header: 'Role', fw: 16, sortable: true, cell: (r) => <TwoLine primary={r.name} secondary={r.profileType} />, text: (r) => `${r.name} ${r.profileType}` },
    {
      key: 'userCount', header: 'Users', fw: 7, align: 'center', sortable: true,
      cell: (r) => (r.userCount
        ? <strong>{r.userCount}</strong>
        : <Tooltip label="Nobody holds this role — a permission surface with no owner"><Badge tone="neutral">None</Badge></Tooltip>),
      text: (r) => String(r.userCount),
      description: 'How many accounts hold this role. The reference omits it, so unused roles accumulate unnoticed.',
    },
    { key: 'permissions', header: 'Permissions', fw: 8, align: 'center', sortable: true, description: 'Number of areas this role can reach' },
    { key: 'homeLanding', header: 'Home Landing Page', fw: 12, sortable: true },
    { key: 'setupLanding', header: 'Setup Landing Page', fw: 12, sortable: true, cell: (r) => (r.setupLanding ? r.setupLanding : <Muted>—</Muted>) },
    { key: 'created', header: 'Created', fw: 8, align: 'center', sortable: true },
    { key: 'updated', header: 'Last Updated', fw: 8, align: 'center', sortable: true },
    { key: 'status', header: 'Status', fw: 7, align: 'center', sortable: true, cell: (r) => <StatusBadge value={r.status} /> },
  ];

  return (
    <>
      <ListTable
        columns={columns}
        rows={store.rows}
        searchPlaceholder="Search role name"
        exportName="roles"
        totals={['userCount']}
        onRowClick={(r) => setEditing(r)}
        empty="No roles configured."
      />
      <RoleDrawer role={editing} onClose={() => setEditing(null)} />
    </>
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
    { key: 'name', header: 'Group', fw: 18, sortable: true },
    { key: 'type', header: 'Type', fw: 16, sortable: true, description: 'Whether the group scopes by business entity or by region/department' },
    { key: 'region', header: 'Region', fw: 12, sortable: true },
    {
      key: 'users', header: '# Users', fw: 7, align: 'center', sortable: true,
      cell: (r) => (r.users ? <strong>{r.users}</strong> : <Badge tone="neutral">None</Badge>),
      text: (r) => String(r.users),
    },
    { key: 'merchants', header: '# Merchants', fw: 8, align: 'center', sortable: true },
    { key: 'createdBy', header: 'Created By', fw: 11, sortable: true },
    { key: 'created', header: 'Created On', fw: 8, align: 'center', sortable: true },
    { key: 'updatedBy', header: 'Updated By', fw: 11, sortable: true },
    { key: 'updated', header: 'Updated On', fw: 8, align: 'center', sortable: true },
  ];

  return (
    <ListTable
      columns={columns}
      rows={store.rows}
      searchPlaceholder="Search group name"
      exportName="user-groups"
      totals={['users', 'merchants']}
      empty="No groups configured."
    />
  );
}

const NEW_FIELDS = {
  users: [
    { name: 'name', label: 'Full Name', required: true },
    { name: 'email', label: 'Email', required: true },
    { name: 'role', label: 'Role', type: 'select', options: ROLES.map((r) => r.name), required: true },
    { name: 'phone', label: 'Phone' },
    { name: 'group', label: 'Group', type: 'select', options: USER_GROUPS.map((g) => g.name) },
  ],
  roles: [
    { name: 'name', label: 'Role Name', required: true },
    { name: 'profileType', label: 'Profile Type', type: 'select', options: PROFILE_TYPES, required: true },
    { name: 'homeLanding', label: 'Home Landing Page', type: 'select', options: LANDING_PAGES, required: true },
    { name: 'setupLanding', label: 'Setup Landing Page', type: 'select', options: LANDING_PAGES },
    { name: 'description', label: 'Description', type: 'textarea' },
  ],
  groups: [
    { name: 'name', label: 'Group Name', required: true },
    { name: 'type', label: 'Type', type: 'select', options: ['Group / Business Entity', 'Region / Channel-Department'], required: true },
    { name: 'region', label: 'Region' },
  ],
};

export function UsersAccess() {
  const toast = useToast();
  const [tab, setTab] = useState('users');

  const users = useRecords(SETUP_USERS, { key: 'id' });
  const roles = useRecords(ROLES, { key: 'id' });
  const groups = useRecords(USER_GROUPS, { key: 'id' });
  const store = tab === 'users' ? users : tab === 'roles' ? roles : groups;

  /* `null` closed, a row means Edit, `{}` means New. A boolean plus a row is
     how Create once ended up taking the Edit path and changing nothing. */
  const [draft, setDraft] = useState(null);
  const editing = draft && Object.keys(draft).length > 0 ? draft : null;

  const submit = (v) => {
    if (editing) {
      store.update(editing, { ...v, updated: brand.today.replace(/-/g, '/'), updatedBy: CURRENT_USER.name });
      return;
    }
    store.create({
      id: `new-${tab}-${store.rows.length}`,
      status: 'Active',
      created: brand.today.replace(/-/g, '/'),
      updated: brand.today.replace(/-/g, '/'),
      startDate: brand.today.replace(/-/g, '/'),
      lastActiveDays: 0, dormant: false, mfa: true,
      linkedProfiles: 0, reportingUsers: 0, partner: '',
      userCount: 0, permissions: 0, users: 0, merchants: 0,
      profileType: v.profileType ?? 'Company Admin',
      createdBy: CURRENT_USER.name, updatedBy: CURRENT_USER.name,
      ...v,
    });
  };

  return (
    <ListPage
      title="Users & Access Control"
      description="Accounts, roles, groups and what each of them can reach"
      tabs={[
        { value: 'users', label: 'Users', count: users.rows.length },
        { value: 'roles', label: 'Roles', count: roles.rows.length },
        { value: 'groups', label: 'Groups', count: groups.rows.length },
      ]}
      tab={tab}
      onTabChange={setTab}
      headerActions={(
        <>
          <Button
            variant="secondary"
            size="sm"
            icon="download"
            /* An access review is a file somebody signs off, not a toast. */
            onClick={() => {
              downloadCsv(
                [
                  { key: 'name', header: 'User' }, { key: 'email', header: 'Email' },
                  { key: 'role', header: 'Role' }, { key: 'profileType', header: 'Profile Type' },
                  { key: 'lastActiveDays', header: 'Days Since Last Sign-In' },
                  { key: 'mfa', header: 'MFA Enrolled' }, { key: 'status', header: 'Status' },
                ],
                users.rows,
                'access-review',
              );
              toast.notify(`Access review exported — ${users.rows.length} accounts.`);
            }}
          >
            Export
          </Button>
          <Button variant="primary" size="sm" icon="plus" onClick={() => setDraft({})}>New</Button>
        </>
      )}
    >
      {tab === 'users' && <UsersTab store={users} onEdit={setDraft} />}
      {tab === 'roles' && <RolesTab store={roles} />}
      {tab === 'groups' && <GroupsTab store={groups} onEdit={setDraft} />}

      <RecordFormModal
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title={tab === 'users' ? 'user' : tab === 'roles' ? 'role' : 'group'}
        fields={NEW_FIELDS[tab]}
        initial={editing}
        onSubmit={submit}
      />
    </ListPage>
  );
}

export default UsersAccess;
