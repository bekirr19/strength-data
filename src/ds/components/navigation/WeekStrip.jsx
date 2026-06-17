import React from 'react';

/* Injected once — the sliding pill + class-based states can't be expressed
   with inline styles alone. Uses the design-system tokens. */
if (typeof document !== 'undefined' && !document.getElementById('sd-weekstrip-css')) {
  const s = document.createElement('style');
  s.id = 'sd-weekstrip-css';
  s.textContent = `
.sd-weekstrip {
  position: relative; display: flex; align-items: stretch;
  padding: 6px; background: var(--surface-card);
  border: 1px solid var(--border-subtle); border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  touch-action: pan-y;
}
.sd-weekstrip__pill {
  position: absolute; top: 6px; bottom: 6px; left: 6px;
  background: var(--accent); border-radius: var(--radius-lg);
  box-shadow: var(--shadow-accent);
  transition: transform var(--dur-base) var(--ease-spring), width var(--dur-base) var(--ease-spring);
  z-index: 0;
}
.sd-weekstrip__day {
  position: relative; z-index: 1; flex: 1 1 0; min-width: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  padding: 8px 0; border: none; background: transparent; cursor: pointer;
  border-radius: var(--radius-lg);
  transition: color var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-spring);
  color: var(--text-secondary); font-family: var(--font-sans);
  -webkit-tap-highlight-color: transparent;
}
.sd-weekstrip__day:active { transform: scale(var(--press-scale)); }
.sd-weekstrip__day:focus-visible { outline: none; box-shadow: 0 0 0 3px var(--ring); }
.sd-weekstrip__dow { font-size: var(--text-xs); font-weight: var(--weight-medium); letter-spacing: var(--tracking-wide); text-transform: uppercase; opacity: 0.85; }
.sd-weekstrip__num { font-size: var(--text-lg); font-weight: var(--weight-bold); line-height: 1; font-variant-numeric: tabular-nums; }
.sd-weekstrip__day--today .sd-weekstrip__num { text-decoration: underline; text-underline-offset: 3px; text-decoration-thickness: 2px; }
.sd-weekstrip__day--selected { color: #fff; }
.sd-weekstrip__dot { width: 5px; height: 5px; border-radius: 50%; background: var(--sd-dot, transparent); transition: background var(--dur-fast) var(--ease-standard); }
.sd-weekstrip__day--selected .sd-weekstrip__dot { background: rgba(255,255,255,0.9); }
`;
  document.head.appendChild(s);
}

const DOT_BY_CATEGORY = {
  push: 'var(--push-500)',
  pull: 'var(--pull-500)',
  leg: 'var(--leg-500)',
  other: 'var(--other-500)',
};

/**
 * WeekStrip — draggable/swipeable 7-day strip with a sliding accent pill that
 * springs between days. Days with a logged workout show a category-colored dot.
 *
 * `days` is an array of day objects. Each accepts either short or long field
 * names: { iso|dateISO, wd|dow (label), d|day (1-31), category, today|isToday }.
 */
export function WeekStrip({ days = [], selectedISO, onSelect = () => {}, className = '', style = {} }) {
  const isoOf = (d) => d.iso ?? d.dateISO;
  const n = days.length || 7;
  const idx = Math.max(0, days.findIndex((d) => isoOf(d) === selectedISO));

  return (
    <div
      className={['sd-weekstrip', className].filter(Boolean).join(' ')}
      role="tablist"
      aria-label="Week"
      style={style}
    >
      <span
        className="sd-weekstrip__pill"
        style={{ width: `calc((100% - 12px) / ${n})`, transform: `translateX(${idx * 100}%)` }}
        aria-hidden="true"
      />
      {days.map((d) => {
        const iso = isoOf(d);
        const selected = iso === selectedISO;
        const isToday = d.today ?? d.isToday ?? false;
        const dot = d.category ? (DOT_BY_CATEGORY[d.category] || DOT_BY_CATEGORY.other) : null;
        return (
          <button
            key={iso}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(iso)}
            className={[
              'sd-weekstrip__day',
              selected ? 'sd-weekstrip__day--selected' : '',
              isToday ? 'sd-weekstrip__day--today' : '',
            ].filter(Boolean).join(' ')}
            style={dot ? { '--sd-dot': dot } : undefined}
          >
            <span className="sd-weekstrip__dow">{d.wd ?? d.dow ?? ''}</span>
            <span className="sd-weekstrip__num">{d.d ?? d.day}</span>
            <span className="sd-weekstrip__dot" />
          </button>
        );
      })}
    </div>
  );
}
