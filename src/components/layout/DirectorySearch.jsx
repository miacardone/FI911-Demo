import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '@/components/ui/Icon';
import { navLeaves } from '@/data/navigation';

/**
 * DIRECTORY SEARCH — navigate the console by typing.
 *
 * Focusing it with an empty query shows recently viewed pages, so the common
 * case (go back to the thing I was just on) costs no typing at all. Typing
 * filters the whole navigation directory by page name and by section, so
 * "res" finds Residuals pages and "held" finds Held Volume without knowing
 * which section it lives under.
 *
 * Recents are tracked by a hook mounted in AppLayout rather than by this
 * component: the list has to record every navigation, including ones made from
 * the rail or a breadcrumb, not just the ones made from here.
 *
 * The panel is portalled to <body> because the topbar is a stacking context —
 * a dropdown rendered inside it would be clipped by the breadcrumb strip.
 */

const RECENTS_KEY = 'fi911.recentPages';
const MAX_RECENTS = 6;

const readRecents = () => {
  try {
    return JSON.parse(window.sessionStorage.getItem(RECENTS_KEY) ?? '[]');
  } catch {
    return [];
  }
};

/** Records the current route into the recents list. Mounted once, in AppLayout. */
export function useTrackRecentPages() {
  const { pathname } = useLocation();

  useEffect(() => {
    const leaf = navLeaves
      .filter((l) => pathname === l.path || pathname.startsWith(`${l.path}/`))
      .sort((a, b) => b.path.length - a.path.length)[0];
    if (!leaf) return;

    try {
      const entry = { path: leaf.path, label: leaf.label, section: leaf.parent?.label ?? null };
      const next = [entry, ...readRecents().filter((r) => r.path !== entry.path)].slice(0, MAX_RECENTS);
      window.sessionStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch {
      /* storage unavailable — recents simply stay empty */
    }
  }, [pathname]);
}

export function DirectorySearch() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const [rect, setRect] = useState(null);
  const [recents, setRecents] = useState([]);

  const directory = useMemo(
    () => navLeaves.map((l) => ({
      path: l.path,
      label: l.label,
      section: l.parent?.label ?? null,
      haystack: `${l.label} ${l.parent?.label ?? ''} ${l.area ?? ''}`.toLowerCase(),
    })),
    [],
  );

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      /* Recents are stored as bare paths; re-resolve them so a renamed page
         shows its current label rather than the one it had when visited. */
      return recents
        .map((r) => directory.find((d) => d.path === r.path))
        .filter(Boolean)
        .map((d) => ({ ...d, recent: true }));
    }
    return directory
      .filter((d) => d.haystack.includes(q))
      .sort((a, b) => {
        /* A name match beats a section match — typing "risk" should put the
           Risk pages above every Transactions page in the Risk area. */
        const aName = a.label.toLowerCase().startsWith(q) ? 0 : a.label.toLowerCase().includes(q) ? 1 : 2;
        const bName = b.label.toLowerCase().startsWith(q) ? 0 : b.label.toLowerCase().includes(q) ? 1 : 2;
        return aName - bName || a.label.localeCompare(b.label);
      })
      .slice(0, 8);
  }, [query, directory, recents]);

  const place = useCallback(() => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (r) setRect({ left: r.left, top: r.bottom + 6, width: Math.max(r.width, 320) });
  }, []);

  const show = () => {
    setRecents(readRecents());
    setCursor(0);
    setOpen(true);
    place();
  };

  const go = useCallback((item) => {
    if (!item) return;
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
    navigate(item.path);
  }, [navigate]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target) && !e.target.closest?.('.dirsearch__panel')) setOpen(false);
    };
    window.addEventListener('mousedown', onDown);
    window.addEventListener('resize', place);
    window.addEventListener('scroll', place, true);
    return () => {
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('resize', place);
      window.removeEventListener('scroll', place, true);
    };
  }, [open, place]);

  /* "/" focuses search from anywhere, unless the user is already typing. */
  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { setOpen(false); inputRef.current?.blur(); return; }
    if (!open || !results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => (c + 1) % results.length); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => (c - 1 + results.length) % results.length); }
    if (e.key === 'Enter') { e.preventDefault(); go(results[cursor]); }
  };

  return (
    <div className="dirsearch" ref={wrapRef}>
      <Icon name="search" size={15} className="dirsearch__icon" />
      <input
        ref={inputRef}
        type="text"
        className="dirsearch__input"
        placeholder="Search pages…"
        aria-label="Search pages"
        role="combobox"
        aria-expanded={open}
        aria-controls="dirsearch-listbox"
        value={query}
        onFocus={show}
        onChange={(e) => { setQuery(e.target.value); setCursor(0); if (!open) show(); }}
        onKeyDown={onKeyDown}
      />
      {!query && <kbd className="dirsearch__kbd">/</kbd>}

      {open && rect && createPortal(
        <div
          className="dirsearch__panel"
          id="dirsearch-listbox"
          role="listbox"
          style={{ left: rect.left, top: rect.top, width: rect.width }}
        >
          <div className="dirsearch__label">
            {query.trim() ? `${results.length} page${results.length === 1 ? '' : 's'}` : 'Recently viewed'}
          </div>

          {results.length === 0 && (
            <div className="dirsearch__empty">
              {query.trim() ? 'No pages match that.' : 'Pages you visit will show up here.'}
            </div>
          )}

          {results.map((item, i) => (
            <button
              key={item.path}
              type="button"
              role="option"
              aria-selected={i === cursor}
              className={`dirsearch__item ${i === cursor ? 'is-cursor' : ''}`.trim()}
              onMouseEnter={() => setCursor(i)}
              onClick={() => go(item)}
            >
              <Icon name={item.recent ? 'history' : 'arrowRight'} size={14} className="dirsearch__item-icon" />
              <span className="dirsearch__item-text">
                <span className="dirsearch__item-label">{item.label}</span>
                {item.section && <span className="dirsearch__item-section">{item.section}</span>}
              </span>
            </button>
          ))}
        </div>,
        document.body,
      )}
    </div>
  );
}

export default DirectorySearch;
