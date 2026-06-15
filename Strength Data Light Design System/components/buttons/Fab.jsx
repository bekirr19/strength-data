import React from 'react';

/**
 * Fab — floating action button. Either a pill with a label (the "Add Exercise"
 * primary in the bottom nav) or a circular FAB (the "New Exercise" on the
 * exercises list). Carries the accent glow.
 */
export function Fab({
  children,
  icon = null,
  extended = false,
  onClick,
  ariaLabel,
  style = {},
  ...rest
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="sd-focus-ring"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: extended ? 8 : 0,
        height: 52,
        width: extended ? 'auto' : 52,
        padding: extended ? '0 22px' : 0,
        background: 'var(--accent)',
        color: 'var(--text-on-accent)',
        border: 'none',
        borderRadius: 'var(--radius-full)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        fontWeight: 'var(--weight-bold)',
        boxShadow: 'var(--shadow-accent)',
        cursor: 'pointer',
        transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.97)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      {...rest}
    >
      {icon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
      {extended && children}
    </button>
  );
}
