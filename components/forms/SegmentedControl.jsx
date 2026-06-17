import React from 'react';

/**
 * SegmentedControl — pill of mutually-exclusive options on a sunken track.
 * Powers the chart metric toggle (Weight / 1RM / Volume), the time-range
 * tabs (1W / 1M / 1Y / All), and category filter chips.
 * `accent` lets the active segment adopt a category colour.
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
    sm: { h: 30, font: 'var(--text-2xs)', pad: '0 10px' },
    md: { h: 38, font: 'var(--text-xs)', pad: '0 14px' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: 4,
        background: 'var(--surface-sunken)',
        borderRadius: 'var(--radius-md)',
        ...style,
      }}
    >
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const label = typeof opt === 'string' ? opt : opt.label;
        const active = val === value;
        return (
          <button
            key={val}
            type="button"
            onClick={() => onChange && onChange(val)}
            className="sd-focus-ring"
            style={{
              flex: fill ? 1 : '0 0 auto',
              height: s.h,
              padding: s.pad,
              whiteSpace: 'nowrap',
              border: 'none',
              borderRadius: 'calc(var(--radius-md) - 3px)',
              fontFamily: 'var(--font-sans)',
              fontSize: s.font,
              fontWeight: 'var(--weight-bold)',
              cursor: 'pointer',
              background: active ? 'var(--surface-card)' : 'transparent',
              color: active ? accent : 'var(--text-secondary)',
              boxShadow: active ? 'var(--shadow-sm)' : 'none',
              transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
