import React from 'react';

/**
 * CategoryBadge — the workout / exercise category tint.
 * push = orange, pull = blue, leg = indigo, other = gray.
 * Also accepts combo labels (Upper / Full) via the `label` prop while
 * keeping a category colour. Subtle tinted background + coloured text.
 */
export const CATEGORY_COLORS = {
  push: { tint: 'var(--push-tint)', fg: 'var(--push-700)', dot: 'var(--push-500)', label: 'Push' },
  pull: { tint: 'var(--pull-tint)', fg: 'var(--pull-700)', dot: 'var(--pull-500)', label: 'Pull' },
  leg: { tint: 'var(--leg-tint)', fg: 'var(--leg-700)', dot: 'var(--leg-500)', label: 'Leg' },
  other: { tint: 'var(--other-tint)', fg: 'var(--other-700)', dot: 'var(--other-500)', label: 'Other' },
};

export function CategoryBadge({ category = 'other', label, dot = false, size = 'md', onClick, style = {} }) {
  const c = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  const sizes = {
    sm: { h: 20, font: 'var(--text-3xs)', pad: '0 8px' },
    md: { h: 24, font: 'var(--text-2xs)', pad: '0 10px' },
  };
  const s = sizes[size] || sizes.md;
  const Tag = onClick ? 'button' : 'span';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        height: s.h,
        padding: s.pad,
        border: 'none',
        borderRadius: 'var(--radius-full)',
        background: c.tint,
        color: c.fg,
        fontFamily: 'var(--font-sans)',
        fontSize: s.font,
        fontWeight: 'var(--weight-bold)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        cursor: onClick ? 'pointer' : 'default',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot, flexShrink: 0 }} />}
      {label || c.label}
    </Tag>
  );
}
