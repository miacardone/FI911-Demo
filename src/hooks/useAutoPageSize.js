import { useEffect, useRef, useState } from 'react';

/**
 * How many table rows fit on screen right now.
 *
 * Every list page in this console used to paginate at a fixed 20 rows, which
 * on a tall monitor left half the screen empty and on a laptop pushed the
 * pager below the fold — so the page scrolled to reach the control that exists
 * to stop you scrolling.
 *
 * Two things this gets right that a naive version does not:
 *
 * 1. ROW HEIGHT IS MEASURED, NOT ASSUMED. Rows are not a uniform height —
 *    a two-line identity cell ("Alderton Medical Supply LLC" over its
 *    account number) is half again as tall as a plain one, and density
 *    changes it too. Assuming a constant overshoots on some grids and
 *    undershoots on others, so the real rendered height is sampled and only
 *    falls back to an estimate before the first row exists.
 *
 * 2. AN IMPLAUSIBLE MEASUREMENT IS IGNORED. During layout, in a hidden tab, or
 *    inside a zero-height container, the viewport can measure as 0 — which
 *    would clamp the table to its minimum and silently show five rows on a
 *    full-height screen. When the numbers do not make sense the previous size
 *    is kept instead.
 *
 * Returns `null` until a trustworthy measurement exists, so the caller holds
 * its default rather than flashing a wrong page size on first paint.
 */
export function useAutoPageSize(ref, { estimatedRowHeight = 41, reserve = 78, min = 4, max = 100, enabled = true } = {}) {
  const [size, setSize] = useState(null);
  const sizeRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const measure = () => {
      const viewport = window.innerHeight;
      const top = el.getBoundingClientRect().top;

      // Zero-height viewport or an element below the fold: not measurable yet.
      if (!viewport || viewport < 200) return;

      const rows = el.querySelectorAll('tbody tr');
      let rowHeight = estimatedRowHeight;
      if (rows.length) {
        /* MAX, not mean. Rows are not uniform — a two-line identity cell is
           taller than a plain one — and averaging lets a tall row further down
           the page push the last row past the fold, which is the exact thing
           this hook exists to prevent. Overestimating costs at most one row;
           underestimating reintroduces the scrollbar. */
        const sample = Array.from(rows).slice(0, 8);
        const tallest = sample.reduce((m, r) => Math.max(m, r.getBoundingClientRect().height), 0);
        if (tallest > 12) rowHeight = tallest;
      }

      const head = el.querySelector('thead');
      const headH = head ? head.getBoundingClientRect().height : 38;

      /* `reserve` is the pager plus the page's bottom padding — the chrome
         that must stay visible under the last row for this to be worth doing. */
      const available = viewport - top - headH - reserve;
      if (available < rowHeight) {
        // Genuinely no room; show the floor rather than nothing.
        if (sizeRef.current !== min) { sizeRef.current = min; setSize(min); }
        return;
      }

      const fits = Math.max(min, Math.min(max, Math.floor(available / rowHeight)));
      if (fits !== sizeRef.current) { sizeRef.current = fits; setSize(fits); }
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    ro.observe(document.documentElement);
    window.addEventListener('resize', measure);

    /* The table can also move without resizing — an Advanced Search panel
       opening above it. A cheap rAF position check covers that without wiring
       every possible cause into this hook. */
    let raf;
    let lastTop = el.getBoundingClientRect().top;
    const watch = () => {
      const t = el.getBoundingClientRect().top;
      if (Math.abs(t - lastTop) > 2) { lastTop = t; measure(); }
      raf = requestAnimationFrame(watch);
    };
    raf = requestAnimationFrame(watch);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
      cancelAnimationFrame(raf);
    };
  }, [ref, estimatedRowHeight, reserve, min, max, enabled]);

  return size;
}

export default useAutoPageSize;
