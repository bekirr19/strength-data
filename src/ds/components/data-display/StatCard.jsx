import React from 'react';

/**
 * StatCard — a labelled metric tile (Best weight, Strength change, totals).
 * `tone="gold"` for the personal-best highlight, `trend` colours the value
 * green/red for +/- change.
 */
export function StatCard({ label, value, sub, icon = null, tone = 'default', trend = null, style = {} }) {
  const tones = {
    default: { bg: 'var(--surface-card)', border: 'var(--border-subtle)', valueFg: 'var(--text-primary)', iconFg: 'var(--accent)' },
    gold: { bg: 'var(--gold-tint)', border: 'rgba(245,158,11,0.25)', valueFg: 'var(--gold-500)', iconFg: 'var(--gold-500)' },
  };
  const t = tones[tone] || tones.default;
  let valueColor = t.valueFg;
  if (trend === 'up') valueColor = 'var(--green-500)';
  if (trend === 'down') valueColor = 'var(--red-500)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        padding: 16,
        background: t.bg,
        border: `1px solid ${t.border}`,
        borderRadius: 'var(--radius-lg)',
        boxShadow: tone === 'default' ? 'var(--shadow-xs)' : 'none',
        ...style,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {icon && <span style={{ display: 'inline-flex', color: t.iconFg }}>{icon}</span>}
        <span
          style={{
            fontSize: 'var(--text-3xs)',
            fontWeight: 'var(--weight-bold)',
            textTransform: 'uppercase',
            letterSpacing: 'var(--tracking-wide)',
            color: 'var(--text-secondary)',
          }}
        >
          {label}
        </span>
      </div>
      <span
        className="sd-tnum"
        style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-extrabold)', lineHeight: 1.05, color: valueColor }}
      >
        {value}
      </span>
      {sub && <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--text-tertiary)' }}>{sub}</span>}
    </div>
  );
}
