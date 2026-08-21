import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Icon from '@/components/ui/Icon';
import Wordmark from '@/brand/Wordmark';
import { Tooltip } from '@/components/ui/Overlay';
import { useAuth } from '@/context/AuthContext';
import { nav } from '@/data/navigation';

/**
 * Deep-navy navigation rail with collapsible groups.
 *
 * The Expedia build carried a perspective switcher here; Fi911 has one
 * operator perspective, so that slot shows the signed-in user instead.
 *
 * The collapse control is a tab on the rail's own right edge rather than a
 * hamburger in the topbar: it belongs to the thing it collapses, and it sits
 * in the same place whether the rail is open or shut. An active group stays
 * lit while collapsed, so you can still see which section you are in.
 */

function Flyout({ anchorRect, item }) {
  if (!anchorRect) return null;

  return createPortal(
    <div className="rail__flyout" style={{ left: anchorRect.right + 6, top: anchorRect.top }}>
      <div className="rail__flyout-title">{item.label}</div>
      {item.children.map((child) => (
        <NavLink key={child.path} to={child.path} className={({ isActive }) => `rail__child ${isActive ? 'is-active' : ''}`.trim()}>
          {child.label}
        </NavLink>
      ))}
    </div>,
    document.body,
  );
}

function NavGroup({ item, collapsed }) {
  const { pathname } = useLocation();
  const btnRef = useRef(null);
  const [flyoutRect, setFlyoutRect] = useState(null);

  const isActiveGroup = item.children?.some((c) => pathname === c.path || pathname.startsWith(`${c.path}/`)) ?? false;
  const [open, setOpen] = useState(isActiveGroup);

  useEffect(() => {
    if (isActiveGroup) setOpen(true);
  }, [isActiveGroup]);

  if (!item.children) {
    const link = (
      <NavLink to={item.path} className={({ isActive }) => `rail__link ${isActive ? 'is-active' : ''}`.trim()}>
        <Icon name={item.icon} size={17} className="rail__icon" />
        {!collapsed && <span className="rail__label">{item.label}</span>}
      </NavLink>
    );
    return collapsed ? <Tooltip label={item.label} side="right" className="rail__tooltip-fill">{link}</Tooltip> : link;
  }

  if (collapsed) {
    return (
      <div
        onMouseEnter={() => setFlyoutRect(btnRef.current?.getBoundingClientRect() ?? null)}
        onMouseLeave={() => setFlyoutRect(null)}
      >
        <button
          ref={btnRef}
          type="button"
          className={`rail__group-btn ${isActiveGroup ? 'is-active' : ''}`.trim()}
          aria-label={item.label}
        >
          <Icon name={item.icon} size={17} className="rail__icon" />
        </button>
        {flyoutRect && <Flyout anchorRect={flyoutRect} item={item} />}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        className={`rail__group-btn ${isActiveGroup ? 'is-active' : ''}`.trim()}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <Icon name={item.icon} size={17} className="rail__icon" />
        <span className="rail__label">{item.label}</span>
        <Icon name="chevronDown" size={14} className={`rail__chevron ${open ? 'is-open' : ''}`.trim()} />
      </button>
      {open && (
        <div className="rail__children">
          {item.children.map((child) => (
            <NavLink
              key={child.path}
              to={child.path}
              end={child.end}
              className={({ isActive }) => `rail__child ${isActive ? 'is-active' : ''}`.trim()}
            >
              {child.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar({ collapsed, onToggle }) {
  const { user } = useAuth();

  return (
    <aside className={`rail ${collapsed ? 'rail--collapsed' : ''}`.trim()} aria-label="Main navigation">
      <div className="rail__head">
        <Wordmark inverse markOnly={collapsed} size={collapsed ? 30 : 30} showText={false} />
        <Tooltip label={collapsed ? 'Expand navigation' : 'Collapse navigation'} side="right">
          <button
            type="button"
            className="rail__collapse"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            aria-expanded={!collapsed}
          >
            <Icon name={collapsed ? 'chevronsRight' : 'chevronsLeft'} size={15} />
          </button>
        </Tooltip>
      </div>

      <div className="rail__user">
        <span className="rail__user-avatar"><Icon name="userCircle" size={20} /></span>
        {!collapsed && (
          <span className="rail__user-text">
            <span className="rail__user-role">{user?.roleLabel ?? 'Admin'}</span>
            <span className="rail__user-name">{user?.name ?? 'Mia Cardone'}</span>
          </span>
        )}
      </div>

      <nav className="rail__nav">
        {nav.map((item) => <NavGroup key={item.path} item={item} collapsed={collapsed} />)}
      </nav>
    </aside>
  );
}

export default Sidebar;
