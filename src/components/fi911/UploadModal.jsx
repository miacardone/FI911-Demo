import { useEffect, useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Badge, Button, IconButton } from '@/components/ui/Surface';
import { SelectField } from '@/components/ui/Form';
import { FileDropzone } from '@/components/ui/FileDropzone';
import { Muted } from '@/components/fi911/cells';
import { DOCUMENT_TYPES } from '@/data/reports';

/**
 * Upload into the Document Center.
 *
 * The Upload button raised "Choose a file to upload." and offered nothing to
 * choose it with. This stages real files first — you can see what you picked
 * and drop one before committing — because an upload that fires the moment a
 * file lands gives you no chance to notice you grabbed the wrong one.
 *
 * Classification is asked once for the batch rather than per file: documents
 * arriving together are almost always the same kind, and a per-row type picker
 * turns a three-file drop into three decisions.
 */
export function UploadModal({ open, onClose, onUpload }) {
  const [staged, setStaged] = useState([]);
  const [type, setType] = useState(DOCUMENT_TYPES[0]?.id ?? '');

  useEffect(() => {
    if (open) { setStaged([]); setType(DOCUMENT_TYPES[0]?.id ?? ''); }
  }, [open]);

  const drop = (id) => setStaged((s) => s.filter((f) => f.id !== id));

  const commit = () => {
    onUpload?.(staged, type);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload documents"
      size="md"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="upload" disabled={!staged.length} onClick={commit}>
            {staged.length ? `Upload ${staged.length} file${staged.length === 1 ? '' : 's'}` : 'Upload'}
          </Button>
        </>
      )}
    >
      <div className="stack">
        <FileDropzone
          onFiles={(files) => setStaged((s) => [
            ...s,
            ...files.map((f, i) => ({ ...f, id: `stage-${s.length + i}-${f.name}` })),
          ])}
        />

        <SelectField
          label="Document Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          options={DOCUMENT_TYPES.map((t) => ({ value: t.id, label: t.label }))}
        />

        {staged.length === 0
          ? <Muted>Nothing staged yet.</Muted>
          : (
            <ul className="staged">
              {staged.map((f) => (
                <li key={f.id} className="staged__item">
                  <span className="staged__name">{f.name}</span>
                  <Badge tone="neutral">{f.size}</Badge>
                  <IconButton icon="close" label={`Remove ${f.name}`} onClick={() => drop(f.id)} />
                </li>
              ))}
            </ul>
          )}
      </div>
    </Modal>
  );
}

export default UploadModal;
