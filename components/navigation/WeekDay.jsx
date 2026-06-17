import React from 'react';

const WEEKDAY_CATEGORY_COLORS = {
  push: { tint: 'var(--push-tint)', fg: 'var(--push-700)', dot: 'var(--push-500)' },
  pull: { tint: 'var(--pull-tint)', fg: 'var(--pull-700)', dot: 'var(--pull-500)' },
  leg: { tint: 'var(--leg-tint)', fg: 'var(--leg-700)', dot: 'var(--leg-500)' },
  other: { tint: 'var(--other-tint)', fg: 'var(--other-700)', dot: 'var(--other-500)' },
};

/**
 * WeekDay — a single day cell in the horizontal week strip.
 * Shows weekday + date number; days with a workout are tinted by their
 * category; the selected day gets a ring + lift. Combo labels (Upper/Full)
 * show a tiny caption.
 */
export function WeekDay({
  weekday,
  day,
  category = null,
  selected = false,
  today = false,
  caption = null,
  onClick,
  style = {},
}) {
  const c = category ? (WEEKDAY_CATEGORY_COLORS[category] || WEEKDAY_CATEGORY_COLORS.other) : null;

  let bg = 'transparent';
  let fg = 'var(--text-secondary)';
  let border = '1px solid transparent';
  if (c) {
    bg = c.tint;
    fg = c.fg;
  }
  if (selected) {
    border = '1px solid var(--accent)';
  } else if (today) {
    border = '1px solid var(--border-strong)';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="sd-focus-ring"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        minWidth: 60,
        padding: '8px 6px',
        borderRadius: 'var(--radius-lg)',
        background: bg,
        color: fg,
        border,
        boxShadow: selected ? 'var(--shadow-md)' : 'none',
        transform: selected ? 'translateY(-1px)' : 'none',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard)',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      <span style={{ fontSize: 'var(--text-3xs)', fontWeight: 'var(--weight-bold)', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.85 }}>
        {weekday}
      </span>
      <span className="sd-tnum" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)', lineHeight: 1.1 }}>
        {day}
      </span>
      {caption ? (
        <span style={{ fontSize: '0.5625rem', fontWeight: 'var(--weight-bold)', textTransform: 'uppercase', letterSpacing: '0.04em', opacity: 0.9 }}>
          {caption}
        </span>
      ) : (
        <span style={{ width: 5, height: 5, borderRadius: '50%', marginTop: 2, background: c ? c.dot : 'transparent' }} />
      )}
    </button>
  );
}
