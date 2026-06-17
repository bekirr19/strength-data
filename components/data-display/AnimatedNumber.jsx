import React from 'react';

/**
 * AnimatedNumber — count-up / roll to a target value, tabular figures.
 * Use for stat values, volume, 1RM. Respects prefers-reduced-motion.
 */
export function AnimatedNumber({ value = 0, duration = 900, decimals = 0, prefix = '', suffix = '', format = true, style = {} }) {
  const [display, setDisplay] = React.useState(0);
  const fromRef = React.useRef(0);
  const rafRef = React.useRef(null);

  React.useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const from = fromRef.current;
    const to = Number(value) || 0;
    if (reduce || duration <= 0) { setDisplay(to); fromRef.current = to; return; }
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setDisplay(from + (to - from) * eased);
      if (p < 1) { rafRef.current = requestAnimationFrame(tick); }
      else { fromRef.current = to; }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const n = Number(display.toFixed(decimals));
  const text = format ? n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : n.toFixed(decimals);
  return (
    <span className="sd-tnum" style={{ fontVariantNumeric: 'tabular-nums', ...style }}>
      {prefix}{text}{suffix}
    </span>
  );
}
