import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/Surface';
import { SelectField, TextAreaField, TextField } from '@/components/ui/Form';
import { FieldGrid } from '@/components/fi911/DetailPage';
import { useToast } from '@/context/ToastContext';

/**
 * CREATE / EDIT for the configuration screens.
 *
 * Every "New", "Create" and "Edit" in Setup used to raise a toast and change
 * nothing — the row never appeared, so the button read as broken. One modal
 * serves all of them: a page passes the fields it wants and gets values back,
 * and the row lands in the grid.
 *
 * Deliberately generic. Fourteen config screens with fourteen bespoke dialogs
 * is how a demo drifts; this way "New" behaves the same everywhere.
 */
export function RecordFormModal({
  open,
  onClose,
  title,
  fields = [],
  initial = null,
  submitLabel,
  onSubmit,
}) {
  const toast = useToast();
  const [values, setValues] = useState({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!open) return;
    /* Seed from the record when editing, from each field's default when not. */
    const seed = {};
    fields.forEach((f) => { seed[f.name] = initial?.[f.name] ?? f.value ?? ''; });
    setValues(seed);
    setTouched(false);
  }, [open, initial]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (name) => (e) => setValues((v) => ({ ...v, [name]: e.target.value }));

  const missing = fields.filter((f) => f.required && !String(values[f.name] ?? '').trim());
  const editing = Boolean(initial);

  const submit = () => {
    setTouched(true);
    if (missing.length) {
      toast.notify(`${missing[0].label} is required.`);
      return;
    }
    onSubmit?.(values);
    toast.notify(editing ? `${title} updated.` : `${title} created.`);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? `Edit ${title}` : `New ${title}`}
      size="md"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="check" onClick={submit}>
            {submitLabel ?? (editing ? 'Save changes' : `Create ${title}`)}
          </Button>
        </>
      )}
    >
      <FieldGrid>
        {fields.map((f) => {
          const error = touched && f.required && !String(values[f.name] ?? '').trim()
            ? `${f.label} is required`
            : undefined;

          if (f.type === 'select') {
            return (
              <SelectField
                key={f.name}
                label={f.label}
                required={f.required}
                error={error}
                value={values[f.name] ?? ''}
                onChange={set(f.name)}
                placeholder={f.placeholder ?? 'Select…'}
                options={(f.options ?? []).map((o) => (typeof o === 'string' ? { value: o, label: o } : o))}
              />
            );
          }
          if (f.type === 'textarea') {
            return (
              <div key={f.name} className="fi-fields__full">
                <TextAreaField label={f.label} required={f.required} error={error} rows={3} value={values[f.name] ?? ''} onChange={set(f.name)} />
              </div>
            );
          }
          return (
            <TextField
              key={f.name}
              label={f.label}
              required={f.required}
              error={error}
              type={f.type ?? 'text'}
              placeholder={f.placeholder}
              value={values[f.name] ?? ''}
              onChange={set(f.name)}
            />
          );
        })}
      </FieldGrid>
    </Modal>
  );
}

export default RecordFormModal;
