import { useMemo, useState } from 'react';
import Icon from '@/components/ui/Icon';
import Modal from '@/components/ui/Modal';
import { Badge, Button } from '@/components/ui/Surface';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Form';
import { ListPage } from '@/components/fi911/ListPage';
import { NotApplicable } from '@/components/fi911/cells';
import { RULES, RULE_PRIORITIES, RULE_TYPES, renderRuleDescription, ruleDescriptionText } from '@/apm/data/risk';
import { statusLabel } from '@/apm/domain/statuses';
import { useToast } from '@/context/ToastContext';

/**
 * Risk Management Rules.
 *
 * The interesting mechanic is the description template. A rule's prose holds
 * `{parameter_1}` / `{parameter_2}` tokens and its thresholds live in separate
 * fields, so:
 *
 *   · the grid renders the sentence with the live values highlighted,
 *   · the editor previews the substitution as you type, and
 *   · changing a threshold updates every place the number appears.
 *
 * Storing the rendered sentence instead — as the reference does — means the
 * description silently goes stale the first time someone edits a parameter.
 */

const PRIORITY_TONE = { high: 'danger', medium: 'warning', low: 'neutral' };

function DescriptionCell({ rule }) {
  return (
    <span className="rule-desc">
      {renderRuleDescription(rule).map((seg) => (
        seg.isParam
          ? <strong key={seg.key} className="rule-desc__param">{seg.value}</strong>
          : <span key={seg.key}>{seg.value}</span>
      ))}
    </span>
  );
}

function RuleModal({ open, onClose, rule, onSave, title, submitLabel }) {
  const blank = { name: '', type: 'Trans', priority: 'medium', p1: '', p2: '', description: '' };
  const [form, setForm] = useState(rule ?? blank);
  const [seeded, setSeeded] = useState(rule?.id);

  /* Re-seed when the modal opens on a different rule, without an effect: an
     effect here would fight the user's own edits on every parent re-render. */
  if (open && rule?.id !== seeded) {
    setSeeded(rule?.id);
    setForm(rule ?? blank);
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.name.trim() && form.type && form.priority && String(form.p1).trim() && form.description.trim();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="md"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!valid} onClick={() => { onSave(form); onClose(); }}>{submitLabel}</Button>
        </>
      )}
    >
      <div className="stack">
        <TextField label="Flag Name" required value={form.name} placeholder="Enter flag name (e.g., Daily Transaction Limit)" onChange={set('name')} />
        <SelectField label="Flag Type" required value={form.type} onChange={set('type')} options={RULE_TYPES.map((t) => ({ value: t, label: t === 'Trans' ? 'Transaction Level' : 'Batch Level' }))} />
        <SelectField label="Priority" required value={form.priority} onChange={set('priority')} options={RULE_PRIORITIES.map((p) => ({ value: p, label: statusLabel(p) }))} />
        <TextField label="Parameter 1" required value={form.p1} placeholder="Enter parameter value (e.g., 1000, 50, 15)" hint="Primary threshold or limit value for the rule" onChange={set('p1')} />
        <TextField label="Parameter 2" value={form.p2} placeholder="Enter second parameter or 'NA' if not needed" hint="Secondary parameter (optional). Use 'NA' if not applicable" onChange={set('p2')} />
        <TextAreaField
          label="Description"
          required
          rows={4}
          value={form.description}
          placeholder="Enter rule description using tokens like {parameter_1} and {parameter_2} for dynamic values"
          hint="Use tokens to reference parameters: {parameter_1} and {parameter_2}. Example: Transaction amount exceeds ${parameter_1} with {parameter_2} day lookback"
          onChange={set('description')}
        />

        {form.description.includes('{parameter_') && (
          <div className="rule-preview">
            <span className="rule-preview__label">Preview:</span>
            <DescriptionCell rule={form} />
          </div>
        )}
      </div>
    </Modal>
  );
}

