import React from 'react';

/**
 * BottomNav — floating pill navigation fixed to the bottom on mobile.
 * Holds icon tabs plus one prominent primary action (Add Exercise).
 * Pass `items` (icon tabs) and an optional `primary` action.
 */
export function BottomNav({ items = [], primary = null, activeKey, onSelect, style = {} }) {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: 6,
        background: 'var(--surface-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-full)',
        boxShadow: 'var(--shadow-lg)',
        ...style,
      }}
    >
      {items.map((it) => {
        const active = it.key === activeKey;
        return (
          <button
            key={it.key}
            type="button"
            aria-label={it.label}
            onClick={() => (it.onClick ? it.onClick() : onSelect && onSelect(it.key))}
            className="sd-focus-ring"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 44,
              height: 44,
              flexShrink: 0,
              border: 'none',
              borderRadius: 'var(--radius-full)',
              background: active ? 'var(--accent-tint)' : 'transparent',
              color: active ? 'var(--accent-hover)' : 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {it.icon}
          </button>
        );
      })}
      {primary && (
        <button
          type="button"
          onClick={primary.onClick}
          className="sd-focus-ring"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            flex: 1,
            height: 44,
            padding: '0 18px',
            border: 'none',
            borderRadius: 'var(--radius-full)',
            background: 'var(--accent)',
            color: 'var(--text-on-accent)',
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--weight-bold)',
            boxShadow: 'var(--shadow-accent-sm)',
            cursor: 'pointer',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {primary.icon}
          {primary.label}
        </button>
      )}
    </nav>
  );
}
