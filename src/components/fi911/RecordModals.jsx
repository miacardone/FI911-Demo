import { useEffect, useState } from 'react';
import Icon from '@/components/ui/Icon';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Surface';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Form';
import { RowMenu } from '@/components/fi911/cells';
import { useToast } from '@/context/ToastContext';
import { CURRENT_USER, initialsFor } from '@/data/people';
import { todayStamp } from '@/utils/format';

/**
 * RECORD MODALS — Change Status, Attachments, Notes.
 *
 * These three hang off the row kebab on most lists and off the header icons on
 * most detail pages, so they live together rather than being redefined per
 * module. Each one owns its own draft state and resets when it reopens: a
 * modal that reopens still holding the previous record's comment is a data
 * hazard, not a convenience.
 */

/* ---------- Change Status ---------- */

export function ChangeStatusModal({
  open,
  onClose,
  onSubmit,
  statuses = [],
  current,
  /** e.g. { label: 'Merchant Name', value: 'TSYS Merchant-High 01' } */
  subject,
  title = 'Change Status',
  commentLabel = 'Comment (Optional)',
  submitLabel = 'Update',
}) {
  const toast = useToast();
  const [status, setStatus] = useState(current ?? '');
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (open) { setStatus(current ?? ''); setComment(''); }
  }, [open, current]);

  const submit = () => {
    onSubmit?.({ status, comment });
    toast.notify(status ? `Status changed to ${status}.` : 'Status updated.');
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!status} onClick={submit}>{submitLabel}</Button>
        </>
      )}
    >
      <div className="stack">
        {subject && (
          <div className="field">
            <span className="field__label">{subject.label}</span>
            <span className="small">{subject.value}</span>
          </div>
        )}
        <SelectField
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={statuses.map((s) => (typeof s === 'string' ? { value: s, label: s } : s))}
          placeholder="Select Status"
        />
        <TextAreaField
          label={commentLabel}
          rows={4}
          value={comment}
          placeholder="Enter comment..."
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
    </Modal>
  );
}

/* ---------- Attachments ---------- */

const ATTACHMENT_TYPES = ['Internal', 'Checklist KYC', 'Checklist MPA', 'TinCheck', 'Contract', 'Correspondence'];

