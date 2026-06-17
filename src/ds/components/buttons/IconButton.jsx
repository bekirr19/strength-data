import React from 'react';

/**
 * IconButton — square/circular control holding a single icon.
 * Used for header actions, modal close, steppers, edit affordances.
 */
export function IconButton({
  children,
  variant = 'ghost',
  size = 'md',
  shape = 'rounded',
  disabled = false,
  ariaLabel,
  onClick,
  style = {},
  ...rest
}) {
  const sizes = { sm: 32, md: 40, lg: 44 };
  const dim = sizes[size] || sizes.md;

  const variants = {
    ghost: { background: 'transparent', color: 'var(--text-secondary)', border: '1px solid transparent' },
    soft: { background: 'var(--surface-sunken)', color: 'var(--text-primary)', border: '1px solid transparent' },
    outline: { background: 'var(--surface-card)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' },
    accent: { background: 'var(--accent-tint)', color: 'var(--accent-hover)', border: '1px solid transparent' },
  };
  const v = variants[variant] || variants.ghost;

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className="sd-focus-ring"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: dim,
        height: dim,
        flexShrink: 0,
        borderRadius: shape === 'circle' ? 'var(--radius-full)' : 'var(--radius-md)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.45 : 1,
        transition: 'background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard)',
        WebkitTapHighlightColor: 'transparent',
        ...v,
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
