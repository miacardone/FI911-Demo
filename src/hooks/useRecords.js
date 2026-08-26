import { useCallback, useMemo, useState } from 'react';

/**
 * A mutable list of configuration records.
 *
 * The Setup screens all shared the same defect: their row menus raised a toast
 * and changed nothing, so Edit, Clone and Change status were indistinguishable
 * from broken buttons. The cause was structural rather than per-page — every
 * screen read its rows straight from an imported `const`, which cannot be
 * edited, so the only thing a handler COULD do was announce itself.
 *
 * This puts the seed data into state once and hands back the operations those
 * menus need. Ten screens with ten hand-rolled useStates is how the behavior
 * drifts; going through one hook is what makes "Change status" mean the same
 * thing everywhere.
 *
 * `key` names the identity field, because these datasets are not consistent
 * about having an `id` — some are keyed by name, some by code.
 */
export function useRecords(seed, { key = 'id' } = {}) {
  const [rows, setRows] = useState(seed);
  /* Monotonic, so a clone of a clone still gets a distinct key. Counting the
     list length is not enough — deleting a row would let the next clone reuse
     a key that is already on screen. */
  const [minted, setMinted] = useState(0);

  const idOf = useCallback((row) => row?.[key], [key]);

  const update = useCallback((row, patch) => {
    setRows((rs) => rs.map((r) => (r[key] === row[key]
      ? { ...r, ...(typeof patch === 'function' ? patch(r) : patch) }
      : r)));
  }, [key]);

  const create = useCallback((values) => {
    setRows((rs) => [{ ...values }, ...rs]);
  }, []);

  const remove = useCallback((row) => {
    setRows((rs) => rs.filter((r) => r[key] !== row[key]));
  }, [key]);

  /**
   * A clone lands next to its original rather than at the top of the list —
   * a copy that jumps to row one reads as a new record, not a duplicate.
   * It is created INACTIVE on purpose: two identical active configurations
   * both claiming to apply is how a config screen causes an outage.
   */
  const clone = useCallback((row, { nameKey = 'name', suffix = ' (Copy)', patch } = {}) => {
    const n = minted + 1;
    setMinted(n);
    setRows((rs) => {
      const i = rs.findIndex((r) => r[key] === row[key]);
      const copy = {
        ...row,
        [key]: `${row[key]}-copy-${n}`,
        [nameKey]: `${row[nameKey]}${suffix}`,
        status: 'Inactive',
        ...(typeof patch === 'function' ? patch(row) : patch),
      };
      const next = [...rs];
      next.splice(i + 1, 0, copy);
      return next;
    });
  }, [key, minted]);

  const toggleStatus = useCallback((row, { on = 'Active', off = 'Inactive', field = 'status' } = {}) => {
    const next = row[field] === on ? off : on;
    update(row, { [field]: next });
    return next;
  }, [update]);

  const setStatus = useCallback((row, status, { field = 'status' } = {}) => {
    update(row, { [field]: status });
  }, [update]);

  return useMemo(
    () => ({ rows, setRows, idOf, create, update, remove, clone, toggleStatus, setStatus }),
    [rows, idOf, create, update, remove, clone, toggleStatus, setStatus],
  );
}

export default useRecords;
