import { useEffect, useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Surface';
import Icon from '@/components/ui/Icon';
import { ASSIGNEES, initialsFor } from '@/data/people';

/**
 * ASSIGN — pick an owner, with each operator's current workload shown.
 *
 * A bare dropdown of names makes the choice blind: you cannot tell who is
 * already buried. Counting each operator's open items from the same rows the
 * caller is looking at means the count can never disagree with the grid
 * behind the modal.
 *
 * Shared between Onboarding and the Risk Work Queue — `countOpen` tells it
 * what "open" means for the caller's dataset, so one component serves both
 * without either owning the other's rules.
 */
export function AssignModal({
  open,
  onClose,
  title = 'Assign',
  subtitle,
  current,
  rows = [],
  countOpen = (r) => r.assignedTo,
  onAssign,
  confirmLabel = 'Assign to',
}) {
  const [who, setWho] = useState('');

  useEffect(() => { if (open) setWho(current ?? ''); }, [open, current]);

  const workload = useMemo(() => {
    const counts = rows.reduce((acc, r) => {
      const owner = countOpen(r);
      if (owner) acc[owner] = (acc[owner] ?? 0) + 1;
      return acc;
    }, {});
    return ASSIGNEES.map((name) => ({ name, open: counts[name] ?? 0 }));
  }, [rows, countOpen]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      size="md"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" disabled={!who} onClick={() => { onAssign(who); onClose(); }}>
            {confirmLabel} {who || '…'}
          </Button>
        </>
      )}
    >
      <div className="assign-grid">
        {workload.map((op) => (
          <button
            key={op.name}
            type="button"
            className={`assign-card ${who === op.name ? 'is-active' : ''}`.trim()}
            aria-pressed={who === op.name}
            onClick={() => setWho(op.name)}
          >
            <span className="assign-card__avatar">{initialsFor(op.name)}</span>
            <span className="assign-card__text">
              <span className="assign-card__name">{op.name}</span>
              <span className="assign-card__load">
                {op.open === 0 ? 'No open files' : `${op.open} open file${op.open === 1 ? '' : 's'}`}
              </span>
            </span>
            {who === op.name && <Icon name="check" size={16} className="assign-card__check" />}
          </button>
        ))}
      </div>
    </Modal>
  );
}

export default AssignModal;
