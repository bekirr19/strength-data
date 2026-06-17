import React from 'react';

/**
 * Card — the white rounded surface that holds everything in Strength Data.
 * `pad` controls inner padding; `interactive` adds hover lift for tappable
 * rows. `tint` swaps the background for a subtle accent panel (fuel/notes).
 */
export function Card({
  children,
  pad = 'lg',
  interactive = false,
  tint = null,
  as = 'div',
  onClick,
  style = {},
  ...rest
}) {
  const pads = { none: 0, sm: 12, md: 16, lg: 20, xl: 24 };
  const tints = {
    accent: { bg: 'var(--accent-tint)', border: 'rgba(59,130,246,0.18)' },
    sunken: { bg: 'var(--surface-sunken)', border: 'var(--border-subtle)' },
    gold: { bg: 'var(--gold-tint)', border: 'rgba(245,158,11,0.22)' },
  };
  const t = tint ? tints[tint] : null;
  const Tag = as;
  const [hover, setHover] = React.useState(false);

  return (
    <Tag
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: t ? t.bg : 'var(--surface-card)',
        border: `1px solid ${t ? t.border : 'var(--border-subtle)'}`,
        borderRadius: 'var(--radius-2xl)',
        padding: pads[pad] ?? pads.lg,
        boxShadow: interactive && hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: interactive && hover ? 'translateY(-1px)' : 'none',
        transition: 'box-shadow var(--dur-base) var(--ease-standard), transform var(--dur-base) var(--ease-standard)',
        cursor: interactive ? 'pointer' : 'default',
        textAlign: 'left',
        width: '100%',
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
