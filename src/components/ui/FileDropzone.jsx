import { useRef, useState } from 'react';
import Icon from '@/components/ui/Icon';

/**
 * Drag-and-drop file intake.
 *
 * Every "upload" in the console was a button that raised a toast, so there was
 * no way to get a file in at all. This is the one intake control: the
 * attachments dialog and the Document Center both go through it, because two
 * different upload affordances is exactly the inconsistency that makes a
 * console feel assembled rather than designed.
 *
 * There is no server behind the demo, so nothing is transmitted — but the file
 * IS read from the drop, and its real name, size and type come back. A
 * dropzone that invented "document.pdf · 0.4 MB" regardless of what you gave
 * it would be the same lie as the toast it replaces.
 */

const MEGABYTE = 1024 * 1024;

export const formatSize = (bytes) => (bytes >= MEGABYTE
  ? `${(bytes / MEGABYTE).toFixed(1)} MB`
  : `${Math.max(1, Math.round(bytes / 1024))} KB`);

export function FileDropzone({
  onFiles,
  multiple = true,
  accept,
  hint = 'PDF, images, spreadsheets and archives',
  compact = false,
}) {
  const inputRef = useRef(null);
  /* A counter, not a boolean: dragging over a child fires dragleave on the
     parent, so a boolean flickers the highlight off mid-drag. */
  const depth = useRef(0);
  const [over, setOver] = useState(false);

  const take = (fileList) => {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;
    onFiles?.(files.map((f) => ({
      file: f,
      name: f.name,
      sizeBytes: f.size,
      size: formatSize(f.size),
      mime: f.type || 'application/octet-stream',
    })));
  };

  const openPicker = () => inputRef.current?.click();

  return (
    <div
      className={`dropzone ${over ? 'is-over' : ''} ${compact ? 'dropzone--compact' : ''}`.trim()}
      onDragEnter={(e) => { e.preventDefault(); depth.current += 1; setOver(true); }}
      onDragOver={(e) => { e.preventDefault(); }}
      onDragLeave={(e) => { e.preventDefault(); depth.current -= 1; if (depth.current <= 0) { depth.current = 0; setOver(false); } }}
      onDrop={(e) => { e.preventDefault(); depth.current = 0; setOver(false); take(e.dataTransfer.files); }}
    >
      <input
        ref={inputRef}
        type="file"
        className="dropzone__input"
        multiple={multiple}
        accept={accept}
        onChange={(e) => { take(e.target.files); e.target.value = ''; }}
      />

      <Icon name="upload" size={compact ? 18 : 24} className="dropzone__icon" />
      <span className="dropzone__lead">
        Drag {multiple ? 'files' : 'a file'} here, or{' '}
        {/* A button rather than a label: the whole zone is already a drop
            target, and a nested label would swallow keyboard focus. */}
        <button type="button" className="link" onClick={openPicker}>browse</button>
      </span>
      {hint && <span className="dropzone__hint">{hint}</span>}
    </div>
  );
}

export default FileDropzone;