export function AttachmentsModal({ open, onClose, attachments = [], onChange, title = 'Attachments' }) {
  const toast = useToast();
  const [items, setItems] = useState(attachments);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: '', description: '', type: ATTACHMENT_TYPES[0] });

  useEffect(() => {
    if (open) { setItems(attachments); setAdding(false); setDraft({ name: '', description: '', type: ATTACHMENT_TYPES[0] }); }
  }, [open, attachments]);

  const commit = (next) => { setItems(next); onChange?.(next); };

  const add = () => {
    if (!draft.name.trim()) return;
    const next = [...items, {
      id: `att-${Date.now()}`,
      name: draft.name.trim(),
      description: draft.description.trim(),
      type: draft.type,
      date: todayStamp(),
      size: '0.4 MB',
    }];
    commit(next);
    setAdding(false);
    setDraft({ name: '', description: '', type: ATTACHMENT_TYPES[0] });
    toast.notify('Attachment added.');
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <div className="fi-modal__bar">
        <Button variant="primary" size="sm" icon="plus" onClick={() => setAdding((v) => !v)}>Add Attachment</Button>
      </div>

      {adding && (
        <div className="fi-inline-form">
          <TextField label="File Name" value={draft.name} placeholder="document.pdf" onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          <SelectField
            label="Type"
            value={draft.type}
            onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value }))}
            options={ATTACHMENT_TYPES.map((t) => ({ value: t, label: t }))}
          />
          <TextField label="Description" value={draft.description} placeholder="What is this file?" onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
          <div className="fi-inline-form__actions">
            <Button variant="secondary" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
            <Button variant="primary" size="sm" disabled={!draft.name.trim()} onClick={add}>Add</Button>
          </div>
        </div>
      )}

      <table className="fi-mini-table">
        <thead>
          <tr><th>File Name</th><th>Description</th><th className="fi-mini-table__actions">Actions</th></tr>
        </thead>
        <tbody>
          {items.length === 0 && (
            <tr><td colSpan={3} className="subtle small" style={{ padding: 'var(--s-6)', textAlign: 'center' }}>No attachments yet.</td></tr>
          )}
          {items.map((a) => (
            <tr key={a.id}>
              <td>
                <span className="cell-2l">
                  <span className="cell-2l__main">{a.name}</span>
                  <span className="cell-2l__sub">Type: {a.type} </span>
                  <span className="cell-2l__sub">Date: {a.date} | Size: {a.size}</span>
                </span>
              </td>
              <td className="small">{a.description}</td>
              <td className="fi-mini-table__actions">
                <RowMenu
                  label={`Actions for ${a.name}`}
                  items={[
                    { label: 'Download', icon: 'download', onSelect: () => toast.notify('Download started.') },
                    { label: 'Delete', icon: 'trash', tone: 'danger', onSelect: () => { commit(items.filter((x) => x.id !== a.id)); toast.notify('Attachment removed.'); } },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Modal>
  );
}

/* ---------- Notes ---------- */

const NOTE_TYPES = ['Public Notes', 'Underwriting & Risk Notes', 'Secure Notes'];

export function NotesModal({ open, onClose, notes = [], onChange, title = 'View Notes' }) {
  const toast = useToast();
  const [items, setItems] = useState(notes);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ type: NOTE_TYPES[0], description: '' });

  useEffect(() => {
    if (open) { setItems(notes); setAdding(false); setDraft({ type: NOTE_TYPES[0], description: '' }); }
  }, [open, notes]);

  const add = () => {
    if (!draft.description.trim()) return;
    const next = [{
      id: `note-${Date.now()}`,
      user: CURRENT_USER.name,
      type: draft.type,
      date: todayStamp(),
      description: draft.description.trim(),
      attachments: [],
    }, ...items];
    setItems(next);
    onChange?.(next);
    setAdding(false);
    setDraft({ type: NOTE_TYPES[0], description: '' });
    toast.notify('Note added.');
  };

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <div className="fi-modal__bar">
        <Button variant="primary" size="sm" icon="plus" onClick={() => setAdding((v) => !v)}>Add Note</Button>
      </div>

      {adding && (
        <div className="note-composer">
          <span className="note__avatar note__avatar--me" aria-hidden>{initialsFor(CURRENT_USER.name)}</span>
          <div className="note-composer__body">
            <TextAreaField
              label="Note"
              rows={3}
              value={draft.description}
              placeholder={`Add a note as ${CURRENT_USER.name}…`}
              onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))}
            />
            <div className="note-composer__foot">
              <div className="note-composer__types" role="radiogroup" aria-label="Note visibility">
                {NOTE_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={draft.type === t}
                    className={`note-type-pick ${draft.type === t ? 'is-active' : ''}`.trim()}
                    onClick={() => setDraft((d) => ({ ...d, type: t }))}
                  >
                    {t.replace(' Notes', '')}
                  </button>
                ))}
              </div>
              <div className="row row--tight row--nowrap">
                <Button variant="secondary" size="sm" onClick={() => setAdding(false)}>Cancel</Button>
                <Button variant="primary" size="sm" icon="send" disabled={!draft.description.trim()} onClick={add}>Post note</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty">
          <span className="empty__glyph"><Icon name="message" size={20} /></span>
          <p className="empty__title">No notes yet</p>
          <p className="empty__hint">Add the first note to start the thread.</p>
        </div>
      ) : (
        <ol className="note-thread">
          {items.map((n) => (
            <li key={n.id} className="note">
              <span className="note__avatar" aria-hidden>{initialsFor(n.user)}</span>
              <div className="note__body">
                <header className="note__head">
                  <span className="note__author">{n.user}</span>
                  <span className={`note__type note__type--${n.type.toLowerCase().includes('secure') ? 'secure' : n.type.toLowerCase().includes('underwriting') ? 'risk' : 'public'}`}>
                    {n.type}
                  </span>
                  <span className="note__date">{n.date}</span>
                </header>
                <p className="note__text">{n.description}</p>
                {n.attachments?.length > 0 && (
                  <div className="note-chips">
                    {n.attachments.map((f) => (
                      <span key={f} className="note-chip"><Icon name="file" size={11} /> {f}</span>
                    ))}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </Modal>
  );
}

/**
 * Bundles the three modals plus the state that drives them, so a list page
 * wires row actions with one hook instead of three useState triples.
 */
export function useRecordModals() {
  const [modal, setModal] = useState(null); // { kind, row }

  const openFor = (kind) => (row) => setModal({ kind, row });
  const close = () => setModal(null);

  return {
    modal,
    close,
    openStatus: openFor('status'),
    openAttachments: openFor('attachments'),
    openNotes: openFor('notes'),
    isOpen: (kind) => modal?.kind === kind,
    row: modal?.row ?? null,
  };
}
