import React from 'react';

/**
 * Avatar — round user chip. Shows a photo, an initial, or a fallback icon.
 * Used in the header profile button and the profile screen.
 */
export function Avatar({ src, name, size = 40, icon = null, style = {} }) {
  const initial = name ? name.trim().charAt(0).toUpperCase() : null;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: 'var(--radius-full)',
        overflow: 'hidden',
        background: src ? 'transparent' : 'var(--accent-tint)',
        color: 'var(--accent-hover)',
        border: '1px solid var(--border-subtle)',
        fontFamily: 'var(--font-sans)',
        fontWeight: 'var(--weight-bold)',
        fontSize: Math.round(size * 0.4),
        ...style,
      }}
    >
      {src ? (
        <img src={src} alt={name || 'User'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : initial ? (
        initial
      ) : (
        icon
      )}
    </span>
  );
}
