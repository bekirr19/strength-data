import React from 'react';

/**
 * Button — primary action control for Strength Data.
 * Variants: primary (blue), secondary (white + border), ghost, danger.
 * Sizes: sm, md, lg. Optional leading/trailing icon and full-width.
 */
export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  trailingIcon = null,
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  style = {},
  ...rest
}) {
  const sizes = {
    sm: { padding: '0 14px', height: 36, font: 'var(--text-xs)', radius: 'var(--radius-md)', gap: 6 },
    md: { padding: '0 18px', height: 44, font: 'var(--text-sm)', radius: 'var(--radius-md)', gap: 8 },
    lg: { padding: '0 24px', height: 52, font: 'var(--text-base)', radius: 'var(--radius-lg)', gap: 8 },
  };
  const s = sizes[size] || sizes.md;

  const variants = {
    primary: {
      background: 'var(--accent)',
      color: 'var(--text-on-accent)',
      border: '1px solid transparent',
      boxShadow: 'var(--shadow-accent-sm)',
    },
    secondary: {
      background: 'var(--surface-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-xs)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-secondary)',
      border: '1px solid transparent',
      boxShadow: 'none',
    },
    danger: {
      background: 'var(--red-tint)',
      color: 'var(--red-600)',
      border: '1px solid transparent',
      boxShadow: 'none',
    },
  };
  const v = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="sd-focus-ring"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: s.gap,
        height: s.height,
        padding: s.padding,
        width: fullWidth ? '100%' : 'auto',
        fontFamily: 'var(--font-sans)',
        fontSize: s.font,
        fontWeight: 'var(--weight-bold)',
        lineHeight: 1,
        borderRadius: s.radius,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background var(--dur-fast) var(--ease-standard), transform var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard)',
        WebkitTapHighlightColor: 'transparent',
        ...v,
        ...style,
      }}
      onMouseDown={(e) => { if (!disabled) e.currentTarget.style.transform = 'scale(0.98)'; }}
      onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      {...rest}
    >
      {icon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{icon}</span>}
      {children}
      {trailingIcon && <span style={{ display: 'inline-flex', flexShrink: 0 }}>{trailingIcon}</span>}
    </button>
  );
}
