import React from 'react';

/**
 * Switch — accessible on/off toggle. Accent track when on, spring knob.
 */
export function Switch({ checked = false, onChange, disabled = false, ariaLabel, size = 'md', style = {} }) {
  const dims = { sm: { w: 38, h: 22, k: 16 }, md: { w: 46, h: 28, k: 22 } };
  const d = dims[size] || dims.md;
  const pad = (d.h - d.k) / 2;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onChange && onChange(!checked)}
      className="sd-focus-ring"
      style={{
        position: 'relative',
        width: d.w,
        height: d.h,
        flexShrink: 0,
        padding: 0,
        border: 'none',
        borderRadius: 'var(--radius-full)',
        background: checked ? 'var(--accent)' : 'var(--gray-300)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--dur-base) var(--ease-standard)',
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: pad,
          left: checked ? d.w - d.k - pad : pad,
          width: d.k,
          height: d.k,
          borderRadius: '50%',
          background: '#fff',
          boxShadow: 'var(--shadow-sm)',
          transition: 'left var(--dur-base) var(--ease-spring)',
        }}
      />
    </button>
  );
}
