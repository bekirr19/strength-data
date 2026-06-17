import React from 'react';

/* Injected once — :hover / :active / :focus-visible states for the pill nav. */
if (typeof document !== 'undefined' && !document.getElementById('sd-bottomnav-css')) {
  const s = document.createElement('style');
  s.id = 'sd-bottomnav-css';
  s.textContent = `
.sd-bottomnav {
  display: flex; align-items: center; justify-content: space-around; gap: 4px;
  height: var(--nav-height); padding: 0 10px;
  background: var(--surface-card);
  border: 1px solid var(--border-subtle); border-radius: var(--radius-full);
  box-shadow: var(--shadow-lg);
}
.sd-bottomnav__tab {
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  flex: 1; height: 48px; border: none; background: transparent; cursor: pointer;
  color: var(--text-tertiary); font-family: var(--font-sans);
  font-size: var(--text-xs); font-weight: var(--weight-medium);
  border-radius: var(--radius-md);
  transition: color var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-spring);
  -webkit-tap-highlight-color: transparent;
}
.sd-bottomnav__tab:active { transform: scale(var(--press-scale)); }
.sd-bottomnav__tab--active { color: var(--accent); }
.sd-bottomnav__fab {
  display: inline-flex; align-items: center; justify-content: center; flex: none;
  width: 56px; height: 56px; margin: 0 4px;
  border: none; border-radius: 50%; cursor: pointer;
  background: var(--accent); color: var(--text-on-accent); box-shadow: var(--shadow-accent);
  transition: background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-spring);
  -webkit-tap-highlight-color: transparent;
}
.sd-bottomnav__fab:hover { background: var(--accent-hover); }
.sd-bottomnav__fab:active { transform: scale(0.92); }
.sd-bottomnav__fab:focus-visible, .sd-bottomnav__tab:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--ring); }
`;
  document.head.appendChild(s);
}

/**
 * BottomNav — floating pill navigation fixed to the bottom on mobile.
 *
 * Two ways to declare the prominent add-action (a circular FAB rendered in the
 * centre of the pill):
 *  1. Pass `primary={{ label, icon, onClick }}` (legacy API), or
 *  2. Mark an item with `fab: true` inside `items`.
 *
 * Tabs come from `items` ({ key, label, icon, onClick? }). The active tab
 * (`activeKey`) turns accent. A FAB declared via `primary` is inserted in the
 * middle of the tabs; a FAB declared inline keeps its position.
 */
export function BottomNav({ items = [], primary = null, activeKey, onSelect, style = {} }) {
  const tabs = items.filter((it) => !it.fab);
  const inlineFab = items.find((it) => it.fab) || null;
  const fab = primary || inlineFab;

  const renderTab = (it) => {
    const active = it.key === activeKey;
    return (
      <button
        key={it.key}
        type="button"
        aria-label={it.label}
        aria-current={active ? 'page' : undefined}
        onClick={() => (it.onClick ? it.onClick() : onSelect && onSelect(it.key))}
        className={`sd-bottomnav__tab${active ? ' sd-bottomnav__tab--active' : ''}`}
      >
        {it.icon}
        {it.label && <span>{it.label}</span>}
      </button>
    );
  };

  const renderFab = () =>
    fab && (
      <button
        key="__fab"
        type="button"
        aria-label={fab.label || 'Add'}
        onClick={() => (fab.onClick ? fab.onClick() : onSelect && onSelect(fab.key))}
        className="sd-bottomnav__fab"
      >
        {fab.icon}
      </button>
    );

  // Insert the FAB in the middle of the tabs (e.g. [Today, +, Exercises]).
  const mid = Math.ceil(tabs.length / 2);
  const children = primary
    ? [...tabs.slice(0, mid).map(renderTab), renderFab(), ...tabs.slice(mid).map(renderTab)]
    : items.map((it) => (it.fab ? renderFab() : renderTab(it)));

  return (
    <nav className="sd-bottomnav" aria-label="Primary" style={style}>
      {children}
    </nav>
  );
}
