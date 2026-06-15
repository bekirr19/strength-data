import React from 'react';

/**
 * SetChip — compact "reps × weight" pill from a logged set.
 * PR highlighting: pr="new" = gold, pr="tied" = cyan (both add a trophy).
 * Weight may be a number ("60") or bodyweight notation ("BW" / "BW+5").
 */
export function SetChip({ reps, weight, unit = 'kg', pr = 'none', trophy = null, style = {} }) {
  const isBW = typeof weight === 'string' && weight.toUpperCase().startsWith('BW');
  const tones = {
    none: { bg: 'var(--surface-sunken)', border: 'var(--border-subtle)', repFg: 'var(--text-primary)', wFg: 'var(--text-secondary)' },
    new: { bg: 'var(--gold-tint)', border: 'rgba(245,158,11,0.30)', repFg: 'var(--gold-500)', wFg: 'var(--gold-500)' },
    tied: { bg: 'var(--cyan-tint)', border: 'rgba(6,182,212,0.30)', repFg: 'var(--cyan-500)', wFg: 'var(--cyan-500)' },
  };
  const t = tones[pr] || tones.none;
  return (
    <span
      className="sd-tnum"
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: 3,
        padding: '3px 8px',
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 'var(--radius-sm)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-xs)',
        lineHeight: 1.2,
        ...style,
      }}
    >
      <span style={{ fontWeight: 'var(--weight-bold)', color: t.repFg }}>{reps}</span>
      <span style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-3xs)', fontWeight: 600 }}>×</span>
      <span style={{ fontWeight: 'var(--weight-semibold)', color: t.wFg }}>
        {isBW ? weight : `${weight}${unit ? ` ${unit}` : ''}`}
      </span>
      {pr !== 'none' && trophy && (
        <span style={{ display: 'inline-flex', marginLeft: 1, color: t.wFg }}>{trophy}</span>
      )}
    </span>
  );
}
