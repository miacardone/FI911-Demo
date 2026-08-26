import { useRef } from 'react';
import { Button } from '@/components/ui/Surface';
import { useToast } from '@/context/ToastContext';

/**
 * Import.
 *
 * Every Import button in the console raised "Import portfolios as CSV." and
 * opened nothing, which is the same as being broken. There is no server to
 * accept an upload here, but choosing a file is a real interaction and the
 * console can honestly report what it received — so the button opens the
 * picker, reads the file, and says how many rows it found.
 */
export function ImportButton({ label = 'Import', noun = 'rows', accept = '.csv,.txt', onParsed }) {
  const input = useRef(null);
  const toast = useToast();

  const read = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      /* Count non-empty lines less the header — enough to prove the file was
         actually read rather than acknowledged. */
      const lines = String(reader.result).split('\n').map((l) => l.trim()).filter(Boolean);
      const count = Math.max(0, lines.length - 1);
      toast.notify(`${file.name} — ${count} ${noun} ready to import.`);
      onParsed?.({ file, count, lines });
    };
    reader.onerror = () => toast.notify(`Could not read ${file.name}.`, 'danger');
    reader.readAsText(file);
  };

  return (
    <>
      <Button variant="secondary" size="sm" icon="upload" onClick={() => input.current?.click()}>
        {label}
      </Button>
      <input
        ref={input}
        type="file"
        accept={accept}
        className="visually-hidden"
        onChange={(e) => { read(e.target.files?.[0]); e.target.value = ''; }}
      />
    </>
  );
}

export default ImportButton;
