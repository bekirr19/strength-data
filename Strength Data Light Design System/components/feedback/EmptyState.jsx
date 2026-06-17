import React from 'react';

/**
 * EmptyState — centered icon tile + title + subtitle + optional action.
 * For "no workout yet", "no results", "no history" placeholders.
 */
export function EmptyState({ icon = null, title, subtitle, action = null, tone = 'neutral', style = {} }) {
  const tones = {
    neutral: { bg: 'var(--surface-sunken)', fg: 'var(--text-tertiary)' },
    accent: { bg: 'var(--accent-tint)', fg: 'var(--accent-hover)' },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <div
      className="sd-slide-in"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6, padding: '36px 24px', ...style }}
    >
      {icon && (
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 60, height: 60, borderRadius: 'var(--radius-xl)', background: t.bg, color: t.fg, marginBottom: 6 }}>
          {icon}
        </span>
      )}
      <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</h3>
      {subtitle && <p style={{ margin: 0, maxWidth: 280, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{subtitle}</p>}
      {action && <div style={{ marginTop: 12 }}>{action}</div>}
    </div>
  );
}