export function Rules() {
  const toast = useToast();
  const [rows, setRows] = useState(RULES);
  const [tab, setTab] = useState('all');
  const [priority, setPriority] = useState('');
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);

  const tabs = useMemo(() => ([
    { value: 'all', label: 'All', count: rows.length },
    { value: 'active', label: 'Active', count: rows.filter((r) => r.active).length },
    { value: 'inactive', label: 'Inactive', count: rows.filter((r) => !r.active).length },
  ]), [rows]);

  const visible = useMemo(() => rows
    .filter((r) => (tab === 'all' ? true : tab === 'active' ? r.active : !r.active))
    .filter((r) => (priority ? r.priority === priority : true)), [rows, tab, priority]);

  const columns = [
    { key: 'name', header: 'Flag Name', fw: 16, sortable: true },
    { key: 'type', header: 'Flag Type', fw: 7, sortable: true, cell: (r) => <Badge tone={r.type === 'Trans' ? 'info' : 'primary'}>{r.type}</Badge> },
    {
      key: 'priority', header: 'Priority', fw: 7, sortable: true,
      cell: (r) => <span className={`rule-priority rule-priority--${r.priority}`}>{statusLabel(r.priority)}</span>,
      text: (r) => r.priority,
    },
    { key: 'p1', header: 'Parameter 1', fw: 8, align: 'right', sortable: true },
    { key: 'p2', header: 'Parameter 2', fw: 8, align: 'right', cell: (r) => (r.p2 === 'NA' ? <NotApplicable /> : r.p2) },
    { key: 'description', header: 'Description', fw: 34, width: 460, cell: (r) => <DescriptionCell rule={r} />, text: (r) => ruleDescriptionText(r) },
    {
      key: '__edit', header: '', fw: 3, width: 44, align: 'center', searchable: false, locked: true,
      cell: (r) => (
        <button type="button" className="row-menu__btn" aria-label={`Edit ${r.name}`} onClick={() => setEditing(r)}>
          <Icon name="edit" size={15} />
        </button>
      ),
    },
    {
      key: 'active', header: 'Status', fw: 6, align: 'center', searchable: false,
      cell: (r) => (
        <button
          type="button"
          role="switch"
          aria-checked={r.active}
          aria-label={`${r.active ? 'Disable' : 'Enable'} ${r.name}`}
          className={`switch ${r.active ? 'is-on' : ''}`.trim()}
          onClick={() => {
            setRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, active: !x.active } : x)));
            toast.notify(`${r.name} ${r.active ? 'disabled' : 'enabled'}.`);
          }}
        >
          <span className="switch__dot" />
        </button>
      ),
    },
  ];

  return (
    <>
      <ListPage
        title="Rules"
        description="Manage compliance and risk management rules for payment processing"
        tabs={tabs}
        tab={tab}
        onTabChange={setTab}
        scope={[{ label: 'Search By', value: 'Rule Name, Description, Type' }]}
        columns={columns}
        rows={visible}
        searchPlaceholder="Search rules..."
        exportName="risk-rules"
        selectable
        leftExtra={(
          <>
            <label className="row row--tight row--nowrap small">
              <span className="subtle">Priority:</span>
              <select className="select" style={{ width: 140, height: 30 }} value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Priority filter">
                <option value="">All Priorities</option>
                {RULE_PRIORITIES.map((p) => <option key={p} value={p}>{statusLabel(p)}</option>)}
              </select>
            </label>
            <Button variant="primary" size="sm" icon="plus" onClick={() => setCreating(true)}>Add Rule</Button>
          </>
        )}
        empty="No rules match these criteria."
      />

      <RuleModal
        open={creating}
        onClose={() => setCreating(false)}
        rule={null}
        title="Add New Risk Management Rule"
        submitLabel="Create Rule"
        onSave={(form) => {
          setRows((rs) => [{ ...form, id: `rule-${Date.now()}`, active: true }, ...rs]);
          toast.notify(`Rule "${form.name}" created.`);
        }}
      />

      <RuleModal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        rule={editing}
        title="Edit Risk Management Rule"
        submitLabel="Update Rule"
        onSave={(form) => {
          setRows((rs) => rs.map((r) => (r.id === editing.id ? { ...r, ...form } : r)));
          toast.notify(`Rule "${form.name}" updated.`);
        }}
      />
    </>
  );
}

export default Rules;
