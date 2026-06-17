import React from 'react';

/**
 * Badge — small status/label pill. Tone sets the tint; `solid` fills it.
 * Use CategoryBadge for the push/pull/leg/other workout tints.
 */
export function Badge({ children, tone = 'neutral', solid = false, icon = null, style = {} }) {
  const tones = {
    neutral: { tint: 'var(--surface-sunken)', fg: 'var(--text-secondary)', solidBg: 'var(--gray-500)' },
    blue: { tint: 'var(--blue-50)', fg: 'var(--blue-700)', solidBg: 'var(--blue-500)' },
    green: { tint: 'var(--green-tint)', fg: 'var(--green-500)', solidBg: 'var(--green-500)' },
    gold: { tint: 'var(--gold-tint)', fg: 'var(--gold-500)', solidBg: 'var(--gold-500)' },
    cyan: { tint: 'var(--cyan-tint)', fg: 'var(--cyan-500)', solidBg: 'var(--cyan-500)' },
    red: { tint: 'var(--red-tint)', fg: 'var(--red-600)', solidBg: 'var(--red-500)' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 22,
        padding: '0 9px',
        borderRadius: 'var(--radius-full)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-2xs)',
        fontWeight: 'var(--weight-bold)',
        lineHeight: 1,
        letterSpacing: '0.01em',
        background: solid ? t.solidBg : t.tint,
        color: solid ? 'var(--white)' : t.fg,
        ...style,
      }}
    >
      {icon && <span style={{ display: 'inline-flex' }}>{icon}</span>}
      {children}
    </span>
  );
}
