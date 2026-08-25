import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import DirectorySearch, { useTrackRecentPages } from '@/components/layout/DirectorySearch';
import Icon from '@/components/ui/Icon';
import { Popover } from '@/components/ui/Overlay';
import { useAuth } from '@/context/AuthContext';
import { THEMES, usePreferences } from '@/context/PreferencesContext';
import { crumbsFor, isApmPath } from '@/data/navigation';
import { crumbsFor as apmCrumbsFor } from '@/apm/data/navigation';
import { readPref, writePref } from '@/utils/storage';

const SIDEBAR_KEY = 'fi911.sidebarCollapsed';

/* ------------------------------------------------------------------ *
 * Breadcrumb detail label
 * ------------------------------------------------------------------ *
 * The trail itself is derived from the URL by crumbsFor(), so a list page
 * never has to declare it. Detail pages are the one case the URL can't
 * answer — "/participants/invitations/inv-3" has no way to know the record is
 * called "Alderton Medical Supply LLC" — so they push that one label up
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

/**
 * The account menu doubles as the preferences panel.
 *
 * Theme lives here rather than in a Settings page because it is a per-session
 * comfort control, not configuration — you change it when the light in the
 * room changes, and hunting through a settings tree for that is friction.
 */
function ProfilePanel({ onClose }) {
  const { user, signOut } = useAuth();
  const { theme, resolved, setTheme, density, setDensity } = usePreferences();
  const navigate = useNavigate();

  return (
    <>
      <div className="profile__head">
        <span className="profile__avatar">{user?.initials ?? 'MC'}</span>
        <span className="profile__id">
          <span className="profile__name">{user?.name}</span>
          <span className="profile__email">{user?.email}</span>
          <span className="profile__role">{user?.roleLabel}</span>
        </span>
      </div>

      <div className="profile__group">
        <span className="profile__label">Appearance</span>
        <div className="profile__seg" role="radiogroup" aria-label="Theme">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={theme === t.id}
              className={`profile__seg-btn ${theme === t.id ? 'is-active' : ''}`.trim()}
              onClick={() => setTheme(t.id)}
            >
              <Icon name={t.icon} size={13} /> {t.label}
            </button>
          ))}
        </div>
        {theme === 'system' && (
          <span className="profile__hint">Following your device — currently {resolved}.</span>
        )}
      </div>

      <div className="profile__group">
        <span className="profile__label">Default table density</span>
        <div className="profile__seg" role="radiogroup" aria-label="Density">
          {[{ id: 'fit', label: 'Fit to width' }, { id: 'comfortable', label: 'Comfortable' }].map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={density === d.id}
              className={`profile__seg-btn ${density === d.id ? 'is-active' : ''}`.trim()}
              onClick={() => setDensity(d.id)}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="profile__actions">
        <button type="button" className="popover__item" onClick={() => { onClose(); navigate('/dashboard'); }}>
          <Icon name="dashboard" size={14} className="subtle" /> Dashboard
        </button>
        <button type="button" className="popover__item" onClick={signOut}>
          <Icon name="logout" size={14} className="subtle" /> Log out
        </button>
      </div>
    </>
  );
}

function Topbar() {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <DirectorySearch />

      <Popover
        align="right"
        width={280}
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
        {({ close }) => <ProfilePanel onClose={close} />}
      </Popover>
    </header>
  );
}

function Crumbbar({ detailLabel }) {
  const { pathname } = useLocation();
  const crumbs = useMemo(
    () => (isApmPath(pathname) ? apmCrumbsFor(pathname, detailLabel) : crumbsFor(pathname, detailLabel)),
    [pathname, detailLabel],
  );

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
