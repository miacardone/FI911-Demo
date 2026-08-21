import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import DirectorySearch, { useTrackRecentPages } from '@/components/layout/DirectorySearch';
import Icon from '@/components/ui/Icon';
import { Popover } from '@/components/ui/Overlay';
import { useAuth } from '@/context/AuthContext';
import { crumbsFor } from '@/data/navigation';
import { readPref, writePref } from '@/utils/storage';

const SIDEBAR_KEY = 'fi911.sidebarCollapsed';

/* ------------------------------------------------------------------ *
 * Breadcrumb detail label
 * ------------------------------------------------------------------ *
 * The trail itself is derived from the URL by crumbsFor(), so a list page
 * never has to declare it. Detail pages are the one case the URL can't
 * answer — "/participants/invitations/inv-3" has no way to know the record is
 * called "Alderton Medical Supplies Ltd" — so they push that one label up
 * through this context. Everything else stays automatic.
 */
const CrumbContext = createContext(() => {});

export function useDetailCrumb(label) {
  const setLabel = useContext(CrumbContext);
  useEffect(() => {
    setLabel(label ?? null);
    return () => setLabel(null);
  }, [label, setLabel]);
}

function Topbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="topbar">
      <DirectorySearch />

      <Popover
        align="right"
        width={220}
        trigger={({ toggle }) => (
          <button type="button" className="topbar__chip" onClick={toggle} aria-label="Account menu">
            <span className="topbar__chip-avatar"><Icon name="userCircle" size={19} /></span>
            <span className="topbar__chip-text">
              <span className="topbar__chip-role">{user?.roleLabel ?? 'Admin'}</span>
              <span className="topbar__chip-name">{user?.name ?? 'Mia Cardone'}</span>
            </span>
            <Icon name="chevronDown" size={14} />
          </button>
        )}
      >
        {() => (
          <>
            <div style={{ padding: 'var(--s-2)', borderBottom: '1px solid var(--c-line)' }}>
              <div className="small strong">{user?.name}</div>
              <div className="micro subtle">{user?.email}</div>
            </div>
            <button type="button" className="popover__item" onClick={() => navigate('/dashboard')}>
              <Icon name="dashboard" size={14} className="subtle" /> Dashboard
            </button>
            <button type="button" className="popover__item" onClick={signOut}>
              <Icon name="logout" size={14} className="subtle" /> Log out
            </button>
          </>
        )}
      </Popover>
    </header>
  );
}

function Crumbbar({ detailLabel }) {
  const { pathname } = useLocation();
  const crumbs = useMemo(() => crumbsFor(pathname, detailLabel), [pathname, detailLabel]);

  return (
    <nav className="crumbbar" aria-label="Breadcrumb">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={`${c.label}-${i}`} className="crumbbar__item">
            {i > 0 && <Icon name="chevron" size={13} className="crumbbar__sep" />}
            {c.path && !last
              ? <Link to={c.path} className="crumbbar__link">{c.label}</Link>
              : <span className={last ? 'crumbbar__current' : 'crumbbar__link'}>{c.label}</span>}
          </span>
        );
      })}
    </nav>
  );
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(() => readPref(SIDEBAR_KEY) === 'true');
  const [detailLabel, setDetailLabel] = useState(null);

  /* Recents must record every navigation — rail clicks and breadcrumbs
     included — so the tracker lives here rather than inside the search box. */
  useTrackRecentPages();

  const toggle = () => {
    setCollapsed((c) => {
      const next = !c;
      writePref(SIDEBAR_KEY, next);
      return next;
    });
  };

  return (
    <CrumbContext.Provider value={setDetailLabel}>
      <div className="shell">
        <Sidebar collapsed={collapsed} onToggle={toggle} />
        <div className="shell__main">
          <Topbar />
          <Crumbbar detailLabel={detailLabel} />
          <main className="shell__content">
            <Outlet />
          </main>
        </div>
      </div>
    </CrumbContext.Provider>
  );
}

export default AppLayout;
