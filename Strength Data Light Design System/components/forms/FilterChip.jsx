import React from 'react';

/**
 * FilterChip — pill toggle for category filters and multi-selects.
 * Active = accent fill (or a category colour via `accent`). Optional
 * leading dot/icon and trailing count.
 */
export function FilterChip({ label, active = false, onClick, accent = null, icon = null, count = null, size = 'md', style = {} }) {
  const sizes = { sm: { h: 30, font: 'var(--text-2xs)', pad: '0 12px' }, md: { h: 34, font: 'var(--text-xs)', pad: '0 16px' } };
  const s = sizes[size] || sizes.md;
  const fill = accent || 'var(--accent)';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="sd-focus-ring"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        flexShrink: 0,
        height: s.h,
        padding: s.pad,
        border: `1px solid ${active ? fill : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-full)',
        background: active ? fill : 'var(--surface-card)',
        color: active ? '#fff' : 'var(--text-secondary)',
        fontFamily: 'var(--font-sans)',
        fontSize: s.font,
        fontWeight: 'var(--weight-bold)',
        cursor: 'pointer',
        transition: 'background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      onMouseDown={(e) => { e.currentTarget.style.transform = `scale(var(--press-scale))`; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
    >
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {label}
      {count != null && (
        <span className="sd-tnum" style={{ fontSize: 'var(--text-3xs)', fontWeight: 700, opacity: active ? 0.85 : 0.6 }}>{count}</span>
      )}
    </button>
  );
}
