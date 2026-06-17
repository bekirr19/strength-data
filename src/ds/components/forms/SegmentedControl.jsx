import React from 'react';

/* Injected once — the sliding pill + class states can't be inline-only. */
if (typeof document !== 'undefined' && !document.getElementById('sd-segmented-css')) {
  const s = document.createElement('style');
  s.id = 'sd-segmented-css';
  s.textContent = `
.sd-segmented { position: relative; display: inline-flex; padding: 3px; background: var(--surface-sunken); border-radius: var(--radius-md); }
.sd-segmented--full { display: flex; width: 100%; }
.sd-segmented__pill { position: absolute; top: 3px; bottom: 3px; left: 3px; background: var(--surface-card); border-radius: calc(var(--radius-md) - 3px); box-shadow: var(--shadow-sm); transition: transform var(--dur-base) var(--ease-spring), width var(--dur-base) var(--ease-spring); z-index: 0; }
.sd-segmented__opt { position: relative; z-index: 1; flex: 1; min-width: 0; border: none; background: transparent; cursor: pointer; white-space: nowrap; font-family: var(--font-sans); font-weight: var(--weight-semibold); color: var(--text-secondary); transition: color var(--dur-fast) var(--ease-standard); -webkit-tap-highlight-color: transparent; }
.sd-segmented__opt:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--ring); border-radius: var(--radius-sm); }
`;
  document.head.appendChild(s);
}

/**
 * SegmentedControl — mutually-exclusive options on a sunken track with a single
 * sliding pill that springs to the active option. Powers the chart metric
 * toggle (Weight / 1RM / Volume), the time-range tabs (1W / 1M / 1Y / All), etc.
 * `accent` colours the active label; `fill` stretches to full width.
 */
export function SegmentedControl({
  options = [],
  value,
  onChange,
  size = 'md',
  accent = 'var(--accent)',
  fill = true,
  style = {},
}) {
  const sizes = {
    sm: { h: 30, font: 'var(--text-2xs)', pad: '0 12px' },
    md: { h: 38, font: 'var(--text-xs)', pad: '0 16px' },
  };
  const s = sizes[size] || sizes.md;
  const n = options.length || 1;
  const valOf = (o) => (typeof o === 'string' ? o : o.value);
  const idx = Math.max(0, options.findIndex((o) => valOf(o) === value));

  return (
    <div
      className={['sd-segmented', fill ? 'sd-segmented--full' : ''].filter(Boolean).join(' ')}
      role="tablist"
      style={style}
    >
      <span
        className="sd-segmented__pill"
        style={{ width: `calc((100% - 6px) / ${n})`, transform: `translateX(${idx * 100}%)` }}
        aria-hidden="true"
      />
      {options.map((opt) => {
        const val = valOf(opt);
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = val === value;
        return (
          <button
            key={val}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange && onChange(val)}
            className={`sd-segmented__opt${active ? ' sd-segmented__opt--active' : ''}`}
            style={{ height: s.h, padding: s.pad, fontSize: s.font, color: active ? accent : 'var(--text-secondary)' }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
